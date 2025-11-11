export const OFFICE_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    CREATED: 'Office created successfully',
    UPDATED: 'Office updated successfully',
    TEMPLATE_UPLOADED: 'Template uploaded successfully',
    UPDATED_BY_EXTERNAL_ID: 'Office updated successfully'
  },
  ERROR: {
    LOAD: 'Failed to load offices',
    LOAD_TEMPLATE: 'Failed to load office template',
    CREATE: 'Failed to create office',
    UPDATE: 'Failed to update office',
    UPLOAD_TEMPLATE: 'Failed to upload template',
    GET_BY_EXTERNAL_ID: 'Failed to get office by external ID',
    UPDATE_BY_EXTERNAL_ID: 'Failed to update office by external ID'
  }
} as const;