export default [
  { code: 'SODR.WORKSPACE_MAINTENANCE_CATALOGUE' },
  {
    process: {
      processColumns: (columns) => columns,
    },
  },
  {
    events: {
      async beforSubmit() {
        return true;
      },
    },
  },
];
