# AI Editor Rules and Guidelines

This document outlines the core technologies used in the project and provides clear rules for when and how to use specific libraries.

## 1. Tech Stack Overview

This project is built using a modern, performant stack:

*   **Language:** TypeScript for type safety and robust development.
*   **Framework:** React (Functional Components and Hooks).
*   **Routing:** React Router DOM for client-side navigation.
*   **Styling:** Tailwind CSS for utility-first, responsive styling.
*   **UI Components:** shadcn/ui (built on Radix UI) for accessible and customizable components.
*   **State Management (Server State):** React Query (`@tanstack/react-query`) for data fetching, caching, and synchronization with the database.
*   **Database/Backend:** Supabase for authentication, database (PostgreSQL), and real-time features.
*   **Notifications:** `sonner` for modern toast notifications and `@radix-ui/react-toast` (via shadcn `useToast`) for imperative toasts (e.g., form submissions).
*   **Icons:** `lucide-react`.

## 2. Library Usage Rules

To maintain consistency and simplicity, follow these rules when implementing features:

| Feature | Recommended Library/Tool | Rule |
| :--- | :--- | :--- |
| **Styling** | Tailwind CSS | Always use Tailwind utility classes for styling. Avoid custom CSS files unless absolutely necessary. |
| **UI Components** | shadcn/ui | Prioritize using existing shadcn components. If a component needs modification, create a new component file (e.g., `src/components/CustomButton.tsx`) that wraps the base component. |
| **Server State / Data Fetching** | React Query | Use `useQuery` and `useMutation` for all interactions with the Supabase database (fetching profiles, lessons, progress, etc.). |
| **Authentication** | `src/hooks/useAuth.tsx` | Use the custom `useAuth` hook for all authentication logic (sign in, sign up, sign out, checking user status). |
| **Notifications** | `sonner` / `useToast` | Use `sonner` (imported as `Sonner` in `App.tsx`) for general, non-critical notifications. Use the `useToast` hook (Radix/shadcn) for critical feedback related to forms or actions (e.g., success/error messages after saving data). |
| **Routing** | React Router DOM | All navigation must use `useNavigate` or `Link` components from `react-router-dom`. |
| **File Structure** | Standardized | Components go in `src/components/`, pages in `src/pages/`, and custom hooks in `src/hooks/`. |