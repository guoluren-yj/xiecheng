import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import { amountFormatterOptions, priceFormatterOptions } from '@/routes/utils';

const commonPrompt = 'sprm.common.model.common';
const organizationId = getCurrentOrganizationId();

const controlLineDs = () => ({
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'prLineId',
  autoLocateFirst: false,
  cacheSelection: true,
  fields: [
    {
      name: 'prLineStatusCode',
      label: intl.get(`sprm.common.model.common.prStatusCode`).d('状态'),
    },
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.common.prNum`).d('采购申请编号'),
    },
    {
      name: 'title',
      label: intl.get(`sprm.common.model.common.title`).d('标题'),
    },
    {
      name: 'displayLineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      label: intl.get(`sprm.common.model.common.baseuom`).d('基本单位'),
      name: 'uomCodeAndName',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.uomName`).d('单位'),
      },
    },
    {
      name: 'itemCode',
      label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('entity.item.name').d('物料名称'),
      type: 'string',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbs',
    },
    {
      label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      name: 'categoryName',
    },
    {
      name: 'quantity',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseQuantity`).d('基本数量')
            : intl.get(`sprm.common.model.common.quantity`).d('数量'),
      },
      type: 'number',
    },
    {
      name: 'orderExcessRuleCode',
      type: 'string',
      lookupCode: 'SPRM.PR_EXCESS_RULE',
      label: intl.get(`${commonPrompt}.orderExcessRuleCode`).d('订单超量规则'),
    },
    {
      name: 'sourceExcessRuleCode',
      type: 'string',
      lookupCode: 'SPRM.PR_EXCESS_RULE',
      label: intl.get(`${commonPrompt}.sourceExcessRuleCode`).d('寻源超量规则'),
    },
    {
      name: 'contractExcessRuleCode',
      type: 'string',
      lookupCode: 'SPRM.PR_EXCESS_RULE',
      label: intl.get(`${commonPrompt}.contractExcessRuleCode`).d('协议超量规则'),
    },
    {
      name: 'sourceDisposableExcessFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl.get(`${commonPrompt}.sourceDisposableExcessFlag`).d('寻源新链路一次性超量标识'),
    },
    {
      label: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源链路占用数量'),
      name: 'sourceOccupiedQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('履约链路占用数量'),
      name: 'orderOccupiedQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源链路可用数量'),
      name: 'restSourceQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('履约链路可用数量'),
      name: 'restPoQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'autoAssignedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`sprm.common.model.autoAssignedFlag`).d('自动分配是否成功'),
    },
    {
      name: 'secondLevelStrategyCode',
      label: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
      type: 'string',
      lookupCode: 'SPRM.SECOND_LEVEL_STRATEGY',
    },
    {
      name: 'orderExecuteStatus',
      lookupCode: 'SPRM.PR_ORDER_EXECUTE_STATUS',
      label: intl.get(`${commonPrompt}.orderExecuteStatus`).d('履约链路执行状态'),
    },
    {
      name: 'sourceExecuteStatus',
      lookupCode: 'SPRM.PR_SOURCE_EXECUTE_STATUS',
      label: intl.get(`${commonPrompt}.sourceExecuteStatus`).d('寻源链路执行状态'),
    },
    {
      label: intl.get(`sprm.common.model.common.taxType`).d('税种'),
      name: 'taxCode',
    },
    {
      label: intl.get(`sprm.common.model.common.taxRate`).d('税率'),
      name: 'taxRate',
      type: 'number',
      width: 160,
    },
    {
      label: intl
        .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
        .d('预估单价(含税)-基本单位'),
      name: 'taxIncludedUnitPrice',
      dynamicProps: {
        type: 'number',
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl
              .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
              .d('预估单价(含税)-基本单位')
            : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
      },
    },
    { label: intl.get(`sprm.common.model.common.unitPriceBatch`).d('每'), name: 'unitPriceBatch' },
    {
      label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
      name: 'secondaryUomId',
      lovCode: 'SMDM_ITEM_ORG_UOM',
      textField: 'uomCodeAndName',
      transformRequest: value => value?.secondaryUomId || value?.uomId,
      transformResponse(value, data) {
        if (value) {
          return {
            ...data,
            uomCodeAndName: data.secondaryUomCodeAndName || data.secondaryUomName || data.uomName,
          };
        } else {
          return null;
        }
      },
    },
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
      label: intl.get(`sprm.common.model.common.taxIncludedLineAmount`).d('行金额'),
      name: 'taxIncludedLineAmount',
      type: 'number',
      computedProps: { formatterOptions: ({ record, name }) => record.get('prSourcePlatform') === 'SRM' ? amountFormatterOptions({ record, name }) : undefined },
    },
    {
      label: intl.get(`sprm.common.model.common.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
      name: 'taxIncludedBudgetUnitPrice',
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
      label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
      name: 'budgetAccountName',
    },
    {
      label: intl.get(`sprm.common.model.common.budgetIoFlag`).d('预算外标识'),
      name: 'budgetIoFlag',
    },
    {
      label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
      name: 'neededDate',
      format: DEFAULT_DATE_FORMAT,
      type: 'date',
    },
    {
      name: 'supplierName',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
    },
    {
      name: 'companyName',
      label: intl.get(`sprm.common.model.common.companyName`).d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get(`sprm.common.model.common.ouName`).d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get(`sprm.common.model.common.purchaseAgentName`).d('采购员'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('entity.organization.class.inventory').d('库存组织'),
    },
    {
      label: intl.get(`sprm.common.model.common.prRequestedName`).d('申请人'),
      name: 'prRequestedName',
    },
    {
      name: 'remark',
      label: intl.get(`sprm.common.model.common.remark`).d('备注'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`sprm.common.model.common.creationTime`).d('创建时间'),
    },
    {
      name: 'unitName',
      label: intl.get(`sprm.common.model.common.unitName`).d('所属部门'),
    },
    {
      name: 'prSourcePlatformMeaning',
      label: intl.get(`sprm.common.model.common.prSourcePlatform`).d('单据来源'),
    },
    {
      name: 'projectCategoryMeaning',
      label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
    },
    {
      label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
      name: 'costName',
    },
    {
      label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
      name: 'accountSubjectName',
    },
    {
      label: intl.get(`sprm.common.model.common.projectNum`).d('项目号'),
      name: 'projectNum',
    },
    {
      label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
      name: 'projectName',
    },
    {
      name: 'operatorRecord',
      label: intl.get(`hzero.common.button.operating`).d('操作记录'),
    },
    {
      name: 'secondLevelStrategyCode',
      label: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
      type: 'string',
      lookupCode: 'SPRM.SECOND_LEVEL_STRATEGY',
    },
    {
      name: 'operable',
      label: intl.get(`${commonPrompt}.operable`).d('可操作类型'),
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
      transformRequest: value => value?.taskId,
      transformResponse: (value, object) => {
        return object?.projectTaskId
          ? {
            taskId: object?.projectTaskId,
            taskName: object?.projectTaskName,
          }
          : null;
      },
    },
    {
      label: intl.get(`sprm.common.view.message.transferredProjectFlag`).d('是否已转项目'),
      name: 'transferredProjectFlag',
    },
    {
      name: 'closeQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.closeQuantity`).d('关闭数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'sourceCloseQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.sourceCloseQuantity`).d('寻源关闭数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'currentCloseQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.currentCloseQuantity`).d('本次关闭数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'currentSourceCloseQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.currentSourceCloseQuantity`).d('本次寻源关闭数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'downsStreamQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.downsStreamQuantity`).d('已转下游数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'sourceDownsStreamQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.sourceDownsStreamQuantity`).d('寻源链路已转下游数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const cuxQueryParams = dataSet.getState('cuxQueryParams') || {};
      const newParams = {
        ...data,
        ...cuxQueryParams,
        tempKey: undefined,
        supplierQueryParamStr: data.tempKey,
        customizeUnitCode:
          'SPRM.PURCHASE_PLAFORM_CONTROLBYLINE.LIST,SPRM.PURCHASE_PLAFORM_CONTROLBYLINE.FILTER',
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
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/lines/cancel`,
        method: 'GET',
        data: filterNullValueObject({
          ...newParams,
          ...otherSupplier,
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

export { controlLineDs };
