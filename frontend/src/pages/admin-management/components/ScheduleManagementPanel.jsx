import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { API_BASE } from "../../../config/constants";
import { useAuth } from "../../../contexts/AuthContext";

const ScheduleManagementPanel = () => {

  const { token } = useAuth();

  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [form, setForm] = useState({
    route: "",
    bus: "",
    driver: "",
    date: "",
    startTime: "",
    endTime: ""
  });

  const formatScheduleDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // 🔥 FETCH DATA CORRECTLY
  const fetchData = async () => {
    try {

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [r, b, u, s] = await Promise.all([
        fetch(`${API_BASE}/routes`, { headers }),
        fetch(`${API_BASE}/buses`, { headers }),
        fetch(`${API_BASE}/users`, { headers }),
        fetch(`${API_BASE}/schedules`, { headers })
      ]);

      const routesData = await r.json();
      const busesData = await b.json();
      const usersData = await u.json();
      const schedulesData = await s.json();

      console.log("ROUTES:", routesData);
      console.log("BUSES:", busesData);
      console.log("USERS:", usersData);

      setRoutes(routesData?.data?.routes || []);
      setBuses(busesData?.data?.buses || []);

      const driversOnly = (usersData?.data?.users || []).filter(
        u => u.role === "driver"
      );

      setDrivers(driversOnly);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingSchedules = (schedulesData?.data?.schedules || []).filter(schedule => {
        if (!schedule.date) return true;
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate >= today;
      });

      setSchedules(upcomingSchedules);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // 🔥 CREATE SCHEDULE
  const handleSubmit = async () => {
    try {

      const res = await fetch(`${API_BASE}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Schedule created");
        fetchData();
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">

      <h2 className="text-lg font-semibold mb-4">Schedule Management</h2>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* ROUTE */}
        <select
          className="p-2 rounded bg-muted"
          value={form.route}
          onChange={(e) => setForm({ ...form, route: e.target.value })}
        >
          <option value="">Select Route</option>
          {routes.map(r => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>

        {/* BUS */}
        <select
          className="p-2 rounded bg-muted"
          value={form.bus}
          onChange={(e) => setForm({ ...form, bus: e.target.value })}
        >
          <option value="">Select Bus</option>
          {buses.map(b => (
            <option key={b._id} value={b._id}>
              {b.busNumber}
            </option>
          ))}
        </select>

        {/* DRIVER */}
        <select
          className="p-2 rounded bg-muted"
          value={form.driver}
          onChange={(e) => setForm({ ...form, driver: e.target.value })}
        >
          <option value="">Select Driver</option>
          {drivers.map(d => (
            <option key={d._id} value={d._id}>
              {d.firstName} {d.lastName}
            </option>
          ))}
        </select>

        {/* DATE */}
        <input
          type="date"
          className="p-2 rounded bg-muted"
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        {/* START */}
        <input
          type="time"
          className="p-2 rounded bg-muted"
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
        />

        {/* END */}
        <input
          type="time"
          className="p-2 rounded bg-muted"
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
        />

      </div>

      <Button onClick={handleSubmit}>
        Add Schedule
      </Button>

      {/* LIST */}
      <div className="mt-6 space-y-3">
        {schedules.map(s => (
          <div key={s._id} className="p-3 border rounded">

            <p className="font-medium">
              {s.route?.name || "Route"} | {s.bus?.busNumber || "Bus"}
            </p>

            <p className="text-sm text-muted-foreground">
              {formatScheduleDate(s.date)}
            </p>

            <p className="text-sm">
              {s.startTime} → {s.endTime}
            </p>

          </div>
        ))}
      </div>

    </div>
  );
};

export default ScheduleManagementPanel;
