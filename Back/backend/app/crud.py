# app/crud.py
from fastapi import HTTPException
from sqlalchemy import Column, Integer, String, text, Table
from sqlalchemy import inspect
from .database import engine, metadata
from typing import List, Optional, Dict, Any, Tuple

def create_dynamic_table(table_name: str):
    table = Table(
        table_name, metadata,
        Column("id", Integer, primary_key=True, index=True),
        Column("name", String, index=True)
    )
    metadata.create_all(engine, tables=[table])
    return table_name

def delete_dynamic_table(table_name: str):
    table = Table(table_name, metadata, autoload_with=engine)
    table.drop(engine)
    return table_name

def add_column(table_name: str, column_name: str, column_type: str):
    query = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"
    with engine.connect() as conn:
        conn.execute(text(query))
        conn.commit()

def drop_column(table_name: str, column_name: str):
    query = f"ALTER TABLE {table_name} DROP COLUMN {column_name}"
    with engine.connect() as conn:
        conn.execute(text(query))
        conn.commit()

def modify_column(table_name: str, column_name: str, new_column_type: str):
    query = f"ALTER TABLE {table_name} ALTER COLUMN {column_name} TYPE {new_column_type} USING {column_name}::{new_column_type}"
    with engine.connect() as conn:
        conn.execute(text(query))
        conn.commit()

def insert_row(table_name: str, row_data: dict):
    inspector = inspect(engine)
    columns = {col["name"] for col in inspector.get_columns(table_name)}
    filtered_data = {k: v for k, v in row_data.items() if k in columns}
    if not filtered_data:
        raise ValueError("No valid columns provided for insertion.")
    column_names = ", ".join(filtered_data.keys())
    placeholders = ", ".join([f":{key}" for key in filtered_data.keys()])
    query = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
    with engine.connect() as conn:
        conn.execute(text(query), filtered_data)
        conn.commit()

def update_row(table_name: str, condition: dict, new_values: dict):
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        raise ValueError(f"Table '{table_name}' does not exist.")
    columns = {col["name"] for col in inspector.get_columns(table_name)}
    new_values = {k: v for k, v in new_values.items() if k in columns}
    condition = {k: v for k, v in condition.items() if k in columns}
    if not new_values:
        raise ValueError("No valid columns provided for update.")
    if not condition:
        raise ValueError("Condition must have at least one valid column.")
    set_clause = ", ".join([f"{col} = :{col}" for col in new_values.keys()])
    where_clause = " AND ".join([f"{col} = :{col}" for col in condition.keys()])
    query = f"UPDATE {table_name} SET {set_clause} WHERE {where_clause}"
    with engine.connect() as conn:
        conn.execute(text(query), {**new_values, **condition})
        conn.commit()

def delete_row(table_name: str, condition: dict):
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        raise ValueError(f"Table '{table_name}' does not exist.")
    columns = {col["name"] for col in inspector.get_columns(table_name)}
    condition = {k: v for k, v in condition.items() if k in columns}
    if not condition:
        raise ValueError("Condition must have at least one valid column.")
    where_clause = " AND ".join([f"{col} = :{col}" for col in condition.keys()])
    query = f"DELETE FROM {table_name} WHERE {where_clause}"
    with engine.connect() as conn:
        conn.execute(text(query), condition)
        conn.commit()


# Select Section 

def select_data(
    table: str,
    columns: Optional[List[str]] = None,
    where: Optional[Dict[str, Any]] = None,
    order_by: Optional[str] = None,
    order: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    group_by: Optional[str] = None,
    having: Optional[str] = None,
    distinct: bool = False,
    join: Optional[List[Dict[str, str]]] = None,  # Accept join type
    aggregate: Optional[Dict[str, str]] = None
) -> Tuple[List[Dict[str, Any]], str]:
    """
    Enhanced SQL SELECT function for PostgreSQL using SQLAlchemy.

    The `where` parameter accepts a dictionary where each value can either be a plain value
    (for equality) or a list/tuple of two items [operator, value] (e.g., ["=", 2]).
    """
    sql = "SELECT "

    # Handle DISTINCT
    if distinct:
        sql += "DISTINCT "

    # Handle columns & aggregates
    if aggregate:
        aggregate_columns = [f"{func}({col}) AS \"{col}_{func}\"" for col, func in aggregate.items()]
        sql += ", ".join(aggregate_columns)
    elif columns:
        sql += ", ".join(columns)
    else:
        sql += "*"

    sql += f" FROM {table}"

    # Handle JOIN
    if join:
        for join_data in join:
            join_type = join_data.get("join_type", "INNER JOIN")  # Default to INNER JOIN
            join_table = join_data["join_table"]
            condition = join_data.get("condition", "")  # Default to empty if not provided
        
            if join_type.upper() == "CROSS JOIN":
                sql += f" {join_type} {join_table}"  # CROSS JOIN doesn't require an ON condition
            else:
                sql += f" {join_type} {join_table} ON {condition}"

    # Handle WHERE conditions
    query_params = {}
    if where:
        conditions = []
        for idx, (col, val) in enumerate(where.items()):
            placeholder = f":{col}{idx}"
            # Check if val is a tuple or list with exactly 2 elements (operator, value)
            if isinstance(val, (tuple, list)) and len(val) == 2:
                operator, value = val
                conditions.append(f"{col} {operator} {placeholder}")
                query_params[f"{col}{idx}"] = value
            else:
                conditions.append(f"{col} = {placeholder}")
                query_params[f"{col}{idx}"] = val
        sql += " WHERE " + " AND ".join(conditions)

    # Handle GROUP BY
    if group_by:
        sql += f" GROUP BY {group_by}"

    # Handle HAVING
    if having:
        sql += f" HAVING {having}"

    # Handle ORDER BY
    if order_by:
        sql += f" ORDER BY {order_by}"
        if order and order.upper() in ["ASC", "DESC"]:
            sql += f" {order.upper()}"

    # Handle LIMIT & OFFSET using colon-style placeholders
    if limit is not None:
        sql += " LIMIT :limit"
        query_params["limit"] = limit
    if offset is not None:
        sql += " OFFSET :offset"
        query_params["offset"] = offset

    # Execute the query
    with engine.connect() as connection:
        result = connection.execute(text(sql), query_params)
        rows = result.fetchall()
        cols = result.keys()
        data = [dict(zip(cols, row)) for row in rows]

    formatted_sql = sql
    for param, value in query_params.items():
        formatted_sql = formatted_sql.replace(f":{param}", f"'{value}'" if isinstance(value, str) else str(value))
    
    return data, formatted_sql


def get_table_names() -> List[str]:
    inspector = inspect(engine)
    return inspector.get_table_names()



# Indexes, Views and Sequence Section

def create_index(index_name: str, table_name: str, column_name: str, index_type: str):
    # Validate index type
    valid_index_types = ["BTREE", "HASH", "GIN", "GIST", "SPGIST", "BRIN"]
    if index_type.upper() not in valid_index_types:
        raise HTTPException(status_code=400, detail="Invalid index type specified.")

    # Construct SQL query
    query = f"CREATE INDEX {index_name} ON {table_name} USING {index_type} ({column_name});"

    try:
        with engine.connect() as conn:
            conn.execute(text(query))
            conn.commit()
        return {"message": f"Index '{index_name}' created successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def drop_index(index_name: str):
    query = f"DROP INDEX IF EXISTS {index_name};"

    try:
        with engine.connect() as conn:
            conn.execute(text(query))
            conn.commit()
        return {"message": f"Index '{index_name}' dropped successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    


def create_view(view_type: str, view_name: str, definition: str, with_check_option: bool = False):
    view_type = view_type.lower()
    valid_view_types = ["simple", "materialized", "updatable", "recursive"]
    
    if view_type not in valid_view_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid view type. Choose from 'simple', 'materialized', 'updatable', 'recursive'."
        )

    sql = ""

    if view_type == "simple":
        # Simple (read-only) view
        sql = f"CREATE VIEW {view_name} AS {definition};"

    elif view_type == "materialized":
        # Materialized view stores data physically
        sql = f"CREATE MATERIALIZED VIEW {view_name} AS {definition};"

    elif view_type == "updatable":
        # Updatable view – add WITH CHECK OPTION if required
        sql = f"CREATE VIEW {view_name} AS {definition}"
        if with_check_option:
            sql += " WITH CHECK OPTION"
        sql += ";"

    elif view_type == "recursive":
        # PostgreSQL does not allow CREATE RECURSIVE VIEW, so use WITH RECURSIVE inside the view definition
        sql = f"CREATE VIEW {view_name} AS {definition};"

    try:
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        return {"message": f"{view_type.capitalize()} view '{view_name}' created successfully."}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def drop_view(view_type: str, view_name: str):
    view_type = view_type.lower()
    valid_view_types = ["simple", "materialized", "updatable", "recursive"]
    if view_type not in valid_view_types:
        raise HTTPException(status_code=400, detail="Invalid view type. Choose from simple, materialized, updatable, recursive.")

    # Use DROP MATERIALIZED VIEW for materialized views; otherwise, use DROP VIEW
    sql = ""
    if view_type == "materialized":
        sql = f"DROP MATERIALIZED VIEW IF EXISTS {view_name} CASCADE;"
    else:
        sql = f"DROP VIEW IF EXISTS {view_name} CASCADE;"

    try:
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        return {"message": f"{view_type.capitalize()} view '{view_name}' dropped successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def refresh_materialized_view(view_name: str):
    # Refresh command is only valid for materialized views.
    sql = f"REFRESH MATERIALIZED VIEW {view_name};"
    try:
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        return {"message": f"Materialized view '{view_name}' refreshed successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def list_views_crud():
    """
    Retrieve all non-system views from the PostgreSQL database.
    """
    query = """
        SELECT schemaname, viewname, definition 
        FROM pg_views 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    """
    with engine.connect() as conn:
        result = conn.execute(text(query))
        views = [dict(row) for row in result.fetchall()]
    return views

def view_data_crud(view_name: str):
    """
    Retrieve all data from the specified view.
    """
    query = f"SELECT * FROM {view_name};"
    with engine.connect() as conn:
        result = conn.execute(text(query))
        data = [dict(row) for row in result.fetchall()]
    return data

def filter_view_data_crud(view_name: str, condition: str):
    """
    Retrieve data from the specified view filtered by a SQL condition.
    """
    query = f"SELECT * FROM {view_name} WHERE {condition};"
    with engine.connect() as conn:
        result = conn.execute(text(query))
        data = [dict(row) for row in result.fetchall()]
    return data

def join_view_data_crud(view_name: str, table_name: str, condition: str):
    """
    Retrieve data by joining the view with another table.
    """
    query = f"SELECT * FROM {view_name} JOIN {table_name} ON {condition};"
    with engine.connect() as conn:
        result = conn.execute(text(query))
        data = [dict(row) for row in result.fetchall()]
    return data

def insert_into_view_crud(view_name: str, values: list):
    """
    Insert values into an updatable view.
    **Note:** Ensure that the view is updatable and that the order of values matches the view's columns.
    """
    # Quote string values and join all values with commas
    values_str = ", ".join(
        f"'{value}'" if isinstance(value, str) else str(value)
        for value in values
    )
    query = f"INSERT INTO {view_name} VALUES ({values_str});"
    with engine.connect() as conn:
        conn.execute(text(query))
        conn.commit()
    return {"message": f"Inserted into view '{view_name}' successfully."}

def update_view_crud(view_name: str, set_clause: str, condition: str):
    """
    Update rows in an updatable view.
    """
    query = f"UPDATE {view_name} SET {set_clause} WHERE {condition};"
    with engine.connect() as conn:
        conn.execute(text(query))
        conn.commit()
    return {"message": f"Updated view '{view_name}' successfully."}

def delete_from_view_crud(view_name: str, condition: str):
    """
    Delete rows from an updatable view.
    """
    query = f"DELETE FROM {view_name} WHERE {condition};"
    with engine.connect() as conn:
        conn.execute(text(query))
        conn.commit()
    return {"message": f"Deleted from view '{view_name}' successfully."}

def refresh_materialized_view_crud(view_name: str):
    """
    Refresh a materialized view.
    """
    query = f"REFRESH MATERIALIZED VIEW {view_name};"
    with engine.connect() as conn:
        conn.execute(text(query))
        conn.commit()
    return {"message": f"Materialized view '{view_name}' refreshed successfully."}

def rename_view_crud(old_name: str, new_name: str):
    """
    Rename an existing view.
    """
    query = f"ALTER VIEW {old_name} RENAME TO {new_name};"
    with engine.connect() as conn:
        conn.execute(text(query))
        conn.commit()
    return {"message": f"View '{old_name}' renamed to '{new_name}' successfully."}

def modify_view_crud(view_name: str, select_query: str):
    """
    Create or replace a view.
    """
    query = f"CREATE OR REPLACE VIEW {view_name} AS {select_query};"
    with engine.connect() as conn:
        conn.execute(text(query))
        conn.commit()
    return {"message": f"View '{view_name}' modified successfully."}