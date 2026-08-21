import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext.jsx';
import { getAdmins, addAdmin, removeAdmin } from '../api/client.js';
import { isValidEmail } from '../utils/validators.js';
import logger from '../utils/logger.js';

export function useManageAdminsState() {
  const { user, isAdmin, isAuthLoading } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [bootstrapAdmins, setBootstrapAdmins] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdmins = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const data = await getAdmins(idToken);
      setAdmins(data.dbAdmins || []);
      setBootstrapAdmins(data.bootstrapAdmins || []);
    } catch (err) {
      logger.warn('Failed to fetch admins list', err);
      setError(err.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAdmins();
    } else if (!isAuthLoading) {
      setLoading(false);
    }
  }, [user, isAdmin, isAuthLoading, fetchAdmins]);

  const handleAdd = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isValidEmail(newEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const idToken = await user.getIdToken();
      await addAdmin(newEmail, idToken);
      setNewEmail('');
      await fetchAdmins();
    } catch (err) {
      logger.error('Failed to add admin', err);
      setError(err.message || 'Failed to add admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (emailToRemove) => {
    setActionLoading(true);
    setError('');
    try {
      const idToken = await user.getIdToken();
      await removeAdmin(emailToRemove, idToken);
      await fetchAdmins();
    } catch (err) {
      logger.error('Failed to remove admin', err);
      setError(err.message || 'Failed to remove admin');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    user,
    isAdmin,
    isAuthLoading,
    admins,
    bootstrapAdmins,
    newEmail,
    setNewEmail,
    loading,
    actionLoading,
    error,
    setError,
    fetchAdmins,
    handleAdd,
    handleRemove,
  };
}

export default useManageAdminsState;
