import { Link } from "react-router-dom";
import type { ServiceRequest } from "../../api/types";
import { PriorityTag } from "../../components/PriorityTag";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../utils/formatDate";
import styles from "./RequestTable.module.css";

interface RequestTableProps {
  requests: ServiceRequest[];
  isUpdating?: boolean;
}

export function RequestTable({
  requests,
  isUpdating = false,
}: RequestTableProps) {
  return (
    <table
      className={`${styles.table} ${isUpdating ? styles.updating : ""}`}
      aria-busy={isUpdating}
    >
      <caption className="visually-hidden">Service requests</caption>
      <thead>
        <tr>
          <th scope="col">Request</th>
          <th scope="col">Requester</th>
          <th scope="col" className={styles.categoryCol}>
            Category
          </th>
          <th scope="col">Priority</th>
          <th scope="col">Status</th>
          <th scope="col">Created</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr key={request.id} className={styles.row}>
            <td className={styles.request}>
              <Link to={`/requests/${request.id}`} className={styles.titleLink}>
                {request.title}
              </Link>
              <span className={styles.id}>{request.id}</span>
            </td>
            <td className={styles.requester}>
              {request.requesterName}
              <span className={styles.email}>{request.requesterEmail}</span>
            </td>
            <td className={styles.categoryCol}>{request.category}</td>
            <td className={styles.priority}>
              <PriorityTag priority={request.priority} />
            </td>
            <td className={styles.status}>
              <StatusBadge status={request.status} />
            </td>
            <td className={styles.created}>
              <time dateTime={request.createdAt}>
                {formatDateTime(request.createdAt)}
              </time>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
