import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useProvider() {
  const [providers, setProviders] = useState([]);

  const [newNombre, setNewNombre] = useState('');
  const [newCuit, setNewCuit] = useState('');

  const fetchProviders = async () => {
    try {
      const result = await fetch(`${API_URL}/api/provider`);
      const data = await result.json();
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers: ', error);
    }
  };

  const handleInsertProvider = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!newNombre.trim()) {
        alert('El nombre del proveedor es obligatorio');
        return;
      }

      if (!newCuit.trim()) {
        alert('El CUIT del proveedor es obligatorio');
        return;
      }

      const response = await fetch(`${API_URL}/api/provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newNombre.trim(), cuit: newCuit.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      await fetchProviders();
      setNewNombre('');
      setNewCuit('');
    } catch (error) {
      console.error(error);
      alert('Error al crear el proveedor');
    }
  };

  const handleToggleActivo = async (provider) => {
    try {
      const response = await fetch(`${API_URL}/api/provider/${provider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: provider.activo ? 0 : 1 }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      await fetchProviders();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el estado del proveedor');
    }
  };

  const handleUpdateProvider = async (id, changes) => {
    try {
      const response = await fetch(`${API_URL}/api/provider/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      await fetchProviders();
    } catch (error) {
      console.error(error);
      alert('Error al editar el proveedor');
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  return {
    providers,
    newNombre, setNewNombre,
    newCuit, setNewCuit,
    handleInsertProvider,
    handleToggleActivo,
    handleUpdateProvider,
  };
}