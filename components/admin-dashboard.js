"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    description: "KPIs, revenue, and recent activity",
  },
  {
    id: "accounts",
    label: "Rental Accounts",
    description: "Owners, tenants, and provider accounts",
  },
  {
    id: "properties",
    label: "Properties",
    description: "Listings and activation controls",
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "Reservations and payment tracking",
  },
  {
    id: "requests",
    label: "Service Requests",
    description: "Provider assignments and progress",
  },
  {
    id: "categories",
    label: "Categories",
    description: "Service catalog management",
  },
  {
    id: "operations",
    label: "Team & Access",
    description: "Admins, suppliers, customers, drivers",
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
    return "—";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return precise
    ? preciseMoneyFormatter.format(numericValue)
    : moneyFormatter.format(numericValue);
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return dateFormatter.format(parsed);
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
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

function SectionHeader({ title, description, actions, kicker }) {
  return (
    <div className="section-header">
      <div>
        {kicker ? <span className="section-kicker">{kicker}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="section-actions">{actions}</div> : null}
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

function HeroMetric({ label, value, hint }) {
  return (
    <div className="hero-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function CommandCard({
  eyebrow,
  title,
  value,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <article className="surface command-card">
      <span className="command-card-eyebrow">{eyebrow}</span>
      <strong className="command-card-value">{value}</strong>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="ghost-button compact" type="button" onClick={onAction}>
        {actionLabel}
      </button>
    </article>
  );
}

function ActivityListCard({
  kicker,
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
  actionLabel,
  onAction,
  renderItem,
}) {
  return (
    <article className="surface activity-list-card">
      <div className="activity-list-head">
        <div>
          <span className="section-kicker">{kicker}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <button className="ghost-button compact" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="activity-list">
          {items.map((item, index) => (
            <div
              className="activity-list-row"
              key={item.id || item.bookingCode || `${title}-${index}`}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </article>
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
      <main className="loading-screen">
        <div className="loading-card">
          <div className="loading-glow" />
          <strong>Preparing the admin workspace</strong>
          <p>Checking your session and syncing data from the backend.</p>
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
          <span>{row.ownerEmail || "—"}</span>
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
      render: (row) => row.phone || "—",
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
          <span>{row.ownerEmail || "—"}</span>
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
          kicker: "Operations brief",
          title: "Rental program command center",
          subtitle:
            "Track the full platform from inventory and revenue to service follow-up, then move into each workspace without losing the overall picture.",
          metrics: [
            {
              label: "Recognized revenue",
              value: formatMoney(summary.recognizedRevenue),
              hint: `Gross pipeline ${formatMoney(summary.grossBookingValue)}`,
            },
            {
              label: "Live inventory",
              value: summary.activeProperties,
              hint: `${summary.inactiveProperties} inactive of ${summary.totalProperties}`,
            },
            {
              label: "Bookings in system",
              value: summary.totalBookings,
              hint: `${summary.confirmedBookings} confirmed and ${summary.pendingBookings} pending`,
            },
          ],
          panelTitle: "What to watch next",
          panelText:
            "Use this surface to spot drift early, then step into the detailed tables below when a number needs action.",
          panelPoints: [
            {
              label: "Account mix",
              value: `${summary.owners}/${summary.tenants}/${summary.serviceProviders}`,
              hint: "owners, tenants, and service providers",
            },
            {
              label: "Deposit follow-up",
              value: summary.depositPendingBookings,
              hint: "bookings still waiting on first payment",
            },
            {
              label: "Service queue",
              value: summary.pendingServiceRequests,
              hint: "requests waiting for provider movement",
            },
          ],
        };
      case "accounts":
        return {
          kicker: "Identity desk",
          title: "Rental account coverage",
          subtitle: "Manage owners, tenants, and service providers across the rental app.",
          metrics: [
            {
              label: "Active accounts",
              value: summary.activeAccounts,
              hint: `${summary.owners} owners currently onboarded`,
            },
            {
              label: "Tenants",
              value: summary.tenants,
              hint: "email-based renter accounts",
            },
            {
              label: "Providers",
              value: summary.serviceProviders,
              hint: "service accounts available for requests",
            },
          ],
          panelTitle: "Coverage snapshot",
          panelText:
            "Account health drives every other workflow, so this workspace stays centered on who can list, book, and fulfill requests.",
          panelPoints: [
            {
              label: "Listings per owner",
              value: summary.owners ? (summary.totalProperties / summary.owners).toFixed(1) : "0.0",
              hint: "average homes managed by each owner",
            },
            {
              label: "Bookings per tenant",
              value: summary.tenants ? (summary.totalBookings / summary.tenants).toFixed(1) : "0.0",
              hint: "average reservation volume per tenant",
            },
            {
              label: "Provider demand",
              value: summary.serviceProviders ? (summary.totalServiceRequests / summary.serviceProviders).toFixed(1) : "0.0",
              hint: "requests created for each service provider account",
            },
          ],
        };
      case "properties":
        return {
          kicker: "Listing control",
          title: "Property portfolio control",
          subtitle: "Monitor, activate, edit, and control home rental listings.",
          metrics: [
            {
              label: "Live homes",
              value: summary.activeProperties,
              hint: `${summary.totalProperties} total homes in the catalog`,
            },
            {
              label: "Inactive homes",
              value: summary.inactiveProperties,
              hint: "listings currently hidden from the market",
            },
            {
              label: "Gross booking value",
              value: formatMoney(summary.grossBookingValue),
              hint: "revenue influenced by live supply",
            },
          ],
          panelTitle: "Supply pressure",
          panelText:
            "Inventory supply changes the entire operating rhythm, so keep an eye on activation and owner momentum here.",
          panelPoints: [
            {
              label: "Owner coverage",
              value: summary.owners,
              hint: "owners supporting current supply",
            },
            {
              label: "Active bookings",
              value: summary.confirmedBookings,
              hint: "confirmed stays currently leaning on supply",
            },
            {
              label: "Availability risk",
              value: summary.inactiveProperties,
              hint: "homes that may need follow-up before demand peaks",
            },
          ],
        };
      case "bookings":
        return {
          kicker: "Revenue watch",
          title: "Bookings and payment flow",
          subtitle: "Track tenant bookings, checkout schedules, and booking payments.",
          metrics: [
            {
              label: "Total bookings",
              value: summary.totalBookings,
              hint: `${summary.completedBookings} completed stays`,
            },
            {
              label: "Confirmed stays",
              value: summary.confirmedBookings,
              hint: `${summary.pendingBookings} still pending approval`,
            },
            {
              label: "Collected deposits",
              value: formatMoney(summary.collectedDeposits),
              hint: `${summary.depositPendingBookings} deposits still outstanding`,
            },
          ],
          panelTitle: "Payment posture",
          panelText:
            "This workspace pairs reservation state with payment state so finance issues surface beside stay issues.",
          panelPoints: [
            {
              label: "Deposit paid",
              value: summary.depositPaidBookings,
              hint: "bookings that cleared their first payment",
            },
            {
              label: "Fully paid",
              value: summary.paidBookings,
              hint: "bookings ready to unlock full service flow",
            },
            {
              label: "Cancelled",
              value: summary.cancelledBookings,
              hint: "reservations lost from the active pipeline",
            },
          ],
        };
      case "requests":
        return {
          kicker: "Service desk",
          title: "Service request movement",
          subtitle: "Track service-provider assignment, acceptance, and completion.",
          metrics: [
            {
              label: "Total requests",
              value: summary.totalServiceRequests,
              hint: `${summary.completedServiceRequests} completed end-to-end`,
            },
            {
              label: "Pending requests",
              value: summary.pendingServiceRequests,
              hint: "requests waiting for provider action",
            },
            {
              label: "Accepted requests",
              value: summary.acceptedServiceRequests,
              hint: "work already picked up by providers",
            },
          ],
          panelTitle: "Fulfillment posture",
          panelText:
            "Requests become the hand-off point between paid bookings and provider operations, so lag here impacts customer confidence fast.",
          panelPoints: [
            {
              label: "Awaiting payment",
              value: summary.awaitingPaymentRequests,
              hint: "requests blocked until the booking settles",
            },
            {
              label: "Completed",
              value: summary.completedServiceRequests,
              hint: "requests fully delivered",
            },
            {
              label: "Cancelled",
              value: summary.cancelledServiceRequests,
              hint: "requests that dropped out of the queue",
            },
          ],
        };
      case "categories":
        return {
          kicker: "Catalog admin",
          title: "Service category structure",
          subtitle: "Manage maintenance service types, categories, and tags.",
          metrics: [
            {
              label: "Categories",
              value: categories.length,
              hint: "service types available to the platform",
            },
            {
              label: "Requests using catalog",
              value: summary.totalServiceRequests,
              hint: "workflow volume dependent on these options",
            },
            {
              label: "Completed services",
              value: summary.completedServiceRequests,
              hint: "delivered through the current catalog",
            },
          ],
          panelTitle: "Catalog quality",
          panelText:
            "A tight category list keeps requests clean for tenants, owners, and providers, especially when volume starts to climb.",
          panelPoints: [
            {
              label: "Pending requests",
              value: summary.pendingServiceRequests,
              hint: "volume that will rely on clear category routing",
            },
            {
              label: "Accepted requests",
              value: summary.acceptedServiceRequests,
              hint: "live work already tied to category choices",
            },
            {
              label: "Recent catalog size",
              value: categories.length,
              hint: "review inactive or overlapping categories regularly",
            },
          ],
        };
      case "operations":
        return {
          kicker: "Access control",
          title: "Team and access",
          subtitle: "Manage admin, customer, supplier, and driver accounts in one place.",
          metrics: [
            {
              label: "Admins",
              value: opsUsers.admins.length,
              hint: "people with dashboard access",
            },
            {
              label: "Suppliers",
              value: opsUsers.supplier.length,
              hint: "legacy supplier accounts in the system",
            },
            {
              label: "Drivers",
              value: opsUsers.driver.length,
              hint: "legacy driver accounts attached to suppliers",
            },
          ],
          panelTitle: "Access snapshot",
          panelText:
            "Keep operations roles clear and easy to audit across the older phone-based workflow.",
          panelPoints: [
            {
              label: "Customers",
              value: opsUsers.customer.length,
              hint: "legacy customer accounts stored here",
            },
            {
              label: "Admin share",
              value: `${opsUsers.admins.length}/${opsUsers.admins.length + opsUsers.customer.length + opsUsers.supplier.length + opsUsers.driver.length || 0}`,
              hint: "admins compared with the full operations user pool",
            },
            {
              label: "Supplier network",
              value: opsUsers.supplier.length + opsUsers.driver.length,
              hint: "supplier and driver accounts combined",
            },
          ],
        };
      default:
        return {
          kicker: "Admin console",
          title: "Rental admin workspace",
          subtitle: "Manage your rental listings, payments, and system operations.",
          metrics: [],
          panelTitle: "Workspace overview",
          panelText: "Choose a workspace from the rail to begin.",
          panelPoints: [],
        };
    }
  };

  const headerDetails = getHeaderDetails();
  const overviewStoryCards = [
    {
      kicker: "Revenue pulse",
      title: formatMoney(summary.recognizedRevenue),
      description:
        "Recognized revenue sits at the center of the operating story, with deposits and gross booking value showing how much is still moving through the pipeline.",
      notes: [
        `Gross booked ${formatMoney(summary.grossBookingValue)}`,
        `${summary.paidBookings} fully paid bookings`,
        `${summary.depositPendingBookings} deposits still due`,
      ],
      tone: "primary",
    },
    {
      kicker: "Inventory momentum",
      title: `${summary.activeProperties} live homes`,
      description:
        "Supply is healthy when active listings stay ahead of demand, while inactive properties become your first signal for portfolio follow-up.",
      notes: [
        `${summary.totalProperties} homes in total`,
        `${summary.inactiveProperties} inactive listings`,
        `${summary.confirmedBookings} confirmed stays leaning on supply`,
      ],
    },
    {
      kicker: "Service demand",
      title: `${summary.totalServiceRequests} requests in motion`,
      description:
        "Service flow keeps the post-booking experience stable, so pending and accepted requests deserve quick attention before they pile up.",
      notes: [
        `${summary.pendingServiceRequests} pending`,
        `${summary.acceptedServiceRequests} accepted`,
        `${summary.completedServiceRequests} completed`,
      ],
    },
  ];
  const overviewCommandCards = [
    {
      id: "accounts",
      eyebrow: "Accounts",
      value: summary.activeAccounts,
      title: "Identity pipeline",
      description: `${summary.owners} owners, ${summary.tenants} tenants, and ${summary.serviceProviders} service providers currently power the platform.`,
      actionLabel: "Open accounts",
    },
    {
      id: "properties",
      eyebrow: "Properties",
      value: summary.activeProperties,
      title: "Portfolio control",
      description: `${summary.totalProperties} homes are tracked here, with activation controls for every listing.`,
      actionLabel: "Open properties",
    },
    {
      id: "bookings",
      eyebrow: "Bookings",
      value: summary.totalBookings,
      title: "Reservation flow",
      description: `${summary.confirmedBookings} confirmed stays and ${summary.pendingBookings} pending reservations are currently in play.`,
      actionLabel: "Open bookings",
    },
    {
      id: "requests",
      eyebrow: "Requests",
      value: summary.totalServiceRequests,
      title: "Service queue",
      description: `${summary.pendingServiceRequests} pending requests and ${summary.acceptedServiceRequests} accepted jobs need ongoing follow-through.`,
      actionLabel: "Open requests",
    },
  ];

  return (
    <main className="dashboard-shell">
      <section className="content-area content-area-wide">
        <header className="surface top-rail">
          <div className="top-rail-main">
            <div className="brand-block top-rail-brand">
              <span className="brand-kicker">Home Rental</span>
              <h1>Admin center</h1>
              <p>One place to watch listings, payments, service flow, and team access.</p>
            </div>

            <nav className="nav-list top-rail-nav">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={`nav-button ${activeView === item.id ? "nav-button-active" : ""}`}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="top-rail-meta">
            <div className="sidebar-story top-rail-story">
              <span className="sidebar-story-label">Daily pulse</span>
              <strong>{formatMoney(summary.grossBookingValue)}</strong>
              <p>
                Gross booked value across {summary.totalBookings} reservations and{" "}
                {summary.activeProperties} live homes.
              </p>
            </div>

            <div className="sidebar-footer top-rail-account">
              <div className="user-profile-card">
                <span className="eyebrow">Signed in as</span>
                <h2>{session?.name || "Admin"}</h2>
                <p>{session?.email || session?.phone || "Authenticated administrator"}</p>
              </div>
              <div className="top-rail-actions">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleRefresh}
                  disabled={workingKey === "refresh"}
                >
                  {workingKey === "refresh" ? "Refreshing..." : "Refresh data"}
                </button>
                <button
                  className="primary-button subtle"
                  type="button"
                  onClick={handleLogout}
                  disabled={workingKey === "logout"}
                >
                  {workingKey === "logout" ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        </header>

        <header className="surface topbar topbar-hero">
          <div className="topbar-grid">
            <div className="topbar-copy">
              <span className="eyebrow">{headerDetails.kicker}</span>
              <div className="topbar-copy-header">
                <div>
                  <h2>{headerDetails.title}</h2>
                  <p>{headerDetails.subtitle}</p>
                </div>
              </div>

              <div className="hero-metrics-grid">
                {headerDetails.metrics.map((metric) => (
                  <HeroMetric
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    hint={metric.hint}
                  />
                ))}
              </div>
            </div>

            <aside className="hero-panel">
              <span className="hero-panel-label">Control room</span>
              <strong>{headerDetails.panelTitle}</strong>
              <p>{headerDetails.panelText}</p>
              <div className="hero-panel-list">
                {headerDetails.panelPoints.map((point) => (
                  <div className="hero-panel-item" key={point.label}>
                    <span>{point.label}</span>
                    <strong>{point.value}</strong>
                    <small>{point.hint}</small>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </header>

        {notice ? (
          <div className={`notice notice-${notice.type || "info"}`}>
            {notice.message}
          </div>
        ) : null}

        {activeView === "overview" ? (
          <section className="view-stack">
            <SectionHeader
              kicker="Platform pulse"
              title="Daily operating picture"
              description="A sectional view of revenue, live inventory, booking health, and service follow-through so the team can move from signal to action fast."
            />

            <div className="overview-story-grid">
              {overviewStoryCards.map((card) => (
                <article
                  key={card.kicker}
                  className={`surface story-card ${card.tone === "primary" ? "story-card-primary" : ""}`.trim()}
                >
                  <span className="section-kicker">{card.kicker}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="story-note-list">
                    {card.notes.map((note) => (
                      <span key={note}>{note}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="stats-grid">
              <StatCard
                label="Active rental accounts"
                value={summary.activeAccounts}
                hint={`${summary.owners} owners, ${summary.tenants} tenants, ${summary.serviceProviders} service providers`}
              />
              <StatCard
                label="Live properties"
                value={summary.activeProperties}
                hint={`${summary.inactiveProperties} inactive of ${summary.totalProperties} total`}
              />
              <StatCard
                label="Bookings"
                value={summary.totalBookings}
                hint={`${summary.confirmedBookings} confirmed, ${summary.pendingBookings} pending`}
              />
              <StatCard
                label="Service requests"
                value={summary.totalServiceRequests}
                hint={`${summary.pendingServiceRequests} pending, ${summary.acceptedServiceRequests} accepted`}
              />
              <StatCard
                label="Recognized revenue"
                value={formatMoney(summary.recognizedRevenue)}
                hint={`Gross booked value ${formatMoney(summary.grossBookingValue)}`}
              />
              <StatCard
                label="Collected deposits"
                value={formatMoney(summary.collectedDeposits)}
                hint={`${summary.depositPendingBookings} bookings still waiting for deposit`}
              />
            </div>

            <SectionHeader
              kicker="Workspaces"
              title="Jump into the next area"
              description="Each lane carries its own operational count so you can open the right workspace without scanning every table first."
            />

            <div className="overview-command-grid">
              {overviewCommandCards.map((card) => (
                <CommandCard
                  key={card.id}
                  eyebrow={card.eyebrow}
                  title={card.title}
                  value={card.value}
                  description={card.description}
                  actionLabel={card.actionLabel}
                  onAction={() => setActiveView(card.id)}
                />
              ))}
            </div>

            <SectionHeader
              kicker="Recent activity"
              title="Newest movements across the platform"
              description="Fresh listings, bookings, and service requests surface here first before you drill into the detailed tables."
            />

            <div className="overview-activity-grid">
              <ActivityListCard
                kicker="Latest listings"
                title="Property arrivals"
                description="The newest properties entering the system."
                items={(overview.recentProperties || []).slice(0, 4)}
                emptyTitle="No properties yet"
                emptyDescription="Properties will appear here as owners add listings."
                actionLabel="View properties"
                onAction={() => setActiveView("properties")}
                renderItem={(row) => (
                  <>
                    <div className="stacked-cell">
                      <strong>{row.title}</strong>
                      <span>{row.propertyCode} · {row.ownerName}</span>
                    </div>
                    <div className="activity-item-meta">
                      <span>{formatMoney(row.monthlyRent, true)}</span>
                      <StatusBadge tone={getTone(row.isActive ? "active" : "inactive")}>
                        {row.isActive ? "Active" : "Inactive"}
                      </StatusBadge>
                    </div>
                  </>
                )}
              />
              <ActivityListCard
                kicker="Latest reservations"
                title="Booking movement"
                description="Fresh reservations and their payment state."
                items={(overview.recentBookings || []).slice(0, 4)}
                emptyTitle="No bookings yet"
                emptyDescription="New bookings will appear here once tenants begin reserving properties."
                actionLabel="View bookings"
                onAction={() => setActiveView("bookings")}
                renderItem={(row) => (
                  <>
                    <div className="stacked-cell">
                      <strong>{row.bookingCode}</strong>
                      <span>{row.propertyTitle} · {row.tenantName}</span>
                    </div>
                    <div className="activity-item-meta stacked-cell">
                      <StatusBadge tone={getTone(row.bookingStatus)}>
                        {row.bookingStatus}
                      </StatusBadge>
                      <span>{row.paymentStatus}</span>
                    </div>
                  </>
                )}
              />
              <ActivityListCard
                kicker="Latest services"
                title="Request follow-up"
                description="Service demand created by recent bookings."
                items={(overview.recentServiceRequests || []).slice(0, 4)}
                emptyTitle="No service requests yet"
                emptyDescription="Service-provider requests will appear here after paid bookings create service demand."
                actionLabel="View requests"
                onAction={() => setActiveView("requests")}
                renderItem={(row) => (
                  <>
                    <div className="stacked-cell">
                      <strong>{row.serviceCategoryName}</strong>
                      <span>{row.propertyTitle} · {row.tenantName}</span>
                    </div>
                    <div className="activity-item-meta stacked-cell">
                      <StatusBadge tone={getTone(row.requestStatus)}>
                        {row.requestStatus}
                      </StatusBadge>
                      <span>{row.serviceProviderName || "Awaiting provider"}</span>
                    </div>
                  </>
                )}
              />
            </div>
          </section>
        ) : null}

        {activeView === "accounts" ? (
          <section className="view-stack">
            <SectionHeader
              title="Home-rental accounts"
              description="Search the dedicated home-rental identities created through email-based signup."
            />
            <DataTable
              columns={accountColumns}
              rows={accounts}
              emptyTitle="No rental accounts matched your filters"
              emptyDescription="Try another role filter or a broader search term."
              filterBar={
                <form
                  className="ops-filter-bar"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try { await loadAccounts(accountFilters); }
                    catch (err) { setNotice({ type: "error", message: err.message }); }
                  }}
                >
                  <select value={accountFilters.role} onChange={(e) => setAccountFilters((c) => ({ ...c, role: e.target.value }))}>
                    {ACCOUNT_ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input placeholder="Search name, email, or phone" value={accountFilters.search} onChange={(e) => setAccountFilters((c) => ({ ...c, search: e.target.value }))} />
                  <button className="ghost-button" type="submit">Apply</button>
                </form>
              }
            />
          </section>
        ) : null}

        {activeView === "properties" ? (
          <section className="view-stack">
            <SectionHeader
              title="Property administration"
              description="Review listings, monitor owner activity, and toggle visibility without touching the mobile app."
            />
            <DataTable
              columns={propertyColumns}
              rows={properties}
              emptyTitle="No properties matched your filters"
              emptyDescription="Try clearing the status filter or search query."
              filterBar={
                <form
                  className="ops-filter-bar"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try { await loadProperties(propertyFilters); }
                    catch (err) { setNotice({ type: "error", message: err.message }); }
                  }}
                >
                  <select value={propertyFilters.status} onChange={(e) => setPropertyFilters((c) => ({ ...c, status: e.target.value }))}>
                    {PROPERTY_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input placeholder="Search title, code, owner, location" value={propertyFilters.search} onChange={(e) => setPropertyFilters((c) => ({ ...c, search: e.target.value }))} />
                  <button className="ghost-button" type="submit">Apply</button>
                </form>
              }
            />
          </section>
        ) : null}

        {activeView === "bookings" ? (
          <section className="view-stack">
            <SectionHeader
              title="Booking visibility"
              description="Track reservation states, deposit behavior, and how much service demand each booking creates."
            />
            <DataTable
              columns={bookingColumns}
              rows={bookings}
              emptyTitle="No bookings matched your filters"
              emptyDescription="Adjust the booking or payment state filters to widen the result set."
              filterBar={
                <form
                  className="ops-filter-bar"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try { await loadBookings(bookingFilters); }
                    catch (err) { setNotice({ type: "error", message: err.message }); }
                  }}
                >
                  <select value={bookingFilters.bookingStatus} onChange={(e) => setBookingFilters((c) => ({ ...c, bookingStatus: e.target.value }))}>
                    {BOOKING_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <select value={bookingFilters.paymentStatus} onChange={(e) => setBookingFilters((c) => ({ ...c, paymentStatus: e.target.value }))}>
                    {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input placeholder="Search booking, property, owner, tenant" value={bookingFilters.search} onChange={(e) => setBookingFilters((c) => ({ ...c, search: e.target.value }))} />
                  <button className="ghost-button" type="submit">Apply</button>
                </form>
              }
            />
          </section>
        ) : null}

        {activeView === "requests" ? (
          <section className="view-stack">
            <SectionHeader
              title="Service request flow"
              description="Follow provider matching after a booking is fully paid, including assignment activity and response counts."
            />
            <DataTable
              columns={serviceRequestColumns}
              rows={serviceRequests}
              emptyTitle="No service requests matched your filters"
              emptyDescription="Try switching the request status filter or searching a different booking."
              filterBar={
                <form
                  className="ops-filter-bar"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try { await loadServiceRequests(requestFilters); }
                    catch (err) { setNotice({ type: "error", message: err.message }); }
                  }}
                >
                  <select value={requestFilters.status} onChange={(e) => setRequestFilters((c) => ({ ...c, status: e.target.value }))}>
                    {REQUEST_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input placeholder="Search booking, category, owner, service provider" value={requestFilters.search} onChange={(e) => setRequestFilters((c) => ({ ...c, search: e.target.value }))} />
                  <button className="ghost-button" type="submit">Apply</button>
                </form>
              }
            />
          </section>
        ) : null}

        {activeView === "categories" ? (
          <section className="view-stack">
            <SectionHeader
              title="Service categories"
              description="Maintain the list that owners and tenants use when they request add-on services."
            />

            <div className="split-layout">
              <article className="surface">
                <div className="surface-title-row">
                  <div>
                    <h3>{categoryForm.id ? "Edit category" : "Create category"}</h3>
                    <p>Keep the service catalog clean and easy to choose from.</p>
                  </div>
                </div>

                <form className="form-stack" onSubmit={handleCategorySubmit}>
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
              </article>

              <DataTable
                columns={categoryColumns}
                rows={categories}
                emptyTitle="No categories available"
                emptyDescription="Create your first service category to support service-provider workflows."
              />
            </div>
          </section>
        ) : null}

        {activeView === "operations" ? (
          <section className="view-stack">
            <SectionHeader
              title="Operations users"
              description="Manage the legacy phone-based accounts used for admin and operational roles."
            />

            <div className="split-layout operations-layout">
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
                    {showAdminForm ? "▾" : "▸"}
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
                    {showUserForm ? "▾" : "▸"}
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
                      placeholder="Search name, email or phone…"
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
                                    ? "Deleting…"
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
