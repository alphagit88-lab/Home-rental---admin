"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    description: "KPIs, revenue, and latest activity",
  },
  {
    id: "accounts",
    label: "Rental Accounts",
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
  {
    id: "operations",
    label: "User Management",
    description: "Admins, customers, suppliers, drivers",
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



  const headerDetails = getHeaderDetails();

  return (
    <main className="dashboard-shell">
      <aside className="sidebar surface">
        <div className="sidebar-top">
          <div className="brand-block">
            <span className="brand-kicker">Home Rental</span>
            <h1>Admin center</h1>
            <p>One place to watch listings, payments, service flow, and team access.</p>
          </div>

          <nav className="nav-list">
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

        <div className="sidebar-footer">
          <div className="user-profile-card">
            <span className="eyebrow">Signed in as</span>
            <h2>{session?.name || "Admin"}</h2>
            <p>{session?.email || session?.phone || "Authenticated administrator"}</p>
          </div>
          <button
            className="primary-button subtle"
            type="button"
            onClick={handleLogout}
            disabled={workingKey === "logout"}
          >
            {workingKey === "logout" ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      <section className="content-area">
        <header className="surface topbar">
          <div>
            <h2>{headerDetails.title}</h2>
            <p>{headerDetails.subtitle}</p>
          </div>

          <div className="topbar-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={handleRefresh}
              disabled={workingKey === "refresh"}
            >
              {workingKey === "refresh" ? "Refreshing..." : "Refresh data"}
            </button>
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
              title="Platform overview"
              description="Real-time summary of the home-rental pipeline, including account mix, listing volume, booking health, and service activity."
            />

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

            <div className="overview-grid">
              <DataTable
                className="recent-properties-table"
                columns={overviewColumns}
                rows={overview.recentProperties || []}
                emptyTitle="No properties yet"
                emptyDescription="Properties will appear here as owners add listings."
              />
              <DataTable
                className="recent-bookings-table"
                columns={recentBookingColumns}
                rows={overview.recentBookings || []}
                emptyTitle="No bookings yet"
                emptyDescription="New bookings will appear here once tenants begin reserving properties."
              />
              <DataTable
                className="recent-requests-table"
                columns={recentRequestColumns}
                rows={overview.recentServiceRequests || []}
                emptyTitle="No service requests yet"
                emptyDescription="Service-provider requests will appear here after paid bookings create service demand."
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
