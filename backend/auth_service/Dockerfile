from debian:bullseye

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip 

COPY src /app/src

WORKDIR /app

RUN pip install -r src/requirements.txt

CMD ["uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0"]
