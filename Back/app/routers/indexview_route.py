from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import inspect, text
from ..crud.indexview_crud import list_indexes_crud, create_index, drop_index, create_view, drop_view, refresh_materialized_view, list_views_crud, view_data_crud, filter_view_data_crud, join_view_data_crud, insert_into_view_crud, update_view_crud, delete_from_view_crud, refresh_materialized_view_crud, rename_view_crud, modify_view_crud
from ..database import engine
from typing import List, Dict, Any, Optional, Tuple
import json

from ..schemas.indexview_schema import (
    IndexCreate,
    IndexDrop,
    ViewCreate,
    ViewDrop,
    MaterializedViewRefresh,
    InsertQuery,
    UpdateQuery,
    DeleteQuery,
    RenameViewQuery,
    ModifyViewQuery,
    IndexListItem
)

from app import crud, database

router = APIRouter(prefix="/indexview", tags=["IndexView"])

@router.post("/index/create")
def create_index_endpoint(data: IndexCreate):
    return create_index(data.index_name, data.table_name, data.column_name, data.index_type)

@router.post("/index/drop")
def drop_index_endpoint(data: IndexDrop):
    return drop_index(data.index_name)


@router.get("/index/list", response_model=List[IndexListItem])
def list_indexes_endpoint():
    try:
        indexes = list_indexes_crud()
        return indexes
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/view/create", summary="Create a new view")
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

@router.post("/view/drop", summary="Drop an existing view")
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

@router.post("/view/refresh", summary="Refresh a materialized view")
def refresh_view_endpoint(data: MaterializedViewRefresh):
    """
    Refresh a materialized view. This is only applicable to materialized views.

    - **view_name**: Name of the materialized view to refresh
    """
    return refresh_materialized_view(view_name=data.view_name)


# ---------------------------
# API Endpoints
# ---------------------------

@router.get("/views", response_model=List[dict])
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

@router.get("/views/{view_name}")
def view_data(view_name: str):
    """
    Retrieve all data from a given view.
    """
    try:
        data = view_data_crud(view_name)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/views/{view_name}/filter")
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

@router.get("/views/{view_name}/join")
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

@router.post("/views/{view_name}/insert")
def insert_into_view(view_name: str, insert_data: InsertQuery):
    """
    Insert values into an updatable view.
    """
    try:
        result = insert_into_view_crud(view_name, insert_data.values)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/views/{view_name}/update")
def update_view(view_name: str, update_data: UpdateQuery):
    """
    Update rows in an updatable view.
    """
    try:
        result = update_view_crud(view_name, update_data.set_clause, update_data.condition)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/views/{view_name}/delete")
def delete_from_view(view_name: str, delete_data: DeleteQuery):
    """
    Delete rows from an updatable view.
    """
    try:
        result = delete_from_view_crud(view_name, delete_data.condition)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/views/{view_name}/refresh")
def refresh_materialized_view(view_name: str):
    """
    Refresh a materialized view.
    """
    try:
        result = refresh_materialized_view_crud(view_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/views/rename")
def rename_view(rename_data: RenameViewQuery):
    """
    Rename a view.
    """
    try:
        result = rename_view_crud(rename_data.old_name, rename_data.new_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/views/modify")
def modify_view(modify_data: ModifyViewQuery):
    """
    Create or replace (modify) a view.
    """
    try:
        result = modify_view_crud(modify_data.view_name, modify_data.select_query)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))