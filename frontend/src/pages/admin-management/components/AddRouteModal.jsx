import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { API_BASE } from "../../../config/constants";
import { useAuth } from "../../../contexts/AuthContext";

const AddRouteModal = ({ open, onClose, onRouteAdded }) => {

  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    routeNumber: "",
    name: "",
    description: "",
    estimatedDuration: "",
    capacity: "",
    frequency: "",
    startTime: "",
    endTime: ""
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      const payload = {
        routeNumber: formData.routeNumber,
        name: formData.name,
        description: formData.description,
        estimatedDuration: Number(formData.estimatedDuration),
        capacity: Number(formData.capacity),
        frequency: Number(formData.frequency),

        operatingDays: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday"
        ],

        operatingHours: {
          start: formData.startTime,
          end: formData.endTime
        },

        // IMPORTANT: backend validation requires stops
        stops: []
      };

      const res = await fetch(`${API_BASE}/routes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Route creation failed");
      }

      if (onRouteAdded) onRouteAdded();

      onClose();

      setFormData({
        routeNumber: "",
        name: "",
        description: "",
        estimatedDuration: "",
        capacity: "",
        startTime: "",
        endTime: ""
      });

    } catch (err) {

      console.error("Route creation error:", err);
      alert(err.message || "Failed to create route");

    } finally {

      setLoading(false);

    }

  };

  if (!open) return null;

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">

        <h2 className="text-lg font-semibold text-foreground mb-4">
          Create Route
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            label="Route Number"
            name="routeNumber"
            value={formData.routeNumber}
            onChange={handleChange}
            required
          />

          <Input
            label="Route Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <Input
            label="Estimated Duration (minutes)"
            name="estimatedDuration"
            type="number"
            value={formData.estimatedDuration}
            onChange={handleChange}
            required
          />

          <Input
            label="Capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            required
          />

          <Input
            label="Frequency (minutes)"
            name="frequency"
            type="number"
            value={formData.frequency}
            onChange={handleChange}
            required
          />

          <Input
            label="Start Time"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            required
          />

          <Input
            label="End Time"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            required
          />

          <div className="flex justify-end space-x-2 pt-4">

            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" loading={loading}>
              Create Route
            </Button>

          </div>

        </form>

      </div>

    </div>

  );

};

export default AddRouteModal;