from pydantic import BaseModel
from typing import Optional

class SequenceCreate(BaseModel):
    name: str
    start: Optional[int] = 1
    increment: Optional[int] = 1
    min_value: Optional[int] = None
    max_value: Optional[int] = None
    cache: Optional[int] = None
    cycle: Optional[bool] = False

class SequenceSet(BaseModel):
    value: int

class SequenceRestart(BaseModel):
    start_with: int

class SequenceAssociate(BaseModel):
    table: str
    column: str

class SequenceResetTable(BaseModel):
    table: str
    column: str
