import Select from 'react-select';

export default function IncomePanel({ incomeData }) {
  return (
    <div className="vista-panel">
      <form onSubmit={incomeData.handleInsertIncome} className="row" style={{ marginBottom: 12 }}>
        <input className="vista-input"
          placeholder="Fecha"
          value={incomeData.newDate}
          onChange={(e) => incomeData.setNewDate(e.target.value)}
          type="date"
        />
        <input className="vista-input"
          placeholder="Monto"
          value={incomeData.newAmount}
          onChange={(e) => incomeData.setNewAmount(e.target.value)}
          inputMode="decimal"
        />
        <div className="vista-input">
          <Select
            placeholder="Cuenta de fondos"
            value={incomeData.optionsFundAccount.find(o => o.value === incomeData.newFundAccount) || null}
            onChange={(e) => incomeData.setNewFundAccount(e ? e.value : "")}
            options={incomeData.optionsFundAccount}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="Socio aportante"
            value={incomeData.optionsMember.find(o => o.value === incomeData.newMember) || null}
            onChange={(e) => incomeData.setNewMember(e ? e.value : "")}
            options={incomeData.optionsMember}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="Afectación"
            value={incomeData.optionsAllocation.find(o => o.value === incomeData.newAllocation) || null}
            onChange={(e) => incomeData.setNewAllocation(e ? e.value : "")}
            options={incomeData.optionsAllocation}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="Evento"
            value={incomeData.optionsEvent.find(o => o.value === incomeData.newEvent) || null}
            onChange={(e) => incomeData.setNewEvent(e ? e.value : "")}
            options={incomeData.optionsEvent}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="Entrada"
            value={incomeData.optionsTicket.find(o => o.value === incomeData.newTicket) || null}
            onChange={(e) => incomeData.setNewTicket(e ? e.value : "")}
            options={incomeData.optionsTicket}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="Producto"
            value={incomeData.optionsProduct.find(o => o.value === incomeData.newProduct) || null}
            onChange={(e) => incomeData.setNewProduct(e ? e.value : "")}
            options={incomeData.optionsProduct}
            isClearable
          />
        </div>
        <div className="vista-input">
          <Select
            placeholder="Cuenta PUC (obligatorio)"
            value={incomeData.optionsPuc.find(o => o.value === parseInt(incomeData.newPuc)) || null}
            onChange={(e) => incomeData.setNewPuc(e ? e.value : "")}
            options={incomeData.optionsPuc}
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
              <th>Socio</th>
              <th>Afectación</th>
              <th>Entrada</th>
              <th>Evento</th>
              <th>Producto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incomeData.income.map((item) => (
              <tr key={item.id}>
                <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}</td>
                <td>{item.cuenta_fondos}</td>
                <td>${item.monto}</td>
                <td>
                  {item.socio_apellido && item.socio_nombre
                    ? `${item.socio_apellido}, ${item.socio_nombre}`
                    : '-'}
                </td>
                <td>{item.afectacion_ingreso || '-'}</td>
                <td>{item.entrada_categoria || '-'}</td>
                <td>{item.evento_nombre || '-'}</td>
                <td>{item.producto_nombre || '-'}</td>
                <td>
                  <button
                    onClick={() => incomeData.handleDeleteIncome(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      fontSize: '18px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      padding: '0 5px'
                    }}
                    title="Eliminar ingreso"
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
