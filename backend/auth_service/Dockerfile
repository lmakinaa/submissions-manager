from debian:bullseye

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv

COPY src /app/src

WORKDIR /app

RUN python3 -m venv venv

RUN . venv/bin/activate && pip install -r src/requirements.txt

CMD ["uvicorn", "src.main:app", "--reload"]