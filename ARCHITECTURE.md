# Architecture Document: GEO/AEO Tracking SaaS

This document defines the system architecture, folder structure, database schema, and API specifications for the Generative Engine Optimization (GEO) & Answer Engine Optimization (AEO) Tracking Software.

The platform is designed to track how brands and their competitors are mentioned, ranked, and analyzed across modern generative AI models and search engines (e.g., OpenAI ChatGPT, Anthropic Claude, Google Gemini, Perplexity AI, Microsoft Copilot).

---

## 1. Tech Stack Details

The application is built with a modern, type-safe, and highly scalable serverless stack that adheres strictly to the project rules.

*   **Frontend & Application Framework**:
    *   **Next.js 14 (App Router)**: Utilizing React Server Components (RSC) for optimized initial loads, Server Actions for data mutation, and Client Components for interactive dashboard features.
    *   **TypeScript (Strict Mode)**: Strictly enforced type safety across all components, API routes, and database models. No usage of `any`.
*   **Styling**:
    *   **Tailwind CSS**: Utility-first CSS for responsive, modular, and fast UI development.
    *   **Component Architecture**: Small, modular components. Atomic UI components (such as buttons, inputs, dialogs) will be housed in `/src/components/ui`.
*   **Backend & Database (BaaS)**:
    *   **Supabase**:
        *   **PostgreSQL**: relational database with support for complex joining of brands, scans, and analytical aggregates.
        *   **Supabase Auth**: Complete secure user management (Email/Password, Magic Link, and OAuth), fully integrated with Next.js middleware for session persistence.
        *   **Row-Level Security (RLS)**: Enforced directly at the Postgres layer to guarantee complete multi-tenant isolation.
        *   **Supabase Storage**: Object storage for generated reports (PDF, CSV, Excel formats).

---

## 2. System Overview & Core Concepts

GEO/AEO monitoring tracks how a **Brand** and its **Competitors** appear in the context of specific LLM and answer engine queries (**Prompts**).

### Core Workflow
1.  **Onboarding**: A user configures their **Brand** and registers a list of direct **Competitors**.
2.  **Prompt Setting**: The user registers tracking **Prompts** (e.g., *"What is the best project management software for agencies?"*).
3.  **Scan Execution**:
    *   A **Scan** is triggered manually or on a cron schedule.
    *   The system dispatches request jobs to target search engines and LLM providers.
    *   The raw answer is parsed to check for occurrences of the Brand or Competitor.
4.  **Data Extraction & Sentiment Analysis**:
    *   **Mentions** are recorded for each entity found in the response.
    *   The system extracts:
        *   **Rank/Order**: Was the brand recommended first, second, or not at all?
        *   **Sentiment**: Is the recommendation positive, neutral, or negative?
        *   **Context Snippet**: The sentence or paragraph describing the brand.
        *   **Share of Voice (SOV)**: The percentage of positive mentions of the brand relative to all competitor mentions.
5.  **Analytics & Reporting**: Dashboard charts and exported files analyze trends over time.

---

## 3. Database Schema

The schema is built on Supabase Postgres. Every table has Row-Level Security (RLS) enabled, ensuring users can only read or modify data linked to their profiles.

```
                  ┌──────────────────┐
                  │   profiles       │ (auth.users)
                  └────────┬─────────┘
                           │ 1:N
                  ┌────────▼─────────┐
                  │   brands         │
                  └────┬────────┬────┘
           1:N         │        │ 1:N
     ┌─────────────────┘        └─────────────────┐
     │                                            │
┌────▼─────────────┐                         ┌────▼─────────────┐
│   competitors    │                         │   prompts        │
└────┬─────────────┘                         └────┬─────────────┘
     │ 1:N                                        │ 1:N
     │            ┌──────────────────┐            │
     │            │   scans          │            │
     │            └────────┬─────────┘            │
     │                     │ 1:N                  │
     │   ┌─────────────────┼──────────────────────┘
     │   │                 │
┌────▼───▼─────────────────▼─────────┐
│   mentions                         │
└────────────────────────────────────┘
```

### Table 1: `profiles`
Stores supplementary user information linked to the primary Supabase Auth metadata.
*   *Security*: Authenticated users can read/write only their own profile.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Matches Supabase Auth user ID. |
| `email` | `text` | `UNIQUE`, `NOT NULL` | User's email address. |
| `full_name` | `text` | `NULLABLE` | Display name. |
| `company_name`| `text` | `NULLABLE` | Optional company/organization name. |
| `created_at` | `timestamptz`| `DEFAULT now()`, `NOT NULL` | Creation timestamp. |
| `updated_at` | `timestamptz`| `DEFAULT now()`, `NOT NULL` | Last update timestamp. |

### Table 2: `brands`
The primary entity that the user is tracking.
*   *Security*: Row-Level Security restricts reading, updating, and deleting to the brand's owner (`user_id = auth.uid()`).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `user_id` | `uuid` | `REFERENCES profiles(id) ON DELETE CASCADE`, `NOT NULL` | Owner of the brand. |
| `name` | `text` | `NOT NULL` | Brand name (e.g., "Linear"). |
| `website_url` | `text` | `NULLABLE` | URL (e.g., "https://linear.app"). |
| `created_at` | `timestamptz`| `DEFAULT now()`, `NOT NULL` | Creation timestamp. |
| `updated_at` | `timestamptz`| `DEFAULT now()`, `NOT NULL` | Last update timestamp. |

### Table 3: `competitors`
Direct competitors mapped to a specific brand.
*   *Security*: Users can only access competitors associated with a brand they own.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `brand_id` | `uuid` | `REFERENCES brands(id) ON DELETE CASCADE`, `NOT NULL` | Associated tracked brand. |
| `name` | `text` | `NOT NULL` | Competitor name (e.g., "Jira", "Asana"). |
| `website_url` | `text` | `NULLABLE` | Competitor website. |
| `created_at` | `timestamptz`| `DEFAULT now()`, `NOT NULL` | Creation timestamp. |

### Table 4: `prompts`
The specific search queries run across generative search engines.
*   *Security*: Users can only manage prompts for brands they own.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `brand_id` | `uuid` | `REFERENCES brands(id) ON DELETE CASCADE`, `NOT NULL` | Associated brand context. |
| `text` | `text` | `NOT NULL` | The raw question (e.g., "best bug tracker for SaaS"). |
| `category` | `text` | `NULLABLE` | Query category (e.g., "SaaS", "DevTools"). |
| `engines` | `text[]` | `NOT NULL` | Targeted engines (e.g., `['openai-gpt4o', 'perplexity']`). |
| `is_active` | `boolean` | `DEFAULT true`, `NOT NULL` | Toggle automatic scanning. |
| `created_at` | `timestamptz`| `DEFAULT now()`, `NOT NULL` | Creation timestamp. |
| `updated_at` | `timestamptz`| `DEFAULT now()`, `NOT NULL` | Last update timestamp. |

### Table 5: `scans`
Tracking jobs initialized either manually by the user or through an automated scheduler.
*   *Security*: Restricted access to users owning the related brand.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique scan identifier. |
| `brand_id` | `uuid` | `REFERENCES brands(id) ON DELETE CASCADE`, `NOT NULL` | Brand scope of the scan. |
| `status` | `text` | `NOT NULL` | Current status: `'pending'`, `'running'`, `'completed'`, `'failed'`. |
| `error_message`| `text` | `NULLABLE` | Troubleshooting logs on failures. |
| `created_at` | `timestamptz`| `DEFAULT now()`, `NOT NULL` | Scan execution start timestamp. |
| `completed_at`| `timestamptz`| `NULLABLE` | Scan conclusion timestamp. |

### Table 6: `mentions`
The granular results parsed from LLM/search engine responses. Holds the quantitative and qualitative data of a brand's visibility.
*   *Security*: Restricts reads to owners of the correlated brand.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `scan_id` | `uuid` | `REFERENCES scans(id) ON DELETE CASCADE`, `NOT NULL` | Execution job reference. |
| `prompt_id` | `uuid` | `REFERENCES prompts(id) ON DELETE CASCADE`, `NOT NULL` | Query source. |
| `engine` | `text` | `NOT NULL` | AI Engine source (e.g., `'openai-gpt4o'`). |
| `brand_id` | `uuid` | `REFERENCES brands(id) ON DELETE CASCADE`, `NULLABLE` | Associated if it mentions our brand. |
| `competitor_id`| `uuid` | `REFERENCES competitors(id) ON DELETE CASCADE`, `NULLABLE` | Associated if it mentions a competitor. |
| `entity_type` | `text` | `NOT NULL` | Discourses: `'brand'` or `'competitor'`. |
| `is_mentioned` | `boolean` | `NOT NULL`, `DEFAULT false` | True if the entity exists in response text. |
| `rank` | `integer` | `NULLABLE` | Numeric ranking if mentioned in order. |
| `sentiment` | `text` | `NULLABLE` | Evaluated sentiment: `'positive'`, `'neutral'`, `'negative'`. |
| `context_snippet`| `text`| `NULLABLE` | Sentence block surrounding the entity mention. |
| `full_response`| `text` | `NOT NULL` | Full raw output of the AI answer engine. |
| `created_at` | `timestamptz`| `DEFAULT now()`, `NOT NULL` | Time entry record. |


---

## 4. API Routes Specification

All API routes are located inside the `src/app/api/` folder. Every API route must follow the strict error handling policy defined in `.clinerules`:
1.  All code blocks must be wrapped in `try/catch` statements.
2.  Errors must return descriptive JSON bodies and appropriate HTTP status codes (e.g., `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`).
3.  The Supabase route handler client is used to enforce row-level security boundaries.

### Auth Webhook Handler
*   **POST** `/api/auth/webhook`
    *   *Purpose*: Receives webhook calls from Supabase Auth when a user is successfully registered. This populates the `public.profiles` database schema.
    *   *Headers*: Requires a security handshake token or webhook signature header.
    *   *Payload*:
        ```json
        {
          "type": "INSERT",
          "table": "users",
          "record": {
            "id": "uuid-string",
            "email": "user@example.com",
            "raw_user_meta_data": {
              "full_name": "Jane Doe",
              "company_name": "Acme Inc"
            }
          }
        }
        ```
    *   *Response*: `200 OK` or error status.

### Brand & Competitor Management
*   **GET** `/api/brands`
    *   *Purpose*: Fetch all brands and their basic statistics managed by the active user.
    *   *Response*: `200 OK` with `[ { "id": "...", "name": "...", "website_url": "...", "competitor_count": 3, "prompt_count": 12 } ]`
*   **POST** `/api/brands`
    *   *Purpose*: Creates a new brand scope.
    *   *Payload*:
        ```json
        {
          "name": "Linear",
          "website_url": "https://linear.app"
        }
        ```
    *   *Response*: `201 Created` with the newly created brand object.
*   **PATCH/DELETE** `/api/brands/[brandId]`
    *   *Purpose*: Modifies brand parameters or deletes a brand (which triggers a cascade deletion of all competitors, prompts, and mentions).
*   **GET/POST** `/api/brands/[brandId]/competitors`
    *   *Purpose*: Manages competitors within the context of a given brand.
    *   *Payload (POST)*: `{ "name": "Jira", "website_url": "https://jira.com" }`

### Scan Management & Dispatcher
*   **POST** `/api/scans/trigger`
    *   *Purpose*: Dispatches a new scanning routine. It schedules background parsing of LLM queries.
    *   *Payload*:
        ```json
        {
          "brand_id": "uuid-string",
          "prompt_ids": ["prompt-uuid-1", "prompt-uuid-2"]
        }
        ```
    *   *Response*: `202 Accepted`
        ```json
        {
          "scan_id": "uuid-string",
          "status": "pending",
          "triggered_at": "2026-09-17T08:00:00.000Z"
        }
        ```
*   **GET** `/api/scans/[scanId]`
    *   *Purpose*: Polls or queries the current execution state of an ongoing scan (for UI progress tracking).
    *   *Response*: `200 OK` with `{ "scan_id": "...", "status": "running" | "completed" | "failed" }`

### Reports & Analytics
*   **GET** `/api/reports/analytics`
    *   *Purpose*: Calculates multi-tenant aggregations over specified date limits, feeding dashboard charts.
    *   *Query Parameters*: `brand_id` (required), `start_date` (optional), `end_date` (optional), `engine` (optional).
    *   *Response*: `200 OK` with detailed aggregates:
        *   **Share of Voice (SOV)**: Percentage share of positive mentions between Brand and competitors.
        *   **Sentiment Metrics**: Counts of Positive/Neutral/Negative sentiment records per engine.
        *   **Visibility / Rank Trend**: Performance charts tracking average rank across engines.
*   **POST** `/api/reports/generate`
    *   *Purpose*: Triggers a asynchronous job to format analytics data into a spreadsheet or PDF and upload it to Supabase Storage.
    *   *Payload*: `{ "brand_id": "uuid", "format": "csv" | "excel", "start_date": "...", "end_date": "..." }`
    *   *Response*: `200 OK` with `{ "download_url": "https://supabase.../bucket/report.csv" }`


---

## 5. Folder Structure

The application's directories are structured to isolate business domains, modular UI components, and API routing logic. This prevents directories from becoming cluttered and simplifies ongoing maintenance.

```text
/
├── .clinerules                      # Strict project coding constraints & workflows
├── ARCHITECTURE.md                  # Comprehensive architectural reference (this file)
├── next.config.js                   # Next.js configurations
├── package.json                     # System dependencies & scripts
├── tailwind.config.js               # Utility CSS design tokens
├── tsconfig.json                    # Strict compiler rules (no implicit any)
├── src/
│   ├── app/                         # App Router Root
│   │   ├── layout.tsx               # Base HTML document shell
│   │   ├── page.tsx                 # Public Landing / Marketing view
│   │   ├── login/
│   │   │   └── page.tsx             # Auth Login panel
│   │   ├── signup/
│   │   │   └── page.tsx             # Auth Signup panel
│   │   ├── dashboard/               # Authenticated Space
│   │   │   ├── layout.tsx           # Sidebar Navigation & Workspace selector shell
│   │   │   ├── page.tsx             # Combined Dashboard overview (Metrics & SOV summary)
│   │   │   ├── brands/              # Brand and competitor manager
│   │   │   │   ├── page.tsx         # Brand listing screen
│   │   │   │   └── [brandId]/
│   │   │   │       └── page.tsx     # Brand detail and competitor management panel
│   │   │   ├── prompts/             # Prompt / query configuration
│   │   │   │   └── page.tsx         # Prompts creation and toggle board
│   │   │   ├── scans/               # Scanning interface
│   │   │   │   ├── page.tsx         # History of scan triggers & status logs
│   │   │   │   └── [scanId]/
│   │   │   │       └── page.tsx     # Full responses, specific mentions, & metrics from a scan
│   │   │   └── reports/             # Reporting section
│   │   │       └── page.tsx         # Analytical dashboards, charts, & export triggers
│   │   └── api/                     # Type-safe API endpoints
│   │       ├── auth/
│   │       │   └── webhook/
│   │       │       └── route.ts     # User registration sync handler
│   │       ├── brands/
│   │       │   ├── route.ts         # Query & create brands
│   │       │   └── [brandId]/
│   │       │       ├── route.ts     # Individual brand operations
│   │       │       └── competitors/
│   │       │           └── route.ts # Add or fetch competitors
│   │       ├── scans/
│   │       │   ├── trigger/
│   │       │   │   └── route.ts     # Initiates scan parser workers
│   │       │   └── [scanId]/
│   │       │       └── route.ts     # State polling endpoint
│   │       └── reports/
│   │           ├── generate/
│   │           │   └── route.ts     # Triggers PDF/CSV compiling
│   │           └── analytics/
│   │               └── route.ts     # Returns aggregate datasets for visualization
│   ├── components/                  # UI Components (modular, compact, clean)
│   │   ├── ui/                      # Base primitive components (buttons, input fields, cards, tables)
│   │   ├── layout/                  # Shell components (Sidebar navigation, User profiles popover)
│   │   ├── brands/                  # Components for listing brands, editing forms
│   │   ├── scans/                   # Scan trigger forms, active scanning bars, history tables
│   │   └── reports/                 # Chart displays, analytics totals cards
│   ├── hooks/                       # Custom functional hooks
│   │   ├── use-supabase.ts          # Client-safe accessor for Supabase database methods
│   │   └── use-auth.ts              # Authentication state provider
│   ├── lib/                         # Integration classes and modules
│   │   ├── supabase/                # Clients for diverse Next.js runtimes
│   │   │   ├── client.ts            # Client Component SDK connection
│   │   │   ├── server.ts            # Server Component SDK connection
│   │   │   └── middleware.ts        # Route protection / session refresher
│   │   ├── utils.ts                 # Clean utility wrappers (Tailwind CSS mergers)
│   │   └── engines/                 # Scraper/fetcher wrappers for AI Engines (OpenAI, Claude, Perplexity)
│   └── types/                       # Explicit TypeScript type files
│       ├── index.ts                 # Shared system interfaces
│       └── database.types.ts        # Autogenerated database typings via Supabase CLI
```

