import intl from 'utils/intl';

const getJumpUrl = ({ newRegisterFlag = false, name = '', menuPermissionsFlag = false } = {}) =>
  [
    {
      name: 'sendInvite',
      url: newRegisterFlag ? '/sslm/supplier-invite-manage/list' : '/spfm/company-search/supplier',
    },
    {
      name: 'updateSupplier',
      url: menuPermissionsFlag
        ? '/sslm/supplier-inform-change-new/detail/create'
        : '/sslm/supplier-inform-change/list',
    },
    {
      name: 'viewSupplier',
      url: '/sslm/supplier-workbench/list',
    },
  ].find(n => n.name === name);

// 全部建立合作伙伴
const getAllPartnerOptionList = ({ step = [] } = {}) => {
  const optionList = [
    {
      value: 'continueEntry',
      title: intl
        .get('sslm.supplierEntry.view.supplierEntry.continueEntry')
        .d('创建新的销售员账号，继续录入'),
      hidden: !step.includes('continueEntry'),
    },
    {
      value: 'updateSupplier',
      title: intl
        .get('sslm.supplierEntry.view.supplierEntry.updateSupplier')
        .d('变更供应商信息，前往【供应商信息变更】'),
      hidden: !step.includes('updateSupplier'),
    },
    {
      value: 'viewSupplier',
      title: intl
        .get('sslm.supplierEntry.view.supplierEntry.viewSupplier')
        .d('查看供应商信息，前往【供应商管理工作台】'),
      hidden: !step.includes('viewSupplier'),
    },
  ].filter(i => !i.hidden);
  return optionList;
};

// 有协同
const getCoordinationOptionList = ({ step = [] } = {}) => {
  const optionList = [
    {
      value: 'continueEntry',
      title: intl
        .get('sslm.supplierEntry.view.supplierEntry.continueEntry')
        .d('创建新的销售员账号，继续录入'),
      hidden: !step.includes('continueEntry'),
    },
    {
      value: 'sendInvite',
      title: intl
        .get('sslm.supplierEntry.view.supplierEntry.sendInvite')
        .d('向已注册销售员发送邀约，前往【发现供应商】'),
      hidden: !step.includes('sendInvite'),
    },
  ].filter(i => !i.hidden);
  return optionList;
};

// 部分合作展示公司（包括有协同，无协同）
const getCooperateCompanyOptionList = ({ step = [] } = {}) => {
  const optionList = [
    {
      value: 'createPartnership',
      title: intl
        .get('sslm.supplierEntry.view.supplierEntry.createPartnership')
        .d('新增合作关系，并创建新的销售员账号'),
      hidden: !step.includes('createPartnership'),
    },
    {
      value: 'createSaleAccount',
      title: intl
        .get('sslm.supplierEntry.view.supplierEntry.createSaleAccount')
        .d('不增加合作关系，仅创建新的销售员账号'),
      hidden: !step.includes('createSaleAccount'),
    },
    {
      value: 'updateSupplier',
      title: intl
        .get('sslm.supplierEntry.view.supplierEntry.updateSupplier')
        .d('变更供应商信息，前往【供应商信息变更】'),
      hidden: !step.includes('updateSupplier'),
    },
    {
      value: 'viewSupplier',
      title: intl
        .get('sslm.supplierEntry.view.supplierEntry.viewSupplier')
        .d('查看供应商信息，前往【供应商管理工作台】'),
      hidden: !step.includes('viewSupplier'),
    },
  ].filter(i => !i.hidden);
  return optionList;
};

// allPartnerShip： 全部合作标识 ，coordinationFlag: 协同标识
const getOperateTitleConfig = ({
  allPartnerShipFlag,
  coordinationFlag,
  companyName,
  companyCount,
  showStep = false,
} = {}) =>
  [
    {
      // 唯一存在且全部合作关系
      tipsTitle: intl
        .get('sslm.supplierEntry.view.title.allPartnerShip')
        .d(
          '您录入的企业已和当前租户下的所有公司建立合作伙伴关系，无需重复录入。请确认需要进行的操作类型'
        ),
      showFlag: allPartnerShipFlag,
    },
    {
      // 部分合作，有协同
      tipsTitle: intl
        .get('sslm.supplierEntry.view.title.coordination')
        .d('您录入的企业已有销售员进行过认证，请确认需要进行的操作类型'),
      showFlag: coordinationFlag && !allPartnerShipFlag,
    },
    {
      // 部分合作，不协同
      tipsTitle: intl
        .get('sslm.supplierEntry.view.title.uncoordination', {
          companyName,
          companyCount,
        })
        .d(
          `您录入的企业已与【${companyName}】等【${companyCount}】家公司建立合作伙伴关系，其余公司还未合作。请确认需要进行的操作为`
        ),
      showFlag: (!coordinationFlag && !allPartnerShipFlag) || showStep,
    },
    {},
  ].find(n => n.showFlag);

const getTabs = () => [
  {
    key: 'submitted',
    tab: intl.get('sslm.supplierEntry.view.tabPane.submitted').d('待提交'),
    searchBarCode: 'SSLM.SUPPLIER_ENTRY_LIST.SEARCH_SUBMITTED',
    countCode: 'newCount',
  },
  {
    key: 'approvaling',
    tab: intl.get('sslm.supplierEntry.view.tabPane.approvaling').d('审批中'),
    searchBarCode: 'SSLM.SUPPLIER_ENTRY_LIST.SEA_APPROVALING',
    countCode: 'apprvingCount',
  },
  {
    key: 'all',
    tab: intl.get('sslm.supplierEntry.view.tabPane.all').d('全部'),
    searchBarCode: 'SSLM.SUPPLIER_ENTRY_LIST.SEARCH_ALL',
    countCode: 'allCount',
  },
];

// 判断境内外还是个人 0-境外 1-境内 2-个人
const getDomesticForeignRelation = record => {
  if (record) {
    const certificationType = record.get('certificationType');
    const certificationRegionCode = record.get('certificationRegionId')?.countryCode;
    if (certificationType === '1' && certificationRegionCode !== 'CN') {
      return '0';
    } else if (certificationType === '1' && certificationRegionCode === 'CN') {
      return '1';
    } else if (certificationType === '2') {
      return '2';
    }
  }
};

export {
  getOperateTitleConfig,
  getTabs,
  getAllPartnerOptionList,
  getCoordinationOptionList,
  getCooperateCompanyOptionList,
  getJumpUrl,
  getDomesticForeignRelation,
};
