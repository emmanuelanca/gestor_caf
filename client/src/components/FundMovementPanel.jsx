import Select from 'react-select';

export default function FundMovementPanel({ fundMovementData }) {
  const isNegative = fundMovementData.totalBalance < 0;
  return (
    <div className="vista-panel">
      <div style={{
        background: '#f8f9fa',
        padding: '15px 20px',
        borderRadius: '6px',
        marginBottom: '20px',
        borderLeft: `5px solid ${isNegative ? '#e74c3c' : '#2ecc71'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <span style={{ fontWeight: '6px', color: '#555', fontSize: '16px' }}>Balance:</span>
        <span style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: isNegative ? '#e74c3c' : '#2ecc71'
        }}>
          {isNegative ? '-' : ''}${Math.abs(fundMovementData.totalBalance).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="table-wrap">
        <table className="vista-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Cuenta Fondos</th>
              <th>Monto</th>
              <th>N° Comprobante</th>
              <th>N° Comprobante Referencia</th>
            </tr>
          </thead>
          <tbody>
            {fundMovementData.fundMovement.map((item) => (
              <tr key={item.id}>
                <td style={{ color: item.factor === 1 ? 'green' : 'red' }}>
                  {item.factor === 1 ? 'Ingreso' : 'Egreso'}
                </td>
                <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}</td>
                <td>{item.cuentas_fondos_nombre || '-'}</td>
                <td>${item.monto}</td>
                <td>{item.comprobante_numero || '-'}</td>
                <td>{item.comprobante_referencia_numero || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
