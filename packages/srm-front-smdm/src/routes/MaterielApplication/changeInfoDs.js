import intl from 'utils/intl';

// 预审中列表
const changeInfoDs = () => ({
  autoQuery: false,
  autoCreate: false,
  paging: false,
  dataToJSON: 'all',
  fields: [
    {
      name: 'itemReqHeaderNum',
      type: 'string',
      label: intl.get('smdm.materielApplication.model.materiel.itemReqHeaderNum').d('物料申请单号'),
    },
    {
      name: 'reqStatus',
      type: 'string',
      lookupCode: 'SMDM.ITEM_REQ_STATUS',
      label: intl.get(`hzero.common.button.status`).d('状态'),
    },
    {
      name: 'createdName',
      type: 'string',
      label: intl.get(`smdm.materielApplication.model.materiel.createdName`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`smdm.materielApplication.model.materiel.creationDate`).d('创建时间'),
    },
    {
      name: 'versionNumber',
      label: intl.get(`smdm.materiel.model.materiel.version`).d('版本'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
    },
    {
      name: 'originItemCode',
      type: 'string',
      label: intl.get('smdm.materiel.model.materiel.originItemCode').d('原始物料编码'),
    },
    {
      name: 'sourceCode',
      type: 'string',
      lookupCode: 'SMDM.ITEM_REQ_SOURCE',
      label: intl.get(`smdm.materiel.model.materiel.sourceCode`).d('数据来源'),
    },
  ],
});

export { changeInfoDs };
