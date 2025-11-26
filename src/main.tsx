import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { toast } from "react-toastify";
import axios from "axios";
import { onError } from "@apollo/client/link/error";
import { AuthProvider } from "./context/AuthContext.tsx";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_BACKEND_URL + "/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(async ({ extensions, message, path }) => {
      if (
        (window.location.pathname === "/login" &&
          path?.[0] === "getSubTrusteeQuery") ||
        (window.location.pathname === "/" &&
          path?.[0] === "getSubTrusteeQuery") ||
        (window.location.pathname === "/reset-password" &&
          path?.[0] === "getSubTrusteeQuery")
      ) {
        return;
      } else {
        const token = localStorage.getItem("token");

        const baseBackendUrl =
          import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        const config = {
          method: "post",
          url: `${baseBackendUrl}/main-backend/send-queryError-mail`,
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          data: {
            queryName: path?.[0],
            error: JSON.stringify(extensions),
            message,
            token,
            timestamp: new Date().toISOString(),
          },
        };

        try {
          await axios.request(config);
        } catch (error) {
          console.error("Error sending mail:", error);
        }

        toast.error(message);
      }
    });
  }

  if (networkError) toast.error(`${networkError}`);
});

export const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
);
