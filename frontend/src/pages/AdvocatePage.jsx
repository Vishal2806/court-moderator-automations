import RegisterPage from '../components/RegisterPage.jsx';

const AdvocatePage = () => (
  <RegisterPage
    title="Advocate Register"
    endpoints={{
      list: '/advocates/getAll',
      upload: '/advocates/upload',
      bulkUpload: '/advocates/bulk-upload',
    }}
    responseKey="advocates"
    partyFieldName="petitioner_name"
    partyLabel="Petitioner Name"
    partyColumnLabel="Petitioner"
    counselLabel="Counsel Name (Through VC)"
    addDescription="Fill in the details below and attach the relevant document to create a new advocate hearing entry."
    importHeaders={[
      'Date',
      'Case No',
      'Court Hall No',
      'Petitioner Name (or Petitonar Name)',
      'Counsel Name Through VC',
      'Technical Person',
      'Remarks',
    ]}
    loadErrorMessage="Unable to load advocate records."
  />
);

export default AdvocatePage;
