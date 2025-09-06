# 42-ft_transcendence

This is our last project at 42, and it is a big one!
# It is a full-stack project that includes a lot of different technologies and concepts.
# It is a web application that allows users to create and manage their own personal blog.
# It is a project that will allow us to demonstrate our skills in web development, database management, and more.
# LET'S play the mighty PING PONG game!

# ft_transcendence

## Prerequisites

Docker and Docker Compose need to be installed on the system.

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Running the Project

The application can be run in two modes: Production and Development.

### Production Mode

This mode builds and runs the application using a single Docker container.

1.  **Build and start the application:**
    ```bash
    docker compose up --build -d
    ```
    The application will be accessible at `https://localhost:8080`.
    *Note: You will likely need to accept a browser warning due to the use of self-signed SSL certificates.*

2.  **To stop the application:**
    ```bash
    docker compose down
    ```

### Development Mode

This mode uses a multi-container setup with hot-reloading for TypeScript files and the backend service. This is recommended for active development.

1.  **Stop Production (if running):**
    Ensure any production containers are stopped to avoid port conflicts.
    ```bash
    docker compose down --remove-orphans
    ```

2.  **Start the development environment:**
    ```bash
    docker compose -f docker-compose.dev.yml up --build -d
    ```
    The application will be accessible at `https://localhost:8080`.
    *Note: You will likely need to accept a browser warning due to the use of self-signed SSL certificates.*
    Changes to TypeScript files in the `frontend/src` or `backend/src` directories will trigger an automatic rebuild of the respective service.

3.  **Restarting services:**
    When making changes to `package.json` (e.g., add new dependencies), you'll need to restart the relevant service:
    - Frontend (`frontend/package.json` changes):
      ```bash
      docker compose -f docker-compose.dev.yml restart ts-watcher
      ```
    - Backend (`backend/package.json` changes):
      ```bash
      docker compose -f docker-compose.dev.yml restart backend
      ```
    We might also need to restart the `web` service if Nginx configuration changes:
    ```bash
    docker compose -f docker-compose.dev.yml restart web
    ```

4.  **Viewing logs:**
    To check the logs for the TypeScript watcher (frontend):
    ```bash
    docker compose -f docker-compose.dev.yml logs -f ts-watcher
    ```
    To check the logs for the Nginx web server:
    ```bash
    docker compose -f docker-compose.dev.yml logs -f web
    ```
    To check the logs for the backend service:
    ```bash
    docker compose -f docker-compose.dev.yml logs -f backend
    ```

5.  **Stopping the development environment:**
    ```bash
    docker compose -f docker-compose.dev.yml down --remove-orphans
    ```

### Inspecting the Database (Development Mode)

To check the contents of the SQLite database, such as verifying user creation and password hashing:

1.  **Ensure your development environment is running:**
    ```bash
    docker compose -f docker-compose.dev.yml up -d
    ```

2.  **Access the backend container's shell:**
    The backend service is named `backend` in `docker-compose.dev.yml` and the container is typically named `ft_transcendence_backend_dev`.
    ```bash
    docker exec -it ft_transcendence_backend_dev sh
    ```

3.  **Install SQLite command-line tool (if not already present):**
    Inside the container's shell (`/app #`), run:
    ```sh
    apk update && apk add sqlite
    ```
    *This step is only needed once per container lifetime or if the container is recreated without the tool.*

4.  **Connect to the database:**
    The database file is located at `/app/database/transcendence.sqlite`.
    ```sh
    sqlite3 /app/database/transcendence.sqlite
    ```

5.  **Query the users table:**
    Once in the SQLite prompt (`sqlite>`), you can run SQL queries. For example, to see all users:
    ```sql
    SELECT id, username, password_hash, created_at FROM users;
    ```
    To see a specific user:
    ```sql
    SELECT id, username, password_hash FROM users WHERE username = 'testuser';
    ```
    The `password_hash` column should display a long, hashed string, not the plaintext password.

6.  **Exit SQLite and the container:**
    - To exit the SQLite prompt: `.quit`
    - To exit the container shell: `exit`