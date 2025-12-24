import sqlite3, os, sys

if len(sys.argv) < 2:
    print("Uso: python find_tamagotchi_user.py <username>")
    sys.exit(1)

target = sys.argv[1].lower()
DB = os.path.join(os.path.dirname(__file__), '..', 'tamagotchi-service', 'usuarios.db')
DB = os.path.normpath(DB)

if not os.path.exists(DB):
    print("No se encontró la base de datos en:", DB)
    sys.exit(1)

con = sqlite3.connect(DB)
cur = con.cursor()
try:
    cur.execute("SELECT id, username, email, edad FROM usuarios WHERE lower(username)=? LIMIT 50;", (target,))
    rows = cur.fetchall()
    if not rows:
        print("No se encontró el usuario:", target)
    else:
        print(f"Encontrado en: {DB}")
        for r in rows:
            print(r)
except Exception as e:
    print("Error al consultar:", e)
finally:
    con.close()