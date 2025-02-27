'use client';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import type { FC, ReactNode } from 'react';

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  cache: new InMemoryCache(),
  headers: {
    'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET ?? '',
  },
});

export const ApolloProviderComponent: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
