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

# کپی اسکریپت‌ها
COPY system_architecture.py .
COPY system_architecture_simplified.py .

# اجرای اسکریپت (پیش‌فرض: دیاگرام کامل)
# می‌توانید با docker run --entrypoint اسکریپت دیگری را اجرا کنید
ENTRYPOINT ["python"]
CMD ["system_architecture.py", "--all"]
