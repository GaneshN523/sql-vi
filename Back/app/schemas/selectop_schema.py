from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

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

