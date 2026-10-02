type AccessTokenGetter = () => Promise<string | undefined> | string | undefined;

const MOCK_TOKEN = "mock-access-token";

let getAccessToken: AccessTokenGetter = () =>
  import.meta.env.VITE_ENABLE_MOCKS === "true" ? MOCK_TOKEN : undefined;

export function setAccessTokenGetter(getter: AccessTokenGetter) {
  getAccessToken = getter;
}

export async function currentAccessToken(): Promise<string | undefined> {
  return getAccessToken();
}
