import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';
import { isEmpty } from 'lodash';
// import moment from 'moment';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
// const commonPrompt = 'sprm.common.model.common';

const contractDs = ({ initCuxTablePageSize }) => ({
  autoQuery: false,
  cacheSelection: true,
  primaryKey: 'prLineId',
  pageSize: initCuxTablePageSize || 20,
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
      name: 'contractDocType',
      label: intl.get(`spcm.common.model.common.contractDocType`).d('协议单据类型'),
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
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl
                .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
                .d('预估单价(含税)-基本单位')
            : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
      },
      name: 'taxIncludedUnitPrice',
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
      width: 160,
    },
    {
      name: 'uomPrecision',
      type: 'number',
    },
    {
      name: 'quantity',
      type: 'number',
      width: 160,
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
      label: intl.get(`spcm.common.model.common.availableQuantity`).d('可用数量'),
      name: 'occupiedQuantity',
      type: 'number',
      width: 160,
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
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
      name: 'supplierLov',
      label: intl.get('sodr.workspace.model.common.recommendedSupplier').d('推荐供应商'),
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
            purchaseOrgId: record.get('purchaseOrgId'),
            invOrganizationId: record.get('invOrganizationId'),
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
    {
      name: 'referencePriceFlag',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.referencePrice`).d('参考价格'),
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
      label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
      name: 'expBearDep',
    },
    {
      label: intl.get(`spcm.common.model.invoiceAddress`).d('收货方地址'),
      name: 'invoiceAddress',
      width: 160,
    },
    {
      label: intl.get(`spcm.common.model.neededDate`).d('需求日期'),
      name: 'neededDate',
      type: 'date',
      width: 160,
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
    {
      label: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
      name: 'costAnchDepDesc',
      width: 160,
    },
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
      width: 160,
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
  //     label: intl.get(`spcm.common.model.lineNum`).d('行号'),
  //   },
  //   {
  //     name: 'companyId',
  //     label: intl.get(`spcm.common.model.companyName`).d('公司'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.COMPANY',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.companyId,
  //   },
  //   {
  //     name: 'createdDateStart',
  //     type: 'dateTime',
  //     label: intl.get(`sodr.orderMaintenanceEntry.model.common.creation.from`).d('创建时间从'),
  //     max: 'createdDateEnd',
  //     transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
  //   },
  //   {
  //     name: 'createdDateEnd',
  //     type: 'dateTime',
  //     label: intl.get('hzero.common.creation.to').d('创建时间至'),
  //     min: 'createdDateStart',
  //     transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
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
  //     name: 'purchaseOrgId',
  //     label: intl.get(`spcm.common.model.purchaseOrgName`).d('采购组织'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.PURORG',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.purchaseOrgId,
  //   },
  //   {
  //     label: intl.get('entity.roles.proposer').d('申请人'),
  //     name: 'prRequestedName',
  //     type: 'string',
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
  //     name: 'supplierCompanyId',
  //     label: intl.get(`entity.supplier.tag`).d('供应商'),
  //     type: 'object',
  //     lovCode: 'SPRM.SUPPLIER',
  //     lovPara: { tenantId: organizationId },
  //     // transformRequest: (value) => value && value.tempKey,
  //   },
  //   {
  //     name: 'itemCode',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
  //     type: 'object',
  //     lovCode: 'SPRM.ITEM',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.itemCode,
  //   },
  //   {
  //     label: intl.get(`spcm.common.model.productNum`).d('商品编码'),
  //     name: 'productNum',
  //     type: 'string',
  //   },
  //   {
  //     name: 'neededDateStart',
  //     type: 'dateTime',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDateFrom`).d('需求日期从'),
  //     max: 'neededDateEnd',
  //     transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
  //   },
  //   {
  //     name: 'neededDateEnd',
  //     type: 'dateTime',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDateTo`).d('需求日期至'),
  //     min: 'neededDateStart',
  //     transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
  //   },
  // ],

  transport: {
    read: (values) => {
      const { data = {}, params } = values;
      const { displayLineNum } = data;
      const createdDate = data.creationDate_range?.split(',');
      const neededDate = data.neededDate_range?.split(',');
      const newParams = {
        ...data,
        // supplierCompanyId: supplierCompanyId ? supplierCompanyId.supplierCompanyId : null,
        // supplierTenantId: supplierCompanyId ? supplierCompanyId.supplierTenantId : null,
        lineNum: displayLineNum,
        recommendSupplierParamsStr: data.tempKey,
        tempKey: null,
        createdDateStart: createdDate ? createdDate[0] : null,
        createdDateEnd: createdDate ? createdDate[1] : null,
        neededDateStart: neededDate ? neededDate[0] : null,
        neededDateEnd: neededDate ? neededDate[1] : null,
        ...params,
      };
      const otherSupplier = {};
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
        url: `${SRM_SPCM}/v1/${organizationId}/prLine/page`,
        method: 'GET',
        data: {
          ...newParams,
          erpControlFlag: 1,
          demandPoolOrWorkbenchFlag: 1,
          assignedFlag: 1,
          pactWorkbenchFlag: 1, // 区分需求池还是执行工作台
          tenantId: organizationId,
          customizeUnitCode:
            'SPRM.PURCHASE_EXECUTION_ALL.CONTRACT_LIST,SPRM.PURCHASE_EXECUTION_ALL.CONTRACT_FILTER',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
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
  },
});

export { contractDs };
