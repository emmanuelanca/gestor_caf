import React, { useEffect, useState } from "react";
import "./vista.css";
import escudo from "/src/assets/escudo.png";
import { MdAccountBalanceWallet, MdChecklist, MdMenuBook, MdSettings, MdAccessTime } from "react-icons/md";
import { loadFromStorage, saveToStorage, clearStorage } from "./storage";

const DEFAULT_IVA_PERCENT = 21;
const AUDIT_LIMIT = 5000;

function nowISO() {
  return new Date().toISOString();
}

function normalizeComprobante(raw) {
  if (!raw && raw !== 0) return "";
  let s = String(raw).trim().toUpperCase();
  s = s.replace(/[-\s]/g, "");
  s = s.replace(/^0+/, "");
  return s;
}

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [role, setRole] = useState(() => loadFromStorage("role", "administrativo"));
  const [darkMode, setDarkMode] = useState(() => loadFromStorage("darkMode", false));
  const [coordinadorPassword, setCoordinadorPassword] = useState(() => loadFromStorage("coordinadorPassword", "123"));

  const [pucReferencias, setPucReferencias] = useState(() =>
    loadFromStorage("pucReferencias", {
      "112526": "Eventos Sociales - Ingresos Operativos",
      "115527": "Entradas Fútbol Cat. General",
      "115528": "Entradas Fútbol Cat. Socio",
      "123537": "Alquiler Salón",
      "213050": "Aportes sobre Sueldo Anual Complementario",
      "223370": "Nafta Súper",
    })
  );

  const [ingresos, setIngresos] = useState(() => loadFromStorage("ingresos", []));
  const [compromisos, setCompromisos] = useState(() => loadFromStorage("compromisos", []));
  const [ordenesPago, setOrdenesPago] = useState(() => loadFromStorage("ordenesPago", []));
  const [permisosAdministrativo, setPermisosAdministrativo] = useState(() =>
    loadFromStorage("permisosAdministrativo", { canAddIngreso: true, canAddCompromiso: true, canOpenPUC: false, canChangePassword: false })
  );
  const [auditLogs, setAuditLogs] = useState(() => loadFromStorage("auditLogs", []));

  const [nuevoComprobante, setNuevoComprobante] = useState("");
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevoIvaPercent, setNuevoIvaPercent] = useState(DEFAULT_IVA_PERCENT);
  const [nuevoPUC, setNuevoPUC] = useState("112526");

  const totalIngresos = ingresos.reduce((acc, i) => acc + (i.total || 0), 0);
  const totalCompromisos = compromisos.reduce((acc, c) => acc + (c.total || 0), 0);
  const balance = totalIngresos - totalCompromisos;

  useEffect(() => saveToStorage("ingresos", ingresos), [ingresos]);
  useEffect(() => saveToStorage("compromisos", compromisos), [compromisos]);
  useEffect(() => saveToStorage("ordenesPago", ordenesPago), [ordenesPago]);
  useEffect(() => saveToStorage("pucReferencias", pucReferencias), [pucReferencias]);
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

  const abrirPUCAdmin = () => {
    if (role !== "coordinador" && !permisosAdministrativo.canOpenPUC) {
      alert("Acceso denegado.");
      logAction({ action: "puc_abrir_denegado", resource: "puc_ui", before: null, after: null });
      return;
    }
    logAction({ action: "puc_abierto", resource: "puc_ui", before: null, after: pucReferencias });
    const nuevaVentana = window.open("", "PUCAdmin", "width=700,height=520");
    const pucJson = JSON.stringify(pucReferencias).replace(/</g, "\\u003c");
    nuevaVentana.document.write(`<html><head><meta charset="utf-8"><title>PUC</title></head><body><pre id="out"></pre><script>const puc=${pucJson};document.getElementById('out').innerText=JSON.stringify(puc,null,2);</script></body></html>`);
    nuevaVentana.document.close();
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

    setNuevoComprobante("");
    setNuevoMonto("");
    setNuevoIvaPercent(DEFAULT_IVA_PERCENT);
    setNuevoPUC("112526");
  };

  const agregarCompromiso = () => {
    if (role !== "coordinador" && !permisosAdministrativo.canAddCompromiso) {
      alert("No tenés permiso para agregar compromisos.");
      logAction({ action: "compromiso_creacion_denegada", resource: "compromisos" });
      return;
    }
    const proveedor = prompt("Proveedor / Responsable:");
    if (!proveedor) return;
    const montoStr = prompt("Monto:");
    const monto = parseFloat(montoStr || "0");
    if (!monto || isNaN(monto)) return alert("Monto inválido.");
    const ivaInput = prompt(`IVA % (por defecto ${DEFAULT_IVA_PERCENT})`) || String(DEFAULT_IVA_PERCENT);
    const ivaPercentInput = Number(ivaInput);
    const ivaPercent = isNaN(ivaPercentInput) ? DEFAULT_IVA_PERCENT : ivaPercentInput;
    const { iva, total } = calcIva(monto, ivaPercent);
    const nuevo = {
      id: `comp-${Date.now()}`,
      fecha: new Date().toISOString().split("T")[0],
      monto,
      ivaPercent,
      ivaMonto: iva,
      total,
      proveedor,
      puc: "213050",
      estado: "nuevo",
      version: 1,
      updatedAt: nowISO(),
    };

    setCompromisos((prev) => {
      const before = deepCopy(prev);
      const updated = [...prev, nuevo];
      logAction({ action: "compromiso_creado", resource: `compromiso:${nuevo.id}`, before, after: updated });
      return updated;
    });
  };

  const marcarPagado = (idx) => {
    const comp = compromisos[idx];
    if (!comp) return;
    const ok = confirm(`Marcar compromiso de ${comp.proveedor} por $${comp.total} como PAGADO?`);
    if (!ok) return;
    setCompromisos((prev) => {
      const before = deepCopy(prev);
      const copia = prev.map((c, i) => (i === idx ? { ...c, estado: "pagado", version: (c.version || 1) + 1, updatedAt: nowISO() } : c));
      logAction({ action: "compromiso_marcado_pagado", resource: `compromiso:${comp.id}`, before, after: copia });
      return copia;
    });
  };

  const marcarNoPagado = (idx) => {
    const comp = compromisos[idx];
    if (!comp) return;
    const ok = confirm(`Revertir compromiso de ${comp.proveedor} a NO PAGADO?`);
    if (!ok) return;
    setCompromisos((prev) => {
      const before = deepCopy(prev);
      const copia = prev.map((c, i) => (i === idx ? { ...c, estado: "nuevo", version: (c.version || 1) + 1, updatedAt: nowISO() } : c));
      logAction({ action: "compromiso_marcado_no_pagado", resource: `compromiso:${comp.id}`, before, after: copia });
      return copia;
    });
  };

  const generarOrdenPago = (comp, idx = null) => {
    const orden = {
      id: `OP-${Date.now()}`,
      proveedor: comp.proveedor || "N/A",
      monto: comp.monto,
      iva: comp.ivaMonto,
      total: comp.total,
      fecha: nowISO(),
      origenCompromisoId: comp.id || null,
      version: 1,
      updatedAt: nowISO(),
    };
    setOrdenesPago((prev) => {
      const before = deepCopy(prev);
      const updated = [...prev, orden];
      logAction({ action: "orden_pago_generada", resource: `orden:${orden.id}`, before, after: updated });
      return updated;
    });
    alert(`Orden de pago generada (demo):\nProveedor: ${orden.proveedor}\nTotal: $${orden.total}\nID: ${orden.id}`);
  };

  const togglePermiso = (key) => {
    setPermisosAdministrativo((prev) => {
      const before = deepCopy(prev);
      const updated = { ...prev, [key]: !prev[key] };
      logAction({ action: "permiso_alternado", resource: `permiso:${key}`, before, after: updated });
      return updated;
    });
  };

  const [confirmCode, setConfirmCode] = useState(null);
  const [codeSentAt, setCodeSentAt] = useState(null);
  const [codeTargetEmail, setCodeTargetEmail] = useState(null);

  const sendConfirmationCodeToEmail = () => {
    const target = prompt("Ingrese el correo al que enviar el código (ej: tu@correo.com):");
    if (!target) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setConfirmCode(code);
    setCodeSentAt(Date.now());
    setCodeTargetEmail(target);
    const mailto = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent("Código de confirmación")}&body=${encodeURIComponent("Código: " + code)}`;
    window.open(mailto);
    alert(`Código generado (demo): ${code}`);
    logAction({ action: "codigo_restablecimiento_enviado", resource: "password_reset", meta: { target } });
  };

  const verifyAndResetPassword = () => {
    if (!confirmCode) {
      alert("Primero generá y enviá un código.");
      return;
    }
    const entered = prompt(`Ingrese el código enviado a ${codeTargetEmail}:`);
    if (!entered) return;
    const elapsed = Date.now() - (codeSentAt || 0);
    if (elapsed > 15 * 60 * 1000) {
      alert("El código expiró.");
      setConfirmCode(null);
      setCodeSentAt(null);
      setCodeTargetEmail(null);
      logAction({ action: "codigo_restablecimiento_expirado", resource: "password_reset", meta: { target: codeTargetEmail } });
      return;
    }
    if (entered.trim() !== confirmCode) {
      alert("Código incorrecto.");
      logAction({ action: "codigo_restablecimiento_incorrecto", resource: "password_reset", meta: { target: codeTargetEmail } });
      return;
    }
    const newPass = prompt("Ingrese nueva contraseña:");
    if (!newPass) return alert("Contraseña no cambiada.");
    setCoordinadorPassword(newPass);
    setConfirmCode(null);
    setCodeSentAt(null);
    setCodeTargetEmail(null);
    alert("Contraseña de Coordinador actualizada.");
    logAction({ action: "password_restaurada", resource: "password_reset" });
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

  // Renders (menu, ingresos, compromisos, opciones, actividad)
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

          <button className="menu-tile primary-tile vertical" onClick={() => setScreen("compromisos")}>
            <div className="tile-icon refined"><MdChecklist className="svg-icon" /></div>
            <div className="tile-text"><div className="tile-title">Compromisos</div><div className="tile-desc">Registrar y ver compromisos</div></div>
          </button>

          <button className="menu-tile primary-tile vertical" onClick={abrirPUCAdmin}>
            <div className="tile-icon refined"><MdMenuBook className="svg-icon" /></div>
            <div className="tile-text"><div className="tile-title">PUC</div><div className="tile-desc">Administrar cuentas</div></div>
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
              <input className="vista-input" placeholder="Fecha" value={nuevoComprobante} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Cuenta de fondos" value={nuevoComprobante} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Monto" value={nuevoComprobante} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Socio" value={nuevoComprobante} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Afectación" value={nuevoComprobante} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Evento" value={nuevoComprobante} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Entrada" value={nuevoComprobante} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Producto" value={nuevoComprobante} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <button className="vista-button primary" type="submit" disabled={role !== "coordinador" && !permisosAdministrativo.canAddIngreso}>Agregar</button>
              <button type="button" className="vista-button" onClick={exportBackup} style={{ marginLeft: 8 }}>Exportar backup</button>
            </form>

            <div className="table-wrap">
              <table className="vista-table">
                <thead><tr><th>Fecha</th><th>Monto</th><th>IVA</th><th>Total</th><th>Comprobante</th><th>PUC</th></tr></thead>
                <tbody>{ingresos.map((i, idx) => (<tr key={i.id || idx}><td>{i.fecha}</td><td>${i.monto}</td><td>{i.ivaPercent}% (${i.ivaMonto})</td><td>${i.total}</td><td>{i.comprobante}</td><td title={pucReferencias[i.puc]}>{i.puc}</td></tr>))}</tbody>
              </table>
            </div>

            <div style={{ marginTop: 12 }}><p>Total Ingresos: ${totalIngresos}</p></div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "compromisos") {
    return (
      <div className={`vista-window ${darkMode ? "dark" : ""}`}>
        <div className="vista-titlebar">
          <div className="title-left"><button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button><div className="club-title">Compromisos</div></div>
          <div className="title-right">
            <div className="profile-dropdown small">
              <label className="profile-label" htmlFor="profileSelect3">Perfil</label>
              <select id="profileSelect3" className="profile-select" value={role} onChange={handleProfileChange}><option value="administrativo">Administrativo</option><option value="coordinador">Coordinador</option></select>
              <button className="icon-button" onClick={() => setDarkMode((d) => !d)}>🌙</button>
            </div>
          </div>
        </div>

        <div className="vista-content">
          <div className="vista-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div><strong>Compromisos</strong><div style={{ fontSize: 13, color: darkMode ? "#9fb0d9" : "#6b7a99" }}>Lista de compromisos registrados</div></div>
              <div><button className="vista-button" onClick={agregarCompromiso} disabled={role !== "coordinador" && !permisosAdministrativo.canAddCompromiso}>Agregar compromiso</button></div>
            </div>

            <div className="table-wrap">
              <table className="vista-table">
                <thead><tr><th>Fecha</th><th>Proveedor</th><th>Monto</th><th>IVA</th><th>Total</th><th>PUC</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>{compromisos.map((c, idx) => (<tr key={c.id || idx}><td>{c.fecha}</td><td>{c.proveedor}</td><td>${c.monto}</td><td>{c.ivaPercent}% (${c.ivaMonto})</td><td>${c.total}</td><td title={pucReferencias[c.puc]}>{c.puc}</td><td>{c.estado}</td><td><button className="vista-button" onClick={() => generarOrdenPago(c, idx)}>Orden</button>{c.estado !== "pagado" ? (<button className="vista-button" style={{ marginLeft: 6 }} onClick={() => marcarPagado(idx)}>Marcar pagado</button>) : (<button className="vista-button" style={{ marginLeft: 6 }} onClick={() => marcarNoPagado(idx)}>Marcar no pagado</button>)}</td></tr>))}</tbody>
              </table>
            </div>

            <div style={{ marginTop: 12 }}><p>Total Ingresos: ${totalIngresos}</p><p>Total Compromisos: ${totalCompromisos}</p><p><strong>Balance: ${balance}</strong></p></div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "opciones") {
    return (
      <div className={`vista-window ${darkMode ? "dark" : ""}`}>
        <div className="vista-titlebar"><div className="title-left"><button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button><div className="club-title">Opciones</div></div></div>
        <div className="vista-content">
          <div className="vista-panel">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><strong>Restablecer contraseña (olvidada)</strong><div style={{ fontSize: 13, color: darkMode ? "#9fb0d9" : "#6b7a99" }}>Generá un código y envialo al correo que elijas.</div></div>
                <div><button className="vista-button" onClick={sendConfirmationCodeToEmail}>Enviar código</button><button className="vista-button" style={{ marginLeft: 8 }} onClick={verifyAndResetPassword}>Ingresar código</button></div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><strong>Cambiar contraseña (logueado)</strong><div style={{ fontSize: 13, color: darkMode ? "#9fb0d9" : "#6b7a99" }}>Si estás logueado como Coordinador, podés cambiar la contraseña ingresando la actual.</div></div>
                <div><button className="vista-button" onClick={() => { const current = prompt("Ingrese la contraseña actual:"); if (current !== coordinadorPassword) return alert("Contraseña incorrecta."); const newPass = prompt("Ingrese nueva contraseña:"); if (!newPass) return; setCoordinadorPassword(newPass); alert("Contraseña actualizada."); logAction({ action: "cambio_contrasena_exitoso", resource: "password_change" }); }} disabled={role !== "coordinador" && !permisosAdministrativo.canChangePassword}>Cambiar</button></div>
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="vista-button" onClick={exportBackup}>Exportar backup completo</button>
                <button className="vista-button" style={{ marginLeft: 8 }} onClick={() => { if (confirm("¿Borrar todo el localStorage de la app? Esto eliminará datos locales.")) { clearStorage(); window.location.reload(); } }}>Borrar datos locales</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "actividad") {
    return (
      <div className={`vista-window ${darkMode ? "dark" : ""}`}>
        <div className="vista-titlebar"><div className="title-left"><button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button><div className="club-title">Actividad</div></div></div>
        <div className="vista-content"><ActivityPage /></div>
      </div>
    );
  }

  return null;
}
