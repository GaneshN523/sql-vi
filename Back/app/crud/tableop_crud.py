from fastapi import HTTPException
from sqlalchemy import Column, Integer, String, text, Table
from sqlalchemy import inspect
from ..database import engine, metadata
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