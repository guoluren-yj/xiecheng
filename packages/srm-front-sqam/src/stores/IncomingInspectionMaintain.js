import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const promptCode = 'sqam.incomingInspectionQuery';
const headerDS = () => {
  return {
    selection: false,
    queryFields: [],
    fields: [
      /**
       * 基本信息
       */
      {
        name: 'inspectionNum',
        type: 'string',
        label: intl.get(`${promptCode}.view.message.purchaseRequest.inspectionNum`).d('检验批号'),
      },
      {
        name: 'creationDate',
        type: 'date',
        format: 'YYYY-MM-DD',
        label: intl.get(`hzero.common.date.creation`).d('创建日期'),
      },
      {
        name: 'createdName',
        type: 'string',
        label: intl.get(`entity.roles.creator`).d('创建人'),
      },
      {
        name: 'inspectionStateMeaning',
        type: 'string',
        label: intl.get(`hzero.common.status`).d('状态'),
      },
      {
        name: 'dataSourceMeaning',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.documentSource`)
          .d('单据来源'),
      },
      {
        name: 'inspectionTypeMeaning',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionTypeMeaning`)
          .d('检验类型'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'organizationName',
        type: 'string',
        label: intl.get(`entity.organization.class.inventory`).d('库存组织'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'supplierName',
        type: 'string',
        label: intl.get(`entity.supplier.tag`).d('供应商'),
      },
      {
        name: 'poNum',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.poNum`)
          .d('采购订单号'),
      },
      {
        name: 'asnNum',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.asnNum`)
          .d('送货单号'),
      },
      {
        name: 'transactionNum',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.transactionNum`)
          .d('事务编码'),
      },
      {
        name: 'problemNum',
        type: 'string',
        label: intl
          .get(`${promptCode}.model.incomingInspectionQuery.relatedQualityRectification`)
          .d('关联质量整改'),
      },
      {
        name: 'inspectionRemark',
        type: 'string',
        label: intl.get(`hzero.common.remark`).d('备注'),
      },
      /**
       * 检验数据
       */
      {
        name: 'startDate',
        type: 'date',
        format: 'YYYY-MM-DD',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.startDate`)
          .d('检验开始日期'),
      },
      {
        name: 'endDate',
        type: 'date',
        format: 'YYYY-MM-DD',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.endDate`)
          .d('检验结束日期'),
      },
      {
        name: 'responsiblePerson',
        type: 'string',
        label: intl.get(`sqam.common.model.8d.chargeName`).d('责任人'),
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get(`entity.item.code`).d('物料编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get(`entity.item.name`).d('物料名称'),
      },
      {
        name: 'categoryName',
        type: 'string',
        label: intl.get(`${promptCode}.model.incomingInspectionQuery.itemCatalog`).d('物料分类'),
      },
      {
        name: 'batchQuantity',
        type: 'number',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.batchQuantity`)
          .d('检验批数量'),
      },
      {
        name: 'actualQuantity',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.actualQuantity`)
          .d('实际批量'),
      },
      {
        name: 'sampleSize',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.sampleSize`)
          .d('采样大小'),
      },
      {
        name: 'uomCodeAndName',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.unitMeasurement`)
          .d('采样计量单位'),
      },
      {
        name: 'destroyQuantity',
        type: 'number',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.destroyQuantity`)
          .d('检验破坏数量'),
      },
      {
        name: 'badQuantity',
        type: 'number',
        label: intl.get(`${promptCode}.model.incomingInspectionQuery.badQuantity`).d('不良品数量'),
      },
      {
        name: 'checkAttachmentUuid',
        type: 'attachment',
        label: intl.get(`${promptCode}.model.incomingInspectionQuery.detectionGuide`).d('检测指导'),
      },
      /**
       * 检测分析
       */
      {
        name: 'assessmentResultMeaning',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.assessmentResult`)
          .d('评估结果'),
      },
      {
        name: 'decisionResultMeaning',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.decisionResult`)
          .d('决策结果'),
      },
      {
        name: 'qualityScore',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.qualityScore`)
          .d('质量记分'),
      },
      {
        name: 'badCategoryMeaning',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.badCategory`)
          .d('不良分类'),
      },
      {
        name: 'badReason',
        type: 'string',
        label: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.badReason`)
          .d('不良原因'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ data }) => {
        const { id } = data;
        return {
          // url: `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/detail/${id}?customizeUnitCode=${customizeUnitCode}`,
          url: `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/detail/${id}`,
          method: 'GET',
          params: {
            ...data,
            customizeUnitCode: [
              'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.ANALYSIS',
              'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.BASIC',
              'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.DATA',
            ].join(),
          },
        };
      },
    },
  };
};
const tableDS = () => ({
  autoQuery: false,
  selection: 'multiple',
  // primaryKey: 'detectId',
  // queryFields: '',
  fields: [
    {
      name: 'detectWeighting',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.detectWeighting`)
        .d('加权'),
    },
    {
      name: 'defectCategory',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectCategory`)
        .d('缺陷分类'),
    },
    {
      name: 'defectExplain',
      type: 'string',
      label: intl.get('sqam.common.model.qualityRectification.explain').d('说明'),
    },
    {
      name: 'defectResult',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectResult`)
        .d('结果'),
    },
    {
      name: 'defectFeatures',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionFeatures`)
        .d('检验特性的短文本'),
    },
    {
      name: 'inconformityQuantity',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.inconformityQuantity`)
        .d('不符合'),
    },
    {
      name: 'defectAssessment',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectAssessment`)
        .d('评估'),
    },
    {
      name: 'defectEndDate',
      type: 'date',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.endDate`)
        .d('检验结束日期'),
    },
    {
      name: 'detectRemark',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.detectRemark`)
        .d('检验描述'),
    },
  ],
  transport: {
    /**
     * 查询
     */
    read: ({ data }) => {
      const { id } = data;
      return {
        url: `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/incoming_inspection_detect/${id}`,
        method: 'GET',
        params: {
          ...data,
          customizeUnitCode: 'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.DETECT',
        },
      };
    },
  },
});
const defectTableDS = () => ({
  autoQuery: false,
  selection: 'multiple',
  // primaryKey: 'defectId',
  // queryFields: [],
  fields: [
    {
      name: 'defectProject',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectProject`)
        .d('项目'),
    },
    {
      name: 'codeGroup',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.codeGroup`)
        .d('代码组'),
    },
    {
      name: 'defectCategory',
      type: 'string',
      label: intl.get(`sqam.common.model.8d.defectType`).d('缺陷类型'),
    },
    {
      name: 'defectQuantity',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectQuantity`)
        .d('缺陷数'),
    },
    {
      name: 'inspectionFeatures',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionFeatures`)
        .d('检验特性的短文本'),
    },
    {
      name: 'problemCode',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.problemCode`)
        .d('文本问题代码'),
    },
    {
      name: 'sequenceNum',
      type: 'string',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.sequenceNum`)
        .d('序列数'),
    },
    {
      name: 'defectFeatures',
      type: 'date',
      label: intl
        .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectFeatures`)
        .d('特性'),
    },
  ],
  transport: {
    /**
     * 查询
     */
    read: ({ data }) => {
      const { id } = data;
      return {
        url: `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/incoming_inspection_defect/${id}`,
        method: 'GET',
        params: {
          ...data,
          customizeUnitCode: 'SQAM.QUALITY_INSPECT_APPROVAL_WORKFLOW.DEFECT',
        },
      };
    },
  },
});

export { headerDS, tableDS, defectTableDS };
