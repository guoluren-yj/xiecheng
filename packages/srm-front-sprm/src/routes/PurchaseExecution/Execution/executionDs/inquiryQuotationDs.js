import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';

const organizationId = getCurrentOrganizationId();
// const commonPrompt = 'sprm.common.model.common';

const inquiryQuotationDs = ({ initCuxTablePageSize }) => ({
  autoQuery: false,
  cacheSelection: true,
  primaryKey: 'prLineId',
  pageSize: initCuxTablePageSize || 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
      type: 'string',
    },
    {
      name: 'displayLineNum',
      label: intl.get(`sodr.common.model.common.lineNum`).d('行号'),
      type: 'string',
    },
    {
      name: 'itemCode',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
      type: 'string',
    },
    {
      name: 'itemName',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemName`).d('物料名称'),
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.commonName`).d('通用名'),
      name: 'commonName',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物品分类'),
      name: 'categoryName',
      width: 100,
    },
    {
      label: intl.get('ssrc.common.company').d('公司'),
      name: 'companyName',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ouName`).d('业务实体'),
      name: 'ouName',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
      name: 'invOrganizationName',
      width: 130,
    },
    {
      name: 'uomPrecision',
      type: 'number',
    },
    {
      name: 'quantity',
      type: 'number',
      width: 80,
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseQuantity`).d('基本数量')
            : intl.get(`sprm.common.model.common.quantity`).d('数量'),
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.occupiedQuantity`).d('剩余可占用数量'),
      name: 'occupiedQuantity',
      type: 'number',
      width: 140,
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.uomName`).d('单位'),
      },
      name: 'uomName',
      width: 80,
    },
    { label: intl.get(`sprm.common.model.common.uomName`).d('单位'), name: 'secondaryUomName' },
    {
      label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('申请数量'),
      name: 'secondaryQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('secondaryUomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价（含税）'),
      name: 'secondaryTaxInUnitPrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
      name: 'currencyCode',
      width: 80,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
      name: 'neededDate',
      width: 170,
      type: 'date',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人'),
      name: 'prRequestedName',
      width: 130,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.demandExecutor`).d('需求执行人'),
      name: 'executorName',
      width: 100,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
      name: 'purchaseAgentName',
      width: 100,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
      name: 'unitName',
      width: 120,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.requestDate`).d('申请日期'),
      name: 'requestDate',
      width: 170,
      type: 'date',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
      name: 'remark',
      width: 200,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prSourcePlatform`).d('数据来源'),
      name: 'prSourcePlatformMeaning',
      width: 130,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignedDate`).d('最后分配时间'),
      name: 'assignedDate',
      width: 170,
    },
    // {
    //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.drawingNum`).d('图号'),
    //   name: 'drawingNum',
    //   width: 130,
    // },
    // {
    //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.drawingVersion`).d('图纸版本'),
    //   name: 'drawingVersion',
    //   width: 120,
    // },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.surfaceFlag`).d('表面处理'),
      name: 'surfaceTreatFlag',
      width: 120,
      type: 'boolean',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNum`).d('供应商料号'),
      name: 'supplierItemCode',
      width: 120,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNumDesc`).d('供应商料号描述'),
      name: 'supplierItemNumDesc',
      width: 120,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectCategory`).d('项目类别'),
      name: 'projectCategoryMeaning',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prTypeName`).d('申请类型'),
      name: 'prTypeName',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.demandAccessories`).d('需求附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      viewMode: 'popup',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-applyToInquiry',
      width: 140,
    },

    {
      name: 'projectTaskId',
      lovCode: 'SIEC.PROJECT_TASK_TREE',
      type: 'object',
      label: intl.get(`sprm.common.model.common.projectTaskId`).d('项目任务名称'),
      optionsProps: {
        paging: 'server',
        primaryKey: 'taskId',
        idField: 'taskId',
        treeFlag: 'Y',
        parentField: 'parentTaskId',
        childrenField: 'children',
      },
      transformRequest: (value) => value?.taskId,
      transformResponse: (value, object) => {
        return object?.projectTaskId
          ? {
              taskId: object?.projectTaskId,
              taskName: object?.projectTaskName,
            }
          : null;
      },
    },
  ],
  // queryFields: [
  //   {
  //     name: 'displayPrNum',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
  //   },
  //   {
  //     name: 'ouId',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.entity`).d('业务实体'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.OU',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.ouId,
  //   },
  //   {
  //     name: 'categoryId',
  //     label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物品分类'),
  //     type: 'object',
  //     noCache: true,
  //     lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.categoryId,
  //     lovDefineAxiosConfig: (code) => {
  //       const lovConfig = lovDefineAxiosConfig(code);
  //       return {
  //         ...lovConfig,
  //         transformResponse: [
  //           ...lovConfig.transformResponse,
  //           (data) => {
  //             return {
  //               ...data,
  //               treeFlag: 'Y',
  //               idField: 'categoryId',
  //               parentIdField: 'parentCategoryId',
  //             };
  //           },
  //         ],
  //       };
  //     },
  //   },
  //   {
  //     name: 'purchaseAgentId',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseAgent`).d('采购员'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.purchaseAgentId,
  //   },
  //   {
  //     name: 'itemId',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
  //     type: 'object',
  //     lovCode: 'SPRM.ITEM',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.itemId,
  //   },
  //   {
  //     name: 'projectCategory',
  //     type: 'string',
  //     label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectCategory`).d('项目类别'),
  //     lookupCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
  //     lovPra: { tenantId: organizationId },
  //   },
  // ],

  transport: {
    read: (values) => {
      const { data = {}, params = {} } = values;
      const newParams = {
        ...params,
        ...data,
      };
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/share/application`,
        method: 'GET',
        data: {
          ...newParams,
          erpControlFlag: 1,
          prCustomizeFilterFlag: 1,
          sourceDocumentType: 'RFX',
          customizeUnitCode:
            'SPRM.PURCHASE_EXECUTION_ALL.RFX_LIST,SPRM.PURCHASE_EXECUTION_ALL.RFX_FILTER',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
    },
  },
});

const templateModalDs = ({ config, sourceFrom }, newBidParams = {}) => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'templateId',
        type: 'object',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
        required: true,
        lovCode: 'SSRC.TEMPLATE_NAME',
        lovPara: {
          sourceCategory: config,
          organizationId,
          sourceFrom,
          ...newBidParams,
        },
        transformRequest: (value) => value && value.templateId,
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  placeholder: '',
                  width: 1000,
                };
              },
            ],
          };
        },
      },
    ],
  };
};

export { inquiryQuotationDs, templateModalDs };
