import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const COURT_HALLS = [
  { value: 'Court No', label: "Hon'ble The CJ's Court" },
  ...Array.from({ length: 21 }, (_, i) => ({ value: `Hall-${i + 1}`, label: `Hall-${i + 1}` }))
];

const VictimPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const emptyForm = {
    hearing_date: today,
    case_no: '',
    court_hall_no: '',
    party_name: '',
    counsel_name_through_vc: '',
    technical_person: '',
    remarks: ''
  };
  const [tab, setTab] = useState('add');
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState({ date: '', case_no: '', court_hall_no: '' });

  useEffect(() => { fetchVictims(page); }, [page]);
  useEffect(() => { fetchVictims(1); setPage(1); }, [search]);

  const fetchVictims = async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: currentPage, limit,
        ...Object.fromEntries(Object.entries(search).filter(([_, v]) => v))
      });
      const res = await axios.get(`http://localhost:5000/victims/getAll?${params}`);
      setVictims(res.data.victims || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || currentPage);
    } catch {
      setError('Unable to load victim records.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSearchChange = e => setSearch({ ...search, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitMsg('');
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append('uploaded_file', selectedFile);
    try {
      await axios.post('http://localhost:5000/victims/upload', data);
      setSubmitMsg('success');
      setFormData(emptyForm);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      fetchVictims(1); setPage(1);
    } catch (err) {
      setSubmitMsg('error:' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) { alert('Choose a spreadsheet file first.'); return; }
    const data = new FormData();
    data.append('file', bulkFile);
    setBulkLoading(true);
    setBulkMessage('');
    try {
      const res = await axios.post('http://localhost:5000/victims/bulk-upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBulkMessage({ type: 'success', text: res.data.message || 'Records imported successfully.' });
      setBulkFile(null);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = null;
      fetchVictims(1); setPage(1);
    } catch (err) {
      setBulkMessage({ type: 'error', text: 'Import failed: ' + (err.response?.data?.error || err.message) });
    } finally {
      setBulkLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="register-page">
      <div className="register-header">
        <div>
          <h1 className="register-title">Victim Register</h1>
          <p className="register-meta">High Court of Delhi &mdash; VC Hearing Records</p>
        </div>
        <span className="record-count">{total} total records</span>
      </div>

      {/* Tab Nav */}
      <div className="tab-nav">
        <button className={`tab-btn${tab === 'add' ? ' active' : ''}`} onClick={() => setTab('add')}>
          Add Entry
        </button>
        <button className={`tab-btn${tab === 'records' ? ' active' : ''}`} onClick={() => { setTab('records'); fetchVictims(page); }}>
          View Records
        </button>
        <button className={`tab-btn${tab === 'import' ? ' active' : ''}`} onClick={() => setTab('import')}>
          Bulk Import
        </button>
      </div>

      {/* ── ADD ENTRY TAB ── */}
      {tab === 'add' && (
        <div className="tab-panel">
          <p className="panel-desc">Fill in the details below and attach the relevant document to create a new victim hearing entry.</p>
          {submitMsg === 'success' && (
            <div className="msg-bar success">Entry added successfully.</div>
          )}
          {submitMsg.startsWith('error:') && (
            <div className="msg-bar error">Error: {submitMsg.slice(6)}</div>
          )}
          <form onSubmit={handleSubmit} className="entry-form" noValidate>
            <div className="form-row two-col">
              <div className="field">
                <label>Hearing Date <span className="req">*</span></label>
                <input type="date" name="hearing_date" value={formData.hearing_date} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Case No <span className="req">*</span></label>
                <input type="text" name="case_no" value={formData.case_no} onChange={handleChange} placeholder="e.g. WP(C) 1234/2024" required />
              </div>
            </div>
            <div className="form-row two-col">
              <div className="field">
                <label>Court Hall <span className="req">*</span></label>
                <select name="court_hall_no" value={formData.court_hall_no} onChange={handleChange} required>
                  <option value="">Select Hall</option>
                  {COURT_HALLS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Party Name <span className="req">*</span></label>
                <input type="text" name="party_name" value={formData.party_name} onChange={handleChange} placeholder="Full name" required />
              </div>
            </div>
            <div className="form-row two-col">
              <div className="field">
                <label>Consern DLSA <span className="req">*</span></label>
                <input type="text" name="counsel_name_through_vc" value={formData.counsel_name_through_vc} onChange={handleChange} placeholder="Advocate name" required />
              </div>
              <div className="field">
                <label>Technical Person <span className="req">*</span></label>
                <input type="text" name="technical_person" value={formData.technical_person} onChange={handleChange} placeholder="NIC / staff name" required />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Remarks</label>
                <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2} placeholder="Optional notes…" />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Attach Document</label>
                <input type="file" name="uploaded_file" onChange={e => setSelectedFile(e.target.files[0] || null)} ref={fileInputRef} />
                {selectedFile && <span className="file-hint">✓ {selectedFile.name}</span>}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={submitLoading}>
                {submitLoading ? 'Saving…' : 'Save Entry'}
              </button>
              <button type="button" className="ghost-btn" onClick={() => { setFormData(emptyForm); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = null; setSubmitMsg(''); }}>
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── VIEW RECORDS TAB ── */}
      {tab === 'records' && (
        <div className="tab-panel">
          <div className="search-row">
            <div className="field">
              <label>Filter by Date</label>
              <input type="date" name="date" value={search.date} onChange={handleSearchChange} />
            </div>
            <div className="field">
              <label>Filter by Case No</label>
              <input type="text" name="case_no" value={search.case_no} onChange={handleSearchChange} placeholder="Case number…" />
            </div>
            <div className="field">
              <label>Filter by Hall</label>
              <input type="text" name="court_hall_no" value={search.court_hall_no} onChange={handleSearchChange} placeholder="Hall-1, Court No…" />
            </div>
            <button className="ghost-btn" onClick={() => setSearch({ date: '', case_no: '', court_hall_no: '' })}>
              Clear Filters
            </button>
          </div>

          {error && <div className="msg-bar error">{error}</div>}

          {loading ? (
            <div className="loading-row">Loading records…</div>
          ) : victims.length === 0 ? (
            <div className="empty-state">No records found for the selected filters.</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Case No</th>
                      <th>Hall</th>
                      <th>Party Name</th>
                      <th>Counsel (VC)</th>
                      <th>Technical Person</th>
                      <th>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {victims.map(v => (
                      <tr key={v.serial_no}>
                        <td className="mono">{v.serial_no}</td>
                        <td className="mono">{v.hearing_date}</td>
                        <td className="mono">{v.case_no}</td>
                        <td>{v.court_hall_no}</td>
                        <td>{v.party_name}</td>
                        <td>{v.counsel_name_through_vc}</td>
                        <td>{v.technical_person}</td>
                        <td>
                          {v.uploaded_file
                            ? <span className="file-badge">{v.uploaded_file.split('/').pop()}</span>
                            : <span className="na">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination-row">
                <button className="ghost-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
                <span className="page-info">Page {page} of {totalPages} &nbsp;·&nbsp; {total} records</span>
                <button className="ghost-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── BULK IMPORT TAB ── */}
      {tab === 'import' && (
        <div className="tab-panel">
          <p className="panel-desc">
            Upload an Excel (.xlsx / .xls) or CSV file exported from Google Sheets.
            The importer will read the headers below and preserve dates exactly as entered.
          </p>
          <div className="import-info">
            <strong>Expected column headers:</strong>
            <ul>
              <li>Date</li><li>Case No</li><li>Hall No</li>
              <li>Party Name</li>
              <li>Counsel Name Through VC</li><li>Technical Person</li><li>Remarks</li>
            </ul>
          </div>
          <div className="field" style={{ maxWidth: 420 }}>
            <label>Choose file</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={e => { setBulkFile(e.target.files[0] || null); setBulkMessage(''); }} ref={bulkFileInputRef} />
            {bulkFile && <span className="file-hint">✓ {bulkFile.name}</span>}
          </div>
          <div className="form-actions" style={{ marginTop: '1rem' }}>
            <button className="primary-btn" onClick={handleBulkUpload} disabled={bulkLoading}>
              {bulkLoading ? 'Importing…' : 'Import File'}
            </button>
          </div>
          {bulkMessage && (
            <div className={`msg-bar ${bulkMessage.type}`}>{bulkMessage.text}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default VictimPage;