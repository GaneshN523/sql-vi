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