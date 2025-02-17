from debian:bullseye

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv

COPY src /app

WORKDIR /app

RUN python3 -m venv venv

RUN . venv/bin/activate && pip install -r requirements.txt

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0"]