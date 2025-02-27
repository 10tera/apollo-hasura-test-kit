import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: {
    [process.env.HASURA_GRAPHQL_URL ?? '']: {
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? '',
      },
    },
  },
  documents: ['graphql/**/*.graphql'],
  generates: {
    './src/generated/graphql/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
};

export default config;
