from flask import Flask ,render_template,request,redirect,url_for
from db import get_db_connection
app = Flask(__name__)

@app.route("/")
def home():
    return "App Run"

if __name__=="__main__":
    app.run(debug=True)