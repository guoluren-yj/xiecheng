// import { isObject } from 'lodash';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const queryFormDS = () => ({
  // 查询表单显示的字段
  fields: [],
});

const relevantQueryFormDS = () => ({
  // 查询表单显示的字段
  fields: [],
});

const listLineDS = () => ({
  primaryKey: 'priceLibId',
  cacheSelection: true,
  pageSize: 20,
  // table表单显示的字段
  fields: [],

  queryFields: [],

  transport: {
    read: ({ data }) => {
      const { templateCode = null, viewCode = null, ...otherData } = data;
      const queryParams = {};
      for (const key in otherData) {
        // 日期数字 特殊处理
        if (otherData[key].start || otherData[key].end) {
          Object.assign(queryParams, {
            [key]: {
              from: otherData[key].start,
              to: otherData[key].end,
            },
          });
        } else if (Array.isArray(otherData[key])) {
          // 下拉框 值集 多选处理
          Object.assign(queryParams, { [key]: otherData[key].toString() });
        } else {
          Object.assign(queryParams, { [key]: otherData[key] });
        }
      }
      const url =
        viewCode && viewCode !== 'ALL_VIEW'
          ? `${SRM_SPC}/v1/${organizationId}/price-lib-views`
          : `${SRM_SPC}/v1/${organizationId}/price-lib-mains`;
      return {
        url,
        method: 'GET',
        data: {
          templateCode,
          viewCode,
          ...filterNullValueObject(queryParams),
          from: viewCode && viewCode !== 'ALL_VIEW' ? 'VIEW_LIST' : 'LIST',
        },
      };
    },
  },
});

const relevantPriceDS = () => ({
  primaryKey: 'priceLibId',
  selection: false,

  // table表单显示的字段
  fields: [],

  queryFields: [],

  transport: {
    read: ({ data }) => {
      const {
        templateCode = null,
        priceLibId = null,
        dimensionId = null,
        viewCode = '',
        ...otherData
      } = data;
      const queryParams = {};
      for (const key in otherData) {
        // 日期数字 特殊处理
        if (otherData[key].start || otherData[key].end) {
          Object.assign(queryParams, {
            [key]: {
              from: otherData[key].start,
              to: otherData[key].end,
            },
          });
        } else if (Array.isArray(otherData[key])) {
          // 下拉框 值集 多选处理
          Object.assign(queryParams, { [key]: otherData[key].toString() });
        } else {
          Object.assign(queryParams, { [key]: otherData[key] });
        }
      }
      const url = `${SRM_SPC}/v1/${organizationId}/price-lib-mains`;
      const queryParam = filterNullValueObject(queryParams);
      return {
        url,
        method: 'GET',
        data: {
          templateCode,
          priceLibId,
          dimensionId,
          ...queryParam,
          from: viewCode && viewCode !== 'ALL_VIEW' ? 'VIEW_LIST_RELEVANT_PRICE' : 'RELEVANT_PRICE',
        },
      };
    },
  },
});

const ladderQuotationDS = () => ({
  primaryKey: 'priceLibLadderId',
  selection: false,
  paging: false,
  // table表单显示的字段
  fields: [
    {
      name: 'ladderLineNum',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.ladderLineNum').d('行号'),
    },
    {
      name: 'ladderFrom',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.numRanger').d('数量范围'),
    },
    // {
    //   name: 'ladderPrice',
    //   type: 'number',
    //   label: intl.get('ssrc.priceLibraryNew.model.library.price').d('价格'),
    // },
    {
      name: 'ladderPrice',
      type: 'number',
      label: intl.get('ssrc.priceLibraryNew.model.library.taxIncludedPrice').d('单价(含税)'),
    },
    {
      name: 'ladderNetPrice',
      type: 'number',
      label: intl.get('ssrc.priceLibraryNew.model.library.netPrice').d('单价(不含税)'),
    },
    {
      name: 'cumulativeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibraryNew.model.library.cumulative').d('是否累计阶梯'),
    },
    {
      name: 'ladderPriceRemark',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.remark').d('备注'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const url =
        data.viewCode && data.viewCode !== 'ALL_VIEW'
          ? `${SRM_SPC}/v1/${organizationId}/price-lib-view-ladders`
          : `${SRM_SPC}/v1/${organizationId}/price-lib-ladders`;
      return {
        url,
        method: 'GET',
        data: {
          customizeUnitCode: 'SSRC.PRICE_LIBRARY_NEW.LADDER_QUOTATION_LIST',
          ...data,
        },
      };
    },
  },
});

const scopeTableDS = () => ({
  primaryKey: 'id',
  idField: 'key',
  parentField: 'parentKey',
  selection: false,

  fields: [
    {
      name: 'dataName',
    },
    {
      name: 'dataCode',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataCode').d('编码'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.enable').d('启用'),
    },
  ],
  // 查询表单字段
  queryFields: [
    {
      name: 'dataCode',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataCode').d('编码'),
    },
    {
      name: 'dataName',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataName').d('名称'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url =
        params.viewCode && params.viewCode !== 'ALL_VIEW'
          ? `${SRM_SPC}/v1/${organizationId}/price-lib-vw-scope-lns`
          : `${SRM_SPC}/v1/${organizationId}/price-app-scope-lines`;
      return {
        url,
        method: 'GET',
        data: {
          ...queryParams,
          ...params,
        },
      };
    },
  },
});

const exportTemplateDS = () => ({
  primaryKey: 'priceLibLadderId',
  selection: false,
  autoQuery: false,

  fields: [
    {
      name: 'exportAppScopeMethod',
      label: intl.get('ssrc.priceLibraryNew.model.library.exportAppScopeMethod').d('导出模板'),
      lookupCode: 'SSRC.PRICE_EXPORT_APP_SCOPE_METHOD',
      type: 'string',
      required: true,
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { queryParams },
      } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-user-views/detail`,
        method: 'GET',
        data: queryParams,
      };
    },
  },
});

const deactivateDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.invalidReason').d('失效原因'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.attachmentUpload').d('附件上传'),
    },
  ],
});

export {
  queryFormDS,
  relevantQueryFormDS,
  listLineDS,
  relevantPriceDS,
  ladderQuotationDS,
  scopeTableDS,
  exportTemplateDS,
  deactivateDS,
};
