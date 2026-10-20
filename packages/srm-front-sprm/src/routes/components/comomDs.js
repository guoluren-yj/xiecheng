import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.purchaseRequisitionInquiry';
const organizationId = getCurrentOrganizationId();

const referPiceDs = ({ data, cusCode, sourceForm }) => {
  return {
    autoQuery: true,
    pageSize: 20,
    selection: ['create', 'update'].includes(sourceForm) ? 'single' : false,
    fields: [
      {
        label: intl.get(`entity.supplier.code`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`entity.supplier.name`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('sodr.common.model.common.localSupplierCompanyNum').d('本地供应商编码'),
        name: 'supplierCode',
      },
      {
        label: intl.get('sodr.common.model.common.localSupplierName').d('本地供应商名称'),
        name: 'supplierName',
      },
      {
        label: intl.get(`sodr.common.model.common.taxPrice`).d('单价(含税)'),
        name: 'taxPrice',
        type: 'number',
      },
      {
        label: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
        name: 'unitPrice',
        type: 'number',
      },
      {
        label: intl.get(`sodr.common.model.common.uomName`).d('单位'),
        name: 'uomName',
      },
      {
        label: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`sodr.common.model.common.taxType`).d('税种'),
        name: 'taxCode',
      },
      {
        label: intl.get(`sodr.common.model.common.taxRate`).d('税率'),
        name: 'taxRate',
      },
      {
        label: intl.get(`sodr.common.model.common.marketPrice`).d('划线价'),
        name: 'marketPrice',
      },
      {
        label: intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格'),
        name: 'quantity',
        type: 'number',
      },
      {
        label: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
        name: 'priceSourceMeaning',
      },
      {
        label: intl.get(`sodr.common.model.common.sourceOrderNum`).d('来源单号'),
        name: 'orderNum',
      },
      {
        label: intl.get(`sprm.common.model.common.skuCodeAndName`).d('商品'),
        name: 'skuCodeAndName',
      },
      {
        label: intl.get(`sprm.common.model.common.validDateFrom`).d('有效期从'),
        name: 'validDateFrom',
      },
      {
        label: intl.get(`sprm.common.model.common.validDateTo`).d('有效期至'),
        name: 'validDateTo',
      },
      {
        label: intl.get(`sprm.common.model.common.productEcSourceFrom`).d('价格商品电商平台编码'),
        name: 'productEcSourceFrom',
      },
      {
        label: intl.get(`hzero.common.date.creation`).d('创建日期'),
        name: 'creationDate',
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${data?.prLineId}/price-library?customizeUnitCode=${cusCode}`,
          method: 'GET',
        };
      },
    },
  };
};

const referPiceProductDs = ({ data }) => {
  return {
    autoQuery: true,
    selection: false,
    // pageSize: 20,
    paging: false,
    fields: [
      {
        label: intl.get(`entity.supplier.code`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`entity.supplier.name`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('sodr.common.model.common.localSupplierCompanyNum').d('本地供应商编码'),
        name: 'supplierCode',
      },
      {
        label: intl.get('sodr.common.model.common.localSupplierName').d('本地供应商名称'),
        name: 'supplierName',
      },
      {
        label: intl.get(`sodr.common.model.common.marketPrice`).d('划线价'),
        name: 'marketPrice',
      },
      {
        label: intl.get(`sodr.common.model.common.taxPrice`).d('单价(含税)'),
        name: 'taxPrice',
        type: 'number',
      },
      {
        label: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
        name: 'unitPrice',
        type: 'number',
      },
      {
        label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
        name: 'uomName',
      },

      {
        label: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`sodr.common.model.common.taxType`).d('税种'),
        name: 'taxCode',
      },
      {
        label: intl.get(`sodr.common.model.common.taxRate`).d('税率'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格'),
        name: 'quantity',
        type: 'number',
      },
      {
        label: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
        name: 'prPriceSourceMeaning',
      },
      {
        label: intl.get(`sodr.common.model.common.priceSourceLib`).d('价格库价格来源'),
        name: 'priceSourceMeaning',
      },
      {
        label: intl.get(`sodr.common.model.common.sourceOrderNumPro`).d('价格来源单据号'),
        name: 'orderNum',
      },
      {
        label: intl.get(`sprm.common.model.common.skuCodeAndName`).d('商品'),
        name: 'skuCodeAndName',
      },
      {
        label: intl.get(`sprm.common.model.common.validDateFrom`).d('有效期从'),
        name: 'validDateFrom',
      },
      {
        label: intl.get(`sprm.common.model.common.validDateTo`).d('有效期至'),
        name: 'validDateTo',
      },
      {
        label: intl.get(`sprm.common.model.common.productEcSourceFrom`).d('价格商品电商平台编码'),
        name: 'productEcSourceFrom',
      },
      {
        label: intl.get(`sprm.common.date.creation.price`).d('价格创建时间'),
        name: 'creationDate',
        type: 'dateTime',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/pr-line/select-price-library-product/${data?.prLineId}`,
          method: 'GET',
        };
      },
    },
  };
};

const billDetailDs = (prLineId, uomPrecision, displayType) => {
  const isDisplayRecord = displayType === 'HISTORY';
  return {
    autoQuery: true,
    selection: false,
    fields: [
      {
        label: intl.get(`${modelPrompt}.prNum`).d('单据编号'),
        name: 'displayPrNum',
      },
      {
        label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
        name: 'lineNum',
      },
      {
        label: intl.get(`${modelPrompt}.executeBillType`).d('执行单据类型'),
        name: 'executeBillTypeMeaning',
      },
      {
        label: intl.get(`${modelPrompt}.executeOperationType`).d('执行类型'),
        name: 'executeOperationType',
      },
      {
        label: intl.get(`${modelPrompt}.executeOperationTypeMeaning`).d('执行类型'),
        name: 'executeOperationTypeMeaning',
      },
      {
        label: intl.get(`${modelPrompt}.executeByName`).d('操作人'),
        name: 'executeByName',
      },
      {
        label: intl.get(`${modelPrompt}.executionBillNum`).d('执行单据编号'),

        name: 'executionBillNum',
        // render: (value, record) => (!pubPathFlag ? value : this.clickJump(value, record)),
      },
      {
        label: intl.get(`${modelPrompt}.executionBillLineNum`).d('执行单据行号'),
        name: 'executionBillLineNum',
      },
      {
        label: intl.get(`${modelPrompt}.executeQuantity`).d('有效数量'),
        name: 'executeQuantity',
        dynamicProps: {
          precision: () => {
            return uomPrecision ?? 10;
          },
        },
        type: 'number',
      },
      {
        label: intl.get(`${modelPrompt}.supplier`).d('供应商'),
        name: 'supplier',
      },
      {
        label: intl.get(`${modelPrompt}.billStatus`).d('状态'),
        name: 'billStatusMeaning',
      },
      {
        label: intl.get(`${modelPrompt}.needDate`).d('需求日期'),
        name: 'needDate',
        type: 'date',
      },
      {
        label: intl.get(`${modelPrompt}.executeDate`).d('执行时间'),
        name: 'executeDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`${modelPrompt}.executeBillTypeNewFlag`).d('是否新招标'),
        name: 'executeBillTypeNewFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/pr-change-historys${
            isDisplayRecord ? '/execute-all' : ''
          }`,
          method: 'GET',
          data: {
            prLineId,
            ...(displayType ? { displayType } : {}),
            ...(!isDisplayRecord
              ? { customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_QUERY.EXECUTIONBILL' }
              : {}),
          },
        };
      },
    },
  };
};

export { referPiceDs, referPiceProductDs, billDetailDs };
