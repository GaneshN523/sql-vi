🛠️ SQL Visualizer
Overview
SQL Visualizer is an interactive learning tool that helps users understand SQL concepts through an intuitive graphical UI. Instead of manually writing SQL queries, users can perform database operations visually, and the tool automatically generates real-time SQL queries.

This project is built using FastAPI, PostgreSQL, and React for a fast and scalable experience.

🌟 Features
✔️ Graphical Query Builder – Create SQL queries through a drag-and-drop interface.
✔️ Real-Time Query Generation – Automatically converts UI actions into SQL queries.
✔️ Live SQL Execution – Run generated queries and view results instantly.
✔️ ER Diagram Visualization – Understand table relationships visually.
✔️ Supports PostgreSQL – Uses a real relational database for execution.
✔️ Beginner & Advanced User Friendly – Ideal for learning and practicing SQL.

📌 Tech Stack
Frontend
React.js (Vite.js) – Fast UI rendering
Tailwind CSS – Modern and responsive UI
Backend
FastAPI – Handles query processing and API interactions
PostgreSQL – Relational database for executing queries
SQLAlchemy – ORM for database operations
Pydantic – Data validation and serialization
🚀 Getting Started
1️⃣ Clone the Repository
bash
Copy
Edit
git clone https://github.com/yourusername/sql-visualizer.git
cd sql-visualizer
2️⃣ Set Up the Backend (FastAPI + PostgreSQL)
Install dependencies
bash
Copy
Edit
cd backend
pip install -r requirements.txt
Configure PostgreSQL
Make sure you have PostgreSQL installed and running. Update the database configuration in config.py:

python
Copy
Edit
DATABASE_URL = "postgresql://username:password@localhost:5432/sql_visualizer"
Run Database Migrations (if using SQLAlchemy)
bash
Copy
Edit
alembic upgrade head
Start the FastAPI Server
bash
Copy
Edit
uvicorn main:app --reload
The API will be available at http://127.0.0.1:8000.

3️⃣ Set Up the Frontend (React + Vite.js)
Install dependencies
bash
Copy
Edit
cd frontend
npm install
Start the Development Server
bash
Copy
Edit
npm run dev
The app will be available at http://localhost:5173/.

