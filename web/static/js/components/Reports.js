// Reports component for displaying SQL injection detection logs

const Reports = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filter, setFilter] = useState('');

  // Fetch logs from the API
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/logs');
      setLogs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Format request data
  const formatRequestData = (data) => {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return data;
    }
  };

  // Sort and filter logs
  const filteredAndSortedLogs = logs
    .filter(log => {
      if (!filter) return true;
      
      const searchTerm = filter.toLowerCase();
      return (
        log.detection_method.toLowerCase().includes(searchTerm) ||
        log.request_data.toLowerCase().includes(searchTerm) ||
        formatTimestamp(log.timestamp).toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'detection_method':
          comparison = a.detection_method.localeCompare(b.detection_method);
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'timestamp':
        default:
          comparison = new Date(a.timestamp) - new Date(b.timestamp);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="reports container-fluid py-4">
      <h1 className="mb-4">
        <i className="fas fa-clipboard-list me-2"></i>
        Detection Reports
      </h1>
      
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter logs..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
            
            <button className="btn btn-primary ms-2" onClick={fetchLogs} disabled={loading}>
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : filteredAndSortedLogs.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No logs found. Detection reports will appear here when SQL injection attempts are detected.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                      ID {sortField === 'id' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('detection_method')} style={{ cursor: 'pointer' }}>
                      Method {sortField === 'detection_method' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th>Request Data</th>
                    <th onClick={() => handleSort('score')} style={{ cursor: 'pointer' }}>
                      IP Attacker {sortField === 'score' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer' }}>
                      Timestamp {sortField === 'timestamp' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>
                        <span className="badge bg-primary">{log.detection_method}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          data-bs-toggle="modal"
                          data-bs-target={`#requestModal-${log.id}`}
                        >
                          View Data
                        </button>
                        
                        {/* Modal for Request Data */}
                        <div className="modal fade" id={`requestModal-${log.id}`} tabIndex="-1" aria-hidden="true">
                          <div className="modal-dialog">
                            <div className="modal-content">
                              <div className="modal-header">
                                <h5 className="modal-title">Request Data (ID: {log.id})</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                              </div>
                              <div className="modal-body">
                                <pre className="bg-dark text-light p-3 rounded">{formatRequestData(log.request_data)}</pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${log.score > 0.7 ? 'bg-danger' : 'bg-danger'}`}>
                          {log.score}
                        </span>
                      </td>
                      <td>{formatTimestamp(log.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
