from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import inspect, text
from ..crud.selectop_crud import select_data, get_table_names
from ..database import engine
from typing import List, Dict, Any, Optional, Tuple
import json

from ..schemas.selectop_schema import (

    SelectResponse,
    SelectQuerySchema
)

from app import crud, database

router = APIRouter(prefix="/select", tags=["Select"])

@router.post("/select")
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

@router.get("/tablesview", response_model=List[str])
async def get_tables_endpoint():
    try:
        tables = get_table_names()
        return tables
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    


