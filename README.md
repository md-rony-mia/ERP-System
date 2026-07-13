# Nexova ERP Solution

Nexova ERP Solution is a high-fidelity, comprehensive enterprise resource planning (ERP) platform designed for modern business operations. It features integrated inventory tracking, point of sale (POS) billing, CRM, financial accounting, double-entry ledgers, banking/loans, and employee management.

## Key Modules

- **Inventory Control**: Master catalog, warehouse zones, RFID tag simulation, and stock level tracking.
- **Sales & POS Billing**: Fast point of sale terminal, invoicing, real-time receipt generation, and customer profile management.
- **CRM System**: Lead pipelines, campaign tracking, and meeting schedules.
- **Accounting & Ledgers**: Automated double-entry cash flow logging, balance sheet generator, and trial balance statements.
- **Banking & Loans**: Bank account registry, loan interest calculators, and multi-currency registers.
- **Manufacturing & MRP**: Bills of Materials (BOM), production routing, quality assurance, and manufacturing resource planning.
- **Human Resources**: Employee onboarding, payroll records, and attendance tracking.

## Getting Started

### Prerequisites

To run this application locally, you need:
- **Node.js** (v18 or higher recommended)
- **npm** (or yarn)

### Installation

1. Clone or extract the project codebase into your directory.
2. Open your terminal in the project root directory.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

1. Create a `.env.local` file in the root directory (or use `.env.example` as a template) and configure your environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the local server URL (typically `http://localhost:3000`).

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Tooling**: Vite
- **Libraries**: Lucide React (Icons), Recharts (Data Visualization), XLSX (Excel Export)
- **Database**: Cloud-persisted Firestore integration for durable multi-user state synchronization.
