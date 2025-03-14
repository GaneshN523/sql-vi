# app/main.py

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from .crud import select_data, get_table_names, create_index, drop_index, create_view, drop_view, refresh_materialized_view, list_views_crud, view_data_crud, filter_view_data_crud, join_view_data_crud, insert_into_view_crud, update_view_crud, delete_from_view_crud, refresh_materialized_view_crud, rename_view_crud, modify_view_crud
from .database import engine
from typing import List, Dict, Any, Optional, Tuple
import json

from .schemas import (
    TableRequest,
    ModifyTableRequest,
    InsertRowRequest,
    UpdateRowRequest,
    DeleteRowRequest,
    SelectResponse,
    SelectQuerySchema,
    IndexCreate,
    IndexDrop,
    ViewCreate,
    ViewDrop,
    MaterializedViewRefresh,
    InsertQuery,
    UpdateQuery,
    DeleteQuery,
    RenameViewQuery,
    ModifyViewQuery
)

from app import crud, database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict origins as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get_table_schema")
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

@app.get("/get_table_data")
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

@app.post("/create_table")
def create_table(request: TableRequest):
    try:
        created_table = crud.create_dynamic_table(request.table_name)
        return {"message": f"Table '{created_table}' created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_table")
def delete_table(request: TableRequest):
    try:
        deleted_table = crud.delete_dynamic_table(request.table_name)
        return {"message": f"Table '{deleted_table}' deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/modify_table")
def modify_table(request: ModifyTableRequest):
    try:
        for col in request.add_columns:
            crud.add_column(request.table_name, col.column_name, col.column_type)
        for col_name in request.drop_columns:
            crud.drop_column(request.table_name, col_name)
        for col in request.modify_columns:
            crud.modify_column(request.table_name, col.column_name, col.column_type)
        return {"message": f"Table '{request.table_name}' modified successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tables")
def get_tables():
    try:
        inspector = inspect(database.engine)
        tables = inspector.get_table_names()
        return {"tables": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/insert_row")
def insert_row_api(request: InsertRowRequest):
    try:
        crud.insert_row(request.table_name, request.row_data)
        return {"message": f"Row inserted into table '{request.table_name}' successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update_row")
def update_row_api(request: UpdateRowRequest):
    try:
        crud.update_row(request.table_name, request.condition, request.new_values)
        return {"message": f"Row(s) in '{request.table_name}' updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_row")
def delete_row_api(request: DeleteRowRequest):
    try:
        crud.delete_row(request.table_name, request.condition)
        return {"message": f"Row(s) in '{request.table_name}' deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# Select Section 

@app.post("/select")
def select_endpoint(query: SelectQuerySchema):
    """
    API endpoint to perform a SELECT query on a PostgreSQL database.
    """
    data, sql = select_data(
        query.table, query.columns, query.where, query.order_by, query.order,
        query.limit, query.offset, query.group_by, query.having, query.distinct,
        query.join, query.aggregate
    )
    return {"data": data, "query": sql}

@app.get("/tablesview", response_model=List[str])
async def get_tables_endpoint():
    try:
        tables = get_table_names()
        return tables
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    



# Indexes, Views and Sequences Section 

@app.post("/index/create")
def create_index_endpoint(data: IndexCreate):
    return create_index(data.index_name, data.table_name, data.column_name, data.index_type)

@app.post("/index/drop")
def drop_index_endpoint(data: IndexDrop):
    return drop_index(data.index_name)


@app.post("/view/create", summary="Create a new view")
def create_view_endpoint(data: ViewCreate):
    """
    Create a new view in the database.

    - **view_type**: Type of view to create ('simple', 'materialized', 'updatable', 'recursive')
    - **view_name**: Name of the view to create
    - **definition**: The SELECT query that defines the view (without the 'AS' keyword)
    - **with_check_option**: (Optional) For updatable views; adds WITH CHECK OPTION if true
    """
    return create_view(
        view_type=data.view_type,
        view_name=data.view_name,
        definition=data.definition,
        with_check_option=data.with_check_option
    )

@app.post("/view/drop", summary="Drop an existing view")
def drop_view_endpoint(data: ViewDrop):
    """
    Drop a view from the database.

    - **view_type**: Type of view to drop ('simple', 'materialized', 'updatable', 'recursive')
    - **view_name**: Name of the view to drop
    """
    return drop_view(
        view_type=data.view_type,
        view_name=data.view_name
    )

@app.post("/view/refresh", summary="Refresh a materialized view")
def refresh_view_endpoint(data: MaterializedViewRefresh):
    """
    Refresh a materialized view. This is only applicable to materialized views.

    - **view_name**: Name of the materialized view to refresh
    """
    return refresh_materialized_view(view_name=data.view_name)


# ---------------------------
# API Endpoints
# ---------------------------

@app.get("/views", response_model=List[dict])
def list_views():
    """
    List all views in the current database (excluding system schemas).
    """
    query = """
        SELECT schemaname, viewname, definition 
        FROM pg_views 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query))
            views = [dict(zip(result.keys(), row)) for row in result.fetchall()]
        return views
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/views/{view_name}")
def view_data(view_name: str):
    """
    Retrieve all data from a given view.
    """
    try:
        data = view_data_crud(view_name)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/views/{view_name}/filter")
def filter_view_data(
    view_name: str,
    condition: str = Query(..., description="SQL condition without the 'WHERE' keyword")
):
    """
    Retrieve data from a view filtered by a condition.
    Example: /views/my_view/filter?condition=age>30
    """
    try:
        data = filter_view_data_crud(view_name, condition)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/views/{view_name}/join")
def join_view_data(
    view_name: str,
    table_name: str = Query(..., description="Name of the table to join with"),
    condition: str = Query(..., description="Join condition without the 'ON' keyword")
):
    """
    Retrieve data from a view joined with another table.
    Example: /views/my_view/join?table_name=employees&condition=my_view.id=employees.view_id
    """
    try:
        data = join_view_data_crud(view_name, table_name, condition)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/views/{view_name}/insert")
def insert_into_view(view_name: str, insert_data: InsertQuery):
    """
    Insert values into an updatable view.
    """
    try:
        result = insert_into_view_crud(view_name, insert_data.values)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/views/{view_name}/update")
def update_view(view_name: str, update_data: UpdateQuery):
    """
    Update rows in an updatable view.
    """
    try:
        result = update_view_crud(view_name, update_data.set_clause, update_data.condition)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/views/{view_name}/delete")
def delete_from_view(view_name: str, delete_data: DeleteQuery):
    """
    Delete rows from an updatable view.
    """
    try:
        result = delete_from_view_crud(view_name, delete_data.condition)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/views/{view_name}/refresh")
def refresh_materialized_view(view_name: str):
    """
    Refresh a materialized view.
    """
    try:
        result = refresh_materialized_view_crud(view_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/views/rename")
def rename_view(rename_data: RenameViewQuery):
    """
    Rename a view.
    """
    try:
        result = rename_view_crud(rename_data.old_name, rename_data.new_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/views/modify")
def modify_view(modify_data: ModifyViewQuery):
    """
    Create or replace (modify) a view.
    """
    try:
        result = modify_view_crud(modify_data.view_name, modify_data.select_query)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))