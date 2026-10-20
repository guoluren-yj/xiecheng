import { math } from 'choerodon-ui/dataset';
import { isNil, isArray, isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SPRM } from '_utils/config';
// import moment from 'moment';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
// import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
// import { c7nAmountFormatterOptions } from '@/routes/utils';

const organizationId = getCurrentOrganizationId();
// const commonPrompt = 'sprm.common.model.common';

const orderDs = ({ initCuxTablePageSize }) => ({
  autoQuery: false,
  dataToJSON: 'all',
  cacheSelection: true,
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
      name: 'prNum',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
      type: 'string',
    },
    {
      name: 'lineNum',
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
      name: 'categoryName',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCatalog`).d('物料分类'),
      type: 'string',
    },
    {
      name: 'referencePriceDisplayFlag',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.referencePrice`).d('参考价格'),
    },

    {
      name: 'noUnitPrice',
      label: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'chooseSupplier',
      label: intl.get('sprm.common.model.common.chooseSupplier').d('选择供应商'),
    },
    {
      name: 'supplierLov',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
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
            invOrganizationId:
              record.get('invOrganizationId')?.organizationId ||
              record.get('invOrganizationId')?.invOrganizationId ||
              record.get('invOrganizationId'),
            uomId: record.get('uomId'),
            prLineId: record.get('prLineId'),
          };
        },
      },
    },
    {
      name: 'selectSupplierCompanyId',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'selectSupplierCode',
      bind: 'supplierLov.supplierCompanyNum',
    },
    {
      name: 'selectSupplierCompanyName',
      bind: 'supplierLov.supplierCompanyName',
    },
    {
      name: 'selectSupplierTenantId',
      bind: 'supplierLov.supplierTenantId',
    },
    {
      name: 'priceLibraryId',
      bind: 'supplierLov.priceLibraryId',
    },
    {
      name: 'priceLibId',
      bind: 'supplierLov.priceLibId',
    },
    {
      name: 'selectDisplaySupplierCompanyName',
      ignore: 'always',
      bind: 'supplierLov.displaySupplierCompanyName',
    },
    // {
    //   name: 'unitPrice',
    //   type: 'string',
    //   bind: 'supplierLov.netPrice',
    // },
    // {
    //   name: 'enteredTaxIncludedPrice', //  taxIncludedPrice
    //   type: 'string',
    //   bind: 'supplierLov.taxIncludedPrice',
    // },
    // {
    //   name: 'noUnitPrice',
    //   label: intl.get(`sprm.common.model.common.unitPrice`).d('单价(不含税)'),
    //   type: 'boolean',
    //   trueValue
    // },
    {
      name: 'uomPrecision',
      type: 'number',
    },
    {
      name: 'defaultOrderingAddress',
      label: intl.get(`sprm.common.model.common.defaultOrderingAddress`).d('收货地址'),
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
      label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
      name: 'secondaryUomId',
      lovCode: 'SMDM_ITEM_ORG_UOM',
      textFiled: 'uomCodeAndName',
      transformRequest: (value, record) =>
        value?.secondaryUomId ||
        value?.uomId ||
        record.getPristineValue('secondaryUomId')?.secondaryUomId,
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
      name: 'thisOrderQuantity',
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.thisOrderQuantity`)
        .d('本次下单数量'),
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
        required: ({ record }) => record.isSelected,
      },
      type: 'number',
    },
    {
      name: 'ecLimitQuantity',
      label: intl.get(`sprm.common.model.order.ecLimitQuantity`).d('电商起订量'),
      type: 'number',
    },
    {
      name: 'uomPrecision',
    },
    {
      name: 'occupiedQuantity',
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.occupiedOrderQuantity`)
        .d('已创建单据数量'),
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'restPoQuantity',
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.restPoQuantity`)
        .d('剩余可下单数量'),
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },

    {
      name: 'neededDate',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDate`).d('需求日期'),
      type: 'date',
    },
    {
      name: 'uomId',
      transformRequest: (value, record) => value || record.get('prLineUomId'),
    },
    {
      name: 'uomName',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.uomName`).d('单位'),
      },
      type: 'string',
    },
    {
      name: 'prLineUomCodeAndName',
      label: intl.get(`sprm.common.model.common.prLineUomCodeAndName`).d('申请行单位'),
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
      name: 'projectCategoryMeaning',
      type: 'string',
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
    // {
    //   label: intl
    //     .get('sodr.quotePurchaseRequisition.view.message.accountAssignType')
    //     .d('账户分配类别'),
    //   name: 'accountAssignTypeCode',
    //   type: 'string',
    // },
    {
      label: intl.get('sodr.common.model.common.applicationType').d('申请类型'),
      name: 'prTypeName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.common.model.common.commonName`).d('通用名'),
      name: 'commonName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.currencyCode`).d('币种'),
      name: 'currencyCode',
      type: 'string',
    },
    {
      // label: intl
      //   .get(`sprm.common.model.common.BaseTaxIncludedUnitPrice`)
      //   .d('预估单价(含税)-基本单位'),
      name: 'taxIncludedUnitPrice',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl
                .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
                .d('预估单价(含税)-基本单位')
            : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
      },
    },
    {
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.supplierCode`)
        .d('建议供应商编码'),
      name: 'supplierCode',
      type: 'string',
    },
    {
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.supplierName`)
        .d('建议供应商名称'),
      name: 'supplierName',
      type: 'string',
    },

    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.companyName`).d('公司'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.entity`).d('业务实体'),
      name: 'ouName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseOrgName`).d('采购组织'),
      name: 'purchaseOrgName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.inventory`).d('库存组织'),
      name: 'invOrganizationName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.productCode`).d('商品编码'),
      name: 'productNum',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.productName`).d('商品名称'),
      name: 'productName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.productCatalog`).d('商品目录'),
      name: 'catalogName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.applyPerson`).d('申请人'),
      name: 'prRequestedName',
      type: 'string',
    },
    // {
    //   label: intl.get(`sodr.quotePurchaseRequisition.view.message.phoneNum`).d('联系电话'),
    //   name: 'contactTelNum',
    //   type: 'string',
    // },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.address`).d('收货方地址'),
      name: 'receiverAddress',
      type: 'string',
    },
    {
      label: intl.get('sodr.common.model.common.surfaceManage').d('表面处理'),
      name: 'surfaceTreatFlag',
      type: 'number',
    },
    {
      label: intl.get('sodr.common.model.common.contractNumber').d('协议编号'),
      name: 'pcNum',
      type: 'string',
    },
    {
      label: intl.get('sodr.common.model.common.modelNumber').d('型号'),
      name: 'itemModel',
      type: 'string',
    },
    {
      label: intl.get('sodr.common.model.common.specification').d('规格'),
      name: 'itemSpecs',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.orderSource`).d('来源平台'),
      name: 'prSourcePlatformMeaning',
      type: 'string',
    },
    {
      name: 'changeOrderCode',
      type: 'string',
      label: intl.get('sprm.common.model.autoOrderStatus').d('自动创建PO状态'),
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`).d('是否加急'),
      name: 'urgentFlag',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentDate`).d('加急时间'),
      name: 'urgentDate',
      type: 'dateTime',
    },
    // {
    //   name: 'purchaseAgentName',
    //   label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseAgent`).d('采购员'),
    //   type: 'string',
    // },
    {
      name: 'purchaseAgentId',
      lovCode: 'SPRM.PURCHASE_AGENT',
      type: 'object',
      textField: 'purchaseAgentName',
      lovPara: { tenantId: organizationId },
      label: intl.get(`sprm.common.model.common.purchaseAgents`).d('采购员'),
      transformResponse: (value, object) => {
        return object?.purchaseAgentId
          ? {
              purchaseAgentId: object?.purchaseAgentId,
              purchaseAgentName: object?.purchaseAgentName,
            }
          : {};
      },
      transformRequest: (value) => value && value.purchaseAgentId,
    },
    // {
    //   name: 'purchaseAgentId',
    //   bind: 'purchaseAgentLov.purchaseAgentId',
    // },
    {
      name: 'purchaseAgentName',
      bind: 'purchaseAgentId.purchaseAgentName',
      label: intl.get(`sprm.common.model.common.purchaseAgents`).d('采购员'),
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.demandExecutor`).d('需求执行人'),
      name: 'executorName',
      width: 100,
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
  ],
  // queryFields: [
  //   {
  //     name: 'prNum',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
  //   },
  //   {
  //     name: 'lineNum',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.lineNum`).d('申请行号'),
  //   },
  //   {
  //     name: 'prTypeId',
  //     label: intl.get('sodr.common.model.common.applicationType').d('申请类型'),
  //     type: 'object',
  //     lovCode: 'SPUC.PR_DEMAND_TYPE',
  //     lovPara: { tenantId: organizationId },
  //     transformRequest: (value) => value && value.prTypeId,
  //   },
  //   {
  //     name: 'companyId',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.companyName`).d('公司'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.COMPANY',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.companyId,
  //   },
  //   {
  //     name: 'requestDateFrom',
  //     type: 'date',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.requestDateFrom`).d('需求时间从'),
  //     max: 'requestDateTo',
  //     transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
  //   },
  //   {
  //     name: 'requestDateTo',
  //     type: 'date',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.requestDateTo`).d('需求时间至'),
  //     min: 'requestDateFrom',
  //     transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
  //   },
  //   {
  //     name: 'purchaseOrgId',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseOrgName`).d('采购组织'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.PURORG_CODE',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.purchaseOrgId,
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
  //     name: 'prRequestedById',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.creator`).d('申请人'),
  //     type: 'object',
  //     lovCode: 'SPUC.APPLY.USER',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.id,
  //   },
  //   {
  //     name: 'prRequestedName',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.reqUserName`).d('申请人查询'),
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
  //     name: 'prSourcePlatform',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.orderSource`).d('来源平台'),
  //     lookupCode: 'SPRM.SRC_PLATFORM',
  //     lovPra: { tenantId: organizationId },
  //   },
  //   {
  //     name: 'tempKey',
  //     label: intl.get(`entity.supplier.tag`).d('供应商'),
  //     type: 'object',
  //     lovCode: 'SPRM.SUPPLIER',
  //     lovPara: { tenantId: organizationId },
  //     transformRequest: (value) => ({
  //       supplierCompanyId: value && value.supplierCompanyId,
  //       supplierTenantId: value && value.supplierCompanyId,
  //     }),
  //   },
  //   {
  //     name: 'itemCodes',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
  //     type: 'object',
  //     multiple: true,
  //     lovCode: 'SPRM.ITEM',
  //     textField: 'itemName',
  //     lovPara: { organizationId },
  //   },
  //   {
  //     name: 'itemName',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemName`).d('物料名称'),
  //   },
  //   {
  //     name: 'neededDateFrom',
  //     type: 'date',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDateFrom`).d('需求日期从'),
  //     max: 'neededDateTo',
  //     transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
  //   },
  //   {
  //     name: 'neededDateTo',
  //     type: 'date',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDateTo`).d('需求日期至'),
  //     min: 'neededDateFrom',
  //     transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
  //   },
  //   {
  //     name: 'urgentFlag',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`).d('是否加急'),
  //     lookupCode: 'HPFM.FLAG',
  //     lovPra: { tenantId: organizationId },
  //   },
  //   {
  //     name: 'executorBys',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.executedByName`).d('需求执行人'),
  //     type: 'object',
  //     lovCode: 'SSLM.KPI_USER',
  //     textField: 'userName',
  //     lovPara: { tenantId: organizationId },
  //     ignore: 'always',
  //   },
  //   {
  //     name: 'executedByName',
  //     bind: 'executorBys.userId',
  //   },
  //   {
  //     name: 'changeOrderCode',
  //     type: 'string',
  //     label: intl.get('sprm.common.model.autoOrderStatus').d('自动创建PO状态'),
  //     lookupCode: 'SPRM.PR_APPROVE.CHANGE_ORDER_STATUS',
  //     lovPra: { tenantId: organizationId },
  //   },
  //   {
  //     name: 'categoryId',
  //     type: 'object',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCatalog`).d('物料分类'),
  //     // lovCode: 'SPRM.ITEM_CATEGOR',
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
  // ],

  transport: {
    read: ({ data, params }) => {
      const { itemCodes } = data;
      const newParams = {
        ...data,
        ...params,
        tempKey: undefined,
        supplierQueryParamStr: data.tempKey,
        supplierList: undefined,
        recommendSupplierParamsStr: data.supplierList,
        itemCodes: isArray(itemCodes) ? itemCodes?.map((ele) => ele.itemCode).join(',') : itemCodes,
        erpControlFlag: 1,
        poWorkbenchFlag: 1,
        customizeUnitCode:
          'SPRM.PURCHASE_EXECUTION_ALL.ORDER_LIST,SPRM.PURCHASE_EXECUTION_ALL.ORDER_FILTER',
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
        url: `${SRM_SPRM}/v1/${organizationId}/po-refer-pr/workbench-pr-line`,
        method: 'GET',
        data: filterNullValueObject({
          ...newParams,
          ...otherSupplier,
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
            i.get('selectSupplierCompanyName') ||
            i.get('selectLocalSupplierName') ||
            i.get('supplierLov')?.displaySupplierCompanyName,
        });
      });
    },
    unSelect({ record }) {
      record.set('thisOrderQuantity', record.getPristineValue('thisOrderQuantity'));
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.set('thisOrderQuantity', i.getPristineValue('thisOrderQuantity')));
    },
  },
});

export { orderDs };
