import mysql.connector
from config import Config
conn=None
cursor=None
def get_db_connection():
    try:
        conn=mysql.connector.connect(
            host = Config.DB_HOST,
            user = Config.DB_USER,
            password = Config.DB_PASSWORD,
            database = Config.DB_NAME
        )
        if(conn.is_connected()):
            print("MYSQL Database connected Successfully !")
            return conn
    except mysql.connector.Error as e:
        print("Error :",e)
        return None

if __name__=="__main__":
    get_db_connection()