# Use Python base image
FROM python:3.8

# Set working directory
WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements .
RUN pip install -r requirements

# Copy application code
COPY main.py .
COPY models.py .
COPY matierepremiere.xlsx .

# Expose port for container
EXPOSE 8000 

# Define environment variables
ENV DB_HOST=""
ENV DB_NAME="" 
ENV DB_USER=""
ENV DB_PASSWORD=""

# Run database migrations on startup
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Build image 
#docker build -t backend .

# Run container 
#docker run -dti --name back -e DB_NAME=prod -e DB_HOST=192.168.1.114 -e DB_USER=postgres  -e DB_PASSWORD=doumi2023 -p 9876:8000 backend