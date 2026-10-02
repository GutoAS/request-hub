import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { PageHeader } from "../components/PageHeader";
import { PriorityTag } from "../components/PriorityTag";
import { Spinner } from "../components/Spinner";
import { StatusBadge } from "../components/StatusBadge";
import styles from "./UiKitPage.module.css";

export function UiKitPage() {
  return (
    <>
      <PageHeader
        title="UI kit"
        subtitle="Every shared component, for checking styles during development."
      />

      <div className={styles.grid}>
        <Card className={styles.section}>
          <h2 className={styles.heading}>Buttons</h2>
          <div className={styles.row}>
            <Button variant="primary">Primary</Button>
            <Button>Secondary</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Card>

        <Card className={styles.section}>
          <h2 className={styles.heading}>Status and priority</h2>
          <div className={styles.row}>
            <StatusBadge status="OPEN" />
            <StatusBadge status="IN_PROGRESS" />
            <StatusBadge status="RESOLVED" />
            <StatusBadge status="CLOSED" />
          </div>
          <div className={styles.row}>
            <PriorityTag priority="LOW" />
            <PriorityTag priority="MEDIUM" />
            <PriorityTag priority="HIGH" />
            <PriorityTag priority="CRITICAL" />
          </div>
        </Card>

        <Card className={styles.section}>
          <h2 className={styles.heading}>Errors</h2>
          <ErrorMessage
            title="Something went wrong"
            detail="An unexpected error occurred. Try again later."
            traceId="8fa10c37bb45"
            action={<Button>Try again</Button>}
          />
          <ErrorMessage
            variant="warning"
            title="This request was changed by someone else."
            detail="We loaded the latest version. Your change was not saved."
          />
        </Card>

        <Card>
          <Spinner label="Loading requests…" />
        </Card>

        <Card className={styles.wide}>
          <EmptyState
            title="No requests match your filters"
            message="Try a different search or clear the filters."
            action={<Button>Clear filters</Button>}
          />
        </Card>
      </div>
    </>
  );
}
