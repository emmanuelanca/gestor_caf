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
                  {formatCurrency(item.balance_consolidado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
