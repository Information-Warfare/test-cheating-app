def question_clear(request: str) -> str:
    return request.replace('"', '').replace("'", "")