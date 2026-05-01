from flask import Flask, request, jsonify, render_template, Response
import sqlite3
import csv
import io

app = Flask(__name__)
DB = "students.db"


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            maths INTEGER,
            science INTEGER,
            english INTEGER,
            hindi INTEGER,
            computer INTEGER,
            total INTEGER,
            percentage REAL,
            grade TEXT
        )
    """)
    conn.commit()
    conn.close()


def calculate_grade(percentage):
    if percentage >= 75:
        return "A"
    elif percentage >= 60:
        return "B"
    elif percentage >= 45:
        return "C"
    elif percentage >= 33:
        return "D"
    else:
        return "Fail"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/students", methods=["GET"])
def get_students():
    conn = get_db()
    search = request.args.get("search", "")
    if search:
        rows = conn.execute(
            "SELECT * FROM students WHERE name LIKE ? ORDER BY id DESC",
            (f"%{search}%",)
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM students ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/students/<int:student_id>", methods=["GET"])
def get_student(student_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM students WHERE id = ?", (student_id,)).fetchone()
    conn.close()
    if row:
        return jsonify(dict(row))
    return jsonify({"error": "Student not found"}), 404


@app.route("/add", methods=["POST"])
def add_student():
    data = request.json
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    subjects = ["maths", "science", "english", "hindi", "computer"]
    marks = []
    for s in subjects:
        try:
            m = int(data.get(s, 0))
            if not (0 <= m <= 100):
                return jsonify({"error": f"{s.capitalize()} marks must be 0-100"}), 400
            marks.append(m)
        except ValueError:
            return jsonify({"error": f"Invalid marks for {s}"}), 400

    total = sum(marks)
    percentage = round(total / len(subjects), 2)
    grade = calculate_grade(percentage)

    conn = get_db()
    conn.execute(
        "INSERT INTO students (name, maths, science, english, hindi, computer, total, percentage, grade) VALUES (?,?,?,?,?,?,?,?,?)",
        (name, *marks, total, percentage, grade)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": f"Student '{name}' added successfully!", "grade": grade, "percentage": percentage})


@app.route("/edit/<int:student_id>", methods=["PUT"])
def edit_student(student_id):
    data = request.json
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    subjects = ["maths", "science", "english", "hindi", "computer"]
    marks = []
    for s in subjects:
        try:
            m = int(data.get(s, 0))
            if not (0 <= m <= 100):
                return jsonify({"error": f"{s.capitalize()} marks must be 0-100"}), 400
            marks.append(m)
        except ValueError:
            return jsonify({"error": f"Invalid marks for {s}"}), 400

    total = sum(marks)
    percentage = round(total / len(subjects), 2)
    grade = calculate_grade(percentage)

    conn = get_db()
    conn.execute(
        "UPDATE students SET name=?, maths=?, science=?, english=?, hindi=?, computer=?, total=?, percentage=?, grade=? WHERE id=?",
        (name, *marks, total, percentage, grade, student_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": f"Student '{name}' updated!", "grade": grade, "percentage": percentage})


@app.route("/delete/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    conn = get_db()
    conn.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Student deleted successfully"})


@app.route("/stats", methods=["GET"])
def get_stats():
    conn = get_db()
    row = conn.execute("""
        SELECT
            COUNT(*) as total_students,
            ROUND(AVG(percentage), 2) as class_average,
            MAX(percentage) as highest_percentage,
            MIN(percentage) as lowest_percentage
        FROM students
    """).fetchone()
    top = conn.execute("SELECT name, percentage FROM students ORDER BY percentage DESC LIMIT 1").fetchone()
    conn.close()
    stats = dict(row)
    stats["top_student"] = dict(top) if top else None
    return jsonify(stats)


@app.route("/export/csv", methods=["GET"])
def export_csv():
    conn = get_db()
    rows = conn.execute("SELECT * FROM students ORDER BY name").fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Maths", "Science", "English", "Hindi", "Computer", "Total", "Percentage", "Grade"])
    for row in rows:
        writer.writerow([row["id"], row["name"], row["maths"], row["science"],
                         row["english"], row["hindi"], row["computer"],
                         row["total"], row["percentage"], row["grade"]])
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_report.csv"}
    )


if __name__ == "__main__":
    init_db()
    print("\n Student Management System is running!")
    print(" Open your browser and go to: http://127.0.0.1:5000\n")
    app.run(debug=True)