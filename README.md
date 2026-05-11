# Home Rental Admin Dashboard

The administrative control center for the Home Rental platform. Built with Next.js, it provides a high-performance, real-time interface for managing properties, users, and financial transactions.

## ✨ Key Features

- **Executive Overview**: Real-time stats on bookings, properties, and system health.
- **Property Command**: Activate/Deactivate listings and monitor property details.
- **Account Management**: Manage diverse roles including Owners, Tenants, Suppliers, and Drivers.
- **Financial Monitoring**: Track invoices, bills, and payouts across the platform.
- **Service Orchestration**: Manage service categories and maintenance requests.
- **Security**: Next.js middleware and proxy-based API communication.

## 🛠 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Vanilla CSS (Global & Modules)
- **API Communication**: Custom proxy layer to bypass CORS issues and secure backend URLs.

## 🚀 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env.local` file:
   ```env
   BACKEND_URL=http://localhost:5000
   ```

3. **Start the Engine**:
   ```bash
   npm run dev
   ```
   *Dashboard available at `http://localhost:3001`.*

## 📁 Folder Architecture

- `/app`: Next.js routes and layouts.
- `/components`: Modular UI components (e.g., `admin-dashboard.js`).
- `/lib`: Helper libraries for backend communication and session management.
- `/public`: Static assets and icons.

## 🚢 Deployment

The project is optimized for deployment on Vercel or any Node.js environment.

```bash
npm run build
npm start
```
