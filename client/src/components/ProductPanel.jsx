import React from 'react';
import Select from 'react-select';

export default function ProductPanel({ productData }) {
  return (
    <div className="vista-panel">
      <div
        className="row"
        style={{ marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h3 style={{ margin: 0 }}>
          {productData.editingId ? 'Editar Producto' : 'Productos'}
        </h3>
      </div>

      <form onSubmit={productData.handleInsertProduct} className="row" style={{ marginBottom: 12 }}>
        <input
          className="vista-input"
          placeholder="Nombre del Producto"
          value={productData.newName}
          onChange={(e) => productData.setNewName(e.target.value)}
          type="text"
        />
        <input
          className="vista-input"
          placeholder="Categoría"
          value={productData.newCategory}
          onChange={(e) => productData.setNewCategory(e.target.value)}
          type="text"
        />
        <input
          className="vista-input"
          placeholder="Subcategoría"
          value={productData.newSubcategory}
          onChange={(e) => productData.setNewSubcategory(e.target.value)}
          type="text"
        />
        <div className="vista-input">
          <Select
            placeholder="PUC Venta"
            value={
              productData.optionsPuc.find((o) => o.value === parseInt(productData.newPucSaleId)) ||
              null
            }
            onChange={(e) => productData.setNewPucSaleId(e ? e.value : '')}
            options={productData.optionsPuc}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="PUC Compra"
            value={
              productData.optionsPuc.find((o) => o.value === parseInt(productData.newPucPurchaseId)) ||
              null
            }
            onChange={(e) => productData.setNewPucPurchaseId(e ? e.value : '')}
            options={productData.optionsPuc}
            isClearable
          />
        </div>
        <button className="vista-button primary" type="submit">
          {productData.editingId ? 'Guardar' : 'Agregar'}
        </button>
        {productData.editingId && (
          <button
            className="vista-button"
            type="button"
            onClick={productData.resetForm}
          >
            Cancelar
          </button>
        )}
      </form>

      <div className="table-wrap">
        <table className="vista-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Subcategoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productData.productList.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.nombre}</strong>
                </td>
                <td>{item.categoria || '-'}</td>
                <td>{item.subcategoria || '-'}</td>
                <td>
                  <span
                    style={{
                      color: item.activo === 1 ? '#27ae60' : '#e74c3c',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.activo === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="vista-button"
                      type="button"
                      onClick={() => productData.handleStartEdit(item)}
                    >
                      Editar
                    </button>
                    <button
                      className="vista-button"
                      type="button"
                      onClick={() => productData.handleToggleActive(item)}
                    >
                      {item.activo === 1 ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}