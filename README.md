# Bwrap-sandbox

## Overview
The **Bwrap-sandbox** is a sandboxed code execution service designed to securely run user-submitted code in various programming languages. It leverages technologies like **BullMQ** for job queue management, **Bubblewrap** for sandboxing, and **Docker** for containerization.

## Features
- **Multi-language support**: Execute JavaScript, Python, and C code.
- **Sandboxing**: Securely isolate code execution using Bubblewrap.
- **Job Queue**: Efficient task management with BullMQ.
- **Dockerized**: Easy deployment with Docker.

## Project Structure
```
\home\app
├── worker\
│   ├── src\
│   │   ├── index.ts       # Main worker logic
│   │   ├── sandbox.ts     # Sandbox execution logic
│   ├── Dockerfile         # Docker configuration for the worker
├── api\
│   ├── Dockerfile         # Docker configuration for the API
├── README.md              # Project documentation
```

## Installation

### Prerequisites
- **Node.js** (v22 or higher)
- **Docker** (optional for containerized deployment)
- **Redis** (for BullMQ)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/scet-worker.git
   cd bwrap-sandbox
   ```

2. Install dependencies:
   ```bash
   cd api
   npm install
   cd worker 
   npm install
   ```

3. Run the redis:
   ```bash
   docker run -d -p 6379:6379 --name=my-redis redis
   ```
4. Build the api:
   ```bash
   cd api
   docker build -t api-app .  
   ```

5. Build the worker:
   ```bash
   cd worker
   docker build -t worker-app .
   ```

6. Run the worker:
   ```bash
   docker run --network=your_network_name --privileged  worker-app
   ```
7. Run the api:
   ```bash
   docker run -p 3000:3000 --network=your_network_name api-app  
   ```


## Usage
The worker listens for jobs on the `code-exec` queue. Submit jobs with the following structure:
```json
{
  "language": "js",
  "source": "console.log('Hello, World!');"
}
```

## Troubleshooting
### Common Errors
- **`spawn bwrap ENOENT`**: Ensure Bubblewrap is installed and accessible.
- **`bwrap: No permissions to creating new namespace`**: Enable unprivileged user namespaces:
  ```bash
  sudo sysctl kernel.unprivileged_userns_clone=1
  ```

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any bugs or feature requests.


## Contact
For questions or support, please contact [AnshBalar](mailto:anshbalar2910@gmail.com).