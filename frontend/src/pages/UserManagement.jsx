import React, { useEffect, useState } from 'react';
import { NavBtnLink } from '../components/Navbar/NavbarElements'; // Adjust path if needed
import '../styles/userManagement.css';

const API_URL = process.env.REACT_APP_API_URL;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: '', status: 'active' });

  // Fetch users on mount
  useEffect(() => {
    fetch(`${API_URL}/api/users`, { credentials: 'include' })
      .then(res => res.json())
      .then(users => setUsers(users.filter(u => u.role !== 'admin'))); // Exclude admins
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setForm({ ...user });
  };

  const handleSave = () => {
    fetch(`${API_URL}/api/users/${editingUser}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(() => {
        setUsers(users.map(u => u.id === editingUser ? { ...form, id: editingUser } : u));
        setEditingUser(null);
      });
  };

  // Toggle user status (active <-> disabled)
  const handleToggleStatus = (user) => {
    // Always treat empty/null status as 'active'
    const currentStatus = user.status && user.status.length > 0 ? user.status : 'active';
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    fetch(`${API_URL}/api/users/${user.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => res.json())
      .then(() =>
        setUsers(users.map(u =>
          u.id === user.id ? { ...u, status: newStatus } : u
        ))
      );
  };

  return (
    <div className="user-mgmt-container">
      <h2>User Management</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th style={{ minWidth: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            // Always treat empty/null status as 'active'
            const userStatus = u.status && u.status.length > 0 ? u.status : 'active';

            return editingUser === u.id ? (
              <tr key={u.id}>
                <td><input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></td>
                <td><input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></td>
                <td><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></td>
                <td>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">active</option>
                    <option value="disabled">disabled</option>
                  </select>
                </td>
                <td className="actions-col">
                  <NavBtnLink as="button" onClick={handleSave}>Save</NavBtnLink>
                  <NavBtnLink as="button" onClick={() => setEditingUser(null)} className="cancel-btn">Cancel</NavBtnLink>
                </td>
              </tr>
            ) : (
              <tr key={u.id}>
                <td>{u.firstName}</td>
                <td>{u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td className={userStatus === 'active' ? 'status-active' : 'status-disabled'}>
                  {userStatus}
                </td>
                <td className="actions-col">
                  <NavBtnLink as="button" onClick={() => handleEdit(u)}>Edit</NavBtnLink>
                  <NavBtnLink
                    as="button"
                    onClick={() => handleToggleStatus(u)}
                    className={userStatus === 'active' ? 'disable-btn' : 'enable-btn'}
                  >
                    {userStatus === 'active' ? 'Disable' : 'Enable'}
                  </NavBtnLink>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
