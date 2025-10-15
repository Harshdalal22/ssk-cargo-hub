# AI Rules for SSK Cargo Hub Application

This document outlines the technical stack and specific library usage guidelines for developing the SSK Cargo Hub application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of the chosen technologies.

## Tech Stack Overview

The SSK Cargo Hub application is built using a modern web development stack, focusing on performance, developer experience, and scalability.

*   **Frontend Framework:** React with TypeScript
*   **Build Tool:** Vite
*   **UI Component Library:** shadcn/ui (built on Radix UI)
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM
*   **Backend & Authentication:** Supabase (PostgreSQL database, authentication, real-time subscriptions)
*   **Server State Management:** Tanstack Query
*   **Icons:** Lucide React
*   **Form Management:** React Hook Form with Zod for validation
*   **Notifications:** Sonner for toast notifications
*   **Data Export:** jspdf and xlsx for PDF and Excel generation

## Library Usage Guidelines

To maintain a consistent and efficient codebase, please follow these guidelines for library usage:

*   **UI Components:**
    *   **Always** prioritize `shadcn/ui` components for all user interface elements.
    *   If a `shadcn/ui` component needs customization, **do not modify the original `shadcn/ui` component file**. Instead, create a new component that wraps or extends the `shadcn/ui` component, applying your custom styling or logic.
*   **Styling:**
    *   **Exclusively use Tailwind CSS** for all styling. Avoid custom CSS files, inline styles (unless for dynamic, calculated values), or other CSS-in-JS solutions.
    *   Utilize Tailwind's utility classes for layout, spacing, colors, typography, and responsiveness.
*   **Routing:**
    *   `react-router-dom` is the designated library for all client-side routing.
    *   All primary application routes should be defined within `src/App.tsx`.
*   **State Management:**
    *   For local component state, use React's built-in `useState` and `useReducer` hooks.
    *   For global application state, consider `useContext` for simpler scenarios.
    *   For managing server-side data (fetching, caching, synchronization, mutations), **always use Tanstack Query**.
*   **Backend & Authentication:**
    *   All interactions with the database, authentication, and real-time features must be done via the `supabase` client provided in `src/integrations/supabase/client.ts`.
    *   Do not implement custom backend logic or direct database connections outside of Supabase.
*   **Icons:**
    *   Use icons from the `lucide-react` library.
*   **Notifications:**
    *   For all user feedback and notifications (e.g., success messages, error alerts), use the `sonner` toast library. The `Sonner` component is already integrated into `src/App.tsx`.
*   **Form Handling:**
    *   For complex forms, use `react-hook-form` for managing form state and validation.
    *   Integrate `zod` with `@hookform/resolvers` for schema-based form validation.
*   **Date Manipulation:**
    *   Use `date-fns` for any date formatting, parsing, or manipulation tasks.
*   **Data Export:**
    *   For generating PDF documents, use `jspdf` and `jspdf-autotable`.
    *   For generating Excel (XLSX) files, use the `xlsx` library.