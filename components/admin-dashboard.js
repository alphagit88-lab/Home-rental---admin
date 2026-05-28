"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Dashboard",
    description: "KPIs, revenue, and latest activity",
  },
  {
    id: "operations",
    label: "User Management",
    description: "Admins, customers, suppliers, drivers",
  },
  {
    id: "accounts",
    label: "Accounts",
    description: "Owners, tenants, and service providers",
  },
  {
    id: "properties",
    label: "Properties",
    description: "Listings and live activation control",
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "Reservation and payment visibility",
  },
  {
    id: "requests",
    label: "Service Requests",
    description: "Post-booking service-provider workflows",
  },
  {
    id: "categories",
    label: "Categories",
    description: "Service category management",
  },
];

const ACCOUNT_ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "owner", label: "Owners" },
  { value: "tenant", label: "Tenants" },
  { value: "service_provider", label: "Service Providers" },
];

const PROPERTY_STATUS_OPTIONS = [
  { value: "all", label: "All listings" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const BOOKING_STATUS_OPTIONS = [
  { value: "all", label: "All booking states" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "All payment states" },
  { value: "deposit_pending", label: "Deposit pending" },
  { value: "deposit_paid", label: "Deposit paid" },
  { value: "paid", label: "Paid" },
  { value: "expired", label: "Expired" },
];

const REQUEST_STATUS_OPTIONS = [
  { value: "all", label: "All request states" },
  { value: "awaiting_full_payment", label: "Awaiting payment" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const OPS_ROLE_OPTIONS = [
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
  { value: "driver", label: "Driver" },
];

const SUPPLIER_TYPE_OPTIONS = [
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
  { value: "commercial_residential", label: "Commercial + Residential" },
];

const moneyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

const preciseMoneyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const APP_ROLE_LABELS = {
  owner: "Owner",
  tenant: "Tenant",
  service_provider: "Service Provider",
};

const SYSTEM_ROLE_LABELS = {
  admin: "Admin",
  customer: "Customer",
  supplier: "Supplier",
  driver: "Driver",
};

const emptyOverview = {
  summary: {
    activeAccounts: 0,
    owners: 0,
    tenants: 0,
    serviceProviders: 0,
    totalProperties: 0,
    activeProperties: 0,
    inactiveProperties: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    depositPendingBookings: 0,
    depositPaidBookings: 0,
    paidBookings: 0,
    grossBookingValue: 0,
    collectedDeposits: 0,
    recognizedRevenue: 0,
    totalServiceRequests: 0,
    awaitingPaymentRequests: 0,
    pendingServiceRequests: 0,
    acceptedServiceRequests: 0,
    completedServiceRequests: 0,
    cancelledServiceRequests: 0,
  },
  recentProperties: [],
  recentBookings: [],
  recentServiceRequests: [],
};

const request = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };

  if (options.body && !headers["content-type"]) {
    headers["content-type"] = "application/json";
  }

  const response = await fetch(path, {
    ...options,
    headers,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Request failed");
  }

  return payload;
};

const buildQuery = (entries) => {
  const params = new URLSearchParams();

  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const formatMoney = (value, precise = false) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return precise
    ? preciseMoneyFormatter.format(numericValue)
    : moneyFormatter.format(numericValue);
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return dateFormatter.format(parsed);
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return dateTimeFormatter.format(parsed);
};

const formatAppRoleLabel = (value) => {
  if (!value) {
    return "-";
  }

  return APP_ROLE_LABELS[value] || String(value).replace(/_/g, " ");
};

const formatSystemRoleLabel = (value) => {
  if (!value) {
    return "-";
  }

  return SYSTEM_ROLE_LABELS[value] || value;
};

const getAppRoleTone = (value) => {
  if (value === "owner") {
    return "good";
  }

  if (value === "service_provider") {
    return "warn";
  }

  if (value === "tenant") {
    return "info";
  }

  return "neutral";
};

const getTone = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("paid")
    || normalized === "confirmed"
    || normalized === "accepted"
    || normalized === "active"
  ) {
    return "good";
  }

  if (
    normalized.includes("pending")
    || normalized.includes("awaiting")
    || normalized === "deposit_paid"
  ) {
    return "warn";
  }

  if (normalized === "completed") {
    return "info";
  }

  if (
    normalized === "cancelled"
    || normalized === "inactive"
    || normalized === "expired"
    || normalized === "rejected"
  ) {
    return "danger";
  }

  return "neutral";
};

function StatusBadge({ children, tone }) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>;
}

function StatCard({ label, value, hint }) {
  return (
    <article className="surface stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-hint">{hint}</span>
    </article>
  );
}

function SectionHeader({ title, description, actions }) {
  if (!actions) return null;
  return (
    <div className="section-header-actions-only">
      {actions}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function DataTable({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
  className = "",
  filterBar = null,
}) {
  return (
    <div className={`surface table-shell ${className}`.trim()}>
      {filterBar}
      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.id || `${rowIndex}-${columns[0]?.key || "row"}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminIcon({ name }) {
  const iconProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "overview":
    case "dashboard":
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "operations":
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "accounts":
      return (
        <svg {...iconProps}>
          <path d="M20 21a8 8 0 1 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "properties":
      return (
        <svg {...iconProps}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M10 21v-6h4v6" />
        </svg>
      );
    case "bookings":
      return (
        <svg {...iconProps}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M3 11h18" />
        </svg>
      );
    case "requests":
      return (
        <svg {...iconProps}>
          <path d="M14.5 4.5 19.5 9.5" />
          <path d="M5 19l3.5-.7L18.8 8a1.8 1.8 0 0 0 0-2.6l-.2-.2a1.8 1.8 0 0 0-2.6 0L5.7 15.5 5 19z" />
        </svg>
      );
    case "categories":
      return (
        <svg {...iconProps}>
          <path d="m12 3 8 4-8 4-8-4 8-4z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 17 8 4 8-4" />
        </svg>
      );
    case "money":
      return (
        <svg {...iconProps}>
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "deposit":
      return (
        <svg {...iconProps}>
          <path d="M3 7h18v10H3z" />
          <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...iconProps}>
          <path d="M21 12a9 9 0 0 1-15.5 6.4" />
          <path d="M3 12A9 9 0 0 1 18.5 5.6" />
          <path d="M19 2v5h-5" />
          <path d="M5 22v-5h5" />
        </svg>
      );
    case "logout":
      return (
        <svg {...iconProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    case "plus":
      return (
        <svg {...iconProps}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...iconProps}>
          <path d="M2 12h4l2.2-4 3.6 8 2.8-6H22" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

function AdminMetricCard({
  icon,
  label,
  value,
  caption,
  trend,
  tone = "violet",
}) {
  return (
    <article className={`surface admin-metric-card admin-tone-${tone}`.trim()}>
      <div className="admin-metric-top">
        <span className="admin-icon-badge">
          <AdminIcon name={icon} />
        </span>
        {trend ? <span className="admin-trend-pill">{trend}</span> : null}
      </div>
      <span className="admin-metric-label">{label}</span>
      <strong className="admin-metric-value">{value}</strong>
      {caption ? <span className="admin-metric-caption">{caption}</span> : null}
    </article>
  );
}

function AdminPageHeader({ title, description, actions }) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}

function AdminPanel({
  title,
  description,
  actions,
  className = "",
  children,
}) {
  return (
    <section className={`surface admin-panel ${className}`.trim()}>
      {title || description || actions ? (
        <div className="admin-panel-head">
          <div>
            {title ? <h3>{title}</h3> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="admin-panel-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);
  const [activeView, setActiveView] = useState("overview");
  const [opsRoleFilter, setOpsRoleFilter] = useState("all");
  const [opsSearchFilter, setOpsSearchFilter] = useState("");
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [notice, setNotice] = useState(null);
  const [workingKey, setWorkingKey] = useState("");
  const [overview, setOverview] = useState(emptyOverview);
  const [accounts, setAccounts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [opsUsers, setOpsUsers] = useState({
    admins: [],
    customer: [],
    supplier: [],
    driver: [],
  });
  const [accountFilters, setAccountFilters] = useState({
    role: "all",
    search: "",
  });
  const [propertyFilters, setPropertyFilters] = useState({
    status: "all",
    search: "",
  });
  const [bookingFilters, setBookingFilters] = useState({
    bookingStatus: "all",
    paymentStatus: "all",
    search: "",
  });
  const [requestFilters, setRequestFilters] = useState({
    status: "all",
    search: "",
  });
  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "customer",
    password: "",
    supplierType: "commercial",
    supplierId: "",
  });
  const [adminForm, setAdminForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        const sessionPayload = await request("/api/session/me");
        setSession(sessionPayload.data.user);

        const results = await Promise.allSettled([
          loadOverview(),
          loadAccounts(accountFilters),
          loadProperties(propertyFilters),
          loadBookings(bookingFilters),
          loadServiceRequests(requestFilters),
          loadCategories(),
          loadOpsUsers(),
        ]);

        const failedResult = results.find((result) => result.status === "rejected");
        if (failedResult) {
          throw failedResult.reason;
        }
      } catch (error) {
        setNotice({
          type: "error",
          message: error.message || "Your session expired. Sign in again.",
        });
        router.replace("/login");
      } finally {
        setBooting(false);
      }
    };

    initialize();
  }, [router]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setNotice(null);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [notice]);

  const loadOverview = async () => {
    const payload = await request("/api/backend/admin/rental/dashboard");
    setOverview(payload.data.overview || emptyOverview);
  };

  const loadAccounts = async (filters = accountFilters) => {
    const query = buildQuery({
      role: filters.role,
      search: filters.search,
      limit: 100,
    });
    const payload = await request(`/api/backend/admin/rental/accounts${query}`);
    setAccounts(payload.data.accounts || []);
  };

  const loadProperties = async (filters = propertyFilters) => {
    const query = buildQuery({
      status: filters.status,
      search: filters.search,
      limit: 100,
    });
    const payload = await request(`/api/backend/admin/rental/properties${query}`);
    setProperties(payload.data.properties || []);
  };

  const loadBookings = async (filters = bookingFilters) => {
    const query = buildQuery({
      bookingStatus: filters.bookingStatus,
      paymentStatus: filters.paymentStatus,
      search: filters.search,
      limit: 100,
    });
    const payload = await request(`/api/backend/admin/rental/bookings${query}`);
    setBookings(payload.data.bookings || []);
  };

  const loadServiceRequests = async (filters = requestFilters) => {
    const query = buildQuery({
      status: filters.status,
      search: filters.search,
      limit: 100,
    });
    const payload = await request(
      `/api/backend/admin/rental/service-requests${query}`,
    );
    setServiceRequests(payload.data.requests || []);
  };

  const loadCategories = async () => {
    const payload = await request("/api/backend/service-categories");
    setCategories(payload.data.categories || []);
  };

  const loadOpsUsers = async () => {
    const [adminsPayload, customersPayload, suppliersPayload, driversPayload] =
      await Promise.all([
        request("/api/backend/admin"),
        request("/api/backend/admin/users/customer"),
        request("/api/backend/admin/users/supplier"),
        request("/api/backend/admin/users/driver"),
      ]);

    setOpsUsers({
      admins: adminsPayload.data.admins || [],
      customer: customersPayload.data.users || [],
      supplier: suppliersPayload.data.users || [],
      driver: driversPayload.data.users || [],
    });
  };

  const handleLogout = async () => {
    setWorkingKey("logout");

    try {
      await request("/api/session/logout", {
        method: "POST",
      });

      router.replace("/login");
      router.refresh();
    } finally {
      setWorkingKey("");
    }
  };

  const handleRefresh = async () => {
    setWorkingKey("refresh");

    try {
      await Promise.all([
        loadOverview(),
        loadAccounts(accountFilters),
        loadProperties(propertyFilters),
        loadBookings(bookingFilters),
        loadServiceRequests(requestFilters),
        loadCategories(),
        loadOpsUsers(),
      ]);

      setNotice({
        type: "success",
        message: "Dashboard data refreshed.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setWorkingKey("");
    }
  };

  const handlePropertyToggle = async (property) => {
    const nextState = !property.isActive;
    const confirmed = window.confirm(
      `${nextState ? "Activate" : "Deactivate"} ${property.title}?`,
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `property-${property.id}`;
    setWorkingKey(actionKey);

    try {
      await request(`/api/backend/admin/rental/properties/${property.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive: nextState }),
      });

      await Promise.all([loadProperties(propertyFilters), loadOverview()]);
      setNotice({
        type: "success",
        message: `${property.title} is now ${
          nextState ? "active" : "inactive"
        }.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setWorkingKey("");
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setWorkingKey("category-save");

    try {
      if (categoryForm.id) {
        await request(`/api/backend/service-categories/${categoryForm.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: categoryForm.name,
            description: categoryForm.description,
          }),
        });
      } else {
        await request("/api/backend/service-categories", {
          method: "POST",
          body: JSON.stringify({
            name: categoryForm.name,
            description: categoryForm.description,
          }),
        });
      }

      await loadCategories();
      setCategoryForm({
        id: null,
        name: "",
        description: "",
      });
      setNotice({
        type: "success",
        message: categoryForm.id
          ? "Service category updated."
          : "Service category created.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setWorkingKey("");
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    if (!window.confirm("Delete this service category?")) {
      return;
    }

    setWorkingKey(`category-${categoryId}`);

    try {
      await request(`/api/backend/service-categories/${categoryId}`, {
        method: "DELETE",
      });

      await loadCategories();
      if (categoryForm.id === categoryId) {
        setCategoryForm({
          id: null,
          name: "",
          description: "",
        });
      }

      setNotice({
        type: "success",
        message: "Service category deleted.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setWorkingKey("");
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setWorkingKey("user-create");

    try {
      await request("/api/backend/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: userForm.name,
          phone: userForm.phone,
          email: userForm.email || undefined,
          role: userForm.role,
          password: userForm.password,
          supplierType:
            userForm.role === "supplier" ? userForm.supplierType : undefined,
          supplierId: userForm.role === "driver" ? userForm.supplierId : undefined,
        }),
      });

      await loadOpsUsers();
      setUserForm({
        name: "",
        phone: "",
        email: "",
        role: "customer",
        password: "",
        supplierType: "commercial",
        supplierId: "",
      });

      setNotice({
        type: "success",
        message: "Operations user created successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setWorkingKey("");
    }
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setWorkingKey("admin-create");

    try {
      await request("/api/backend/admin", {
        method: "POST",
        body: JSON.stringify(adminForm),
      });

      await loadOpsUsers();
      setAdminForm({
        name: "",
        phone: "",
        email: "",
        password: "",
      });

      setNotice({
        type: "success",
        message: "Admin account created successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setWorkingKey("");
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Delete this admin account?")) {
      return;
    }

    setWorkingKey(`admin-delete-${adminId}`);

    try {
      await request(`/api/backend/admin/${adminId}`, {
        method: "DELETE",
      });

      await loadOpsUsers();
      setNotice({
        type: "success",
        message: "Admin deleted successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setWorkingKey("");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user account?")) {
      return;
    }

    setWorkingKey(`user-delete-${userId}`);

    try {
      await request(`/api/backend/admin/users/${userId}`, {
        method: "DELETE",
      });

      await loadOpsUsers();
      setNotice({
        type: "success",
        message: "User deleted successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setWorkingKey("");
    }
  };

  if (booting) {
    return (
      <main className="new-login-container">
        <div className="new-login-sidebar" style={{ minHeight: '100vh' }}>
          <div className="new-login-sidebar-content">
            <div className="new-login-logo-container">
              <div className="new-login-logo">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#c00b4c"></path>
                  <path d="M10 11h4v5h-4z" fill="white"></path>
                  <path d="M8 11l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="new-login-content">
          <div className="new-login-form-wrapper">
            <div className="new-login-mobile-logo" style={{ marginBottom: '2rem' }}>
              <div className="new-login-logo">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#c00b4c"></path>
                  <path d="M10 11h4v5h-4z" fill="white"></path>
                  <path d="M8 11l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
            </div>
            <h1 className="new-login-title">Preparing admin workspace</h1>
            <p className="new-login-subtitle">Checking your session and syncing data from the backend.</p>
            <div className="new-login-spinner-container">
              <div className="new-login-spinner"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const summary = overview.summary || emptyOverview.summary;

  const overviewColumns = [
    {
      key: "property",
      label: "Recent properties",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.title}</strong>
          <span>{row.propertyCode}</span>
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.ownerName}</strong>
          <span>{row.ownerEmail || "-"}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge tone={getTone(row.isActive ? "active" : "inactive")}>
          {row.isActive ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    },
    {
      key: "rent",
      label: "Monthly rent",
      render: (row) => formatMoney(row.monthlyRent, true),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  const recentBookingColumns = [
    {
      key: "bookingCode",
      label: "Recent bookings",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.bookingCode}</strong>
          <span>{row.propertyTitle}</span>
        </div>
      ),
    },
    {
      key: "guest",
      label: "Tenant / Owner",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.tenantName}</strong>
          <span>{row.ownerName}</span>
        </div>
      ),
    },
    {
      key: "bookingStatus",
      label: "Booking",
      render: (row) => (
        <StatusBadge tone={getTone(row.bookingStatus)}>
          {row.bookingStatus}
        </StatusBadge>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (row) => (
        <StatusBadge tone={getTone(row.paymentStatus)}>
          {row.paymentStatus}
        </StatusBadge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  const recentRequestColumns = [
    {
      key: "serviceCategoryName",
      label: "Request",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.serviceCategoryName}</strong>
          <span>{row.propertyTitle}</span>
        </div>
      ),
    },
    {
      key: "actors",
      label: "Tenant / Service Provider",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.tenantName}</strong>
          <span>{row.serviceProviderName || "Unassigned"}</span>
        </div>
      ),
    },
    {
      key: "requestStatus",
      label: "Status",
      render: (row) => (
        <StatusBadge tone={getTone(row.requestStatus)}>
          {row.requestStatus}
        </StatusBadge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  const accountColumns = [
    {
      key: "name",
      label: "Account holder",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.name}</strong>
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      key: "appRole",
      label: "App role",
      render: (row) => (
        <StatusBadge tone={getAppRoleTone(row.appRole)}>
          {formatAppRoleLabel(row.appRole)}
        </StatusBadge>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => row.phone || "-",
    },
    {
      key: "systemRole",
      label: "System role",
      render: (row) => formatSystemRoleLabel(row.systemRole),
    },
    {
      key: "activity",
      label: "Activity",
      render: (row) => (
        <div className="stacked-cell">
          <span>{row.propertyCount} properties</span>
          <span>{row.bookingCount} bookings</span>
          <span>{row.assignedRequestCount} assigned requests</span>
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <StatusBadge tone={getTone(row.isActive ? "active" : "inactive")}>
          {row.isActive ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  const propertyColumns = [
    {
      key: "title",
      label: "Property",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.title}</strong>
          <span>{row.propertyCode}</span>
        </div>
      ),
    },
    {
      key: "ownerName",
      label: "Owner",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.ownerName}</strong>
          <span>{row.ownerEmail || "-"}</span>
        </div>
      ),
    },
    {
      key: "locationText",
      label: "Location",
      render: (row) => row.locationText,
    },
    {
      key: "monthlyRent",
      label: "Rent",
      render: (row) => formatMoney(row.monthlyRent, true),
    },
    {
      key: "availability",
      label: "Availability",
      render: (row) => (
        <div className="stacked-cell">
          <span>{formatDate(row.availableFrom)}</span>
          <span>{formatDate(row.availableTo)}</span>
        </div>
      ),
    },
    {
      key: "bookings",
      label: "Bookings",
      render: (row) => (
        <div className="stacked-cell">
          <span>{row.totalBookings} total</span>
          <span>{row.activeBookings} active</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="stacked-cell">
          <StatusBadge tone={getTone(row.isActive ? "active" : "inactive")}>
            {row.isActive ? "Active" : "Inactive"}
          </StatusBadge>
          <button
            className="ghost-button compact"
            type="button"
            onClick={() => handlePropertyToggle(row)}
            disabled={workingKey === `property-${row.id}`}
          >
            {workingKey === `property-${row.id}`
              ? "Saving..."
              : row.isActive
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  const bookingColumns = [
    {
      key: "bookingCode",
      label: "Booking",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.bookingCode}</strong>
          <span>{row.propertyTitle}</span>
        </div>
      ),
    },
    {
      key: "tenantName",
      label: "Tenant",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.tenantName}</strong>
          <span>{row.tenantEmail}</span>
        </div>
      ),
    },
    {
      key: "ownerName",
      label: "Owner",
      render: (row) => row.ownerName,
    },
    {
      key: "stay",
      label: "Stay",
      render: (row) => (
        <div className="stacked-cell">
          <span>{formatDate(row.checkIn)}</span>
          <span>{formatDate(row.checkOut)}</span>
        </div>
      ),
    },
    {
      key: "statuses",
      label: "Status",
      render: (row) => (
        <div className="stacked-cell">
          <StatusBadge tone={getTone(row.bookingStatus)}>
            {row.bookingStatus}
          </StatusBadge>
          <StatusBadge tone={getTone(row.paymentStatus)}>
            {row.paymentStatus}
          </StatusBadge>
        </div>
      ),
    },
    {
      key: "amounts",
      label: "Amounts",
      render: (row) => (
        <div className="stacked-cell">
          <span>Total: {formatMoney(row.totalAmount, true)}</span>
          <span>Deposit: {formatMoney(row.depositAmount, true)}</span>
          <span>Balance: {formatMoney(row.remainingAmount, true)}</span>
        </div>
      ),
    },
    {
      key: "serviceRequestCount",
      label: "Service requests",
      render: (row) => row.serviceRequestCount,
    },
  ];

  const serviceRequestColumns = [
    {
      key: "serviceCategoryName",
      label: "Request",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.serviceCategoryName}</strong>
          <span>{row.bookingCode}</span>
        </div>
      ),
    },
    {
      key: "propertyTitle",
      label: "Property",
      render: (row) => row.propertyTitle,
    },
    {
      key: "tenantName",
      label: "Tenant / Owner",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.tenantName}</strong>
          <span>{row.ownerName}</span>
        </div>
      ),
    },
    {
      key: "serviceProviderName",
      label: "Service Provider",
      render: (row) => row.serviceProviderName || "Unassigned",
    },
    {
      key: "requestStatus",
      label: "Status",
      render: (row) => (
        <StatusBadge tone={getTone(row.requestStatus)}>
          {row.requestStatus}
        </StatusBadge>
      ),
    },
    {
      key: "responseCount",
      label: "Responses",
      render: (row) => row.responseCount,
    },
    {
      key: "createdAt",
      label: "Updated",
      render: (row) => formatDateTime(row.updatedAt || row.createdAt),
    },
  ];

  const categoryColumns = [
    {
      key: "name",
      label: "Category",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.name}</strong>
          <span>{row.description || "No description"}</span>
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <StatusBadge tone={getTone(row.is_active ? "active" : "inactive")}>
          {row.is_active ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="inline-actions">
          <button
            className="ghost-button compact"
            type="button"
            onClick={() =>
              setCategoryForm({
                id: row.id,
                name: row.name || "",
                description: row.description || "",
              })
            }
          >
            Edit
          </button>
          <button
            className="ghost-button compact danger"
            type="button"
            onClick={() => handleCategoryDelete(row.id)}
            disabled={workingKey === `category-${row.id}`}
          >
            {workingKey === `category-${row.id}` ? "Deleting..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  const formatTextLabel = (value) => {
    if (!value) {
      return "-";
    }

    return String(value).replace(/_/g, " ");
  };

  const getTimestampValue = (value) => {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const sessionInitials = (session?.name || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "A";

  const activeCategoryCount = categories.filter((category) => category.is_active).length;

  const allOperationsUsers = [
    ...opsUsers.admins.map((user) => ({ ...user, _kind: "admin" })),
    ...opsUsers.customer.map((user) => ({ ...user, _kind: "customer" })),
    ...opsUsers.supplier.map((user) => ({ ...user, _kind: "supplier" })),
    ...opsUsers.driver.map((user) => ({ ...user, _kind: "driver" })),
  ];

  const filteredOperationsUsers = allOperationsUsers.filter((user) => {
    const matchesRole = opsRoleFilter === "all" || user._kind === opsRoleFilter;
    const query = opsSearchFilter.trim().toLowerCase();
    const matchesSearch = !query
      || (user.name || "").toLowerCase().includes(query)
      || (user.email || "").toLowerCase().includes(query)
      || (user.phone || "").toLowerCase().includes(query);

    return matchesRole && matchesSearch;
  });

  const overviewActivity = [
    ...(overview.recentBookings || []).map((item) => ({
      id: `booking-${item.id || item.bookingCode}`,
      title: item.bookingCode || "New booking",
      description: `${item.tenantName || "Tenant"} reserved ${item.propertyTitle || "a property"}.`,
      meta: `${formatTextLabel(item.bookingStatus)} / ${formatTextLabel(item.paymentStatus)}`,
      timestamp: item.createdAt,
      icon: "bookings",
      tone: "violet",
    })),
    ...(overview.recentProperties || []).map((item) => ({
      id: `property-${item.id || item.propertyCode}`,
      title: item.title || "New property",
      description: `${item.ownerName || "Owner"} listed ${item.locationText || item.propertyCode || "a home"}.`,
      meta: item.isActive ? "Listing active" : "Listing inactive",
      timestamp: item.createdAt,
      icon: "properties",
      tone: "emerald",
    })),
    ...(overview.recentServiceRequests || []).map((item) => ({
      id: `request-${item.id || item.bookingCode || item.serviceCategoryName}`,
      title: item.serviceCategoryName || "Service request",
      description: `${item.tenantName || "Tenant"} requested support for ${item.propertyTitle || "a stay"}.`,
      meta: item.serviceProviderName || "Waiting for provider assignment",
      timestamp: item.createdAt,
      icon: "requests",
      tone: "orange",
    })),
  ]
    .sort((left, right) => getTimestampValue(right.timestamp) - getTimestampValue(left.timestamp))
    .slice(0, 8);

  const overviewMetrics = [
    {
      icon: "accounts",
      label: "Active Accounts",
      value: summary.activeAccounts,
      trend: `${summary.owners} owners`,
      caption: `${summary.tenants} tenants and ${summary.serviceProviders} providers`,
      tone: "violet",
    },
    {
      icon: "properties",
      label: "Live Properties",
      value: summary.activeProperties,
      trend: `${summary.totalProperties} total`,
      caption: `${summary.inactiveProperties} inactive listings`,
      tone: "emerald",
    },
    {
      icon: "bookings",
      label: "Reservations",
      value: summary.totalBookings,
      trend: `${summary.confirmedBookings} confirmed`,
      caption: `${summary.pendingBookings} pending and ${summary.completedBookings} completed`,
      tone: "cyan",
    },
    {
      icon: "requests",
      label: "Service Requests",
      value: summary.totalServiceRequests,
      trend: `${summary.acceptedServiceRequests} accepted`,
      caption: `${summary.pendingServiceRequests} pending and ${summary.completedServiceRequests} completed`,
      tone: "orange",
    },
  ];

  const accountMetrics = [
    {
      icon: "accounts",
      label: "Owners",
      value: summary.owners,
      caption: "Registered owner accounts",
      tone: "violet",
    },
    {
      icon: "accounts",
      label: "Tenants",
      value: summary.tenants,
      caption: "Active tenant profiles",
      tone: "cyan",
    },
    {
      icon: "operations",
      label: "Providers",
      value: summary.serviceProviders,
      caption: "Service providers on the platform",
      tone: "orange",
    },
  ];

  const propertyMetrics = [
    {
      icon: "properties",
      label: "Total Listings",
      value: summary.totalProperties,
      caption: "All homes in the catalog",
      tone: "violet",
    },
    {
      icon: "properties",
      label: "Active Listings",
      value: summary.activeProperties,
      caption: "Currently visible to renters",
      tone: "emerald",
    },
    {
      icon: "properties",
      label: "Inactive Listings",
      value: summary.inactiveProperties,
      caption: "Paused or hidden homes",
      tone: "orange",
    },
  ];

  const bookingMetrics = [
    {
      icon: "bookings",
      label: "Total Bookings",
      value: summary.totalBookings,
      caption: "All reservation records",
      tone: "violet",
    },
    {
      icon: "bookings",
      label: "Pending",
      value: summary.pendingBookings,
      caption: "Awaiting confirmation",
      tone: "orange",
    },
    {
      icon: "bookings",
      label: "Confirmed",
      value: summary.confirmedBookings,
      caption: "Ready for check-in",
      tone: "emerald",
    },
    {
      icon: "deposit",
      label: "Deposit Pending",
      value: summary.depositPendingBookings,
      caption: "Still waiting on deposit payment",
      tone: "cyan",
    },
  ];

  const requestMetrics = [
    {
      icon: "requests",
      label: "Total Requests",
      value: summary.totalServiceRequests,
      caption: "All booking-linked support requests",
      tone: "violet",
    },
    {
      icon: "requests",
      label: "Awaiting Payment",
      value: summary.awaitingPaymentRequests,
      caption: "Blocked until booking payment clears",
      tone: "orange",
    },
    {
      icon: "requests",
      label: "Pending Match",
      value: summary.pendingServiceRequests,
      caption: "Need provider assignment",
      tone: "cyan",
    },
    {
      icon: "requests",
      label: "Accepted",
      value: summary.acceptedServiceRequests,
      caption: "In active provider workflow",
      tone: "emerald",
    },
  ];

  const categoryMetrics = [
    {
      icon: "categories",
      label: "Categories",
      value: categories.length,
      caption: "Available service groups",
      tone: "violet",
    },
    {
      icon: "categories",
      label: "Active",
      value: activeCategoryCount,
      caption: "Currently selectable by users",
      tone: "emerald",
    },
    {
      icon: "categories",
      label: "Inactive",
      value: Math.max(categories.length - activeCategoryCount, 0),
      caption: "Hidden from new requests",
      tone: "orange",
    },
  ];

  const operationsMetrics = [
    {
      icon: "operations",
      label: "All Members",
      value: allOperationsUsers.length,
      caption: "Admins and operational users",
      tone: "violet",
    },
    {
      icon: "operations",
      label: "Admins",
      value: opsUsers.admins.length,
      caption: "Dashboard access accounts",
      tone: "emerald",
    },
    {
      icon: "accounts",
      label: "Customers",
      value: opsUsers.customer.length,
      caption: "Legacy phone-based customer records",
      tone: "cyan",
    },
    {
      icon: "operations",
      label: "Suppliers / Drivers",
      value: opsUsers.supplier.length + opsUsers.driver.length,
      caption: "Fulfillment and field users",
      tone: "orange",
    },
  ];

  const operationsColumns = [
    {
      key: "name",
      label: "Staff Name",
      render: (row) => (
        <div className="stacked-cell">
          <strong>{row.name || "-"}</strong>
          <span>{row.phone || "-"}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email Address",
      render: (row) => row.email || "-",
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <StatusBadge tone={row._kind === "admin" ? "good" : "info"}>
          {formatTextLabel(row._kind)}
        </StatusBadge>
      ),
    },
    {
      key: "joined",
      label: "Date Joined",
      render: (row) => formatDate(row.createdAt || row.updatedAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          className="ghost-button compact danger"
          type="button"
          onClick={() =>
            row._kind === "admin"
              ? handleDeleteAdmin(row.id)
              : handleDeleteUser(row.id)
          }
          disabled={
            workingKey === `admin-delete-${row.id}`
            || workingKey === `user-delete-${row.id}`
          }
        >
          {workingKey === `admin-delete-${row.id}`
          || workingKey === `user-delete-${row.id}`
            ? "Deleting..."
            : "Delete"}
        </button>
      ),
    },
  ];

  const renderOperationsBucket = (title, items, kind) => (
    <article className="surface">
      <div className="surface-title-row">
        <div>
          <h3>{title}</h3>
          <p>{items.length} records</p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} yet`} description="Create one from the forms above." />
      ) : (
        <div className="mini-list">
          {items.map((item) => (
            <div className="mini-list-row" key={`${kind}-${item.id}`}>
              <div className="stacked-cell">
                <strong>{item.name}</strong>
                <span>{item.email || item.phone}</span>
              </div>
              <div className="inline-actions">
                <StatusBadge tone={getTone(item.role === "admin" ? "active" : "pending")}>
                  {item.role}
                </StatusBadge>
                <button
                  className="ghost-button compact danger"
                  type="button"
                  onClick={() =>
                    kind === "admin"
                      ? handleDeleteAdmin(item.id)
                      : handleDeleteUser(item.id)
                  }
                  disabled={
                    workingKey === `admin-delete-${item.id}`
                    || workingKey === `user-delete-${item.id}`
                  }
                >
                  {workingKey === `admin-delete-${item.id}`
                  || workingKey === `user-delete-${item.id}`
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );

  const getHeaderDetails = () => {
    switch (activeView) {
      case "overview":
        return {
          title: "Platform overview",
          subtitle: "Real-time summary of the home-rental pipeline, including account mix, listing volume, booking health, and service activity.",
        };
      case "accounts":
        return {
          title: "Rental accounts",
          subtitle: "Manage owners, tenants, and service providers across the rental app.",
        };
      case "properties":
        return {
          title: "Properties control",
          subtitle: "Monitor, activate, edit, and control home rental listings.",
        };
      case "bookings":
        return {
          title: "Bookings & Reservations",
          subtitle: "Track tenant bookings, checkout schedules, and booking payments.",
        };
      case "requests":
        return {
          title: "Service Requests",
          subtitle: "Track service-provider assignment, acceptance, and completion.",
        };
      case "categories":
        return {
          title: "Service Categories",
          subtitle: "Manage maintenance service types, categories, and tags.",
        };
      case "operations":
        return {
          title: "User Management",
          subtitle: "Manage administrative, customer, supplier, and driver accounts.",
        };
      default:
        return {
          title: "Admin Console",
          subtitle: "Manage your rental listings, payments, and system operations.",
        };
    }
  };



  return (
    <main className="admin-ui-shell">
      <aside className="admin-ui-sidebar">
        <div className="admin-ui-sidebar-top">
          <div className="admin-ui-logo-card">
            <div className="admin-ui-logo-mark">HR</div>
            <div className="admin-ui-logo-copy">
              <strong>Home Rental Admin</strong>
              <span>Control center</span>
            </div>
          </div>

          <span className="admin-ui-sidebar-label">Core System</span>

          <nav className="admin-ui-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`admin-ui-nav-button ${activeView === item.id ? "admin-ui-nav-button-active" : ""}`}
                type="button"
                onClick={() => setActiveView(item.id)}
              >
                <span className="admin-ui-nav-icon">
                  <AdminIcon name={item.id} />
                </span>
                <span className="admin-ui-nav-text">{item.label}</span>
                <span className="admin-ui-nav-rail" />
              </button>
            ))}
          </nav>
        </div>

        <div className="admin-ui-sidebar-footer">
          <div className="admin-ui-profile-card">
            <div className="admin-ui-avatar">{sessionInitials}</div>
            <div className="admin-ui-profile-copy">
              <strong>{session?.name || "Admin"}</strong>
              <span>{session?.email || session?.phone || "Authenticated administrator"}</span>
            </div>
          </div>
          <button
            className="primary-button subtle admin-ui-logout"
            type="button"
            onClick={handleLogout}
            disabled={workingKey === "logout"}
          >
            <AdminIcon name="logout" />
            {workingKey === "logout" ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      <section className="admin-ui-main">
        {notice ? (
          <div className={`notice notice-${notice.type || "info"} admin-ui-notice`}>
            {notice.message}
          </div>
        ) : null}

        {activeView === "overview" ? (
          <section className="admin-view">
            <AdminPageHeader
              title="System Overview"
              description="Welcome back. Here is what is moving across accounts, listings, reservations, and support work."
              actions={(
                <>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={handleRefresh}
                    disabled={workingKey === "refresh"}
                  >
                    <AdminIcon name="refresh" />
                    {workingKey === "refresh" ? "Refreshing..." : "Refresh data"}
                  </button>
                  <span className="admin-health-pill">
                    <AdminIcon name="pulse" />
                    Live sync
                  </span>
                </>
              )}
            />

            <div className="admin-metric-grid">
              {overviewMetrics.map((metric) => (
                <AdminMetricCard key={metric.label} {...metric} />
              ))}
            </div>

            <div className="admin-overview-layout">
              <AdminPanel
                title="Recent Activity"
                description="A combined feed of the latest listings, bookings, and service requests."
                className="admin-activity-panel"
              >
                {overviewActivity.length === 0 ? (
                  <EmptyState
                    title="No recent activity yet"
                    description="New listings, reservations, and service updates will appear here."
                  />
                ) : (
                  <div className="admin-activity-feed">
                    {overviewActivity.map((item) => (
                      <div className="admin-activity-row" key={item.id}>
                        <span className={`admin-icon-badge admin-tone-${item.tone}`.trim()}>
                          <AdminIcon name={item.icon} />
                        </span>
                        <div className="admin-activity-copy">
                          <strong>{item.title}</strong>
                          <p>{item.description}</p>
                          <span>{item.meta}</span>
                        </div>
                        <time>{formatDateTime(item.timestamp)}</time>
                      </div>
                    ))}
                  </div>
                )}
              </AdminPanel>

              <div className="admin-overview-side">
                <AdminPanel
                  title="Revenue Snapshot"
                  description="Key income markers from the current booking pipeline."
                >
                  <div className="admin-stat-list">
                    <div className="admin-stat-list-row">
                      <span>Gross booking value</span>
                      <strong>{formatMoney(summary.grossBookingValue)}</strong>
                    </div>
                    <div className="admin-stat-list-row">
                      <span>Collected deposits</span>
                      <strong>{formatMoney(summary.collectedDeposits)}</strong>
                    </div>
                    <div className="admin-stat-list-row">
                      <span>Recognized revenue</span>
                      <strong>{formatMoney(summary.recognizedRevenue)}</strong>
                    </div>
                    <div className="admin-stat-list-row">
                      <span>Deposit paid bookings</span>
                      <strong>{summary.depositPaidBookings}</strong>
                    </div>
                  </div>
                </AdminPanel>

                <AdminPanel
                  title="Latest Listings"
                  description="Newest owner inventory entering the system."
                >
                  {(overview.recentProperties || []).length === 0 ? (
                    <EmptyState
                      title="No listings yet"
                      description="Owner-created properties will appear here once available."
                    />
                  ) : (
                    <div className="admin-compact-list">
                      {(overview.recentProperties || []).slice(0, 4).map((item) => (
                        <div className="admin-compact-row" key={item.id || item.propertyCode}>
                          <div className="stacked-cell">
                            <strong>{item.title}</strong>
                            <span>{item.ownerName || item.propertyCode || "-"}</span>
                          </div>
                          <StatusBadge tone={getTone(item.isActive ? "active" : "inactive")}>
                            {item.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>
                      ))}
                    </div>
                  )}
                </AdminPanel>

                <AdminPanel
                  title="Latest Reservations"
                  description="Most recent booking and payment updates."
                >
                  {(overview.recentBookings || []).length === 0 ? (
                    <EmptyState
                      title="No reservations yet"
                      description="Tenant booking activity will appear here as it happens."
                    />
                  ) : (
                    <div className="admin-compact-list">
                      {(overview.recentBookings || []).slice(0, 4).map((item) => (
                        <div className="admin-compact-row" key={item.id || item.bookingCode}>
                          <div className="stacked-cell">
                            <strong>{item.bookingCode}</strong>
                            <span>{item.propertyTitle || "-"}</span>
                          </div>
                          <StatusBadge tone={getTone(item.bookingStatus)}>
                            {formatTextLabel(item.bookingStatus)}
                          </StatusBadge>
                        </div>
                      ))}
                    </div>
                  )}
                </AdminPanel>
              </div>
            </div>
          </section>
        ) : null}

        {activeView === "accounts" ? (
          <section className="admin-view">
            <AdminPageHeader
              title="Account Directory"
              description="Review home-rental identities created through the app and keep role-based account visibility clear."
              actions={(
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleRefresh}
                  disabled={workingKey === "refresh"}
                >
                  <AdminIcon name="refresh" />
                  {workingKey === "refresh" ? "Refreshing..." : "Refresh data"}
                </button>
              )}
            />

            <div className="admin-metric-grid admin-metric-grid-compact">
              {accountMetrics.map((metric) => (
                <AdminMetricCard key={metric.label} {...metric} />
              ))}
            </div>

            <DataTable
              className="admin-table-card"
              columns={accountColumns}
              rows={accounts}
              emptyTitle="No rental accounts matched your filters"
              emptyDescription="Try another role filter or a broader search term."
              filterBar={(
                <form
                  className="ops-filter-bar"
                  onSubmit={async (event) => {
                    event.preventDefault();

                    try {
                      await loadAccounts(accountFilters);
                    } catch (error) {
                      setNotice({
                        type: "error",
                        message: error.message,
                      });
                    }
                  }}
                >
                  <select
                    value={accountFilters.role}
                    onChange={(event) =>
                      setAccountFilters((current) => ({
                        ...current,
                        role: event.target.value,
                      }))
                    }
                  >
                    {ACCOUNT_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Search name, email, or phone"
                    value={accountFilters.search}
                    onChange={(event) =>
                      setAccountFilters((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                  />
                  <button className="ghost-button" type="submit">
                    Apply
                  </button>
                </form>
              )}
            />
          </section>
        ) : null}

        {activeView === "properties" ? (
          <section className="admin-view">
            <AdminPageHeader
              title="Property Listings"
              description="Monitor owner inventory, review location and pricing details, and toggle listing visibility when needed."
              actions={(
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleRefresh}
                  disabled={workingKey === "refresh"}
                >
                  <AdminIcon name="refresh" />
                  {workingKey === "refresh" ? "Refreshing..." : "Refresh data"}
                </button>
              )}
            />

            <div className="admin-metric-grid admin-metric-grid-compact">
              {propertyMetrics.map((metric) => (
                <AdminMetricCard key={metric.label} {...metric} />
              ))}
            </div>

            <DataTable
              className="admin-table-card"
              columns={propertyColumns}
              rows={properties}
              emptyTitle="No properties matched your filters"
              emptyDescription="Try clearing the status filter or search query."
              filterBar={(
                <form
                  className="ops-filter-bar"
                  onSubmit={async (event) => {
                    event.preventDefault();

                    try {
                      await loadProperties(propertyFilters);
                    } catch (error) {
                      setNotice({
                        type: "error",
                        message: error.message,
                      });
                    }
                  }}
                >
                  <select
                    value={propertyFilters.status}
                    onChange={(event) =>
                      setPropertyFilters((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                  >
                    {PROPERTY_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Search title, code, owner, or location"
                    value={propertyFilters.search}
                    onChange={(event) =>
                      setPropertyFilters((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                  />
                  <button className="ghost-button" type="submit">
                    Apply
                  </button>
                </form>
              )}
            />
          </section>
        ) : null}

        {activeView === "bookings" ? (
          <section className="admin-view">
            <AdminPageHeader
              title="Reservation Control"
              description="Track reservation status, payment movement, and service demand generated by active stays."
              actions={(
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleRefresh}
                  disabled={workingKey === "refresh"}
                >
                  <AdminIcon name="refresh" />
                  {workingKey === "refresh" ? "Refreshing..." : "Refresh data"}
                </button>
              )}
            />

            <div className="admin-metric-grid admin-metric-grid-compact">
              {bookingMetrics.map((metric) => (
                <AdminMetricCard key={metric.label} {...metric} />
              ))}
            </div>

            <DataTable
              className="admin-table-card"
              columns={bookingColumns}
              rows={bookings}
              emptyTitle="No bookings matched your filters"
              emptyDescription="Adjust the booking or payment state filters to widen the result set."
              filterBar={(
                <form
                  className="ops-filter-bar"
                  onSubmit={async (event) => {
                    event.preventDefault();

                    try {
                      await loadBookings(bookingFilters);
                    } catch (error) {
                      setNotice({
                        type: "error",
                        message: error.message,
                      });
                    }
                  }}
                >
                  <select
                    value={bookingFilters.bookingStatus}
                    onChange={(event) =>
                      setBookingFilters((current) => ({
                        ...current,
                        bookingStatus: event.target.value,
                      }))
                    }
                  >
                    {BOOKING_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={bookingFilters.paymentStatus}
                    onChange={(event) =>
                      setBookingFilters((current) => ({
                        ...current,
                        paymentStatus: event.target.value,
                      }))
                    }
                  >
                    {PAYMENT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Search booking, property, owner, or tenant"
                    value={bookingFilters.search}
                    onChange={(event) =>
                      setBookingFilters((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                  />
                  <button className="ghost-button" type="submit">
                    Apply
                  </button>
                </form>
              )}
            />
          </section>
        ) : null}

        {activeView === "requests" ? (
          <section className="admin-view">
            <AdminPageHeader
              title="Service Requests"
              description="Follow request assignment after payment clears and see where provider fulfillment is slowing down."
              actions={(
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleRefresh}
                  disabled={workingKey === "refresh"}
                >
                  <AdminIcon name="refresh" />
                  {workingKey === "refresh" ? "Refreshing..." : "Refresh data"}
                </button>
              )}
            />

            <div className="admin-metric-grid admin-metric-grid-compact">
              {requestMetrics.map((metric) => (
                <AdminMetricCard key={metric.label} {...metric} />
              ))}
            </div>

            <DataTable
              className="admin-table-card"
              columns={serviceRequestColumns}
              rows={serviceRequests}
              emptyTitle="No service requests matched your filters"
              emptyDescription="Try switching the request status filter or searching a different booking."
              filterBar={(
                <form
                  className="ops-filter-bar"
                  onSubmit={async (event) => {
                    event.preventDefault();

                    try {
                      await loadServiceRequests(requestFilters);
                    } catch (error) {
                      setNotice({
                        type: "error",
                        message: error.message,
                      });
                    }
                  }}
                >
                  <select
                    value={requestFilters.status}
                    onChange={(event) =>
                      setRequestFilters((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                  >
                    {REQUEST_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Search booking, category, owner, or provider"
                    value={requestFilters.search}
                    onChange={(event) =>
                      setRequestFilters((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                  />
                  <button className="ghost-button" type="submit">
                    Apply
                  </button>
                </form>
              )}
            />
          </section>
        ) : null}

        {activeView === "categories" ? (
          <section className="admin-view">
            <AdminPageHeader
              title="Categories"
              description="Define the service catalog owners and tenants can choose from without changing existing category functions."
              actions={(
                <>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => {
                      setCategoryForm({
                        id: null,
                        name: "",
                        description: "",
                      });
                      const editor = document.getElementById("category-editor");
                      if (editor) {
                        editor.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    <AdminIcon name="plus" />
                    Create category
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={handleRefresh}
                    disabled={workingKey === "refresh"}
                  >
                    <AdminIcon name="refresh" />
                    {workingKey === "refresh" ? "Refreshing..." : "Refresh data"}
                  </button>
                </>
              )}
            />

            <div className="admin-metric-grid admin-metric-grid-compact">
              {categoryMetrics.map((metric) => (
                <AdminMetricCard key={metric.label} {...metric} />
              ))}
            </div>

            <div className="admin-category-layout">
              <AdminPanel
                title={categoryForm.id ? "Edit Category" : "Create Category"}
                description="Keep the service catalog clean, clear, and easy to manage."
                className="admin-category-form-panel"
              >
                <form className="form-stack" onSubmit={handleCategorySubmit} id="category-editor">
                  <label className="field">
                    <span>Name</span>
                    <input
                      value={categoryForm.name}
                      onChange={(event) =>
                        setCategoryForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Garden cleaning"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <textarea
                      value={categoryForm.description}
                      onChange={(event) =>
                        setCategoryForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Short explanation shown to users"
                      rows={5}
                    />
                  </label>

                  <div className="inline-actions">
                    <button
                      className="primary-button"
                      type="submit"
                      disabled={workingKey === "category-save"}
                    >
                      {workingKey === "category-save"
                        ? "Saving..."
                        : categoryForm.id
                          ? "Update category"
                          : "Create category"}
                    </button>
                    {categoryForm.id ? (
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() =>
                          setCategoryForm({
                            id: null,
                            name: "",
                            description: "",
                          })
                        }
                      >
                        Cancel edit
                      </button>
                    ) : null}
                  </div>
                </form>
              </AdminPanel>

              <div className="admin-category-grid">
                {categories.length === 0 ? (
                  <AdminPanel className="admin-category-empty">
                    <EmptyState
                      title="No categories available"
                      description="Create your first service category to support the provider workflow."
                    />
                  </AdminPanel>
                ) : (
                  categories.map((category) => (
                    <article className="surface admin-category-card" key={category.id}>
                      <div className="admin-category-card-head">
                        <span className="admin-icon-badge">
                          <AdminIcon name="categories" />
                        </span>
                        <StatusBadge tone={getTone(category.is_active ? "active" : "inactive")}>
                          {category.is_active ? "Active" : "Inactive"}
                        </StatusBadge>
                      </div>
                      <div className="admin-category-card-body">
                        <h3>{category.name}</h3>
                        <p>{category.description || "No description added yet."}</p>
                      </div>
                      <div className="admin-category-card-footer">
                        <span className="admin-category-id">System ID: #{category.id}</span>
                        <div className="inline-actions">
                          <button
                            className="ghost-button compact"
                            type="button"
                            onClick={() => {
                              setCategoryForm({
                                id: category.id,
                                name: category.name || "",
                                description: category.description || "",
                              });
                              const editor = document.getElementById("category-editor");
                              if (editor) {
                                editor.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="ghost-button compact danger"
                            type="button"
                            onClick={() => handleCategoryDelete(category.id)}
                            disabled={workingKey === `category-${category.id}`}
                          >
                            {workingKey === `category-${category.id}` ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        ) : null}

        {activeView === "operations" ? (
          <section className="admin-view">
            <AdminPageHeader
              title="Staff Directory"
              description="Manage dashboard admins and operational users without changing the underlying account flows."
              actions={(
                <>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => {
                      setShowAdminForm(true);
                      setShowUserForm(true);
                    }}
                  >
                    <AdminIcon name="plus" />
                    Add members
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={handleRefresh}
                    disabled={workingKey === "refresh"}
                  >
                    <AdminIcon name="refresh" />
                    {workingKey === "refresh" ? "Refreshing..." : "Refresh data"}
                  </button>
                </>
              )}
            />

            <div className="admin-metric-grid admin-metric-grid-compact">
              {operationsMetrics.map((metric) => (
                <AdminMetricCard key={metric.label} {...metric} />
              ))}
            </div>

            <div className="admin-form-panels">
              <article className="surface">
                <div className="surface-title-row">
                  <div>
                    <h3>Create admin</h3>
                    <p>Admins can access this dashboard and protected management endpoints.</p>
                  </div>
                  <button
                    className="collapse-toggle"
                    type="button"
                    aria-label="Toggle form"
                    onClick={() => setShowAdminForm((v) => !v)}
                  >
                    {showAdminForm ? "Hide form" : "Open form"}
                  </button>
                </div>

                {showAdminForm && <form className="form-stack" onSubmit={handleCreateAdmin}>
                  <div className="form-grid">
                    <label className="field">
                      <span>Name</span>
                      <input
                        value={adminForm.name}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Phone</span>
                      <input
                        value={adminForm.phone}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Email</span>
                      <input
                        type="email"
                        value={adminForm.email}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Password</span>
                      <input
                        type="password"
                        value={adminForm.password}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                  </div>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={workingKey === "admin-create"}
                  >
                    {workingKey === "admin-create" ? "Creating..." : "Create admin"}
                  </button>
                </form>}
              </article>

              <article className="surface">
                <div className="surface-title-row">
                  <div>
                    <h3>Create operations user</h3>
                    <p>Use supplier and driver roles for the older operational workflows.</p>
                  </div>
                  <button
                    className="collapse-toggle"
                    type="button"
                    aria-label="Toggle form"
                    onClick={() => setShowUserForm((v) => !v)}
                  >
                    {showUserForm ? "Hide form" : "Open form"}
                  </button>
                </div>

                {showUserForm && <form className="form-stack" onSubmit={handleCreateUser}>
                  <div className="form-grid">
                    <label className="field">
                      <span>Name</span>
                      <input
                        value={userForm.name}
                        onChange={(event) =>
                          setUserForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Phone</span>
                      <input
                        value={userForm.phone}
                        onChange={(event) =>
                          setUserForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Email</span>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(event) =>
                          setUserForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Role</span>
                      <select
                        value={userForm.role}
                        onChange={(event) =>
                          setUserForm((current) => ({
                            ...current,
                            role: event.target.value,
                          }))
                        }
                      >
                        {OPS_ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Password</span>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(event) =>
                          setUserForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        required
                      />
                    </label>

                    {userForm.role === "supplier" ? (
                      <label className="field">
                        <span>Supplier type</span>
                        <select
                          value={userForm.supplierType}
                          onChange={(event) =>
                            setUserForm((current) => ({
                              ...current,
                              supplierType: event.target.value,
                            }))
                          }
                        >
                          {SUPPLIER_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}

                    {userForm.role === "driver" ? (
                      <label className="field">
                        <span>Supplier ID</span>
                        <input
                          value={userForm.supplierId}
                          onChange={(event) =>
                            setUserForm((current) => ({
                              ...current,
                              supplierId: event.target.value,
                            }))
                          }
                          placeholder="Existing supplier user id"
                        />
                      </label>
                    ) : null}
                  </div>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={workingKey === "user-create"}
                  >
                    {workingKey === "user-create" ? "Creating..." : "Create user"}
                  </button>
                </form>}
              </article>
            </div>

            {(() => {
              const allUsers = [
                ...opsUsers.admins.map((u) => ({ ...u, _kind: "admin" })),
                ...opsUsers.customer.map((u) => ({ ...u, _kind: "customer" })),
                ...opsUsers.supplier.map((u) => ({ ...u, _kind: "supplier" })),
                ...opsUsers.driver.map((u) => ({ ...u, _kind: "driver" })),
              ];
              const filtered = allUsers.filter((u) => {
                const roleMatch = opsRoleFilter === "all" || u._kind === opsRoleFilter;
                const q = opsSearchFilter.trim().toLowerCase();
                const searchMatch = !q ||
                  (u.name || "").toLowerCase().includes(q) ||
                  (u.email || "").toLowerCase().includes(q) ||
                  (u.phone || "").toLowerCase().includes(q);
                return roleMatch && searchMatch;
              });
              return (
                <article className="surface table-shell">
                  <div className="ops-filter-bar">
                    <select
                      value={opsRoleFilter}
                      onChange={(e) => setOpsRoleFilter(e.target.value)}
                    >
                      <option value="all">All roles</option>
                      <option value="admin">Admins</option>
                      <option value="customer">Customers</option>
                      <option value="supplier">Suppliers</option>
                      <option value="driver">Drivers</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search name, email or phone..."
                      value={opsSearchFilter}
                      onChange={(e) => setOpsSearchFilter(e.target.value)}
                    />
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Contact</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={4}>
                              <EmptyState title="No users found" description="Try adjusting your filters." />
                            </td>
                          </tr>
                        ) : (
                          filtered.map((u) => (
                            <tr key={`${u._kind}-${u.id}`}>
                              <td><strong>{u.name}</strong></td>
                              <td>{u.email || u.phone}</td>
                              <td>
                                <StatusBadge tone={getTone(u._kind === "admin" ? "active" : "pending")}>
                                  {u._kind}
                                </StatusBadge>
                              </td>
                              <td>
                                <button
                                  className="ghost-button compact danger"
                                  type="button"
                                  onClick={() =>
                                    u._kind === "admin"
                                      ? handleDeleteAdmin(u.id)
                                      : handleDeleteUser(u.id)
                                  }
                                  disabled={
                                    workingKey === `admin-delete-${u.id}` ||
                                    workingKey === `user-delete-${u.id}`
                                  }
                                >
                                  {workingKey === `admin-delete-${u.id}` || workingKey === `user-delete-${u.id}`
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>
              );
            })()}
          </section>
        ) : null}
      </section>
    </main>
  );
}

