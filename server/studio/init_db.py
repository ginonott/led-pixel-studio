import sqlite3

con = sqlite3.connect("studio.db")
cur = con.cursor()

cur.execute("CREATE TABLE IF NOT EXISTS scenes (id INTEGER PRIMARY KEY AUTOINCREMENT, data JSON NOT NULL)")