import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import styles from "./ApiPlaygroundPage.module.css";

const DEV_TOKEN = "dev-token";
const API = import.meta.env.VITE_API_BASE_URL;

interface Example {
  label: string;
  expect: string;
  method: "GET" | "POST" | "PATCH";
  path: string;
  body?: unknown;
  withToken?: boolean;
}

const EXAMPLES: Example[] = [
  {
    label: "List, first page",
    expect: "200",
    method: "GET",
    path: "/requests",
  },
  {
    label: 'Search "portal", only Open',
    expect: "200",
    method: "GET",
    path: "/requests?search=portal&status=OPEN",
  },
  {
    label: "Oldest first, 5 per page, page 2",
    expect: "200",
    method: "GET",
    path: "/requests?sort=createdAt&pageSize=5&page=2",
  },
  {
    label: "Nothing matches",
    expect: "200, empty",
    method: "GET",
    path: "/requests?search=zzz",
  },
  {
    label: "Unknown query parameter",
    expect: "400",
    method: "GET",
    path: "/requests?color=blue",
  },
  {
    label: "Get REQ-1002",
    expect: "200",
    method: "GET",
    path: "/requests/REQ-1002",
  },
  {
    label: "Get a request that does not exist",
    expect: "404",
    method: "GET",
    path: "/requests/REQ-9999",
  },
  {
    label: "Create a valid request",
    expect: "201",
    method: "POST",
    path: "/requests",
    body: {
      title: "Printer offline in reception",
      description: "The reception printer shows offline since this morning.",
      category: "Hardware",
      priority: "LOW",
      requesterName: "Front Desk",
      requesterEmail: "front.desk@example.com",
    },
  },
  {
    label: "Create with invalid fields",
    expect: "422",
    method: "POST",
    path: "/requests",
    body: {
      title: "Hi",
      description: "Too short",
      category: "Billing",
      priority: "MEDIUM",
      requesterName: "Example Customer",
      requesterEmail: "customer@example",
    },
  },
  {
    label: "Resolve REQ-1002 (version 4)",
    expect: "200, then 409 if you click again",
    method: "PATCH",
    path: "/requests/REQ-1002/status",
    body: { status: "RESOLVED", version: 4, note: "Credit note issued." },
  },
  {
    label: "Stale version (someone else changed it)",
    expect: "409",
    method: "PATCH",
    path: "/requests/REQ-1001/status",
    body: { status: "IN_PROGRESS", version: 99 },
  },
  {
    label: "Reopen a Closed request (REQ-1007)",
    expect: "422",
    method: "PATCH",
    path: "/requests/REQ-1007/status",
    body: { status: "IN_PROGRESS", version: 4 },
  },
  {
    label: "Call without a token",
    expect: "401",
    method: "GET",
    path: "/requests",
    withToken: false,
  },
];

interface Result {
  request: string;
  status: number;
  contentType: string | null;
  location: string | null;
  json: unknown;
}

export function ApiPlaygroundPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  async function run(example: Example) {
    setRunning(example.label);
    const headers: Record<string, string> = { Accept: "application/json" };
    if (example.withToken !== false)
      headers.Authorization = `Bearer ${DEV_TOKEN}`;
    if (example.body) headers["Content-Type"] = "application/json";

    const response = await fetch(`${API}${example.path}`, {
      method: example.method,
      headers,
      body: example.body ? JSON.stringify(example.body) : undefined,
    });

    setResult({
      request: `${example.method} ${API}${example.path}`,
      status: response.status,
      contentType: response.headers.get("Content-Type"),
      location: response.headers.get("Location"),
      json: await response.json(),
    });
    setRunning(null);
  }

  return (
    <>
      <PageHeader
        title="API playground"
        subtitle="Calls the MSW fake backend and shows the raw response. Refresh the page to reset the data."
      />
      <div className={styles.layout}>
        <Card className={styles.examples}>
          {EXAMPLES.map((example) => (
            <div key={example.label} className={styles.example}>
              <div>
                <div className={styles.label}>{example.label}</div>
                <code className={styles.path}>
                  {example.method} {example.path}
                </code>
              </div>
              <div className={styles.run}>
                <span className={styles.expect}>expect {example.expect}</span>
                <Button
                  onClick={() => run(example)}
                  disabled={running !== null}
                >
                  {running === example.label ? "Running…" : "Run"}
                </Button>
              </div>
            </div>
          ))}
        </Card>

        <Card className={styles.output} aria-live="polite">
          {result ? (
            <>
              <div className={styles.outputHeader}>
                <code>{result.request}</code>
                <span className={result.status < 400 ? styles.ok : styles.fail}>
                  {result.status}
                </span>
              </div>
              <p className={styles.meta}>
                Content-Type: {result.contentType}
                {result.location && <> · Location: {result.location}</>}
              </p>
              <pre className={styles.json}>
                {JSON.stringify(result.json, null, 2)}
              </pre>
            </>
          ) : (
            <p className={styles.meta}>
              Run an example to see the response here.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
