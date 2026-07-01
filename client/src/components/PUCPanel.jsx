import Select from 'react-select';

export default function PUCPanel({ pucData }) {
  const getIndent = (subnivel) => {
    return `${(subnivel - 1) * 20}px`;
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    const num = parseFloat(value);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getBalanceIndicator = (balance) => {
  const numBalance = parseFloat(balance);
  
  if (numBalance > 0) {
    return (
      <span style={{ color: '#27ae60', fontWeight: 'bold', marginRight: '8px' }}>
        +
      </span>
    );
  } else if (numBalance < 0) {
    return (
      <span style={{ color: '#e74c3c', fontWeight: 'bold', marginRight: '8px' }}>
        −
      </span>
    );
  } else {
    return (
      <span style={{ color: '#95a5a6', fontWeight: 'bold', marginRight: '8px' }}>
        ±
      </span>
    );
  }
  };

  return (
    <div className="vista-panel">
      <form onSubmit={pucData.handleInsertPuc} className="row" style={{ marginBottom: 12 }}>
        <input
          className="vista-input"
          placeholder="Nombre del PUC"
          value={pucData.newNombre}
          onChange={(e) => pucData.setNewNombre(e.target.value)}
          type="text"
        />
        <input
          className="vista-input"
          placeholder="Descripción"
          value={pucData.newDescripcion}
          onChange={(e) => pucData.setNewDescripcion(e.target.value)}
          type="text"
        />
        <input
          className="vista-input"
          placeholder="Subnivel"
          value={pucData.newSubnivel}
          onChange={(e) => pucData.setNewSubnivel(e.target.value)}
          type="number"
          min="1"
        />
        <div className="vista-input">
          <Select
            placeholder="PUC Padre (opcional)"
            value={
              pucData.optionsPadre.find((o) => o.value === parseInt(pucData.newPadreId)) ||
              null
            }
            onChange={(e) => pucData.setNewPadreId(e ? e.value : '')}
            options={pucData.optionsPadre}
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
              <th>Cuenta</th>
              <th>Descripción</th>
              <th>Balance Consolidado</th>
            </tr>
          </thead>
          <tbody>
            {pucData.pucBalance.map((item) => (
              <tr key={item.puc_id}>
                <td style={{ paddingLeft: getIndent(item.subnivel) }}>
                  <strong>{item.puc_cuenta}</strong>
                </td>
                <td>{item.puc_descripcion || '-'}</td>
                
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {getBalanceIndicator(item.balance_consolidado)}
                  {formatCurrency(Math.abs(item.balance_consolidado))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
