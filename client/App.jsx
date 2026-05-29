import React, { useEffect, useState } from "react";
import "./vista.css";
import escudo from "/src/assets/escudo.png";
import { MdAccountBalanceWallet, MdChecklist, MdMenuBook, MdSettings, MdAccessTime } from "react-icons/md";
import { loadFromStorage, saveToStorage, clearStorage } from "./storage";

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [role, setRole] = useState(() => loadFromStorage("role", "administrativo"));
  const [darkMode, setDarkMode] = useState(() => loadFromStorage("darkMode", false));
  const [coordinadorPassword, setCoordinadorPassword] = useState(() => loadFromStorage("coordinadorPassword", "123"));
  const [ingresos, setIngresos] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/ingresos`)
      .then(res => res.json())
      .then(data => setIngresos(data))
      .catch(err => console.error("Error al cargar: ", err));
  }, []);

  const [nuevoFecha, setNuevoFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [nuevoMonto, setNuevoMonto] = useState();
  const [nuevoSocio, setNuevoSocio] = useState();
  const [nuevoAfectacion, setNuevoAfectacion] = useState();
  const [nuevoEvento, setNuevoEvento] = useState();
  const [nuevoEntrada, setNuevoEntrada] = useState();
  const [nuevoProducto, setNuevoProducto] = useState();

  const [compromisos, setCompromisos] = useState(() => loadFromStorage("compromisos", []));
  const [ordenesPago, setOrdenesPago] = useState(() => loadFromStorage("ordenesPago", []));
  const [permisosAdministrativo, setPermisosAdministrativo] = useState(() =>
    loadFromStorage("permisosAdministrativo", { canAddIngreso: true, canAddCompromiso: true, canOpenPUC: false, canChangePassword: false })
  );
  const [auditLogs, setAuditLogs] = useState(() => loadFromStorage("auditLogs", []));

  const [nuevoComprobante, setNuevoComprobante] = useState("");
  const [nuevoPUC, setNuevoPUC] = useState("112526");

  const totalIngresos = ingresos.reduce((acc, i) => acc + (i.total || 0), 0);
  const totalCompromisos = compromisos.reduce((acc, c) => acc + (c.total || 0), 0);
  const balance = totalIngresos - totalCompromisos;

  useEffect(() => saveToStorage("compromisos", compromisos), [compromisos]);
  useEffect(() => saveToStorage("ordenesPago", ordenesPago), [ordenesPago]);
  useEffect(() => saveToStorage("permisosAdministrativo", permisosAdministrativo), [permisosAdministrativo]);
  useEffect(() => saveToStorage("auditLogs", auditLogs), [auditLogs]);
  useEffect(() => saveToStorage("role", role), [role]);
  useEffect(() => saveToStorage("darkMode", darkMode), [darkMode]);
  useEffect(() => saveToStorage("coordinadorPassword", coordinadorPassword), [coordinadorPassword]);
  useEffect(() => { document.title = "CAF Finanzas"; }, []);


  function deepCopy(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; }
  }

  function pushAuditLog(entry) {
    setAuditLogs((prev) => {
      const updated = [entry, ...prev].slice(0, AUDIT_LIMIT);
      return updated;
    });
  }

  function logAction({ user = role, action, resource = null, before = null, after = null, meta = null }) {
    const log = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      usuario: user,
      accion: action,
      recurso: resource,
      antes: deepCopy(before),
      despues: deepCopy(after),
      meta,
      timestamp: nowISO(),
    };
    pushAuditLog(log);
  }

  const calcIva = (monto, percent) => {
    const iva = Math.round((Number(monto) * Number(percent) / 100) * 100) / 100;
    const total = Math.round((Number(monto) + iva) * 100) / 100;
    return { iva, total };
  };

  const exportBackup = () => {
    const payload = {
      ingresos,
      compromisos,
      ordenesPago,
      pucReferencias,
      permisosAdministrativo,
      auditLogs,
      role,
      darkMode,
      coordinadorPassword,
      exportedAt: nowISO(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `backup-caf-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  function existeComprobanteDuplicado(comprobanteRaw, puc) {
    const norm = normalizeComprobante(comprobanteRaw);
    const year = new Date().getFullYear();
    return ingresos.some((ing) => {
      const ingNorm = normalizeComprobante(ing.comprobante);
      const ingYear = new Date(ing.fecha).getFullYear();
      return ingNorm === norm && ing.puc === puc && ingYear === year;
    });
  }

  const handleProfileChange = (e) => {
    const nuevo = e.target.value;
    if (nuevo === "coordinador") {
      const pass = prompt("Ingrese contraseña de Coordinador:");
      if (pass === coordinadorPassword) {
        setRole("coordinador");
        logAction({ action: "login_rol", resource: "rol:coordinador", before: null, after: { rol: "coordinador" } });
      } else {
        alert("Contraseña incorrecta.");
        e.target.value = "administrativo";
      }
    } else {
      setRole("administrativo");
      logAction({ action: "login_rol", resource: "rol:administrativo", before: null, after: { rol: "administrativo" } });
    }
  };


  const agregarIngreso = (e) => {
    e.preventDefault();
    if (role !== "coordinador" && !permisosAdministrativo.canAddIngreso) {
      alert("No tenés permiso para agregar ingresos.");
      logAction({ action: "ingreso_creacion_denegada", resource: "ingresos", before: null, after: null });
      return;
    }
    if (!nuevoComprobante || !nuevoMonto) return alert("Complete comprobante y monto.");

    if (existeComprobanteDuplicado(nuevoComprobante, nuevoPUC)) {
      logAction({ action: "ingreso_duplicado_intento", resource: `ingreso:${nuevoComprobante}`, before: ingresos, after: ingresos, meta: { comprobante: nuevoComprobante, puc: nuevoPUC } });
      return alert("Comprobante duplicado detectado para el año actual. Revisa antes de continuar.");
    }

    const { iva, total } = calcIva(nuevoMonto, nuevoIvaPercent);
    const nuevo = {
      id: `ing-${Date.now()}`,
      fecha: new Date().toISOString().split("T")[0],
      monto: Number(nuevoMonto),
      ivaPercent: Number(nuevoIvaPercent),
      ivaMonto: iva,
      total,
      comprobante: nuevoComprobante,
      comprobanteNorm: normalizeComprobante(nuevoComprobante),
      puc: nuevoPUC,
      version: 1,
      updatedAt: nowISO(),
    };

    setIngresos((prev) => {
      const before = deepCopy(prev);
      const updated = [...prev, nuevo];
      logAction({ action: "ingreso_creado", resource: `ingreso:${nuevo.id}`, before, after: updated });
      return updated;
    });

    setNuevoFecha(new Date().toISOString().slice(0, 10));
    setNuevoComprobante("");
    setNuevoMonto("");
    setNuevoPUC("112526");
  };


  function ActivityPage() {
    const [items, setItems] = useState(() => loadFromStorage("auditLogs", []));
    const [filters, setFilters] = useState({ usuario: "", accion: "", from: "", to: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => setItems(loadFromStorage("auditLogs", [])), []);

    const applyFilters = () => {
      const all = loadFromStorage("auditLogs", []);
      const filtered = all.filter((l) => {
        if (filters.usuario && !String(l.usuario).toLowerCase().includes(filters.usuario.toLowerCase())) return false;
        if (filters.accion && !String(l.accion).toLowerCase().includes(filters.accion.toLowerCase())) return false;
        if (filters.from && new Date(l.timestamp) < new Date(filters.from)) return false;
        if (filters.to && new Date(l.timestamp) > new Date(filters.to + "T23:59:59")) return false;
        return true;
      });
      setItems(filtered);
    };

    const exportCSV = () => {
      const rows = items.map((r) => [
        r.timestamp,
        r.usuario,
        r.accion,
        r.recurso ?? "",
        JSON.stringify(r.antes) ?? "",
        JSON.stringify(r.despues) ?? "",
        r.meta ? JSON.stringify(r.meta) : "",
      ]);
      const header = ["timestamp", "usuario", "accion", "recurso", "antes", "despues", "meta"];
      const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    return (
      <div className="vista-panel">
        <h3>Actividad / Audit Log</h3>
        <div className="row" style={{ marginBottom: 12 }}>
          <input className="vista-input" placeholder="Usuario" value={filters.usuario} onChange={(e) => setFilters((s) => ({ ...s, usuario: e.target.value }))} />
          <input className="vista-input" placeholder="Acción" value={filters.accion} onChange={(e) => setFilters((s) => ({ ...s, accion: e.target.value }))} />
          <input className="vista-input" type="date" value={filters.from} onChange={(e) => setFilters((s) => ({ ...s, from: e.target.value }))} />
          <input className="vista-input" type="date" value={filters.to} onChange={(e) => setFilters((s) => ({ ...s, to: e.target.value }))} />
          <button className="vista-button" onClick={applyFilters}>Filtrar local</button>
          <button className="vista-button" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 400); }} disabled={loading}>Refrescar</button>
          <button className="vista-button" onClick={exportCSV}>Exportar CSV</button>
        </div>

        <div className="table-wrap">
          <table className="vista-table">
            <thead><tr><th>Timestamp</th><th>Usuario</th><th>Acción</th><th>Recurso</th><th>Antes</th><th>Después</th><th>Meta</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7">Cargando...</td></tr> : items.map((it) => (
                <tr key={it.id}>
                  <td>{new Date(it.timestamp).toLocaleString()}</td>
                  <td>{it.usuario}</td>
                  <td>{it.accion}</td>
                  <td>{it.recurso}</td>
                  <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.antes ? JSON.stringify(it.antes) : ""}</td>
                  <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.despues ? JSON.stringify(it.despues) : ""}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.meta ? JSON.stringify(it.meta) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (screen === "menu") {
    return (
      <div className={`vista-window ${darkMode ? "dark" : ""}`}>
        <div className="vista-titlebar">
          <div className="title-left">
            <img src={escudo} alt="Escudo Club Atletico French" className="club-logo" />
            <div className="club-title">Club Atletico French</div>
          </div>
          <div className="title-right">
            <div className="profile-dropdown">
              <label className="profile-label" htmlFor="profileSelect">Perfil</label>
              <select id="profileSelect" className="profile-select" value={role} onChange={handleProfileChange}>
                <option value="administrativo">Administrativo</option>
                <option value="coordinador">Coordinador</option>
              </select>
              <button className="icon-button" title={darkMode ? "Desactivar modo oscuro" : "Modo oscuro"} onClick={() => setDarkMode((d) => !d)}>🌙</button>
              {role === "coordinador" && (
                <div className="admin-perms">
                  <button className="vista-button" onClick={() => setScreen("actividad")}>Actividad</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="vista-content menu-vertical">
          <button className="menu-tile primary-tile vertical" onClick={() => setScreen("ingresos")}>
            <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
            <div className="tile-text"><div className="tile-title">Ingresos</div><div className="tile-desc">Registrar y ver ingresos</div></div>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "ingresos") {
    return (
      <div className={`vista-window ${darkMode ? "dark" : ""}`}>
        <div className="vista-titlebar">
          <div className="title-left"><button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button><div className="club-title">Ingresos</div></div>
          <div className="title-right">
            <div className="profile-dropdown small">
              <label className="profile-label" htmlFor="profileSelect2">Perfil</label>
              <select id="profileSelect2" className="profile-select" value={role} onChange={handleProfileChange}><option value="administrativo">Administrativo</option><option value="coordinador">Coordinador</option></select>
              <button className="icon-button" onClick={() => setDarkMode((d) => !d)}>🌙</button>
            </div>
          </div>
        </div>

        <div className="vista-content">
          <div className="vista-panel">
            <form onSubmit={agregarIngreso} className="row" style={{ marginBottom: 12 }}>
              <input className="vista-input" placeholder="Fecha" value={nuevoFecha} onChange={(e) => setNuevoFecha(e.target.value)} type="date" />
              <input className="vista-input" placeholder="Monto" value={nuevoMonto} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Socio aportante" value={nuevoSocio} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Afectación" value={nuevoAfectacion} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Evento" value={nuevoEvento} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Entrada" value={nuevoEntrada} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Producto" value={nuevoProducto} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <button className="vista-button primary" type="submit" disabled={role !== "coordinador" && !permisosAdministrativo.canAddIngreso}>Agregar</button>
              <button type="button" className="vista-button" onClick={exportBackup} style={{ marginLeft: 8 }}>Exportar backup</button>
            </form>

            <div className="table-wrap">
              <table className="vista-table">
                <thead><tr><th>Fecha</th><th>Cuenta de fondos</th><th>Monto</th><th>Socio aportante</th><th>Afectación</th><th>Evento</th><th>Entrada</th><th>Producto</th></tr></thead>
                <tbody>
                  {ingresos && ingresos.map((ingreso, index) => (
                    <tr key={index}>
                      <td>{ingreso.fecha}</td>
                      <td>{ingreso.cuenta_fondos}</td>
                      <td>{ingreso.monto}</td>
                      <td>{ingreso.socio_apellido} {ingreso.socio_nombre}</td>
                      <td>{ingreso.afectacion_ingreso}</td>
                      <td>{ingreso.evento_nombre}</td>
                      <td>{ingreso.entrada_categoria}</td>
                      <td>{ingreso.producto_nombre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 12 }}><p>Total Ingresos: ${totalIngresos}</p></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
