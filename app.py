import json
from datetime import datetime

from flask import Flask, request, g, send_file, send_from_directory
from database import database
from utils import question_clear

DEBUG = True
PORT = 5000
TOKEN = 'RTU MIREA'

app = Flask(__name__)
app.config.from_object(__name__)


@app.before_request
def before_request():
    global db
    if not hasattr(g, 'link_db'):
        g.link_db = database()
    db = g.link_db


@app.route('/', methods=['GET'])
def index():
    return "ok"


@app.route('/get_answer', methods=['GET'])
def get_answer():
    question = request.args.get('question')
    if not question:
        return json.dumps({"status": "error#request_argument_get.question"})
    token = request.args.get('token')
    if not token:
        return json.dumps({"status": "error#request_argument_get.token"})
    user = request.args.get('user')
    if not user:
        return json.dumps({"status": "error#request_argument_get.user"})
    question_num = request.args.get('question_num')
    if not question_num:
        return json.dumps({"status": "error#request_argument_get.question_num"})

    if token != TOKEN:
        return json.dumps({"status": "error#invalid_token"})

    question = question_clear(question)
    response = db.select('answer', 'question', question, limit=1)
    if not response:
        return json.dumps({"status": "error#response_empty"})
    response = response[0]
    _id = response['_id']
    answer = response['answer']
    modification = response['modification']
    competence = response['competence']
    type = response['type']

    return json.dumps({"status": "ok", "_id": _id, "answer": answer, "modification": modification, "competence": competence, "type": type})


def telemetry(user: str, question_num: str, question_id: str, modification: str, competence: str, type: str) -> None:
    db.insert('user', [user, question_num, question_id, modification, competence, type, str(datetime.now())])


if __name__ == '__main__':
    app.run(host='192.168.1.100', port=PORT, debug=DEBUG)
