import React from 'react';
import Select from 'react-select';

export default function SupplyPanel({ supplyData }) {
  return (
    <div className="vista-panel">

      <div
        className="row"
        style={{
          marginBottom: 12,
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h3 style={{ margin: 0 }}>
          {supplyData.editingId ? 'Editar Insumo' : 'Insumos'}
        </h3>
      </div>

      <form
        onSubmit={supplyData.handleInsertSupply}
        className="row"
        style={{ marginBottom: 12 }}
      >

        {/* Nombre */}
        <input
          className="vista-input"
          placeholder="Nombre del Insumo"
          value={supplyData.newName}
          onChange={(e) =>
            supplyData.setNewName(e.target.value)
          }
          type="text"
        />

        {/* Categoría */}
        <input
          className="vista-input"
          placeholder="Categoría"
          value={supplyData.newCategory}
          onChange={(e) =>
            supplyData.setNewCategory(e.target.value)
          }
          type="text"
        />

        {/* Unidad de medida */}
        <input
          className="vista-input"
          placeholder="Unidad de medida"
          value={supplyData.newUnit}
          onChange={(e) =>
            supplyData.setNewUnit(e.target.value)
          }
          type="text"
        />

        {/* Observaciones */}
        <input
          className="vista-input"
          placeholder="Observaciones"
          value={supplyData.newObservations}
          onChange={(e) =>
            supplyData.setNewObservations(e.target.value)
          }
          type="text"
        />

        {/* PUC */}
        <div className="vista-input">
          <Select
            placeholder="PUC"
            value={
              supplyData.optionsPuc.find(
                (o) =>
                  o.value ===
                  parseInt(supplyData.newPucId)
              ) || null
            }
            onChange={(e) =>
              supplyData.setNewPucId(
                e ? e.value : ''
              )
            }
            options={supplyData.optionsPuc}
            isClearable
          />
        </div>

        {/* Botón guardar */}
        <button
          className="vista-button primary"
          type="submit"
        >
          {supplyData.editingId
            ? 'Guardar'
            : 'Agregar'}
        </button>

        {/* Botón cancelar */}
        {supplyData.editingId && (
          <button
            className="vista-button"
            type="button"
            onClick={supplyData.resetForm}
          >
            Cancelar
          </button>
        )}

      </form>

      {/* Filtro por categoría */}
      <div
        className="row"
        style={{
          marginBottom: 12,
          alignItems: 'center',
          gap: '10px'
        }}
      >

        <div
          className="vista-input"
          style={{ maxWidth: '300px' }}
        >

          <Select
            placeholder="Filtrar por categoría..."
            value={
              supplyData.categoryOptions.find(
                (o) =>
                  o.value ===
                  supplyData.selectedCategoryFilter
              ) || null
            }
            onChange={(e) =>
              supplyData.setSelectedCategoryFilter(
                e ? e.value : ''
              )
            }
            options={supplyData.categoryOptions}
            isClearable
          />

        </div>

      </div>

      {/* Tabla */}
      <div className="table-wrap">

        <table className="vista-table">

          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Unidad de medida</th>
              <th>Observaciones</th>
              <th>PUC</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {supplyData.supplyList.map((item) => (

              <tr key={item.id}>

                <td>
                  <strong>
                    {item.nombre}
                  </strong>
                </td>

                <td>
                  {item.categoria || '-'}
                </td>

                <td>
                  {item.unidad_medida || '-'}
                </td>

                <td>
                  {item.observaciones || '-'}
                </td>

                <td>
                  {item.puc_nombre || '-'}
                </td>

                <td>

                  <span
                    style={{
                      color:
                        item.activo === 1
                          ? '#27ae60'
                          : '#e74c3c',
                      fontWeight: 'bold'
                    }}
                  >
                    {item.activo === 1
                      ? 'Activo'
                      : 'Inactivo'}
                  </span>

                </td>

                <td>

                  <div
                    style={{
                      display: 'flex',
                      gap: '6px'
                    }}
                  >

                    <button
                      className="vista-button"
                      type="button"
                      onClick={() =>
                        supplyData.handleStartEdit(item)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="vista-button"
                      type="button"
                      onClick={() =>
                        supplyData.handleToggleActive(item)
                      }
                    >
                      {item.activo === 1
                        ? 'Desactivar'
                        : 'Activar'}
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