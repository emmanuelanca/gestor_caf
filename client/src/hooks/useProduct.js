import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useProduct() {
  const [productList, setProductList] = useState([]);
  const [allPuc, setAllPuc] = useState([]);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newPucSaleId, setNewPucSaleId] = useState('');
  const [newPucPurchaseId, setNewPucPurchaseId] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/product`);
      const data = await response.json();
      setProductList(data);
    } catch (error) {
      console.error('Error fetching products: ', error);
    }
  };

  const fetchAllPuc = async () => {
    try {
      const response = await fetch(`${API_URL}/api/puc`);
      const data = await response.json();
      setAllPuc(data);
    } catch (error) {
      console.error('Error fetching all PUC: ', error);
    }
  };

  const handleInsertProduct = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!newName.trim()) {
        alert('El nombre del producto es obligatorio');
        return;
      }

      if (!newPucSaleId) {
        alert('La cuenta PUC de venta es obligatoria');
        return;
      }

      if (!newPucPurchaseId) {
        alert('La cuenta PUC de compra es obligatoria');
        return;
      }

      const payload = {
        name: newName.trim(),
        category: newCategory.trim() || null,
        subcategory: newSubcategory.trim() || null,
        pucSaleId: parseInt(newPucSaleId),
        pucPurchaseId: parseInt(newPucPurchaseId),
      };

      const response = await fetch(`${API_URL}/api/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      await fetchProducts();

      setNewName('');
      setNewCategory('');
      setNewSubcategory('');
      setNewPucSaleId('');
      setNewPucPurchaseId('');
    } catch (error) {
      console.error(error);
      alert('Error al insertar el producto');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAllPuc();
  }, []);

  const optionsPuc = allPuc.map((p) => ({
    value: p.id,
    label: `[${p.codigo || '-'}] ${p.nombre}`,
  }));

  return {
    productList,
    allPuc,
    newName,
    setNewName,
    newCategory,
    setNewCategory,
    newSubcategory,
    setNewSubcategory,
    newPucSaleId,
    setNewPucSaleId,
    newPucPurchaseId,
    setNewPucPurchaseId,
    optionsPuc,
    handleInsertProduct,
  };
}