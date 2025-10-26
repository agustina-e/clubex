import sqlite3

# Ruta de la base de datos (puede cambiarse si se desea mover a una carpeta)
DB_PATH = 'usuarios.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # ⚠️ SOLO USAR DURANTE DESARROLLO PARA REINICIAR LA TABLA
    # DESCOMENTA la siguiente línea si querés empezar de cero
    # c.execute("DROP TABLE IF EXISTS usuarios")

    # Creamos la tabla si no existe (con nuevo campo avatar_color)
    c.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username     TEXT    UNIQUE NOT NULL,
            password     TEXT    NOT NULL,
            email        TEXT    UNIQUE NOT NULL,
            edad         INTEGER NOT NULL,
            avatar_color TEXT
        )
    ''')

    # Si la tabla ya existía pero NO tenía avatar_color, la alteramos
    c.execute("PRAGMA table_info(usuarios)")
    columnas = [row[1] for row in c.fetchall()]
    if 'avatar_color' not in columnas:
        c.execute("ALTER TABLE usuarios ADD COLUMN avatar_color TEXT")

    conn.commit()
    conn.close()
    print("✅ Base de datos inicializada correctamente.")

def get_db():
    """Devuelve una conexión SQLite a `usuarios.db`."""
    return sqlite3.connect(DB_PATH)

if __name__ == "__main__":
    init_db()

