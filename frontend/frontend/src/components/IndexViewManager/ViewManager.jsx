import React, { useState, useEffect } from 'react';
import {
  createView,
  dropView,
  refreshMaterializedView,
  listViews,
  viewData,
  filterViewData,
  joinViewData,
  insertIntoView,
  updateView,
  deleteFromView,
  renameView,
  modifyView,
} from '../../api';
import styles from './viewmanager.module.css';

function ViewManager() {
  const [message, setMessage] = useState('');
  const [sqlLog, setSqlLog] = useState('');
  const [viewList, setViewList] = useState([]);
  const [selectedView, setSelectedView] = useState(null);
  const [viewForm, setViewForm] = useState({
    view_type: 'simple',
    view_name: '',
    definition: '',
    with_check_option: false,
  });
  const [dropViewForm, setDropViewForm] = useState({
    view_type: 'simple',
    view_name: '',
  });
  const [refreshViewName, setRefreshViewName] = useState('');

  // For operations on a selected view:
  const [viewDataResult, setViewDataResult] = useState([]);
  const [filterCondition, setFilterCondition] = useState('');
  const [joinParams, setJoinParams] = useState({ table_name: '', condition: '' });
  const [insertValues, setInsertValues] = useState('');
  const [updateForm, setUpdateForm] = useState({ set_clause: '', condition: '' });
  const [deleteCondition, setDeleteCondition] = useState('');
  const [renameForm, setRenameForm] = useState({ new_name: '' });
  const [modifySelectQuery, setModifySelectQuery] = useState('');

  const fetchViews = async () => {
    try {
      const views = await listViews();
      setViewList(views);
    } catch (error) {
      console.error(error);
      setMessage('Error fetching views.');
    }
  };

  useEffect(() => {
    fetchViews();
  }, []);

  const handleCreateView = async (e) => {
    e.preventDefault();
    try {
      const { data, sql } = await createView(viewForm);
      setMessage(data.message);
      setSqlLog(sql);
      fetchViews();
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleDropView = async (e) => {
    e.preventDefault();
    try {
      const { data, sql } = await dropView(dropViewForm);
      setMessage(data.message);
      setSqlLog(sql);
      fetchViews();
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleRefreshView = async (e) => {
    e.preventDefault();
    try {
      const { data, sql } = await refreshMaterializedView(refreshViewName);
      setMessage(data.message);
      setSqlLog(sql);
      fetchViews();
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleFetchViewData = async (viewName) => {
    try {
      const data = await viewData(viewName);
      setViewDataResult(data);
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleFilterViewData = async (e) => {
    e.preventDefault();
    if (!selectedView) return;
    try {
      const data = await filterViewData(selectedView.viewname, filterCondition);
      setViewDataResult(data);
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleJoinViewData = async (e) => {
    e.preventDefault();
    if (!selectedView) return;
    try {
      const data = await joinViewData(
        selectedView.viewname,
        joinParams.table_name,
        joinParams.condition
      );
      setViewDataResult(data);
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleInsertIntoView = async (e) => {
    e.preventDefault();
    if (!selectedView) return;
    // Convert comma-separated string into an array
    const values = insertValues.split(',').map((v) => v.trim());
    try {
      const { data, sql } = await insertIntoView(selectedView.viewname, values);
      setMessage(data.message);
      setSqlLog(sql);
      handleFetchViewData(selectedView.viewname);
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleUpdateView = async (e) => {
    e.preventDefault();
    if (!selectedView) return;
    try {
      const { data, sql } = await updateView(
        selectedView.viewname,
        updateForm.set_clause,
        updateForm.condition
      );
      setMessage(data.message);
      setSqlLog(sql);
      handleFetchViewData(selectedView.viewname);
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleDeleteFromView = async (e) => {
    e.preventDefault();
    if (!selectedView) return;
    try {
      const { data, sql } = await deleteFromView(selectedView.viewname, deleteCondition);
      setMessage(data.message);
      setSqlLog(sql);
      handleFetchViewData(selectedView.viewname);
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleRenameView = async (e) => {
    e.preventDefault();
    if (!selectedView) return;
    try {
      const { data, sql } = await renameView(selectedView.viewname, renameForm.new_name);
      setMessage(data.message);
      setSqlLog(sql);
      fetchViews();
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  const handleModifyView = async (e) => {
    e.preventDefault();
    if (!selectedView) return;
    try {
      const { data, sql } = await modifyView(selectedView.viewname, modifySelectQuery);
      setMessage(data.message);
      setSqlLog(sql);
      fetchViews();
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
    }
  };

  return (
    <div className={styles.container}>
      {message && <p className={styles.message}><strong>Message:</strong> {message}</p>}
      {sqlLog && (
        <div className={styles.sqlLog}>
          <strong>SQL Query:</strong>
          <pre>{sqlLog}</pre>
        </div>
      )}

      <h2 className={styles.header}>Views</h2>

      <h3 className={styles.subHeader}>Create View</h3>
      <form onSubmit={handleCreateView} className={styles.form}>
        <div className={styles.formGroup}>
          <select
            className={styles.selectField}
            value={viewForm.view_type}
            onChange={(e) => setViewForm({ ...viewForm, view_type: e.target.value })}
          >
            <option value="simple">Simple</option>
            <option value="materialized">Materialized</option>
            <option value="updatable">Updatable</option>
            <option value="recursive">Recursive</option>
          </select>
          <input
            className={styles.inputField}
            type="text"
            placeholder="View Name"
            value={viewForm.view_name}
            onChange={(e) => setViewForm({ ...viewForm, view_name: e.target.value })}
            required
          />
          <input
            className={styles.inputField}
            type="text"
            placeholder="Definition (SELECT query)"
            value={viewForm.definition}
            onChange={(e) => setViewForm({ ...viewForm, definition: e.target.value })}
            required
          />
          {viewForm.view_type.toLowerCase() === 'updatable' && (
            <label>
              <input
                type="checkbox"
                checked={viewForm.with_check_option}
                onChange={(e) => setViewForm({ ...viewForm, with_check_option: e.target.checked })}
              />
              With Check Option
            </label>
          )}
        </div>
        <button type="submit" className={styles.button}>Create View</button>
      </form>

      <h3 className={styles.subHeader}>Drop View</h3>
      <form onSubmit={handleDropView} className={styles.form}>
        <div className={styles.formGroup}>
          <select
            className={styles.selectField}
            value={dropViewForm.view_type}
            onChange={(e) => setDropViewForm({ ...dropViewForm, view_type: e.target.value })}
          >
            <option value="simple">Simple</option>
            <option value="materialized">Materialized</option>
            <option value="updatable">Updatable</option>
            <option value="recursive">Recursive</option>
          </select>
          <input
            className={styles.inputField}
            type="text"
            placeholder="View Name"
            value={dropViewForm.view_name}
            onChange={(e) => setDropViewForm({ ...dropViewForm, view_name: e.target.value })}
            required
          />
        </div>
        <button type="submit" className={styles.button}>Drop View</button>
      </form>

      <h3 className={styles.subHeader}>Refresh Materialized View</h3>
      <form onSubmit={handleRefreshView} className={styles.form}>
        <div className={styles.formGroup}>
          <input
            className={styles.inputField}
            type="text"
            placeholder="Materialized View Name"
            value={refreshViewName}
            onChange={(e) => setRefreshViewName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.button}>Refresh</button>
      </form>

      <h3 className={styles.subHeader}>Existing Views</h3>
      {viewList.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Schema</th>
                <th>View Name</th>
                <th>Definition</th>
              </tr>
            </thead>
            <tbody>
              {viewList.map((v, i) => (
                <tr key={i} onClick={() => { setSelectedView(v); setViewDataResult([]); }}>
                  <td>{v.schemaname}</td>
                  <td>{v.viewname}</td>
                  <td>{v.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.noData}>No views found.</p>
      )}

      {selectedView && (
        <div className={styles.form} style={{ border: '1px solid gray', padding: '10px', marginTop: '20px' }}>
          <h3 className={styles.subHeader}>Selected View: {selectedView.viewname}</h3>
          <button onClick={() => handleFetchViewData(selectedView.viewname)} className={styles.button}>
            Fetch View Data
          </button>
          <h4 className={styles.subHeader}>Filter View Data</h4>
          <form onSubmit={handleFilterViewData} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="Condition (e.g., age > 30)"
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Filter</button>
          </form>
          <h4 className={styles.subHeader}>Join View Data</h4>
          <form onSubmit={handleJoinViewData} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="Table Name"
                value={joinParams.table_name}
                onChange={(e) => setJoinParams({ ...joinParams, table_name: e.target.value })}
                required
              />
              <input
                className={styles.inputField}
                type="text"
                placeholder="Join Condition"
                value={joinParams.condition}
                onChange={(e) => setJoinParams({ ...joinParams, condition: e.target.value })}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Join</button>
          </form>
          <h4 className={styles.subHeader}>Insert into View</h4>
          <form onSubmit={handleInsertIntoView} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="Comma separated values"
                value={insertValues}
                onChange={(e) => setInsertValues(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Insert</button>
          </form>
          <h4 className={styles.subHeader}>Update View</h4>
          <form onSubmit={handleUpdateView} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="SET clause (e.g., column = value)"
                value={updateForm.set_clause}
                onChange={(e) => setUpdateForm({ ...updateForm, set_clause: e.target.value })}
                required
              />
              <input
                className={styles.inputField}
                type="text"
                placeholder="Condition (e.g., id = 1)"
                value={updateForm.condition}
                onChange={(e) => setUpdateForm({ ...updateForm, condition: e.target.value })}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Update</button>
          </form>
          <h4 className={styles.subHeader}>Delete from View</h4>
          <form onSubmit={handleDeleteFromView} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="Condition (e.g., id = 1)"
                value={deleteCondition}
                onChange={(e) => setDeleteCondition(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Delete</button>
          </form>
          <h4 className={styles.subHeader}>Rename View</h4>
          <form onSubmit={handleRenameView} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="New View Name"
                value={renameForm.new_name}
                onChange={(e) => setRenameForm({ new_name: e.target.value })}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Rename</button>
          </form>
          <h4 className={styles.subHeader}>Modify View</h4>
          <form onSubmit={handleModifyView} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="New SELECT query"
                value={modifySelectQuery}
                onChange={(e) => setModifySelectQuery(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Modify</button>
          </form>
          <h4 className={styles.subHeader}>View Data Result</h4>
          {viewDataResult.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(viewDataResult[0]).map((key, idx) => (
                      <th key={idx}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewDataResult.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.noData}>No data to display.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewManager;
