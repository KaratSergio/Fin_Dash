export const LOAN_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    LOAD: 'Loans loaded successfully',
    CREATED: 'Loan created successfully',
    UPDATED: 'Loan updated successfully',
    DELETED: 'Loan deleted successfully',
    APPROVED: 'Loan approved successfully',
    DISBURSED: 'Loan disbursed successfully',
    REPAID: 'Loan repayment processed successfully',
    REJECTED: 'Loan rejected successfully',
    UNDO_APPROVAL: 'Loan approval undone successfully'
  },
  ERROR: {
    LOAD: 'Failed to load loans',
    CREATE: 'Failed to create loan',
    UPDATE: 'Failed to update loan',
    DELETE: 'Failed to delete loan',
    APPROVE: 'Failed to approve loan',
    DISBURSE: 'Failed to disburse loan',
    REPAY: 'Failed to process loan repayment',
    REJECT: 'Failed to reject loan',
    UNDO_APPROVAL: 'Failed to undo loan approval'
  }
} as const;


export const LOAN_CHARGES_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    LOAD: 'Loan charges loaded successfully',
    CREATED: 'Loan charge created successfully',
    UPDATED: 'Loan charge updated successfully',
    DELETED: 'Loan charge deleted successfully',
    PAID: 'Loan charge paid successfully',
    WAIVED: 'Loan charge waived successfully',
    ADJUSTED: 'Loan charge adjusted successfully'
  },
  ERROR: {
    LOAD: 'Failed to load loan charges',
    CREATE: 'Failed to create loan charge',
    UPDATE: 'Failed to update loan charge',
    DELETE: 'Failed to delete loan charge',
    PAY: 'Failed to pay loan charge',
    WAIVE: 'Failed to waive loan charge',
    ADJUST: 'Failed to adjust loan charge'
  }
} as const;


export const LOAN_PRODUCTS_NOTIFICATION_MESSAGES = {
  SUCCESS: {
    LOAD: 'Loan products loaded successfully',
    TEMPLATE_LOAD: 'Loan product template loaded successfully',
    CREATED: 'Loan product created successfully',
    UPDATED: 'Loan product updated successfully'
  },
  ERROR: {
    LOAD: 'Failed to load loan products',
    TEMPLATE_LOAD: 'Failed to load loan product template',
    CREATE: 'Failed to create loan product',
    UPDATE: 'Failed to update loan product'
  }
} as const;