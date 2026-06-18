import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useVoucherHead() {
  const [provider, setProvider] = useState([]);

  const [newType, setNewType] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newProvider, setNewProvider] = useState('');

  const handleInsertVoucherHead = async (e) => {
    if (e) e.preventDefault();
    try {
      const valuesVoucherHead = {
        type: newType,
        number: newNumber,
        date: newDate,
        provider: newProvider || null
      };

      await fetch(`${API_URL}/api/voucher-head`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valuesVoucherHead)
      });

      setNewType('');
      setNewNumber('');
      setNewDate(new Date().toISOString().split('T')[0]);
      setNewProvider('');

      alert('Cabecera de comprobante creada con éxito');
    } catch (error) {
      console.error(error);
      alert('Error al insertar la cabecera del comprobante');
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/provider`)
      .then(r => r.json())
      .then(setProvider);
  }, []);

  const optionsProvider = provider.map(p => ({ value: p.id, label: `${p.nombre} (${p.cuit})` }));

  const optionsType = [
    { value: 'factura_a', label: 'Factura A' },
    { value: 'factura_b', label: 'Factura B' },
    { value: 'factura_c', label: 'Factura C' },
    { value: 'factura_e', label: 'Factura E' },
    { value: 'recibo', label: 'Recibo' }
  ];

  return {
    newType, setNewType,
    newNumber, setNewNumber,
    newDate, setNewDate,
    newProvider, setNewProvider,
    optionsProvider,
    optionsType,
    handleInsertVoucherHead
  };
}
