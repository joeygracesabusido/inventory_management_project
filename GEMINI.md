# Project Context: FastAPI + GraphQL + Frontend App

## Project Overview
- Purpose: A web application with a FastAPI backend, Strawberry GraphQL API, and a frontend built with jQuery, vanilla JavaScript, and Tailwind CSS, all containerized using Docker.
- Goal: Provide a scalable API for querying data and a responsive frontend for user interaction.

## Tech Stack
- **Backend**:
  - FastAPI (Python) for RESTful APIs.
  - Strawberry GraphQL for GraphQL endpoints.
- **Frontend**:
  - jQuery for DOM manipulation and AJAX requests.
  - Vanilla JavaScript for custom logic.
  - Tailwind CSS for styling.
- **Containerization**:
  - Docker for containerizing the backend and frontend services.
  - Docker Compose for multi-container orchestration.

## Project Structure
- `/backend`: FastAPI and Strawberry GraphQL code.
  - `backend/app/main.py`: FastAPI application entry point.
  -`/views`: Strawberry Graphql
  - `/backend/graphql/schema.py`: Strawberry GraphQL schema definitions.
- `/frontend`: Frontend code.
  - `/frontend/index.html`: Main HTML file.
  - `/frontend/js/`: jQuery and vanilla JavaScript files.
  - `/frontend/css/`: Tailwind CSS output (e.g., `output.css`).
- `/docker`: Docker-related files.
  - `/docker/Dockerfile.backend`: Dockerfile for FastAPI backend.
  - `/docker/Dockerfile.frontend`: Dockerfile for frontend.
  - `docker-compose.yml`: Multi-container setup.
- `requirements.txt`: Python dependencies for the backend.
- `package.json`: Frontend dependencies (e.g., Tailwind CSS, jQuery).

## Coding Standards
- **FastAPI**:
  - Follow PEP 8 for Python code.
  - Use 4-space indentation.
  - Include docstrings for all endpoints and functions.
  - Use Pydantic models for request/response validation.
- **Strawberry GraphQL**:
  - Define schemas in `/backend/graphql/schema.py`.
  - Use clear, descriptive names for types, queries, and mutations.
  - Include comments for complex resolvers.
- **jQuery and Vanilla JavaScript**:
  - Organize jQuery code in `/frontend/js/app.js`.
  - Use vanilla JavaScript for performance-critical logic.
  - Follow Airbnb JavaScript style guide.
  - Avoid inline JavaScript in HTML files.
- **Tailwind CSS**:
  - Use utility-first classes in HTML templates.
  - Store custom Tailwind configurations in `tailwind.config.js`.
  - Output compiled CSS to `/frontend/css/output.css`.
- **Docker**:
  - Use multi-stage builds in Dockerfiles to minimize image size.
  - Expose port 8000 for FastAPI and 3000 for the frontend.
  - Use environment variables for sensitive data (e.g., database credentials).

## Specific Instructions
- **FastAPI**:
  - All endpoints should be prefixed with `/api/v1`.
  - Use dependency injection for database sessions.
- **Strawberry GraphQL**:
  - Mount the GraphQL endpoint at `/graphql`.
  - Enable GraphiQL interface for development (disable in production).
- **Frontend**:
  - Use jQuery for AJAX calls to `/api/v1` and `/graphql`.
  - Ensure all frontend code is responsive using Tailwind CSS.
- **Docker**:
  - Generate Dockerfiles with clear layer caching for faster builds.
  - Use `docker-compose.yml` to define services for backend, frontend, and database (e.g., PostgreSQL).
- **File Generation**:
  - Use the WriteFile tool only after user approval.
  - Generate new files in the appropriate directory (e.g., GraphQL schemas in `/backend/graphql/`).

## Modular Instructions
- @./backend/fastapi-standards.md
- @./frontend/tailwind-guidelines.md
- @./docker/docker-best-practices.md