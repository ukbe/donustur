import { a, ClientSchema, defineData } from '@aws-amplify/backend';
import { addUserToGroup } from '../functions/user/add-user-to-group/resource';
import { removeUserFromGroup } from '../functions/user/remove-user-from-group/resource';
import { updateUserAttributes } from '../functions/user/update-user-attributes/resource';
import { enableUser } from '../functions/user/enable-user/resource';
import { disableUser } from '../functions/user/disable-user/resource';
import { listUsers } from '../functions/user/list-users/resource';
import { getUser } from '../functions/user/get-user/resource';
import { postConfirmation } from '../functions/post-confirmation/resource';

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
      allow.owner().to(['read', 'create']),
      allow.group('admin').to(['read', 'create', 'update', 'delete']),
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
      allow.authenticated().to(['read', 'update']),
      allow.group('admin').to(['read', 'update', 'create', 'delete']),
    ]),

  Redemption: a
    .model({
      userId: a.string().required(),
      itemId: a.string().required(),
      credits: a.integer().required(),
      timestamp: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.owner().to(['read', 'create']),
      allow.group('admin').to(['read']),
    ]),

  Cause: a
    .model({
      name: a.string().required(),
      description: a.string().required(),
      logoUrl: a.string().required(),
      credits: a.integer().required(), // Credits needed to support this cause
      status: a.enum(['active', 'inactive']),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
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
    .authorization((allow) => [
      allow.group("admin"),
      allow.authenticated()
    ])
    
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
})
.authorization((allow) => [allow.resource(postConfirmation)]);

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

export type Schema = ClientSchema<typeof schema>;
