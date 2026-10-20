import intl from 'utils/intl';
import { SRM_SAGM, SRM_SMPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isCustomNumber } from '@/utils/precision';

const organizationId = getCurrentOrganizationId();

export function getTableDs(agmLineDs) {
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'matchId',
    cacheSelection: true,
    modifiedCheck: false,
    fields: [
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'effectiveFlagMeaning',
      },
      // 数据来源
      {
        label: intl.get('small.common.model.priceFromNum').d('价格编号'),
        name: 'priceLibNumber',
      },
      // 供采公司
      {
        label: intl.get('small.common.model.pur').d('采'),
        name: 'companyName',
      },
      {
        label: intl.get('small.common.model.sup').d('供'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('small.common.model.buyCompany').d('可采买公司'),
        name: 'priceLibAssigns', // allCompanyFlag
      },
      // 物料信息
      {
        label: intl.get('sagm.common.model.itemCode').d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get('sagm.common.model.itemName').d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get('sagm.common.model.itemCategory').d('物料品类'),
        name: 'itemCategoryName',
      },
      {
        label: intl.get('sagm.common.model.uom').d('单位'),
        name: 'uomName',
      },
      // 价格信息
      {
        label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
        name: 'unitPrice',
      },
      {
        label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
        name: 'taxPrice',
      },
      {
        label: intl.get('sagm.common.view.tax').d('税率'),
        name: 'taxRate',
      },
      {
        label: intl.get('sagm.common.view.currency').d('币种'),
        name: 'currencyName',
      },
      {
        label: intl.get('sagm.common.view.priceType').d('价格类型'),
        name: 'ladderFlag',
      },
      // 有效期
      {
        name: 'validDateFrom',
        type: 'date',
        label: intl.get('sagm.common.model.dateFrom').d('有效期从'),
      },
      {
        name: 'validDateTo',
        type: 'date',
        label: intl.get('sagm.common.model.dateTo').d('有效期至'),
      },
      // 其它
      {
        label: intl.get('small.common.model.quantity').d('数量'),
        name: 'quantity',
      },
      {
        label: intl.get('small.common.model.minPurchaseQuantity').d('最小采购量'),
        name: 'minPurchaseQuantity',
      },
      {
        label: intl.get('sagm.common.model.purchase.organization').d('采购组织'),
        name: 'purOrganizationName',
      },
      {
        label: intl.get('sagm.common.model.purchaseUser').d('采购员'),
        name: 'purchaseAgentName',
      },
      {
        label: intl.get('sagm.common.view.creator').d('创建人'),
        name: 'founderName',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        const validateFields = [
          { name: 'taxRate', valueExit: ({ value }) => isCustomNumber(value) },
          { name: 'itemName' },
          { name: 'validDateFrom' },
          { name: 'validDateTo' },
          { name: 'uomName' },
          { name: 'currencyName' },
          { name: 'unitPrice', valueExit: ({ value }) => isCustomNumber(value) },
          {
            name: 'taxPrice',
            valueExit: ({ value, record }) =>
              isCustomNumber(value) || record.get('ladderFlag') === 1,
          },
        ];
        dataSet.forEach((f) => {
          const emptyFields = validateFields
            .filter((field) => {
              const { name, valueExit = ({ value }) => value } = field;
              return !valueExit({ value: f.get(name), record: f });
            })
            .map((m) => m.name);
          if (emptyFields.length > 0) f.init('emptyFields', emptyFields);
          if (
            emptyFields.length > 0 ||
            f.get('effectiveFlag') === 0 ||
            (agmLineDs && agmLineDs.some((s) => s.get('sourceFromNumber') === f.get('matchId')))
          ) {
            Object.assign(f, { selectable: false });
          }
        });
      },
    },
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        return {
          url: `${SRM_SAGM}/v1/${organizationId}/price-lib-matchs/agreement-list`,
          method: 'POST',
          params: { ...params, customizeUnitCode },
        };
      },
    },
  };
}

// 引用价格库创建商品
export function getCreateDs() {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'templateId',
        label: intl.get('small.common.model.productIntroTemp').d('商品介绍模板'),
        textField: 'templateName',
        valueField: 'templateId',
        lookupAxiosConfig: ({ dataSet }) => {
          return {
            url: `${SRM_SMPC}/v1/${organizationId}/sku-detail-templates`,
            method: 'GET',
            data: { enabledFlag: 1, size: 0 },
            transformResponse(data) {
              try {
                const res = JSON.parse(data);
                const { templateId } = res?.content?.find((f) => f.defaultFlag === 1) || {};
                dataSet.current.set('templateId', templateId);
                return res;
              } catch {
                return data;
              }
            },
          };
        },
      },
      {
        name: 'categoryLov',
        label: intl.get('small.common.model.platformCategory').d('平台分类'),
        required: true,
        type: 'object',
        // lovCode: 'SMPC.CATEGORY',
        valueField: 'categoryId',
        textField: 'categoryName',
        // lovPara: { supplierTenantId: organizationId },
      },
      {
        name: 'categoryId',
        bind: 'categoryLov.categoryId',
      },
      {
        label: intl.get('smpc.product.model.mallCatalog').d('商城目录'),
        name: 'catalogLov',
        type: 'object',
        // lovCode: 'SMPC.CATALOG_THREE',
        textField: 'catalogName',
        valueField: 'catalogId',
        ignore: 'always',
        // lovPara: { tenantId: organizationId },
      },
      {
        name: 'catalogId',
        bind: 'catalogLov.catalogId',
      },
    ],
  };
}
