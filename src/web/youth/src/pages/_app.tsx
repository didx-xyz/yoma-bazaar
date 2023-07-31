import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { type AppType } from "next/app";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { config } from "~/lib/react-query-config";
import "~/styles/globals.scss";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType<object> = ({
  Component,
  pageProps: pageProps,
}: AppPropsWithLayout) => {
  // This ensures that data is not shared
  // between different users and requests
  const [queryClient] = useState(() => new QueryClient(config));

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Component {...pageProps} />{" "}
      </Hydrate>
    </QueryClientProvider>
  );
};

export default MyApp;