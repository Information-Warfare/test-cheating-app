import json
from flask import Flask, request, g
from database import database
from utils import question_clear

DEBUG = True
PORT = 5050

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
def q():
    question = request.args.get('question')
    if not question:
        return json.dumps({"status": "err#req_arg_get"})

    question = question_clear(question)
    response = db.select('answer', 'question', question, limit=1)
    if not response:
        return json.dumps({"status": "err#resp_empty"})

    return json.dumps({"status": "ok", "answer": response[0]['answer'], "modification": response[0]['modification']})


if __name__ == '__main__':
    app.run(host='192.168.1.100', port=PORT, debug=DEBUG)
