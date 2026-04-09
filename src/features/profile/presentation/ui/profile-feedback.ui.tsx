import { Check, AlertCircle } from "lucide-react";

type ProfileFeedbackProps = {
  error: string | null;
  success: string | null;
};

export function ProfileFeedback({ error, success }: ProfileFeedbackProps) {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 p-4 bg-error/10 text-error rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-success/10 text-success rounded-lg">
          <Check className="w-5 h-5 shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}
    </>
  );
}
