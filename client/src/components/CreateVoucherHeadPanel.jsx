import Select from 'react-select';

export default function CreateVoucherHeadPanel({ voucherHeadData }) {
  return (
    <div className="vista-panel">
      <h3>Crear Cabecera de Comprobante</h3>
      <form onSubmit={voucherHeadData.handleInsertVoucherHead} className="row" style={{ marginBottom: 12 }}>

        <div className="vista-input">
          <Select
            placeholder="Seleccionar Tipo..."
            value={voucherHeadData.optionsType.find(o => o.value === voucherHeadData.newType) || null}
            onChange={(e) => voucherHeadData.setNewType(e ? e.value : "")}
            options={voucherHeadData.optionsType}
            isClearable
            required
          />
        </div>

        <input
          className="vista-input"
          placeholder="Número de comprobante"
          value={voucherHeadData.newNumber}
          onChange={(e) => voucherHeadData.setNewNumber(e.target.value)}
          type="text"
          required
        />

        <input
          className="vista-input"
          placeholder="Fecha"
          value={voucherHeadData.newDate}
          onChange={(e) => voucherHeadData.setNewDate(e.target.value)}
          type="date"
          required
        />

        <div className="vista-input">
          <Select
            placeholder="Seleccionar Proveedor"
            value={voucherHeadData.optionsProvider.find(o => o.value === voucherHeadData.newProvider) || null}
            onChange={(e) => voucherHeadData.setNewProvider(e ? e.value : "")}
            options={voucherHeadData.optionsProvider}
            isClearable
          />
        </div>

        <button className="vista-button primary" type="submit">
          Crear Cabecera
        </button>
      </form>
    </div>
  );
}
