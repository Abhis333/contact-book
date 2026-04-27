# Contact Book Application (CRUD)

Simple Contact Book app where you can **Create, Read, Update, Delete** contacts.

- Frontend: HTML + CSS + JavaScript
- Backend: Flask (Python)
- Database: MongoDB

## 1) Prerequisites

- Python 3.10+ (recommended)
- MongoDB (local installation or MongoDB Atlas account)

## 2) Setup

Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Database Configuration

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB details:

- **For MongoDB Atlas:**
  - Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
  - Create a cluster
  - Get the connection string from "Connect > Connect your application"
  - Update `MONGO_URI` in `.env` (it should look like `mongodb+srv://username:password@cluster.mongodb.net/contact_book`)

- **For local MongoDB:**
  - Install MongoDB locally
  - Use default `MONGO_URI=mongodb://localhost:27017/`

## 3) Run

Start the Flask app:

```bash
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## Troubleshooting: CSS not loading

- Don’t open `templates/index.html` directly in the browser. Run the Flask app and open `http://127.0.0.1:5000/` so the template renders and `/static/...` is served.
- Quick check: open `http://127.0.0.1:5000/static/styles.css` — it should show the CSS file.

## 4) API (for CRUD)

- `GET /api/contacts` (Read all)
- `POST /api/contacts` (Create)
- `PUT /api/contacts/<id>` (Update)
- `DELETE /api/contacts/<id>` (Delete)
