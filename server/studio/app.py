from collections import namedtuple
from multiprocessing import current_process
import sqlite3
from flask import Flask, jsonify, request
from json import dumps, loads
from flask_socketio import SocketIO
from .scene_player import ScenePlayer
from .models import Frame

app = Flask(__name__)
player = None
socketio = SocketIO(app, cors_allowed_origins="*", allow_unsafe_werkzeug=True)

SceneQueryResult = namedtuple("Scene", ["id", "data"])


def init_db():
    print("creating database")
    con = sqlite3.connect("studio.db")
    cur = con.cursor()
    cur.execute(
        "CREATE TABLE IF NOT EXISTS scenes (id INTEGER PRIMARY KEY, data JSON NOT NULL)"
    )
    con.commit()

    try:
        cur = con.cursor()
        cur.execute("ALTER TABLE scenes ADD COLUMN locked INTEGER DEFAULT 0")
        con.commit()
    except Exception:
        pass


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


@app.route("/api/scenes/<int:scene_id>", methods=["DELETE"])
def delete_scene(scene_id):
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    cur.execute("DELETE FROM scenes WHERE id = ?", (scene_id,)).fetchone()
    con.commit()
    return jsonify({})


@app.route("/api/player", methods=["GET"])
def get_scene_state():
    if scene := player.get_scene():
        return jsonify(
            {
                "isPlaying": player.is_playing(),
                "sceneId": scene.get("id"),
                "scene": scene,
            }
        )

    return jsonify(
        {
            "isPlaying": False,
            "sceneId": None,
            "scene": None,
        }
    )


@app.route("/api/player/play", methods=["POST"])
def play_scene():
    con = sqlite3.connect("studio.db")
    cur = con.cursor()

    data = request.get_json()
    scene_id = data["sceneId"]
    scene = get_scene_by_id(cur, scene_id)
    if scene:
        player.play_scene(scene.data)
        return jsonify({})
    else:
        return jsonify({"error": "Scene not found"}), 404


@app.route("/api/player/stop", methods=["POST"])
def stop_scene():
    player.stop_scene()
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


# socket io
@socketio.on("init_realtime")
def handle_init_realtime_event(json):
    pass


@socketio.on("set_frame")
def handle_set_leds_event(json):
    frame: Frame = json["frame"]
    player.set_frame(frame)


if __name__ == "__main__":
    player = ScenePlayer()
    init_db()
    app.run(host="0.0.0.0", port=5000, use_reloader=False)
