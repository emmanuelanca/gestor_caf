import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useVoucherItemCommitment() {
  const [heads, setHeads] = useState([]);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedHeadId, setSelectedHeadId] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');
  const [newUnitAmount, setNewUnitAmount] = useState('');

  const fetchHeads = async () => {
    const r = await fetch(`${API_URL}/api/voucher-head-summary`);
    const data = await r.json();
    setHeads(data);
  };

  const fetchProducts = async () => {
    const r = await fetch(`${API_URL}/api/product`);
    const data = await r.json();
    setProducts(data.filter((p) => p.activo === 1));
  };

  const fetchItems = async (comprobanteId) => {
    if (!comprobanteId) {
      setItems([]);
      return;
    }
    const r = await fetch(`${API_URL}/api/voucher-item-commitment/${comprobanteId}`);
    const data = await r.json();
    setItems(data);
  };

  useEffect(() => {
    fetchHeads();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchItems(selectedHeadId);
  }, [selectedHeadId]);

  const selectedHead = useMemo(
    () => heads.find((h) => h.id === Number(selectedHeadId)) || null,
    [heads, selectedHeadId]
  );

  const addItem = async () => {
    if (!selectedHeadId) return alert('Seleccioná una cabecera');
    if (!newProductId) return alert('Seleccioná un producto');
    if (!newQuantity || Number(newQuantity) <= 0) return alert('Cantidad inválida');
    if (!newUnitAmount || Number(newUnitAmount) <= 0) return alert('Monto unitario inválido');

    const response = await fetch(`${API_URL}/api/voucher-item-commitment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comprobanteId: Number(selectedHeadId),
        productId: Number(newProductId),
        quantity: Number(newQuantity),
        unitAmount: Number(newUnitAmount),
      }),
    });

    if (!response.ok) {
      const e = await response.json();
      return alert(e.error || 'Error al agregar ítem');
    }

    setNewProductId('');
    setNewQuantity('1');
    setNewUnitAmount('');
    await fetchItems(selectedHeadId);
    await fetchHeads();
  };

  const updateItemField = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, [field]: value } : it))
    );
  };

  const saveItem = async (item) => {
    const response = await fetch(`${API_URL}/api/voucher-item-commitment/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantity: Number(item.unidades),
        unitAmount: Number(item.monto_unidad),
      }),
    });

    if (!response.ok) {
      const e = await response.json();
      return alert(e.error || 'Error al guardar ítem');
    }

    await fetchItems(selectedHeadId);
    await fetchHeads();
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('¿Eliminar este ítem?')) return;

    const response = await fetch(`${API_URL}/api/voucher-item-commitment/${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const e = await response.json();
      return alert(e.error || 'Error al eliminar ítem');
    }

    await fetchItems(selectedHeadId);
    await fetchHeads();
  };

  const generateCommitment = async () => {
    if (!selectedHeadId) return alert('Seleccioná una cabecera');

    const response = await fetch(`${API_URL}/api/commitment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comprobanteId: Number(selectedHeadId) }),
    });

    if (!response.ok) {
      const e = await response.json();
      return alert(e.error || 'Error al generar compromiso');
    }

    alert('Compromiso generado con éxito');
    await fetchHeads();
  };

  const cancelHead = async (id) => {
    if (!window.confirm('¿Anular comprobante?')) return;

    const response = await fetch(`${API_URL}/api/voucher-head/${id}/cancel`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const e = await response.json();
      return alert(e.error || 'Error al anular');
    }

    if (Number(selectedHeadId) === id) {
      setSelectedHeadId('');
      setItems([]);
    }

    await fetchHeads();
  };

  const headOptions = heads
    .filter((h) => h.anulado === 0)
    .map((h) => ({
      value: h.id,
      label: `${h.numero} - ${h.proveedor_nombre || 'Sin proveedor'} (${h.fecha_emision?.slice(0, 10) || '-'})`,
    }));

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.nombre,
  }));

  return {
    heads,
    items,
    selectedHead,
    selectedHeadId,
    setSelectedHeadId,
    newProductId,
    setNewProductId,
    newQuantity,
    setNewQuantity,
    newUnitAmount,
    setNewUnitAmount,
    addItem,
    updateItemField,
    saveItem,
    deleteItem,
    generateCommitment,
    cancelHead,
    headOptions,
    productOptions,
  };
}