from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class IndexCreate(BaseModel):
    index_name: str
    table_name: str
    column_name: str
    index_type: str  # e.g., "BTREE", "HASH", "GIN", "GIST", "SPGIST", "BRIN"

class IndexDrop(BaseModel):
    index_name: str


class IndexListItem(BaseModel):
    indexname: str = Field(..., description="Name of the index")
    tablename: str = Field(..., description="Name of the table on which the index is defined")
    indexdef: str = Field(..., description="Definition of the index")

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