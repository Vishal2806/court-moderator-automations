import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../lib/api.js';

const COURT_HALLS = [
  { value: 'Court No', label: "Hon'ble The CJ's Court" },
  ...Array.from({ length: 21 }, (_, i) => ({ value: `Hall-${i + 1}`, label: `Hall-${i + 1}` })),
];

const PAGE_LIMIT = 10;
const DEFAULT_SEARCH = { date: '', case_no: '', court_hall_no: '' };

const getToday = () => new Date().toISOString().split('T')[0];

const getFileName = (filePath) => filePath.split(/[\\/]/).pop();

const createEmptyForm = (partyFieldName) => ({
  hearing_date: getToday(),
  case_no: '',
  court_hall_no: '',
  [partyFieldName]: '',
  counsel_name_through_vc: '',
  technical_person: '',
  remarks: '',
});

const RegisterPage = ({
  title,
  endpoints,
  responseKey,
  partyFieldName,
  partyLabel,
  partyColumnLabel,
  counselLabel,
  counselColumnLabel = 'Counsel (VC)',
  addDescription,
  importHeaders,
  loadErrorMessage,
}) => {
  const [tab, setTab] = useState('add');
  const [formData, setFormData] = useState(() => createEmptyForm(partyFieldName));
  const [selectedFile, setSelectedFile] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(DEFAULT_SEARCH);

  const resetForm = ({ clearMessage = true } = {}) => {
    setFormData(createEmptyForm(partyFieldName));
    setSelectedFile(null);
    if (clearMessage) {
      setSubmitMsg('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const fetchRecords = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: PAGE_LIMIT,
        ...Object.fromEntries(Object.entries(search).filter((entry) => entry[1])),
      });
      const res = await api.get(`${endpoints.list}?${params}`);

      setRecords(res.data[responseKey] || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || currentPage);
    } catch {
      setError(loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoints.list, loadErrorMessage, responseKey, search]);

  useEffect(() => {
    queueMicrotask(() => fetchRecords(page));
  }, [fetchRecords, page]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSearchChange = (event) => {
    setSearch({ ...search, [event.target.name]: event.target.value });
    setPage(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitLoading(true);
    setSubmitMsg('');

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append('uploaded_file', selectedFile);

    try {
      await api.post(endpoints.upload, data);
      setSubmitMsg('success');
      resetForm({ clearMessage: false });
      fetchRecords(1);
      setPage(1);
    } catch (err) {
      setSubmitMsg('error:' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setBulkMessage({ type: 'error', text: 'Choose a spreadsheet file first.' });
      return;
    }

    const data = new FormData();
    data.append('file', bulkFile);
    setBulkLoading(true);
    setBulkMessage('');

    try {
      const res = await api.post(endpoints.bulkUpload, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBulkMessage({ type: 'success', text: res.data.message || 'Records imported successfully.' });
      setBulkFile(null);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = null;
      }
      fetchRecords(1);
      setPage(1);
    } catch (err) {
      setBulkMessage({ type: 'error', text: 'Import failed: ' + (err.response?.data?.error || err.message) });
    } finally {
      setBulkLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <div className="register-page">
      <div className="register-header">
        <div>
          <h1 className="register-title">{title}</h1>
          <p className="register-meta">High Court of Chhattisgarh &mdash; VC Hearing Records</p>
        </div>
        <span className="record-count">{total} total records</span>
      </div>

      <div className="tab-nav">
        <button className={`tab-btn${tab === 'add' ? ' active' : ''}`} onClick={() => setTab('add')}>
          Add Entry
        </button>
        <button className={`tab-btn${tab === 'records' ? ' active' : ''}`} onClick={() => { setTab('records'); fetchRecords(page); }}>
          View Records
        </button>
        <button className={`tab-btn${tab === 'import' ? ' active' : ''}`} onClick={() => setTab('import')}>
          Bulk Import
        </button>
      </div>

      {tab === 'add' && (
        <div className="tab-panel">
          <p className="panel-desc">{addDescription}</p>
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
                  {COURT_HALLS.map((hall) => <option key={hall.value} value={hall.value}>{hall.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>{partyLabel} <span className="req">*</span></label>
                <input type="text" name={partyFieldName} value={formData[partyFieldName]} onChange={handleChange} placeholder="Full name" required />
              </div>
            </div>
            <div className="form-row two-col">
              <div className="field">
                <label>{counselLabel} <span className="req">*</span></label>
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
                <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2} placeholder="Optional notes..." />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Attach Document</label>
                <input type="file" name="uploaded_file" onChange={(event) => setSelectedFile(event.target.files[0] || null)} ref={fileInputRef} />
                {selectedFile && <span className="file-hint">{selectedFile.name}</span>}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Save Entry'}
              </button>
              <button type="button" className="ghost-btn" onClick={() => resetForm()}>
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'records' && (
        <div className="tab-panel">
          <div className="search-row">
            <div className="field">
              <label>Filter by Date</label>
              <input type="date" name="date" value={search.date} onChange={handleSearchChange} />
            </div>
            <div className="field">
              <label>Filter by Case No</label>
              <input type="text" name="case_no" value={search.case_no} onChange={handleSearchChange} placeholder="Case number..." />
            </div>
            <div className="field">
              <label>Filter by Hall</label>
              <input type="text" name="court_hall_no" value={search.court_hall_no} onChange={handleSearchChange} placeholder="Hall-1, Court No..." />
            </div>
            <button className="ghost-btn" onClick={() => { setSearch(DEFAULT_SEARCH); setPage(1); }}>
              Clear Filters
            </button>
          </div>

          {error && <div className="msg-bar error">{error}</div>}

          {loading ? (
            <div className="loading-row">Loading records...</div>
          ) : records.length === 0 ? (
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
                      <th>{partyColumnLabel}</th>
                      <th>{counselColumnLabel}</th>
                      <th>Technical Person</th>
                      <th>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.serial_no}>
                        <td className="mono">{record.serial_no}</td>
                        <td className="mono">{record.hearing_date}</td>
                        <td className="mono">{record.case_no}</td>
                        <td>{record.court_hall_no}</td>
                        <td>{record[partyFieldName]}</td>
                        <td>{record.counsel_name_through_vc}</td>
                        <td>{record.technical_person}</td>
                        <td>
                          {record.uploaded_file
                            ? <span className="file-badge">{getFileName(record.uploaded_file)}</span>
                            : <span className="na">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination-row">
                <button className="ghost-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
                <span className="page-info">Page {page} of {totalPages} | {total} records</span>
                <button className="ghost-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'import' && (
        <div className="tab-panel">
          <p className="panel-desc">
            Upload an Excel (.xlsx / .xls) or CSV file exported from Google Sheets.
            The importer will read the headers below and preserve dates exactly as entered.
          </p>
          <div className="import-info">
            <strong>Expected column headers:</strong>
            <ul>
              {importHeaders.map((header) => <li key={header}>{header}</li>)}
            </ul>
          </div>
          <div className="field" style={{ maxWidth: 420 }}>
            <label>Choose file</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => { setBulkFile(event.target.files[0] || null); setBulkMessage(''); }} ref={bulkFileInputRef} />
            {bulkFile && <span className="file-hint">{bulkFile.name}</span>}
          </div>
          <div className="form-actions" style={{ marginTop: '1rem' }}>
            <button className="primary-btn" onClick={handleBulkUpload} disabled={bulkLoading}>
              {bulkLoading ? 'Importing...' : 'Import File'}
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

export default RegisterPage;
