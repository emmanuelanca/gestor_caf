import Select from 'react-select';

export default function FundMovementPanel({ fundMovementData }) {
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

      <div className="table-wrap">
        <table className="vista-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cuenta Fondos</th>
              <th>Monto</th>
              <th>Ref. Compromiso</th>
              <th>N° Comprobante</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fundMovementData.fundMovement.map((item) => (
              <tr key={item.id}>
                <td>{item.fechas_fecha ? new Date(item.fechas_fecha).toLocaleDateString() : '-'}</td>
                <td>{item.cuentas_fondos_nombre || '-'}</td>
                <td>${item.monto}</td>
                <td>{item.compromiso_referencia_numero || '-'}</td>
                <td>{item.comprobante_numero || '-'}</td>
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
