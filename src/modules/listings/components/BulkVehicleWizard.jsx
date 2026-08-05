import { useBulkVehicleWizard } from "../context/BulkVehicleWizardContext";

import Step1Category from "./steps/Step1Category";
import Step2ListingType from "./steps/Step2ListingType";
import Step4VehicleInfo from "./steps/Step4VehicleInfo";
import Step5Specs from "./steps/Step5Specs";
import Step6Features from "./steps/Step6Features";
import Step7Media from "./steps/Step7Media";
import Step8Location from "./steps/Step8Location";
import Step9Pricing from "./steps/Step9Pricing";

const stepComponents = {
  1: Step1Category,
  2: Step2ListingType,
  4: Step4VehicleInfo,
  5: Step5Specs,
  6: Step6Features,
  7: Step7Media,
  8: Step8Location,
  9: Step9Pricing,
};

const BulkVehicleWizard = () => {
  const { currentStep } = useBulkVehicleWizard();

  const StepComponent = stepComponents[currentStep] || Step1Category;

  return (
    <div key={currentStep} className="animate-[stepFadeIn_0.25s_ease-out]">
      <StepComponent />
    </div>
  );
};

export default BulkVehicleWizard;