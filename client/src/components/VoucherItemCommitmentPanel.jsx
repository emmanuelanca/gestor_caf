import Select from 'react-select';

export default function VoucherItemCommitmentPanel({ data }) {
  const isPaid = data.selectedHead?.esta_pagado === 1;
  const isCanceled = data.selectedHead?.anulado === 1;
  const disableEdition = isPaid || isCanceled;

  return (
    <div className="vista-panel">
      <h3>Detalle de Comprobante</h3>

      <div className="row" style={{ marginBottom: 12 }}>
        <div className="vista-input">
          <Select
            placeholder="Cabecera comprobante"
            value={data.headOptions.find(o => o.value === Number(data.selectedHeadId)) || null}
            onChange={(e) => data.setSelectedHeadId(e ? e.value : '')}
            options={data.headOptions}
            isClearable
          />
        </div>
      </div>

      {data.selectedHead && (
        <>
          <div className="row" style={{ marginBottom: 12 }}>
            <div className="vista-input">
              <Select
                placeholder="Producto"
                value={data.productOptions.find(o => o.value === Number(data.newProductId)) || null}
                onChange={(e) => data.setNewProductId(e ? e.value : '')}
                options={data.productOptions}
                isClearable
                isDisabled={disableEdition}
              />
            </div>

            <input
              className="vista-input"
              type="number"
              min="1"
              placeholder="Cantidad"
              value={data.newQuantity}
              onChange={(e) => data.setNewQuantity(e.target.value)}
              disabled={disableEdition}
            />

            <input
              className="vista-input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Monto unitario"
              value={data.newUnitAmount}
              onChange={(e) => data.setNewUnitAmount(e.target.value)}
              disabled={disableEdition}
            />

            <button className="vista-button primary" type="button" onClick={data.addItem} disabled={disableEdition}>
              Agregar
            </button>

            <button
              className="vista-button"
              type="button"
              onClick={data.generateCommitment}
              disabled={disableEdition || data.selectedHead.tiene_compromiso === 1}
            >
              {data.selectedHead.tiene_compromiso === 1 ? 'Compromiso generado' : 'Generar compromiso'}
            </button>
          </div>

          <div className="table-wrap" style={{ marginBottom: 20 }}>
            <table className="vista-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Monto unitario</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.producto_nombre || '-'}</td>
                    <td>
                      <input
                        className="vista-input"
                        type="number"
                        min="1"
                        value={item.unidades}
                        onChange={(e) => data.updateItemField(item.id, 'unidades', e.target.value)}
                        disabled={disableEdition}
                      />
                    </td>
                    <td>
                      <input
                        className="vista-input"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.monto_unidad}
                        onChange={(e) => data.updateItemField(item.id, 'monto_unidad', e.target.value)}
                        disabled={disableEdition}
                      />
                    </td>
                    <td>${Number(item.unidades * item.monto_unidad).toFixed(2)}</td>
                    <td>
                      <button className="vista-button" type="button" onClick={() => data.saveItem(item)} disabled={disableEdition}>
                        Guardar
                      </button>
                      <button className="vista-button" type="button" onClick={() => data.deleteItem(item.id)} disabled={disableEdition}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5}>Sin ítems cargados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3>Comprobantes de compra</h3>
      <div className="table-wrap">
        <table className="vista-table">
          <thead>
            <tr>
              <th>Nro. comprobante</th>
              <th>Fecha</th>
              <th>Monto total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.heads.map((h) => {
              const disableDelete = h.esta_pagado === 1 || h.anulado === 1;
              return (
                <tr key={h.id} style={{ opacity: h.anulado ? 0.5 : 1 }}>
                  <td>{h.numero}</td>
                  <td>{h.fecha_emision ? new Date(h.fecha_emision).toLocaleDateString() : '-'}</td>
                  <td>${Number(h.monto_total || 0).toFixed(2)}</td>
                  <td>
                    <button
                      className="vista-button"
                      type="button"
                      disabled={disableDelete}
                      onClick={() => data.cancelHead(h.id)}
                    >
                      {h.anulado ? 'Anulado' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}