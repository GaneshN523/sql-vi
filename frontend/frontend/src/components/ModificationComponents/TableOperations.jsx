import React, { useState } from "react";
import { createTable, deleteTable, fetchTables } from "../../api";
import styles from "./tableoperations.module.css";

const TableOperations = ({
  tables,
  selectedTable,
  setSelectedTable,
  setTables,
  setError,
  setSqlQuery,
}) => {
  const [newTableName, setNewTableName] = useState("");

  const handleCreateTable = async () => {
    if (!newTableName) return;
    const query = `CREATE TABLE ${newTableName} (id INTEGER PRIMARY KEY, name VARCHAR(255));`;
    setSqlQuery(query);
    try {
      setError("");
      await createTable(newTableName);
      const updatedTables = await fetchTables();
      setTables(updatedTables);
      setNewTableName("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    const query = `DROP TABLE ${selectedTable};`;
    setSqlQuery(query);
    try {
      setError("");
      await deleteTable(selectedTable);
      setSelectedTable("");
      const updatedTables = await fetchTables();
      setTables(updatedTables);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Table Operations</h3>
      <div className={styles.createTable}>
        <label>Create Table: </label>
        <input
          type="text"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="Enter new table name"
        />
        <button onClick={handleCreateTable}>Create Table</button>
      </div>
      <div className={styles.selectTable}>
        <label>Select Table: </label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="">--Select Table--</option>
          {tables.map((table, idx) => (
            <option key={idx} value={table}>
              {table}
            </option>
          ))}
        </select>
      </div>
      {selectedTable && (
        <div className={styles.deleteTable}>
          <button onClick={handleDeleteTable}>Delete Table</button>
        </div>
      )}
    </div>
  );
};

export default TableOperations;
