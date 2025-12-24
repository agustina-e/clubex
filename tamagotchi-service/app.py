from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from werkzeug.security import generate_password_hash, check_password_hash
import atexit
import os
from models.tamagotchi import cargar_estado, guardar_estado
from database import init_db, get_db

# ————— Inicialización —————
app = Flask(__name__, static_folder="frontend", static_url_path="/static")
CORS(app)                           # ✅ Habilita CORS en todas las rutas
init_db()                           # ✅ Crea / actualiza la tabla de usuarios si hace falta
avatar = cargar_estado()            # Carga el estado del Tamagotchi

# Scheduler para los ticks automáticos cada 60 minutos
scheduler = BackgroundScheduler()
def automatic_tick():
    avatar.tick()
    guardar_estado(avatar)
scheduler.add_job(automatic_tick, 'interval', minutes=60)
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

# ————— RUTAS DE SERVICIO Y FRONT —————

@app.route("/")
def home():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'html'))
    return send_from_directory(base_dir, 'index.html')

@app.route("/html/<path:filename>")
def serve_html(filename):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'html'))
    return send_from_directory(base_dir, filename)

@app.route("/styles/<path:filename>")
def serve_styles(filename):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'styles'))
    return send_from_directory(base_dir, filename)

@app.route("/scripts/<path:filename>")
def serve_scripts(filename):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'scripts'))
    return send_from_directory(base_dir, filename)

@app.route("/img/<path:filename>")
def serve_images(filename):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'img'))
    return send_from_directory(base_dir, filename)

@app.route("/ping")
def ping():
    return jsonify({"success": True})

@app.route("/estado-sistemas")
def estado_sistemas():
    # Sólo devuelve un JSON simple para el .bat
    return jsonify({"flask": True})

# ————— RUTAS DE TAMA —————

@app.route("/estado", methods=["GET"])
def estado():
    return jsonify(avatar.get_estado())

@app.route("/comer", methods=["POST"])
def comer():
    avatar.comer()
    guardar_estado(avatar)
    return jsonify({"mensaje": "Comiste!", **avatar.get_estado()})

@app.route("/beber", methods=["POST"])
def beber():
    avatar.beber()
    guardar_estado(avatar)
    return jsonify({"mensaje": "Bebiste!", **avatar.get_estado()})

@app.route("/jugar", methods=["POST"])
def jugar():
    avatar.jugar()
    guardar_estado(avatar)
    return jsonify({"mensaje": "Jugaste!", **avatar.get_estado()})

@app.route("/revivir", methods=["POST"])
def revivir():
    result = avatar.pagar_para_revivir()
    guardar_estado(avatar)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200

@app.route("/estado_tamagotchi", methods=["GET"])
def estado_completo():
    avatar.actualizar_estado()
    return jsonify(avatar.get_estado_completo())

# ————— AUTENTICACIÓN —————

@app.route("/api/check-username", methods=["GET"])
def check_username():
    username = (request.args.get("username") or "").strip()
    if not username:
        return jsonify({"error": "No se proporcionó username"}), 400
    conn = get_db()
    cursor = conn.cursor()
    # buscar case-insensitive
    cursor.execute("SELECT COUNT(*) FROM usuarios WHERE lower(username) = ?", (username.lower(),))
    exists = (cursor.fetchone()[0] > 0)   # true si existe en DB
    conn.close()
    return jsonify({"exists": exists}), 200

@app.route("/api/check-email", methods=["GET"])
def check_email():
    email = (request.args.get("email") or "").strip()
    if not email:
        return jsonify({"error": "No se proporcionó email"}), 400
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM usuarios WHERE lower(email) = ?", (email.lower(),))
    exists = (cursor.fetchone()[0] > 0)
    conn.close()
    return jsonify({"exists": exists}), 200

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    email    = data.get("email")
    edad     = data.get("edad")

    conn = get_db()
    cursor = conn.cursor()

    # Verificar duplicados
    cursor.execute("SELECT 1 FROM usuarios WHERE username = ?", (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "El usuario ya existe"}), 400

    hashed = generate_password_hash(password, method="pbkdf2:sha256")
    cursor.execute(
        "INSERT INTO usuarios (username, password, email, edad) VALUES (?, ?, ?, ?)",
        (username, hashed, email, edad)
    )
    conn.commit()
    conn.close()
    return jsonify({"mensaje": "Usuario registrado con éxito"}), 200

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    # user = (id, username, password_hash, email, edad)
    if user and check_password_hash(user[2], password):
        return jsonify({"mensaje": "Login exitoso"}), 200
    return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

@app.route("/debug/user/<username>", methods=["GET"])
def debug_user(username):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({
        "id":       user[0],
        "username": user[1],
        "password": user[2],
        "email":    user[3],
        "edad":     user[4],
        "avatar_color": user[5] if len(user) > 5 else None
    })
    
# Obtener el color de avatar de un usuario
@app.route("/api/user/<username>/color", methods=["GET"])
def get_avatar_color(username):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT avatar_color FROM usuarios WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify({"avatar_color": row[0]})  # Será None si no eligió color aún

# Fijar el color de avatar de un usuario
@app.route("/api/user/<username>/color", methods=["POST"])
def set_avatar_color(username):
    data = request.get_json() or {}
    color = data.get("avatar_color")

    if not color:
        return jsonify({"error": "Falta avatar_color"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE usuarios SET avatar_color = ? WHERE username = ?", (color, username))
    app.logger.info("DEBUG set_avatar_color: user=%s color=%s", username, color)
    conn.commit()
    conn.close()

    return jsonify({"mensaje": "Color guardado"}), 200


# ————— ARRANQUE —————

if __name__ == "__main__":
    app.run(debug=True, port=5000)
