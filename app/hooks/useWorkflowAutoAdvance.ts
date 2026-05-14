// hooks/useWorkflowAutoAdvance.ts
import { useRouter } from "next/navigation";
import { useToast } from "@chakra-ui/react";

export function useWorkflowAutoAdvance() {
  const router = useRouter();
  const toast = useToast();

  const advanceWorkflow = () => {
    if (typeof window === "undefined") return;

    const raw = window.sessionStorage.getItem("workflowSession");
    if (!raw) return; // No active workflow, do nothing

    try {
      const session = JSON.parse(raw);
      const isLastStep = session.currentStepIndex === session.steps.length - 1;

      if (isLastStep) {
        // Workflow complete
        window.sessionStorage.removeItem("workflowSession");
        toast({
          status: "success",
          title: "✅ Workflow complete!",
          description: `All ${session.totalSteps} steps done.`,
          duration: 3000,
        });
        setTimeout(() => router.push("/tools/workflow"), 1500);
      } else {
        // Go to next step automatically
        const nextIndex = session.currentStepIndex + 1;
        const nextStep = session.steps[nextIndex];
        const updated = { ...session, currentStepIndex: nextIndex };
        window.sessionStorage.setItem("workflowSession", JSON.stringify(updated));

        toast({
          status: "success",
          title: `Moving to step ${nextIndex + 1} of ${session.totalSteps}`,
          description: `Opening: ${nextStep.name}`,
          duration: 2500,
        });

        setTimeout(() => router.push(nextStep.path), 800);
      }
    } catch (e) {
      console.error("Workflow advance error:", e);
    }
  };

  return { advanceWorkflow };
}