export default function PendingCommitmentPanel({ pendingCommitmentData }) {
  return (
    <div className="vista-panel">
      <div className="table-wrap">
        <table className="vista-table">
          <thead>
            <tr>
              <th>Fecha Vencimiento</th>
              <th>Fecha Devengamiento</th>
              <th>Comprobante</th>
              <th>Proveedor</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendingCommitmentData.pendingCommitment.map((item) => (
              <tr key={item.comprobante_id}>
                <td>{item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : '-'}</td>
                <td>{item.fecha_devengamiento ? new Date(item.fecha_devengamiento).toLocaleDateString() : '-'}</td>
                <td>{item.comprobante_tipo} N° {item.comprobante_numero}</td>
                <td>{item.proveedor_nombre || '-'}</td>
                <td>${item.monto}</td>
                <td>
                  <button
                    onClick={() => pendingCommitmentData.handlePayCommitment(item)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2ecc71',
                      fontSize: '18px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      padding: '0 5px'
                    }}
                    title="Pagar compromiso"
                  >
                    ✓
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
