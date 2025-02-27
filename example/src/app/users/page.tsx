'use client';

import { useQuery } from '@apollo/client';
import type React from 'react';
import { GetUsersDocument } from '../../generated/graphql/graphql';

const UsersPage: React.FC = () => {
  const { loading, error, data } = useQuery(GetUsersDocument, {
    variables: {
      usersWhere: {
        user_id: {
          _in: ['user_1', 'user_2'],
        },
      },
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data?.users.map((user) => (
          <li key={user.user_id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
