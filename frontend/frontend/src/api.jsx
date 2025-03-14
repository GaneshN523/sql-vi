// api.jsx
export const fetchTables = async () => {
    try {
      const res = await fetch("http://localhost:8000/table/tables");
      if (!res.ok) {
        throw new Error("Failed to fetch tables");
      }
      const data = await res.json();
      return data.tables;
    } catch (error) {
      throw new Error("Error fetching tables: " + error.message);
    }
  };
  
  // Fetch table data using the new endpoint
export const fetchTableData = async (tableName) => {
  const response = await fetch(`http://localhost:8000/table/get_table_data?table_name=${encodeURIComponent(tableName)}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Error fetching table data");
  }
  // Extract the data array from the response JSON
  const json = await response.json();
  return json.data;
};
  
  export const fetchTableSchema = async (tableName) => {
    try {
      const res = await fetch(
        `http://localhost:8000/table/get_table_schema?table_name=${tableName}`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch schema for table ${tableName}`);
      }
      const data = await res.json();
      return data.schema;
    } catch (error) {
      throw new Error("Error fetching table schema: " + error.message);
    }
  };
  
  export const createTable = async (tableName) => {
    try {
      const res = await fetch("http://localhost:8000/table/create_table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_name: tableName })
      });
      if (!res.ok) {
        throw new Error("Failed to create table");
      }
      return true;
    } catch (error) {
      throw new Error("Error creating table: " + error.message);
    }
  };
  
  export const deleteTable = async (tableName) => {
    try {
      const res = await fetch("http://localhost:8000/table/delete_table", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_name: tableName })
      });
      if (!res.ok) {
        throw new Error("Failed to delete table");
      }
      return true;
    } catch (error) {
      throw new Error("Error deleting table: " + error.message);
    }
  };
  
  export const modifyTable = async (tableName, payload) => {
    try {
      const res = await fetch("http://localhost:8000/table/modify_table", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_name: tableName, ...payload })
      });
      if (!res.ok) {
        throw new Error("Failed to modify table structure");
      }
      return true;
    } catch (error) {
      throw new Error("Error modifying table: " + error.message);
    }
  };
  
  export const insertRow = async (tableName, rowData) => {
    try {
      const res = await fetch("http://localhost:8000/table/insert_row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_name: tableName, row_data: rowData })
      });
      if (!res.ok) {
        throw new Error("Failed to insert row");
      }
      return true;
    } catch (error) {
      throw new Error("Error inserting row: " + error.message);
    }
  };
  
  export const updateRow = async (tableName, id, newValues) => {
    try {
      const res = await fetch("http://localhost:8000/table/update_row", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_name: tableName,
          condition: { id },
          new_values: newValues
        })
      });
      if (!res.ok) {
        throw new Error("Failed to update row");
      }
      return true;
    } catch (error) {
      throw new Error("Error updating row: " + error.message);
    }
  };
  
  export const deleteRow = async (tableName, id) => {
    try {
      const res = await fetch("http://localhost:8000/table/delete_row", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_name: tableName, condition: { id } })
      });
      if (!res.ok) {
        throw new Error("Failed to delete row");
      }
      return true;
    } catch (error) {
      throw new Error("Error deleting row: " + error.message);
    }
  };
  



// Select Section 

// src/api.jsx
const API_URL = "http://localhost:8000/select"; // Adjust this URL as needed

/**
 * Fetches the list of table names from the backend.
 */
export async function getTables() {
  try {
    const response = await fetch(`${API_URL}/tablesview`);
    if (!response.ok) {
      throw new Error("Failed to fetch tables");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getTables:", error);
    throw error;
  }
}

/**
 * Executes a SELECT query by sending the query payload to the backend.
 * @param {Object} queryPayload - The payload matching the backend schema.
 */
// api.jsx
export async function executeSelect(queryPayload) {
  try {
    const response = await fetch(`${API_URL}/select`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPayload),
    });
    if (!response.ok) {
      throw new Error("Query execution failed");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in executeSelect:", error);
    throw error;
  }
}




//  IndexView Section 

// src/api.jsx
import axios from 'axios';

const API_BASE = 'http://localhost:8000'; // adjust your backend port if needed

// ----------------------
// Indexes APIs
// ----------------------

export const createIndex = async (data) => {
  // Construct the SQL query as per the backend logic.
  const sqlQuery = `CREATE INDEX ${data.index_name} ON ${data.table_name} USING ${data.index_type} (${data.column_name});`;
  const response = await axios.post(`${API_BASE}/indexview/index/create`, data);
  return { data: response.data, sql: sqlQuery };
};

export const dropIndex = async (data) => {
  const sqlQuery = `DROP INDEX IF EXISTS ${data.index_name};`;
  const response = await axios.post(`${API_BASE}/indexview/index/drop`, data);
  return { data: response.data, sql: sqlQuery };
};

export const listIndexes = async () => {
  // Assuming you have an endpoint to list indexes.
  const response = await axios.get(`${API_BASE}/indexview/index/list`);
  return response.data;
};

// ----------------------
// Views APIs
// ----------------------

export const createView = async (data) => {
  // Build the SQL query based on view type and parameters.
  let sqlQuery = '';
  const type = data.view_type.toLowerCase();
  if (type === 'simple') {
    sqlQuery = `CREATE VIEW ${data.view_name} AS ${data.definition};`;
  } else if (type === 'materialized') {
    sqlQuery = `CREATE MATERIALIZED VIEW ${data.view_name} AS ${data.definition};`;
  } else if (type === 'updatable') {
    sqlQuery = `CREATE VIEW ${data.view_name} AS ${data.definition}${data.with_check_option ? ' WITH CHECK OPTION' : ''};`;
  } else if (type === 'recursive') {
    sqlQuery = `CREATE VIEW ${data.view_name} AS ${data.definition};`;
  }
  const response = await axios.post(`${API_BASE}/indexview/view/create`, data);
  return { data: response.data, sql: sqlQuery };
};

export const dropView = async (data) => {
  const type = data.view_type.toLowerCase();
  const sqlQuery =
    type === 'materialized'
      ? `DROP MATERIALIZED VIEW IF EXISTS ${data.view_name} CASCADE;`
      : `DROP VIEW IF EXISTS ${data.view_name} CASCADE;`;
  const response = await axios.post(`${API_BASE}/indexview/view/drop`, data);
  return { data: response.data, sql: sqlQuery };
};

export const refreshMaterializedView = async (view_name) => {
  const sqlQuery = `REFRESH MATERIALIZED VIEW ${view_name};`;
  const response = await axios.post(`${API_BASE}/indexview/view/refresh`, { view_name });
  return { data: response.data, sql: sqlQuery };
};

export const listViews = async () => {
  const response = await axios.get(`${API_BASE}/indexview/views`);
  return response.data;
};

export const viewData = async (view_name) => {
  const response = await axios.get(`${API_BASE}/indexview/views/${view_name}`);
  return response.data;
};

export const filterViewData = async (view_name, condition) => {
  const response = await axios.get(`${API_BASE}/indexview/views/${view_name}/filter`, {
    params: { condition },
  });
  return response.data;
};

export const joinViewData = async (view_name, table_name, condition) => {
  const response = await axios.get(`${API_BASE}/indexview/views/${view_name}/join`, {
    params: { table_name, condition },
  });
  return response.data;
};

export const insertIntoView = async (view_name, values) => {
  // Build SQL: quote string values as needed
  const valuesStr = values
    .map((val) => (typeof val === 'string' ? `'${val}'` : val))
    .join(', ');
  const sqlQuery = `INSERT INTO ${view_name} VALUES (${valuesStr});`;
  const response = await axios.post(`${API_BASE}/indexview/views/${view_name}/insert`, { values });
  return { data: response.data, sql: sqlQuery };
};

export const updateView = async (view_name, set_clause, condition) => {
  const sqlQuery = `UPDATE ${view_name} SET ${set_clause} WHERE ${condition};`;
  const response = await axios.put(`${API_BASE}/indexview/views/${view_name}/update`, { set_clause, condition });
  return { data: response.data, sql: sqlQuery };
};

export const deleteFromView = async (view_name, condition) => {
  const sqlQuery = `DELETE FROM ${view_name} WHERE ${condition};`;
  // For axios DELETE with a request body, pass data inside config.
  const response = await axios.delete(`${API_BASE}/indexview/views/${view_name}/delete`, { data: { condition } });
  return { data: response.data, sql: sqlQuery };
};

export const renameView = async (old_name, new_name) => {
  const sqlQuery = `ALTER VIEW ${old_name} RENAME TO ${new_name};`;
  const response = await axios.put(`${API_BASE}/indexview/views/rename`, { old_name, new_name });
  return { data: response.data, sql: sqlQuery };
};

export const modifyView = async (view_name, select_query) => {
  const sqlQuery = `CREATE OR REPLACE VIEW ${view_name} AS ${select_query};`;
  const response = await axios.put(`${API_BASE}/indexview/views/modify`, { view_name, select_query });
  return { data: response.data, sql: sqlQuery };
};



// Sequence Section 


// src/api.js

const BASE_URL = "http://localhost:8000";

export const fetchSequences = async () => {
  const res = await fetch(`${BASE_URL}/sequences/list`);
  return res.json();
};

export const createSequence = async (payload) => {
  const res = await fetch(`${BASE_URL}/sequences/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const getNextValue = async (seq) => {
  const res = await fetch(`${BASE_URL}/sequences/${seq}/next`);
  return res.json();
};

export const getCurrentValue = async (seq) => {
  const res = await fetch(`${BASE_URL}/sequences/${seq}/current`);
  return res.json();
};

export const setSequenceValue = async (seq, value) => {
  const payload = { value };
  const res = await fetch(`${BASE_URL}/sequences/${seq}/set`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const restartSequence = async (seq, start_with) => {
  const payload = { start_with };
  const res = await fetch(`${BASE_URL}/sequences/${seq}/restart`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const dropSequence = async (seq) => {
  const res = await fetch(`${BASE_URL}/sequences/${seq}/drop`, {
    method: 'DELETE',
  });
  return res.json();
};

export const viewSequenceDetails = async (seq) => {
  const res = await fetch(`${BASE_URL}/sequences/${seq}/details`);
  return res.json();
};

export const associateSequence = async (seq, table, column) => {
  const payload = { table, column };
  const res = await fetch(`${BASE_URL}/sequences/${seq}/associate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const resetTableSequence = async (table, column) => {
  const payload = { table, column };
  const res = await fetch(`${BASE_URL}/sequences/reset_table`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};




//  Transactions Section 

// File: src/api.jsx

const API_BASE_URL = "http://localhost:8000/transactions";

export const callApi = async (endpoint, method = "post", data = {}) => {
  try {
    const response = await axios({ method, url: `${API_BASE_URL}${endpoint}`, data });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail
      ? { detail: error.response.data.detail }
      : { error: error.message };
  }
};