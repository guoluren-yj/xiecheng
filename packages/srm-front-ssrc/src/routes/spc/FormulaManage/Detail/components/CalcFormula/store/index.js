const FieldDS = {
  primaryKey: 'id',
  autoQuery: false,
  selection: false,
  blockNode: true,
  parentField: 'parentId',
  expandField: 'expand',
  idField: 'id',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'expand', type: 'boolean' },
    { name: 'parentId', type: 'string' },
  ],
};

export { FieldDS };
