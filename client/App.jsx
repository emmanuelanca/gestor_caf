import React, { useEffect, useState } from 'react';
import './vista.css';
import Select from 'react-select';
import escudo from '/src/assets/escudo.png';
import { MdAccountBalanceWallet } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [allocation, setAllocation] = useState([]);
  const [event, setEvent] = useState([]);
  const [fundAccount, setFundAccount] = useState([]);
  const [income, setIncome] = useState([]);
  const [member, setMember] = useState([]);
  const [newAllocation, setNewAllocation] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newEvent, setNewEvent] = useState('');
  const [newFundAccount, setNewFundAccount] = useState('');
  const [newMember, setNewMember] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newTicket, setNewTicket] = useState('');
  const [product, setProduct] = useState([]);
  const [screen, setScreen] = useState('menu');
  const [ticket, setTicket] = useState([]);

  const fetchIncome = async () => {
    try {
      const result = await fetch(`${API_URL}/api/income`);
      const data = await result.json();
      setIncome(data);
    } catch (error) {
      console.error('Error while fetching incomes: ', error)
    }
  };

  const handleInsertIncome = async () => {
    try {
      const values = {
        'date': newDate,
        'fundAccount': newFundAccount,
        'amount': newAmount,
        'member': newMember,
        'allocation': newAllocation,
        'event': newEvent,
        'ticket': newTicket,
        'product': newProduct
      }

      await fetch(`${API_URL}/api/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      await fetchIncome();
    } catch (error) {
      console.error(error);
      alert('Error while inserting an income');
    }

    setNewDate(new Date().toISOString().split('T')[0]);
    setNewFundAccount('');
    setNewAmount('');
    setNewMember('');
    setNewAllocation('');
    setNewEvent('');
    setNewTicket('');
    setNewProduct('');
  };

  const handleDeleteIncome = async (id) => {
    const confirm = window.confirm('¿Estás seguro de eliminar este ingreso?');
    if (!confirm) return;

    try {
      const result = await fetch(`${API_URL}/api/income/${id}`, {
        method: 'DELETE',
      });

      if (result.ok) {
        await fetchIncome();
      } else {
        alert('Error while deleting an income');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/member`)
      .then(res => res.json())
      .then(data => setMember(data))
      .catch(err => console.error('Error while fetching: ', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/fund-account`)
      .then(res => res.json())
      .then(data => setFundAccount(data))
      .catch(err => console.error('Error while fetching: ', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/allocation`)
      .then(res => res.json())
      .then(data => setAllocation(data))
      .catch(err => console.error('Error while fetching: ', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/event`)
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => console.error('Error while fetching: ', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/ticket`)
      .then(res => res.json())
      .then(data => setTicket(data))
      .catch(err => console.error('Error while fetching: ', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/product`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error('Error while fetching: ', err));
  }, []);

  const optionsFundAccount = fundAccount.map(fundAccount => ({
    value: fundAccount.id,
    label: fundAccount.nombre
  }));

  const optionsAllocation = allocation.map(allocation => ({
    value: allocation.id,
    label: allocation.destino
  }));

  const optionsEvent = event.map(event => ({
    value: event.id,
    label: event.nombre
  }));

  const optionsTicket = ticket.map(ticket => ({
    value: ticket.id,
    label: ticket.categoria
  }));

  const optionsProduct = product.map(product => ({
    value: product.id,
    label: product.nombre
  }));

  const optionsMember = member.map(member => ({
    value: member.id,
    label: `${member.apellido} ${member.nombre} (${member.dni})`
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
          <button className="menu-tile primary-tile vertical" onClick={() => setScreen("income")}>
            <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
            <div className="tile-text"><div className="tile-title">Ingresos</div><div className="tile-desc">Registrar y ver income</div></div>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "income") {
    return (
      <div className="vista-window">
        <div className="vista-titlebar">
          <div className="title-left"><button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button><div className="club-title">Ingresos</div></div>
          <div className="title-right">
          </div>
        </div>

        <div className="vista-content">
          <div className="vista-panel">
            <form onSubmit={handleInsertIncome} className="row" style={{ marginBottom: 12 }}>
              <input className="vista-input"
                placeholder="Fecha"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                type="date"
              />
              <input className="vista-input"
                placeholder="Monto"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                inputmode="decimal"
              />
              <div className="vista-input">
                <Select
                  placeholder="Cuenta de fondos"
                  value={optionsFundAccount.find(option => option.value === newFundAccount) || null}
                  onChange={(e) => setNewFundAccount(e ? e.value : "")}
                  options={optionsFundAccount}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Socio aportante"
                  value={optionsMember.find(option => option.value === newMember) || null}
                  onChange={(e) => setNewMember(e ? e.value : "")}
                  options={optionsMember}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Afectación"
                  value={optionsAllocation.find(option => option.value === newAllocation) || null}
                  onChange={(e) => setNewAllocation(e ? e.value : "")}
                  options={optionsAllocation}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Evento"
                  value={optionsEvent.find(option => option.value === newEvent) || null}
                  onChange={(e) => setNewEvent(e ? e.value : "")}
                  options={optionsEvent}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Entrada"
                  value={optionsTicket.find(option => option.value === newTicket) || null}
                  onChange={(e) => setNewTicket(e ? e.value : "")}
                  options={optionsTicket}
                  isClearable
                />
              </div>
              <div className="vista-input">
                <Select
                  placeholder="Producto"
                  value={optionsProduct.find(option => option.value === newProduct) || null}
                  onChange={(e) => setNewProduct(e ? e.value : "")}
                  options={optionsProduct}
                  isClearable
                />
              </div>
              <button className="vista-button primary"
                type="button"
                onClick={handleInsertIncome}>
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
                  {income.map((income) => (
                    <tr key={income.id}>
                      <td>{income.fecha ? new Date(income.fecha).toLocaleDateString(navigator.language) : '-'}</td>
                      <td>{income.cuenta_fondos}</td>
                      <td>${income.monto}</td>
                      <td>
                        {income.socio_apellido && income.socio_nombre
                          ? `${income.socio_apellido}, ${income.socio_nombre}`
                          : '-'}
                      </td>
                      <td>{income.afectacion_ingreso || '-'}</td>
                      <td>{income.entrada_categoria || '-'}</td>
                      <td>{income.evento_nombre || '-'}</td>
                      <td>{income.producto_nombre || '-'}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteIncome(income.id)}
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
