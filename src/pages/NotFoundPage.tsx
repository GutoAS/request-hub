import { ButtonLink } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { MdReportGmailerrorred } from "react-icons/md";

export function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        icon={MdReportGmailerrorred}
        title="Page not found"
        message="The address may be mistyped, or the page no longer exists."
        action={<ButtonLink to="/requests">Back to requests</ButtonLink>}
      />
    </Card>
  );
}
