Authentication Routes (/api/auth)
POST /api/auth/register - Register a new user
POST /api/auth/login - Login user
GET /api/auth/profile - Get user profile (protected)
PUT /api/auth/profile - Update user profile (protected)
PUT /api/auth/change-password - Change user password (protected)

Board Routes (/api/boards)
GET /api/boards - Get all boards (protected)
POST /api/boards - Create a new board (protected)
GET /api/boards/:id - Get a specific board (protected)
PUT /api/boards/:id - Update a board (protected)
DELETE /api/boards/:id - Delete a board (protected)

Column Routes (/api/columns)
GET /api/columns/boards/:boardId/columns - Get all columns in a board (protected)
POST /api/columns/boards/:boardId/columns - Create a new column in a board (protected)
PUT /api/columns/boards/:boardId/columns/reorder - Reorder columns in a board (protected)
GET /api/columns/:id - Get a specific column (protected)
PUT /api/columns/:id - Update a column (protected)
DELETE /api/columns/:id - Delete a column (protected)

Card Routes (/api/cards)
POST /api/cards/:columnId - Create a new card in a column (protected)
PATCH /api/cards/:cardId/move - Move a card to a different column (protected)
GET /api/cards/boards/:boardId/cards - Get all cards in a board (protected)
GET /api/cards/columns/:columnId/cards - Get all cards in a column (protected)
GET /api/cards/:id - Get a specific card (protected)