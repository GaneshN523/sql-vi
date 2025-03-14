// // components/TableSchemaDisplay.jsx
// import React from "react";

// const TableSchemaDisplay = ({ selectedTable, tableSchema }) => {
//   return (
//     <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
//       <h3>Table Schema for: {selectedTable}</h3>
//       {tableSchema && tableSchema.length > 0 ? (
//         <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
//           <thead>
//             <tr>
//               <th>Column Name</th>
//               <th>Data Type</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tableSchema.map((col, index) => (
//               <tr key={index}>
//                 <td>{col.column_name}</td>
//                 <td>{col.data_type}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No schema available for this table.</p>
//       )}
//     </div>
//   );
// };

// export default TableSchemaDisplay;
