import React from "react";
import styles from "./insertrow.module.css";

const InsertRow = ({ selectedTable, newRowText, setNewRowText, handleInsertRowFromText }) => {
  if (!selectedTable) return null;
  
  return (
    <div className={styles.insertRowContainer}>
      <h4 className={styles.insertTitle}>Insert New Row (Raw JSON Format)</h4>
      <textarea
        className={styles.textarea}
        value={newRowText}
        onChange={(e) => setNewRowText(e.target.value)}
        placeholder='{"name": "John", "age": 30}'
        rows="4"
      ></textarea>
      <button className={styles.insertButton} onClick={handleInsertRowFromText}>Insert Row</button>
    </div>
  );
};

export default InsertRow;
