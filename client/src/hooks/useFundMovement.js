import { useState, useEffect, useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useFundMovement() {
  const [fundMovement, setFundMovement] = useState([]);
  const [fundAccount, setFundAccount] = useState([]);
  const [commitment, setCommitment] = useState([]);
  const [income, setIncome] = useState([]);
  const [voucher, setVoucher] = useState([]);

  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newFundAccount, setNewFundAccount] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCommitment, setNewCommitment] = useState('');
  const [newIncome, setNewIncome] = useState('');
  const [newVoucher, setNewVoucher] = useState('');

  const fetchFundMovement = async () => {
    try {
      const result = await fetch(`${API_URL}/api/fund-movement`);
      const data = await result.json();
      setFundMovement(data);
    } catch (error) {
      console.error('Error while fetching fund movements: ', error);
    }
  };

  const handleInsertFundMovement = async (e) => {
    if (e) e.preventDefault();
    try {
      const values = {
        date: newDate,
        fundAccount: newFundAccount,
        amount: newAmount,
        commitment: newCommitment || null,
        income: newIncome || null,
        voucher: newVoucher || null
      };

      await fetch(`${API_URL}/api/fund-movement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      await fetchFundMovement();

      setNewDate(new Date().toISOString().split('T')[0]);
      setNewFundAccount('');
      setNewAmount('');
      setNewCommitment('');
      setNewIncome('');
      setNewVoucher('');
    } catch (error) {
      console.error(error);
      alert('Error while inserting a fund movement');
    }
  };

  const handleDeleteFundMovement = async (id) => {
    const confirm = window.confirm('¿Estás seguro de eliminar este movimiento de fondo?');
    if (!confirm) return;
    try {
      const result = await fetch(`${API_URL}/api/fund-movement/${id}`, { method: 'DELETE' });
      if (result.ok) await fetchFundMovement();
    } catch (error) {
      console.error(error);
    }
  };

  const totalBalance = fundMovement.reduce((acc, item) => {
    return acc + (item.monto * item.factor);
  }, 0);

  useEffect(() => { fetchFundMovement(); }, []);
  useEffect(() => { fetch(`${API_URL}/api/fund-account`).then(r => r.json()).then(setFundAccount); }, []);
  useEffect(() => { fetch(`${API_URL}/api/commitment`).then(r => r.json()).then(setCommitment); }, []);
  useEffect(() => { fetch(`${API_URL}/api/income`).then(r => r.json()).then(setIncome); }, []);
  useEffect(() => { fetch(`${API_URL}/api/voucher`).then(r => r.json()).then(setVoucher); }, []);

  const optionsFundAccount = fundAccount.map(f => ({ value: f.id, label: f.nombre }));
  const optionsCommitment = commitment.map(c => ({ value: c.id, label: `#${c.comprobante_numero} $${c.monto}` }));
  const optionsIncome = income.map(i => ({ value: i.id, label: `#${i.id} - $${i.monto}` }));
  const optionsVoucher = voucher.map(v => ({ value: v.id, label: `${v.tipo} N° ${v.numero}` }));

  return {
    fundMovement,
    newDate, setNewDate,
    newFundAccount, setNewFundAccount,
    newAmount, setNewAmount,
    newCommitment, setNewCommitment,
    newIncome, setNewIncome,
    newVoucher, setNewVoucher,
    optionsFundAccount,
    optionsCommitment,
    optionsIncome,
    optionsVoucher,
    handleDeleteFundMovement,
    handleInsertFundMovement,
    totalBalance,
  };
}
