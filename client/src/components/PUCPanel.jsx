import Select from 'react-select';

export default function PUCPanel({ pucData }) {
  const getIndent = (depth) => {
    return `${(depth - 1) * 20}px`;
  };

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return '-';
    
    const num = parseFloat(balance);
    
    const formatter = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const formattedNumber = formatter.format(Math.abs(num));

    if (num > 0) {
      return (
        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
          +{formattedNumber}
        </span>
      );
    } else if (num < 0) {
      return (
        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
          -{formattedNumber}
        </span>
      );
    } else {
      return (
        <span style={{ color: '#95a5a6', fontWeight: 'bold' }}>
          {formattedNumber}
        </span>
      );
    }
  };

  return (
    <div className="vista-panel">
      <div
        className="row"
        style={{ marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h3 style={{ margin: 0 }}>
          {pucData.balanceType === 'devengado' ? 'PUC — Devengado' : 'PUC — Movimientos (Caja)'}
        </h3>
        <button
          className="vista-button"
          type="button"
          onClick={pucData.toggleBalanceType}
        >
          Ver {pucData.balanceType === 'devengado' ? 'Movimientos' : 'Devengado'}
        </button>
      </div>
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
          type="text"
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
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {pucData.pucBalance.map((item) => (
              <tr key={item.puc_id}>
                <td style={{ paddingLeft: getIndent(item.depth) }}>
                  <span style={{ color: '#7f8c8d', marginRight: '8px', fontWeight: '500' }}>
                    {item.codigo}
                  </span>
                  <strong>{item.puc_cuenta}</strong>
                </td>
                <td>{item.puc_descripcion || '-'}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {formatBalance(item.balance_consolidado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
