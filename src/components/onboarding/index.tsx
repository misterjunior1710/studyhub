import { memo } from "react";
import OnboardingWelcome from "./OnboardingWelcome";
import OnboardingChecklist from "./OnboardingChecklist";
import OnboardingCelebration from "./OnboardingCelebration";

const OnboardingFlow = () => {
  return (
    <>
      <OnboardingWelcome />
      <OnboardingChecklist />
      <OnboardingCelebration />
    </>
  );
};

export default memo(OnboardingFlow);
