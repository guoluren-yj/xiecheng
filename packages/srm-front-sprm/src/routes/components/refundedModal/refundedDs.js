const refundedDs = () => {
  return {
    autoCreate: true,
    paging: false,
    fields: [
      {
        name: 'backToUnassignReason',
        type: 'string',
        required: true,
      },
    ],
  };
};

export { refundedDs };
