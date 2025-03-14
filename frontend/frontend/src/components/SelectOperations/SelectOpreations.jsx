// src/SelectOperations.jsx
import React, { useState, useEffect } from "react";
import { getTables, executeSelect } from "../../api";
import styles from "./selectoperations.module.css";
import SelectTable from "./SelectTable";

function SelectOperations() {
  // State for tables and the selected table
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");

  // Query parameter states
  const [columns, setColumns] = useState("");
  const [whereConditions, setWhereConditions] = useState([
    { column: "", operator: "=", value: "" },
  ]);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("ASC");
  const [limit, setLimit] = useState("");
  const [offset, setOffset] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [having, setHaving] = useState("");
  const [distinct, setDistinct] = useState(false);

  // For join operations: each join is an object with join_type, join_table, and condition.
  // Default join_type is set to "INNER JOIN".
  const [joinConditions, setJoinConditions] = useState([
    { join_type: "INNER JOIN", join_table: "", condition: "" },
  ]);

  // For aggregate functions: each aggregate is an object with column and function
  const [aggregates, setAggregates] = useState([{ column: "", function: "" }]);

  // To store the results and the executed SQL query
  const [queryResult, setQueryResult] = useState(null);
  const [executedQuery, setExecutedQuery] = useState("");

  // Fetch list of tables when component mounts
  useEffect(() => {
    getTables()
      .then((data) => setTables(data))
      .catch((error) => console.error("Error fetching tables:", error));
  }, []);

  // Auto-fetch data when table selection changes
  useEffect(() => {
    if (selectedTable) {
      // Build payload using current query parameter states.
      const payload = {
        table: selectedTable,
        columns: columns ? columns.split(",").map((col) => col.trim()) : null,
        order_by: orderBy || null,
        order: order || null,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null,
        group_by: groupBy || null,
        having: having || null,
        distinct: distinct,
        join: joinConditions
          .filter((j) => j.join_table && j.condition)
          .map((j) => ({
            join_type: j.join_type,
            join_table: j.join_table,
            condition: j.condition,
          })),
        aggregate: aggregates
          .filter((a) => a.column && a.function)
          .reduce((acc, cur) => {
            acc[cur.column] = cur.function;
            return acc;
          }, {}),
      };

      // Build the "where" object from whereConditions
      if (whereConditions.length > 0) {
        const whereObj = {};
        whereConditions.forEach((cond) => {
          if (cond.column) {
            if (cond.operator && cond.operator !== "=") {
              whereObj[cond.column] = [cond.operator, cond.value];
            } else {
              whereObj[cond.column] = cond.value;
            }
          }
        });
        payload.where = Object.keys(whereObj).length ? whereObj : null;
      }

      executeSelect(payload)
        .then((result) => {
          setQueryResult(result.data);
          setExecutedQuery(result.query);
        })
        .catch((error) =>
          console.error("Error executing query on table selection change:", error)
        );
    } else {
      // Clear data if no table is selected.
      setQueryResult(null);
      setExecutedQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);

  // ----- Handlers for Where Conditions -----
  const handleAddWhereCondition = () => {
    setWhereConditions([...whereConditions, { column: "", operator: "=", value: "" }]);
  };

  const handleRemoveWhereCondition = (index) => {
    const newConditions = [...whereConditions];
    newConditions.splice(index, 1);
    setWhereConditions(newConditions);
  };

  const handleWhereChange = (index, field, value) => {
    const newConditions = [...whereConditions];
    newConditions[index][field] = value;
    setWhereConditions(newConditions);
  };

  // ----- Handlers for Join Operations -----
  const handleAddJoin = () => {
    setJoinConditions([
      ...joinConditions,
      { join_type: "INNER JOIN", join_table: "", condition: "" },
    ]);
  };

  const handleRemoveJoin = (index) => {
    const newJoins = [...joinConditions];
    newJoins.splice(index, 1);
    setJoinConditions(newJoins);
  };

  const handleJoinChange = (index, field, value) => {
    const newJoins = [...joinConditions];
    newJoins[index][field] = value;
    setJoinConditions(newJoins);
  };

  // ----- Handlers for Aggregate Functions -----
  const handleAddAggregate = () => {
    setAggregates([...aggregates, { column: "", function: "" }]);
  };

  const handleRemoveAggregate = (index) => {
    const newAggregates = [...aggregates];
    newAggregates.splice(index, 1);
    setAggregates(newAggregates);
  };

  const handleAggregateChange = (index, field, value) => {
    const newAggregates = [...aggregates];
    newAggregates[index][field] = value;
    setAggregates(newAggregates);
  };

  // ----- Form Submission (Custom Query Execution) -----
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build the payload for the /select endpoint
    let payload = {
      table: selectedTable,
      columns: columns ? columns.split(",").map((col) => col.trim()) : null,
      order_by: orderBy || null,
      order: order || null,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      group_by: groupBy || null,
      having: having || null,
      distinct: distinct,
      join: joinConditions
        .filter((j) => j.join_table && j.condition)
        .map((j) => ({
          join_type: j.join_type,
          join_table: j.join_table,
          condition: j.condition,
        })),
      aggregate: aggregates
        .filter((a) => a.column && a.function)
        .reduce((acc, cur) => {
          acc[cur.column] = cur.function;
          return acc;
        }, {}),
    };

    // Build the "where" object from whereConditions
    if (whereConditions.length > 0) {
      const whereObj = {};
      whereConditions.forEach((cond) => {
        if (cond.column) {
          if (cond.operator && cond.operator !== "=") {
            whereObj[cond.column] = [cond.operator, cond.value];
          } else {
            whereObj[cond.column] = cond.value;
          }
        }
      });
      payload.where = Object.keys(whereObj).length ? whereObj : null;
    }

    // If no aggregates are provided, set to null
    if (payload.aggregate && Object.keys(payload.aggregate).length === 0) {
      payload.aggregate = null;
    }

    try {
      const result = await executeSelect(payload);
      setQueryResult(result.data);
      setExecutedQuery(result.query);
    } catch (error) {
      console.error("Error executing query:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Database Operations</h2>
      <form onSubmit={handleSubmit}>
        {/* Table Selection using the SelectTable component */}
        <SelectTable
          tables={tables}
          selectedTable={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        />

        {/* Columns */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Columns (comma separated): </label>
          <input
            type="text"
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
            placeholder="e.g. id, name, age"
            className={styles.input}
          />
        </div>

        {/* Where Conditions */}
        <div className={styles.formGroup}>
          <h3>Where Conditions</h3>
          {whereConditions.map((cond, index) => (
            <div key={index} className={styles.conditionRow}>
              <input
                type="text"
                placeholder="Column"
                value={cond.column}
                onChange={(e) => handleWhereChange(index, "column", e.target.value)}
                className={styles.input}
              />
              <select
                value={cond.operator}
                onChange={(e) => handleWhereChange(index, "operator", e.target.value)}
                className={styles.select}
              >
                <option value="=">=</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value=">=">&gt;=</option>
                <option value="<=">&lt;=</option>
                <option value="LIKE">LIKE</option>
              </select>
              <input
                type="text"
                placeholder="Value"
                value={cond.value}
                onChange={(e) => handleWhereChange(index, "value", e.target.value)}
                className={styles.input}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveWhereCondition(index)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddWhereCondition}
            className={styles.addButton}
          >
            Add Condition
          </button>
        </div>

        {/* Order By */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Order By: </label>
          <input
            type="text"
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
            placeholder="Column name"
            className={styles.input}
          />
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className={styles.select}
          >
            <option value="ASC">ASC</option>
            <option value="DESC">DESC</option>
          </select>
        </div>

        {/* Limit & Offset */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Limit: </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className={styles.input}
          />
          <label className={styles.label}> Offset: </label>
          <input
            type="number"
            value={offset}
            onChange={(e) => setOffset(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Group By and Having */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Group By: </label>
          <input
            type="text"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            placeholder="Column name"
            className={styles.input}
          />
          <label className={styles.label}> Having: </label>
          <input
            type="text"
            value={having}
            onChange={(e) => setHaving(e.target.value)}
            placeholder="Condition"
            className={styles.input}
          />
        </div>

        {/* Distinct */}
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={distinct}
              onChange={(e) => setDistinct(e.target.checked)}
            />{" "}
            Distinct
          </label>
        </div>

        {/* Join Operations */}
        <div className={styles.formGroup}>
          <h3>Join Operations</h3>
          {joinConditions.map((join, index) => (
            <div key={index} className={styles.joinRow}>
              <select
                value={join.join_type}
                onChange={(e) => handleJoinChange(index, "join_type", e.target.value)}
                className={styles.select}
              >
                <option value="INNER JOIN">INNER JOIN</option>
                <option value="LEFT JOIN">LEFT JOIN</option>
                <option value="RIGHT JOIN">RIGHT JOIN</option>
                <option value="FULL JOIN">FULL JOIN</option>
                <option value="CROSS JOIN">CROSS JOIN</option>
              </select>
              <input
                type="text"
                placeholder="Join Table"
                value={join.join_table}
                onChange={(e) => handleJoinChange(index, "join_table", e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Condition (e.g., users.id = orders.user_id)"
                value={join.condition}
                onChange={(e) => handleJoinChange(index, "condition", e.target.value)}
                className={styles.input}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveJoin(index)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddJoin}
            className={styles.addButton}
          >
            Add Join
          </button>
        </div>

        {/* Aggregate Functions */}
        <div className={styles.formGroup}>
          <h3>Aggregate Functions</h3>
          {aggregates.map((agg, index) => (
            <div key={index} className={styles.aggregateRow}>
              <input
                type="text"
                placeholder="Column"
                value={agg.column}
                onChange={(e) => handleAggregateChange(index, "column", e.target.value)}
                className={styles.input}
              />
              <select
                value={agg.function}
                onChange={(e) => handleAggregateChange(index, "function", e.target.value)}
                className={styles.select}
              >
                <option value="">Select Function</option>
                <option value="SUM">SUM</option>
                <option value="AVG">AVG</option>
                <option value="MIN">MIN</option>
                <option value="MAX">MAX</option>
                <option value="COUNT">COUNT</option>
              </select>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAggregate(index)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddAggregate}
            className={styles.addButton}
          >
            Add Aggregate
          </button>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.executeButton}>
            Execute Query
          </button>
        </div>
      </form>

      {/* Display Executed SQL Query */}
      {executedQuery && (
        <div className={styles.resultSection}>
          <h3>Executed SQL Query</h3>
          <pre>{executedQuery}</pre>
        </div>
      )}

      {/* Display Query Results */}
      {queryResult && (
        <div className={styles.resultSection}>
          <h3>Query Result</h3>
          <table className={styles.resultTable}>
            <thead>
              <tr>
                {queryResult.length > 0 &&
                  Object.keys(queryResult[0]).map((col, idx) => <th key={idx}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {queryResult.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, index) => (
                    <td key={index}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SelectOperations;
