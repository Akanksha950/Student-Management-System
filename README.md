# Student Management System

A full-stack web application built with **Python (Flask)**, **SQLite**, **HTML**, **CSS**, and **JavaScript**.

> Built as a portfolio project to demonstrate full-stack development skills — frontend, backend, REST API, and database.

---

## Screenshots

![Student Management System](<img width="1600" height="1066" alt="CSV" src="https://github.com/user-attachments/assets/2027058d-2cbe-42e4-9473-5893ce6f722b" />
)

---

## Features

- Add students with marks for 5 subjects
- Auto-calculate total, percentage, and grade (A / B / C / D / Fail)
- Edit student marks anytime
- Delete student records
- Search students by name (live search)
- Export all data to Excel-ready CSV file
- Print a formatted Report Card for any student
- Summary stats — total students, class average, top scorer, highest %

---

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | HTML, CSS, JavaScript (Fetch API) |
| Backend        | Python 3, Flask                   |
| Database       | SQLite                            |
| Version Control| Git & GitHub                      |

---

## Project Structure

```
student-management-system/
├── app.py                  # Flask backend + all REST API routes
├── students.db             # SQLite database (auto-created on first run)
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Frontend HTML page
├── static/
│   ├── style.css           # Styling
│   └── app.js              # JavaScript — fetch API calls to backend
└── README.md
```

---

## REST API Endpoints

| Method   | Endpoint              | Description                  |
|----------|-----------------------|------------------------------|
| GET      | `/`                   | Serve the frontend page      |
| GET      | `/students`           | Get all students             |
| GET      | `/students?search=x`  | Search students by name      |
| GET      | `/students/<id>`      | Get one student by ID        |
| POST     | `/add`                | Add a new student            |
| PUT      | `/edit/<id>`          | Update a student's marks     |
| DELETE   | `/delete/<id>`        | Delete a student record      |
| GET      | `/stats`              | Get class summary statistics |
| GET      | `/export/csv`         | Download all data as CSV     |

---

## Grade System

| Percentage     | Grade |
|----------------|-------|
| 75% and above  | A     |
| 60% – 74%      | B     |
| 45% – 59%      | C     |
| 33% – 44%      | D     |
| Below 33%      | Fail  |

---

## How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/student-management-system.git
cd student-management-system
```

### 2. Install dependencies
```bash
pip install flask
```

### 3. Run the app
```bash
python app.py
```

### 4. Open in browser
```
http://127.0.0.1:5000
```

The SQLite database (`students.db`) is created automatically on first run. No setup needed.

---

## What I Learned

- Building a REST API with Python and Flask
- Connecting a JavaScript frontend to a Python backend using `fetch()`
- Storing and querying data with SQLite
- CRUD operations (Create, Read, Update, Delete)
- Exporting data to CSV using Python's built-in `csv` module
- Version control with Git and GitHub

---

## Future Improvements

- Add user authentication (login / logout)
- Deploy online using Railway or Render
- Add charts showing grade distribution
- Switch to PostgreSQL for multi-user support
- Write unit tests with pytest
- Add pagination for large datasets

---

## Author

**Akanksha Kumari**  
Junior Software Developer  
[GitHub](https://github.com/Akanksha950)
