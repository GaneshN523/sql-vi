// File: src/TransactionOperations.jsx
import React, { useState } from "react";
import { callApi } from "../../api";
import OperationsPart1 from "./OperationsPart1";
import OperationResult from "./OperationResult";
import OperationsPart2 from "./OperationsPart2";
import styles from "./transactionoperations.module.css";

const TransactionOperations = () => {
  // Global state for API response and all input values.
  const [result, setResult] = useState("");

  // Input states for operations needing parameters:
  const [savepointName, setSavepointName] = useState("");
  const [isolationLevel, setIsolationLevel] = useState("READ COMMITTED");
  const [tableName, setTableName] = useState("");
  const [snapshotId, setSnapshotId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [channelName, setChannelName] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [advisoryKey, setAdvisoryKey] = useState("");

  // State to control which operations component is active.
  // "ops1" for OperationsPart1 and "ops2" for OperationsPart2.
  const [activeOperation, setActiveOperation] = useState("ops1");

  // ------------------------
  // Transaction Control Functions
  // ------------------------
  const beginTransaction = async () => {
    try {
      const data = await callApi("/begin");
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const commitTransaction = async () => {
    try {
      const data = await callApi("/commit");
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const rollbackTransaction = async () => {
    try {
      const data = await callApi("/rollback");
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const createSavepoint = async () => {
    try {
      const data = await callApi("/savepoint", "post", { savepoint_name: savepointName });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const rollbackToSavepoint = async () => {
    try {
      const data = await callApi("/rollback_to_savepoint", "post", { savepoint_name: savepointName });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const releaseSavepoint = async () => {
    try {
      const data = await callApi("/release_savepoint", "post", { savepoint_name: savepointName });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const endTransaction = async () => {
    try {
      const data = await callApi("/end");
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const abortTransaction = async () => {
    try {
      const data = await callApi("/abort");
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  // ------------------------
  // Isolation Level Control Functions
  // ------------------------
  const setTransIsolation = async () => {
    try {
      const data = await callApi("/set_transaction_isolation", "post", { isolation_level: isolationLevel });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const setSessIsolation = async () => {
    try {
      const data = await callApi("/set_session_isolation", "post", { isolation_level: isolationLevel });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  // ------------------------
  // Locking & Concurrency Control Functions
  // ------------------------
  const lockTableOp = async () => {
    try {
      const data = await callApi("/lock_table", "post", { table_name: tableName });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  // ------------------------
  // Snapshot & Visibility Control Functions
  // ------------------------
  const setSnapshot = async () => {
    try {
      const data = await callApi("/set_snapshot", "post", { snapshot_id: snapshotId });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const exportSnapshotOp = async () => {
    try {
      const data = await callApi("/export_snapshot");
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  // ------------------------
  // Prepared Transactions Functions
  // ------------------------
  const prepareTransaction = async () => {
    try {
      const data = await callApi("/prepare_transaction", "post", { transaction_id: transactionId });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const commitPrepared = async () => {
    try {
      const data = await callApi("/commit_prepared", "post", { transaction_id: transactionId });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const rollbackPrepared = async () => {
    try {
      const data = await callApi("/rollback_prepared", "post", { transaction_id: transactionId });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  // ------------------------
  // Event Triggers & Notifications Functions
  // ------------------------
  const listenChannel = async () => {
    try {
      const data = await callApi("/listen", "post", { channel_name: channelName });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const notifyChannel = async () => {
    try {
      const data = await callApi("/notify", "post", { channel_name: channelName, message: notifyMessage });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const unlistenChannel = async () => {
    try {
      const data = await callApi("/unlisten", "post", { channel_name: channelName });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  // ------------------------
  // Advisory Locks Functions
  // ------------------------
  const advisoryLockOp = async () => {
    try {
      const data = await callApi("/advisory_lock", "post", { key: parseInt(advisoryKey, 10) });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const advisoryUnlockOp = async () => {
    try {
      const data = await callApi("/advisory_unlock", "post", { key: parseInt(advisoryKey, 10) });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const advisoryXactLockOp = async () => {
    try {
      const data = await callApi("/advisory_xact_lock", "post", { key: parseInt(advisoryKey, 10) });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  const advisoryUnlockAllOp = async () => {
    try {
      const data = await callApi("/advisory_unlock_all", "post");
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.operationsContainer}>
        <div className={styles.part}>
          {activeOperation === "ops1" ? (
            <OperationsPart1
              savepointName={savepointName}
              setSavepointName={setSavepointName}
              isolationLevel={isolationLevel}
              setIsolationLevel={setIsolationLevel}
              tableName={tableName}
              setTableName={setTableName}
              snapshotId={snapshotId}
              setSnapshotId={setSnapshotId}
              beginTransaction={beginTransaction}
              commitTransaction={commitTransaction}
              rollbackTransaction={rollbackTransaction}
              createSavepoint={createSavepoint}
              rollbackToSavepoint={rollbackToSavepoint}
              releaseSavepoint={releaseSavepoint}
              endTransaction={endTransaction}
              abortTransaction={abortTransaction}
              setTransIsolation={setTransIsolation}
              setSessIsolation={setSessIsolation}
              lockTableOp={lockTableOp}
              setSnapshot={setSnapshot}
              exportSnapshotOp={exportSnapshotOp}
            />
          ) : (
            <OperationsPart2
              transactionId={transactionId}
              setTransactionId={setTransactionId}
              channelName={channelName}
              setChannelName={setChannelName}
              notifyMessage={notifyMessage}
              setNotifyMessage={setNotifyMessage}
              advisoryKey={advisoryKey}
              setAdvisoryKey={setAdvisoryKey}
              prepareTransaction={prepareTransaction}
              commitPrepared={commitPrepared}
              rollbackPrepared={rollbackPrepared}
              listenChannel={listenChannel}
              notifyChannel={notifyChannel}
              unlistenChannel={unlistenChannel}
              advisoryLockOp={advisoryLockOp}
              advisoryUnlockOp={advisoryUnlockOp}
              advisoryXactLockOp={advisoryXactLockOp}
              advisoryUnlockAllOp={advisoryUnlockAllOp}
            />
          )}
        </div>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.buttonContainer}>
          <button
            onClick={() => setActiveOperation("ops1")}
            className={activeOperation === "ops1" ? styles.active : ""}
          >
            TransactionOperations1
          </button>
          <button
            onClick={() => setActiveOperation("ops2")}
            className={activeOperation === "ops2" ? styles.active : ""}
          >
            TransactionOperations2
          </button>
        </div>
        <OperationResult result={result} />
      </div>
    </div>
  );
};

export default TransactionOperations;
