from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud.sequence_crud import (
    get_db,
    create_sequence,
    get_next_value,
    get_current_value,
    set_sequence_value,
    restart_sequence,
    drop_sequence,
    list_sequences,
    view_sequence_details,
    associate_sequence,
    reset_sequence_for_table,
)
from app.schemas.sequence_schema import (
    SequenceCreate,
    SequenceSet,
    SequenceRestart,
    SequenceAssociate,
    SequenceResetTable,
)

router = APIRouter(prefix="/sequences", tags=["sequences"])

# Dependency injection for getting a synchronous DB session.
get_db = get_db

@router.post("/create", summary="Create a new sequence")
def create_sequence_route(seq: SequenceCreate, db: Session = Depends(get_db)):
    try:
        result = create_sequence(db, seq)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list", summary="List all sequences")
def list_all_sequences(db: Session = Depends(get_db)):
    try:
        sequences = list_sequences(db)
        return {"sequences": sequences}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{seq_name}/next", summary="Get next value of a sequence")
def next_value(seq_name: str, db: Session = Depends(get_db)):
    try:
        value = get_next_value(db, seq_name)
        return {"next_value": value}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{seq_name}/current", summary="Get current value of a sequence")
def current_value(seq_name: str, db: Session = Depends(get_db)):
    try:
        value = get_current_value(db, seq_name)
        return {"current_value": value}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{seq_name}/set", summary="Set sequence value manually")
def set_value(seq_name: str, seq_set: SequenceSet, db: Session = Depends(get_db)):
    try:
        new_value = set_sequence_value(db, seq_name, seq_set.value)
        return {"new_value": new_value}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{seq_name}/restart", summary="Restart sequence with a new start value")
def restart_sequence_route(seq_name: str, seq_restart: SequenceRestart, db: Session = Depends(get_db)):
    try:
        result = restart_sequence(db, seq_name, seq_restart.start_with)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{seq_name}/drop", summary="Drop a sequence")
def drop_sequence_route(seq_name: str, db: Session = Depends(get_db)):
    try:
        result = drop_sequence(db, seq_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{seq_name}/details", summary="View sequence details")
def view_details(seq_name: str, db: Session = Depends(get_db)):
    try:
        details = view_sequence_details(db, seq_name)
        return details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{seq_name}/associate", summary="Associate sequence with a table column")
def associate_sequence_route(seq_name: str, assoc: SequenceAssociate, db: Session = Depends(get_db)):
    try:
        result = associate_sequence(db, seq_name, assoc.table, assoc.column)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reset_table", summary="Reset sequence for a table column")
def reset_sequence_table(reset: SequenceResetTable, db: Session = Depends(get_db)):
    try:
        new_value = reset_sequence_for_table(db, reset.table, reset.column)
        return {"new_sequence_value": new_value}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
