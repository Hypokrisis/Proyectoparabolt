// Tabla simple para mostrar los usuarios
const Table = ({ data, columns, emptyMessage }) => {
  if (!data || data.length === 0) {
    return <div style={{padding:'2rem',textAlign:'center'}}>{emptyMessage || 'No hay datos'}</div>;
  }
  return (
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.header} style={{borderBottom:'1px solid #ccc',padding:'0.5rem',textAlign:'left'}}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.header} style={{padding:'0.5rem',borderBottom:'1px solid #eee'}}>
                {col.cell ? col.cell(row[col.accessor], row) : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default Table;
