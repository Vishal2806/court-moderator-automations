import RegisterPage from '../components/RegisterPage.jsx';

const VictimPage = () => (
  <RegisterPage
    title="Victim Register"
    endpoints={{
      list: '/victims/getAll',
      upload: '/victims/upload',
      bulkUpload: '/victims/bulk-upload',
    }}
    responseKey="victims"
    partyFieldName="party_name"
    partyLabel="Party Name"
    partyColumnLabel="Party Name"
    counselLabel="Concern DLSA"
    addDescription="Fill in the details below and attach the relevant document to create a new victim hearing entry."
    importHeaders={[
      'Date',
      'Case No',
      'Hall No',
      'Party Name',
      'Counsel Name Through VC',
      'Technical Person',
      'Remarks',
    ]}
    loadErrorMessage="Unable to load victim records."
  />
);

export default VictimPage;
