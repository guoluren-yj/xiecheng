export default [
  { code: 'SODR.WORKSPACE_TOBESIGNED_DETAIL' },
  {
    process: {
      processColumns: (columns) => columns,
      processHeaderBtns: (buttons) => buttons,
      signTypeEstimateFn: () => false,
    },
  },
];
