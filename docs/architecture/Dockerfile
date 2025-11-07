FROM python:3.11-slim

# نصب Graphviz
RUN apt-get update && \
    apt-get install -y graphviz && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# نصب Python dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# کپی اسکریپت
COPY system_architecture.py .

# اجرای اسکریپت
CMD ["python", "system_architecture.py"]
