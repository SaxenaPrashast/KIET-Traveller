import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE } from '../../../config/constants';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';

const UserManagementPanel = ({ refreshSignal }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { token } = useAuth();

  const defaultUsers = [
    {
      id: 1,
      name: "Dhruv Jain",
      email: "dhruv.jain@kiet.edu",
      firstName: "Dhruv",
      lastName: "Jain",
      phone: "",
      role: "student",
      status: "active",
      lastActive: new Date().toISOString(),
      busRoute: "Route 3",
      assignedBus: null,
      avatar: "https://i.pravatar.cc/150?img=1"
    }
  ];

  const fetchUsers = async () => {

    setLoading(true);

    try {

      const res = await fetch(`${API_BASE}/admin/users?page=1&limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();

      if (data.success) {

        const mappedUsers = data.data.users.map(u => ({
          id: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`,
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email,
          phone: u.phone || "",
          role: u.role,
          status: u.isActive ? "active" : "offline",
          lastActive: u.updatedAt || new Date().toISOString(),
          busRoute: u.assignedBus?.busNumber || "Not Assigned",
          assignedBus: u.assignedBus || null,
          avatar: `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}`
        }));

        setUsers(mappedUsers);

      } else {
        setUsers(defaultUsers);
      }

    } catch (err) {

      console.error("User fetch error:", err);
      setUsers(defaultUsers);

    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (refreshSignal !== undefined) {
      fetchUsers();
    }
  }, [refreshSignal]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-error/10 text-error';
      case 'driver': return 'bg-warning/10 text-warning';
      case 'staff': return 'bg-primary/10 text-primary';
      default: return 'bg-success/10 text-success';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'suspended': return 'bg-error/10 text-error';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const filteredUsers = users.filter(user => {

    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === 'all' || user.role === selectedRole;

    return matchesSearch && matchesRole;

  });

  const formatLastActive = (timestamp) => {

    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60));

    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;

    return date.toLocaleDateString();
  };


// DELETE USER
const deleteUser = async (userId) => {

  if (!window.confirm("Deactivate this user?")) return;

  try {

    await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    fetchUsers();

  } catch (err) {

    console.error("Delete user error:", err);

  }

};


// ACTIVATE / SUSPEND USER
const toggleUserStatus = async (user) => {

  try {

    await fetch(`${API_BASE}/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        isActive: user.status !== "active"
      })
    });

    fetchUsers();

  } catch (err) {

    console.error("Status update error:", err);

  }

};

  return (

    <div className="bg-card border border-border rounded-lg shadow-card">

      <div className="p-6 border-b border-border">

        <div className="flex items-center justify-between mb-4">

          <h3 className="text-lg font-semibold text-foreground">
            User Management
          </h3>

          <Button
            variant="default"
            iconName="UserPlus"
            iconPosition="left"
            size="sm"
            onClick={() => setShowAddUser(true)}
          >
            Add User
          </Button>

        </div>

        <div className="flex flex-col sm:flex-row gap-4">

          <div className="flex-1">

            <Input
              type="search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>

          <div className="flex gap-2">

            {['all', 'student', 'staff', 'driver', 'admin'].map(role => (

              <Button
                key={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRole(role)}
                className="capitalize"
              >
                {role}
              </Button>

            ))}

          </div>

        </div>

      </div>

      <div className="p-6">

        {loading && (
          <p className="text-center text-muted-foreground">
            Loading users...
          </p>
        )}

        <div className="space-y-4">

          {filteredUsers.map(user => (

            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50"
            >

              <div className="flex items-center space-x-4">

                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />

                <div>

                  <h4 className="font-medium text-foreground">
                    {user.name}
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>

                  <div className="flex gap-2 mt-1">

                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>

                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>

                  </div>

                </div>

              </div>

              <div className="flex items-center space-x-4">

                <div className="text-right hidden sm:block">

                  <p className="text-sm text-foreground">
                    {user.busRoute}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Active {formatLastActive(user.lastActive)}
                  </p>

                </div>

                 {/* Edit button  */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowEditUser(true);
                    }}
                  >
                    <Icon name="Edit" size={16} />
                  </Button>

                  {/* Activate / Suspend */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleUserStatus(user)}
                  >
                    <Icon name="UserX" size={16} />
                  </Button>

                  {/* Deactivate */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteUser(user.id)}
                  >
                    <Icon name="Trash" size={16} />
                  </Button>

              </div>

            </div>

          ))}

        </div>

      </div>

      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onUserAdded={fetchUsers}
      />
      <EditUserModal
        open={showEditUser}
        user={selectedUser}
        onClose={() => setShowEditUser(false)}
        onUserUpdated={fetchUsers}
      />

    </div>

  );
};

export default UserManagementPanel;
