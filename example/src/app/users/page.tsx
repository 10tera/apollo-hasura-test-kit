'use client';

import { useQuery } from '@apollo/client';
import type React from 'react';
import { GetUsersDocument } from '../../generated/graphql/graphql';

const UsersPage: React.FC = () => {
  const { loading, error, data } = useQuery(GetUsersDocument, {
    variables: {
      usersWhere: {
        name: {
          //_neq: 'user1',
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
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Is Active</th>
              <th>Version</th>
              <th>Posts</th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id ?? '-'}</td>
                <td>{user.name ?? '-'}</td>
                <td>
                  {user.is_active !== null && user.is_active !== undefined
                    ? user.is_active.toString()
                    : '-'}
                </td>
                <td>{user.version ?? '-'}</td>
                <td>{user.posts.map((p) => p.post_id).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ul>
    </div>
  );
};

export default UsersPage;
