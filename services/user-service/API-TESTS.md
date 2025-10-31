# User Service API Tests

## Base URL

```
http://localhost:3001
```

## 1. Register User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

**Expected Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

## 2. Login User

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

## 3. Validate Token

```bash
# Replace YOUR_TOKEN with actual token from login/register
curl -X GET http://localhost:3001/auth/validate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "valid": true,
  "userId": "uuid-here",
  "email": "john@example.com"
}
```

## 4. Get User Profile (Protected)

```bash
# Replace USER_ID and YOUR_TOKEN with actual values
curl -X GET http://localhost:3001/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "id": "uuid-here",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2025-10-29T12:00:00.000Z",
  "updatedAt": "2025-10-29T12:00:00.000Z"
}
```

## Error Cases

### Register with existing email:

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "name": "Jane Doe"
  }'
```

**Expected Response (409 Conflict):**

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

### Login with wrong password:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Get user without token:

```bash
curl -X GET http://localhost:3001/users/some-user-id
```

**Expected Response (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Get user with invalid token:

```bash
curl -X GET http://localhost:3001/users/some-user-id \
  -H "Authorization: Bearer invalid-token"
```

**Expected Response (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Full Test Workflow

```bash
# 1. Register
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }')

echo "Register Response:"
echo $REGISTER_RESPONSE | jq

# 2. Extract token and user ID
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.id')

echo "\nToken: $TOKEN"
echo "User ID: $USER_ID"

# 3. Validate token
echo "\nValidating token..."
curl -s -X GET http://localhost:3001/auth/validate \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Get user profile
echo "\nGetting user profile..."
curl -s -X GET http://localhost:3001/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Login with same credentials
echo "\nLogging in..."
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"password\": \"test123456\"
  }" | jq
```
