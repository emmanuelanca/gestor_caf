import Select from 'react-select';

export default function FundMovementPanel({ fundMovementData }) {
  const isNegative = fundMovementData.totalBalance < 0;
  return (
    <div className="vista-panel">
      <form onSubmit={fundMovementData.handleInsertFundMovement} className="row" style={{ marginBottom: 12 }}>
        <input className="vista-input"
          placeholder="Fecha"
          value={fundMovementData.newDate}
          onChange={(e) => fundMovementData.setNewDate(e.target.value)}
          type="date"
        />
        <input className="vista-input"
          placeholder="Monto"
          value={fundMovementData.newAmount}
          onChange={(e) => fundMovementData.setNewAmount(e.target.value)}
          inputMode="decimal"
        />
        <div className="vista-input">
          <Select
            placeholder="Cuenta de fondos"
            value={fundMovementData.optionsFundAccount.find(o => o.value === fundMovementData.newFundAccount) || null}
            onChange={(e) => fundMovementData.setNewFundAccount(e ? e.value : "")}
            options={fundMovementData.optionsFundAccount}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="Compromiso"
            value={fundMovementData.optionsCommitment.find(o => o.value === fundMovementData.newCommitment) || null}
            onChange={(e) => fundMovementData.setNewCommitment(e ? e.value : "")}
            options={fundMovementData.optionsCommitment}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="Ingreso"
            value={fundMovementData.optionsIncome.find(o => o.value === fundMovementData.newIncome) || null}
            onChange={(e) => fundMovementData.setNewIncome(e ? e.value : "")}
            options={fundMovementData.optionsIncome}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="Comprobante"
            value={fundMovementData.optionsVoucher.find(o => o.value === fundMovementData.newVoucher) || null}
            onChange={(e) => fundMovementData.setNewVoucher(e ? e.value : "")}
            options={fundMovementData.optionsVoucher}
            isClearable
          />
        </div>
        <button className="vista-button primary" type="submit">
          Agregar
        </button>
      </form>
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
        <span style={{ fontWeight: '6px', color: '#555', fontSize: '16px' }}>Balance Final Acumulado:</span>
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
              <th>Fecha</th>
              <th>Cuenta Fondos</th>
              <th>Monto</th>
              <th>N° Comprobante</th>
              <th>N° Comprobante Referencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fundMovementData.fundMovement.map((item) => (
              <tr key={item.id}>
                <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}</td>
                <td>{item.cuentas_fondos_nombre || '-'}</td>
                <td>${item.monto}</td>
                <td>{item.comprobante_numero || '-'}</td>
                <td>{item.comprobante_referencia_numero || '-'}</td>
                <td>
                  <button
                    onClick={() => fundMovementData.handleDeleteFundMovement(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      fontSize: '18px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      padding: '0 5px'
                    }}
                    title="Eliminar movimiento"
                  >
                    &times;
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
