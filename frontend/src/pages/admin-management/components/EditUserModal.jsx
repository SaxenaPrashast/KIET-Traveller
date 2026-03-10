import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { API_BASE } from "../../../config/constants";
import { useAuth } from "../../../contexts/AuthContext";

const EditUserModal = ({ open, onClose, user, onUserUpdated }) => {

  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });

  useEffect(() => {

    if (user) {

      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || ""
      });

    }

  }, [user]);

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

      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      if (onUserUpdated) onUserUpdated();

      onClose();

    } catch (err) {

      console.error("Edit user error:", err);
      alert("Failed to update user");

    } finally {

      setLoading(false);

    }

  };

  if (!open || !user) return null;

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">

        <h2 className="text-lg font-semibold text-foreground mb-4">
          Edit User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />

          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />

          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <div className="flex justify-end space-x-2 pt-4">

            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" loading={loading}>
              Save Changes
            </Button>

          </div>

        </form>

      </div>

    </div>

  );

};

export default EditUserModal;