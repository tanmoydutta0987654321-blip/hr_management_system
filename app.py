from flask import Flask, render_template, request, redirect, url_for
from db import get_db_connection
from config import Config
app = Flask(__name__)

app.config["SECRET_KEY"] = Config.SECRET_KEY

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/signin")
@app.route("/login")
def signin():
    return render_template("signin.html")

@app.route("/signup")
def signup():
    return render_template("sign_up.html")

@app.route("/admin_dashboard")
def admin_dashboard():
    return render_template("admin_dashboard.html")

@app.route("/daily_attendance")
def daily_attendance():
    return render_template("daily_attendance.html")

@app.route("/my_attendance")
def my_attendance():
    return render_template("my_attendance.html")

@app.route("/profile_management")
def profile_management():
    return render_template("profile_management.html")

@app.route("/employee_profile")
def employee_profile():
    return render_template("employee_profile.html")

if __name__ == "__main__":
    app.run(debug=True)