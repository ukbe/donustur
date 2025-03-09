import { a, defineData } from '@aws-amplify/backend';
import { addUserToGroup } from '../functions/user/add-user-to-group/resource';
import { removeUserFromGroup } from '../functions/user/remove-user-from-group/resource';
import { updateUserAttributes } from '../functions/user/update-user-attributes/resource';
import { enableUser } from '../functions/user/enable-user/resource';
import { disableUser } from '../functions/user/disable-user/resource';
import { listUsers } from '../functions/user/list-users/resource';
import { getUser } from '../functions/user/get-user/resource';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new field to your Todo table below and see it reflected in your API.
=========================================================================*/

const schema = a.schema({
  Bin: a
    .model({
      name: a.string().required(),
      location: a.string().required(),
      credits: a.integer().required(),
      status: a.enum(['active', 'inactive']),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  Scan: a
    .model({
      userId: a.string().required(),
      binId: a.string().required(),
      binLocation: a.string().required(),
      credits: a.integer().required(),
      timestamp: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.owner().to(['read']),
      allow.group('admin').to(['read']),
    ]),

  User: a
    .model({
      email: a.string().required(),
      name: a.string(),
      totalCredits: a.integer().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner().to(['read', 'update']),
      allow.group('admin').to(['read', 'update']),
    ]),

  Redemption: a
    .model({
      userId: a.string().required(),
      itemId: a.string().required(),
      credits: a.integer().required(),
      timestamp: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.owner().to(['read']),
      allow.group('admin').to(['read']),
    ]),

  // User management operations
  adminListUsers: a
    .query()
    .authorization((allow) => [allow.group("admin")])
    .handler(a.handler.function(listUsers))
    .returns(a.json()),

  adminGetUser: a
    .query()
    .arguments({
      id: a.string().required(),
    })
    .authorization((allow) => [allow.group("admin")])
    .handler(a.handler.function(getUser))
    .returns(a.json()),

  updateUserAttributes: a
    .mutation()
    .arguments({
      id: a.string().required(),
      attributes: a.json().required(),
    })
    .authorization((allow) => [allow.group("admin")])
    .handler(a.handler.function(updateUserAttributes))
    .returns(a.json()),

  addUserToGroup: a
    .mutation()
    .arguments({
      userId: a.string().required(),
      groupName: a.string().required(),
    })
    .authorization((allow) => [allow.group("admin")])
    .handler(a.handler.function(addUserToGroup))
    .returns(a.json()),

  removeUserFromGroup: a
    .mutation()
    .arguments({
      userId: a.string().required(),
      groupName: a.string().required(),
    })
    .authorization((allow) => [allow.group("admin")])
    .handler(a.handler.function(removeUserFromGroup))
    .returns(a.json()),

  enableUser: a
    .mutation()
    .arguments({
      id: a.string().required(),
    })
    .authorization((allow) => [allow.group("admin")])
    .handler(a.handler.function(enableUser))
    .returns(a.json()),

  disableUser: a
    .mutation()
    .arguments({
      id: a.string().required(),
    })
    .authorization((allow) => [allow.group("admin")])
    .handler(a.handler.function(disableUser))
    .returns(a.json())
});

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
