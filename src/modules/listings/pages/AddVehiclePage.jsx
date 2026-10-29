import { BulkVehicleWizardProvider } from "../context/BulkVehicleWizardContext";
import SinglePageListingForm from "../components/SinglePageListingForm";

const AddVehiclePage = () => {
  return (
    <BulkVehicleWizardProvider>
      <SinglePageListingForm />
    </BulkVehicleWizardProvider>
  );
};

export default AddVehiclePage;