export const USER_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    LOAD: 'Users loaded successfully',
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
    PASSWORD_CHANGED: 'Password changed successfully'
  },
  ERROR: {
    LOAD: 'Failed to load users',
    CREATE: 'Failed to create user',
    UPDATE: 'Failed to update user',
    DELETE: 'Failed to delete user',
    CHANGE_PASSWORD: 'Failed to change password'
  }
} as const;