from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud.transaction_crud import (
    get_db,
    begin_transaction,
    commit_transaction,
    rollback_transaction,
    create_savepoint,
    rollback_to_savepoint,
    release_savepoint,
    end_transaction,
    abort_transaction,
    set_transaction_isolation,
    set_session_isolation,
    lock_table,
    set_transaction_snapshot,
    export_snapshot,
    prepare_transaction,
    commit_prepared,
    rollback_prepared,
    listen_channel,
    notify_channel,
    unlisten_channel,
    advisory_lock,
    advisory_unlock,
    advisory_xact_lock,
    advisory_unlock_all,
)
from app.schemas.transaction_schema import (
    SavepointRequest,
    IsolationRequest,
    LockTableRequest,
    PreparedTransactionRequest,
    NotifyRequest,
    SnapshotRequest,
    AdvisoryLockRequest,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/begin", summary="Begin a new transaction")
def begin_transaction_route(db: Session = Depends(get_db)):
    try:
        return begin_transaction(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/commit", summary="Commit the current transaction")
def commit_transaction_route(db: Session = Depends(get_db)):
    try:
        return commit_transaction(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/rollback", summary="Rollback the current transaction")
def rollback_transaction_route(db: Session = Depends(get_db)):
    try:
        return rollback_transaction(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/savepoint", summary="Create a savepoint")
def create_savepoint_route(request: SavepointRequest, db: Session = Depends(get_db)):
    try:
        return create_savepoint(db, request.savepoint_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/rollback_to_savepoint", summary="Rollback to a specific savepoint")
def rollback_to_savepoint_route(request: SavepointRequest, db: Session = Depends(get_db)):
    try:
        return rollback_to_savepoint(db, request.savepoint_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/release_savepoint", summary="Release a specific savepoint")
def release_savepoint_route(request: SavepointRequest, db: Session = Depends(get_db)):
    try:
        return release_savepoint(db, request.savepoint_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/end", summary="End the transaction (commit)")
def end_transaction_route(db: Session = Depends(get_db)):
    try:
        return end_transaction(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/abort", summary="Abort the transaction (rollback)")
def abort_transaction_route(db: Session = Depends(get_db)):
    try:
        return abort_transaction(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/set_transaction_isolation", summary="Set transaction isolation level")
def set_transaction_isolation_route(request: IsolationRequest, db: Session = Depends(get_db)):
    try:
        return set_transaction_isolation(db, request.isolation_level)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/set_session_isolation", summary="Set session isolation level")
def set_session_isolation_route(request: IsolationRequest, db: Session = Depends(get_db)):
    try:
        return set_session_isolation(db, request.isolation_level)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/lock_table", summary="Lock a table")
def lock_table_route(request: LockTableRequest, db: Session = Depends(get_db)):
    try:
        return lock_table(db, request.table_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/set_snapshot", summary="Set transaction snapshot")
def set_snapshot_route(request: SnapshotRequest, db: Session = Depends(get_db)):
    try:
        return set_transaction_snapshot(db, request.snapshot_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/export_snapshot", summary="Export transaction snapshot")
def export_snapshot_route(db: Session = Depends(get_db)):
    try:
        return export_snapshot(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/prepare_transaction", summary="Prepare a two-phase transaction")
def prepare_transaction_route(request: PreparedTransactionRequest, db: Session = Depends(get_db)):
    try:
        return prepare_transaction(db, request.transaction_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/commit_prepared", summary="Commit a prepared transaction")
def commit_prepared_route(request: PreparedTransactionRequest, db: Session = Depends(get_db)):
    try:
        return commit_prepared(db, request.transaction_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/rollback_prepared", summary="Rollback a prepared transaction")
def rollback_prepared_route(request: PreparedTransactionRequest, db: Session = Depends(get_db)):
    try:
        return rollback_prepared(db, request.transaction_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/listen", summary="Listen on a notification channel")
def listen_channel_route(request: NotifyRequest, db: Session = Depends(get_db)):
    try:
        return listen_channel(db, request.channel_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/notify", summary="Send a notification")
def notify_channel_route(request: NotifyRequest, db: Session = Depends(get_db)):
    try:
        return notify_channel(db, request.channel_name, request.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/unlisten", summary="Stop listening on a channel")
def unlisten_channel_route(request: NotifyRequest, db: Session = Depends(get_db)):
    try:
        return unlisten_channel(db, request.channel_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/advisory_lock", summary="Acquire an advisory lock")
def advisory_lock_route(request: AdvisoryLockRequest, db: Session = Depends(get_db)):
    try:
        return advisory_lock(db, request.key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/advisory_unlock", summary="Release an advisory lock")
def advisory_unlock_route(request: AdvisoryLockRequest, db: Session = Depends(get_db)):
    try:
        return advisory_unlock(db, request.key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/advisory_xact_lock", summary="Acquire an advisory transaction lock")
def advisory_xact_lock_route(request: AdvisoryLockRequest, db: Session = Depends(get_db)):
    try:
        return advisory_xact_lock(db, request.key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/advisory_unlock_all", summary="Release all advisory locks")
def advisory_unlock_all_route(db: Session = Depends(get_db)):
    try:
        return advisory_unlock_all(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
