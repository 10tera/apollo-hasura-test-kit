import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import type { Meta, StoryObj } from '@storybook/react';
import { mockQueryResult } from 'apollo-hasura-test-kit';
import {
  GetUsersDocument,
  type GetUsersQuery,
  type GetUsersQueryVariables,
} from '../../generated/graphql/graphql';
import UsersPage from './page';

const meta = {
  component: UsersPage,
} satisfies Meta<typeof UsersPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const mock = {
  request: {
    query: GetUsersDocument,
  },
  maxUsageCount: Number.POSITIVE_INFINITY,
  variableMatcher: () => true,
  result: (variables) => {
    const data: GetUsersQuery = {
      users: [
        {
          name: 'user1',
          is_active: true,
          user_id: 'user_1',
          version: 1,
          posts: [
            {
              post_id: 'post_1',
            },
            {
              post_id: 'post_2',
            },
          ],
        },
        {
          name: 'user2',
          is_active: true,
          user_id: 'user_2',
          version: 1,
          posts: [
            {
              post_id: 'post_1',
            },
          ],
        },
        {
          name: 'user3',
          is_active: false,
          user_id: 'user_3',
          version: 2,
          posts: [
            {
              post_id: 'post_1',
            },
          ],
        },
      ],
    };

    return {
      data: mockQueryResult<GetUsersQuery, GetUsersQueryVariables>(
        data,
        variables,
        {
          users: {
            where: 'usersWhere',
          },
        },
      ),
    };
  },
  // newData: (variables) =>
} satisfies MockedResponse<GetUsersQuery>;

export const Sample: Story = {
  decorators: [
    (Story) => (
      <MockedProvider mocks={[mock]}>
        <Story />
      </MockedProvider>
    ),
  ],
};
