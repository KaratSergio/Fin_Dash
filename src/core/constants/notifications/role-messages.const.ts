export const ROLE_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    CREATED: 'Role created successfully',
    UPDATED: 'Role updated successfully',
    DELETED: 'Role deleted successfully',
    ENABLED: 'Role enabled successfully',
    DISABLED: 'Role disabled successfully',
    PERMISSIONS_UPDATED: 'Permissions updated successfully'
  },
  ERROR: {
    LOAD: 'Failed to load roles',
    CREATE: 'Failed to create role',
    UPDATE: 'Failed to update role',
    DELETE: 'Failed to delete role. Please try again.',
    ENABLE: 'Failed to enable role. Please try again.',
    DISABLE: 'Cannot disable role. This role is assigned to users.',
    UPDATE_PERMISSIONS: 'Failed to update permissions'
  }
} as const;