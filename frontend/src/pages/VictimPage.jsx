import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const VictimPage = () => {
  const [formData, setFormData] = useState({
    hearing_date: '',
    case_no: '',
    court_hall_no: '',
    party_name: '',
    counsel_name_through_vc: '',
    technical_person: '',
    remarks: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState({
    date: '',
    case_no: '',
    court_hall_no: ''
  });

  useEffect(() => {
    fetchVictims(page);
  }, [page]);

  useEffect(() => {
    fetchVictims(1);
    setPage(1);
  }, [search]);

  const fetchVictims = async (currentPage = 1) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        ...Object.fromEntries(Object.entries(search).filter(([_, v]) => v))
      });
      const response = await axios.get(`http://localhost:5000/victims/getAll?${params}`);
      setVictims(response.data.victims || []);
      setTotal(response.data.total || 0);
      setPage(response.data.page || currentPage);
    } catch (err) {
      setError('Unable to load victim records.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
  };

  const handleBulkFileChange = (e) => {
    setBulkFile(e.target.files[0] || null);
    setBulkMessage('');
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      alert('Choose a Google Sheets export or Excel file first.');
      return;
    }

    const data = new FormData();
    data.append('file', bulkFile);
    setBulkLoading(true);
    setBulkMessage('Processing import, please wait...');

    try {
      const response = await axios.post('http://localhost:5000/victims/bulk-upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBulkMessage(response.data.message || 'Victim records imported successfully.');
      setBulkFile(null);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = null;
      }
      setPage(1);
      fetchVictims(1);
    } catch (error) {
      setBulkMessage('Import failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please choose a file before submitting.');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append('uploaded_file', selectedFile);

    try {
      await axios.post('http://localhost:5000/victims/upload', data);
      alert('Victim added successfully!');
      setFormData({
        hearing_date: '',
        case_no: '',
        court_hall_no: '',
        party_name: '',
        counsel_name_through_vc: '',
        technical_person: '',
        remarks: ''
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      setPage(1);
      fetchVictims(1);
    } catch (error) {
      alert('Error adding victim: ' + error.message);
    }
  };

  const courtHallOptions = [];
  courtHallOptions.push(<option key={0} value="Court No">Hon'ble The CJ's Court</option>);
  for (let i = 1; i <= 21; i++) {
    courtHallOptions.push(<option key={i} value={`Hall-${i}`}>{`Hall-${i}`}</option>);
  }

  return (
    <div className="page-grid">
      <section className="form-panel">
        <div className="panel-header">
          <div>
            <h1>Add Victim</h1>
            <p className="subtitle">Enter victim hearing details and save the record to your database.</p>
          </div>
          <span className="summary-pill">{victims.length} records</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="hearing_date">Hearing Date</label>
            <input type="date" id="hearing_date" name="hearing_date" value={formData.hearing_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="case_no">Case No</label>
            <input type="text" id="case_no" name="case_no" value={formData.case_no} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="court_hall_no">Court Hall No</label>
            <select id="court_hall_no" name="court_hall_no" value={formData.court_hall_no} onChange={handleChange} required>
              <option value="">Select Court Hall</option>
              {courtHallOptions}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="party_name">Party Name</label>
            <input type="text" id="party_name" name="party_name" value={formData.party_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="counsel_name_through_vc">Counsel Name Through VC</label>
            <input type="text" id="counsel_name_through_vc" name="counsel_name_through_vc" value={formData.counsel_name_through_vc} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="technical_person">Technical Person</label>
            <input type="text" id="technical_person" name="technical_person" value={formData.technical_person} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="uploaded_file">Choose File</label>
            <input
              type="file"
              id="uploaded_file"
              name="uploaded_file"
              onChange={handleFileChange}
              ref={fileInputRef}
              required
            />
            {selectedFile && <p className="file-note">Selected file: {selectedFile.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="remarks">Remarks</label>
            <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange}></textarea>
          </div>
          <button type="submit" className="btn">Add Victim</button>
        </form>
      </section>

      <section className="list-panel">
        <div className="panel-header">
          <div>
            <h2>Recent Victim Records</h2>
          </div>
          <span className="summary-pill">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
        </div>

        <div className="search-form">
          <div className="form-group">
            <label htmlFor="search_date">Date</label>
            <input type="date" id="search_date" name="date" value={search.date} onChange={handleSearchChange} />
          </div>
          <div className="form-group">
            <label htmlFor="search_case_no">Case No</label>
            <input type="text" id="search_case_no" name="case_no" value={search.case_no} onChange={handleSearchChange} />
          </div>
          <div className="form-group">
            <label htmlFor="search_court_hall_no">Hall No</label>
            <input type="text" id="search_court_hall_no" name="court_hall_no" value={search.court_hall_no} onChange={handleSearchChange} />
          </div>
        </div>

        <div className="import-panel">
          <h3>Import Excel / Google Sheets data</h3>
          <p className="subtitle">Upload a spreadsheet export with original hearing dates. The importer reads common headers and keeps the date exactly as provided.</p>
          <div className="import-help">
            <strong>Supported headers:</strong>
            <ul>
              <li>Date</li>
              <li>Case No</li>
              <li>Hall No</li>
              <li>Party Name</li>
              <li>Counsel Name Through VC</li>
              <li>Technical Person</li>
              <li>Remarks</li>
            </ul>
          </div>
          <div className="form-group">
            <label htmlFor="bulk_file">Spreadsheet file</label>
            <input type="file" id="bulk_file" name="bulk_file" accept=".xlsx,.xls,.csv" onChange={handleBulkFileChange} ref={bulkFileInputRef} />
          </div>
          <button type="button" className="btn" onClick={handleBulkUpload} disabled={bulkLoading}>
            {bulkLoading ? 'Importing...' : 'Import spreadsheet'}
          </button>
          {bulkMessage && <div className={`alert ${bulkMessage.startsWith('Import failed') ? 'error' : 'success'}`}>{bulkMessage}</div>}
        </div>

        {error && <div className="alert error">{error}</div>}
        {loading ? (
          <div className="loading">Loading victim records...</div>
        ) : victims.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Date</th>
                  <th>Case No</th>
                  <th>Hall</th>
                  <th>Party</th>
                  <th>Counsel</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {victims.map((victim) => (
                  <tr key={victim.serial_no}>
                    <td>{victim.serial_no}</td>
                    <td>{victim.hearing_date}</td>
                    <td>{victim.case_no}</td>
                    <td>{victim.court_hall_no}</td>
                    <td>{victim.party_name}</td>
                    <td>{victim.counsel_name_through_vc}</td>
                    <td>{victim.uploaded_file?.split('/').pop()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No victim records yet. Add a record using the form.</p>
        )}
      </section>
    </div>
  );
};

export default VictimPage;