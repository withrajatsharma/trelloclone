## Real-Time Kanban Board (Full Stack Trello Clone)

A collaborative Kanban board built with Next.js and MongoDB.
It comes with various features like validated authentication, protected routes, server-side rendering, workspaces with boards and members, search functionality, and a drag-and-drop Kanban system.

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd trelloclone

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB connection string

# Run the development server
npm run dev
```

### Environment Variables
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Database Setup
The application will automatically create the necessary collections and indexes when you first run it.




## 🗄️ Database Schemas

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique),
  fullName: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Board Model
```javascript
{
  _id: ObjectId,
  name: String,
  workspaceId: ObjectId (ref: WorkSpace),
  createdAt: Date,
  updatedAt: Date
}
```

### List Model
```javascript
{
  _id: ObjectId,
  name: String,
  boardId: ObjectId (ref: Board),
  position: Number,  // For drag-and-drop ordering
  createdAt: Date,
  updatedAt: Date
}
```

### Card Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  listId: ObjectId (ref: List),
  authorId: ObjectId (ref: User),
  dueDate: Date,
  priority: String (enum: ['low', 'medium', 'high']),
  position: Number,  // For drag-and-drop ordering
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Model
```javascript
{
  _id: ObjectId,
  cardId: ObjectId (ref: Card),
  userId: ObjectId (ref: User),
  userFullName: String,
  text: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Model
```javascript
{
  _id: ObjectId,
  boardId: ObjectId (ref: Board),
  userId: ObjectId (ref: User),
  userFullName: String,
  action: String (enum: [
    'card.created', 'card.updated', 'card.deleted', 'card.moved',
    'list.created', 'list.updated', 'list.deleted', 'list.moved',
    'board.updated', 'comment.created'
  ]),
  details: Object,
  createdAt: Date
}
```


## 📁 Project Structure

```
trelloclone/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── boards/[id]/          # Board-specific endpoints
│   │   │   ├── sse/              # Server-Sent Events stream
│   │   │   └── activities/       # Activity log API
│   │   ├── cards/[id]/comments/  # Card comments API
│   │   ├── cards/                # Card CRUD operations
│   │   ├── lists/                # List CRUD operations
│   │   └── board/                # Board operations
│   └── (pages)/                  # Page components
├── components/                   # React Components
│   ├── KanbanBoard.jsx          # Main board component
│   ├── CardModal.jsx            # Card editing modal
│   ├── ActivityLog.jsx          # Activity log modal
│   ├── list-container.jsx       # Individual list component
│   └── card-item.jsx            # Individual card component
├── models/                      # Mongoose Schemas
│   ├── User.js                  # User model
│   ├── Board.js                 # Board model
│   ├── List.js                  # List model
│   ├── Card.js                  # Card model
│   ├── Comment.js               # Comment model
│   └── Activity.js              # Activity log model
├── services/                    # Business Logic
│   └── realtime.js              # Real-time broadcasting functions
├── lib/                         # Utilities
│   └── eventBus.js              # Event bus system
└── middleware.ts                # Authentication middleware
```



## 🚀 API Endpoints

### Board Operations
- `GET /api/boards/[id]` - Get board with lists and cards
- `PATCH /api/board` - Update board name
- `GET /api/boards/[id]/sse` - Real-time event stream
- `GET /api/boards/[id]/activities` - Get activity log

### List Operations
- `POST /api/lists` - Create new list
- `PATCH /api/lists` - Update list name
- `DELETE /api/lists` - Delete list
- `PATCH /api/lists/positions` - Update list positions

### Card Operations
- `POST /api/cards` - Create new card
- `PATCH /api/cards` - Update card details
- `DELETE /api/cards` - Delete card
- `PATCH /api/cards/positions` - Update card positions

### Comment Operations
- `GET /api/cards/[id]/comments` - Get card comments
- `POST /api/cards/[id]/comments` - Add new comment

### Cursor Tracking
- `POST /api/boards/[id]/cursor` - Broadcast cursor position
- `DELETE /api/boards/[id]/cursor` - Remove cursor


## 🎯 Key Features Explained

### Activity Logging
- **Comprehensive**: All user actions logged with details
- **Real-Time**: Activity feed updates live
- **User Attribution**: Shows who performed each action
- **Action Types**: Specific categorization of activities

### Drag & Drop System
- **@dnd-kit**: Modern drag-and-drop library
- **Position Persistence**: All positions saved to database
- **Cross-List Movement**: Cards can move between lists
- **Smooth Animations**: Optimistic updates for better UX

### Comment System
- **Real-Time**: Comments appear instantly
- **Rich Data**: Author name, timestamp, content
- **Duplicate Prevention**: Prevents duplicate comments
- **Live Updates**: All users see new comments immediately
