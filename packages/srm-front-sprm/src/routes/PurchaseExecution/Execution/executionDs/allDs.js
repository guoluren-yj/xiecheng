import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SPRM, PRIVATE_BUCKET } from '_utils/config';
import { isNil, isEmpty } from 'lodash';
import { amountFormatterOptions } from '@/routes/utils';
// import moment from 'moment';
// import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';

const allDs = ({ initCuxTablePageSize }) => ({
  autoQuery: false,
  cacheSelection: true,
  dataToJSON: 'selected',
  primaryKey: 'prLineId',
  pageSize: initCuxTablePageSize || 20,
  fields: [
    {
      name: 'downsStreamQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.downsStreamQuantity`).d('已转下游数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'sourceDownsStreamQuantity',
      type: 'number',
      label: intl
        .get(`sprm.common.model.common.sourceDownsStreamQuantity`)
        .d('寻源链路已转下游数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'prLineStatusCodeMeaning',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
      fixed: 'left',
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
      label: intl.get(`${commonPrompt}.restPcQuantity`).d('订单本次下单数量'),
      name: 'thisOrderQuantity',
      type: 'number',
      // validator: (value, name, record) => {
      //   if (value <= 0) {
      //     return intl.get('sprm.common.view.message.greaterThanZero').d('本次下单数量必须大于零');
      //   }
      //   if (record.get('orderQuantityFlag') === 1 && record.get('restPoQuantity') < value) {
      //     return intl
      //       .get('sprm.common.view.message.greaterThanResidue')
      //       .d('本次下单数量大于剩余可下单数量');
      //   }
      //   return true;
      // },
      validator: (value, name, record) => {
        const productPlaceConfig = record?.dataSet?.getState('productPlaceConfig');
        const {
          restPoQuantity,
          orderExcessRuleCode,
          transactionMode,
          prSourcePlatform,
          ecLimitQuantity,
        } = record.get([
          'restPoQuantity',
          'orderExcessRuleCode',
          'transactionMode',
          'prSourcePlatform',
          'ecLimitQuantity',
        ]);
        if (transactionMode === 'TRIPARTITE') {
          return true;
        }
        if (value <= 0) {
          return intl.get('sprm.common.view.message.greaterThanZero').d('本次下单数量必须大于零');
        }
        if (
          !isNil(restPoQuantity) &&
          restPoQuantity < value &&
          !['DISPOSABLE_EXCESS', 'INFINITY_EXCESS'].includes(orderExcessRuleCode)
        ) {
          return intl
            .get('sprm.common.view.message.greaterThanResidue')
            .d('本次下单数量大于剩余可下单数量');
        }
        if (
          productPlaceConfig &&
          !isNil(ecLimitQuantity) &&
          ['SRM', 'ERP'].includes(prSourcePlatform) &&
          math.lt(value, ecLimitQuantity)
        ) {
          return intl
            .get('sprm.common.view.validation.thisQuantityLessThanEcLimitQuantity')
            .d('本次下单数量小于电商起订量，不允许下单');
        }
        return true;
      },
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('secondaryUomPrecision') || record.get('uomPrecision') || 10;
        },
        disabled: ({ record }) => {
          return !(record.get('transactionMode') !== 'TRIPARTITE');
        },
      },
    },
    {
      name: 'ecLimitQuantity',
      label: intl.get(`sprm.common.model.order.ecLimitQuantity`).d('电商起订量'),
      type: 'number',
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
      label: intl.get(`${commonPrompt}.restPcQuantity`).d('订单本次下单数量'),
      name: 'restPcQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'uomId',
      transformRequest: (value, record) => value || record.getPristineValue('uomId'),
    },
    {
      name: 'secondaryUomId',
      transformRequest: (value, record) => value || record.getPristineValue('secondaryUomId'),
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
      name: 'taxIncludedUnitPrice',
      type: 'number',
      align: 'right',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('defaultPrecision') ?? 10;
        },
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl
              .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
              .d('预估单价(含税)-基本单位')
            : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
      },
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
      label: intl.get(`${commonPrompt}.unitPriceBatch`).d('每'),
      name: 'unitPriceBatch',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
      name: 'taxIncludedLineAmount',
      align: 'right',
      type: 'currency',
      computedProps: { formatterOptions: ({ record, name }) => record.get('prSourcePlatform') === 'SRM' ? amountFormatterOptions({ record, name }) : undefined },

    },
    {
      label: intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略'),
      name: 'executionStrategyMeaning',
      type: 'string',
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
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('prSourcePlatform') === 'SRM'
            ? record.get('defaultPrecision')
            : undefined;
        },
      },
    },
    {
      label: intl.get(`${commonPrompt}.referPrice`).d('参考价格'),
      name: 'referencePriceDisplayFlag',
    },
    {
      label: intl.get(`${commonPrompt}.budgetIoFlag`).d('预算内外标识'),
      name: 'budgetIoFlag',
      type: 'string',
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
      label: intl.get(`sprm.common.model.common.outsourcingBomFlag`).d('是否外协加工'),
      name: 'outsourcingBomFlag',
      defaultValue: 0,
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`sprm.common.model.common.outsourcingBom`).d('外协BOM'),
      name: 'outsourcingBom',
      // min: moment().format(DATETIME_MIN),
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
      name: 'prSourcePlatformMeaning',
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
      name: 'projectCategoryMeaning',
      type: 'string',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbs',
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
      name: 'transferredDocumentTypeVOList',
      type: 'object',
      label: intl.get('sprm.common.model.common.transferredDocumentTypeVOList').d('可转单类型'),
    },
    {
      name: 'orderSupplierLov',
      label: intl.get('sprm.common.model.executeBill.orderSupplier').d('订单供应商'),
      type: 'object',
      lovCode: 'SODR.PR_SUGGEST_SUPPLIER',
      ignore: 'always',
      dynamicProps: {
        lovPara({ record }) {
          return {
            itemId: record.get('itemId'),
            companyId: record.get('companyId'),
            ouId: record.get('ouId'),
            priceSortFlag: 1,
            purchaseOrgId:
              record.get('purchaseOrgId')?.purchaseOrgId || record.get('purchaseOrgId'),
            invOrganizationId: record.get('invOrganizationId'),
            uomId: record.get('uomId'),
            prLineId: record.get('prLineId'),
          };
        },
      },
    },
    {
      name: 'selectSupplierCompanyId',
      bind: 'orderSupplierLov.supplierCompanyId',
    },
    {
      name: 'selectSupplierCode',
      bind: 'orderSupplierLov.supplierCompanyNum',
    },
    {
      name: 'priceLibraryId',
      bind: 'orderSupplierLov.priceLibraryId',
    },
    {
      name: 'priceLibId',
      bind: 'orderSupplierLov.priceLibId',
    },
    {
      name: 'selectDisplaySupplierCompanyName',
      ignore: 'always',
      bind: 'orderSupplierLov.displaySupplierCompanyName',
    },
    {
      name: 'selectSupplierCompanyName',
      bind: 'orderSupplierLov.supplierCompanyName',
    },
    {
      name: 'selectSupplierTenantId',
      bind: 'orderSupplierLov.supplierTenantId',
    },
    {
      name: 'prReferencePriceLibraryVO',
      label: intl.get('sprm.common.model.executeBill.orderPriceInfo').d('订单价格信息'),
      type: 'object',
    },
    {
      name: 'defaultOrderingAddress',
      label: intl.get(`sprm.common.model.common.defaultOrderingAddress`).d('收货地址'),
    },
    {
      name: 'supplierLov',
      label: intl.get('sprm.common.model.executeBill.suggestedsupplier').d('建议供应商'),
      type: 'object',
      lovCode: 'SPRM.SUPPLIER',
      ignore: 'always',
    },
    {
      name: 'displaySupplierName',
      ignore: 'always',
      bind: 'supplierLov.displaySupplierName',
    },
    {
      name: 'noUnitPrice',
      type: 'number',
      label: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'chooseSupplier',
      label: intl.get('sprm.common.model.common.chooseSupplier').d('选择供应商'),
    },
    {
      label: intl.get('hzero.common.button.operating').d('操作记录'),
      width: 100,
      name: 'operatorRecord',
      type: 'string',
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
    {
      label: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
      name: 'priceSource',
      type: 'string',
      lookupCode: 'SPRM.PRICE_SOURCE',
    },
    {
      label: intl.get(`sprm.common.model.common.productEcSourceFrom`).d('价格商品电商平台编码'),
      name: 'priceEcPlatformCode',
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
        data: { ...otherData },
        params = {},
      } = values;
      const newParams = {
        ...params,
        ...otherData,
        tempKey: undefined,
        supplierQueryParamStr: otherData.tempKey,
        supplierList: undefined,
        recommendSupplierParamsStr: otherData.supplierList,
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

      if (
        newParams.recommendSupplierParamsStr &&
        !newParams.localSupplierIds &&
        !newParams.platformSupplierIds
      ) {
        if (
          !newParams.recommendSupplierParamsStr.includes(':') &&
          newParams.recommendSupplierParamsStr.includes('-')
        ) {
          const localSupplierIds = [];
          const platformSupplierIds = [];
          (newParams.recommendSupplierParamsStr.split(',') || []).forEach((ele) => {
            const [supplierId = undefined, supplierCompanyId = undefined] = ele
              ? ele.split('-')
              : [];
            if (supplierId) {
              localSupplierIds.push(supplierId);
            } else {
              platformSupplierIds.push(supplierCompanyId);
            }
          });
          // eslint-disable-next-line prefer-destructuring
          otherSupplier.platformSupplierIds = isEmpty(platformSupplierIds)
            ? undefined
            : platformSupplierIds.join(',');
          // eslint-disable-next-line prefer-destructuring
          otherSupplier.localSupplierIds = isEmpty(localSupplierIds)
            ? undefined
            : localSupplierIds.join(',');
        }
      }

      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/line/can-assign/page`,
        method: 'GET',
        data: filterNullValueObject({
          ...newParams,
          ...otherSupplier,
          sourceTab: 'ALL',
          prLineStatusCode: 'ASSIGNED',
          erpControlFlag: 1,
          prCustomizeFilterFlag: 1,
          customizeUnitCode:
            'SPRM.PURCHASE_EXECUTION_ALL.PURCHASE_LIST,SPRM.PURCHASE_EXECUTION_ALL.FILTER',
        }),
      };
    },
  },
  events: {
    load({ dataSet }) {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
      dataSet.forEach((i) => {
        i.init({
          receiptsOrderQuantity: i.get('changeQuantity'),
          selectDisplaySupplierCompanyName:
            i.get('selectSupplierCompanyName') || i.get('selectLocalSupplierName'),
          displaySupplierName: i.get('supplierName') || i.get('supplierCompanyName'),
        });
      });
    },
    update: ({ name, value, record }) => {
      if (name === 'orderSupplierLov') {
        const {
          uomId,
          uomCode,
          uomName,
          uomCodeAndName,
          currencyCode,
          taxId,
          taxRate,
          // netPrice,
          unitPrice,
          priceLibId,
          priceLibraryId,
          // taxIncludedPrice,

          enteredTaxIncludedPrice,
          unitPriceBatch,
          holdPcHeaderId,
          holdPcLineId,
          contractNum,
          benchmarkPriceType,
          ladderPriceLibId,
          ladderQuotationFlag,
          supplierName,
          supplierId,
          supplierNum,
          priceLibraryStatus,
        } = value || {};
        const orderSupplierBtnFlag = record.get('orderSupplierBtnFlag');
        // record.set({ noUnitPrice: unitPrice });
        console.log(value && orderSupplierBtnFlag !== 1, !value, orderSupplierBtnFlag);
        if (value && orderSupplierBtnFlag !== 1) {
          record.set({
            prReferencePriceLibraryVO: {
              uomId,
              changeUpdateFlag: 1,
              uomCode,
              uomName,
              uomCodeAndName,
              currencyCode,
              taxId,
              taxRate,
              noUnitPrice: unitPrice,
              unitPrice,
              priceLibId,
              priceLibraryId: priceLibId === null ? null : priceLibraryId,
              taxIncludedPrice: enteredTaxIncludedPrice,
              priceLibraryStatus,
              unitPriceBatch,
              holdPcHeaderId,
              holdPcLineId,
              contractNum,
              benchmarkPriceType,
              ladderPriceLibId,
              ladderQuotationFlag,
              originUnitPrice:
                benchmarkPriceType === 'NET_PRICE' ? unitPrice : enteredTaxIncludedPrice,
              enteredTaxIncludedPrice,
              selectLocalSupplierCode: isNil(supplierId) ? null : supplierNum,
              selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
              selectLocalSupplierName: isNil(supplierId) ? null : supplierName,
            },
            noUnitPrice: unitPrice,
            priceLibraryStatus,
            priceLibId,
            orderSupplierBtnFlag: 0,
            priceLibraryId: priceLibId === null ? null : priceLibraryId,
          });
        } else if (!value) {
          const prReferencePriceLibraryVO = record.get('prReferencePriceLibraryVO');
          record.reset();
          record.init({
            priceLibraryStatus: null,
            prReferencePriceLibraryVO: {
              ...prReferencePriceLibraryVO,
              selectSupplierCompanyId: null,
              selectSupplierCode: null,
              selectSupplierCompanyName: null,
              noUnitPrice: null,
              selectLocalSupplierId: null,
              selectLocalSupplierCode: null,
              selectLocalSupplierName: null,
              priceLibraryId: null,
            },
            orderSupplierLov: {},
            orderSupplierBtnFlag: 0,
            noUnitPrice: null,
            netPrice: null,
          });
        }
      }
    },
    unSelect({ record }) {
      record.init('thisOrderQuantity', record.getPristineValue('thisOrderQuantity'));
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.init('thisOrderQuantity', i.getPristineValue('thisOrderQuantity')));
    },
  },
});

const orderPriceDs = () => ({
  autoQuery: false,
  pageSize: 20,
  selection: false,
  fields: [
    {
      label: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
      name: 'unitPrice',
      type: 'number',
    },
    {
      label: intl.get(`sodr.common.model.common.taxPrice`).d('单价(含税)'),
      name: 'taxIncludedPrice', // taxIncludedUnitPrice
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.uomName`).d('单位'),
      name: 'uomName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
      name: 'currencyCode',
      type: 'string',
    },
  ],
});

export { allDs, orderPriceDs };
