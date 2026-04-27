# Contact Book Application (CRUD)

Simple Contact Book app where you can **Create, Read, Update, Delete** contacts.

- Frontend: HTML + CSS + JavaScript
- Backend: Flask (Python)
- Database: MongoDB

## 1) Prerequisites

- Python 3.10+ (recommended)
- MongoDB running locally (or a MongoDB Atlas connection string)

## 2) Setup (Windows PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file (you can copy `.env.example`):

```powershell
Copy-Item .env.example .env
```

## 3) Run

Start MongoDB (if local), then run Flask:

```powershell
python app.py
```

Open:

- http://127.0.0.1:5000

## Troubleshooting: CSS not loading

- Don’t open `templates/index.html` directly in the browser. Run the Flask app and open `http://127.0.0.1:5000/` so the template renders and `/static/...` is served.
- Quick check: open `http://127.0.0.1:5000/static/styles.css` — it should show the CSS file.

## 4) API (for CRUD)

- `GET /api/contacts` (Read all)
- `POST /api/contacts` (Create)
- `PUT /api/contacts/<id>` (Update)
- `DELETE /api/contacts/<id>` (Delete)
