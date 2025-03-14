import React, { useState } from "react";
import { modifyTable } from "../../api";
import styles from "./ModifyTableStructure.module.css";

const ModifyTableStructure = ({ selectedTable, setError, setSqlQuery, refreshData }) => {
  const [modifyColumns, setModifyColumns] = useState({
    add: [{ column_name: "", column_type: "" }],
    drop: [""],
    modify: [{ column_name: "", column_type: "" }]
  });

  const handleModifyTable = async () => {
    if (!selectedTable) return;
    let queries = [];
    modifyColumns.add.forEach((col) => {
      if (col.column_name && col.column_type) {
        queries.push(
          `ALTER TABLE ${selectedTable} ADD COLUMN ${col.column_name} ${col.column_type}`
        );
      }
    });
    modifyColumns.drop.forEach((col) => {
      if (col) {
        queries.push(`ALTER TABLE ${selectedTable} DROP COLUMN ${col}`);
      }
    });
    modifyColumns.modify.forEach((col) => {
      if (col.column_name && col.column_type) {
        queries.push(
          `ALTER TABLE ${selectedTable} ALTER COLUMN ${col.column_name} TYPE ${col.column_type} USING ${col.column_name}::${col.column_type}`
        );
      }
    });
    const query = queries.join(";\n") + (queries.length > 0 ? ";" : "");
    setSqlQuery(query);
    const payload = {
      add_columns: modifyColumns.add.filter(
        (c) => c.column_name && c.column_type
      ),
      drop_columns: modifyColumns.drop.filter((c) => c),
      modify_columns: modifyColumns.modify.filter(
        (c) => c.column_name && c.column_type
      )
    };
    try {
      setError("");
      await modifyTable(selectedTable, payload);
      if (refreshData) refreshData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.modifyTableContainer}>
      <h3>Modify Table Structure</h3>
      
      <div className={styles.section}>
        <h4>Add Columns</h4>
        {modifyColumns.add.map((col, index) => (
          <div key={index} className={styles.inputGroup}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Column Name"
              value={col.column_name}
              onChange={(e) => {
                const newAdd = [...modifyColumns.add];
                newAdd[index].column_name = e.target.value;
                setModifyColumns({ ...modifyColumns, add: newAdd });
              }}
            />
            <input
              type="text"
              className={styles.inputField}
              placeholder="Column Type"
              value={col.column_type}
              onChange={(e) => {
                const newAdd = [...modifyColumns.add];
                newAdd[index].column_type = e.target.value;
                setModifyColumns({ ...modifyColumns, add: newAdd });
              }}
            />
          </div>
        ))}
        <button
          className={styles.addButton}
          onClick={() =>
            setModifyColumns({
              ...modifyColumns,
              add: [...modifyColumns.add, { column_name: "", column_type: "" }]
            })
          }
        >
          Add Another Column
        </button>
      </div>

      <div className={styles.section}>
        <h4>Drop Columns</h4>
        {modifyColumns.drop.map((col, index) => (
          <div key={index} className={styles.inputGroup}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Column Name to Drop"
              value={col}
              onChange={(e) => {
                const newDrop = [...modifyColumns.drop];
                newDrop[index] = e.target.value;
                setModifyColumns({ ...modifyColumns, drop: newDrop });
              }}
            />
          </div>
        ))}
        <button
          className={styles.addButton}
          onClick={() =>
            setModifyColumns({
              ...modifyColumns,
              drop: [...modifyColumns.drop, ""]
            })
          }
        >
          Add Another Column to Drop
        </button>
      </div>

      <div className={styles.section}>
        <h4>Modify Columns</h4>
        {modifyColumns.modify.map((col, index) => (
          <div key={index} className={styles.inputGroup}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Column Name"
              value={col.column_name}
              onChange={(e) => {
                const newModify = [...modifyColumns.modify];
                newModify[index].column_name = e.target.value;
                setModifyColumns({ ...modifyColumns, modify: newModify });
              }}
            />
            <input
              type="text"
              className={styles.inputField}
              placeholder="New Column Type"
              value={col.column_type}
              onChange={(e) => {
                const newModify = [...modifyColumns.modify];
                newModify[index].column_type = e.target.value;
                setModifyColumns({ ...modifyColumns, modify: newModify });
              }}
            />
          </div>
        ))}
        <button
          className={styles.addButton}
          onClick={() =>
            setModifyColumns({
              ...modifyColumns,
              modify: [...modifyColumns.modify, { column_name: "", column_type: "" }]
            })
          }
        >
          Add Another Column to Modify
        </button>
      </div>

      <button className={styles.applyButton} onClick={handleModifyTable}>
        Apply Table Modifications
      </button>
    </div>
  );
};

export default ModifyTableStructure;
