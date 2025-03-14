import React from "react";
import styles from "./sqlquerydisplay.module.css";

const SQLQueryDisplay = ({ sqlQuery }) => {
  return (
    <div className={styles.container}>
      <h3>Last Executed SQL Query</h3>
      <pre className={styles.query}>{sqlQuery}</pre>
    </div>
  );
};

export default SQLQueryDisplay;
