# Personal Inventory Management System

A web-based personal inventory management system that offers intuitive tracking, customizable organization, and responsive design for efficient item management.

## Features

- **Intuitive Organization**: Create categories and subcategories for optimal organization
- **Customizable Themes**: Personalize colors, fonts, and visual elements
- **Responsive Design**: Works well on desktop, tablet, and mobile devices
- **Advanced Search & Filter**: Quickly find items with powerful search capabilities
- **QR Code Generation**: Print labels for physical items
- **Barcode Scanning**: Use device camera for quick item identification
- **Data Management**: Backup, restore, and reset functionality

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query
- **Database**: PostgreSQL with Drizzle ORM
- **API**: Express.js backend

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/inventory-management.git
cd inventory-management
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following:
```
DATABASE_URL=postgres://username:password@localhost:5432/inventory
```

4. Initialize the database
```bash
npm run db:push
npm run db:seed
```

5. Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:5000

## License

MIT License