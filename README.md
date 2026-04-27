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
  - Go to "Network Access" in Atlas and add your IP address (or allow access from anywhere for development)
  - Go to "Database Access" and create a database user with read/write permissions
  - Go to "Connect > Connect your application"
  - Choose "Python" and version "3.6 or later"
  - Copy the connection string
  - Replace `<username>`, `<password>`, and `<database>` in the URI
  - Update `MONGO_URI` in `.env` with your full connection string
  - Example: `mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/contact_book?retryWrites=true&w=majority`

- **For local MongoDB:**
  - Install MongoDB locally
  - Use default `MONGO_URI=mongodb://localhost:27017/`

**Important:** Never commit your `.env` file to version control as it contains sensitive credentials.

## 3) Run

Start the Flask app:

```bash
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## Troubleshooting: CSS not loading

- Don’t open `templates/index.html` directly in the browser. Run the Flask app and open `http://127.0.0.1:5000/` so the template renders and `/static/...` is served.
- Quick check: open `http://127.0.0.1:5000/static/styles.css` — it should show the CSS file.

## Troubleshooting

### MongoDB Connection Issues
- **500 Error or "MongoDB is not reachable"**: Check your `.env` file has the correct Atlas connection string
- **Authentication failed**: Verify username/password in the connection string
- **Network access denied**: Ensure your IP is whitelisted in Atlas Network Access
- **SSL/TLS error**: The app is configured with `ssl=True` for Atlas compatibility

### Testing Connection
Visit `http://127.0.0.1:5000/api/health` to check if MongoDB is connected. It should return:
```json
{"ok": true, "time": "2026-04-27T...", "mongo": true}
```

If `mongo` is `false`, check your connection string and network access.
