// src/SelectTable.jsx
import React from "react";
import styles from "./selecttable.module.css";

function SelectTable({ tables, selectedTable, onChange }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.formGroup}>
        <h3 className={styles.label}>Select Table: </h3>
        <select value={selectedTable} onChange={onChange} className={styles.select}>
          <option value="">--Select a table--</option>
          {tables.map((table, index) => (
            <option key={index} value={table}>
              {table}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default SelectTable;
