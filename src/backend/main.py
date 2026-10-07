from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import create_tables, insert_sample_case, get_connection


app = FastAPI(
    title="RAMSETU API",
    description="Examination Integrity & Fair Resolution Backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ramsetu-five.vercel.app",
],"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database and sample data when server starts
create_tables()
insert_sample_case()


@app.get("/")
def root():
    return {
        "message": "RAMSETU Backend is running",
        "status": "success"
    }


@app.get("/api/case")
def get_case():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            case_id,
            candidate_id,
            incident_type,
            status,
            candidate_response,
            reviewer_decision,
            decision_reason
        FROM cases
        WHERE case_id = ?
    """, ("RM-1024",))

    case = cursor.fetchone()
    connection.close()

    if case is None:
        return {
            "message": "Case not found"
        }

    return dict(case)


class CandidateResponse(BaseModel):
    case_id: str
    response: str


@app.post("/api/case/respond")
def submit_candidate_response(data: CandidateResponse):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE cases
        SET
            candidate_response = ?,
            status = 'Under Review'
        WHERE case_id = ?
    """, (data.response, data.case_id))

    connection.commit()
    connection.close()

    return {
        "message": "Candidate response submitted successfully",
        "case_id": data.case_id,
        "status": "Under Review"
    }


class ReviewerDecision(BaseModel):
    case_id: str
    decision: str
    reason: str


@app.post("/api/case/decision")
def submit_reviewer_decision(data: ReviewerDecision):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE cases
        SET
            reviewer_decision = ?,
            decision_reason = ?,
            status = ?
        WHERE case_id = ?
    """, (
        data.decision,
        data.reason,
        data.decision,
        data.case_id
    ))

    connection.commit()
    connection.close()

    return {
        "message": "Reviewer decision submitted successfully",
        "case_id": data.case_id,
        "decision": data.decision,
        "status": data.decision
    }