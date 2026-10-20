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
    name: 'sourceProjectName',
  },
  {
    name: 'closeTag',
    transformResponse: () => {
      return intl.get('hzero.common.button.close').d('关闭');
    },
  },
  {
    // 立项单来源
    name: 'projectFromMeaning',
  },
  {
    label: intl.get(`ssrc.projectSetup.model.projectSetup.creator`).d('创建人'),
    name: 'createdByName',
  },
  {
    label: intl.get('ssrc.projectSetupApprovalWf.model.approvalWf.unitName').d('部门'),
    name: 'createUnitName',
  },
];

// 关闭原因字段
const closeReasonFields = () => [
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.closeReason`).d('关闭理由'),
    name: 'closedComments',
  },
  {
    label: intl.get(`ssrc.inquiryHall.view.message.close.attachment`).d('关闭附件'),
    name: 'closedAttachmentUuid',
    type: 'attachment',
    bucketName: PRIVATE_BUCKET,
  },
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人'),
    name: 'closedByName',
  },
];

// 基础信息字段
const baseInfoFields = () => [
  {
    label: intl
      .get('ssrc.projectSetupApprovalWf.model.approvalWf.baseInfo.sourceProjectNum')
      .d('寻源项目编号'),
    name: 'sourceProjectNum',
  },
  {
    label: intl
      .get('ssrc.projectSetupApprovalWf.model.approvalWf.baseInfo.sourceProjectName')
      .d('寻源项目名称'),
    name: 'sourceProjectName',
  },
  {
    label: intl.get('ssrc.projectSetup.model.projectSetup.budgetAmount').d('预算金额'),
    name: 'budgetAmount',
  },
  {
    label: intl
      .get(`ssrc.projectSetupApprovalWf.model.approvalWf.baseInfo.totalEstimatedAmount`)
      .d('预估金额'),
    name: 'totalEstimatedAmount',
  },
  {
    label: intl
      .get('ssrc.projectSetupApprovalWf.model.approvalWf.baseInfo.estimatedTimeOfCompletion')
      .d('预计完成时间'),
    name: 'estimatedDate',
  },
  {
    label: intl.get('ssrc.projectSetup.model.projectSetup.sourceDate').d('寻源时间'),
    name: 'sourceDate',
  },
  {
    label: intl.get(`ssrc.projectSetup.model.projectSetup.prejectRemark`).d('项目说明'),
    name: 'sourceProjectRemark',
  },
];

// 采购组织及人员字段
const purAndOrgFields = () => [
  {
    label: intl.get(`ssrc.common.company`).d('公司'),
    name: 'companyName',
  },
  {
    label: intl
      .get('ssrc.projectSetupApprovalWf.model.approvalWf.purOrganizationAndStaff.unitName')
      .d('需求部门'),
    name: 'unitName',
  },
  {
    label: intl.get(`ssrc.projectSetup.model.projectSetup.creator`).d('创建人'),
    name: 'createdByName',
  },
  {
    label: intl
      .get(
        'ssrc.projectSetupApprovalWf.model.approvalWf.purOrganizationAndStaff.purOrganizationName'
      )
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
    transformRequest: (value = '', record) => {
      const internationalTelCode = record?.get('internationalTelCode');
      if (value && internationalTelCode) {
        return `${internationalTelCode}｜${value}`;
      }
      return value;
    },
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

// 寻源方式
const getSourceMethodFields = () => [
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式'),
    name: 'sourceMethodMeaning',
  },
];

// 附件字段
const attachmentFields = () => [
  {
    label: intl.get(`ssrc.common.model.common.viewAttachment`).d('查看附件'),
    name: 'sourceProjectAttachmentUuid',
    type: 'attachment',
    bucketName: PRIVATE_BUCKET,
  },
];

const headerDS = (payload) => {
  const { sourceProjectId, customizeUnitCode } = payload || {};
  return {
    primaryKey: 'sourceProjectId',
    fields: [
      ...headerInfoFields(),
      ...closeReasonFields(),
      ...baseInfoFields(),
      ...purAndOrgFields(),
      ...getSourceMethodFields(),
      ...attachmentFields(),
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { templateInfo = {} },
        } = dataSet || {};
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/project/close/detail/${sourceProjectId}`,
          method: 'GET',
          data: {
            customizeUnitCode,
            ...(templateInfo || {}),
          },
          transformResponse: (res) => {
            const result = JSON.parse(res);
            if (result && !result.failed) {
              return {
                ...result,
                sourceProjectName: `${result.sourceProjectName}-${result.sourceProjectNum}`,
              };
            }
          },
        };
      },
    },
  };
};

// 关联单据
const relatedBillDS = (payload) => {
  const { sourceProjectId } = payload || {};
  return {
    primaryKey: 'sourceQuoteId',
    selection: false,
    fields: [
      {
        label: intl
          .get('ssrc.projectSetupApprovalWf.model.approvalWf.relatedBill.receiptNum')
          .d('单据编号'),
        name: 'sourceNum',
      },
      {
        label: intl
          .get('ssrc.projectSetupApprovalWf.model.approvalWf.relatedBill.receiptName')
          .d('单据名称'),
        name: 'sourceName',
      },
      {
        label: intl
          .get('ssrc.projectSetupApprovalWf.model.approvalWf.relatedBill.shutdownPhase')
          .d('关闭阶段'),
        name: 'closingSourceStatusMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.view.message.close.inquiryListReason`).d('关闭理由'),
        name: 'closedComments',
      },
      {
        label: intl.get(`ssrc.inquiryHall.view.message.close.attachment`).d('关闭附件'),
        name: 'closeAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
      },
      {
        label: intl
          .get('ssrc.projectSetupApprovalWf.model.approvalWf.relatedBill.shutdownStaff')
          .d('关闭人'),
        name: 'closedByName',
      },
      {
        label: intl
          .get('ssrc.projectSetupApprovalWf.model.approvalWf.relatedBill.shutdownTime')
          .d('关闭时间'),
        name: 'closedDate',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/project/close/relation/document/${sourceProjectId}`,
          method: 'GET',
        };
      },
    },
  };
};

// 标段/包信息
const sectionOrPacketInfoDS = (payload) => {
  const { sourceProjectId, customizeUnitCode } = payload || {};
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

// 物料详情
const itemLineDetailDS = (payload) => {
  const { sourceProjectId, customizeUnitCode } = payload || {};
  return {
    primaryKey: 'projectLineItemId',
    selection: false,
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
      },
      {
        name: 'requiredQuantity',
        dynamicProps: {
          label: ({ dataSet }) => {
            const {
              queryParameter: { doubleUnitFlag = {} },
            } = dataSet || {};
            return getQtyName(doubleUnitFlag);
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
            const {
              queryParameter: { doubleUnitFlag = {} },
            } = dataSet || {};
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        name: 'priceBatch',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.estimatedUnitPrice`)
          .d('预算单价(元)'),
        name: 'costPrice',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.estimatedUnitAmount`)
          .d('预算行金额(元)'),
        name: 'totalPrice',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.estimatedPrice`)
          .d('预估单价'),
        name: 'estimatedPrice',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.estimatedAmount`)
          .d('预估行金额'),
        name: 'estimatedAmount',
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
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.executableQuantity`)
          .d('可执行数量'),
        name: 'executableQuantity',
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

// 对供应商要求
const supplierLineTableDS = (payload) => {
  const { sourceProjectId, customizeUnitCode } = payload || {};
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
  const { sourceProjectId, customizeUnitCode } = payload || {};
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

export {
  headerDS,
  relatedBillDS,
  sectionOrPacketInfoDS,
  itemLineDetailDS,
  supplierLineTableDS,
  planLineTableDS,
};
