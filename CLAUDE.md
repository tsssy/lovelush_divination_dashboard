# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm i` - Install dependencies
- `npm run dev` - Start development server (runs on port 3000, opens browser automatically)
- `npm run build` - Build for production (outputs to `build/` directory)

## Project Architecture

This is a React + TypeScript dashboard application built with Vite, designed as an App Management Dashboard. The project is based on a Figma design available at https://www.figma.com/design/RAmFs9gkprJEa70gblEKvE/App-Management-Dashboard.

### Key Structure

- **Main App Flow**: App.tsx orchestrates the main layout with TopBar, Navigation, and content switching
- **Navigation System**: Five main sections - chat, products, campaign, statistics, settings
- **UI Components**: Extensive shadcn/ui component library in `src/components/ui/`
- **State Management**: Simple useState-based state management for active sections and connection data

### Component Organization

- `src/components/` - Main application components (ChatInterface, ProductManagement, etc.)
- `src/components/ui/` - Reusable UI components from shadcn/ui
- `src/components/figma/` - Figma-specific components like ImageWithFallback
- `src/styles/` - Global CSS styles

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS (implied by component usage)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Theming**: next-themes for dark/light mode support

### Key Features

- Connection management system with domain/userId/password
- Multi-section dashboard with navigation
- Responsive layout using flexbox
- Component-based architecture with clear separation of concerns
- Extensive use of modern React patterns (hooks, functional components)

### Path Aliases

The project uses `@/` as an alias for the `src/` directory (configured in vite.config.ts).