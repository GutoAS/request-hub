import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";
import { MockSessionProvider } from "../auth/MockSessionProvider";

interface RenderAppOptions {
  signedOut?: boolean;
}

export function renderApp(
  route: string,
  { signedOut = false }: RenderAppOptions = {},
) {
  if (signedOut) sessionStorage.setItem("demoAuth.signedOut", "true");

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const user = userEvent.setup();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <MockSessionProvider>
          <App />
        </MockSessionProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { user, ...result };
}
