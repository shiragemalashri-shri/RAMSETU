import sqlite3

DATABASE_NAME = "ramsetu.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_NAME)
    connection.row_factory = sqlite3.Row
    return connection


def create_tables():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT UNIQUE NOT NULL,
            candidate_id TEXT NOT NULL,
            incident_type TEXT NOT NULL,
            status TEXT NOT NULL,
            candidate_response TEXT,
            reviewer_decision TEXT,
            decision_reason TEXT
        )
    """)

    connection.commit()
    connection.close()


def insert_sample_case():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT OR IGNORE INTO cases (
            case_id,
            candidate_id,
            incident_type,
            status,
            candidate_response,
            reviewer_decision,
            decision_reason
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        "RM-1024",
        "RS-2026-1042",
        "Suspected Examination Irregularity",
        "Under Review",
        None,
        None,
        None
    ))

    connection.commit()
    connection.close()