import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';

const tableDs = () => ({
  autoQuery: true,
  cacheSelection: true,
  cacheModified: true,
  primaryKey: 'prLineId',
  fields: [
    {
      label: intl.get(`spcm.common.model.prNum`).d('申请编号'),
      name: 'prNum',
      width: 160,
      fixed: 'left',
    },
    {
      label: intl.get(`spcm.common.model.lineNum`).d('行号'),
      name: 'lineNum',
      width: 160,
      fixed: 'left',
    },
    {
      label: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
      name: 'itemCode',
      fixed: 'left',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
      name: 'itemName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
      name: 'categoryName',
      width: 160,
    },
    {
      name: 'taxIncludedUnitPrice',
      width: 160,
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl
                .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
                .d('预估单价(含税)-基本单位')
            : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
      },
      type: 'number',
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
      label: intl.get(`sprm.common.model.common.taxIncludeUnitPrice`).d('预估单价(含税)'),
      name: 'secondaryTaxInUnitPrice',
      width: 160,
      type: 'number',
    },
    {
      label: intl.get(`spcm.common.model.common.taxType`).d('税种'),
      name: 'taxCode',
      width: 160,
      // render: val => numberRender(val, 2),
    },
    {
      label: intl.get(`spcm.common.model.common.taxRate`).d('税率'),
      name: 'taxRate',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.common.currencyCode`).d('币种'),
      name: 'currencyCode',
      width: 160,
    },
    {
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.uomName`).d('单位'),
      },
      name: 'uomName',
      width: 160,
    },
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
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.common.availableQuantity`).d('可用数量'),
      name: 'occupiedQuantity',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.common.executionStatusCode`).d('执行状态'),
      name: 'executionStatusCodeMeaning',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.reqTypeCode`).d('申请类型'),
      name: 'reqTypeCode',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.supplierCode`).d('供应商编码'),
      name: 'supplierCode',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.supplierName`).d('供应商名称'),
      name: 'supplierName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.companyName`).d('公司'),
      name: 'companyName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
      name: 'ouName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.purchaseOrgName`).d('采购组织'),
      name: 'purchaseOrgName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.purchaseOrgGroupName`).d('采购组'),
      name: 'agentName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.invOrganizationName`).d('库存组织'),
      name: 'invOrganizationName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.productNum`).d('商品编码'),
      name: 'productNum',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.productName`).d('商品名称'),
      name: 'productName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.catalogName`).d('商品目录'),
      name: 'catalogName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.prRequestedName`).d('申请人'),
      name: 'prRequestedName',
      width: 160,
    },
    // {
    //   label: intl.get(`spcm.common.model.common.telNum`).d('联系电话'),
    //   name: 'contactTelNum',
    //   width: 160,
    // },
    {
      label: intl.get(`spcm.common.model.invoiceAddress`).d('收货方地址'),
      name: 'invoiceAddress',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.neededDate`).d('需求日期'),
      name: 'neededDate',
      width: 160,
      tyep: 'date',
    },
    // {
    //   label: intl.get(`spcm.common.model.companyOrgName`).d('公司组织'),
    //   name: 'companyOrgName',
    //   width: 160,
    // },
    // {
    //   label: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
    //   name: 'costAnchDepDesc',
    //   width: 160,
    // },
    // {
    //   label: intl.get(`spcm.common.model.companyOrgName`).d('公司组织'),
    //   name: 'companyOrgName',
    //   width: 160,
    // },
    // {
    //   label: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
    //   name: 'costAnchDepDesc',
    //   width: 160,
    // },
    {
      label: intl.get(`spcm.common.model.location`).d('地点'),
      name: 'locationMeaning',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.projectCode`).d('项目编码'),
      name: 'projectNum',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.projectName`).d('项目名称'),
      name: 'projectName',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.prSourcePlatformMeaning`).d('来源平台'),
      name: 'prSourcePlatformMeaning',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
      name: 'urgentFlag',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.urgentDate`).d('加急时间'),
      name: 'urgentDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`hzero.common.date.creation`).d('创建日期'),
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      width: 160,
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
      label: intl.get(`spcm.common.model.lineNum`).d('行号'),
    },
    {
      name: 'companyId',
      label: intl.get(`spcm.common.model.companyName`).d('公司'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.companyId,
    },
    {
      name: 'createdDateStart',
      type: 'dateTime',
      label: intl.get(`sodr.orderMaintenanceEntry.model.common.creation.from`).d('创建时间从'),
      max: 'createdDateEnd',
      transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
    },
    {
      name: 'createdDateEnd',
      type: 'dateTime',
      label: intl.get('hzero.common.creation.to').d('创建时间至'),
      min: 'createdDateStart',
      transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
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
      name: 'purchaseOrgId',
      label: intl.get(`spcm.common.model.purchaseOrgName`).d('采购组织'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURORG',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.purchaseOrgId,
    },
    {
      label: intl.get('entity.roles.proposer').d('申请人'),
      name: 'prRequestedName',
      type: 'string',
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
      name: 'supplierCompanyId',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
      type: 'object',
      lovCode: 'SPRM.SUPPLIER',
      lovPara: { tenantId: organizationId, organizationId },
      transformRequest: (value) => value && value.supplierCompanyId,
    },
    {
      name: 'itemCode',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
      type: 'object',
      lovCode: 'SPRM.ITEM',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.itemCode,
    },
    {
      label: intl.get(`spcm.common.model.productNum`).d('商品编码'),
      name: 'productNum',
      type: 'string',
    },
    {
      name: 'neededDateStart',
      type: 'dateTime',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDateFrom`).d('需求日期从'),
      max: 'neededDateEnd',
      transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
    },
    {
      name: 'neededDateEnd',
      type: 'dateTime',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDateTo`).d('需求日期至'),
      min: 'neededDateStart',
      transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
    },
    {
      name: 'urgentFlag',
      type: 'string',
      label: intl.get(`${commonPrompt}.urgentFlag`).d('是否加急'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'prRequestedNameQuery',
      type: 'string',
      label: intl.get(`sprm.common.model.common.prMan`).d('申请人'),
    },
  ],

  transport: {
    read: (values) => {
      const { data, params } = values;
      const newParams = {
        ...data,
        ...params,
      };
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/prLine/page`,
        method: 'GET',
        data: {
          ...newParams,
          demandPoolOrWorkbenchFlag: 1,
          erpControlFlag: 1,
          assignedFlag: 1,
          pactWorkbenchFlag: 0,
          tenantId: organizationId,
          customizeUnitCode:
            'SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_LIST,SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_FILTER',
        },
      };
    },
  },
});

export { tableDs };
