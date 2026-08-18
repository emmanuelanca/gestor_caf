import { useState } from 'react';

export default function ProviderPanel({ providerData }) {
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCuit, setEditCuit] = useState('');

  const startEdit = (provider) => {
    setEditingId(provider.id);
    setEditNombre(provider.nombre);
    setEditCuit(provider.cuit);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNombre('');
    setEditCuit('');
  };

  const saveEdit = async (id) => {
    await providerData.handleUpdateProvider(id, {
      nombre: editNombre.trim(),
      cuit: editCuit.trim(),
    });
    cancelEdit();
  };

  return (
    <div className="vista-panel">
      <form onSubmit={providerData.handleInsertProvider} className="row" style={{ marginBottom: 12 }}>
        <input
          className="vista-input"
          placeholder="Nombre del proveedor"
          value={providerData.newNombre}
          onChange={(e) => providerData.setNewNombre(e.target.value)}
          type="text"
        />
        <input
          className="vista-input"
          placeholder="CUIT (XX-XXXXXXXX-X)"
          value={providerData.newCuit}
          onChange={(e) => providerData.setNewCuit(e.target.value)}
          type="text"
        />
        <button className="vista-button primary" type="submit">
          Agregar
        </button>
      </form>

      <div className="table-wrap">
        <table className="vista-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>CUIT</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {providerData.providers.map((item) => (
              <tr key={item.id} style={{ opacity: item.activo ? 1 : 0.5 }}>
                {editingId === item.id ? (
                  <>
                    <td>
                      <input
                        className="vista-input"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="vista-input"
                        value={editCuit}
                        onChange={(e) => setEditCuit(e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!item.activo}
                        onChange={() => providerData.handleToggleActivo(item)}
                      />
                    </td>
                    <td>
                      <button className="vista-button primary" onClick={() => saveEdit(item.id)}>
                        Guardar
                      </button>
                      <button className="vista-button" onClick={cancelEdit}>
                        Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.nombre}</td>
                    <td>{item.cuit}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!item.activo}
                        onChange={() => providerData.handleToggleActivo(item)}
                      />
                    </td>
                    <td>
                      <button className="vista-button" onClick={() => startEdit(item)}>
                        Editar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}