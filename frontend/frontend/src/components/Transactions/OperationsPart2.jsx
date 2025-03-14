// File: src/components/OperationsPart2.jsx
import React from "react";
import styles from "./operationspart2.module.css";

const OperationsPart2 = ({
  transactionId,
  setTransactionId,
  channelName,
  setChannelName,
  notifyMessage,
  setNotifyMessage,
  advisoryKey,
  setAdvisoryKey,
  prepareTransaction,
  commitPrepared,
  rollbackPrepared,
  listenChannel,
  notifyChannel,
  unlistenChannel,
  advisoryLockOp,
  advisoryUnlockOp,
  advisoryXactLockOp,
  advisoryUnlockAllOp,
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Operations Part 2</h2>

      {/* Prepared Transactions */}
      <div className={styles.section}>
        <h3 className={styles.subheading}>Prepared Transactions (Two-Phase Commit)</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.input}
            placeholder="Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
          <button className={styles.button} onClick={prepareTransaction}>PREPARE TRANSACTION</button>
          <button className={styles.button} onClick={commitPrepared}>COMMIT PREPARED</button>
          <button className={styles.button} onClick={rollbackPrepared}>ROLLBACK PREPARED</button>
        </div>
      </div>

      {/* Event Triggers & Notifications */}
      <div className={styles.section}>
        <h3 className={styles.subheading}>Event Triggers &amp; Notifications</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.input}
            placeholder="Channel Name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
          <input
            type="text"
            className={styles.input}
            placeholder="Notification Message"
            value={notifyMessage}
            onChange={(e) => setNotifyMessage(e.target.value)}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={listenChannel}>LISTEN</button>
          <button className={styles.button} onClick={notifyChannel}>NOTIFY</button>
          <button className={styles.button} onClick={unlistenChannel}>UNLISTEN</button>
        </div>
      </div>

      {/* Advisory Locks */}
      <div className={styles.section}>
        <h3 className={styles.subheading}>Advisory Locks</h3>
        <div className={styles.inputGroup}>
          <input
            type="number"
            className={styles.input}
            placeholder="Advisory Key"
            value={advisoryKey}
            onChange={(e) => setAdvisoryKey(e.target.value)}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={advisoryLockOp}>pg_advisory_lock</button>
          <button className={styles.button} onClick={advisoryUnlockOp}>pg_advisory_unlock</button>
          <button className={styles.button} onClick={advisoryXactLockOp}>pg_advisory_xact_lock</button>
          <button className={styles.button} onClick={advisoryUnlockAllOp}>pg_advisory_unlock_all</button>
        </div>
      </div>
    </div>
  );
};

export default OperationsPart2;
