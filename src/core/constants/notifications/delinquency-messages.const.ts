export const DELINQUENCY_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    LOAD: 'Delinquency data loaded successfully',
    RANGE_CREATED: 'Delinquency range created successfully',
    RANGE_UPDATED: 'Delinquency range updated successfully',
    RANGE_DELETED: 'Delinquency range deleted successfully',
    BUCKET_CREATED: 'Delinquency bucket created successfully',
    BUCKET_UPDATED: 'Delinquency bucket updated successfully',
    BUCKET_DELETED: 'Delinquency bucket deleted successfully'
  },
  ERROR: {
    LOAD: 'Failed to load delinquency data',
    RANGE_CREATE: 'Failed to create delinquency range',
    RANGE_UPDATE: 'Failed to update delinquency range',
    RANGE_DELETE: 'Failed to delete delinquency range',
    BUCKET_CREATE: 'Failed to create delinquency bucket',
    BUCKET_UPDATE: 'Failed to update delinquency bucket',
    BUCKET_DELETE: 'Failed to delete delinquency bucket'
  }
} as const;