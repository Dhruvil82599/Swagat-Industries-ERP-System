import React, { useState, useEffect } from 'react';
import AppLayout, { useToast } from '../components/Layout/AppLayout';
import { api } from '../services/api';
import ConfirmModal from '../components/UI/ConfirmModal';
import { 
  FiUsers, 
  FiUserPlus, 
  FiMail, 
  FiKey, 
  FiEdit2,
  FiTrash2, 
  FiRefreshCw, 
  FiX, 
  FiCheckCircle, 
  FiClock, 
  FiSend, 
  FiShield,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import ActionButtons, { ActionButton, ActionButtonsGroup } from '../components/UI/ActionButtons';


export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'invitations'

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Password visibility states
  const [showCreatePass, setShowCreatePass] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);


  // Form states
  const [inviteForm, setInviteForm] = useState({ email: '', fullName: '' });
  const [createForm, setCreateForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [editForm, setEditForm] = useState({ fullName: '', username: '', email: '' });
  const [resetPasswordForm, setResetPasswordForm] = useState({ newPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [lastInviteInfo, setLastInviteInfo] = useState(null);

  const { addToast } = useToast();

  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const loadData = async () => {

    try {
      setLoading(true);
      const [usersData, invData] = await Promise.all([
        api.getUsers(),
        api.getInvitations()
      ]);
      setUsers(usersData || []);
      setInvitations(invData || []);
    } catch (err) {
      addToast(err.message || 'Failed to load user data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Send Invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.email.trim()) {
      addToast('Please enter recipient email address.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.sendUserInvite(inviteForm);
      addToast('Invitation sent successfully!', 'success');
      setLastInviteInfo(res);
      setIsInviteModalOpen(false);
      setInviteForm({ email: '', fullName: '' });
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to send invitation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create User Direct
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.username || !createForm.username.trim()) {
      addToast('Username is required.', 'error');
      return;
    }
    if (!createForm.password || createForm.password.length < 6) {
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createUser(createForm);
      addToast('New user created successfully!', 'success');
      setIsCreateModalOpen(false);
      setCreateForm({ fullName: '', username: '', email: '', password: '' });
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to create user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit User Modal
  const openEditModal = (u) => {
    setSelectedUser(u);
    setEditForm({
      fullName: u.fullName || '',
      username: u.username || '',
      email: u.email || ''
    });
    setIsEditModalOpen(true);
  };

  // Handle Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editForm.username || !editForm.username.trim()) {
      addToast('Username is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.updateUser(selectedUser.id, editForm);
      addToast(`User profile for "${editForm.username}" updated!`, 'success');
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to update user profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordForm.newPassword || resetPasswordForm.newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.resetUserPassword(selectedUser.id, resetPasswordForm);
      addToast(`Password for ${selectedUser.username} updated!`, 'success');
      setIsResetModalOpen(false);
      setResetPasswordForm({ newPassword: '' });
    } catch (err) {
      addToast(err.message || 'Failed to reset password.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    try {
      await api.deleteUser(selectedUser.id);
      addToast(`User ${selectedUser.username} removed.`, 'success');
      setIsDeleteModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to delete user.', 'error');
    }
  };

  // Handle Cancel Invitation
  const handleCancelInvite = async (inviteId) => {
    try {
      await api.cancelInvitation(inviteId);
      addToast('Invitation cancelled.', 'success');
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to cancel invitation.', 'error');
    }
  };

  return (
    <AppLayout title="User Management & Invitations">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiUsers /> User Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: '4px 0 0 0' }}>
            Manage ERP team member accounts and email invitations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-accent-swagat" onClick={() => setIsInviteModalOpen(true)}>
            <FiMail /> Invite New User
          </button>
          <button className="btn-outline-swagat" onClick={() => setIsCreateModalOpen(true)}>
            <FiUserPlus /> Create User Directly
          </button>
        </div>
      </div>

      {/* Development simulated invitation notice */}
      {lastInviteInfo && lastInviteInfo.devInviteCode && (
        <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>📩 Dev Invite Code Generated:</strong> Code <code style={{ backgroundColor: '#FDE68A', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '15px' }}>{lastInviteInfo.devInviteCode}</code> for email <strong>{lastInviteInfo.invitation?.email}</strong>. Use this code to test registration!
          </div>
          <button onClick={() => setLastInviteInfo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E' }}>
            <FiX />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'users' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14.5px'
          }}
        >
          <FiShield /> Active ERP Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'invitations' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'invitations' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'invitations' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14.5px'
          }}
        >
          <FiMail /> Pending Invitations ({invitations.length})
        </button>
      </div>

      <div className="erp-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading users...
          </div>
        ) : activeTab === 'users' ? (
          /* Active Users Table (Clean without Role column) */
          <div style={{ overflowX: 'auto' }}>
            {users.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active users found.
              </div>
            ) : (
              <table className="erp-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Sr.</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Created Date</th>
                    <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {u.fullName || '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.username}</td>
                      <td>{u.email || <span style={{ color: '#94A3B8' }}>N/A</span>}</td>
                      <td>{formatDateDDMMYYYY(u.createdAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <ActionButtons
                          onEdit={() => openEditModal(u)}
                          editTitle="Edit User Details"
                          onKey={() => {
                            setSelectedUser(u);
                            setResetPasswordForm({ newPassword: '' });
                            setIsResetModalOpen(true);
                          }}
                          keyTitle="Reset Password"
                          onDelete={() => {
                            setSelectedUser(u);
                            setIsDeleteModalOpen(true);
                          }}
                          deleteTitle="Delete User"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* Invitations Table */
          <div style={{ overflowX: 'auto' }}>
            {invitations.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No pending email invitations. Click "Invite New User" above to send one.
              </div>
            ) : (
              <table className="erp-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Sr.</th>
                    <th>Invited Email</th>
                    <th>Invited Name</th>
                    <th>Invitation Code</th>
                    <th>Status</th>
                    <th>Expires At</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv, idx) => (
                    <tr key={inv.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{inv.email}</td>
                      <td>{inv.fullName || '—'}</td>
                      <td>
                        <code style={{ backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, letterSpacing: '2px', color: '#D97706' }}>
                          {inv.code}
                        </code>
                      </td>
                      <td>
                        <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FiClock /> Pending Registration
                        </span>
                      </td>
                      <td>{formatDateDDMMYYYY(inv.expiresAt)}</td>

                      <td style={{ textAlign: 'right' }}>
                        <ActionButton
                          variant="danger"
                          iconName="delete"
                          title="Cancel Invitation"
                          onClick={() => handleCancelInvite(inv.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3><FiMail /> Send Email Invitation</h3>
              <button className="modal-close-btn" onClick={() => setIsInviteModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSendInvite}>
              <div className="modal-body-swagat">
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  An invitation code will be generated and emailed to the recipient. They can use this code to register their account.
                </p>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label className="form-label-swagat">
                      Recipient Email Address <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="form-control-swagat"
                      placeholder="e.g. employee@swagatindustries.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label-swagat">Invited User Full Name (Optional)</label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      placeholder="e.g. Rajesh Patel"
                      value={inviteForm.fullName}
                      onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-accent-swagat"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Invitation Email'} <FiSend />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Directly Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3><FiUserPlus /> Create New User Directly</h3>
              <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body-swagat">
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label className="form-label-swagat">Full Name</label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      placeholder="e.g. Vikram Sharma"
                      value={createForm.fullName}
                      onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label-swagat">
                        Username <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control-swagat"
                        placeholder="e.g. vikram_s"
                        value={createForm.username}
                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label-swagat">Email Address (Optional)</label>
                      <input
                        type="email"
                        className="form-control-swagat"
                        placeholder="e.g. vikram@swagat.com"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label-swagat">
                      Initial Password (Min 6 Chars) <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCreatePass ? 'text' : 'password'}
                        required
                        className="form-control-swagat"
                        style={{ paddingRight: '40px' }}
                        placeholder="••••••••"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePass(!showCreatePass)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={showCreatePass ? 'Hide password' : 'Show password'}
                      >
                        {showCreatePass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3><FiEdit2 /> Edit User Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body-swagat">
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label className="form-label-swagat">Full Name</label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      placeholder="e.g. Dhruvil Umaretiya"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label-swagat">
                        Username <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control-swagat"
                        placeholder="e.g. admin"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label-swagat">Email Address</label>
                      <input
                        type="email"
                        className="form-control-swagat"
                        placeholder="e.g. user@swagat.com"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Update User Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3><FiKey /> Reset Password for {selectedUser.username}</h3>
              <button className="modal-close-btn" onClick={() => setIsResetModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="modal-body-swagat">
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label-swagat">
                    New Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetPass ? 'text' : 'password'}
                      required
                      className="form-control-swagat"
                      style={{ paddingRight: '40px' }}
                      placeholder="Enter new password (at least 6 characters)"
                      value={resetPasswordForm.newPassword}
                      onChange={(e) => setResetPasswordForm({ newPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPass(!showResetPass)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={showResetPass ? 'Hide password' : 'Show password'}
                    >
                      {showResetPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

              </div>
              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setIsResetModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete User Account?"
        message={`Are you sure you want to delete user "${selectedUser?.username}"? They will no longer be able to log in to Swagat ERP.`}
        onConfirm={handleDeleteUser}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </AppLayout>
  );
}
