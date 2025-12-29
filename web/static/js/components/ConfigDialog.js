// Configuration Dialog Component

const ConfigDialog = ({ config, onChange, onSave, onClose }) => {
  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-cog me-2"></i>
              Server Configuration
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="mb-3">
                <label htmlFor="server_ip" className="form-label">Server IP Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="server_ip"
                  name="server_ip"
                  value={config.server_ip}
                  onChange={onChange}
                  placeholder="Enter server IP address"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="server_port" className="form-label">Server Port</label>
                <input
                  type="number"
                  className="form-control"
                  id="server_port"
                  name="server_port"
                  value={config.server_port}
                  onChange={onChange}
                  placeholder="Enter server port"
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={onSave}>
              <i className="fas fa-save me-2"></i>
              Save Configuration
            </button>
          </div>
        </div>
      </div>
  
    </div>
  );
};
