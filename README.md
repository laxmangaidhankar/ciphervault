# 🛡️ SafeHouse

> **Zero-Knowledge, Client-Side Encrypted Temporary Room & Secret Sharing Platform**

SafeHouse is a security-focused web application for sharing sensitive configuration files, `.env` files, text snippets, code, and binary files through temporary rooms. It is designed to reduce the risk of exposing credentials through persistent communication channels such as email, messaging applications, and team collaboration tools.

SafeHouse uses **AES-256-GCM encryption through the browser's Web Crypto API** to encrypt content before it reaches the backend. Encryption keys are shared through URL fragments, keeping them out of ordinary HTTP requests.

## 🌟 Key Features

- 🔐 **Client-Side End-to-End Encryption**
  - Encrypt text snippets, environment files, code, and supported binary uploads in the browser.
  - Use AES-256-GCM with a unique, randomly generated 96-bit initialization vector (IV) for each encryption operation.
  - Store encrypted payloads and associated IVs on the server instead of plaintext content.

- 🔑 **URL Fragment-Based Key Sharing**
  - Share room links containing the decryption key in the URL fragment, for example: `https://your-domain.com/join/ROOM_ID#SECRET_KEY`.
  - Browsers do not include URL fragments in HTTP requests.
  - Decryption keys remain client-side during normal application operation, provided the frontend does not explicitly transmit or log them.

- ⏳ **Temporary Rooms and Expiration**
  - Create rooms with configurable expiration durations: 5, 10, 30, or 60 minutes.
  - Use MongoDB TTL indexes and backend cleanup mechanisms to support automatic data expiration.
  - Notify connected participants when a room expires or is destroyed.

- 💥 **Manual Room Destruction**
  - Support immediate room destruction through a cryptographically random destruction token.
  - Store a hash of the destruction token rather than the original token.
  - Remove associated room data through the application's cleanup workflow.

- ⚡ **Real-Time Room Synchronization**
  - Use Socket.IO for participant counts, file activity, and room lifecycle notifications.
  - Keep connected clients informed about relevant room events.

- 🛡️ **Abuse Prevention**
  - Apply IP-based rate limits to room creation, joining, and file uploads.
  - Validate room identifiers, upload sizes, expiration values, and incoming requests.
  - Use structured server-side logging while avoiding sensitive content and credentials.

## 🏗️ Security Architecture

### Encryption Workflow

```text
┌────────────────────────┐
│     Sender Browser     │
│                        │
│ Generate AES-256 key   │
│ Encrypt content        │
│ Generate random IV     │
└────────────┬───────────┘
             │
             │ Ciphertext + IV
             ▼
┌────────────────────────┐
│      SafeHouse API     │
│                        │
│ Validate request       │
│ Store encrypted data   │
│ Manage room lifecycle  │
└────────────┬───────────┘
             │
             │ Ciphertext + IV
             ▼
┌────────────────────────┐
│    Receiver Browser    │
│                        │
│ Obtain key from URL    │
│ fragment               │
│ Decrypt locally        │
└────────────────────────┘
```

### Security and Threat Model

| Threat | Intended Protection | Mechanism / Limitation |
|---|---|---|
| Database exposure | Protect stored content | Client-side encryption keeps plaintext out of the database when implemented correctly. |
| Passive network interception | Protect content in transit | HTTPS protects communications; encrypted payloads provide an additional layer. |
| Server operator accessing stored data | Limit access to plaintext | The server should never receive the decryption key or plaintext payload. |
| Persistent credential sharing | Reduce long-term exposure | Temporary rooms, expiration, and manual destruction reduce the sharing window. |
| Malicious recipient | Not fully protected | Recipients can copy, screenshot, or redistribute decrypted content. |
| Compromised client device | Not protected | Malware, malicious extensions, or compromised JavaScript can expose plaintext or keys. |
| Malicious frontend deployment | Not inherently protected | A compromised frontend could capture keys or plaintext before encryption or after decryption. |
| Metadata exposure | Partially protected | Room IDs, timestamps, IP addresses, file sizes, and access patterns may still be observable, depending on implementation. |

**Important:** SafeHouse's zero-knowledge properties depend on the actual implementation, key handling, frontend integrity, and server behavior. Encryption alone does not establish that the entire system has been independently audited.

### Room Expiration and Data Deletion

MongoDB TTL indexes perform asynchronous deletion; they do not guarantee deletion at the exact expiration timestamp. The application should also reject access to expired rooms at the API level.

Likewise, deleting database records does not guarantee the immediate erasure of every copy in backups, logs, storage layers, or infrastructure snapshots. Avoid representing expiration as guaranteed permanent erasure unless all relevant storage and retention mechanisms have been verified.

## 🛠️ Technology Stack

### Frontend — `client/`

- **Framework:** React 18, Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide
- **Cryptography:** Browser Web Crypto API
- **Encryption:** AES-256-GCM
- **Networking:** Axios
- **Routing:** React Router
- **Real-time communication:** Socket.IO Client

### Backend — `server/`

- **Runtime:** Node.js
- **API:** Express 5
- **Database:** MongoDB with Mongoose
- **Real-time communication:** Socket.IO
- **Security:** Express Rate Limit, request validation, secure token handling
- **Logging:** Pino
- **Development:** Nodemon

## 📁 Project Structure

```text
safehouse/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── crypto/
│   │   │   ├── encryption.js
│   │   │   ├── decryption.js
│   │   │   └── keyManager.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CreateRoom.jsx
│   │   │   ├── JoinRoom.jsx
│   │   │   └── Room.jsx
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── LICENSE
└── README.md
```

*The structure above describes the intended organization; adjust file names to match the actual repository.*

## ⚙️ Environment Variables

Configure environment variables separately for local development and production. Never commit real secrets or database credentials to GitHub.

### Backend — `server/.env`

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/envsafe
CLIENT_URL=http://localhost:5173
NODE_ENV=development
LOG_LEVEL=info
JWT_SECRET=replace_with_a_secure_random_secret
```

These are example names. Keep only variables that your backend actually reads. If `server/src/config/env.js` requires additional variables, configure those as well.

Generate a secure random JWT secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For production, configure the resulting value in your backend hosting provider's environment settings instead of committing it to a file.

### Frontend — `client/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production, set `VITE_API_BASE_URL` to your deployed backend's base URL, using the URL format expected by your Axios client.

For example:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

If the frontend uses a separate Socket.IO URL variable, configure it only if that variable exists in your application code.

**Never place private credentials, database connection strings, JWT secrets, or server-only encryption keys in `VITE_*` variables.** Vite exposes these values to client-side code.

### Production Configuration

Before deploying:

- Configure the production database URI and backend secrets.
- Set the frontend's production origin in the backend CORS configuration.
- Use HTTPS for the frontend and API.
- Configure upload size limits and appropriate rate limits.
- Ensure expired rooms are rejected even before TTL cleanup runs.
- Verify that URL fragments, keys, plaintext payloads, and sensitive file contents are never written to logs.
- Rebuild the frontend after changing Vite environment variables.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later, compatible with your installed dependencies
- npm
- A local MongoDB instance or MongoDB Atlas database

### 1. Clone the Repository

```bash
git clone https://github.com/laxmangaidhankar/ciphervault.git
cd ciphervault
```

### 2. Start the Backend

```bash
cd server
npm install
```

Create `server/.env` with the appropriate local configuration, then run:

```bash
npm run dev
```

The backend should be available at `http://localhost:3000`, assuming the configured port is 3000.

### 3. Start the Frontend

Open another terminal:

```bash
cd client
npm install
```

Create `client/.env` with the backend API URL, then run:

```bash
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

### 4. Build the Frontend for Production

From the `client/` directory:

```bash
npm run build
```

Vite generates the production assets in `client/dist/` by default.

Preview the production build locally with:

```bash
npm run preview
```

The preview server is intended for local validation, not as a production hosting server.

## 🌐 Deployment

A simple deployment configuration for a portfolio project is:

| Component | Suggested service | Configuration |
|---|---|---|
| React frontend | Vercel | Root directory `client`, build command `npm run build`, output directory `dist` |
| Express and Socket.IO backend | Render | Root directory `server`, start command as defined in `server/package.json` |
| Database | MongoDB Atlas | Configure `MONGO_URI` in the backend environment |

Actual root-directory and build settings depend on the repository layout. If the frontend and backend are deployed as separate projects, configure each service independently.

For production deployments, verify WebSocket connectivity, CORS, room expiration, upload limits, and browser encryption/decryption on the live domains.

## 📡 API Reference

The following endpoints represent the documented API surface. Confirm the exact paths and behavior against the implementation.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/rooms` | Create a temporary room |
| `GET` | `/api/v1/rooms/:roomId` | Retrieve room status and metadata |

Additional room-file routes may be available depending on the implemented controllers and route registrations.

### Socket.IO Events

| Event | Direction | Purpose |
|---|---|---|
| `join-room` | Client → Server | Request to join a room |
| `leave-room` | Client → Server | Leave a room |
| `room:joined` | Server → Client | Receive room-join confirmation and participant information |

Socket events should validate room existence, expiry, authorization, and payloads server-side. Do not trust client-supplied room IDs or participant counts without validation.

## 🔒 Security Best Practices

1. **Share complete links securely.** Anyone who obtains a valid link containing the key may be able to decrypt the associated content.
2. **Use short expiration periods.** Choose the shortest duration that meets the sharing requirement.
3. **Destroy rooms when finished.** Manual destruction reduces the time encrypted content remains available.
4. **Protect the browser environment.** Avoid untrusted browser extensions and compromised devices when handling sensitive credentials.
5. **Keep secrets out of logs and repositories.** Never commit `.env` files or expose backend credentials in frontend bundles.
6. **Validate every server request.** Apply authorization, request validation, upload limits, and rate limiting.
7. **Test the security assumptions.** Verify that keys and plaintext do not leave the browser, including through analytics, error reporting, and debugging logs.

## 🧪 Testing and Verification

Before considering the application production-ready, verify:

- Encryption and decryption round-trip correctly.
- Modified ciphertext and invalid authentication tags cause decryption to fail.
- Each encryption operation uses an appropriately unique random IV.
- The server receives and stores ciphertext rather than plaintext.
- URL fragments are not sent to the API or recorded in application logs.
- Expired and destroyed rooms cannot be accessed through REST or Socket.IO.
- Upload validation, rate limiting, and authorization behave as intended.
- Production deployment works over HTTPS and supports WebSocket reconnections.

## 📄 License

Distributed under the MIT License. See the [`LICENSE`](LICENSE) file for details.
