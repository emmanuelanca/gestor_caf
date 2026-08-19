import { useState, useEffect, useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useSupply() {
  const [supplyList, setSupplyList] = useState([]);
  const [allPuc, setAllPuc] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newObservations, setNewObservations] = useState('');
  const [newPucId, setNewPucId] = useState('');
  const [newActive, setNewActive] = useState(true);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Obtener todos los insumos
  const fetchSupplies = async () => {
    try {
      const response = await fetch(`${API_URL}/api/supply`);

      const data = await response.json();

      setSupplyList(data);
    } catch (error) {
      console.error('Error fetching supplies: ', error);
    }
  };

  // Obtener todas las cuentas PUC
  const fetchAllPuc = async () => {
    try {
      const response = await fetch(`${API_URL}/api/puc`);

      const data = await response.json();

      setAllPuc(data);
    } catch (error) {
      console.error('Error fetching all PUC: ', error);
    }
  };

  // Limpiar formulario
  const resetForm = () => {
    setEditingId(null);
    setNewName('');
    setNewCategory('');
    setNewUnit('');
    setNewObservations('');
    setNewPucId('');
    setNewActive(true);
  };

  // Comenzar a editar un insumo
  const handleStartEdit = (item) => {
    setEditingId(item.id);

    setNewName(item.nombre || '');
    setNewCategory(item.categoria || '');
    setNewUnit(item.unidad_medida || '');
    setNewObservations(item.observaciones || '');

    setNewPucId(
      item.puc_id
        ? item.puc_id.toString()
        : ''
    );

    setNewActive(item.activo === 1);
  };

  // Guardar o crear un insumo
  const handleInsertSupply = async (e) => {
    if (e) e.preventDefault();

    try {
      if (!newName.trim()) {
        alert('El nombre del insumo es obligatorio');
        return;
      }

      if (!newCategory.trim()) {
        alert('La categoría del insumo es obligatoria');
        return;
      }

      if (!newUnit.trim()) {
        alert('La unidad de medida es obligatoria');
        return;
      }

      if (!newPucId) {
        alert('La cuenta PUC es obligatoria');
        return;
      }

      const payload = {
        name: newName.trim(),
        category: newCategory.trim(),
        unit: newUnit.trim(),
        observations: newObservations.trim() || null,
        pucId: parseInt(newPucId),
        active: newActive ? 1 : 0,
      };

      const endpoint = editingId
        ? `${API_URL}/api/supply/${editingId}`
        : `${API_URL}/api/supply`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();

        alert(`Error: ${error.error}`);

        return;
      }

      await fetchSupplies();

      resetForm();

    } catch (error) {
      console.error('Error saving supply: ', error);

      alert('Error al guardar el insumo');
    }
  };

  // Activar o desactivar un insumo
  const handleToggleActive = async (item) => {
    try {
      const payload = {
        name: item.nombre,
        category: item.categoria,
        unit: item.unidad_medida,
        observations: item.observaciones,
        pucId: item.puc_id,
        active: item.activo === 1 ? 0 : 1,
      };

      const response = await fetch(
        `${API_URL}/api/supply/${item.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();

        alert(`Error: ${error.error}`);

        return;
      }

      await fetchSupplies();

    } catch (error) {
      console.error(
        'Error toggling supply active state: ',
        error
      );

      alert('Error al cambiar el estado del insumo');
    }
  };

  // Cargar datos cuando se abre el panel
  useEffect(() => {
    fetchSupplies();
    fetchAllPuc();
  }, []);

  // Convertir los PUC al formato que necesita react-select
  const optionsPuc = allPuc.map((p) => ({
    value: p.id,
    label: `[${p.codigo || '-'}] ${p.nombre}`,
  }));

  // Crear opciones únicas de categorías
  const categoryOptions = useMemo(() => {
    const categories = supplyList
      .map((supply) => supply.categoria)
      .filter(
        (category) =>
          category &&
          category.trim() !== ''
      );

    const uniqueCategories = Array.from(
      new Set(categories)
    );

    return uniqueCategories.map((category) => ({
      value: category,
      label: category,
    }));
  }, [supplyList]);

  // Filtrar insumos por categoría
  const filteredSupplyList = useMemo(() => {
    if (!selectedCategoryFilter) {
      return supplyList;
    }

    return supplyList.filter(
      (supply) =>
        supply.categoria === selectedCategoryFilter
    );
  }, [supplyList, selectedCategoryFilter]);

  return {
    supplyList: filteredSupplyList,

    allPuc,

    editingId,

    newName,
    setNewName,

    newCategory,
    setNewCategory,

    newUnit,
    setNewUnit,

    newObservations,
    setNewObservations,

    newPucId,
    setNewPucId,

    newActive,
    setNewActive,

    selectedCategoryFilter,
    setSelectedCategoryFilter,

    categoryOptions,
    optionsPuc,

    handleInsertSupply,
    handleStartEdit,
    handleToggleActive,

    resetForm,
  };
}