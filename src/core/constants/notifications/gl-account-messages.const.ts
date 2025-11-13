export const GL_ACCOUNT_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    LOAD: 'GL accounts loaded successfully',
    TEMPLATE_LOAD: 'GL template loaded successfully',
    CREATED: 'GL account created successfully',
    UPDATED: 'GL account updated successfully',
    DELETED: 'GL account deleted successfully'
  },
  ERROR: {
    LOAD: 'Failed to load GL accounts',
    TEMPLATE_LOAD: 'Failed to load GL template',
    CREATE: 'Failed to create GL account',
    UPDATE: 'Failed to update GL account',
    DELETE: 'Failed to delete GL account'
  }
} as const;