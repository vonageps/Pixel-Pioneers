FROM --platform=linux/amd64 python:3.10-slim-bookworm

WORKDIR /app

RUN apt-get update \
  && apt-get install gcc -y \
  && apt-get install -y --no-install-recommends poppler-utils

COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt --no-cache-dir

COPY . /app

EXPOSE 80

CMD ["python", "app.py"]
