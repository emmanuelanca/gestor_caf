import React, { useEffect, useState } from "react";
import "./vista.css";
import escudo from "/src/assets/escudo.png";
import { MdAccountBalanceWallet, MdChecklist, MdMenuBook, MdSettings } from "react-icons/md";

export default function App() {
  const [screen, setScreen] = useState("menu"); // "menu" | "ingresos" | "compromisos" | "opciones"
  const [role, setRole] = useState("invitado"); // "invitado" | "administrador"
  const [darkMode, setDarkMode] = useState(false);

  const [adminPassword, setAdminPassword] = useState("123");

  const [pucReferencias, setPucReferencias] = useState({
    "112526": "Eventos Sociales - Ingresos Operativos",
    "115527": "Entradas Fútbol Cat. General",
    "115528": "Entradas Fútbol Cat. Socio",
    "123537": "Alquiler Salón",
    "213050": "Aportes sobre Sueldo Anual Complementario",
    "223370": "Nafta Súper",
  });

  const [ingresos, setIngresos] = useState([
    { fecha: "2026-04-20", monto: 5000, comprobante: "FAC-001", puc: "112526" },
    { fecha: "2026-04-21", monto: 3000, comprobante: "FAC-002", puc: "115527" },
  ]);

  const [compromisos, setCompromisos] = useState([
    { fecha: "2026-04-20", monto: 2000, proveedor: "Proveedor A", puc: "213050" },
    { fecha: "2026-04-21", monto: 1500, proveedor: "Proveedor B", puc: "223370" },
  ]);

  const [nuevoComprobante, setNuevoComprobante] = useState("");
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevoPUC, setNuevoPUC] = useState("112526");

  const [confirmCode, setConfirmCode] = useState(null);
  const [codeSentAt, setCodeSentAt] = useState(null);
  const [codeTargetEmail, setCodeTargetEmail] = useState(null);

  const totalIngresos = ingresos.reduce((acc, i) => acc + i.monto, 0);
  const totalCompromisos = compromisos.reduce((acc, c) => acc + c.monto, 0);
  const balance = totalIngresos - totalCompromisos;

  // Set page title
  useEffect(() => {
    document.title = "CAF Finanzas";
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (!event || !event.data) return;
      if (event.data.tipo === "agregarPUC") {
        setPucReferencias((prev) => ({ ...prev, [event.data.codigo]: event.data.desc }));
      }
      if (event.data.tipo === "eliminarPUC") {
        setPucReferencias((prev) => {
          const copia = { ...prev };
          delete copia[event.data.codigo];
          return copia;
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleProfileChange = (e) => {
    const nuevo = e.target.value;
    if (nuevo === "administrador") {
      const pass = prompt("Ingrese contraseña de administrador:");
      if (pass === adminPassword) {
        setRole("administrador");
        alert("Sesión iniciada como Administrador.");
      } else {
        alert("Contraseña incorrecta. Permanece como Invitado.");
        e.target.value = "invitado";
      }
    } else {
      setRole("invitado");
    }
  };

  const abrirPUCAdmin = () => {
    if (role !== "administrador") {
      alert("Acceso denegado. Solo administrador puede administrar el PUC.");
      return;
    }

    const nuevaVentana = window.open("", "PUCAdmin", "width=700,height=520");
    const pucJson = JSON.stringify(pucReferencias).replace(/</g, "\\u003c");

    nuevaVentana.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Administración PUC</title>
          <style>
            body { font-family: "Segoe UI", Tahoma, Verdana, sans-serif; background:#f4f7fb; padding:18px; color:#12305a; }
            h2 { color:#12305a; margin-top:0; }
            table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #c6d4f2; margin-bottom:12px; }
            th, td { padding:8px; border-bottom:1px solid #eef4ff; text-align:left; }
            th { background:linear-gradient(#f3f7ff,#e6efff); font-weight:700; }
            input { padding:6px 8px; border:1px solid #c6d4f2; border-radius:4px; margin-right:8px; }
            button { padding:6px 10px; border-radius:6px; border:1px solid #1f5fd6; background:linear-gradient(#6ea0ff,#2b6edb); color:#fff; cursor:pointer; }
            .btn-del { padding:4px 8px; border-radius:4px; border:1px solid #c6d4f2; background:#fff; cursor:pointer; }
            .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:10px; }
          </style>
        </head>
        <body>
          <h2>PUC Actual</h2>
          <table>
            <thead><tr><th>Código</th><th>Descripción</th><th>Acciones</th></tr></thead>
            <tbody id="pucBody"></tbody>
          </table>

          <div class="row">
            <input id="nuevoCodigo" placeholder="Código" />
            <input id="nuevaDesc" placeholder="Descripción" />
            <button id="btnAgregar">Agregar</button>
          </div>

          <script>
            (function(){
              const pucReferencias = ${pucJson};

              function renderPUC(){
                const tbody = document.getElementById('pucBody');
                tbody.innerHTML = Object.entries(pucReferencias)
                  .map(([c,d]) => "<tr><td>"+c+"</td><td>"+d+"</td><td><button class='btn-del' data-c='"+c+"'>Eliminar</button></td></tr>")
                  .join('');
                Array.from(document.getElementsByClassName('btn-del')).forEach(b=>{
                  b.addEventListener('click', (ev)=>{
                    const codigo = ev.currentTarget.getAttribute('data-c');
                    if(!confirm('Eliminar PUC ' + codigo + '?')) return;
                    delete pucReferencias[codigo];
                    renderPUC();
                    window.opener.postMessage({ tipo: 'eliminarPUC', codigo }, '*');
                  });
                });
              }

              document.getElementById('btnAgregar').addEventListener('click', ()=>{
                const codigo = document.getElementById('nuevoCodigo').value.trim();
                const desc = document.getElementById('nuevaDesc').value.trim();
                if(!codigo || !desc) return alert('Complete código y descripción.');
                pucReferencias[codigo] = desc;
                renderPUC();
                window.opener.postMessage({ tipo: 'agregarPUC', codigo, desc }, '*');
                document.getElementById('nuevoCodigo').value = '';
                document.getElementById('nuevaDesc').value = '';
              });

              renderPUC();
            })();
          </script>
        </body>
      </html>
    `);

    nuevaVentana.document.close();
  };

  const agregarIngreso = (e) => {
    e.preventDefault();
    if (!nuevoComprobante || !nuevoMonto) return alert("Complete comprobante y monto.");
    const nuevo = {
      fecha: new Date().toISOString().split("T")[0],
      monto: parseFloat(nuevoMonto),
      comprobante: nuevoComprobante,
      puc: nuevoPUC,
    };
    setIngresos((prev) => [...prev, nuevo]);
    setNuevoComprobante("");
    setNuevoMonto("");
    setNuevoPUC("112526");
  };

  const agregarCompromiso = () => {
    const proveedor = prompt("Proveedor / Responsable:");
    if (!proveedor) return;
    const montoStr = prompt("Monto:");
    const monto = parseFloat(montoStr || "0");
    if (!monto || isNaN(monto)) return alert("Monto inválido.");
    const nuevo = {
      fecha: new Date().toISOString().split("T")[0],
      monto,
      proveedor,
      puc: "213050",
    };
    setCompromisos((prev) => [...prev, nuevo]);
  };

  const sendConfirmationCodeToEmail = () => {
    const target = prompt("Ingrese el correo al que enviar el código (ej: tu@correo.com):");
    if (!target) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setConfirmCode(code);
    setCodeSentAt(Date.now());
    setCodeTargetEmail(target);

    const subject = "Código de confirmación - Restablecer contraseña (Club Atletico French)";
    const body = `Se ha solicitado un código para restablecer la contraseña de administrador.\n\nCódigo: ${code}\n\nSi no solicitaste esto, ignóralo.`;
    const mailto = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto);
    alert(`Código generado y preparado para enviar a ${target}.\n\nCódigo (solo para pruebas): ${code}`);
  };

  const verifyAndResetPassword = () => {
    if (!confirmCode) {
      alert("Primero generá y enviá un código al correo.");
      return;
    }
    const entered = prompt(`Ingrese el código de confirmación enviado a ${codeTargetEmail}:`);
    if (!entered) return;
    const elapsed = Date.now() - (codeSentAt || 0);
    if (elapsed > 15 * 60 * 1000) {
      alert("El código expiró. Generá uno nuevo.");
      setConfirmCode(null);
      setCodeSentAt(null);
      setCodeTargetEmail(null);
      return;
    }
    if (entered.trim() !== confirmCode) {
      alert("Código incorrecto.");
      return;
    }
    const newPass = prompt("Código verificado. Ingrese nueva contraseña de administrador:");
    if (!newPass) return alert("Contraseña no cambiada.");
    const newPass2 = prompt("Confirme la nueva contraseña:");
    if (newPass !== newPass2) {
      alert("Las contraseñas no coinciden. Intentá de nuevo.");
      return;
    }
    setAdminPassword(newPass);
    setConfirmCode(null);
    setCodeSentAt(null);
    setCodeTargetEmail(null);
    alert("Contraseña de administrador actualizada.");
  };

  const changePasswordWhileLogged = () => {
    if (role !== "administrador") {
      alert("Debes iniciar sesión como administrador para cambiar la contraseña directamente.");
      return;
    }
    const current = prompt("Ingrese la contraseña actual:");
    if (current !== adminPassword) {
      alert("Contraseña actual incorrecta.");
      return;
    }
    const newPass = prompt("Ingrese nueva contraseña:");
    if (!newPass) return alert("No se cambió la contraseña.");
    const newPass2 = prompt("Confirme la nueva contraseña:");
    if (newPass !== newPass2) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    setAdminPassword(newPass);
    alert("Contraseña actualizada correctamente.");
  };

  // Renders
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
                <option value="invitado">Invitado</option>
                <option value="administrador">Administrador</option>
              </select>

              <button
                className="icon-button"
                title={darkMode ? "Desactivar modo oscuro" : "Modo oscuro"}
                onClick={() => setDarkMode((d) => !d)}
                aria-label="Alternar modo oscuro"
              >
                🌙
              </button>
            </div>
          </div>
        </div>

        <div className="vista-content menu-vertical">
          <button className="menu-tile primary-tile vertical" onClick={() => setScreen("ingresos")}>
            <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
            <div className="tile-text">
              <div className="tile-title">Ingresos</div>
              <div className="tile-desc">Registrar y ver ingresos</div>
            </div>
          </button>

          <button className="menu-tile vertical" onClick={() => setScreen("compromisos")}>
            <div className="tile-icon refined"><MdChecklist className="svg-icon" /></div>
            <div className="tile-text">
              <div className="tile-title">Compromisos</div>
              <div className="tile-desc">Registrar y ver compromisos</div>
            </div>
          </button>

          <button className="menu-tile vertical" onClick={abrirPUCAdmin}>
            <div className="tile-icon refined"><MdMenuBook className="svg-icon" /></div>
            <div className="tile-text">
              <div className="tile-title">PUC</div>
              <div className="tile-desc">Administrar cuentas</div>
            </div>
          </button>

          <button className="menu-tile vertical" onClick={() => setScreen("opciones")}>
            <div className="tile-icon refined"><MdSettings className="svg-icon" /></div>
            <div className="tile-text">
              <div className="tile-title">Opciones</div>
              <div className="tile-desc">Preferencias y seguridad</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "ingresos") {
    return (
      <div className={`vista-window ${darkMode ? "dark" : ""}`}>
        <div className="vista-titlebar">
          <div className="title-left">
            <button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button>
            <div className="club-title">Ingresos</div>
          </div>

          <div className="title-right">
            <div className="profile-dropdown small">
              <label className="profile-label" htmlFor="profileSelect2">Perfil</label>
              <select id="profileSelect2" className="profile-select" value={role} onChange={handleProfileChange}>
                <option value="invitado">Invitado</option>
                <option value="administrador">Administrador</option>
              </select>
              <button className="icon-button" onClick={() => setDarkMode((d) => !d)}>🌙</button>
            </div>
          </div>
        </div>

        <div className="vista-content">
          <div className="vista-panel">
            <form onSubmit={agregarIngreso} className="row" style={{ marginBottom: 12 }}>
              <input className="vista-input" placeholder="Comprobante" value={nuevoComprobante} onChange={(e) => setNuevoComprobante(e.target.value)} />
              <input className="vista-input" placeholder="Monto" type="number" value={nuevoMonto} onChange={(e) => setNuevoMonto(e.target.value)} />
              <select className="vista-select" value={nuevoPUC} onChange={(e) => setNuevoPUC(e.target.value)}>
                {Object.entries(pucReferencias).map(([codigo, desc]) => (
                  <option key={codigo} value={codigo}>{codigo} - {desc}</option>
                ))}
              </select>
              <button className="vista-button primary" type="submit">Agregar</button>
            </form>

            <div className="table-wrap">
              <table className="vista-table">
                <thead>
                  <tr><th>Fecha</th><th>Monto</th><th>Comprobante</th><th>PUC</th></tr>
                </thead>
                <tbody>
                  {ingresos.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.fecha}</td>
                      <td>${i.monto}</td>
                      <td>{i.comprobante}</td>
                      <td title={pucReferencias[i.puc]}>{i.puc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 12 }}>
              <p>Total Ingresos: ${totalIngresos}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "compromisos") {
    return (
      <div className={`vista-window ${darkMode ? "dark" : ""}`}>
        <div className="vista-titlebar">
          <div className="title-left">
            <button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button>
            <div className="club-title">Compromisos</div>
          </div>

          <div className="title-right">
            <div className="profile-dropdown small">
              <label className="profile-label" htmlFor="profileSelect3">Perfil</label>
              <select id="profileSelect3" className="profile-select" value={role} onChange={handleProfileChange}>
                <option value="invitado">Invitado</option>
                <option value="administrador">Administrador</option>
              </select>
              <button className="icon-button" onClick={() => setDarkMode((d) => !d)}>🌙</button>
            </div>
          </div>
        </div>

        <div className="vista-content">
          <div className="vista-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <strong>Compromisos</strong>
                <div style={{ fontSize: 13, color: darkMode ? "#9fb0d9" : "#6b7a99" }}>Lista de compromisos registrados</div>
              </div>
              <div>
                <button className="vista-button" onClick={agregarCompromiso}>Agregar compromiso</button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="vista-table">
                <thead>
                  <tr><th>Fecha</th><th>Monto</th><th>Proveedor</th><th>PUC</th></tr>
                </thead>
                <tbody>
                  {compromisos.map((c, idx) => (
                    <tr key={idx}>
                      <td>{c.fecha}</td>
                      <td>${c.monto}</td>
                      <td>{c.proveedor}</td>
                      <td title={pucReferencias[c.puc]}>{c.puc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 12 }}>
              <p>Total Ingresos: ${totalIngresos}</p>
              <p>Total Compromisos: ${totalCompromisos}</p>
              <p><strong>Balance: ${balance}</strong></p>
              <div style={{ marginTop: 12 }}>
                <button className="vista-button" onClick={abrirPUCAdmin}>⚙️ Administrar PUC</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "opciones") {
    return (
      <div className={`vista-window ${darkMode ? "dark" : ""}`}>
        <div className="vista-titlebar">
          <div className="title-left">
            <button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button>
            <div className="club-title">Opciones</div>
          </div>

          <div className="title-right">
            <div className="profile-dropdown small">
              <label className="profile-label" htmlFor="profileSelectOp">Perfil</label>
              <select id="profileSelectOp" className="profile-select" value={role} onChange={handleProfileChange}>
                <option value="invitado">Invitado</option>
                <option value="administrador">Administrador</option>
              </select>
              <button className="icon-button" onClick={() => setDarkMode((d) => !d)}>🌙</button>
            </div>
          </div>
        </div>

        <div className="vista-content">
          <div className="vista-panel">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Restablecer contraseña (olvidada)</strong>
                  <div style={{ fontSize: 13, color: darkMode ? "#9fb0d9" : "#6b7a99" }}>
                    Generá un código y envialo al correo que elijas. Luego verificá el código para cambiar la contraseña.
                  </div>
                </div>
                <div>
                  <button className="vista-button" onClick={sendConfirmationCodeToEmail}>Enviar código</button>
                  <button className="vista-button" style={{ marginLeft: 8 }} onClick={verifyAndResetPassword}>Ingresar código</button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Cambiar contraseña (logueado)</strong>
                  <div style={{ fontSize: 13, color: darkMode ? "#9fb0d9" : "#6b7a99" }}>
                    Si estás logueado como administrador, podés cambiar la contraseña ingresando la actual.
                  </div>
                </div>
                <div>
                  <button
                    className="vista-button"
                    onClick={changePasswordWhileLogged}
                    disabled={role !== "administrador"}
                    title={role !== "administrador" ? "Inicia sesión como administrador para usar esto" : "Cambiar contraseña"}
                  >
                    Cambiar
                  </button>
                </div>
              </div>

              <div style={{ fontSize: 13, color: darkMode ? "#9fb0d9" : "#6b7a99" }}>
                El código expira en 15 minutos. El envío se realiza abriendo tu cliente de correo con el mensaje prellenado.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
