# Alter Office - Sort URL  

This project is a powerful URL shortener and analytics tool, built using **Node.js**, **TypeScript**, **MongoDB**,**swagger** and **Redis**. It supports advanced analytics like tracking clicks, user agents, and geographic locations.  


## Swagger Documention link
```
/api-docs
```
---

## Features  
- **URL Shortening**: Generate unique or custom short URLs.  
- **Redis Caching**: Improve response times with caching for analytics and redirects.  
- **Analytics**: Track clicks, unique users, device types, and operating systems.  
- **Google Authentication**: Secure user sign-in with Google OAuth.  
- **Rate Limiting**: Protect the API from abuse.  

---

## Clone locally
```
git clone https://github.com/abhms/alter.git
```
## Folder Structure  

```plaintext
├── src
│   ├── config          # Configuration files (Redis, MongoDB, etc.)
│   ├── controllers     # Business logic for routes
│   ├── middleware      # Middleware (authentication, error handling)
│   ├── modal          # Mongoose models for MongoDB
│   ├── routes          # API routes
│   ├── index.ts       # Server setup
├── .env.example         # Example of environment variables
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
```

## Environment variables
```
PORT=
MONGO_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```
## Setup and Rum locally
```
npm install
npm run dev
```
## Build locally

```
npm run build
npm start
```