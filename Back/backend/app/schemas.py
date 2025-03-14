# app/schemas.py

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TableRequest(BaseModel):
    table_name: str

class ColumnSchema(BaseModel):
    column_name: str
    column_type: str  # Example: "String", "Integer"

class ModifyTableRequest(BaseModel):
    table_name: str
    add_columns: Optional[List[ColumnSchema]] = []
    drop_columns: Optional[List[str]] = []
    modify_columns: Optional[List[ColumnSchema]] = []

class InsertRowRequest(BaseModel):
    table_name: str
    row_data: Dict[str, Any]

class UpdateRowRequest(BaseModel):
    table_name: str
    condition: Dict[str, Any]
    new_values: Dict[str, Any]

class DeleteRowRequest(BaseModel):
    table_name: str
    condition: Dict[str, Any]




# Select Section 

# Request model for select queries
class SelectQuerySchema(BaseModel):
    table: str
    columns: Optional[List[str]] = None
    where: Optional[Dict[str, Any]] = None
    order_by: Optional[str] = None
    order: Optional[str] = None
    limit: Optional[int] = None
    offset: Optional[int] = None
    group_by: Optional[str] = None
    having: Optional[str] = None
    distinct: bool = False
    join: Optional[List[Dict[str, str]]] = None  # Change: Now includes 'join_type', 'join_table', and 'condition'
    aggregate: Optional[Dict[str, str]] = None

# Response model: data plus the SQL query that was executed
class SelectResponse(BaseModel):
    data: List[Dict[str, Any]]
    query: str




# Indexes, Views & Sequence Section 

class IndexCreate(BaseModel):
    index_name: str
    table_name: str
    column_name: str
    index_type: str  # e.g., "BTREE", "HASH", "GIN", "GIST", "SPGIST", "BRIN"

class IndexDrop(BaseModel):
    index_name: str


class ViewCreate(BaseModel):
    view_type: str = Field(
        ...,
        description="Type of view to create. Allowed values: 'simple', 'materialized', 'updatable', 'recursive'."
    )
    view_name: str = Field(..., description="Name of the view to be created.")
    definition: str = Field(
        ...,
        description=(
            "The SELECT query that defines the view. "
            "For example: 'SELECT id, name, department FROM employees'"
        )
    )
    with_check_option: bool = Field(
        default=False,
        description=(
            "For updatable views only: if True, appends WITH CHECK OPTION "
            "to ensure that modifications conform to the view's WHERE clause."
        )
    )

class ViewDrop(BaseModel):
    view_type: str = Field(
        ...,
        description="Type of view to drop. Allowed values: 'simple', 'materialized', 'updatable', 'recursive'."
    )
    view_name: str = Field(..., description="Name of the view to be dropped.")

class MaterializedViewRefresh(BaseModel):
    view_name: str = Field(..., description="Name of the materialized view to refresh.")


class RenameViewQuery(BaseModel):
    old_name: str
    new_name: str

class ModifyViewQuery(BaseModel):
    view_name: str
    # This should be a complete SELECT query (without the terminating semicolon)
    select_query: str

class InsertQuery(BaseModel):
    # List of values to be inserted. Their order should match the view's column order.
    values: List[Any]

class UpdateQuery(BaseModel):
    # SET clause in the form "column1 = value1, column2 = value2"
    set_clause: str
    # WHERE condition clause (without the WHERE keyword)
    condition: str

class DeleteQuery(BaseModel):
    # WHERE condition clause (without the WHERE keyword)
    condition: str