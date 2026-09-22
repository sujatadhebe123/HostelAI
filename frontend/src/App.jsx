import { useState } from "react";
import {
  Building2,
  Sparkles,
  Send,
  ShieldCheck,
  Clock3,
  BrainCircuit,
  LayoutDashboard,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ClipboardList,
  CircleAlert,
  Search,
  SlidersHorizontal,
  User,
  DoorOpen,
  Zap,
  TrendingUp,
  ChevronRight,
  Shield,
  BarChart3,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [view, setView] = useState("student");

  const [form, setForm] = useState({
    name: "",
    room: "",
    complaint: "",
  });

  const [result, setResult] = useState(null);
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // SUBMIT COMPLAINT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.room.trim() ||
      !form.complaint.trim()
    ) {
      setError("Please complete all fields before submitting.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Complaint submission failed.");
      }

      const data = await response.json();

      setResult(data);

      setForm({
        name: "",
        room: "",
        complaint: "",
      });
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to HostelAI. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH COMPLAINTS
  // =====================================================

  const fetchComplaints = async () => {
    try {
      setDashboardLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/complaints`);

      if (!response.ok) {
        throw new Error("Unable to fetch complaints.");
      }

      const data = await response.json();

      setComplaints(data);
    } catch (err) {
      console.error(err);

      setError("Unable to load complaints from the server.");
    } finally {
      setDashboardLoading(false);
    }
  };

  // =====================================================
  // OPEN DASHBOARD
  // =====================================================

  const openDashboard = () => {
    setView("admin");
    setError("");
    fetchComplaints();
  };

  // =====================================================
  // RESOLVE COMPLAINT
  // =====================================================

  const resolveComplaint = async (id) => {
    try {
      setResolvingId(id);
      setError("");

      const response = await fetch(
        `${API_URL}/complaints/${id}/resolve`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update complaint.");
      }

      await fetchComplaints();
    } catch (err) {
      console.error(err);

      setError("Unable to update complaint status.");
    } finally {
      setResolvingId(null);
    }
  };

  // =====================================================
  // PRIORITY SORTING + FILTERING
  // =====================================================

  const priorityOrder = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const filteredComplaints = [...complaints]
    .filter((item) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        item.name?.toLowerCase().includes(query) ||
        item.room?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.complaint?.toLowerCase().includes(query);

      const matchesPriority =
        priorityFilter === "All" ||
        item.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      // Pending first
      if (
        a.status === "Pending" &&
        b.status === "Resolved"
      ) {
        return -1;
      }

      if (
        a.status === "Resolved" &&
        b.status === "Pending"
      ) {
        return 1;
      }

      // Critical -> High -> Medium -> Low
      return (
        (priorityOrder[b.priority] || 0) -
        (priorityOrder[a.priority] || 0)
      );
    });

  // =====================================================
  // STUDENT PORTAL
  // =====================================================

  if (view === "student") {
    return (
      <div className="min-h-screen overflow-hidden bg-slate-950 text-white">

        {/* BACKGROUND EFFECTS */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

          <div className="absolute right-[-150px] top-[-100px] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-3xl" />

          <div className="absolute bottom-[-200px] left-1/2 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-3xl" />
        </div>

        {/* NAVBAR */}

        <nav className="relative z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

            <Logo dark />

            <button
              onClick={openDashboard}
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-white"
            >
              <LayoutDashboard size={17} />

              Admin Dashboard

              <ChevronRight
                size={15}
                className="transition group-hover:translate-x-1"
              />
            </button>

          </div>
        </nav>

        {/* MAIN */}

        <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-14">

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">

            {/* LEFT SIDE */}

            <section>

              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300">
                <Sparkles size={15} />
                Intelligent Hostel Management
              </div>

              <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">

                Hostel problems,

                <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  handled smarter.
                </span>

              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                Report hostel issues in seconds. HostelAI analyzes
                complaints, identifies urgency and helps administration
                focus on the problems that need attention first.
              </p>

              {/* MINI BADGES */}

              <div className="mt-9 flex flex-wrap gap-3">

                <MiniBadge
                  icon={<BrainCircuit size={16} />}
                  text="Smart Classification"
                />

                <MiniBadge
                  icon={<Zap size={16} />}
                  text="Instant Priority"
                />

                <MiniBadge
                  icon={<Shield size={16} />}
                  text="Safety Focused"
                />

              </div>

              {/* FEATURES */}

              <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">

                <DarkFeature
                  icon={<BrainCircuit size={20} />}
                  title="Analyze"
                  text="Understand submitted complaints"
                />

                <DarkFeature
                  icon={<AlertTriangle size={20} />}
                  title="Prioritize"
                  text="Surface urgent issues first"
                />

                <DarkFeature
                  icon={<CheckCircle2 size={20} />}
                  title="Resolve"
                  text="Track complaints to completion"
                />

              </div>

            </section>

            {/* FORM */}

            <section className="relative">

              <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-cyan-500/30 blur-xl" />

              <div className="relative rounded-[28px] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl md:p-8">

                <div className="mb-7 flex items-start justify-between">

                  <div>
                    <p className="text-sm font-semibold text-indigo-300">
                      STUDENT PORTAL
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      Report an Issue
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Describe your hostel problem below.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-indigo-500/15 p-3 text-indigo-300">
                    <Sparkles size={23} />
                  </div>

                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  <div className="grid gap-4 sm:grid-cols-2">

                    <DarkInput
                      label="Student Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />

                    <DarkInput
                      label="Room Number"
                      name="room"
                      value={form.room}
                      onChange={handleChange}
                      placeholder="e.g. 204"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Describe your complaint
                    </label>

                    <textarea
                      name="complaint"
                      value={form.complaint}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Example: There are sparks coming from the switchboard..."
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-indigo-500/10"
                    />

                  </div>

                  {error && (
                    <div className="flex gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">

                      <CircleAlert
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      {error}

                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:-translate-y-0.5 hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {loading ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />

                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={19} />

                        Analyze & Submit

                        <Send
                          size={17}
                          className="transition group-hover:translate-x-1"
                        />
                      </>
                    )}

                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <ShieldCheck size={14} />
                    Smart analysis before administration review
                  </div>

                </form>

              </div>

            </section>

          </div>

          {/* ANALYSIS RESULT */}

          {result && (
            <AnalysisResult result={result} />
          )}

        </main>

      </div>
    );
  }

  // =====================================================
  // DASHBOARD ANALYTICS
  // =====================================================

  const total = complaints.length;

  const pending = complaints.filter(
    (item) => item.status === "Pending"
  ).length;

  const resolved = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  const critical = complaints.filter(
    (item) =>
      item.priority === "Critical" &&
      item.status !== "Resolved"
  ).length;

  const resolutionRate =
    total === 0
      ? 0
      : Math.round((resolved / total) * 100);

  const categories = [
    "Electrical",
    "Plumbing",
    "Internet",
    "Cleanliness",
    "Food",
    "Security",
    "Maintenance",
    "Medical",
    "General",
  ];

  const categoryStats = categories
    .map((category) => ({
      category,
      count: complaints.filter(
        (item) => item.category === category
      ).length,
    }))
    .filter((item) => item.count > 0);

  const priorityStats = [
    "Critical",
    "High",
    "Medium",
    "Low",
  ].map((priority) => ({
    priority,
    count: complaints.filter(
      (item) => item.priority === priority
    ).length,
  }));

  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">

      {/* NAVBAR */}

      <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Logo />

          <button
            onClick={() => {
              setView("student");
              setError("");
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <ArrowLeft size={17} />
            Student Portal
          </button>

        </div>

      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* DASHBOARD HEADER */}

        <section className="relative overflow-hidden rounded-[28px] bg-slate-950 px-7 py-8 text-white shadow-xl md:px-10">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />

          <div className="absolute bottom-[-150px] left-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>

              <div className="flex items-center gap-2 text-indigo-300">
                <LayoutDashboard size={18} />

                <span className="text-xs font-bold tracking-[0.18em]">
                  ADMIN CONTROL CENTER
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                Complaint Dashboard
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Monitor hostel issues, identify urgent complaints,
                analyze trends and track resolutions from one dashboard.
              </p>

            </div>

            <button
              onClick={fetchComplaints}
              className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/15 md:self-auto"
            >

              <RefreshCw
                size={17}
                className={
                  dashboardLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh Data

            </button>

          </div>

        </section>

        {/* TOP STATS */}

        <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<ClipboardList />}
            label="Total Complaints"
            value={total}
            subtitle="All submitted issues"
            variant="indigo"
          />

          <StatCard
            icon={<Clock3 />}
            label="Pending"
            value={pending}
            subtitle="Need attention"
            variant="amber"
          />

          <StatCard
            icon={<AlertTriangle />}
            label="Critical"
            value={critical}
            subtitle="Urgent active issues"
            variant="red"
          />

          <StatCard
            icon={<CheckCircle2 />}
            label="Resolved"
            value={resolved}
            subtitle="Successfully closed"
            variant="green"
          />

        </section>

        {/* ANALYTICS */}

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

          {/* CATEGORY ANALYTICS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold">
                  Complaint Analytics
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Distribution of hostel issues by category
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <BarChart3 size={20} />
              </div>

            </div>

            <div className="mt-7 space-y-5">

              {categoryStats.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No complaint data available yet.
                </p>
              ) : (
                categoryStats.map((item) => {

                  const percentage =
                    total === 0
                      ? 0
                      : Math.round(
                          (item.count / total) * 100
                        );

                  return (
                    <div key={item.category}>

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-sm font-semibold text-slate-700">
                          {item.category}
                        </span>

                        <span className="text-xs font-bold text-slate-500">
                          {item.count} · {percentage}%
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })
              )}

            </div>

          </div>

          {/* RESOLUTION OVERVIEW */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold">
                  Resolution Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current complaint performance
                </p>

              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <TrendingUp size={20} />
              </div>

            </div>

            {/* CIRCLE */}

            <div className="mt-8 flex justify-center">

              <div
                className="relative flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(
                    #4f46e5 ${resolutionRate}%,
                    #eef2ff ${resolutionRate}% 100%
                  )`,
                }}
              >

                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">

                  <span className="text-3xl font-black text-slate-900">
                    {resolutionRate}%
                  </span>

                  <span className="mt-1 text-xs font-medium text-slate-400">
                    Resolution Rate
                  </span>

                </div>

              </div>

            </div>

            {/* PRIORITY COUNTS */}

            <div className="mt-8 grid grid-cols-2 gap-3">

              {priorityStats.map((item) => (
                <PriorityStat
                  key={item.priority}
                  priority={item.priority}
                  count={item.count}
                />
              ))}

            </div>

          </div>

        </section>

        {/* FILTER BAR */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

            {/* SEARCH */}

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search student, room, category or complaint..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* PRIORITY FILTER */}

              <div className="flex items-center gap-2">

                <SlidersHorizontal
                  size={17}
                  className="text-slate-400"
                />

                <select
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(e.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400"
                >

                  <option value="All">
                    All Priorities
                  </option>

                  <option value="Critical">
                    Critical
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>

                </select>

              </div>

              {/* STATUS FILTER */}

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400"
              >

                <option value="All">
                  All Status
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Resolved">
                  Resolved
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <CircleAlert size={18} />

            {error}

          </div>
        )}

        {/* COMPLAINT QUEUE */}

        <section className="mt-8">

          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

            <div>

              <h2 className="text-xl font-bold">
                Complaint Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pending complaints are automatically ordered
                by urgency.
              </p>

            </div>

            <p className="text-sm font-medium text-slate-500">

              Showing{" "}

              <span className="font-bold text-slate-900">
                {filteredComplaints.length}
              </span>{" "}

              complaints

            </p>

          </div>

          {dashboardLoading ? (
            <LoadingState />
          ) : filteredComplaints.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-5">

              {filteredComplaints.map((item) => (

                <ComplaintCard
                  key={item.id}
                  complaint={item}
                  resolving={
                    resolvingId === item.id
                  }
                  onResolve={() =>
                    resolveComplaint(item.id)
                  }
                />

              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

// =====================================================
// LOGO
// =====================================================

function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/20">
        <Building2 size={21} />
      </div>

      <div>

        <h1
          className={`text-xl font-black tracking-tight ${
            dark
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          Hostel
          <span className="text-indigo-500">
            AI
          </span>
        </h1>

        <p
          className={`text-[11px] ${
            dark
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        >
          Smart Complaint Management
        </p>

      </div>

    </div>
  );
}

// =====================================================
// INPUT
// =====================================================

function DarkInput({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-indigo-500/10"
      />

    </div>
  );
}

// =====================================================
// MINI BADGE
// =====================================================

function MiniBadge({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 backdrop-blur">

      <span className="text-indigo-400">
        {icon}
      </span>

      {text}

    </div>
  );
}

// =====================================================
// FEATURE
// =====================================================

function DarkFeature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.07]">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        {icon}
      </div>

      <h3 className="mt-4 font-bold">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

// =====================================================
// ANALYSIS RESULT
// =====================================================

function AnalysisResult({ result }) {
  return (
    <section className="mt-14 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-xl">

      <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-400">
            <CheckCircle2 size={21} />
          </div>

          <div>

            <h3 className="font-bold text-white">
              Complaint Submitted Successfully
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Analysis completed and sent to administration.
            </p>

          </div>

        </div>

        <PriorityBadge
          priority={result.priority}
        />

      </div>

      <div className="grid gap-px bg-white/10 md:grid-cols-2">

        <DarkResultBox
          title="Category"
          value={result.category}
        />

        <DarkResultBox
          title="Analysis Summary"
          value={result.summary}
        />

        <DarkResultBox
          title="Recommended Action"
          value={result.suggested_action}
        />

        <DarkResultBox
          title="Why this priority?"
          value={result.reason}
        />

      </div>

      {result.is_duplicate && (
        <div className="border-t border-amber-400/20 bg-amber-500/10 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-300">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-bold text-amber-300">Similar Complaint Already Reported</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {result.similarity_reason ||
                  "HostelAI detected a similar pending complaint."}
              </p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

function DarkResultBox({ title, value }) {
  return (
    <div className="bg-slate-950/60 p-6">

      <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
        {title}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-300">
        {value}
      </p>

    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  label,
  value,
  subtitle,
  variant,
}) {
  const variants = {
    indigo:
      "bg-indigo-50 text-indigo-600",
    amber:
      "bg-amber-50 text-amber-600",
    red:
      "bg-red-50 text-red-600",
    green:
      "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {subtitle}
          </p>

        </div>

        <div
          className={`rounded-xl p-3 ${
            variants[variant]
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

// =====================================================
// PRIORITY ANALYTICS
// =====================================================

function PriorityStat({ priority, count }) {
  const styles = {
    Critical: {
      box: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
    },

    High: {
      box: "bg-orange-50",
      text: "text-orange-700",
      dot: "bg-orange-500",
    },

    Medium: {
      box: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-400",
    },

    Low: {
      box: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
  };

  const style =
    styles[priority] || {
      box: "bg-slate-50",
      text: "text-slate-700",
      dot: "bg-slate-400",
    };

  return (
    <div className={`rounded-xl p-3 ${style.box}`}>

      <div className="flex items-center gap-2">

        <span
          className={`h-2 w-2 rounded-full ${style.dot}`}
        />

        <p
          className={`text-xs font-semibold ${style.text}`}
        >
          {priority}
        </p>

      </div>

      <p
        className={`mt-2 text-xl font-black ${style.text}`}
      >
        {count}
      </p>

    </div>
  );
}

// =====================================================
// COMPLAINT CARD
// =====================================================

function ComplaintCard({
  complaint,
  onResolve,
  resolving,
}) {
  const resolved =
    complaint.status === "Resolved";

  const borderStyles = {
    Critical: "border-l-red-500",
    High: "border-l-orange-500",
    Medium: "border-l-amber-400",
    Low: "border-l-emerald-500",
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white shadow-sm transition hover:shadow-lg ${
        borderStyles[complaint.priority] ||
        "border-l-slate-400"
      }`}
    >

      <div className="p-6">

        <div className="flex flex-col justify-between gap-5 lg:flex-row">

          <div className="min-w-0 flex-1">

            {/* BADGES */}

            <div className="flex flex-wrap gap-2">

              <PriorityBadge
                priority={complaint.priority}
              />

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {complaint.category}
              </span>

              <StatusBadge
                status={complaint.status}
              />

              {complaint.is_duplicate && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                  <AlertTriangle size={13} />
                  Similar Issue
                </span>
              )}

            </div>

            {/* STUDENT */}

            <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500">

              <div className="flex items-center gap-2">
                <User size={15} />
                {complaint.name}
              </div>

              <div className="flex items-center gap-2">
                <DoorOpen size={15} />
                Room {complaint.room}
              </div>

            </div>

            {/* COMPLAINT */}

            <div className="mt-5">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Complaint
              </p>

              <p className="mt-2 text-base font-medium leading-7 text-slate-800">
                {complaint.complaint}
              </p>

            </div>

            {/* ANALYSIS */}

            <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">

              <div>

                <div className="flex items-center gap-2">

                  <BrainCircuit
                    size={16}
                    className="text-indigo-600"
                  />

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Analysis
                  </p>

                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {complaint.summary}
                </p>

              </div>

              <div>

                <div className="flex items-center gap-2">

                  <TrendingUp
                    size={16}
                    className="text-indigo-600"
                  />

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recommended Action
                  </p>

                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {complaint.suggested_action}
                </p>

              </div>

            </div>

            {complaint.is_duplicate && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-800">Similar Issue Detected</p>
                    <p className="mt-1 text-sm leading-6 text-amber-700">
                      {complaint.similarity_reason ||
                        "This complaint appears related to another pending complaint."}
                    </p>
                    {complaint.duplicate_of && (
                      <p className="mt-2 text-xs font-medium text-amber-600">
                        Related complaint ID: {complaint.duplicate_of}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* REASON */}

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-100 px-4 py-3 text-sm text-slate-500">

              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-amber-500"
              />

              <p>

                <strong className="text-slate-700">
                  Priority reasoning:
                </strong>{" "}

                {complaint.reason}

              </p>

            </div>

          </div>

          {/* RESOLVE */}

          <div className="lg:w-44">

            {!resolved ? (
              <button
                onClick={onResolve}
                disabled={resolving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:opacity-60"
              >

                {resolving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCircle2 size={17} />
                )}

                {resolving
                  ? "Updating..."
                  : "Mark Resolved"}

              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">

                <CheckCircle2 size={17} />

                Resolved

              </div>
            )}

          </div>

        </div>

      </div>

    </article>
  );
}

// =====================================================
// PRIORITY BADGE
// =====================================================

function PriorityBadge({ priority }) {
  const styles = {
    Critical:
      "bg-red-100 text-red-700 ring-red-200",

    High:
      "bg-orange-100 text-orange-700 ring-orange-200",

    Medium:
      "bg-amber-100 text-amber-700 ring-amber-200",

    Low:
      "bg-emerald-100 text-emerald-700 ring-emerald-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        styles[priority] ||
        "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >

      {priority === "Critical" && (
        <AlertTriangle size={13} />
      )}

      {priority}

    </span>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }) {
  const resolved =
    status === "Resolved";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        resolved
          ? "bg-emerald-50 text-emerald-700"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {status}
    </span>
  );
}

// =====================================================
// LOADING STATE
// =====================================================

function LoadingState() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">

      <div className="text-center">

        <Loader2
          size={32}
          className="mx-auto animate-spin text-indigo-600"
        />

        <p className="mt-3 text-sm font-medium text-slate-500">
          Loading complaints...
        </p>

      </div>

    </div>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Search size={25} />
      </div>

      <h3 className="mt-4 font-bold">
        No complaints found
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Try changing your search or filters.
      </p>

    </div>
  );
}

export default App;