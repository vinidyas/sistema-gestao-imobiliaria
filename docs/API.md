# 📡 API Documentation

## Autenticação

Todas as rotas (exceto login) requerem token JWT no header:
```
Authorization: Bearer <seu-jwt-token>
```

## Endpoints

### 🔐 Autenticação

#### POST /api/auth/login
Realizar login no sistema.

**Request:**
```json
{
  "email": "admin@imobiliaria.com",
  "senha": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@imobiliaria.com",
    "tipo_usuario": "admin"
  }
}
```

### 🏠 Imóveis

#### GET /api/imoveis
Listar todos os imóveis.

#### POST /api/imoveis
Criar novo imóvel.

### 🤝 Contratos

#### GET /api/contratos
Listar todos os contratos.

#### POST /api/contratos
Criar novo contrato.

### 💰 Faturas

#### GET /api/faturas
Listar todas as faturas.

#### PUT /api/faturas/:id
Atualizar fatura (dar baixa).

## Códigos de Status

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
