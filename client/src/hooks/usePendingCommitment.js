import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function usePendingCommitment() {
  const [pendingCommitment, setPendingCommitment] = useState([]);
  const [fundAccount, setFundAccount] = useState([]);

  const fetchPendingCommitment = async () => {
    try {
      const result = await fetch(`${API_URL}/api/pending-commitment`);
      const data = await result.json();
      setPendingCommitment(data);
    } catch (error) {
      console.error('Error while fetching pending commitments: ', error);
    }
  };

  const handlePayCommitment = async (commitmentItem) => {
    if (fundAccount.length === 0) {
      alert('No hay cuentas de fondos disponibles para realizar el pago.');
      return;
    }

    const opcionesTexto = fundAccount.map(f => `${f.id}: ${f.nombre}`).join('\n');
    const cuentaSeleccionada = window.prompt(
      `Pagar compromiso por $${commitmentItem.monto}\nSeleccione el ID de la cuenta de fondos:\n\n${opcionesTexto}`
    );

    if (!cuentaSeleccionada) return;

    const cuentaExiste = fundAccount.some(f => f.id === parseInt(cuentaSeleccionada));
    if (!cuentaExiste) {
      alert('ID de cuenta no válido.');
      return;
    }

    try {
      const values = {
        date: new Date().toISOString().split('T')[0],
        fundAccount: cuentaSeleccionada,
        amount: commitmentItem.monto,
        commitment: commitmentItem.id,
      };

      const response = await fetch(`${API_URL}/api/pending-commitment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        alert('Pago registrado con éxito');
        await fetchPendingCommitment();
      } else {
        alert('Error al registrar el pago en el servidor');
      }
    } catch (error) {
      console.error(error);
      alert('Error en la conexión al pagar el compromiso');
    }
  };

  useEffect(() => { fetchPendingCommitment(); }, []);
  useEffect(() => { fetch(`${API_URL}/api/fund-account`).then(r => r.json()).then(setFundAccount); }, []);

  return {
    pendingCommitment,
    handlePayCommitment
  };
}
