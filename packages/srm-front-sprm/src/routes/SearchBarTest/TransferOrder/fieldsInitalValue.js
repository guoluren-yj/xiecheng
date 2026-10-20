import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SPRM } from '_utils/config';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';

const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  autoQuery: true,
  fields: [
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
      type: 'number',
    },
    {
      name: 'supplierLov',
      label: intl
        .get(`sodr.quotePurchaseRequisition.model.quotePurchaseRequisition.supplierName`)
        .d('供应商'),
      type: 'object',
      lovCode: 'SODR.PR_SUGGEST_SUPPLIER',
      dynamicProps: {
        lovPara: ({ record }) => {
          const {
            data: {
              itemId = null,
              companyId = null,
              ouId = null,
              invOrganizationId = null,
              purchaseOrgId = null,
              uomId,
            },
          } = record;
          // return {
          //   itemId,
          //   companyId,
          //   ouId,
          //   invOrganizationId,
          //   priceSortFlag: 1,
          // };
          return {
            itemId,
            companyId,
            ouId,
            priceSortFlag: 1,
            purchaseOrgId,
            invOrganizationId,
            uomId,
          };
        },
      },
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
              };
            },
          ],
        };
      },
    },
    // {
    //   name: 'priceLibId',
    //   type: 'number',
    //   bind: 'supplierLov.priceLibId',
    // },
    // {
    //   name: 'taxIncludedPrice',
    //   type: 'number',
    //   bind: 'supplierLov.taxIncludedPrice',
    // },
    {
      name: 'selectSupplierCompanyId',
      // type: 'number',
      bind: 'supplierLov.supplierCompanyId',
    },
    // {
    //   name: 'selectSupplierTenantId',
    //   // type: 'number',
    //   bind: 'supplierLov.supplierTenantId',
    // },
    {
      name: 'selectSupplierCode',
      type: 'string',
      bind: 'supplierLov.supplierCompanyNum',
    },
    {
      name: 'selectSupplierCompanyName',
      type: 'string',
      bind: 'supplierLov.supplierCompanyName',
    },

    {
      name: 'noUnitPrice',
      label: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
      type: 'string',
      bind: 'supplierLov.netPrice',
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
    {
      name: 'quantity',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.quantity`).d('数量'),
      type: 'number',
    },
    {
      name: 'thisOrderQuantity',
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.thisOrderQuantity`)
        .d('本次下单数量'),
      type: 'number',
      required: true,
    },
    {
      name: 'occupiedQuantity',
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.occupiedOrderQuantity`)
        .d('已创建单据数量'),
      type: 'number',
    },
    {
      name: 'restPoQuantity',
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.restPoQuantity`)
        .d('剩余可下单数量'),
      type: 'number',
      defaultValue: '123',
    },

    {
      name: 'neededDate',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDate`).d('需求日期'),
      type: 'date',
    },
    {
      name: 'uomName',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.uomCode`).d('单位'),
      type: 'string',
    },

    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
      name: 'projectCategoryMeaning',
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
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.includedPrice`).d('预估单价(含税)'),
      name: 'taxIncludedUnitPrice',
      type: 'number',
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
      type: 'number',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentDate`).d('加急时间'),
      name: 'urgentDate',
      type: 'date',
    },
  ],
  queryFields: [
    {
      name: 'prNum',
      type: 'string',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
    },
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.lineNum`).d('申请行号'),
    },
    {
      name: 'prTypeId',
      label: intl.get('sodr.common.model.common.applicationType').d('申请类型'),
      type: 'object',
      lovCode: 'SPUC.PR_DEMAND_TYPE',
      lovPara: { tenantId: organizationId },
      transformRequest: (value) => value && value.prTypeId,
    },
    {
      name: 'companyId',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.companyName`).d('公司'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.companyId,
    },
    {
      name: 'requestDateFrom',
      type: 'dateTime',
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.requestDateFrom`)
        .d('需求创建时间从'),
      max: 'requestDateTo',
      transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
    },
    {
      name: 'requestDateTo',
      type: 'dateTime',
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.requestDateTo`)
        .d('需求创建时间至'),
      min: 'requestDateFrom',
      transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
    },
    {
      name: 'purchaseOrgId',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseOrgName`).d('采购组织'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURORG_CODE',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.purchaseOrgId,
    },
    {
      name: 'ouId',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.entity`).d('业务实体'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.OU',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.ouId,
    },
    {
      name: 'prRequestedById',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.creator`).d('申请人'),
      type: 'object',
      lovCode: 'SPUC.APPLY.USER',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.id,
    },
    {
      name: 'prRequestedName',
      type: 'string',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.reqUserName`).d('申请人查询'),
    },
    {
      name: 'purchaseAgentId',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseAgent`).d('采购员'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.purchaseAgentId,
    },
    {
      name: 'prSourcePlatform',
      type: 'string',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.orderSource`).d('来源平台'),
      lookupCode: 'SPRM.SRC_PLATFORM',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'tempKey',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
      type: 'object',
      lovCode: 'SPRM.SUPPLIER',
      lovPara: { tenantId: organizationId },
      transformRequest: (value) => ({
        supplierCompanyId: value && value.supplierCompanyId,
        supplierTenantId: value && value.supplierCompanyId,
      }),
    },
    {
      name: 'itemCodes',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
      type: 'object',
      multiple: true,
      lovCode: 'SPRM.ITEM',
      textField: 'itemName',
      lovPara: { organizationId },
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemName`).d('物料名称'),
    },
    {
      name: 'neededDateFrom',
      type: 'date',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDateFrom`).d('需求日期从'),
      max: 'neededDateTo',
      transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
    },
    {
      name: 'neededDateTo',
      type: 'date',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDateTo`).d('需求日期至'),
      min: 'neededDateFrom',
      transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
    },
    {
      name: 'urgentFlag',
      type: 'string',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`).d('是否加急'),
      lookupCode: 'HPFM.FLAG',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'executorBys',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.executedByName`).d('需求执行人'),
      type: 'object',
      lovCode: 'SSLM.KPI_USER',
      lovPara: { tenantId: organizationId },
      transformRequest: (value) => value && value.executedByName,
    },
    {
      name: 'changeOrderCode',
      type: 'string',
      label: intl.get('sprm.common.model.autoOrderStatus').d('自动创建PO状态'),
      lookupCode: 'SPRM.PR_APPROVE.CHANGE_ORDER_STATUS',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'categoryId',
      type: 'object',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCatalog`).d('物料分类'),
      // lovCode: 'SPRM.ITEM_CATEGOR',
      noCache: true,
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.categoryId,
      lovDefineAxiosConfig: (code) => {
        const lovConfig = lovDefineAxiosConfig(code);
        return {
          ...lovConfig,
          transformResponse: [
            ...lovConfig.transformResponse,
            (data) => {
              return {
                ...data,
                treeFlag: 'Y',
                idField: 'categoryId',
                parentIdField: 'parentCategoryId',
              };
            },
          ],
        };
      },
    },
  ],

  transport: {
    read: ({ data, params }) => {
      const { itemCodes = [], tempKey = {} } = data;
      const queryData = {
        ...data,
        ...params,
        ...tempKey,
        tempKey: null,
        itemCodes: itemCodes.map((ele) => ele.itemCode).join(','),
        erpControlFlag: 1,
        customizeUnitCode:
          'SPRM.PURCHASE_REQUISITION_POLL.ORDER_LIST,SPRM.PURCHASE_REQUISITION_POLL.ORDER_FILTER',
      };
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/po-refer-pr/pr-line`,
        method: 'GET',
        data: filterNullValueObject(queryData),
      };
    },
  },
});

export { tableDs };
