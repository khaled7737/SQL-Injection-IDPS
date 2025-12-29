// Main React application component

const { useState, useEffect } = React;

// Main App component
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [config, setConfig] = useState({
    server_ip: '127.0.0.1',
    server_port: 80,
    service_active: false,
    email_alerts: true,
    sms_alerts: false,
    email_recipient: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/config');
        setConfig(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching configuration:', err);
        setError('Failed to load configuration. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Update configuration in the backend
  const updateConfig = async (newConfig) => {
    try {
      setLoading(true);
      await axios.post('/api/config', newConfig);
      setConfig({ ...config, ...newConfig });
      setError(null);
      return true;
    } catch (err) {
      console.error('Error updating configuration:', err);
      setError('Failed to update configuration. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle service activation
  const toggleService = async (active) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/service', { active });
      if (response.data.success) {
        setConfig({ ...config, service_active: active });
      }
      setError(null);
      return response.data.success;
    } catch (err) {
      console.error('Error toggling service:', err);
      setError('Failed to toggle service. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    window.location.href = '/logout';
  };

  // Render active component based on tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            config={config} 
            toggleService={toggleService} 
            updateConfig={updateConfig} 
            loading={loading} 
          />
        );
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings config={config} updateConfig={updateConfig} />;
      default:
        return <Dashboard config={config} toggleService={toggleService} updateConfig={updateConfig} />;
    }
  };

  return (
    <div className="app-container">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      <div className="d-flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        
        <main className="content flex-grow-1 p-4">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            renderActiveComponent()
          )}
        </main>
      </div>
    </div>
  );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
