import React, { useState } from 'react';
import axios from 'axios';

const VictimPage = () => {
  const [formData, setFormData] = useState({
    case_no: '',
    court_hall_no: '',
    party_name: '',
    counsel_name_through_vc: '',
    technical_person: '',
    uploaded_file: '',
    remarks: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/victims/upload', formData);
      alert('Victim added successfully!');
      console.log(response.data);
      // Reset form
      setFormData({
        case_no: '',
        court_hall_no: '',
        party_name: '',
        counsel_name_through_vc: '',
        technical_person: '',
        uploaded_file: '',
        remarks: ''
      });
    } catch (error) {
      alert('Error adding victim: ' + error.message);
    }
  };

  const courtHallOptions = [];
  courtHallOptions.push(<option key={0} value="Court No">Court No</option>);
  for (let i = 1; i <= 21; i++) {
    courtHallOptions.push(<option key={i} value={`Hall-${i}`}>{`Hall-${i}`}</option>);
  }

  return (
    <div className="form-container">
      <h1>Add Victim</h1>
      <form onSubmit={handleSubmit}>
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
          <label htmlFor="uploaded_file">Uploaded File Path</label>
          <input type="text" id="uploaded_file" name="uploaded_file" value={formData.uploaded_file} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="remarks">Remarks</label>
          <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange}></textarea>
        </div>
        <button type="submit" className="btn">Add Victim</button>
      </form>
    </div>
  );
};

export default VictimPage;