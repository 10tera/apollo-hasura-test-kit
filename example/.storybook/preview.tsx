import type { Preview } from '@storybook/react';
//import React from "react";
import { ApolloProviderComponent } from '../src/providers/apolloProvider';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ApolloProviderComponent>
        <Story />
      </ApolloProviderComponent>
    ),
  ],
};

export default preview;
