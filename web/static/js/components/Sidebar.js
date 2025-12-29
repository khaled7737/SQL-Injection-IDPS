// Sidebar component with navigation icons

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="sidebar bg-dark text-white d-flex flex-column" style={{ width: '80px', minHeight: '100vh' }}>
      <div className="p-3 text-center border-bottom border-secondary">
        <i className="fas fa-shield-alt fa-2x"></i>
      </div>
      
      <div className="d-flex flex-column align-items-center flex-grow-1 py-4">
        <button 
          className={`btn btn-link text-decoration-none p-2 mb-4 ${activeTab === 'home' ? 'text-primary' : 'text-white'}`}
          onClick={() => setActiveTab('home')}
          title="Dashboard"
        >
          <div className="d-flex flex-column align-items-center">
            <i className="fas fa-home fa-lg mb-1"></i>
          
          </div>
        </button>
        
        <button 
          className={`btn btn-link text-decoration-none p-2 mb-4 ${activeTab === 'reports' ? 'text-primary' : 'text-white'}`}
          onClick={() => setActiveTab('reports')}
          title="Reports"
        >
          <div className="d-flex flex-column align-items-center">
            <i className="fas fa-clipboard-list fa-lg mb-1"></i>
           
          </div>
        </button>
        
        <button 
          className={`btn btn-link text-decoration-none p-2 mb-4 ${activeTab === 'settings' ? 'text-primary' : 'text-white'}`}
          onClick={() => setActiveTab('settings')}
          title="Settings"
        >
          <div className="d-flex flex-column align-items-center">
            <i className="fas fa-cog fa-lg mb-1"></i>
         
          </div>
        </button>
      </div>
      
      <div className="mt-auto p-3 text-center border-top border-secondary">
        <button 
          className="btn btn-link text-decoration-none p-2 text-white"
          onClick={onLogout}
          title="Logout"
        >
          <div className="d-flex flex-column align-items-center">
            <i className="fas fa-sign-out-alt fa-lg mb-1"></i>
            <span className="small">Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
};
