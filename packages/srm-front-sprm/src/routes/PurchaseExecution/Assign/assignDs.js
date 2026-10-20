import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SPRM, PRIVATE_BUCKET } from '_utils/config';
import { amountFormatterOptions, priceFormatterOptions } from '@/routes/utils';
// import moment from 'moment';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';

const assignDs = ({ type, initCuxTablePageSize }) => ({
  autoQuery: false,
  primaryKey: 'prLineId',
  cacheSelection: true,
  pageSize: initCuxTablePageSize || 20,
  forceValidate: true,
  fields: [
    {
      name: 'prLineStatusCodeMeaning',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
      fixed: 'left',
    },
    {
      name: 'prLineStatusCode',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
      name: 'displayPrNum',
      type: 'string',
      fixed: 'left',
    },
    {
      label: intl.get(`${commonPrompt}.title`).d('标题'),
      name: 'title',
      fixed: 'left',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
      width: 100,
      name: 'displayLineNum',
      fixed: 'left',
      type: 'string',
    },
    // {
    //   label: intl.get('sprm.purchaseReqCreation.model.common.accountAssignType').d('账户分配类别'),
    //   name: 'accountAssignTypeCode',
    //   type: 'string',
    // },
    {
      label: intl.get('entity.item.code').d('物料编码'),
      name: 'itemCode',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.sqType`).d('申请类型'),
      name: 'prTypeName',
      type: 'string',
    },
    {
      label: intl.get('entity.item.name').d('物料名称'),
      name: 'itemName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      name: 'categoryName',
      type: 'string',
    },
    {
      label: intl.get(`sprm.common.shoppingMall.model.productBrand`).d('商品品牌'),
      name: 'productBrand',
    },
    {
      label: intl.get(`sprm.common.shoppingMall.model.productModel`).d('商品型号'),
      name: 'productModel',
    },
    {
      label: intl.get(`sprm.common.shoppingMall.model.packingList`).d('商品规格'),
      name: 'packingList',
    },
    // {
    //   label: intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性'),
    //   name: 'itemAbcClass',
    //   type: 'string',
    // },
    {
      name: 'uomPrecision',
      type: 'number',
    },
    {
      name: 'quantity',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseQuantity`).d('基本数量')
            : intl.get(`sprm.common.model.common.quantity`).d('数量'),
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
      name: 'secondLevelStrategyCode',
      type: 'string',
      lookupCode: 'SPRM.SECOND_LEVEL_STRATEGY',
    },
    {
      label: intl.get(`${commonPrompt}.orderSecondLevelStrategyCode`).d('履约链路执行规则'),
      name: 'orderSecondLevelStrategyCode',
      type: 'string',
      lookupCode: 'SPRM.PERFORMANCE_SECOND_LINK',
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
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.uomName`).d('单位'),
      },
      name: 'uomCodeAndName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
      name: 'currencyCode',
      type: 'string',
    },
    {
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl
              .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
              .d('预估单价(含税)-基本单位')
            : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
      },
      name: 'taxIncludedUnitPrice',
      type: 'number',
      computedProps: { formatterOptions: ({ record, name }) => record.get('prSourcePlatform') === 'SRM' ? priceFormatterOptions({ record, name }) : undefined },
      // dynamicProps: {
      //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //     record.get('prSourcePlatform') === 'SRM' ? record.get('defaultPrecision') : undefined
      //   ),
      //   type: ({ record }) =>
      //     record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision')
      //       ? 'currency'
      //       : 'number',
      // },
    },
    {
      label: intl.get(`${commonPrompt}.backToUnassignFlag`).d('退回标识'),
      name: 'backToUnassignFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      // transformResponse(data) {
      //   const value = data ? data.toString() : '0';
      //   return value;
      // },
    },
    {
      label: intl.get(`${commonPrompt}.backToUnassignReason`).d('退回原因'),
      name: 'backToUnassignReason',
    },
    {
      label: intl.get(`${commonPrompt}.unitPriceBatch`).d('每'),
      name: 'unitPriceBatch',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
      name: 'taxIncludedLineAmount',
      align: 'right',
      type: 'number',
      computedProps: { formatterOptions: ({ record, name }) => record.get('prSourcePlatform') === 'SRM' ? amountFormatterOptions({ record, name }) : undefined },
    },
    {
      label: intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略'),
      name: 'executionStrategyCode',
      type: 'string',
      lookupCode: 'SPRM.EXECUTION_STRATEGY',
    },
    {
      name: 'changeOrderCode',
      type: 'string',
      label: intl.get('sprm.common.model.autoOrderStatus').d('自动创建PO状态'),
    },
    {
      label: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
      name: 'taxIncludedBudgetUnitPrice',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.referPrice`).d('参考价格'),
      name: 'referencePriceDisplayFlag',
    },
    {
      label: intl.get(`${commonPrompt}.budgetIoFlag`).d('预算外标识'),
      name: 'budgetIoFlag',
      type: 'boolean',
      trueValue: '1',
      falseValue: '0',
      transformResponse(data) {
        const value = data ? data.toString() : '0';
        return value;
      },
    },
    {
      label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
      name: 'neededDate',
      type: 'date',
    },
    {
      label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
      name: 'requestDate',
      type: 'date',
    },
    {
      label: intl.get('entity.company.tag').d('公司'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get('entity.business.tag').d('业务实体'),
      name: 'ouName',
      type: 'string',
    },
    {
      label: intl.get('entity.organization.class.purchase').d('采购组织'),
      name: 'purchaseOrgName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
      name: 'purchaseAgentName',
      type: 'string',
    },
    {
      label: intl.get('entity.organization.class.inventory').d('库存组织'),
      name: 'invOrganizationName',
      type: 'string',
    },
    // {
    //   label: intl.get(`${commonPrompt}.inventoryName`).d('库房'),
    //   name: 'inventoryName',
    //   type: 'string',
    // },
    {
      label: intl.get('entity.roles.proposer').d('申请人'),
      name: 'prRequestedName',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.ERPstatus`).d('ERP状态'),
      name: 'erpEditStatus',
      type: 'string',
      lookupCode: 'SPUC.PR_ERP_STATUS',
    },
    {
      label: intl.get(`${commonPrompt}.handleStatus`).d('执行状态'),
      name: 'executionStatusMeaning',
      type: 'string',
    },
    {
      label: intl
        .get(`sprm.purchaseRequisitionAssign.model.common.executionBillNum`)
        .d('执行单据编号'),
      name: 'executionHeaderBillNum',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.handlePerson`).d('需求执行人'),
      name: 'executorName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
      name: 'unitName',
      type: 'string',
    },
    {
      label: intl.get('entity.roles.creator').d('创建人'),
      name: 'creatorName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.assignedDate`).d('分配日期'),
      name: 'assignedDate',
      type: 'date',
    },
    {
      label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
      name: 'prSourcePlatform',
      lookupCode: 'SPRM.SRC_PLATFORM',
      type: 'string',
    },
    {
      label: intl.get('entity.attachment.tag').d('附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      viewMode: 'popup',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
    },
    {
      label: intl.get(`${commonPrompt}.projectCategory`).d('项目类别'),
      name: 'projectCategory',
      type: 'string',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbsCode',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.projectNum`).d('项目号'),
      name: 'projectNum',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
      name: 'projectName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.supplierItemNum`).d('供应商料号'),
      name: 'supplierItemCode',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.supplierItemName`).d('供应商料号描述'),
      name: 'supplierItemName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.itemModel`).d('型号'),
      name: 'itemModel',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
      name: 'itemSpecs',

      type: 'string',
    },
    {
      name: 'autoAssignedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`sprm.common.model.autoAssignedFlag`).d('自动分配是否成功'),
    },
    {
      name: 'orderOccupiedQuantity',
      type: 'number',
    },
    {
      name: 'sourceOccupiedQuantity',
      type: 'number',
    },
    {
      name: 'occupiedQuantity',
      type: 'number',
    },
    {
      label: intl.get('hzero.common.button.operating').d('操作记录'),
      width: 100,
      name: 'operatorRecord',
      type: 'string',
    },
    {
      name: 'projectTaskId',
      lovCode: 'SIEC.PROJECT_TASK_TREE',
      type: 'object',
      label: intl.get(`${commonPrompt}.projectTaskId`).d('项目任务名称'),
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
  transport: {
    read: (values) => {
      const {
        data: { prLineStatusCode, ...otherData },
        params = {},
      } = values;

      const newParams = {
        ...params,
        ...otherData,
        tempKey: undefined,
        supplierQueryParamStr: otherData.tempKey,
        waitAssignRequestFlag: type !== 'approved' ? '' : 1,
      };
      const otherSupplier = {};
      // 判断是不是老供应商的默认值查询
      if (
        newParams.supplierQueryParamStr &&
        !newParams.supplierId &&
        !newParams.supplierCompanyId
      ) {
        if (
          !newParams.supplierQueryParamStr.includes(':') &&
          newParams.supplierQueryParamStr.includes('-')
        ) {
          // eslint-disable-next-line prefer-destructuring
          otherSupplier.supplierCompanyId = newParams.supplierQueryParamStr.split('-')[1];
          // eslint-disable-next-line prefer-destructuring
          otherSupplier.supplierId = newParams.supplierQueryParamStr.split('-')[0];
        }
      }

      if (!type) {
        return;
      }
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/line/can-assign/page`,
        method: 'GET',
        data: filterNullValueObject({
          ...newParams,
          ...otherSupplier,
          prCustomizeFilterFlag: 1,
          customizeUnitCode:
            'SPRM.PURCHASE_EXECUTION.NOTASSIGN.LIST,SPRM.PURCHASE_EXECUTION.NOTASSIGN.FILTER',
          prLineStatusCode:
            type !== 'all' && type.toUpperCase ? type?.toUpperCase() : prLineStatusCode,
          erpControlFlag: 1,
        }),
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

const promptModalDs = (config = {}, cuxpromptModalDsUpdate) => {
  return {
    autoCreate: true,
    paging: false,
    fields: [
      {
        label: intl.get(`sprm.purchaseRequisitionAssign.modal.purchaseAgentName`).d('采购员'),
        name: 'currentPurchaseAgent',
        type: 'object',
        lovCode: 'SPUC.PURCHASE_AGENT',
        required: true,
        // disabled: config.page === 'allPage',
        lovPara: {
          purchaseOrgIds: config.purchaseOrgIds,
        },
      },
      {
        name: 'purchaseAgentId',
        bind: 'currentPurchaseAgent.purchaseAgentId',
      },
      {
        label: intl.get(`${commonPrompt}.handlePerson`).d('需求执行人'),
        name: 'executedBys',
        lovCode: 'SSLM.KPI_USER',
        type: 'object',
        multiple: true,
        lovPara: {
          tenantId: organizationId,
        },
        textField: 'userName',
        dynamicProps: {
          disabled: ({ record }) => !record.get('purchaseAgentId'),
        },
      },
      {
        label: intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略'),
        name: 'executionStrategyCode',
        type: 'string',
        lookupCode: 'SPRM.EXECUTION_STRATEGY',
        disabled: config.allTransferFlag && config.page !== 'allPage',
        required: config.setting === '1' && !config.allTransferFlag,
      },
      {
        label: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
        name: 'secondLevelStrategyCode',
        type: 'string',
        lookupCode: 'SPRM.SECOND_LEVEL_STRATEGY',
        dynamicProps: {
          disabled: ({ record }) =>
            ['ORDER', 'PROJECT_INFO'].includes(record.get('executionStrategyCode')) ||
            config.sourceTransferFlag,
        },
      },
      {
        label: intl.get(`${commonPrompt}.orderSecondLevelStrategyCode`).d('履约链路执行规则'),
        name: 'orderSecondLevelStrategyCode',
        type: 'string',
        lookupCode: 'SPRM.PERFORMANCE_SECOND_LINK',
        dynamicProps: {
          disabled: ({ record }) =>
            ['SOURCE', 'PROJECT_INFO'].includes(record.get('executionStrategyCode')) ||
            config.orderTransferFlag,
        },
      },
      {
        label: intl.get(`sprm.purchaseRequisitionAssign.model.common.assignedRemark`).d('分配说明'),
        name: 'assignedRemark',
        type: 'string',
      },
      {
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        name: 'supplierList',
        type: 'object',
        // ignore: 'always',
        multiple: true,
        dynamicProps: {
          lovPara({ dataSet }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              companyId: dataSet.parent?.current?.get('companyId'),
            };
          },
        },
        lovCode: 'SPRM.SUPPLIER',
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (isFunction(cuxpromptModalDsUpdate)) {
          cuxpromptModalDsUpdate({ record, name, value });
        } else if (name === 'executionStrategyCode' && value) {
          if (config.setting !== '1') {
            record.set({
              orderSecondLevelStrategyCode: null,
              secondLevelStrategyCode: null,
            });
          }
          if (!config.oldAssignLovSetting) {
            record.set({
              orderSecondLevelStrategyCode: 'ALL',
            });
          }
          if (value === 'PROJECT_INFO') {
            record.set({
              secondLevelStrategyCode: 'NO_ACCESS',
              orderSecondLevelStrategyCode: 'NO_ACCESS',
            });
          }
        }
      },
    },
  };
};

const suspendModalDs = ({ type } = {}) => {
  return {
    autoCreate: true,
    paging: false,
    fields: [
      {
        label: intl.get(`sprm.purchaseRequisitionAssign.model.common.suspendReason`).d('暂挂原因'),
        name: 'suspendRemark',
        type: 'string',
      },
      {
        label: intl
          .get(`sprm.purchaseRequisitionAssign.model.common.backToUnassignReason`)
          .d('退回原因'),
        name: 'backToUnassignReason',
        required: type !== 'suspend',
        type: 'string',
      },
    ],
  };
};

export { assignDs, promptModalDs, suspendModalDs };
