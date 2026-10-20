import intl from 'utils/intl';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';

import { getQtyName, getUomName } from '@/utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

// 头信息卡片字段
const headerInfoFields = () => [
  {
    // label: intl.get('ssrc.projectSetup.model.projectSetup.projectName').d('项目名称'),
    name: 'sourceProjectNameAndNum',
  },
  {
    label: intl.get(`ssrc.projectSetup.model.projectSetup.creator`).d('创建人'),
    name: 'sourceProjectCreatedByName',
  },
  {
    label: intl.get(`hzero.common.creationDate`).d('创建时间'),
    name: 'creationDate',
  },
];

// 基础信息字段
const getBaseInfoDSFields = () => {
  return [
    {
      label: intl
        .get('ssrc.projectSetup.model.spChange.baseInfo.sourceProjectNum')
        .d('寻源项目编号'),
      name: 'sourceProjectNum',
    },
    {
      label: intl
        .get('ssrc.projectSetup.model.spChange.baseInfo.sourceProjectName')
        .d('寻源项目名称'),
      name: 'sourceProjectName',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.budgetAmount').d('预算金额'),
      name: 'budgetAmount',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`).d('预估金额'),
      name: 'totalEstimatedAmount',
      type: 'number',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.estimatedDate').d('预计完成日期'),
      name: 'estimatedDate',
      type: 'date',
      format: getDateFormat(),
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.sourceDate').d('寻源时间'),
      name: 'sourceDate',
    },
    {
      label: intl.get(`ssrc.sourceTemplate.model.template.subjectMatterRule`).d('标的规则'),
      name: 'subjectMatterRuleMeaning',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.prejectRemark`).d('项目说明'),
      name: 'sourceProjectRemark',
    },
  ];
};

// 采购组织及人员字段
const getPurAndOrgFields = () => {
  return [
    {
      label: intl.get(`ssrc.common.company`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl
        .get('ssrc.projectSetup.model.spChange.purOrganizationAndStaff.unitName')
        .d('需求部门'),
      name: 'unitName',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.creator`).d('创建人'),
      name: 'createdByName',
    },
    {
      label: intl
        .get('ssrc.projectSetup.model.spChange.purOrganizationAndStaff.purOrganizationName')
        .d('采购组织'),
      name: 'purOrganizationName',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.purchaseLov').d('采购员'),
      name: 'purchaserName',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.purchaseCont').d('采购联系人'),
      name: 'purAgent',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.contactMobilephone`).d('联系人电话'),
      name: 'contactMobilephone',
    },
    {
      name: 'internationalTelCode',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.contactMail').d('联系人邮箱'),
      name: 'contactMail',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.projectMember').d('项目成员'),
      name: 'sourceMemberMeaning',
    },
  ];
};

// 寻源要求字段
const getSourceDemandFields = () => {
  return [
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory').d('寻源类别'),
      name: 'secondarySourceCategoryMeaning',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.RFXNodeConfig').d('RFX节点配置'),
      name: 'sourceConfig',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.sourceRequest`).d('寻源方法'),
      name: 'sourceRequest',
      lookupCode: 'SSRC.PROJECT_SOURCE_REQUEST',
    },
    {
      label: intl.get(`ssrc.common.currencyCode`).d('币种'),
      name: 'currencyCode',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.paymentType').d('付款方式'),
      name: 'paymentTypeName',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.paymentTerm').d('付款条款'),
      name: 'paymentTermName',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.depositAmount').d('保证金'),
      name: 'depositAmount',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.evaluatMethod').d('评标办法'),
      name: 'evalMethodName',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.methodRemark`).d('评标办法说明'),
      name: 'methodRemark',
    },
  ];
};

// 附件字段
const getAttachmentFields = () => [
  {
    label: intl.get(`ssrc.common.model.common.viewAttachment`).d('查看附件'),
    name: 'sourceProjectAttachmentUuid',
    bucketName: PRIVATE_BUCKET,
  },
];

// 寻源方式
const getSourceMethodFields = () => [
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式'),
    name: 'sourceMethodMeaning',
  },
];

// 头信息ds
const headerDS = (payload) => {
  const {
    sourceProjectId,
    sourceProjectHistoryId,
    dataVersion,
    pageSourceCategory,
    customizeUnitCode,
  } = payload;
  return {
    fields: [
      ...headerInfoFields(),
      ...getBaseInfoDSFields(),
      ...getPurAndOrgFields(),
      ...getSourceDemandFields(),
      ...getAttachmentFields(),
      ...getSourceMethodFields(),
    ],
    transport: {
      read({ dataSet }) {
        const {
          queryParameter: { templateInfo = {} },
        } = dataSet || {};
        if (pageSourceCategory === 'version' && sourceProjectHistoryId) {
          return {
            url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/${sourceProjectHistoryId}`,
            method: 'GET',
            data: {
              customizeUnitCode,
              dataVersion,
              ...(templateInfo || {}),
            },
          };
        }
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}`,
          method: 'GET',
          data: {
            customizeUnitCode,
            ...(templateInfo || {}),
          },
        };
      },
    },
  };
};

// 物料信息-标的物ds
const itemLineDS = (payload) => {
  const {
    sourceProjectId,
    sourceProjectHistoryId,
    dataVersion,
    pageSourceCategory,
    customizeUnitCode,
  } = payload;
  return {
    primaryKey: 'projectLineItemId',
    selection: false,
    cacheModified: true,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'projectLineItemNum',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.docFlow').d('单据流'),
        name: 'docFlow',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemDescs`).d('物料描述'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specifications`).d('规格'),
        name: 'specifications',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
      },
      {
        name: 'requiredQuantity',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            return getQtyName(dataSet.getState('doubleUnitFlag'));
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'uomName',
        dynamicProps: {
          label: ({ dataSet }) => {
            return getUomName(dataSet.getState('doubleUnitFlag'));
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        name: 'priceBatch',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.estimatedUnitPrice`)
          .d('预算单价(元)'),
        name: 'costPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.estimatedUnitAmount`)
          .d('预算行金额(元)'),
        name: 'totalPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.estimatedPrice`)
          .d('预估单价'),
        name: 'estimatedPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.estimatedAmount`)
          .d('预估行金额'),
        name: 'estimatedAmount',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTemplate`).d('报价模板'),
        name: 'templateName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        name: 'quotationDetail',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'itemRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAttachment`).d('行附件'),
        name: 'itemAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.prNum`)
          .d('采购申请号'),
        name: 'prNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        name: 'prDisplayLineNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人'),
        name: 'requestUserName',
      },
      {
        label: intl.get('ssrc.common.model.common.projectTaskNme').d('项目任务名称'),
        name: 'projectTaskName',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.projectExecutionStatus`)
          .d('立项执行状态'),
        name: 'executingStatusMeaning',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.quantityOccupied`)
          .d('已占用数量'),
        name: 'occupiedQuantity',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.executableQuantity`)
          .d('可执行数量'),
        name: 'executableQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionNum`).d('标段/包编号'),
        name: 'sectionCode',
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionName`).d('标段/包名称'),
        name: 'sectionName',
      },
    ],
    transport: {
      read: ({ data, dataSet }) => {
        const { projectLineSectionId } = data || {};
        const {
          queryParameter: { templateInfo = {} },
        } = dataSet || {};
        if (pageSourceCategory === 'version' && sourceProjectHistoryId) {
          return {
            url: `${prefix}/${getCurrentOrganizationId()}/project-line-items/history/items`,
            method: 'GET',
            data: {
              projectLineSectionId,
              customizeUnitCode,
              sourceProjectId,
              sourceProjectHistoryId,
              dataVersion,
              ...(templateInfo || {}),
            },
          };
        }
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/items`,
          method: 'GET',
          data: {
            projectLineSectionId,
            customizeUnitCode,
            ...(templateInfo || {}),
          },
        };
      },
    },
  };
};

// 标段/包信息ds
const sectionOrPacketInfoDS = (payload) => {
  const {
    sourceProjectId,
    sourceProjectHistoryId,
    dataVersion,
    pageSourceCategory,
    customizeUnitCode,
  } = payload;

  return {
    primaryKey: 'projectLineSectionId',
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'sectionNum',
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionNum`).d('标段/包编号'),
        name: 'sectionCode',
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionName`).d('标段/包名称'),
        name: 'sectionName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.viewItemDetail`).d('物料'),
        name: 'viewMaterial',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'sectionRemark',
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionAttachmentUuid`).d('附件'),
        name: 'sectionAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { templateInfo = {} },
        } = dataSet || {};
        if (pageSourceCategory === 'version' && sourceProjectHistoryId) {
          return {
            url: `${prefix}/${getCurrentOrganizationId()}/project-line-sections/history/list`,
            method: 'GET',
            data: {
              customizeUnitCode,
              sourceProjectId,
              sourceProjectHistoryId,
              dataVersion,
              ...(templateInfo || {}),
            },
          };
        }
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/project-line-sections/${sourceProjectId}`,
          method: 'GET',
          data: {
            customizeUnitCode,
            ...(templateInfo || {}),
          },
        };
      },
    },
  };
};

// 对供应商要求
const supplierLineTableDS = (payload) => {
  const {
    sourceProjectId,
    sourceProjectHistoryId,
    dataVersion,
    pageSourceCategory,
    customizeUnitCode,
  } = payload || {};
  return {
    primaryKey: 'projectLineSupplierId',
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        name: 'supplierCategoryDescription',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        name: 'stageDescription',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        name: 'contactName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        name: 'contactMobilephone',
      },
      {
        name: 'internationalTelCode',
      },
      {
        label: intl.get('ssrc.projectSetup.model.projectSetup.contactMail').d('联系人邮箱'),
        name: 'contactMail',
      },
      {
        label: intl.get(`ssrc.inquiryHall.view.message.button.allotSection`).d('分配标段'),
        name: 'allocatedLot',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { templateInfo = {} },
        } = dataSet || {};
        if (pageSourceCategory === 'version' && sourceProjectHistoryId) {
          return {
            url: `${prefix}/${getCurrentOrganizationId()}/project-line-suppliers/history/suppliers`,
            method: 'GET',
            data: {
              customizeUnitCode,
              sourceProjectId,
              sourceProjectHistoryId,
              dataVersion,
              ...(templateInfo || {}),
            },
          };
        }
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/suppliers`,
          method: 'GET',
          data: {
            customizeUnitCode,
            ...(templateInfo || {}),
          },
        };
      },
    },
  };
};

// 项目计划ds
const planLineTableDS = (payload) => {
  const {
    sourceProjectId,
    sourceProjectHistoryId,
    dataVersion,
    pageSourceCategory,
    customizeUnitCode,
  } = payload || {};
  return {
    primaryKey: 'projectLinePlanId',
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'projectLinePlanNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectStage`).d('项目阶段'),
        name: 'projectStageMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.planCompleteDate`).d('计划完成日期'),
        name: 'planCompleteDate',
        type: 'date',
        format: getDateFormat(),
      },
    ],
    transport: {
      read({ dataSet }) {
        const {
          queryParameter: { templateInfo = {} },
        } = dataSet || {};
        if (pageSourceCategory === 'version' && sourceProjectHistoryId) {
          return {
            url: `${prefix}/${getCurrentOrganizationId()}/project-line-plans/history/plans`,
            method: 'GET',
            data: {
              customizeUnitCode,
              sourceProjectId,
              sourceProjectHistoryId,
              dataVersion,
              ...(templateInfo || {}),
            },
          };
        }
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/plans`,
          method: 'GET',
          data: {
            customizeUnitCode,
            ...(templateInfo || {}),
          },
        };
      },
    },
  };
};

export { headerDS, itemLineDS, sectionOrPacketInfoDS, supplierLineTableDS, planLineTableDS };
