import datetime
import json
import os

DATA_FILE = "data/tamagotchi.json"

class Tamagotchi:
    def __init__(self, nombre, monedas=100):
        self.nombre = nombre
        self.hambre = 0
        self.sed = 0
        self.aburrimiento = 0
        self.vida = 100
        self.estado_coma = False
        self.tiempo_coma = 0
        self.coma_start_time = None
        self.recovery_start_time = None
        self.monedas = monedas
        self.last_hambre_sed_update = datetime.datetime.now()
        self.last_aburrimiento_update = datetime.datetime.now()

    def tick(self):
        if self.vida == 0 and not self.estado_coma:
            self.entrar_en_coma()

        if self.estado_coma:
            if self.coma_start_time:
                tiempo_transcurrido = (datetime.datetime.now() - self.coma_start_time).total_seconds()
                self.tiempo_coma = int(tiempo_transcurrido // 3600)
            return

        if self.hambre >= 50 and self.sed >= 50:
            self.vida = max(0, self.vida - 5)

        elapsed_hambre_sed = (datetime.datetime.now() - self.last_hambre_sed_update).total_seconds()
        horas_pasadas_hs = int(elapsed_hambre_sed // 3600)

        if horas_pasadas_hs > 0:
            if self.hambre < 100:
                self.hambre = min(100, self.hambre + 2 * horas_pasadas_hs)
            if self.sed < 100:
                self.sed = min(100, self.sed + 2 * horas_pasadas_hs)
            self.last_hambre_sed_update = datetime.datetime.now()

        elapsed_aburrimiento = (datetime.datetime.now() - self.last_aburrimiento_update).total_seconds()
        if self.aburrimiento < 100 and elapsed_aburrimiento >= 3 * 3600:
            self.aburrimiento = min(100, self.aburrimiento + 5)
            self.last_aburrimiento_update = datetime.datetime.now()

    def comer(self):
        if self.estado_coma or self.vida == 0:
            return "Tu Tamagotchi está en coma o muerto, no puedes hacer esto ahora."
        self.hambre = max(0, self.hambre - 10)
        self.vida = min(100, self.vida + 5)

    def beber(self):
        if self.estado_coma or self.vida == 0:
            return "Tu Tamagotchi está en coma o muerto, no puedes hacer esto ahora."
        self.sed = max(0, self.sed - 10)
        self.vida = min(100, self.vida + 5)

    def jugar(self):
        if self.estado_coma or self.vida == 0:
            return "Tu Tamagotchi está en coma o muerto, no puedes hacer esto ahora."
        self.aburrimiento = max(0, self.aburrimiento - 10)
        self.hambre += 2
        self.sed += 2

    def entrar_en_coma(self):
        if self.vida == 0:
            self.estado_coma = True
            self.coma_start_time = datetime.datetime.now()
            self.tiempo_coma = 0

    def pagar_para_revivir(self):
        if not self.estado_coma:
            return {"error": "Tu Tamagotchi no está en coma."}

        if self.recovery_start_time:
            return {"error": "Tu Tamagotchi ya está en recuperación."}

        if not self.coma_start_time:
            return {"error": "No hay registro de cuándo entró en coma."}

        horas_en_coma = (datetime.datetime.now() - self.coma_start_time).total_seconds() / 3600
        if horas_en_coma < 3:
            horas_faltantes = round(3 - horas_en_coma, 2)
            return {"error": f"Debes esperar {horas_faltantes} horas más para poder revivirlo."}

        costo = int(self.monedas * 0.3)
        if self.monedas < costo:
            return {"error": f"No tienes suficientes monedas. Necesitas {costo}."}

        self.monedas -= costo
        self.estado_coma = False
        self.coma_start_time = None
        self.recovery_start_time = datetime.datetime.now()

        return {"mensaje": f"Has pagado {costo} monedas. Tu Tamagotchi está en recuperación."}

    def actualizar_estado(self):
        if self.estado_coma and self.coma_start_time:
            tiempo_transcurrido = (datetime.datetime.now() - self.coma_start_time).total_seconds()
            self.tiempo_coma = int(tiempo_transcurrido // 3600)

        if self.recovery_start_time:
            tiempo_restante = (datetime.datetime.now() - self.recovery_start_time).total_seconds()
            if tiempo_restante >= 5 * 3600:
                self.recovery_start_time = None
                self.vida = 100
                self.hambre = 0
                self.sed = 0
                self.aburrimiento = 30

    def to_dict(self):
        return {
            "nombre": self.nombre,
            "hambre": self.hambre,
            "sed": self.sed,
            "aburrimiento": self.aburrimiento,
            "vida": self.vida,
            "estado_coma": self.estado_coma,
            "tiempo_coma": self.tiempo_coma,
            "monedas": self.monedas,
            "en_recuperacion": self.recovery_start_time is not None
        }

def guardar_estado(tama):
    os.makedirs("data", exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump({
            "nombre": tama.nombre,
            "hambre": tama.hambre,
            "sed": tama.sed,
            "aburrimiento": tama.aburrimiento,
            "vida": tama.vida,
            "estado_coma": tama.estado_coma,
            "tiempo_coma": tama.tiempo_coma,
            "comas_start_time": tama.coma_start_time.isoformat() if tama.coma_start_time else None,
            "recovery_start_time": tama.recovery_start_time.isoformat() if tama.recovery_start_time else None,
            "monedas": tama.monedas,
            "last_aburrimiento_update": tama.last_aburrimiento_update.isoformat()
        }, f, indent=4)

def cargar_estado():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
            tama = Tamagotchi(data["nombre"], data["monedas"])
            tama.hambre = data["hambre"]
            tama.sed = data["sed"]
            tama.aburrimiento = data["aburrimiento"]
            tama.vida = data["vida"]
            tama.estado_coma = data["estado_coma"]
            tama.tiempo_coma = data["tiempo_coma"]
            tama.coma_start_time = datetime.datetime.fromisoformat(data["comas_start_time"]) if data["comas_start_time"] else None
            tama.recovery_start_time = datetime.datetime.fromisoformat(data["recovery_start_time"]) if data["recovery_start_time"] else None
            tama.last_aburrimiento_update = datetime.datetime.fromisoformat(data["last_aburrimiento_update"])
            return tama
    return Tamagotchi("Usuario1")
