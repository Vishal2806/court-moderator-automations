import React, { useState } from 'react';
import axios from 'axios';

const AdvocatePage = () => {
  const [formData, setFormData] = useState({
    case_no: '',
    court_hall_no: '',
    petitioner_name: '',
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
      const response = await axios.post('http://localhost:5000/advocates/upload', formData);
      alert('Advocate added successfully!');
      console.log(response.data);
      // Reset form
      setFormData({
        case_no: '',
        court_hall_no: '',
        petitioner_name: '',
        counsel_name_through_vc: '',
        technical_person: '',
        uploaded_file: '',
        remarks: ''
      });
    } catch (error) {
      alert('Error adding advocate: ' + error.message);
    }
  };

  const courtHallOptions = [];
  courtHallOptions.push(<option key={0} value="Court No">Court No</option>);
  for (let i = 1; i <= 21; i++) {
    courtHallOptions.push(<option key={i} value={`Hall-${i}`}>{`Hall-${i}`}</option>);
  }

  return (
    <div className="form-container">
      <h1>Add Advocate</h1>
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
          <label htmlFor="petitioner_name">Petitioner Name</label>
          <input type="text" id="petitioner_name" name="petitioner_name" value={formData.petitioner_name} onChange={handleChange} required />
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
        <button type="submit" className="btn">Add Advocate</button>
      </form>
    </div>
  );
};

export default AdvocatePage;