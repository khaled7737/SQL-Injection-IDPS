// Dashboard component with protection shield visualization

const Dashboard = ({ config, toggleService, updateConfig, loading }) => {
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [localConfig, setLocalConfig] = useState({
    server_ip: config.server_ip,
    server_port: config.server_port
  });

  // Handle service toggle
  const handleToggleService = async () => {
    const success = await toggleService(!config.service_active);
    if (success) {
      showToast(`Service ${config.service_active ? 'stopped' : 'started'} successfully`);
    }
  };

  // Open configuration dialog
  const openConfigDialog = () => {
    setLocalConfig({
      server_ip: config.server_ip,
      server_port: config.server_port
    });
    setShowConfigDialog(true);
  };

  // Save configuration
  const saveConfig = async () => {
    const success = await updateConfig(localConfig);
    if (success) {
      setShowConfigDialog(false);
      showToast('Configuration saved successfully');
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalConfig({
      ...localConfig,
      [name]: value
    });
  };

  return (
    <div className="dashboard container py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body text-center p-5">
              <h1 className="mb-4">SQL Injection Protection</h1>
              <div className="shield-container mb-5">
                <Shield active={config.service_active} />
              </div>
              
              <div className="d-flex justify-content-center gap-3">
                <button 
                  className={`btn ${config.service_active ? 'btn-danger' : 'btn-success'} btn-lg px-4`}
                  onClick={handleToggleService}
                  disabled={loading}
                >
                  <i className={`fas ${config.service_active ? 'fa-stop-circle' : 'fa-play-circle'} me-2`}></i>
                  {config.service_active ? 'Stop Protection' : 'Start Protection'}
                </button>
                
                <button 
                  className="btn btn-primary btn-lg px-4"
                  onClick={openConfigDialog}
                  disabled={loading}
                >
                  <i className="fas fa-cog me-2"></i>
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Status Card */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-info-circle me-2"></i>
                Service Status
              </h5>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Status:</span>
                  <span className={`badge ${config.service_active ? 'bg-success' : 'bg-danger'}`}>
                    {config.service_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Server IP:</span>
                  <span className="text-secondary">{config.server_ip}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Port:</span>
                  <span className="text-secondary">{config.server_port}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Alert Settings Card */}
        <div className="col-md-6 mt-4 mt-md-0">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-bell me-2"></i>
                Alert Settings
              </h5>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Email Alerts:</span>
                  <span className={`badge ${config.email_alerts ? 'bg-success' : 'bg-secondary'}`}>
                    {config.email_alerts ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>SMS Alerts:</span>
                  <span className={`badge ${config.sms_alerts ? 'bg-success' : 'bg-secondary'}`}>
                    {config.sms_alerts ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="mt-3">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setActiveTab('settings')}
                  >
                    Configure Alerts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Configuration Dialog */}
      {showConfigDialog && (
        <ConfigDialog
          config={localConfig}
          onChange={handleInputChange}
          onSave={saveConfig}
          onClose={() => setShowConfigDialog(false)}
        />
      )}
      
    </div>
  );
};
