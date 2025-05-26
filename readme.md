# 📦 Project Setup Instructions

Follow the steps below to set up and run the project on your local machine.

## 1️⃣ Create Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```env
PORT=

DB_URL=

# For sending emails (using Mailtrap - only the registered Mailtrap email will receive messages)
EMAIL_FROM=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=

# JWT Configuration
JWT_SECRET=
JWT_EXPIRES_IN=
JWT_COOKIE_EXPIRES_IN=
```

## 2️⃣ Install Dependencies

Install all required Node.js packages using the following command:

```bash
npm install


```

## 3️⃣ Start the Development Server

Run the development server using:

```bash
npm run dev
```
