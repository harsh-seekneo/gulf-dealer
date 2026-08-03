import { BulkVehicleWizardProvider } from "../context/BulkVehicleWizardContext";
import BulkWizardShell from "../components/BulkWizardShell";
import BulkVehicleWizard from "../components/BulkVehicleWizard";

const AddVehiclePage = () => {
  return (
    <BulkVehicleWizardProvider>
      <BulkWizardShell>
        <BulkVehicleWizard />
      </BulkWizardShell>
    </BulkVehicleWizardProvider>
  );
};

export default AddVehiclePage;