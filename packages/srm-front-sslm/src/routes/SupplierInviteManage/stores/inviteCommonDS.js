import intl from 'utils/intl';

// 邀约头
const inviteHeaderDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.companyName').d('邀请方'),
    },
    {
      name: 'levelTypeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('spfm.disposeInvite.model.topinfo.levelTypeFlag').d('是否集团级'),
    },
    {
      name: 'privateFlag',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.privateFlag').d('私有化'),
    },
    {
      name: 'autosendInvestigateFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('spfm.disposeInvite.model.topinfo.autosendInvestigateFlag')
        .d('是否发送调查表'),
    },
    {
      name: 'investigateTypeMeaning',
      label: intl.get('spfm.disposeInvite.model.topinfo.investigateType').d('调查表类型'),
    },
    {
      name: 'templateName',
      label: intl.get('spfm.disposeInvite.model.topinfo.templateName').d('调查表模板'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.categoryName').d('准入品类'),
    },
    {
      name: 'purchaseAgent',
      label: intl.get('spfm.disposeInvite.model.topinfo.purchaseAgent').d('采购员'),
    },
    {
      name: 'multiSupplierCategoryDesc',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.multiSupplierCategoryDesc').d('供应商分类'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('spfm.disposeInvite.model.topinfo.creationDate').d('邀请时间'),
    },
    {
      name: 'roleType',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.roleType').d('供应商角色'),
    },
    {
      name: 'inviteRegisterRemark',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.inviteRegisterRemark').d('邀请备注'),
    },
  ],
  transport: {
    // read: ({ data, params }) => {
    //   const { reqStatusList, ...others } = data;
    //   return {
    //     url: `${SRM_SSLM}/v1/${organizationId}/enterprise-change/enteringReq`,
    //     method: 'GET',
    //     params: {
    //       ...params,
    //     },
    //     data: {
    //       ...others,
    //       reqStatusList: reqStatusList?.join(',') || null,
    //       customizeUnitCode:
    //         'SSLM.SUPPLIER_ENTRY_LIST.SEARCH_ALL,SSLM.SUPPLIER_ENTRY_LIST.TABLE_LIST,SSLM.SUPPLIER_ENTRY_LIST.SEA_APPROVALING,SSLM.SUPPLIER_ENTRY_LIST.SEARCH_SUBMITTED',
    //     },
    //   };
    // },
  },
  events: {
    // load: ({ dataSet }) => {
    //   dataSet.forEach((record) => {
    //     if (record.data.reqStatus !== 'NEW' && record.data.reqStatus !== 'REJECTED') {
    //       Object.assign(record, { selectable: false });
    //     }
    //   });
    // },
  },
});

export { inviteHeaderDS };
