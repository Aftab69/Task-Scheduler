# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React-based Task Scheduler application** built with modern JavaScript and Vite. The project is currently in early development stage, containing the base Vite + React template setup.

## Development Commands

```bash
# Start development server with hot module replacement
npm run dev

# Create production build
npm run build

# Run ESLint code quality checks
npm run lint

# Preview production build locally
npm run preview
```

## Technology Stack

- **React 19.2.0** - Modern React with latest features
- **Vite 7.2.2** - Fast build tool and development server
- **ESLint 9.39.1** - Code linting with React-specific rules
- **JavaScript (ES Modules)** - No TypeScript currently implemented

## Architecture

### Entry Points
- `index.html` - HTML template with root element
- `src/main.jsx` - React app initialization using `createRoot()`
- `src/App.jsx` - Main application component

### Current Structure
- Single-component architecture (App.jsx only)
- React hooks for state management (`useState`)
- CSS modules with component-scoped styles
- No routing system currently implemented

### Build Configuration
- `vite.config.js` - Vite configuration with React plugin
- `eslint.config.js` - Modern ESLint flat configuration
- No additional bundlers or build tools

## Development Notes

### Current State
- This is a fresh project template with only default Vite + React setup
- The application currently displays a basic counter example
- No task scheduling functionality has been implemented yet

### Key Considerations for Development
- Uses modern ES modules throughout
- Fast Refresh enabled for development
- No testing framework currently configured
- Type definitions available but TypeScript not implemented
- Component-based architecture should be adopted as features are added

### Recommended Architecture Patterns
- Break down features into reusable React components
- Consider React Context for global state management
- Implement React Router for multiple views (tasks, schedules, settings)
- Use custom hooks for task scheduling logic
- Consider migrating to TypeScript for better type safety