from fastapi import HTTPException
from sqlalchemy import Column, Integer, String, text, Table
from sqlalchemy import inspect
from ..database import engine, metadata
from typing import List, Optional, Dict, Any, Tuple

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
    

def list_indexes_crud() -> List[Dict[str, Any]]:
    query = """
        SELECT indexname AS indexname, tablename AS tablename, indexdef AS indexdef
        FROM pg_indexes 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query))
            indexes = [dict(zip(result.keys(), row)) for row in result.fetchall()]

        return indexes
    except Exception as e:
        # Log the error for debugging purposes
        print("Error in list_indexes_crud:", str(e))
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