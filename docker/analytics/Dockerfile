# Bouquet Analytics Pipeline Dockerfile
#
# Build:  docker build -t bouquet-analytics -f docker/analytics/Dockerfile .
# Run:    docker-compose -f docker-compose.analytics.yml up -d
#
# This image includes both:
#   - VPS analytics code (orchestrator, config, jobs) at /app/
#   - Original analytics code at /app/analytics/

FROM python:3.13-slim

# -------------------------------------------------------------------
# Java 17 via Eclipse Adoptium (Temurin)
# -------------------------------------------------------------------
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget gnupg \
    && wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor > /usr/share/keyrings/adoptium.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb bookworm main" > /etc/apt/sources.list.d/adoptium.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends temurin-17-jdk \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/temurin-17-jdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# -------------------------------------------------------------------
# Python dependencies
# -------------------------------------------------------------------
RUN pip install --no-cache-dir \
    pyspark==4.1.1 \
    fastapi \
    uvicorn \
    psycopg2-binary \
    python-dotenv

# -------------------------------------------------------------------
# Application code
# -------------------------------------------------------------------

# VPS orchestrator, config, and jobs (the Docker-ready pipeline)
COPY analytics/vps/orchestrator/ /app/orchestrator/
COPY analytics/vps/config/       /app/config/
COPY analytics/vps/jobs/         /app/jobs/

# Original analytics code (preserved for reference)
COPY analytics/orchestrator/ /app/analytics/orchestrator/
COPY analytics/jobs/         /app/analytics/jobs/
COPY analytics/diagrams/     /app/analytics/diagrams/

# -------------------------------------------------------------------
# Runtime
# -------------------------------------------------------------------
WORKDIR /app
RUN mkdir -p /app/data/bronze /app/data/silver /app/data/gold /app/logs

EXPOSE 8001

CMD ["uvicorn", "orchestrator.main:app", "--host", "0.0.0.0", "--port", "8001"]
