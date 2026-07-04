from flask import Flask ,render_template,request,redirect,url_for
from db import get_db_connection
from config import Config
app = Flask(__name__)

app.config["SECRET_KEY"]=Config.SECRET_KEY
@app.route("/")
def home():
    return "App Run"

if __name__=="__main__":
    app.run(debug=Config.DEBUG)