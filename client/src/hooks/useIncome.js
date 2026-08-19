import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useIncome() {
  const [income, setIncome] = useState([]);
  const [member, setMember] = useState([]);
  const [fundAccount, setFundAccount] = useState([]);
  const [allocation, setAllocation] = useState([]);
  const [event, setEvent] = useState([]);
  const [ticket, setTicket] = useState([]);
  const [product, setProduct] = useState([]);
  const [puc, setPuc] = useState([]);


  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newAmount, setNewAmount] = useState('');
  const [newFundAccount, setNewFundAccount] = useState('');
  const [newMember, setNewMember] = useState('');
  const [newAllocation, setNewAllocation] = useState('');
  const [newEvent, setNewEvent] = useState('');
  const [newTicket, setNewTicket] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newPuc, setNewPuc] = useState('');


  const fetchIncome = async () => {
    try {
      const result = await fetch(`${API_URL}/api/income`);
      const data = await result.json();
      setIncome(data);
    } catch (error) {
      console.error('Error while fetching incomes: ', error);
    }
  };

  const handleInsertIncome = async (e) => {
    if (e) e.preventDefault();

    if (!newDate || !newAmount || !newFundAccount || !newPuc) {
      alert('Fecha, monto, cuenta de fondos y cuenta PUC son obligatorios');
      return;
    }
    
    try {
      const valuesIncome = {
        date: newDate,
        fundAccount: newFundAccount,
        amount: newAmount,
        puc: newPuc,
        member: newMember || null,
        allocation: newAllocation || null,
        event: newEvent || null,
        ticket: newTicket || null,
        product: newProduct || null
      };

      const response = await fetch(`${API_URL}/api/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valuesIncome)
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      await fetchIncome();

      setNewDate(new Date().toISOString().split('T')[0]);
      setNewFundAccount('');
      setNewAmount('');
      setNewMember('');
      setNewAllocation('');
      setNewEvent('');
      setNewTicket('');
      setNewProduct('');
      setNewPuc('');
    } catch (error) {
      console.error(error);
      alert('Error while inserting an income');
    }
  };

  const handleDeleteIncome = async (id) => {
    const confirm = window.confirm('¿Estás seguro de eliminar este ingreso?');
    if (!confirm) return;
    try {
      const result = await fetch(`${API_URL}/api/income/${id}`, { method: 'DELETE' });
      if (result.ok) await fetchIncome();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchIncome(); }, []);
  useEffect(() => { fetch(`${API_URL}/api/member`).then(r => r.json()).then(setMember); }, []);
  useEffect(() => { fetch(`${API_URL}/api/fund-account`).then(r => r.json()).then(setFundAccount); }, []);
  useEffect(() => { fetch(`${API_URL}/api/allocation`).then(r => r.json()).then(setAllocation); }, []);
  useEffect(() => { fetch(`${API_URL}/api/event`).then(r => r.json()).then(setEvent); }, []);
  useEffect(() => { fetch(`${API_URL}/api/ticket`).then(r => r.json()).then(setTicket); }, []);
  useEffect(() => { fetch(`${API_URL}/api/product`).then(r => r.json()).then(setProduct); }, []);
  useEffect(() => { fetch(`${API_URL}/api/puc`).then(r => r.json()).then(setPuc); }, []);

  const optionsFundAccount = fundAccount.map(f => ({ value: f.id, label: f.nombre }));
  const optionsAllocation = allocation.map(a => ({ value: a.id, label: a.destino }));
  const optionsEvent = event.map(e => ({ value: e.id, label: e.nombre }));
  const optionsTicket = ticket.map(t => ({ value: t.id, label: t.categoria }));
  const optionsProduct = product.map(p => ({ value: p.id, label: p.nombre }));
  const optionsMember = member.map(m => ({ value: m.id, label: `${m.apellido} ${m.nombre} (${m.dni})` }));
  const optionsPuc = puc.map(p => ({ value: p.id, label: `[${p.codigo || '-'}] ${p.nombre}` }));

  return {
    income,
    newDate, setNewDate,
    newAmount, setNewAmount,
    newFundAccount, setNewFundAccount,
    newMember, setNewMember,
    newAllocation, setNewAllocation,
    newEvent, setNewEvent,
    newTicket, setNewTicket,
    newProduct, setNewProduct,
    newPuc, setNewPuc,
    optionsFundAccount,
    optionsAllocation,
    optionsEvent,
    optionsTicket,
    optionsProduct,
    optionsMember,
    optionsPuc,
    handleInsertIncome,
    handleDeleteIncome
  };
}
