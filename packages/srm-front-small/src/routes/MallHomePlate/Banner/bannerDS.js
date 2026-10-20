import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const comBannerDS = () => ({
  primaryKey: 'bannerId',
  // autoQuery: true,
  // table表单显示的字段
  fields: [
    {
      name: 'bannerName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.bannerName').d('Banner名称'),
    },
    {
      name: 'bannerTypeName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.bannerType').d('Banner类型'),
    },
    {
      name: 'bannerSourceTypeName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.bannerSource').d('Banner来源'),
    },
    {
      name: 'startDate',
      type: 'dateTime',
      label: intl.get('small.common.model.startTime').d('开始时间'),
    },
    {
      name: 'endDate',
      type: 'dateTime',
      label: intl.get('small.common.model.endTime').d('截止时间'),
    },
    {
      name: 'bannerStatusName',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'edit',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  queryFields: [
    {
      name: 'bannerName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.bannerName').d('Banner名称'),
    },
    {
      name: 'startDate',
      type: 'dateTime',
      label: intl.get('small.common.model.startTime').d('开始时间'),
    },
    {
      name: 'endDate',
      type: 'dateTime',
      label: intl.get('small.common.model.endTime').d('截止时间'),
    },
    {
      name: 'bannerStatus',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.shelfStatus').d('上架状态'),
      lookupCode: 'SMAL.BANNER_STATUS',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.bannerStatus === '1') {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/banner`,
        method: 'GET',
        data: {
          ...data,
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/banner/batch-remove`,
        data,
        method: 'POST',
        transformResponse: (res) => {
          if (!res) {
            dataSet.query();
          }
        },
      };
    },
  },
});

const historyDs = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get('small.common.model.action.user').d('操作人'),
      name: 'operatedByName',
    },
    {
      label: intl.get('small.common.model.action.time').d('操作时间'),
      name: 'operatedDate',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operationName',
    },
    {
      label: intl.get('hzero.common.explain').d('说明'),
      name: 'operatedRemark',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/banner/${data.bannerId}/history`,
        method: 'GET',
        data: { ...data, organizationId },
      };
    },
  },
});

export { comBannerDS, historyDs };
