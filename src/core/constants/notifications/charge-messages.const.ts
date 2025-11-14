export const CHARGES_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    LOAD: 'Charges loaded successfully',
    TEMPLATE_LOAD: 'Charge template loaded successfully',
    CREATED: 'Charge created successfully',
    UPDATED: 'Charge updated successfully',
    DELETED: 'Charge deleted successfully'
  },
  ERROR: {
    LOAD: 'Failed to load charges',
    TEMPLATE_LOAD: 'Failed to load charge template',
    CREATE: 'Failed to create charge',
    UPDATE: 'Failed to update charge',
    DELETE: 'Failed to delete charge'
  }
} as const;