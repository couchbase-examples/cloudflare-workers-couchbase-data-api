# Cloudflare Workers API for Couchbase

This project demonstrates how to build a Cloudflare Workers-based API that interfaces with Couchbase's Data API to manage airline data.

## Overview

The API provides CRUD operations for airline documents stored in Couchbase Server:
- GET `/airlines/{id}` - Retrieve an airline document
- POST `/airlines/{id}` - Create a new airline document
- PUT `/airlines/{id}` - Update an existing airline document
- DELETE `/airlines/{id}` - Delete an airline document

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Couchbase Server with Data API enabled
- Couchbase travel-sample bucket loaded

## Setup

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Configure your environment variables in `.dev.vars` or through Cloudflare dashboard:
```
DATA_API_ACCESS_KEY=your_access_key
DATA_API_SECRET_KEY=your_secret_key
DATA_API_ENDPOINT=your_endpoint
```

## Development

Start the development server:
```
npm run dev
```

## Deployment

Deploy to Cloudflare Workers:
```
npm run deploy
```

## License

Apache 2.0 