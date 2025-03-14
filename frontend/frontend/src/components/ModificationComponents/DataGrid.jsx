// components/DataGrid.jsx
import React, { useState } from "react";
import styles from "./datagrid.module.css";
import { updateRow, deleteRow, insertRow, fetchTableData } from "../../api";

const DataGrid = ({
  selectedTable,
  tableData,
  tableColumns,
  setTableData,
  setSqlQuery,
  setError
}) => {
  const [newRowText, setNewRowText] = useState("");

  // Handle inline cell changes
  const handleCellChange = (e, rowIndex, column) => {
    const updatedData = [...tableData];
    updatedData[rowIndex][column] = e.target.value;
    setTableData(updatedData);
  };

  // Update a row (excluding the id)
  const handleUpdateRow = async (rowIndex) => {
    const row = tableData[rowIndex];
    if (!selectedTable || !row.id) return;
    const { id, ...newValues } = row;
    const setClause = Object.keys(newValues)
      .map((col) => `${col} = '${newValues[col]}'`)
      .join(", ");
    const query = `UPDATE ${selectedTable} SET ${setClause} WHERE id = ${id};`;
    setSqlQuery(query);
    try {
      setError("");
      await updateRow(selectedTable, id, newValues);
      const updatedData = await fetchTableData(selectedTable);
      setTableData(updatedData);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a row
  const handleDeleteRow = async (rowId) => {
    if (!selectedTable || !rowId) return;
    const query = `DELETE FROM ${selectedTable} WHERE id = ${rowId};`;
    setSqlQuery(query);
    try {
      setError("");
      await deleteRow(selectedTable, rowId);
      const updatedData = await fetchTableData(selectedTable);
      setTableData(updatedData);
    } catch (err) {
      setError(err.message);
    }
  };

  // Insert a new row using JSON input
  const handleInsertRowFromText = async () => {
    if (!selectedTable || !newRowText) return;
    try {
      const rowData = JSON.parse(newRowText);
      const cols = Object.keys(rowData);
      const vals = Object.values(rowData);
      const query = `INSERT INTO ${selectedTable} (${cols.join(
        ", "
      )}) VALUES (${vals.map((v) => `'${v}'`).join(", ")});`;
      setSqlQuery(query);
      setError("");
      await insertRow(selectedTable, rowData);
      const updatedData = await fetchTableData(selectedTable);
      setTableData(updatedData);
      setNewRowText("");
    } catch (err) {
      setError("Error inserting row: " + err.message);
    }
  };

  return (
    <div className={styles.dataGridContainer}>
      <h3 className={styles.title}>Data Grid for Table: {selectedTable}</h3>

      {tableData.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              {tableColumns.map((col, index) => (
                <th key={index} className={styles.tableHeader}>
                  {col}
                </th>
              ))}
              <th className={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className={styles.tableRow}>
                {tableColumns.map((col, colIndex) => (
                  <td key={colIndex} className={styles.tableCell}>
                    <input
                      type="text"
                      className={styles.input}
                      value={row[col] || ""}
                      onChange={(e) => handleCellChange(e, rowIndex, col)}
                    />
                  </td>
                ))}
                <td className={styles.tableCell}>
                  <button
                    className={styles.updateButton}
                    onClick={() => handleUpdateRow(rowIndex)}
                  >
                    Save
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteRow(row.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.noDataText}>No data available for this table.</p>
      )}

      <h4 className={styles.insertTitle}>Insert New Row (Raw JSON Format)</h4>
      <textarea
        value={newRowText}
        onChange={(e) => setNewRowText(e.target.value)}
        placeholder='{"name": "John", "age": 30}'
        className={styles.textarea}
        rows="4"
      ></textarea>
      <button className={styles.insertButton} onClick={handleInsertRowFromText}>
        Insert Row
      </button>
    </div>
  );
};

export default DataGrid;
