import type {
  ServiceRequest,
  ServiceRequestPriority,
  ServiceRequestStatus,
} from "../api/types";

const SPEC_EXAMPLES: ServiceRequest[] = [
  {
    id: "REQ-1001",
    title: "Unable to access customer portal",
    description:
      'The customer receives "Account locked" after signing in with valid credentials.',
    category: "Access",
    priority: "HIGH",
    status: "OPEN",
    requesterName: "Example Customer",
    requesterEmail: "customer@example.com",
    createdAt: "2026-02-10T08:15:00Z",
    updatedAt: "2026-02-10T08:15:00Z",
    version: 1,
  },
  {
    id: "REQ-1002",
    title: "Duplicate invoice on February statement",
    description:
      "Invoice INV-88213 appears twice on the February billing statement.",
    category: "Billing",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    requesterName: "Second Customer",
    requesterEmail: "second.customer@example.com",
    createdAt: "2026-02-09T13:42:11Z",
    updatedAt: "2026-02-11T09:05:30Z",
    version: 4,
  },
];

const TOPICS: Array<[string, string, string]> = [
  [
    "Customer portal shows blank page on Safari",
    "Access",
    "After login the portal renders an empty white page in Safari 17. Chrome works.",
  ],
  [
    "Portal password reset email not received",
    "Access",
    "The customer requested a password reset three times and no email arrived.",
  ],
  [
    "Router keeps dropping connection",
    "Network",
    "The home router disconnects every 20 minutes and needs a restart.",
  ],
  [
    "Self-service app is down for all users",
    "Outage",
    "Every sign-in attempt returns HTTP 503 since 06:00 UTC across web and mobile.",
  ],
  [
    "Charged twice for monthly subscription",
    "Billing",
    "The card statement shows two identical charges for the January subscription.",
  ],
  [
    "Cannot update phone number in portal profile",
    "Account",
    'Saving a new phone number shows "Something went wrong" and nothing changes.',
  ],
  [
    "Slow internet speed in the evening",
    "Network",
    "Speed drops from 100 Mbps to under 5 Mbps between 19:00 and 23:00 every day.",
  ],
  [
    "Portal invoice download times out",
    "Billing",
    "Downloading the PDF invoice from the portal spins for a minute and then fails.",
  ],
  [
    "Request to close account",
    "Account",
    "The customer is moving abroad and wants the account closed at the end of the month.",
  ],
  [
    "Mobile app crashes on startup",
    "Access",
    "The Android app closes immediately after the splash screen since the last update.",
  ],
  [
    "No signal at new office location",
    "Network",
    "The new office on the 3rd floor has no coverage at all, other floors are fine.",
  ],
  [
    "Wrong VAT number on invoices",
    "Billing",
    "All invoices since December show the old company VAT number.",
  ],
  [
    "Two-factor codes arrive late",
    "Access",
    "SMS verification codes arrive after 5 minutes, when they have already expired.",
  ],
  [
    "Email notifications are in the wrong language",
    "Account",
    "The customer set Portuguese but receives every notification in English.",
  ],
  [
    "Regional outage in the north district",
    "Outage",
    "Several customers in the north district report no service since this morning.",
  ],
  [
    "Refund not received after cancellation",
    "Billing",
    "The order was cancelled two weeks ago and the refund has not arrived yet.",
  ],
  [
    "VPN disconnects on corporate plan",
    "Network",
    "The site-to-site VPN drops every hour and reconnects after about a minute.",
  ],
  [
    "Change billing address",
    "Billing",
    "The customer moved and needs the billing address updated before the next invoice.",
  ],
  [
    "Portal session expires too quickly",
    "Access",
    "Users are logged out of the portal after about two minutes of inactivity.",
  ],
  [
    "Upgrade plan to business tier",
    "Account",
    "The customer wants to upgrade from the home plan to the business plan.",
  ],
  [
    "Intermittent packet loss on fibre line",
    "Network",
    "Ping tests show 10 to 15 percent packet loss several times a day.",
  ],
  [
    "Late payment fee applied by mistake",
    "Billing",
    "A late fee was added although the payment was made before the due date.",
  ],
  [
    "Cannot add second user to account",
    "Account",
    'The "Add user" button on the team page does nothing when clicked.',
  ],
  [
    "Payment page not loading",
    "Outage",
    "The payment page returns a gateway timeout for every customer since 14:00.",
  ],
  [
    "Statement shows unknown service",
    "Billing",
    'The February statement includes a "Premium support" line the customer never ordered.',
  ],
  [
    "Customer locked out after too many attempts",
    "Access",
    "The account was locked after five failed attempts and the unlock link is broken.",
  ],
  [
    "Transfer account ownership",
    "Account",
    "The company owner changed and the account must be transferred to the new director.",
  ],
  [
    "DNS resolution failing for some sites",
    "Network",
    'Some websites fail to load with "server not found" while others work normally.',
  ],
  [
    "Customer portal shows other customer data",
    "Access",
    "A customer reports seeing another customer name on the dashboard after login.",
  ],
  [
    "Parcel tracking page returns error",
    "Outage",
    'The tracking page shows "500 Internal Server Error" for all tracking numbers.',
  ],
];

const PEOPLE: Array<[string, string]> = [
  ["Lucia Nhantumbo", "lucia.nhantumbo@example.com"],
  ["João Sitoe", "joao.sitoe@example.com"],
  ["Carlos Mondlane", "carlos.mondlane@example.com"],
  ["Operations Desk", "ops.desk@example.com"],
  ["Maria Cossa", "maria.cossa@example.com"],
  ["Paulo Macuácua", "paulo.macuacua@example.com"],
  ["Ana Tembe", "ana.tembe@example.com"],
  ["Rui Chissano", "rui.chissano@example.com"],
];

const STATUS_CYCLE: ServiceRequestStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "OPEN",
  "RESOLVED",
  "CLOSED",
  "IN_PROGRESS",
  "OPEN",
];
const PRIORITY_CYCLE: ServiceRequestPriority[] = [
  "MEDIUM",
  "LOW",
  "HIGH",
  "MEDIUM",
  "CRITICAL",
  "LOW",
  "HIGH",
  "MEDIUM",
];

const VERSION_BY_STATUS: Record<ServiceRequestStatus, number> = {
  OPEN: 1,
  IN_PROGRESS: 2,
  RESOLVED: 3,
  CLOSED: 4,
};

const HOUR = 60 * 60 * 1000;
const NEWEST_CREATED_AT = Date.UTC(2026, 1, 12, 9, 30);

export function createSeedRequests(): ServiceRequest[] {
  const generated = TOPICS.map(
    ([title, category, description], index): ServiceRequest => {
      const status = STATUS_CYCLE[index % STATUS_CYCLE.length];
      const [requesterName, requesterEmail] = PEOPLE[index % PEOPLE.length];
      const version = VERSION_BY_STATUS[status];
      const created =
        NEWEST_CREATED_AT - index * 17 * HOUR - ((index * 37) % 60) * 60 * 1000;
      const updated = created + (version - 1) * 6 * HOUR;

      return {
        id: `REQ-${1003 + index}`,
        title,
        description,
        category,
        priority: PRIORITY_CYCLE[index % PRIORITY_CYCLE.length],
        status,
        requesterName,
        requesterEmail,
        createdAt: toIso(created),
        updatedAt: toIso(updated),
        version,
      };
    },
  );

  return [...SPEC_EXAMPLES.map((request) => ({ ...request })), ...generated];
}

export function toIso(time: number): string {
  return new Date(time).toISOString().replace(/\.\d{3}Z$/, "Z");
}
