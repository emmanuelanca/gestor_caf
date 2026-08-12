import React from 'react';
import Select from 'react-select';

export default function ProductPanel({ productData }) {
  return (
    <div className="vista-panel">
      <div
        className="row"
        style={{ marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h3 style={{ margin: 0 }}>Productos</h3>
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
          Agregar
        </button>
      </form>

      <div className="table-wrap">
        <table className="vista-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Subcategoría</th>
            </tr>
          </thead>
          <tbody>
            {productData.productList.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <strong>{item.nombre}</strong>
                </td>
                <td>{item.categoria || '-'}</td>
                <td>{item.subcategoria || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}