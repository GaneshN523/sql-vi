from pydantic import BaseModel
from enum import Enum
from typing import Optional

class IsolationLevel(str, Enum):
    READ_UNCOMMITTED = "READ UNCOMMITTED"
    READ_COMMITTED = "READ COMMITTED"
    REPEATABLE_READ = "REPEATABLE READ"
    SERIALIZABLE = "SERIALIZABLE"

class SavepointRequest(BaseModel):
    savepoint_name: str

class IsolationRequest(BaseModel):
    isolation_level: IsolationLevel

class LockTableRequest(BaseModel):
    table_name: str

class PreparedTransactionRequest(BaseModel):
    transaction_id: str

class NotifyRequest(BaseModel):
    channel_name: str
    message: Optional[str] = ""

class SnapshotRequest(BaseModel):
    snapshot_id: str

class AdvisoryLockRequest(BaseModel):
    key: int
