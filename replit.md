# MotivateMe - Goal Tracking and Coaching Application

## Overview

MotivateMe is a modern goal tracking and coaching application built with React frontend and Express backend. The app helps users set goals, track daily progress with streak counters, and provides AI-powered motivational coaching through OpenAI integration. It features a clean, modern UI built with shadcn/ui components and uses PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with JSON responses
- **Error Handling**: Centralized error middleware

### Development Setup
- **Monorepo Structure**: Client and server in same repository with shared schemas
- **Hot Reload**: Vite dev server with Express middleware integration
- **Type Safety**: Shared TypeScript interfaces between frontend and backend

## Key Components

### Database Schema
Located in `shared/schema.ts` with four main tables:
- **Goals**: Core goal information (name, deadline, reason)
- **Streaks**: Progress tracking (current streak, best streak, total completed)
- **Daily Completions**: Daily progress records with completion status
- **Coaching Sessions**: AI coach interactions and responses

### Core Features
1. **Goal Setup**: Create goals with deadlines and motivational reasons
2. **Streak Tracking**: Visual progress tracking with daily completion status
3. **AI Coaching**: OpenAI GPT-4o integration for motivational coaching
4. **Dashboard**: Comprehensive overview with progress visualization
5. **Countdown Timers**: Real-time countdown to goal deadline and New Year

### UI Components
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Library**: Complete shadcn/ui component set
- **Toast Notifications**: User feedback for actions and errors
- **Modal Dialogs**: Daily motivational notifications
- **Form Validation**: Real-time validation with error messaging

## Data Flow

### Goal Management
1. User creates goal through setup form
2. Goal data validated and stored in PostgreSQL
3. Initial streak record created automatically
4. Goal ID stored in localStorage for persistence

### Progress Tracking
1. User marks day as complete on dashboard
2. API updates streak counters and creates daily completion record
3. Frontend updates immediately with optimistic updates
4. Toast notification confirms successful completion

### AI Coaching
1. User sends message to coach on dedicated page
2. Message sent to OpenAI API with goal context
3. Response stored in coaching sessions table
4. Chat history displayed for reference

## External Dependencies

### Primary Libraries
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with migrations
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing for React
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **zod**: Runtime type validation

### AI Integration
- **OpenAI API**: GPT-4o model for coaching responses
- **API Key**: Required environment variable for OpenAI access

### Development Tools
- **Vite**: Fast build tool with TypeScript support
- **ESBuild**: Production bundling for server code
- **Drizzle Kit**: Database migration management
- **TSX**: TypeScript execution for development

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` using Vite
2. Backend bundles to `dist/index.js` using ESBuild
3. Shared schemas compiled and included in both builds

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `OPENAI_API_KEY`: OpenAI API access token (required)
- `NODE_ENV`: Environment flag for development/production

### Production Requirements
- Node.js runtime environment
- PostgreSQL database (Neon recommended)
- OpenAI API subscription
- Environment variables configured

### Development Setup
- `npm run dev`: Starts development server with hot reload
- `npm run db:push`: Applies database schema changes
- `npm run build`: Creates production build
- `npm start`: Runs production server

The application uses a memory storage fallback for development when database is unavailable, but requires PostgreSQL for production deployment.