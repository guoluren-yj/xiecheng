import { isNil } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC, SRM_SPRM, SRM_SSRC, SRM_SPCM } from '_utils/config';
import { getPrecision, getDynamicLabel } from '@/routes/components/utils';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const organizationId = getCurrentOrganizationId();

// 引用采购申请-整单
const wholePurchaseRequest = () => ({
  dataToJSON: 'selected',
  selection: 'single',
  pageSize: 20,
  fields: [
    {
      name: 'prNum',
      label: intl.get('sodr.workspace.model.common.prNum').d('采购申请编号'),
    },
    {
      name: 'title',
      label: intl.get('sodr.workspace.model.common.title').d('标题'),
    },
    {
      name: 'companyName',
      label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'organizationName',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
    },
    {
      name: 'requestedName',
      label: intl.get('sodr.workspace.model.common.requestedName').d('申请人'),
    },
    {
      name: 'requestDate',
      type: 'date',
      label: intl.get('sodr.workspace.model.common.requestDate').d('申请日期'),
    },
    {
      name: 'urgentFlag',
      label: intl.get('sodr.workspace.model.common.urgentFlag').d('是否加急'),
    },
    {
      name: 'ecSupplierCompanyName',
      label: intl.get('sodr.common.model.common.proposalSupplierName').d('建议供应商'),
    },
    {
      name: 'urgentDate',
      type: 'date',
      label: intl.get('sodr.workspace.model.common.urgentDate').d('加急日期'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    customizeUnitCode:
      'SODR.WORKSPACE_WHOLEPURCHASEREQUEST.SEARCH,SODR.WORKSPACE_WHOLEPURCHASEREQUEST.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/po-refer-pr/pr-header`,
        method: 'GET',
      };
    },
    submit: ({ data }) => {
      const { prHeaderId } = data[0];
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/header`,
        method: 'POST',
        params: {
          prHeaderId,
          poWorkbenchFlag: 1,
        },
      };
    },
  },
});

// 引用采购申请-明细
const purchaseRequest = ({ remote }) => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'prLineId',
  modifiedCheck: false,
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'prNum',
      label: intl.get('sodr.workspace.model.common.prNum').d('采购申请编号'),
    },
    {
      name: 'displayLineNum',
      label: intl.get('sodr.workspace.model.common.displayLineNum').d('行号'),
    },
    {
      name: 'itemCode',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
    },
    {
      name: 'referencePrice',
      label: intl.get('sodr.workspace.model.common.referencePrice').d('参考价格'),
    },
    {
      name: 'orderSupplierLov',
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
            orderTypeId: record.get('orderTypeId'),
            orderTypeCode: record.get('orderTypeCode'),
            categoryId: record.get('categoryId'),
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
      name: 'selectSupplierCompanyName',
      bind: 'orderSupplierLov.supplierCompanyName',
    },
    {
      name: 'selectSupplierTenantId',
      bind: 'orderSupplierLov.supplierTenantId',
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
      name: 'secondaryQuantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      dynamicProps: {
        precision: ({ record }) => record.get('secondaryUomPrecision'),
      },
    },
    {
      name: 'thisOrderQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.thisOrderQuantity').d('本次下单数量'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('transactionMode') === 'TRIPARTITE',
        precision: ({ record, dataSet }) =>
          getPrecision(
            record.get(
              dataSet.getState('doubleUnitEnabled') ? 'secondaryUomPrecision' : 'uomPrecision'
            )
          ),
      },
      validator: (value, name, record) => {
        if (!record.isSelected) return true;
        const { restPoQuantity, orderExcessRuleCode } = record.get([
          'restPoQuantity',
          'orderExcessRuleCode',
        ]);
        if (value <= 0) {
          return intl
            .get('sodr.workspace.view.message.greaterThanZero')
            .d('本次下单数量必须大于零');
        }
        if (
          !isNil(restPoQuantity) &&
          restPoQuantity < value &&
          !['DISPOSABLE_EXCESS', 'INFINITY_EXCESS'].includes(orderExcessRuleCode)
        ) {
          return intl
            .get('sodr.workspace.view.message.greaterThanResidue')
            .d('本次下单数量大于剩余可下单数量');
        }
        return true;
      },
    },
    {
      name: 'restPoQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.restPoQuantity').d('剩余可下单数量'),
      dynamicProps: {
        precision: ({ record, dataSet }) =>
          getPrecision(
            record.get(
              dataSet.getState('doubleUnitEnabled') ? 'secondaryUomPrecision' : 'uomPrecision'
            )
          ),
      },
    },
    {
      name: 'neededDate',
      type: 'date',
      label: intl.get('sodr.workspace.model.common.neededDate').d('需求日期'),
    },
    {
      name: 'secondaryUomName',
      label: intl.get('sodr.workspace.model.common.uom').d('单位'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('uomPrecision'),
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    // 以下uomId与uomCode仅为了统一处理清空推荐供应商场景下将申请的单位带到uom字段上
    {
      name: 'uomId',
      transformRequest: (value, record) => value || record.get('prLineUomId'),
    },
    {
      name: 'uomCode',
      transformRequest: (value, record) => value || record.get('prLineUomCode'),
    },
    {
      name: 'uomName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
    },
    {
      name: 'noUnitPrice',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.noUnitPrices').d('单价(不含税)'),
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'taxIncludedUnitPrice',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.taxIncludedUnitPrice').d('预估单价（含税）'),
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'supplierCode',
      label: intl.get('sodr.workspace.model.common.proposalSupplierCode').d('建议供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sodr.workspace.model.common.proposalSupplierName').d('建议供应商名称'),
    },
    {
      name: 'companyName',
      label: intl.get('sodr.workspace.model.common.company').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get('sodr.workspace.model.common.purchaseOrgName').d('采购组织'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('sodr.workspace.model.common.invOrganizationName').d('库存组织'),
    },
    {
      name: 'prTypeName',
      label: intl.get('sodr.workspace.model.common.prTypeName').d('申请类型'),
    },
    {
      name: 'categoryName',
      label: intl.get('sodr.workspace.model.common.categoryName').d('物料分类'),
    },
    {
      name: 'productNum',
      label: intl.get('sodr.workspace.model.common.productNum').d('商品编码'),
    },
    {
      name: 'productName',
      label: intl.get('sodr.workspace.model.common.productName').d('商品名称'),
    },
    {
      name: 'catalogName',
      label: intl.get('sodr.workspace.model.common.catalogName').d('商品目录'),
    },
    {
      name: 'prRequestedName',
      label: intl.get('sodr.workspace.model.common.prRequestedName').d('申请人'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('sodr.workspace.model.common.linePurchaseAgentName').d('行采购员'),
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.itemRemark').d('备注'),
    },
    {
      name: 'prSourcePlatform',
      label: intl.get('sodr.workspace.model.common.prSourcePlatform').d('来源平台'),
    },
    {
      name: 'urgentFlag',
      label: intl.get('sodr.workspace.model.common.urgentFlag').d('是否加急'),
    },
    {
      name: 'urgentDate',
      label: intl.get('sodr.workspace.model.common.urgentDate').d('加急时间'),
    },
    {
      name: 'occupiedQuantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.occupiedQuantity').d('已创建单据数量'),
    },
    {
      name: 'itemSpecs',
      label: intl.get('sodr.workspace.model.common.itemSpecs').d('规格'),
    },
    {
      name: 'itemModel',
      label: intl.get('sodr.workspace.model.common.itemModal').d('型号'),
    },
    {
      name: 'projectCategory',
      label: intl.get('sodr.workspace.model.common.projectCategory').d('项目类别'),
    },
    {
      name: 'accountAssignTypeCode',
      label: intl.get('sodr.workspace.model.common.accountAssignTypeCode').d('账户分配类别'),
    },
    {
      name: 'commonName',
      label: intl.get('sodr.workspace.model.common.commonName').d('通用名'),
    },
    // 暂时隐藏
    // {
    //   name: 'enteredTaxIncludedPrice',
    //   type: 'number',
    //   label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrice').d('含税单价'),
    // },
    // {
    //   name: 'priceSourceNumber', // 待定
    //   label: intl.get('sodr.workspace.model.common.priceSourceNumber').d('价格来源单据号'),
    // },
    {
      name: 'contactTelNum',
      label: intl.get('sodr.workspace.model.common.contactTelNum').d('联系电话'),
    },
    {
      name: 'receiverAddress',
      label: intl.get('sodr.workspace.model.common.receiverAddress').d('收货方地址'),
    },
    {
      name: 'docFlow',
      label: intl.get(`sodr.workspace.model.common.docFlow`).d('单据流'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
    },
    {
      name: 'projectTaskId',
      label: intl.get(`sodr.workspace.model.common.projectTaskId`).d('项目任务名称'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    erpControlFlag: 1,
    customizeUnitCode: 'SODR.WORKSPACE_PURCHASEREQUEST.SEARCH,SODR.WORKSPACE_PURCHASEREQUEST.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/po-refer-pr/workbench-pr-line`,
        method: 'GET',
      };
    },
    submit: ({ data, dataSet }) => {
      const submitType = dataSet.getState('submitType');
      if (submitType === 'create') {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/line_new`,
          method: 'POST',
          data: data.map((i) => ({
            ...i,
            uomCodeTemp: dataSet.getState('doubleUnitEnabled') ? i.secondaryUomCode : i.uomCode,
          })),
          params: { poWorkbenchFlag: 1 },
        };
      } else {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-workbench/from-pr/default-supplier`,
          method: 'POST',
          body: {
            data,
          },
        };
      }
    },
  },
  events: {
    load({ dataSet }) {
      dataSet.forEach((i) => {
        i.init({
          receiptsOrderQuantity: i.get('changeQuantity'),
          selectDisplaySupplierCompanyName: isNil(i.get('selectSupplierCompanyName'))
            ? i.get('selectLocalSupplierName')
            : i.get('selectSupplierCompanyName'),
        });
      });
    },
    unSelect({ record }) {
      record.set('thisOrderQuantity', record.getPristineValue('thisOrderQuantity'));
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.set('thisOrderQuantity', i.getPristineValue('thisOrderQuantity')));
    },
    update: ({ name, value, record, dataSet }) => {
      if (name === 'orderSupplierLov') {
        const {
          uomId,
          uomCode,
          uomName,
          uomPrecision,
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
          supplierId,
          supplierName,
          supplierNum,
          // supplierCompanyId,
        } = value || {};
        // record.set({ noUnitPrice: unitPrice });
        if (value) {
          const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
          if ([0, 1, 2].includes(doubleUnitEnabled)) {
            const sodrEnabled = doubleUnitEnabled !== 0;
            if (value && uomId && sodrEnabled && record.getPristineValue('uomId') !== uomId) {
              notification.error({
                message: intl
                  .get(`sodr.common.view.message.validateUomId`)
                  .d(
                    '该物料在价格库的单位与物料主数据中的基本单位不一致，请检查价格库或物料主数据后重新操作'
                  ),
              });
              record.reset();
              return;
              // record.getField('priceLibraryId').reset();
            }
            if (!sodrEnabled) {
              record.set({
                secondaryUomId: uomId,
                secondaryUomName: uomName,
                secondaryUomCode: uomCode,
                secondaryUomCodeAndName: uomCodeAndName,
                secondaryUomPrecision: uomPrecision,
              });
            }
          }
          const setFields = {
            uomId,
            uomCode,
            uomName,
            uomCodeAndName,
            currencyCode,
            taxId,
            taxRate,
            noUnitPrice: unitPrice,
            unitPrice,
            priceLibId,
            priceLibraryId: isNil(priceLibId) ? null : priceLibraryId,
            selectLocalSupplierCode: isNil(supplierId) ? null : supplierNum,
            selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
            selectLocalSupplierName: isNil(supplierId) ? null : supplierName,
            taxIncludedPrice: enteredTaxIncludedPrice,
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
          };
          record.set(
            remote
              ? remote.process('transformOrderSupplierFields', setFields, {
                  currentLine: value,
                  source: 'lov',
                  record,
                  dataSet,
                })
              : setFields
          );
        } else {
          record.reset();
          // record.init({ orderSupplierLov: {}, noUnitPrice: null, netPrice: null });
          record.set({ orderSupplierLov: {}, noUnitPrice: null, netPrice: null });
        }
      }
      remote.event.fireEvent('handlePurchaseRequestDsUpdate', { name, value, record, dataSet });
    },
  },
});

// 引用寻源结果
const sourcingResults = ({ remote }) => {
  // 埋点ds的props
  return {
    dataToJSON: 'selected',
    cacheSelection: true,
    modifiedCheck: false,
    primaryKey: 'resultId',
    cacheModified: true,
    pageSize: 20,
    fields: [
      {
        name: 'sourceNum',
        label: intl.get('sodr.workspace.model.common.sourceNum').d('寻源单号'),
      },
      {
        name: 'itemNum',
        label: intl.get('sodr.workspace.model.common.lineNum').d('行号'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
      },
      {
        name: 'itemCode',
        label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
      },
      {
        name: 'secondaryQuantity',
        label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          precision: ({ record }) => record.get('secondaryUomPrecision'),
        },
      },
      {
        name: 'receiptsOrderQuantity',
        label: intl.get('sodr.workspace.model.common.thisOrderQuantity').d('本次下单数量'),
        type: 'number',
        required: true,
        validator: (value, name, record) => {
          const { controlOrderFlag, remainQuantity } = record.get([
            'controlOrderFlag',
            'remainQuantity',
          ]);
          if (value <= 0) {
            return intl
              .get('sodr.workspace.view.message.greaterThanZero')
              .d('本次下单数量必须大于零');
          }
          if (controlOrderFlag !== 0 && !isNil(remainQuantity) && remainQuantity < value) {
            return intl
              .get('sodr.workspace.view.message.greaterThanResidue')
              .d('本次下单数量大于剩余可下单数量');
          }
          return true;
        },
        dynamicProps: {
          precision: ({ record, dataSet }) =>
            getPrecision(
              record.get(
                dataSet.getState('doubleUnitEnabled') ? 'secondaryUomPrecision' : 'uomPrecision'
              )
            ),
        },
      },
      {
        name: 'remainQuantity',
        label: intl.get('sodr.workspace.model.common.restPoQuantity').d('剩余可下单数量'),
        type: 'number',
        dynamicProps: {
          precision: ({ record, dataSet }) =>
            getPrecision(
              record.get(
                dataSet.getState('doubleUnitEnabled') ? 'secondaryUomPrecision' : 'uomPrecision'
              )
            ),
        },
      },
      {
        name: 'secondaryUomCodeAndName',
        label: intl.get('sodr.workspace.model.common.uom').d('单位'),
      },
      {
        name: 'quantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          precision: ({ record }) => record.get('uomPrecision'),
          label: ({ dataSet }) =>
            getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
        },
      },
      {
        name: 'uomCodeAndName',
        dynamicProps: {
          label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
        },
      },
      {
        name: 'unitPrice',
        label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          precision: ({ record }) => record.get('defaultPrecision'),
        },
      },
      {
        name: 'netAmount',
        label: intl.get('sodr.workspace.model.common.amountNet').d('金额(不含税)'),
        type: 'number',
      },
      {
        name: 'taxprice',
        label: intl.get('sodr.workspace.model.common.taxprices').d('单价(含税)'),
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => record.get('defaultPrecision'),
        },
      },
      {
        name: 'taxAmount',
        label: intl.get('sodr.workspace.model.common.amountTax').d('金额(含税)'),
        type: 'number',
      },
      {
        name: 'taxRate',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      },
      {
        name: 'priceBatchQuantity',
        label: intl.get('sodr.workspace.model.common.priceBatchQuantity').d('每'),
      },
      {
        name: 'ladderInquiryFlag',
        label: intl.get('sodr.workspace.model.common.ladderInquirys').d('阶梯报价'),
      },
      {
        name: 'companyName',
        label: intl.get('sodr.workspace.model.common.companyId').d('公司'),
      },
      {
        name: 'ouName',
        label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
      },
      {
        name: 'purOrganizationName',
        label: intl.get('sodr.workspace.model.common.purOrganizationName').d('采购组织'),
      },
      {
        name: 'purchaseAgentName',
        label: intl.get('sodr.workspace.model.common.purchaseAgentName').d('采购员'),
      },
      {
        name: 'invOrganizationName',
        label: intl.get('sodr.workspace.model.common.invOrganizationName').d('库存组织'),
      },
      {
        name: 'categoryName',
        label: intl.get('sodr.workspace.model.common.categoryName').d('物料分类'),
      },
      {
        name: 'realName',
        label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('sodr.workspace.model.common.sourceCompleteDate').d('寻源完成时间'),
      },
      {
        name: 'sourceCreationDate',
        type: 'dateTime',
        label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
      },
      {
        name: 'prNumAndLineNum',
        label: intl.get('sodr.workspace.model.common.prNumAndLineNums').d('采购申请编号-行号'),
      },
      {
        name: 'itemRemark',
        label: intl.get('sodr.workspace.model.common.itemRemark').d('备注'),
      },
      {
        name: 'occupationQuantity',
        type: 'number',
        label: intl.get('sodr.workspace.model.common.occupiedQuantitys').d('已创建订单数量'),
      },
      {
        name: 'validPromisedDate',
        type: 'date',
        label: intl.get('sodr.workspace.model.common.validPromisedDates').d('承诺交货期'),
      },
      {
        name: 'supplierCompanyNum',
        label: intl.get('sodr.workspace.model.common.supplierCompanyNum').d('供应商编码'),
      },
      {
        name: 'docFlow',
        label: intl.get(`sodr.workspace.model.common.docFlow`).d('单据流'),
      },
      {
        name: 'pendingFlag',
        label: intl.get('sodr.common.model.common.suspend').d('是否暂挂'),
      },
      {
        name: 'projectTaskId',
        label: intl.get(`sodr.workspace.model.common.projectTaskId`).d('项目任务名称'),
      },
    ],
    queryParameter: {
      poWorkbenchFlag: 1,
      customizeUnitCode:
        'SODR.WORKSPACE_SOURCINGRESULTS.SEARCH,SODR.WORKSPACE_SOURCINGRESULTS.LIST',
    },
    transport: {
      read: () => {
        return {
          // url: `${SRM_SPUC}/v1/${organizationId}/po-header/source-result`,
          url: `${SRM_SSRC}/v1/${organizationId}/source/result/external-call/result-list`,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-header/rfx-to-order`,
          method: 'POST',
          data: data.map((i) => ({
            ...i,
            uomCodeTemp: dataSet.getState('doubleUnitEnabled') ? i.secondaryUomCode : i.uomCode,
          })),
        };
      },
    },
    events: {
      load({ dataSet }) {
        dataSet.forEach((i) => {
          i.init({ receiptsOrderQuantity: i.get('changeQuantity') });
        });
      },
      unSelect({ record }) {
        record.reset();
      },
      unSelectAll({ dataSet }) {
        dataSet.forEach((i) => i.reset());
      },
      // 寻源创建勾选、取消勾选埋点
      batchSelect({ dataSet, records }) {
        remote.event.fireEvent('handleSourceCreate', {
          dataSet,
          records,
          eventType: 'batchSelect',
        });
      },
      batchUnSelect({ dataSet, records }) {
        remote.event.fireEvent('handleSourceCreate', {
          dataSet,
          records,
          eventType: 'batchUnSelect',
        });
      },
    },
  };
};

// 引用采购协议
const purchaseAgreement = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  modifiedCheck: false,
  cacheModified: true,
  primaryKey: 'pcSubjectId',
  pageSize: 20,
  fields: [
    {
      name: 'pcNum',
      label: intl.get('sodr.workspace.model.common.pcNum').d('采购协议编号'),
    },
    {
      name: 'lineNum',
      label: intl.get('sodr.workspace.model.common.lineNum').d('行号'),
    },
    {
      name: 'pcName',
      label: intl.get('sodr.workspace.model.common.pcName').d('采购协议名称'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    {
      name: 'itemCode',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
    },
    {
      name: 'secondaryQuantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      dynamicProps: {
        precision: ({ record }) => record.get('secondaryUomPrecision'),
      },
    },
    {
      name: 'receiptsOrderQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.thisOrderQuantity').d('本次下单数量'),
      required: true,
      max: MAX_QUAN_NUMBER,
      validator: (value, name, record) => {
        if (value <= 0) {
          return intl
            .get('sodr.workspace.view.message.greaterThanZero')
            .d('本次下单数量必须大于零');
        }
        if (record.get('orderQuantityFlag') === 1 && record.get('residueOrderQuantity') < value) {
          return intl
            .get('sodr.workspace.view.message.greaterThanResidue')
            .d('本次下单数量大于剩余可下单数量');
        }
        return true;
      },
      dynamicProps: {
        precision: ({ record, dataSet }) =>
          getPrecision(
            record.get(
              dataSet.getState('doubleUnitEnabled') ? 'secondaryUomPrecision' : 'uomPrecision'
            )
          ),
      },
    },
    {
      name: 'residueOrderQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.restPoQuantity').d('剩余可下单数量'),
      dynamicProps: {
        precision: ({ record, dataSet }) =>
          getPrecision(
            record.get(
              dataSet.getState('doubleUnitEnabled') ? 'secondaryUomPrecision' : 'uomPrecision'
            )
          ),
      },
    },
    // {
    //   name: 'neededDate',
    //   type: 'date',
    //   label: intl.get('sodr.workspace.model.common.neededDate').d('需求日期'),
    // },
    {
      name: 'secondaryUomCodeAndName',
      label: intl.get('sodr.workspace.model.common.uom').d('单位'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('uomPrecision'),
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      name: 'uomCodeAndName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
    },
    {
      name: 'deliverDate',
      type: 'date',
      label: intl.get('sodr.workspace.model.common.deliveDate').d('交付日期'),
    },
    {
      name: 'ladderPrice',
      label: intl.get('sodr.workspace.model.common.ladderInquiry').d('阶梯价格'),
    },
    {
      name: 'unitPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'lineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountNet').d('金额(不含税)'),
    },
    {
      name: 'enteredTaxIncludedPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxprices').d('单价(含税)'),
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'taxIncludedLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTax').d('金额(含税)'),
    },
    {
      name: 'taxRate',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'unitPriceBatch',
      label: intl.get('sodr.workspace.model.common.priceBatchQuantity').d('每'),
    },
    // {
    //   name: 'ladderInquiry',
    //   label: intl.get('sodr.workspace.model.common.ladderInquiry').d('阶梯价格'),
    // },
    {
      name: 'companyName',
      label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get('sodr.workspace.model.common.purOrganizationName').d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get('sodr.workspace.model.common.purchaseAgentName').d('采购员'),
    },
    {
      name: 'categoryName',
      label: intl.get('sodr.workspace.model.common.categoryName').d('物料分类'),
    },
    {
      name: 'createdByName',
      label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
    },
    // {
    //   name: 'prNumAndLineNum', // 待定
    //   label: intl.get('sodr.workspace.model.common.prNumAndLineNum').d('采购申请单号|行号'),
    // },
    // {
    //   name: 'prNumAndLineNum1', // 待定
    //   label: intl.get('sodr.workspace.model.common.prNumAndLineNum1').d('寻源/招投标号|行号'),
    // },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
    {
      name: 'chanageOrderQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.occupiedQuantity').d('已创建单据数量'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get('sodr.workspace.model.common.supplierCompanyNum').d('供应商编码'),
    },
    {
      name: 'docFlow',
      label: intl.get(`sodr.workspace.model.common.docFlow`).d('单据流'),
    },
    {
      name: 'pendingFlag',
      label: intl.get('sodr.common.model.common.suspend').d('是否暂挂'),
    },
    {
      name: 'projectTaskId',
      label: intl.get(`sodr.workspace.model.common.projectTaskId`).d('项目任务名称'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    customizeUnitCode:
      'SODR.WORKSPACE_PURCHASEAGREEMENT.SEARCH,SODR.WORKSPACE_PURCHASEAGREEMENT.LIST',
  },
  transport: {
    read: () => {
      return {
        // url: `${SRM_SPUC}/v1/${organizationId}/po-header/from-contract/line`,
        url: `${SRM_SPCM}/v1/${organizationId}/sync-contract/po-header/from-contract/line`,
        method: 'GET',
      };
    },
    submit: ({ data, dataSet }) => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/from-contract-result/line`,
        method: 'POST',
        data: data.map((i) => ({
          ...i,
          uomCodeTemp: dataSet.getState('doubleUnitEnabled') ? i.secondaryUomCode : i.uomCode,
        })),
      };
    },
  },
  events: {
    load({ dataSet }) {
      dataSet.forEach((i) => {
        i.init({ receiptsOrderQuantity: i.get('residueOrderQuantity') });
      });
    },
    selectAll({ dataSet }) {
      dataSet.forEach((i) => {
        if (i.get('residueOrderQuantity') > 0) {
          i.set({ receiptsOrderQuantity: i.get('residueOrderQuantity') });
        }
      });
    },
    unSelect({ record }) {
      record.reset();
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.reset());
    },
  },
});

export { wholePurchaseRequest, purchaseRequest, sourcingResults, purchaseAgreement };
