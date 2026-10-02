import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { db } from "../../mocks/db";
import { renderApp } from "../../test/renderApp";

describe("request detail and status change", () => {
  it("offers only the allowed next statuses and saves the change", async () => {
    const { user } = renderApp("/requests/REQ-1002");
    expect(
      await screen.findByRole("heading", {
        name: "Duplicate invoice on February statement",
      }),
    ).toBeInTheDocument();

    const select = screen.getByLabelText("New status");
    const options = Array.from(
      select.querySelectorAll("option"),
      (option) => option.textContent,
    );
    expect(options).toEqual(["Choose…", "Resolved", "Open"]);

    await user.selectOptions(select, "RESOLVED");
    await user.type(
      screen.getByLabelText("Note (optional)"),
      "Credit note issued.",
    );
    await user.click(screen.getByRole("button", { name: "Update status" }));

    expect(
      await screen.findByText("Status changed to Resolved."),
    ).toBeInTheDocument();
    expect(db.find("REQ-1002")).toMatchObject({
      status: "RESOLVED",
      version: 5,
    });
  });

  it("explains a 409 conflict and shows the latest version", async () => {
    const { user } = renderApp("/requests/REQ-1001");
    await screen.findByRole("heading", {
      name: "Unable to access customer portal",
    });

    db.updateStatus("REQ-1001", "IN_PROGRESS");

    await user.selectOptions(screen.getByLabelText("New status"), "CLOSED");
    await user.click(screen.getByRole("button", { name: "Update status" }));

    expect(
      await screen.findByText("This request was changed by someone else."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/now In progress, version 2/),
    ).toBeInTheDocument();
    expect(db.find("REQ-1001")?.status).toBe("IN_PROGRESS"); // our change was not saved
  });

  it("does not offer changes on a Closed request", async () => {
    renderApp("/requests/REQ-1007");
    expect(
      await screen.findByText(/Closed requests are final/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("New status")).not.toBeInTheDocument();
  });

  it('shows "not found" for an unknown id', async () => {
    renderApp("/requests/REQ-9999");
    expect(await screen.findByText("Request not found")).toBeInTheDocument();
  });
});
