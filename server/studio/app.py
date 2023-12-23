import logging
import subprocess

logging.basicConfig(level=logging.DEBUG)
root_logger = logging.getLogger()
root_logger.addHandler(logging.FileHandler("logs.txt", mode="a"))

from collections import namedtuple
from multiprocessing import current_process
import sqlite3
from flask import Flask, jsonify, request
from json import dumps, loads
from flask_socketio import SocketIO
from .scene_player import MusicSyncSettings, ScenePlayer
from .models import Frame
import studio.programs
from werkzeug.exceptions import BadRequest

app = Flask(__name__)
player = None
socketio = SocketIO(app, cors_allowed_origins="*", allow_unsafe_werkzeug=True)

SceneQueryResult = namedtuple("Scene", ["id", "data"])
logger = logging.getLogger(__name__)


def init_db():
    logger.debug("creating database")
    con = sqlite3.connect("studio.db")
    cur = con.cursor()
    cur.execute(
        "CREATE TABLE IF NOT EXISTS scenes (id INTEGER PRIMARY KEY, data JSON NOT NULL)"
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS music_sync_settings
            (
                id INTEGER PRIMARY KEY,
                activation_threshold FLOAT NOT NULL,
                transition_scale FLOAT NOT NULL,
                low_range_color_scale FLOAT NOT NULL,
                mid_range_color_scale FLOAT NOT NULL,
                high_range_color_scale FLOAT NOT NULL,
                low_range INTEGER NOT NULL,
                mid_range INTEGER NOT NULL
            )
        """
    )
    con.commit()

    try:
        cur = con.cursor()
        cur.execute("ALTER TABLE scenes ADD COLUMN locked INTEGER DEFAULT 0")
        con.commit()
    except Exception:
        pass

    try:
        cur = con.cursor()
        cur.execute(
            """
                INSERT INTO music_sync_settings (
                    id,
                    activation_threshold,
                    transition_scale,
                    low_range_color_scale,
                    mid_range_color_scale,
                    high_range_color_scale,
                    low_range,
                    mid_range
                ) VALUES (0, 0.2, 0.2, 1.0, 1.0, 1.0, 50, 500)
            """)
        con.commit()
    except Exception:
        pass

    logger.debug("database created")


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    return response


def get_last_scene_id(cur: sqlite3.Cursor) -> None:
    res = cur.execute("SELECT id FROM scenes ORDER BY id DESC LIMIT 1").fetchone()
    if res:
        return res[0]

    return -1


def get_scene_by_id(cur: sqlite3.Cursor, scene_id: int) -> SceneQueryResult | None:
    res = cur.execute(
        "SELECT id, data FROM scenes WHERE id = ?", (scene_id,)
    ).fetchone()
    if res:
        id_ = res[0]
        data = loads(res[1])
        data["id"] = id_
        scene = SceneQueryResult(id_, data)

        return scene

    return None


def get_scenes(cur: sqlite3.Cursor) -> list[SceneQueryResult]:
    scenes = []
    for row in cur.execute("SELECT id, data FROM scenes").fetchall():
        id_ = row[0]
        data = loads(row[1])
        data["id"] = id_
        scene = SceneQueryResult(id_, data)
        scenes.append(scene)

    return scenes


# SCENES CRUd
@app.route("/api/scenes", methods=["GET"])
def list_scenes():
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    scenes = get_scenes(cur)
    return jsonify({"scenes": [scene.data for scene in scenes]})


@app.route("/api/scenes/<int:scene_id>", methods=["GET"])
def get_scene(scene_id):
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    scene = get_scene_by_id(cur, scene_id)
    if scene:
        return jsonify({"scene": scene.data})
    else:
        return jsonify({"error": "Scene not found"}), 404


@app.route("/api/scenes", methods=["POST"])
def create_scene():
    con = sqlite3.connect("studio.db")
    cur = con.cursor()
    data = request.get_json()

    next_id = get_last_scene_id(cur) + 1

    data = {
        "id": next_id,
        "name": "New Scene",
        "ledPositions": {},
        "frames": [{"ledStates": {}}],
        "fps": 5,
        "brightness": 20,
    }

    cur.execute(
        "INSERT INTO scenes (id, data) VALUES (?,?)",
        (
            next_id,
            dumps(data),
        ),
    )
    con.commit()

    return jsonify({"id": next_id})


@app.route("/api/scenes/<int:scene_id>", methods=["PUT"])
def update_scene(scene_id):
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    data = request.get_json()
    cur.execute(
        "UPDATE scenes SET data = ? WHERE id = ?", (dumps(data), scene_id)
    ).fetchone()
    con.commit()
    return jsonify({"id": scene_id})


@app.route("/api/scenes/<int:scene_id>", methods=["DELETE"])
def delete_scene(scene_id):
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    cur.execute("DELETE FROM scenes WHERE id = ?", (scene_id,)).fetchone()
    con.commit()
    return jsonify({})


# SCENE Commands
@app.route("/api/scenes/<int:scene_id>/play", methods=["POST"])
def play_scene(scene_id):
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    scene = get_scene_by_id(cur, scene_id)
    if scene:
        player.play_scene(scene.data)
        return jsonify({})
    else:
        return jsonify({"error": "Scene not found"}), 404


@app.route("/api/scenes/<int:scene_id>/copy", methods=["POST"])
def copy_scene(scene_id):
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    scene = get_scene_by_id(cur, scene_id)
    if scene:
        data = scene.data
        next_id = get_last_scene_id(cur) + 1
        data["id"] = next_id
        cur.execute(
            "INSERT INTO scenes (id, data) VALUES (?,?)",
            (
                next_id,
                dumps(data),
            ),
        )
        con.commit()
        return jsonify({"id": next_id})
    else:
        return jsonify({"error": "Scene not found"}), 404


@app.route("/api/scenes/<int:scene_id>/lock", methods=["POST"])
def lock_scene(scene_id):
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    cur.execute("UPDATE scenes SET locked = 1 WHERE id = ?", (scene_id,)).fetchone()
    con.commit()
    return jsonify({})


@app.route("/api/scenes/<int:scene_id>/unlock", methods=["POST"])
def unlock_scene(scene_id):
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    cur.execute("UPDATE scenes SET locked = 0 WHERE id = ?", (scene_id,)).fetchone()
    con.commit()
    return jsonify({})


# PLAYER Controls
@app.route("/api/player", methods=["GET"])
def get_scene_state():
    player_state = player.get_state()

    return jsonify(
        {
            "isPlaying": player_state["is_playing"],
            "scene": player_state["current_scene"],
            "program": player_state["current_program"],
        }
    )


@app.route("/api/player/play", methods=["POST"])
def play():
    player.play()
    return jsonify({})


@app.route("/api/player/pause", methods=["POST"])
def pause():
    player.pause()
    return jsonify({})


@app.route("/api/player/stop", methods=["POST"])
def stop():
    player.stop()
    return jsonify({})


@app.route("/api/player/show-frame", methods=["POST"])
def show_frame():
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    data = request.get_json()
    scene_id = data["sceneId"]
    frame_num = data["frameNum"]

    scene = get_scene_by_id(cur, scene_id)
    if scene:
        player.show_frame(scene.data, frame_num)
        return jsonify({})
    else:
        return jsonify({"error": "Scene not found"}), 404


# PROGRAMS CRUD
@app.route("/api/programs", methods=["GET"])
def list_programs():
    return jsonify(studio.programs.programs_list)


# PROGRAM Commands
@app.route("/api/programs/<program_name>/start", methods=["POST"])
def start_program(program_name):
    player.run_program(program_name)
    return jsonify({})

@app.route("/api/sync-music/settings", methods=["GET"])
def get_sync_music_settings():
    con = sqlite3.connect("studio.db")
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    settings = cur.execute(
        """
        select * from music_sync_settings WHERE id = 0;
        """).fetchone()
    return jsonify(**{
        key: settings[key]
        for key in settings.keys()
        if key != "id"
    })

@app.route("/api/sync-music/settings", methods=["PUT"])
def set_sync_music_settings():
    data = MusicSyncSettings(**request.get_json())

    # some validations
    if data.activation_threshold < 0 or data.activation_threshold > 1:
        raise BadRequest("activation_threshold must be between 0 and 1")
    
    if data.low_range < 1 or data.low_range > 1024:
        raise BadRequest("low_range must be between 0 and 1024")
    
    if data.mid_range < data.low_range or data.mid_range > 1024:
        raise BadRequest("mid_range must be greater than low_range")
    
    con = sqlite3.connect("studio.db")
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute(
        """
        UPDATE music_sync_settings SET
            activation_threshold = ?,
            transition_scale = ?,
            low_range_color_scale = ?,
            mid_range_color_scale = ?,
            high_range_color_scale = ?,
            low_range = ?,
            mid_range = ?
        WHERE id = 0;
        """, (
            data.activation_threshold,
            data.transition_scale,
            data.low_range_color_scale,
            data.mid_range_color_scale,
            data.high_range_color_scale,
            data.low_range,
            data.mid_range
        ))
    con.commit()
    return jsonify({})

@app.route("/api/sync-music", methods=["POST"])
def sync_music():
    con = sqlite3.connect("studio.db")
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    settings = cur.execute(
        """
        select * from music_sync_settings WHERE id = 0;
        """).fetchone()

    player.sync_music(MusicSyncSettings(**{
        key: settings[key]
        for key in settings.keys()
        if key != "id"
    }))
    return jsonify({})


# LOGS
@app.route("/api/logs", methods=["GET"])
def get_logs():
    try:
        output = subprocess.run(["tail", "-n", "100", "logs.txt"], capture_output=True)
        logs = output.stdout.decode("utf-8").split("\n")
        return jsonify(logs)
    except Exception:
        return jsonify({"logs": []})


# realtime events
@socketio.on("set_frame")
def handle_set_leds_event(json):
    frame: Frame = json["frame"]
    player.set_frame(frame)


if __name__ == "__main__":
    player = ScenePlayer()
    init_db()
    app.run(host="0.0.0.0", port=5000, use_reloader=False)
