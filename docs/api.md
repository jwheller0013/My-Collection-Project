# API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication

Most endpoints require user authentication. Send credentials using Basic Auth:
```
Authorization: Basic <base64-encoded-credentials>
```

## Endpoints

### Collections

#### List Collections
```
GET /collections
```
Returns a list of all collections for the authenticated user.

#### Get Collection
```
GET /collections/{id}
```
Returns details for a specific collection.

#### Create Collection
```
POST /collections
```
Create a new collection.

Request body:
```json
{
    "name": "string",
    "description": "string",
    "type": "media|book|game"
}
```

#### Update Collection
```
PUT /collections/{id}
```
Update an existing collection.

#### Delete Collection
```
DELETE /collections/{id}
```
Delete a collection and its entries.

### Entries

#### List Entries
```
GET /entries
```
Returns all entries across collections.

#### Get Entry
```
GET /entries/{id}
```
Returns details for a specific entry.

#### Create Entry
```
POST /entries
```
Create a new entry.

Request body:
```json
{
    "title": "string",
    "collection_id": "number",
    "type": "media|book|game",
    "overview": "string",
    "poster": "string",
    "rating": "number",
    "genres": ["string"],
    "link": "string",
    "author": "string",        // for books
    "is_read": "boolean",      // for books
    "platform": "string",      // for games
    "release_date": "string"   // for games
}
```

#### Update Entry
```
PUT /entries/{id}
```
Update an existing entry.

#### Delete Entry
```
DELETE /entries/{id}
```
Delete an entry.

### Genres

#### List Genres
```
GET /genres
```
Returns all available genres.

#### Add Genre to Entry
```
POST /entries/{entry_id}/genres
```
Add genres to an entry.

Request body:
```json
{
    "genre_ids": ["number"]
}
```

### UPC Lookup

#### Scan Barcode
```
POST /upc_lookup
```
Look up product information from UPC barcode.

Request body:
```json
{
    "upc": "string"
}
```

### AI Recommendations

#### Get Recommendations
```
POST /ai_recommendations
```
Get AI-powered recommendations based on collection contents.

Request body:
```json
{
    "collection_id": "number",
    "api_token": "string"
}
```

## Error Responses

The API uses standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error response body:
```json
{
    "error": "string",
    "message": "string"
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute per IP
- 1000 requests per hour per user

## Pagination

List endpoints support pagination using query parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
    "items": [],
    "total": "number",
    "page": "number",
    "per_page": "number",
    "pages": "number"
}
```