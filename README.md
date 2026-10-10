# SafeHouse 🔐

**End-to-end encrypted temporary rooms for sharing environment variables and private messages.**

SafeHouse is a web application that helps developers share sensitive configuration data through temporary rooms. It combines browser-side encryption, controlled room access, and real-time communication to reduce the risks of sharing secrets through ordinary messaging platforms.

**Live Demo:** [safehouse-sigma.vercel.app](https://safehouse-sigma.vercel.app)

## Features

- **Client-side encryption:** Encrypt environment variables in the browser using the Web Crypto API.
- **Temporary rooms:** Share data in rooms with configurable expiration.
- **Secure room access:** Join rooms using room credentials and session-based authentication.
- **Real-time collaboration:** Exchange private messages and receive room updates using Socket.IO.
- **Encrypted storage:** Store encrypted ENV payloads in Redis instead of plaintext secrets.
- **Key management:** Manage room encryption keys on the client, with browser-side key storage.
- **Security controls:** Apply request validation, rate limiting, and structured logging.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Redis |
| Real-time | Socket.IO |
| Security | Web Crypto API, AES-256-GCM, ECDH P-256, JWT |
| Tools | Git, GitHub, Postman |

## Architecture

1. A user creates a temporary room.
2. Authorized participants join using the room credentials.
3. Sensitive ENV data is encrypted in the browser before being sent to the backend.
4. The backend stores the encrypted payload and manages room access and expiration.
5. Authorized participants retrieve and decrypt the data in their own browsers.

The backend should not need plaintext ENV values or the room's decryption key to store encrypted payloads.

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB instance or MongoDB Atlas
- Redis instance or a compatible hosted Redis service

### 1. Clone the repository

```bash
git clone https://github.com/laxmangaidhankar/ciphervault.git
cd ciphervault
```

### 2. Configure the backend

Navigate to the backend directory:

```bash
cd server
npm install
```

Create a local environment file, such as `.env.development`, with the variables required by your backend configuration:

```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_secure_random_secret
LOG_LEVEL=info
```

Generate a strong JWT secret and keep all real credentials out of version control.

Start the backend using the script defined in `server/package.json`:

```bash
npm run dev
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Configure any additional Socket.IO URL variable if your frontend uses one. Ensure the variable names match your actual application code.

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Encrypted payload storage:** Redis

Configure production environment variables in the appropriate hosting dashboards. Set CORS to allow your deployed frontend origin and use HTTPS in production.

## Security Notes

- Never commit `.env` files, access keys, JWT secrets, or database credentials.
- Encrypt sensitive content before sending it to the backend.
- Validate room access and expiration on protected API and socket operations.
- Treat browser-side key storage and frontend integrity as security-critical.
- Room expiration does not by itself guarantee immediate deletion from every backup or infrastructure layer.

SafeHouse is a security-focused project and has not been independently security-audited.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for details.