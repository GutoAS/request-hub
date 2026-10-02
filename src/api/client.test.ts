import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { server } from "../mocks/server";
import { ApiError } from "./ApiError";
import { apiFetch, buildQueryString, setUnauthorizedHandler } from "./client";

describe("buildQueryString", () => {
  it("skips empty values, because the API answers 400 to them", () => {
    expect(
      buildQueryString({
        search: "",
        status: undefined,
        priority: null,
        page: 1,
        sort: "-createdAt",
      }),
    ).toBe("?page=1&sort=-createdAt");
    expect(buildQueryString({})).toBe("");
  });
});

describe("apiFetch", () => {
  afterEach(() => setUnauthorizedHandler(() => {}));

  it("sends the access token as a Bearer header", async () => {
    let authorization: string | null = null;
    server.use(
      http.get("*/api/requests/REQ-1001", ({ request }) => {
        authorization = request.headers.get("Authorization");
        return HttpResponse.json({ id: "REQ-1001" });
      }),
    );
    await apiFetch("/requests/REQ-1001");
    expect(authorization).toBe("Bearer mock-access-token");
  });

  it("turns Problem Details into an ApiError", async () => {
    const error = await apiFetch("/requests/REQ-9999").catch(
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      isNotFound: true,
      title: "Service request not found",
    });
  });

  it("keeps the field errors of a 422", async () => {
    const error = await apiFetch("/requests", {
      method: "POST",
      body: { title: "Hi" },
    }).catch((caught: unknown) => caught);
    expect(error).toMatchObject({ status: 422, isValidationError: true });
    expect((error as ApiError).fieldErrors.title).toEqual([
      "Title must be at least 3 characters long.",
    ]);
  });

  it('reports "no network" as status 0', async () => {
    server.use(http.get("*/api/requests", () => HttpResponse.error()));
    await expect(apiFetch("/requests")).rejects.toMatchObject({
      status: 0,
      title: "Cannot reach the server",
    });
  });

  it("copes with a non-JSON error page (e.g. a proxy 502)", async () => {
    server.use(
      http.get(
        "*/api/requests",
        () => new HttpResponse("<html>Bad gateway</html>", { status: 502 }),
      ),
    );
    await expect(apiFetch("/requests")).rejects.toMatchObject({
      status: 502,
      title: "Something went wrong",
    });
  });

  it("calls the unauthorized handler on 401", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    server.use(
      http.get("*/api/requests", () =>
        HttpResponse.json(
          { title: "Unauthorized", status: 401 },
          { status: 401 },
        ),
      ),
    );
    await expect(apiFetch("/requests")).rejects.toMatchObject({
      isUnauthorized: true,
    });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
});
