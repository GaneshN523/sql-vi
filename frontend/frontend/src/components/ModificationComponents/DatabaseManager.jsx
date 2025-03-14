import React, { useState, useEffect } from "react";
import { fetchTables, fetchTableData } from "../../api";
import TableOperations from "./TableOperations";
import ModifyTableStructure from "./ModifyTableStructure";
import DataGrid from "./DataGrid";
import SQLQueryDisplay from "./SQLQueryDisplay";
import styles from "./databasemanager.module.css";

const DatabaseManager = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [sqlQuery, setSqlQuery] = useState("");
  const [error, setError] = useState("");

  // Load list of tables on mount
  useEffect(() => {
    const loadTables = async () => {
      try {
        setError("");
        const tableList = await fetchTables();
        setTables(tableList);
      } catch (err) {
        setError(err.message);
      }
    };
    loadTables();
  }, []);

  // When a table is selected, fetch its data
  useEffect(() => {
    if (selectedTable) {
      const loadTableData = async () => {
        try {
          setError("");
          const data = await fetchTableData(selectedTable);
          setTableData(data);
          if (data.length > 0) {
            setTableColumns(Object.keys(data[0]));
          } else {
            setTableColumns([]);
          }
        } catch (err) {
          setError(err.message);
        }
      };

      loadTableData();
    } else {
      setTableData([]);
      setTableColumns([]);
    }
  }, [selectedTable]);

  return (
    <div className={styles.container}>
      <h2>Database Manager</h2>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <TableOperations
        tables={tables}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        setTables={setTables}
        setError={setError}
        setSqlQuery={setSqlQuery}
      />

      {selectedTable && (
        <ModifyTableStructure
          selectedTable={selectedTable}
          setError={setError}
          setSqlQuery={setSqlQuery}
          refreshData={() => {
            // You can add additional logic here to refresh data if needed.
          }}
        />
      )}

      {selectedTable && (
        <DataGrid
          selectedTable={selectedTable}
          tableData={tableData}
          tableColumns={tableColumns}
          setTableData={setTableData}
          setSqlQuery={setSqlQuery}
          setError={setError}
        />
      )}

      <SQLQueryDisplay sqlQuery={sqlQuery} />
    </div>
  );
};

export default DatabaseManager;
