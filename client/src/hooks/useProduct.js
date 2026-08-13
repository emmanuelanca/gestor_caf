import { useState, useEffect, useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useProduct() {
  const [productList, setProductList] = useState([]);
  const [allPuc, setAllPuc] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newPucSaleId, setNewPucSaleId] = useState('');
  const [newPucPurchaseId, setNewPucPurchaseId] = useState('');
  const [newActive, setNewActive] = useState(true);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

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

  const resetForm = () => {
    setEditingId(null);
    setNewName('');
    setNewCategory('');
    setNewSubcategory('');
    setNewPucSaleId('');
    setNewPucPurchaseId('');
    setNewActive(true);
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setNewName(item.nombre || '');
    setNewCategory(item.categoria || '');
    setNewSubcategory(item.subcategoria || '');
    setNewPucSaleId(item.puc_venta_id ? item.puc_venta_id.toString() : '');
    setNewPucPurchaseId(item.puc_compra_id ? item.puc_compra_id.toString() : '');
    setNewActive(item.activo === 1);
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
        active: newActive ? 1 : 0,
      };

      const endpoint = editingId
        ? `${API_URL}/api/product/${editingId}`
        : `${API_URL}/api/product`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el producto');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const payload = {
        name: item.nombre,
        category: item.categoria,
        subcategory: item.subcategoria,
        pucSaleId: item.puc_venta_id,
        pucPurchaseId: item.puc_compra_id,
        active: item.activo === 1 ? 0 : 1,
      };

      const response = await fetch(`${API_URL}/api/product/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      await fetchProducts();
    } catch (error) {
      console.error('Error toggling product active state: ', error);
      alert('Error al cambiar el estado del producto');
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

  const categoryOptions = useMemo(() => {
    const categories = productList
      .map((p) => p.categoria)
      .filter((cat) => cat && cat.trim() !== '');
    const uniqueCategories = Array.from(new Set(categories));
    return uniqueCategories.map((cat) => ({
      value: cat,
      label: cat,
    }));
  }, [productList]);

  const filteredProductList = useMemo(() => {
    if (!selectedCategoryFilter) return productList;
    return productList.filter((p) => p.categoria === selectedCategoryFilter);
  }, [productList, selectedCategoryFilter]);

  return {
    productList: filteredProductList,
    allPuc,
    editingId,
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
    newActive,
    setNewActive,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    categoryOptions,
    optionsPuc,
    handleInsertProduct,
    handleStartEdit,
    handleToggleActive,
    resetForm,
  };
}