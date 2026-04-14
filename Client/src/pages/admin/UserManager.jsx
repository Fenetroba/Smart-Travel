import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import ValidationError from '../../components/shared/ValidationError'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function UserManager() {
  const { auth } = useOutletContext()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  })
  const [formErrors, setFormErrors] = useState({})

  // Check if current user is superadmin
  const isSuperAdmin = auth?.user?.role === 'superadmin'

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers()
    }
  }, [isSuperAdmin])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setError('')

    try {
      const url = editingUser 
        ? `${API_BASE}/api/users/${editingUser._id}`
        : `${API_BASE}/api/users`
      
      const method = editingUser ? 'PUT' : 'POST'
      const body = editingUser 
        ? { name: formData.name, email: formData.email, role: formData.role }
        : formData

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      
      if (!res.ok) {
        if (data.errors) {
          const errors = {}
          data.errors.forEach(err => {
            errors[err.field] = err.message
          })
          setFormErrors(errors)
        } else {
          setError(data.message || 'Operation failed')
        }
        return
      }

      await fetchUsers()
      closeModal()
    } catch {
      setError('Network error. Please try again.')
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      
      if (res.ok) {
        await fetchUsers()
      }
    } catch {
      setError('Failed to delete user')
    } finally {
      setDeleteTarget(null)
    }
  }

  const openModal = (user = null) => {
    setEditingUser(user)
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'admin'
    })
    setFormErrors({})
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', password: '', role: 'admin' })
    setFormErrors({})
    setError('')
  }

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">🔒</span>
        <h2 className="text-xl font-semibold text-white mt-4">Access Denied</h2>
        <p className="text-white/60 mt-2">Only superadmins can manage users.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
        <span className="ml-3 text-white/60">Loading users...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Admins</h1>
          <p className="text-white/50 text-sm">Create and manage admin accounts</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Add Admin
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-4 py-3 text-white/70">Name</th>
              <th className="text-left px-4 py-3 text-white/70">Email</th>
              <th className="text-left px-4 py-3 text-white/70">Role</th>
              <th className="text-left px-4 py-3 text-white/70">Status</th>
              <th className="text-left px-4 py-3 text-white/70">Created</th>
              <th className="text-left px-4 py-3 text-white/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white font-medium">{user.name}</td>
                <td className="px-4 py-3 text-white/70">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'superadmin' 
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive 
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(user)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Edit
                    </button>
                    {user._id !== auth.user.id && (
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingUser ? 'Edit Admin' : 'Add New Admin'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="Enter full name"
            />
            <ValidationError error={formErrors.name} />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="Enter email address"
            />
            <ValidationError error={formErrors.email} />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                placeholder="Enter password (min 6 characters)"
              />
              <ValidationError error={formErrors.password} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
            <ValidationError error={formErrors.role} />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {editingUser ? 'Update Admin' : 'Create Admin'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate Admin"
        message={`Are you sure you want to deactivate ${deleteTarget?.name}? They will no longer be able to access the admin panel.`}
        confirmText="Deactivate"
        confirmClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}