// Settings component for alert preferences and password reset

const Settings = ({ config, updateConfig }) => {
  const [alertSettings, setAlertSettings] = useState({
    email_alerts: config.email_alerts,
    sms_alerts: config.sms_alerts,
    email_recipient: config.email_recipient || '',
    phone_number: config.phone_number || ''
  });
  
  const [passwordSettings, setPasswordSettings] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Update local state when config changes
  useEffect(() => {
    setAlertSettings({
      email_alerts: config.email_alerts,
      sms_alerts: config.sms_alerts,
      email_recipient: config.email_recipient || '',
      phone_number: config.phone_number || ''
    });
  }, [config]);

  // Handle alert settings change
  const handleAlertChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAlertSettings({
      ...alertSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Save alert settings
  const saveAlertSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const success = await updateConfig(alertSettings);
      if (success) {
        setSuccess('Alert settings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to save alert settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password settings change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordSettings({
      ...passwordSettings,
      [name]: value
    });
  };

  // Reset password
  const resetPassword = async () => {
    // Validate passwords
    if (passwordSettings.new_password !== passwordSettings.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    
    if (passwordSettings.new_password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/password', {
        current_password: passwordSettings.current_password,
        new_password: passwordSettings.new_password
      });
      
      if (response.data.success) {
        setSuccess('Password updated successfully!');
        setPasswordSettings({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      //setError(err.response?.data?.error || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings container py-4">
      <h1 className="mb-4">
        <i className="fas fa-cog me-2"></i>
        Settings
      </h1>
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}
      
      <div className="row">
  
        {/* Alert Settings */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-bell me-2"></i>
                Alert Settings
              </h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="emailAlerts"
                    name="email_alerts"
                    checked={alertSettings.email_alerts}
                    onChange={handleAlertChange}
                  />
                  <label className="form-check-label" htmlFor="emailAlerts">
                    Email Alerts
                  </label>
                </div>
                
                {alertSettings.email_alerts && (
                  <div className="mb-3">
                    <label htmlFor="emailRecipient" className="form-label">Email Recipient</label>
                    <input
                      type="email"
                      className="form-control"
                      id="emailRecipient"
                      name="email_recipient"
                      value={alertSettings.email_recipient}
                      onChange={handleAlertChange}
                      placeholder="example@example.com"
                    />
                  </div>
                )}
                
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="smsAlerts"
                    name="sms_alerts"
                    checked={alertSettings.sms_alerts}
                    onChange={handleAlertChange}
                  />
                  <label className="form-check-label" htmlFor="smsAlerts">
                    SMS Alerts
                  </label>
                </div>
                
                {alertSettings.sms_alerts && (
                  <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phoneNumber"
                      name="phone_number"
                      value={alertSettings.phone_number}
                      onChange={handleAlertChange}
                      placeholder="+1234567890"
                    />
                  </div>
                )}
                
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveAlertSettings}
                  disabled={loading}
                >
                  {loading ? 
                    <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...</span> : 
                    <span><i className="fas fa-save me-2"></i>Save Alert Settings</span>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Password Reset */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-key me-2"></i>
                Change Password
              </h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    name="current_password"
                    value={passwordSettings.current_password}
                    onChange={handlePasswordChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="new_password"
                    value={passwordSettings.new_password}
                    onChange={handlePasswordChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirm_password"
                    value={passwordSettings.confirm_password}
                    onChange={handlePasswordChange}
                  />
                </div>
                
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={resetPassword}
                  disabled={loading}
                >
                  {loading ? 
                    <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...</span> : 
                    <span><i className="fas fa-key me-2"></i>Change Password</span>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
