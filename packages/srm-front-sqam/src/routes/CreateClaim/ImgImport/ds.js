import intl from 'utils/intl';

const tableDs = () => ({
  selection: false,
  autoQuery: false,
  paging: false,
  fields: [
    {
      label: intl.get('sqam.import.model.claimNum').d('批次号'),
      name: 'claimNum',
    },
    // {
    //   label: intl.get('sqam.product.model.skuCode').d('商品编码'),
    //   name: 'skuCode',
    // },
    {
      label: intl.get('sqam.import.model.fileName').d('文件名称'),
      name: 'fileName',
    },
    {
      label: intl.get('sqam.import.model.fileSize').d('文件大小'),
      name: 'fileSize',
    },
    {
      label: intl.get('sqam.import.model.importResult').d('导入结果'),
      name: 'importStatus',
    },
    {
      label: intl.get('sqam.import.model.importErrorMsg').d('导入报错信息'),
      name: 'exportErrorMsg',
    },
  ],
});

const filterDs = () => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get('sqam.import.model.importStatus').d('校验结果'),
      name: 'importStatus',
      lookupCode: 'QAM_SUCCESS_OR_FAIL',
    },
  ],
});

export { tableDs, filterDs };
