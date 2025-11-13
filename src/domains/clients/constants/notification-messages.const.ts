export const CLIENT_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    CREATED: 'Client created successfully',
    UPDATED: 'Client updated successfully',
    DELETED: 'Client deleted successfully',
    ACTIVATED: 'Client activated successfully',
    DEACTIVATED: 'Client deactivated successfully',
    TRANSFER_PROPOSED: 'Client transfer proposed successfully',
    TRANSFER_ACCEPTED: 'Client transfer accepted successfully',
    TRANSFER_WITHDRAWN: 'Client transfer withdrawn successfully',
    TRANSFER_REJECTED: 'Client transfer rejected successfully'
  },
  ERROR: {
    LOAD: 'Failed to load clients',
    CREATE: 'Failed to create client',
    UPDATE: 'Failed to update client',
    DELETE: 'Failed to delete client. Please try again.',
    ACTIVATE: 'Failed to activate client. Please try again.',
    DEACTIVATE: 'Cannot deactivate client. The client has active accounts.',
    TRANSFER_PROPOSE: 'Failed to propose client transfer',
    TRANSFER_ACCEPT: 'Failed to accept client transfer',
    TRANSFER_WITHDRAW: 'Failed to withdraw client transfer',
    TRANSFER_REJECT: 'Failed to reject client transfer'
  }
} as const;