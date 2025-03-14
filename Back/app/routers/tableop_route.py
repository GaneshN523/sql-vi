from fastapi import HTTPException, APIRouter
from sqlalchemy import inspect, text
from ..crud.tableop_crud import create_dynamic_table, delete_dynamic_table, add_column, drop_column, insert_row, delete_row, update_row
from app.crud.selectop_crud import get_table_names
from ..database import engine
from typing import List, Dict, Any, Optional, Tuple

from ..schemas.tableop_schema import (
    TableRequest,
    ModifyTableRequest,
    InsertRowRequest,
    UpdateRowRequest,
    DeleteRowRequest

)

from ..crud import tableop_crud
from app import database


router = APIRouter(prefix="/table", tags=["Table"])

@router.get("/get_table_schema")
def get_table_schema(table_name: str):
    try:
        inspector = inspect(database.engine)
        if table_name not in inspector.get_table_names():
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        columns = inspector.get_columns(table_name)
        schema = [
            {"column_name": col["name"], "column_type": str(col["type"])}
            for col in columns
        ]
        return {"schema": schema}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_table_data")
def get_table_data(table_name: str):
    try:
        inspector = inspect(engine)
        if table_name not in inspector.get_table_names():
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")

        query = text(f"SELECT * FROM {table_name}")

        with engine.connect() as conn:
            result = conn.execute(query)
            # Convert SQLAlchemy Row objects correctly
            rows = [dict(row._mapping) for row in result]

        return {"data": rows}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create_table")
def create_table(request: TableRequest):
    try:
        created_table = tableop_crud.create_dynamic_table(request.table_name)
        return {"message": f"Table '{created_table}' created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete_table")
def delete_table(request: TableRequest):
    try:
        deleted_table = tableop_crud.delete_dynamic_table(request.table_name)
        return {"message": f"Table '{deleted_table}' deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/modify_table")
def modify_table(request: ModifyTableRequest):
    try:
        for col in request.add_columns:
            tableop_crud.add_column(request.table_name, col.column_name, col.column_type)
        for col_name in request.drop_columns:
            tableop_crud.drop_column(request.table_name, col_name)
        for col in request.modify_columns:
            tableop_crud.modify_column(request.table_name, col.column_name, col.column_type)
        return {"message": f"Table '{request.table_name}' modified successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tables")
def get_tables():
    try:
        inspector = inspect(database.engine)
        tables = inspector.get_table_names()
        return {"tables": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/insert_row")
def insert_row_api(request: InsertRowRequest):
    try:
        tableop_crud.insert_row(request.table_name, request.row_data)
        return {"message": f"Row inserted into table '{request.table_name}' successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update_row")
def update_row_api(request: UpdateRowRequest):
    try:
        tableop_crud.update_row(request.table_name, request.condition, request.new_values)
        return {"message": f"Row(s) in '{request.table_name}' updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete_row")
def delete_row_api(request: DeleteRowRequest):
    try:
        tableop_crud.delete_row(request.table_name, request.condition)
        return {"message": f"Row(s) in '{request.table_name}' deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

