// File: src/components/OperationsPart1.jsx
import React from "react";
import styles from "./operationspart1.module.css";

const OperationsPart1 = ({
  savepointName,
  setSavepointName,
  isolationLevel,
  setIsolationLevel,
  tableName,
  setTableName,
  snapshotId,
  setSnapshotId,
  // Operation functions
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  createSavepoint,
  rollbackToSavepoint,
  releaseSavepoint,
  endTransaction,
  abortTransaction,
  setTransIsolation,
  setSessIsolation,
  lockTableOp,
  setSnapshot,
  exportSnapshotOp,
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Operations Part 1</h2>

      {/* Transaction Control */}
      <div className={styles.section}>
        <h3 className={styles.subheading}>Transaction Control</h3>
        <div className={styles.buttonGroup}>
          <button onClick={beginTransaction}>BEGIN Transaction</button>
          <button onClick={commitTransaction}>COMMIT Transaction</button>
          <button onClick={rollbackTransaction}>ROLLBACK Transaction</button>
        </div>

        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Savepoint Name"
            value={savepointName}
            onChange={(e) => setSavepointName(e.target.value)}
            className={styles.input}
          />
          <button onClick={createSavepoint}>Create SAVEPOINT</button>
          <button onClick={rollbackToSavepoint}>ROLLBACK TO SAVEPOINT</button>
          <button onClick={releaseSavepoint}>RELEASE SAVEPOINT</button>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={endTransaction}>END Transaction (COMMIT)</button>
          <button onClick={abortTransaction}>ABORT Transaction (ROLLBACK)</button>
        </div>
      </div>

      {/* Isolation Level Control */}
      <div className={styles.section}>
        <h3 className={styles.subheading}>Isolation Level Control</h3>
        <div className={styles.inputGroup}>
          <select
            value={isolationLevel}
            onChange={(e) => setIsolationLevel(e.target.value)}
            className={styles.select}
          >
            <option value="READ UNCOMMITTED">READ UNCOMMITTED</option>
            <option value="READ COMMITTED">READ COMMITTED</option>
            <option value="REPEATABLE READ">REPEATABLE READ</option>
            <option value="SERIALIZABLE">SERIALIZABLE</option>
          </select>
          <button onClick={setTransIsolation}>Set Transaction Isolation</button>
          <button onClick={setSessIsolation}>Set Session Isolation</button>
        </div>
      </div>

      {/* Locking & Concurrency Control */}
      <div className={styles.section}>
        <h3 className={styles.subheading}>Locking & Concurrency Control</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Table Name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className={styles.input}
          />
          <button onClick={lockTableOp}>LOCK TABLE</button>
        </div>
      </div>

      {/* Snapshot & Visibility Control */}
      <div className={styles.section}>
        <h3 className={styles.subheading}>Snapshot & Visibility Control</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Snapshot ID"
            value={snapshotId}
            onChange={(e) => setSnapshotId(e.target.value)}
            className={styles.input}
          />
          <button onClick={setSnapshot}>Set Transaction SNAPSHOT</button>
          <button onClick={exportSnapshotOp}>EXPORT SNAPSHOT</button>
        </div>
      </div>
    </div>
  );
};

export default OperationsPart1;
