import { omit, isNil } from 'lodash';
import { SRM_SPUC, SRM_SPRM } from '_utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getValueField } from '../utils';
import { getPrecision, getDynamicLabel } from '@/routes/components/utils';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

export default ({ organizationId, tenantId }) => {
  return {
    primaryKey: 'prLineId',
    cacheSelection: true,
    cacheModified: true,
    dataToJSON: 'selected',
    transport: {
      read: ({ params, data }) => {
        return {
          url: `${SRM_SPRM}/v1/${tenantId}/po-refer-pr/pr-line`,
          // url: `${SRM_SPUC}/v1/${tenantId}/secondary/po-workbench/from-pr/line`,
          method: 'GET',
          params: {
            ...params,
            ...omit(data, ['displaySupplierName', 'tempKey']),
            erpControlFlag: 1,
            customizeUnitCode:
              'SODR.PURCHASE_REQUISITION_LIST.LINE,SODR.PURCHASE_REQUISITION_LIST.FILTER_LINE',
          },
          data: null,
        };
      },
      submit: ({ data, dataSet }) => {
        const seletedInfo = dataSet.selected || [];
        const _data = data.map((record, idx) => {
          const origin = seletedInfo[idx];
          const { uomId, uomCode } = record;
          return {
            ...record,
            uomId: uomId || origin.getPristineValue('uomId'),
            uomCode: uomCode || origin.getPristineValue('uomCode'),
          };
        });
        return {
          url: `${SRM_SPUC}/v1/${tenantId}/po-header/from-pr/line_new`,
          method: 'POST',
          data: _data.map((i) => ({
            ...i,
            uomCodeTemp: dataSet.getState('doubleUnitEnabled') ? i.secondaryUomCode : i.uomCode,
          })),
        };
      },
    },
    queryFields: [
      {
        name: 'prNum',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
        transformResponse: (value) => value?.value,
      },
      {
        name: 'lineNum',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.lineNum`).d('申请行号'),
      },
      {
        name: 'prTypeIds',
        type: 'object',
        label: intl.get('sodr.common.model.common.applicationType').d('申请类型'),
        lovCode: 'SPUC.PR_DEMAND_TYPE',
        multiple: true,
        lovPara: {
          tenantId,
        },
        transformRequest(value, record) {
          const valueField = getValueField(record, 'prTypeIds');
          return value && value.map((v) => v[valueField]).join(',');
        },
      },
      {
        name: 'companyIds',
        type: 'object',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.companyName`).d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        multiple: true,
        lovPara: {
          organizationId,
        },
        transformResponse: (value) =>
          value
            ? [{ companyId: value?.value, companyName: value?.meaning, companyNum: value?.code }]
            : [],
        transformRequest(value, record) {
          const valueField = getValueField(record, 'companyIds');
          return value && value.map((v) => v[valueField]).join(',');
        },
      },
      {
        name: 'requestDateFrom',
        type: 'date',
        label: intl.get(`sodr.common.model.common.requestDateFrom`).d('申请日期从'),
        max: 'requestDateTo',
      },
      {
        name: 'requestDateTo',
        type: 'date',
        label: intl.get(`sodr.common.model.common.requestDateTo`).d('申请日期至'),
        min: 'requestDateFrom',
      },
      {
        name: 'purchaseOrgId',
        type: 'object',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseOrgName`).d('采购组织'),
        lovCode: 'SPFM.USER_AUTH.PURORG_CODE',
        lovPara: {
          organizationId,
        },
        transformResponse: (value) =>
          value
            ? {
                purchaseOrgId: value?.value,
                organizationName: value?.meaning,
                organizationCode: value?.code,
              }
            : undefined,
        transformRequest(value, record) {
          return value && value[getValueField(record, 'purchaseOrgId')];
        },
      },
      {
        name: 'ouIds',
        type: 'object',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.entity`).d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        multiple: true,
        lovPara: {
          organizationId,
        },
        transformResponse: (value) =>
          value ? [{ ouId: value?.value, ouName: value?.meaning, ouCode: value?.code }] : [],
        transformRequest(value, record) {
          const valueField = getValueField(record, 'ouIds');
          return value && value.map((v) => v[valueField]).join(',');
        },
      },
      {
        name: 'createdBy',
        type: 'object',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.creator`).d('申请人'),
        lovCode: 'SPUC.APPLY.USER',
        textField: 'realName',
        lovPara: {
          organizationId: tenantId,
        },
        transformRequest(value, record) {
          return value && value[getValueField(record, 'createdBy')];
        },
      },
      {
        name: 'reqUserName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.reqUserName`).d('申请人查询'),
      },
      {
        name: 'purchaseAgentIds',
        type: 'object',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseAgent`).d('采购员'),
        lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
        multiple: true,
        lovPara: {
          organizationId,
        },
        transformResponse: (value) =>
          value
            ? [
                {
                  purchaseAgentId: value?.value,
                  purchaseAgentName: value?.meaning,
                  purchaseAgentCode: value?.code,
                },
              ]
            : [],
        transformRequest(value, record) {
          const valueField = getValueField(record, 'purchaseAgentIds');
          return value && value.map((v) => v[valueField]).join(',');
        },
      },
      {
        name: 'prSourcePlatform',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.orderSource`).d('来源平台'),
        lookupCode: 'SPRM.SRC_PLATFORM',
        // options: sourceDs,
        transformResponse: (value) => value?.value,
      },
      {
        name: 'tempKey',
        type: 'object',
        label: intl.get(`entity.supplier.tag`).d('供应商'),
        lovCode: 'SPRM.SUPPLIER',
        lovPara: {
          tenantId,
        },
        transformRequest(value, record) {
          return value && value[getValueField(record, 'tempKey')];
        },
      },
      {
        name: 'supplierId',
        bind: 'tempKey.supplierId',
      },
      {
        name: 'supplierCompanyId',
        bind: 'tempKey.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        bind: 'tempKey.supplierTenantId',
      },
      {
        name: 'itemCodes',
        type: 'object',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
        lovCode: 'SPRM.ITEM',
        textField: 'itemCode',
        valueField: 'itemCode',
        multiple: true,
        lovPara: {
          organizationId,
          tenantId,
        },
        transformRequest(value) {
          return value && value.map((v) => v.itemCode).join(',');
        },
      },
      {
        name: 'itemName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemName`).d('物料名称'),
      },
      {
        name: 'categoryIds',
        type: 'object',
        label: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
        lovCode: 'SPRM.ITEM_CATEGOR_NEW_TREE',
        textField: 'categoryName',
        valueField: 'categoryId',
        multiple: true,
        lovPara: {
          tenantId,
        },
        optionsProps: {
          paging: 'server',
        },
        transformRequest(value) {
          return value && value.map((v) => v.categoryId).join(',');
        },
      },
      {
        name: 'neededDateFrom',
        type: 'date',
        label: intl
          .get(`sodr.quotePurchaseRequisition.view.message.neededDateFrom`)
          .d('需求日期从'),
        max: 'neededDateTo',
      },
      {
        name: 'neededDateTo',
        type: 'date',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDateTo`).d('需求日期至'),
        min: 'neededDateFrom',
      },
      {
        name: 'urgentFlag',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`).d('是否加急'),
        lookupCode: 'HPFM.FLAG',
        // options: flagDs,
      },
      {
        name: 'executedByName',
        type: 'object',
        label: intl
          .get(`sodr.quotePurchaseRequisition.view.message.executedByName`)
          .d('需求执行人'),
        lovCode: 'SSLM.KPI_USER',
        lovPara: {
          tenantId,
        },
        transformRequest(value, record) {
          return value && value[getValueField(record, 'executedByName')];
        },
      },
      {
        name: 'invOrganizationIds',
        type: 'object',
        label: intl
          .get(`sodr.quotePurchaseRequisition.view.message.invOrganizationIds`)
          .d('库存组织'),
        lovCode: 'HPFM.INV_ORG',
        multiple: true,
        lovPara: {
          tenantId,
          enabledFlag: 1,
        },
        transformResponse: (value) =>
          value
            ? [
                {
                  organizationId: value.value,
                  organizationName: value.meaning,
                  organizationCode: value.code,
                },
              ]
            : [],
        transformRequest(value, record) {
          const valueField = getValueField(record, 'invOrganizationIds');
          return value && value.map((v) => v[valueField]).join(',');
        },
      },
    ],
    fields: [
      {
        name: 'prNum',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
      },
      { name: 'displayLineNum', label: intl.get(`sodr.common.model.common.lineNum`).d('行号') },
      {
        name: 'itemCode',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemName`).d('物料名称'),
      },
      {
        name: 'categoryName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCatalog`).d('物料分类'),
      },
      {
        name: 'referencePrice',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.referencePrice`).d('参考价格'),
      },
      {
        name: 'priceLibraryId',
        type: 'object',
        label: intl
          .get(`sodr.quotePurchaseRequisition.model.quotePurchaseRequisition.supplierName`)
          .d('供应商'),
        lovCode: 'SODR.PR_SUGGEST_SUPPLIER',
        transformResponse(value) {
          return {
            priceLibraryId: value,
          };
        },
        transformRequest(value) {
          return (
            value &&
            (value.priceLibId === null || value.priceLibId === undefined
              ? null
              : value.priceLibraryId)
          );
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              priceSortFlag: 1,
              ...record.get([
                'itemId',
                'companyId',
                'ouId',
                'purchaseOrgId',
                'invOrganizationId',
                'uomId',
                'prLineId',
                'currencyCode',
                'categoryId',
              ]),
            };
          },
        },
      },
      { name: 'selectSupplierCompanyId', bind: 'priceLibraryId.supplierCompanyId' },
      { name: 'selectSupplierTenantId', bind: 'priceLibraryId.supplierTenantId' },
      { name: 'selectSupplierCode', bind: 'priceLibraryId.supplierCompanyNum' },
      { name: 'selectSupplierCompanyName', bind: 'priceLibraryId.supplierCompanyName' },
      {
        name: 'unitPrice',
        max: MAX_QUAN_NUMBER,
        bind: 'priceLibraryId.netPrice',
      },
      { name: 'ladderQuotationFlag', bind: 'priceLibraryId.ladderQuotationFlag' },
      { name: 'ladderPriceLibId', bind: 'priceLibraryId.ladderPriceLibId' },
      { name: 'contractNum', bind: 'priceLibraryId.contractNum' },
      { name: 'holdPcLineId', bind: 'priceLibraryId.holdPcLineId' },
      { name: 'holdPcHeaderId', bind: 'priceLibraryId.holdPcHeaderId' },
      { name: 'unitPriceBatch', bind: 'priceLibraryId.unitPriceBatch' },
      { name: 'taxIncludedPrice', bind: 'priceLibraryId.taxIncludedPrice' },
      { name: 'priceLibId', bind: 'priceLibraryId.priceLibId' },
      { name: 'uomId', bind: 'priceLibraryId.uomId' },
      { name: 'taxId', bind: 'priceLibraryId.taxId' },
      { name: 'taxRate', bind: 'priceLibraryId.taxRate', max: MAX_QUAN_NUMBER },
      { name: 'benchmarkPriceType', bind: 'priceLibraryId.benchmarkPriceType' },
      {
        name: 'noUnitPrice',
        type: 'number',
        label: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
        bind: 'priceLibraryId.unitPrice',
      },
      {
        name: 'selectDisplaySupplierCompanyName',
        ignore: 'always',
        bind: 'priceLibraryId.displaySupplierCompanyName',
      },
      {
        name: 'secondaryQuantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.quantity`).d('数量'),
      },
      {
        name: 'thisOrderQuantity',
        type: 'number',
        label: intl
          .get(`sodr.quotePurchaseRequisition.view.message.thisOrderQuantity`)
          .d('本次下单数量'),
        dynamicProps: {
          required({ record }) {
            return record.isSelected;
          },
          precision({ record, dataSet }) {
            const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
            return doubleUnitEnabled
              ? getPrecision(record.get('secondaryUomPrecision'))
              : getPrecision(record.get('uomPrecision'));
          },
        },
        validator(value, _, record) {
          const { restPoQuantity, orderExcessRuleCode } = record.get([
            'restPoQuantity',
            'orderExcessRuleCode',
          ]);
          if (
            !value ||
            value < 0 ||
            (value > restPoQuantity &&
              !['DISPOSABLE_EXCESS', 'INFINITY_EXCESS'].includes(orderExcessRuleCode))
          ) {
            return intl.get(`sodr.orderType.view.message.numberError`).d('大于0小于剩余可下单数量');
          }
          return true;
        },
      },
      {
        name: 'occupiedQuantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl
          .get(`sodr.quotePurchaseRequisition.view.message.occupiedOrderQuantity`)
          .d('已创建单据数量'),
      },
      {
        name: 'restPoQuantity',
        type: 'number',
        label: intl
          .get(`sodr.quotePurchaseRequisition.view.message.restPoQuantity`)
          .d('剩余可下单数量'),
      },
      {
        name: 'secondaryUomName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.uomCode`).d('单位'),
        // bind: 'priceLibraryId.uomName',
      },
      {
        name: 'quantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          label: ({ dataSet }) =>
            getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
        },
      },
      {
        name: 'uomName',
        bind: 'priceLibraryId.uomName',
        dynamicProps: {
          label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
        },
      },
      {
        name: 'neededDate',
        type: 'date',
        // order: 'desc',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDate`).d('需求日期'),
      },
      {
        name: 'projectCategoryMeaning',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
      },
      {
        name: 'accountAssignTypeCode',
        label: intl
          .get('sodr.quotePurchaseRequisition.view.message.accountAssignType')
          .d('账户分配类别'),
      },
      {
        name: 'prTypeName',
        label: intl.get('sodr.common.model.common.applicationType').d('申请类型'),
      },
      { name: 'commonName', label: intl.get(`sodr.common.model.common.commonName`).d('通用名') },
      {
        name: 'currencyCode',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.currencyCode`).d('币种'),
        bind: 'priceLibraryId.currencyCode',
      },
      {
        name: 'taxIncludedUnitPrice',
        type: 'number',
        label: intl
          .get(`sodr.quotePurchase.model.quotePurchase.includedPrice`)
          .d('预估单价（含税）'),
      },
      {
        name: 'supplierCode',
        label: intl
          .get(`sodr.quotePurchaseRequisition.view.message.supplierCode`)
          .d('建议供应商编码'),
      },
      {
        name: 'supplierName',
        label: intl
          .get(`sodr.quotePurchaseRequisition.view.message.supplierName`)
          .d('建议供应商名称'),
      },
      {
        name: 'companyName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.companyName`).d('公司'),
      },
      {
        name: 'ouName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.entity`).d('业务实体'),
      },
      {
        name: 'purchaseOrgName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseOrgName`).d('采购组织'),
      },
      {
        name: 'invOrganizationName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.inventory`).d('库存组织'),
      },
      {
        name: 'productNum',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.productCode`).d('商品编码'),
      },
      {
        name: 'productName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.productName`).d('商品名称'),
      },
      {
        name: 'catalogName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.productCatalog`).d('商品目录'),
      },
      {
        name: 'prRequestedName',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.applyPerson`).d('申请人'),
      },
      {
        name: 'contactTelNum',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.phoneNum`).d('联系电话'),
      },
      {
        name: 'receiverAddress',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.address`).d('收货方地址'),
      },
      {
        name: 'surfaceTreatFlag',
        label: intl.get('sodr.common.model.common.surfaceManage').d('表面处理'),
      },
      { name: 'pcNum', label: intl.get('sodr.common.model.common.contractNumber').d('协议编号') },
      { name: 'itemModel', label: intl.get('sodr.common.model.common.modelNumber').d('型号') },
      { name: 'itemSpecs', label: intl.get('sodr.common.model.common.specification').d('规格') },
      { name: 'remark', label: intl.get('hzero.common.remark').d('备注') },
      {
        name: 'prSourcePlatformMeaning',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.orderSource`).d('来源平台'),
      },
      {
        name: 'urgentFlag',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`).d('是否加急'),
      },
      {
        name: 'urgentDate',
        type: 'dateTime',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentDate`).d('加急时间'),
      },
      {
        name: 'docFlow',
        label: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
      },
    ],
    events: {
      load({ dataSet }) {
        dataSet.forEach((i) => {
          i.init({
            selectDisplaySupplierCompanyName: isNil(i.get('selectSupplierCompanyName'))
              ? i.get('selectLocalSupplierName')
              : i.get('selectSupplierCompanyName'),
          });
        });
      },
      update({ name, record, value, dataSet }) {
        if (name === 'priceLibraryId') {
          const {
            uomId,
            uomName,
            uomCode,
            uomCodeAndName,
            benchmarkPriceType,
            netPrice,
            taxIncludedPrice,
            supplierNum,
            supplierId,
            supplierName,
            supplierCompanyId,
          } = value || {};
          const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
          if ([0, 1, 2].includes(doubleUnitEnabled)) {
            const sodrEnabled = doubleUnitEnabled !== 0;
            if (value && sodrEnabled && record.getPristineValue('uomId') !== uomId) {
              notification.error({
                message: intl
                  .get(`sodr.common.view.message.validateUomId`)
                  .d(
                    '该物料在价格库的单位与物料主数据中的基本单位不一致，请检查价格库或物料主数据后重新操作'
                  ),
              });
              record.reset();
              // record.getField('priceLibraryId').reset();
            }
            if (!sodrEnabled) {
              record.set({
                secondaryUomId: uomId,
                secondaryUomName: uomName,
                secondaryUomCode: uomCode,
                secondaryUomCodeAndName: uomCodeAndName,
              });
            }
          }
          record.set({
            originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
            enteredTaxIncludedPrice: taxIncludedPrice,
            selectLocalSupplierCode: isNil(supplierCompanyId) ? null : supplierNum,
            selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
            selectLocalSupplierName: isNil(supplierCompanyId) ? null : supplierName,
          });
        }
      },
    },
  };
};
