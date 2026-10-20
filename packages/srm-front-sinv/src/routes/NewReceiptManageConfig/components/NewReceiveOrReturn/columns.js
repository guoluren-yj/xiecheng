const tableColumns = (readOnly) => {
  const columns = [
    {
      name: 'returnedFlag',
      width: 100,
      fixed: 'left',
      editor: !readOnly,
    },
    {
      name: 'coopType',
      width: 80,
      fixed: 'left',
      editor: !readOnly,
    },
    {
      name: 'approveRuleCode',
      width: 100,
      fixed: 'left',
      editor: !readOnly,
    },
    {
      name: 'supplierConfirmType',
      width: 140,
      editor: !readOnly,
    },
    {
      name: 'exportExtEnable',
      width: 120,
      editor: !readOnly,
    },
    {
      name: 'itfRcvConfirmExport',
      width: 190,
      editor: !readOnly,
    },
  ];

  return columns;
};

export default tableColumns;
