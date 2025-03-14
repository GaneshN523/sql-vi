import React, { useState, useEffect } from 'react';
import { createIndex, dropIndex, listIndexes } from '../../api';
import styles from './indexmanager.module.css';

function IndexManager() {
  const [sqlLog, setSqlLog] = useState('');
  const [message, setMessage] = useState('');
  const [indexList, setIndexList] = useState([]);
  const [indexForm, setIndexForm] = useState({
    index_name: '',
    table_name: '',
    column_name: '',
    index_type: 'BTREE',
  });
  const [dropIndexName, setDropIndexName] = useState('');

  const fetchIndexes = async () => {
    try {
      const indexes = await listIndexes();
      setIndexList(indexes);
    } catch (error) {
      console.error(error);
      setMessage('Error fetching indexes.');
    }
  };

  useEffect(() => {
    fetchIndexes();
  }, []);

  const handleCreateIndex = async (e) => {
    e.preventDefault();
    try {
      const { data, sql } = await createIndex(indexForm);
      setMessage(data.message);
      setSqlLog(sql);
      fetchIndexes();
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleDropIndex = async (e) => {
    e.preventDefault();
    try {
      const { data, sql } = await dropIndex({ index_name: dropIndexName });
      setMessage(data.message);
      setSqlLog(sql);
      fetchIndexes();
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  return (
    <div className={styles.container}>
      {message && (
        <p className={styles.message}>
          <strong>Message:</strong> {message}
        </p>
      )}
      {sqlLog && (
        <div className={styles.sqlLog}>
          <strong>SQL Query:</strong>
          <pre>{sqlLog}</pre>
        </div>
      )}

      <h2 className={styles.header}>Indexes</h2>

      <h3 className={styles.subHeader}>Create Index</h3>
      <form onSubmit={handleCreateIndex} className={styles.form}>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Index Name"
            value={indexForm.index_name}
            onChange={(e) =>
              setIndexForm({ ...indexForm, index_name: e.target.value })
            }
            required
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="Table Name"
            value={indexForm.table_name}
            onChange={(e) =>
              setIndexForm({ ...indexForm, table_name: e.target.value })
            }
            required
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="Column Name"
            value={indexForm.column_name}
            onChange={(e) =>
              setIndexForm({ ...indexForm, column_name: e.target.value })
            }
            required
            className={styles.inputField}
          />
          <select
            value={indexForm.index_type}
            onChange={(e) =>
              setIndexForm({ ...indexForm, index_type: e.target.value })
            }
            className={styles.selectField}
          >
            <option value="BTREE">BTREE</option>
            <option value="HASH">HASH</option>
            <option value="GIN">GIN</option>
            <option value="GIST">GIST</option>
            <option value="SPGIST">SPGIST</option>
            <option value="BRIN">BRIN</option>
          </select>
        </div>
        <button type="submit" className={styles.button}>
          Create Index
        </button>
      </form>

      <h3 className={styles.subHeader}>Drop Index</h3>
      <form onSubmit={handleDropIndex} className={styles.form}>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Index Name"
            value={dropIndexName}
            onChange={(e) => setDropIndexName(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        <button type="submit" className={styles.button}>
          Drop Index
        </button>
      </form>

      <h3 className={styles.subHeader}>Existing Indexes</h3>
      {indexList.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Index Name</th>
                <th>Table Name</th>
                <th>Column Name</th>
                <th>Index Type</th>
              </tr>
            </thead>
            <tbody>
              {indexList.map((idx, i) => (
                <tr key={i}>
                  <td>{idx.indexname || idx.index_name}</td>
                  <td>{idx.tablename || idx.table_name}</td>
                  <td>{idx.columnname || idx.column_name}</td>
                  <td>{idx.indextype || idx.index_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.noData}>
          No indexes found (or endpoint not implemented).
        </p>
      )}
    </div>
  );
}

export default IndexManager;
