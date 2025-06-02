# Student Management System with Docker

This project demonstrates how to develop and deploy a containerized RESTful API application using Node.js and MySQL. The application allows CRUD operations on student records and is managed through Docker containers on a Windows 10 environment.

## Features

- Create student records
- List all students
- MySQL database integration
- Docker containerization
- Adminer for database management (accessible at http://localhost:8080)

## Prerequisites

- Docker Desktop
- Node.js
- Postman


## Getting Started

1. Clone this repository
2. Navigate to the project directory
3. Run the following command to start the application:

```bash
docker-compose up --build
```

4. The API will be available at `http://localhost:3000`
5. Adminer (database management) will be available at `http://localhost:8080`

## API Endpoints

### Create a new student

```
POST /student
Content-Type: application/json

{
  "studentID": "0093276542",
  "studentName": "Ali",
  "course": "OS"
}
```

### Get all students

```
GET /students
```

### Health check

```
GET /health
```

## Database Configuration

- Host: `db` (container name)
- Port: `3306`
- Database: `studentdb`
- Username: `root`
- Password: `password`

## Stopping the Application

To stop the application, run:

```bash
docker-compose down
```

## Screenshots for Submission

Follow these steps to capture the required screenshots for your submission:

1. **Docker Build and Run**
   - Run `docker-compose up --build` and capture the output
   - Show running containers with `docker ps`

2. **Database Connection**
   - Access Adminer at http://localhost:8080
   - Login with the database credentials
   - Show the students table

3. **API Testing with Postman**
   - Create a new student (POST /student)
   - Try to create a duplicate student (should return 409)
   - List all students (GET /students)

4. **Docker Management**
   - Show running processes in Docker Desktop or `docker stats`
   - Show container logs with `docker logs student-api`
   - Show graceful shutdown with `docker stop student-api`
   - Show container removal with `docker rm student-api`

## Troubleshooting

- If you get port conflicts, make sure no other services are running on ports 3000, 3306, or 8080
- If the application fails to start, check the logs with `docker-compose logs`
- To reset the database, run `docker-compose down -v` (this will delete all data)
