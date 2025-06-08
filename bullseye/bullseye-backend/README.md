# Bullseye Backend (FastAPI)

## Setup

1. Create a Python virtual environment and activate it
2. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`
3. Configure your database connection string in the \`.env\` file:
   \`\`\`
   DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
   \`\`\`
4. Run Alembic migrations (create your first migration manually for now):
   \`\`\`
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   \`\`\`
5. Run the FastAPI app:
   \`\`\`
   uvicorn app.main:app --reload
   \`\`\`

---
