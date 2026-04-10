import React, { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import { API_BASE } from "../../../config/constants";
import { useAuth } from "../../../contexts/AuthContext";

const emptyForm = {
  route: "",
  bus: "",
  driver: "",
  date: "",
  startTime: "",
  endTime: ""
};

const formatScheduleDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getInputDateValue = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const ScheduleManagementPanel = () => {
  const { token } = useAuth();

  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  }), [token]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const fetchData = async () => {
    if (!token) return;

    try {
      setError("");
      const [routesRes, busesRes, usersRes, schedulesRes] = await Promise.all([
        fetch(`${API_BASE}/routes?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/buses?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/users?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/schedules?limit=100&sort=date&order=asc`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const routesData = await routesRes.json();
      const busesData = await busesRes.json();
      const usersData = await usersRes.json();
      const schedulesData = await schedulesRes.json();

      setRoutes(routesData?.data?.routes || []);
      setBuses(busesData?.data?.buses || []);
      setDrivers((usersData?.data?.users || []).filter((user) => user.role === "driver"));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const orderedSchedules = (schedulesData?.data?.schedules || [])
        .filter((schedule) => {
          if (!schedule.date) return true;
          const scheduleDate = new Date(schedule.date);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate >= today;
        })
        .sort((a, b) => {
          const aDate = new Date(`${getInputDateValue(a.date)}T${a.startTime || "00:00"}`);
          const bDate = new Date(`${getInputDateValue(b.date)}T${b.startTime || "00:00"}`);
          return aDate - bDate;
        });

      setSchedules(orderedSchedules);
    } catch (err) {
      console.error(err);
      setError("Failed to load schedules");
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async () => {
    if (!form.route || !form.bus || !form.driver || !form.date || !form.startTime || !form.endTime) {
      setError("Please fill all schedule fields");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const url = editingId ? `${API_BASE}/schedules/${editingId}` : `${API_BASE}/schedules`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${editingId ? "update" : "create"} schedule`);
      }

      setMessage(editingId ? "Schedule updated successfully" : "Schedule created successfully");
      resetForm();
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Schedule action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule._id);
    setForm({
      route: schedule.route?._id || "",
      bus: schedule.bus?._id || "",
      driver: schedule.driver?._id || "",
      date: getInputDateValue(schedule.date),
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || ""
    });
    setMessage("");
    setError("");
  };

  const handleDelete = async (scheduleId) => {
    const confirmed = window.confirm("Delete this schedule?");
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/schedules/${scheduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete schedule");
      }

      if (editingId === scheduleId) {
        resetForm();
      }

      setMessage("Schedule deleted successfully");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold">Schedule Management</h2>
        {editingId && (
          <Button variant="ghost" onClick={resetForm}>
            Cancel Edit
          </Button>
        )}
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          className="p-2 rounded bg-muted"
          value={form.route}
          onChange={(e) => setForm({ ...form, route: e.target.value })}
        >
          <option value="">Select Route</option>
          {routes.map((route) => (
            <option key={route._id} value={route._id}>
              {route.routeNumber ? `${route.routeNumber} - ${route.name}` : route.name}
            </option>
          ))}
        </select>

        <select
          className="p-2 rounded bg-muted"
          value={form.bus}
          onChange={(e) => setForm({ ...form, bus: e.target.value })}
        >
          <option value="">Select Bus</option>
          {buses.map((bus) => (
            <option key={bus._id} value={bus._id}>
              {bus.busNumber}
            </option>
          ))}
        </select>

        <select
          className="p-2 rounded bg-muted"
          value={form.driver}
          onChange={(e) => setForm({ ...form, driver: e.target.value })}
        >
          <option value="">Select Driver</option>
          {drivers.map((driver) => (
            <option key={driver._id} value={driver._id}>
              {driver.firstName} {driver.lastName}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="p-2 rounded bg-muted"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <input
          type="time"
          className="p-2 rounded bg-muted"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
        />

        <input
          type="time"
          className="p-2 rounded bg-muted"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
        />
      </div>

      <Button onClick={handleSubmit} loading={loading}>
        {editingId ? "Save Changes" : "Add Schedule"}
      </Button>

      <div className="mt-6 space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule._id} className="rounded-lg border border-border bg-muted/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  {schedule.route?.name || "Route"} | {schedule.bus?.busNumber || "Bus"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Driver: {schedule.driver ? `${schedule.driver.firstName} ${schedule.driver.lastName}` : "Not assigned"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{formatScheduleDate(schedule.date)}</p>
                <p className="text-sm mt-1">{schedule.startTime} → {schedule.endTime}</p>
                <p className="text-xs mt-2 capitalize text-primary">{schedule.status?.replace("_", " ") || "scheduled"}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(schedule)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(schedule._id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleManagementPanel;
