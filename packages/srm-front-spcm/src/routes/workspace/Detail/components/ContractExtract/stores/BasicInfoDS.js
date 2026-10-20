import intl from 'utils/intl';

// 伙伴信息
export const partnerCardDS = () => {
  return {
    paging: false,
    primaryKey: 'partnerId',
    fields: [
      {
        label: intl.get(`entity.company.code`).d('公司编码'),
        type: 'string',
        name: 'companyNum',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`entity.company.name`).d('公司名称'),
      },
      {
        name: 'legalRepName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.legalRepName`).d('代表人'),
      },
      {
        label: intl.get(`spcm.common.model.common.unifiedSocialCode`).d('统一社会信用代码'),
        name: 'unifiedSocialCode',
        type: 'string',
      },
    ],
  };
};

// 标的信息
export const pcSubjectCardDS = () => {
  return {
    paging: false,
    primaryKey: 'pcSubjectId',
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`spcm.common.model.lineNum`).d('行号'),
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl.get(`spcm.common.model.invOrganizationId`).d('库存组织'),
      },
      {
        name: 'categoryName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
      },
      {
        name: 'uomCodeAndName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      },
      {
        name: 'quantity',
        label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        type: 'number',
      },
    ],
  };
};

// 阶段
export const pcStageCardDS = () => {
  return {
    paging: false,
    primaryKey: 'pcStageId',
    fields: [
      {
        name: 'stageNo',
        type: 'number',
        label: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
      },
      {
        name: 'stageCode',
        type: 'string',
        label: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
      },
      {
        name: 'stageName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
      },
      {
        name: 'milestoneTime',
        type: 'date',
        label: intl.get(`spcm.common.model.common.milestoneTime`).d('里程碑时间'),
      },
      {
        name: 'supplierCurrencyCode',
        label: intl.get(`spcm.common.model.common.milestoneTime`).d('里程碑时间'),
      },
      {
        name: 'payRatio',
        type: 'number',
        label: `${intl.get(`spcm.common.model.common.payRatio`).d('付款比例')}(%)`,
      },
      {
        name: 'costQuantity',
        type: 'number',
        label: intl.get(`spcm.common.model.common.supplierCostQuantity`).d('原币费用'),
      },
    ],
  };
};

// 业务条款
export const businessTermsCardDS = () => {
  return {
    paging: false,
    primaryKey: 'termId',
    fields: [
      {
        name: 'termTypeCode',
        type: 'string',
        label: intl.get(`spcm.purchaseRequisitionCreation.model.termTypeCode`).d('业务条款编码'),
      },
      {
        name: 'termTypeName',
        type: 'string',
        label: intl.get(`spcm.purchaseRequisitionCreation.model.termTypeName`).d('业务条款名称'),
      },
      {
        name: 'termContent',
        type: 'string',
        label: intl.get(`spcm.purchaseRequisitionCreation.model.termContent`).d('业务条款内容'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get(`spcm.purchaseRequisitionCreation.model.termRemark`).d('业务条款说明'),
      },
    ],
  };
};
