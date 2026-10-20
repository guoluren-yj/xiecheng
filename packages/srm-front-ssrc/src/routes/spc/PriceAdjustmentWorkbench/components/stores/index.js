import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const scopeTableDS = (isEdit) => ({
  primaryKey: 'id',
  idField: 'key',
  parentField: 'parentKey',
  selection: isEdit && 'multiple',
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
      const url = `${SRM_SPC}/v1/${organizationId}/price-adjustment-scopes/line`;
      return {
        url,
        method: 'GET',
        data: {
          ...queryParams,
          ...params,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-adjustment-scopes/line`,
        data,
        method: 'DELETE',
      };
    },
  },
});

const scopeAddTabsDS = () => ({
  autoCreate: true,
  selection: 'single',

  fields: [
    {
      name: 'dimensionCodeLOV',
      type: 'object',
      label: intl.get('ssrc.priceLibraryNew.model.library.appointDimension').d('维度'),
      required: true,
      lovCode: 'SPC.PRICE.ADJUSTMENT.SCOPES.DIMENSION_CODE',
      valueField: 'dimensionCode',
      textField: 'dimensionName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          shieldDimCodes: dataSet.queryParameter.shieldDimCodes,
          fieldWidgets: 'LOV,SELECT',
        }),
      },
    },
    {
      name: 'dimensionCode',
      bind: 'dimensionCodeLOV.dimensionCode',
    },
    {
      name: 'dimensionName',
      bind: 'dimensionCodeLOV.dimensionName',
    },
  ],
});

const scopeIntroduceModalDS = () => ({
  primaryKey: 'id',
  idField: 'key',
  parentField: 'parentKey',

  fields: [
    {
      name: 'dataName',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataName').d('名称'),
    },
    {
      name: 'dataCode',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataCode').d('编码'),
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

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.checkedFlag) {
          Object.assign(record, { selectable: false, isSelected: true });
        }
      });
    },
  },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-adjustment-scopes/line/introduce`;
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

const scopeIntroduceLovDS = () => ({
  fields: [],

  queryFields: [],

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.checkedFlag) {
          Object.assign(record, { selectable: false, isSelected: true });
        }
      });
    },
  },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-adjustment-scopes/line/introduce`;
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

export { scopeTableDS, scopeAddTabsDS, scopeIntroduceModalDS, scopeIntroduceLovDS };
