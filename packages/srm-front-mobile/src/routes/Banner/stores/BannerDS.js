import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const BANNER_API = `/smbl/v1/${getCurrentOrganizationId()}/banner`;

export default () => ({
  transport: {
    read: config => {
      const url = `${BANNER_API}`;
      return {
        ...config,
        url,
        method: 'GET',
      };
    },
    submit: ({ data, params }) => {
      return {
        url: `${BANNER_API}`,
        data,
        params,
        method: 'POST',
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${BANNER_API}`,
        data,
        params,
        method: 'DELETE',
      };
    },
  },
  pageSize: 10,
  selection: 'none',
  primaryKey: 'bannerId',
  fields: [
    {
      name: 'banner',
      label: intl.get('smbl.banner.model.banner.name').d('轮播图'),
      type: 'object',
      ignore: 'always',
    },
    {
      name: 'bannerId',
      label: intl.get('smbl.banner.model.banner.id').d('轮播图ID'),
      type: 'string',
    },
    {
      name: 'tenantId',
      label: intl.get('smbl.banner.model.banner.tenantId').d('租户id'),
      type: 'string',
      required: true,
    },
    {
      name: 'picUrl',
      label: intl.get('smbl.banner.model.banner.picUrl').d('图片地址'),
      type: 'string',
      required: true,
    },
    {
      name: 'type',
      label: intl.get('smbl.banner.model.banner.type').d('展示类型'),
      type: 'string',
      lookupCode: 'SMBL.BANNER.DISPLAY_TYPE',
      required: true,
    },
    {
      name: 'validDateFrom',
      label: intl.get('smbl.banner.model.banner.validDateFrom').d('有效期从'),
      type: 'string',
      required: true,
    },
    {
      name: 'validDateTo',
      label: intl.get('smbl.banner.model.banner.validDateTo').d('有效期至'),
      type: 'string',
      required: true,
    },
    {
      name: 'redirectUrl',
      label: intl.get('smbl.banner.model.banner.redirectUrl').d('跳转地址'),
      type: 'string',
    },
    {
      name: 'showTime',
      label: intl.get('smbl.banner.model.banner.showTime').d('读秒时长'),
      type: 'string',
    },
    {
      name: 'sequence',
      label: intl.get('smbl.banner.model.banner.sequence').d('序号'),
      type: 'string',
      required: true,
    },
    {
      name: 'remark',
      label: intl.get('smbl.banner.model.banner.remark').d('描述'),
      type: 'string',
    },
    {
      name: 'notShowFlag',
      label: intl.get('smbl.banner.model.banner.notShowFlag').d('是否允许用户选择不再显示'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      trueValue: '1',
      falseValue: '0',
    },
    {
      name: 'enableFlag',
      label: intl.get('smbl.banner.model.banner.enableFlag').d('是否显示'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      trueValue: '1',
      falseValue: '0',
      defaultValue: '1',
    },
  ],
});

export const tableDS = type => ({
  selection: 'multiple',
  cacheSelection: true,
  primaryKey: 'bannerId',
  fields: [
    {
      name: 'picUrl',
      label: intl.get('smbl.banner.model.banner.preview').d('预览'),
      required: true,
      transformRequest: value => value && value[0],
    },
    {
      name: 'sequence',
      label: intl.get('smbl.banner.model.banner.sequence').d('序号'),
      type: 'string',
      required: true,
    },
    {
      name: 'showTime',
      label: intl.get('smbl.banner.model.banner.showTime').d('读秒时长'),
    },
    {
      name: 'enableFlag',
      label: intl.get('smbl.banner.model.banner.enableFlag').d('是否显示'),
      type: 'number',
      defaultValue: 1,
    },
    {
      name: 'remark',
      label: intl.get('smbl.banner.model.banner.remark').d('描述'),
      type: 'string',
    },
    {
      name: 'validDate',
      label: intl.get('smbl.banner.model.banner.validDate').d('有效期'),
      type: 'dateTime',
      range: true,
      required: true,
      ignore: 'always',
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'validDate') {
        const [validDateFrom, validDateTo] = value || [];
        record.set('validDateFrom', validDateFrom);
        record.set('validDateTo', validDateTo);
      }
    },
  },
  transport: {
    read: ({ params }) => {
      return {
        url: `/smbl/v1/${getCurrentOrganizationId()}/banner`,
        method: 'GET',
        params: {
          ...params,
          type,
        },
      };
    },
    submit: ({ data, params }) => {
      return {
        url: `${BANNER_API}`,
        data,
        params,
        method: 'POST',
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${BANNER_API}`,
        data,
        params,
        method: 'DELETE',
      };
    },
  },
});
