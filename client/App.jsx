import React, { useEffect, useState } from "react";
import "./vista.css";
import Select from 'react-select';
import escudo from "/src/assets/escudo.png";
import { MdAccountBalanceWallet } from "react-icons/md";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [afectacionIngresos, setAfectacionIngresos] = useState([]);
  const [cuentasFondos, setCuentasFondos] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [nuevoAfectacion, setNuevoAfectacion] = useState("");
  const [nuevoCuentaFondos, setNuevoCuentaFondos] = useState("");
  const [nuevoEntrada, setNuevoEntrada] = useState("");
  const [nuevoEvento, setNuevoEvento] = useState("");
  const [nuevoFecha, setNuevoFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState("");
  const [nuevoSocio, setNuevoSocio] = useState("");
  const [productos, setProductos] = useState([]);
  const [screen, setScreen] = useState("menu");
  const [socios, setSocios] = useState([]);

  const fetchIngresos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ingresos`);
      const data = await response.json();
      setIngresos(data);
    } catch (error) {
      console.error("Error al cargar ingresos: ", error)
    }
  };

  const handleInsertIngresos = async () => {
    try {
      const values = {
        'fecha': nuevoFecha,
        'cuentaFondos': nuevoCuentaFondos,
        'monto': nuevoMonto,
        'socio': nuevoSocio,
        'afectacion': nuevoAfectacion,
        'evento': nuevoEvento,
        'entrada': nuevoEntrada,
        'producto': nuevoProducto
      }

      await fetch(`${API_URL}/api/ingresos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      await fetchIngresos();
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar el ingreso.');
    }

    setNuevoFecha(new Date().toISOString().split('T')[0]);
    setNuevoCuentaFondos("");
    setNuevoMonto("");
    setNuevoSocio("");
    setNuevoAfectacion("");
    setNuevoEvento("");
    setNuevoEntrada("");
    setNuevoProducto("");
  };

  const handleDeleteIngreso = async (id) => {
    const confirm = window.confirm('¿Estás seguro de eliminar este ingreso?');
    if (!confirm) return;

    try {
      const response = await fetch(`${API_URL}/api/ingresos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchIngresos();
      } else {
        alert('No se pudo eliminar el ingreso.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchIngresos();
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/socios`)
      .then(res => res.json())
      .then(data => setSocios(data))
      .catch(err => console.error("Error al cargar: ", err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/cuentas-fondos`)
      .then(res => res.json())
      .then(data => setCuentasFondos(data))
      .catch(err => console.error("Error al cargar: ", err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/afectacion-ingresos`)
      .then(res => res.json())
      .then(data => setAfectacionIngresos(data))
      .catch(err => console.error("Error al cargar: ", err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/eventos`)
      .then(res => res.json())
      .then(data => setEventos(data))
      .catch(err => console.error("Error al cargar: ", err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/entradas`)
      .then(res => res.json())
      .then(data => setEntradas(data))
      .catch(err => console.error("Error al cargar: ", err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/productos`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error al cargar: ", err));
  }, []);

  const optionsCuentasFondos = cuentasFondos.map(cuenta => ({
    value: cuenta.id,
    label: cuenta.nombre
  }));

  const optionsAfectacionIngresos = afectacionIngresos.map(afectacion => ({
    value: afectacion.id,
    label: afectacion.destino
  }));

  const optionsEventos = eventos.map(evento => ({
    value: evento.id,
    label: evento.nombre
  }));

  const optionsEntradas = entradas.map(entrada => ({
    value: entrada.id,
    label: entrada.categoria
  }));

  const optionsProductos = productos.map(producto => ({
    value: producto.id,
    label: producto.nombre
  }));

  const optionsSocios = socios.map(socio => ({
    value: socio.id,
    label: `${socio.apellido} ${socio.nombre} (${socio.dni})`
  }));


  if (screen === "menu") {
    return (
      <div className="vista-window">
        <div className="vista-titlebar">
          <div className="title-left">
            <img src={escudo} alt="Escudo Club Atletico French" className="club-logo" />
            <div className="club-title">Club Atletico French</div>
          </div>
          <div className="title-right">
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
      <div className="vista-window">
        <div className="vista-titlebar">
          <div className="title-left"><button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button><div className="club-title">Ingresos</div></div>
          <div className="title-right">
          </div>
        </div>

        <div className="vista-content">
          <div className="vista-panel">
            <form onSubmit={handleInsertIngresos} className="row" style={{ marginBottom: 12 }}>
              <input className="vista-input"
                placeholder="Fecha"
                value={nuevoFecha}
                onChange={(e) => setNuevoFecha(e.target.value)}
                type="date"
              />
              <input className="vista-input"
                placeholder="Monto"
                value={nuevoMonto}
                onChange={(e) => setNuevoMonto(e.target.value)}
                inputmode="decimal"
              />
              <div className="vista-input">
                <Select
                  placeholder="Cuenta de fondos"
                  value={optionsCuentasFondos.find(option => option.value === nuevoCuentaFondos) || null}
                  onChange={(e) => setNuevoCuentaFondos(e ? e.value : "")}
                  options={optionsCuentasFondos}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Socio aportante"
                  value={optionsSocios.find(option => option.value === nuevoSocio) || null}
                  onChange={(e) => setNuevoSocio(e ? e.value : "")}
                  options={optionsSocios}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Afectación"
                  value={optionsAfectacionIngresos.find(option => option.value === nuevoAfectacion) || null}
                  onChange={(e) => setNuevoAfectacion(e ? e.value : "")}
                  options={optionsAfectacionIngresos}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Evento"
                  value={optionsEventos.find(option => option.value === nuevoEvento) || null}
                  onChange={(e) => setNuevoEvento(e ? e.value : "")}
                  options={optionsEventos}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Entrada"
                  value={optionsEntradas.find(option => option.value === nuevoEntrada) || null}
                  onChange={(e) => setNuevoEntrada(e ? e.value : "")}
                  options={optionsEntradas}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Producto"
                  value={optionsProductos.find(option => option.value === nuevoProducto) || null}
                  onChange={(e) => setNuevoProducto(e ? e.value : "")}
                  options={optionsProductos}
                  isClearable
                />
              </div>
              <button className="vista-button primary"
                type="button"
                onClick={handleInsertIngresos}>
                Agregar
              </button>
            </form>

            <div className="table-wrap">
              <table className="vista-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cuenta Fondos</th>
                    <th>Monto</th>
                    <th>Socio</th>
                    <th>Afectación</th>
                    <th>Entrada</th>
                    <th>Evento</th>
                    <th>Producto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresos.map((ingreso) => (
                    <tr key={ingreso.id}>
                      <td>{ingreso.fecha ? new Date(ingreso.fecha).toLocaleDateString(navigator.language) : '-'}</td>
                      <td>{ingreso.cuenta_fondos}</td>
                      <td>${ingreso.monto}</td>
                      <td>
                        {ingreso.socio_apellido && ingreso.socio_nombre
                          ? `${ingreso.socio_apellido}, ${ingreso.socio_nombre}`
                          : '-'}
                      </td>
                      <td>{ingreso.afectacion_ingreso || '-'}</td>
                      <td>{ingreso.entrada_categoria || '-'}</td>
                      <td>{ingreso.evento_nombre || '-'}</td>
                      <td>{ingreso.producto_nombre || '-'}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteIngreso(ingreso.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e74c3c',
                            fontSize: '18px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            padding: '0 5px'
                          }}
                          title="Eliminar ingreso"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div >
        </div >
      </div >
    );
  }

  return null;
}
