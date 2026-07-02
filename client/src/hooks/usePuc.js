import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function usePuc() {
  const [pucBalance, setPucBalance] = useState([]);
  const [allPuc, setAllPuc] = useState([]);

  const [newPadreId, setNewPadreId] = useState('');
  const [newSubnivel, setNewSubnivel] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');

  const fetchPucBalance = async () => {
    try {
      const result = await fetch(`${API_URL}/api/puc-balance`);
      const data = await result.json();
      setPucBalance(data);
    } catch (error) {
      console.error('Error fetching PUC balance: ', error);
    }
  };

  const fetchAllPuc = async () => {
    try {
      const result = await fetch(`${API_URL}/api/puc`);
      const data = await result.json();
      setAllPuc(data);
    } catch (error) {
      console.error('Error fetching all PUC: ', error);
    }
  };

  const handleInsertPuc = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!newNombre.trim()) {
        alert('El nombre del PUC es obligatorio');
        return;
      }

      if (!newSubnivel.trim()) {
        alert('El subnivel es obligatorio');
        return;
      }

      const valuesPuc = {
        padre_id: newPadreId ? parseInt(newPadreId) : null,
        subnivel: newSubnivel.trim(),
        nombre: newNombre.trim(),
        descripcion: newDescripcion.trim() || null,
      };

      const response = await fetch(`${API_URL}/api/puc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valuesPuc),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      await fetchPucBalance();
      await fetchAllPuc();

      setNewPadreId('');
      setNewSubnivel('');
      setNewNombre('');
      setNewDescripcion('');
    } catch (error) {
      console.error(error);
      alert('Error al insertar el PUC');
    }
  };

  useEffect(() => {
    fetchPucBalance();
    fetchAllPuc();
  }, []);

  const optionsPadre = allPuc.map((p) => ({
    value: p.id,
    label: `[${p.codigo || '-'}] ${p.nombre}`,
  }));

  return {
    pucBalance,
    allPuc,
    newPadreId,
    setNewPadreId,
    newSubnivel,
    setNewSubnivel,
    newNombre,
    setNewNombre,
    newDescripcion,
    setNewDescripcion,
    optionsPadre,
    handleInsertPuc,
  };
}
