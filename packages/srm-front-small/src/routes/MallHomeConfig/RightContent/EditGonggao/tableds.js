import { isEmpty } from 'lodash';
import moment from 'moment';
import { DATETIME_MIN } from 'utils/constants';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

export const tableds = () => {
  const organizationId = getCurrentOrganizationId();
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'bulletinId',
    cacheModified: true,
    record: {
      dynamicProps: {
        selectable: record => +record.get('enabledFlag') !== 1,
      },
    },
    fields: [
      {
        name: 'bulletinId',
      },
      {
        name: 'enabledFlag',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'bulletinTitle',
        label: intl.get('small.mallHomeConfig.view.gonggao.gonggaoName').d('公告名称'),
      },
      {
        name: 'timer',
        type: 'dateTime',
        label: intl.get('small.common.model.validate.date').d('有效期'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('small.mallHomeConfig.view.gonggao.createTime').d('创建时间'),
      },
      {
        name: 'operate',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_MALL}/v1/${organizationId}/bulletin-boards/list`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_MALL}/v1/${organizationId}/bulletin-boards/delete`,
          data,
          method: 'DELETE',
        };
      },
    },
  };
};

export const bannerds = ({ currentRole, mallType }) => {
  return {
    // autoCreate: true,
    fields: [
      {
        name: 'bulletinTitle',
        label: intl.get('small.mallHomeConfig.view.gonggao.gonggaoName').d('公告名称'),
        required: true,
      },
      {
        name: 'enabledFlag',
      },
      {
        name: 'pageConfigAuthList',
        label: intl.get('small.mallHomeConfig.view.purchase.fenpei').d('采买组织分配'),
        required: currentRole === 'tenant' && mallType !== 'sigl',
        type: 'object',
        textField: 'unitCodeName',
        valueField: 'unitId',
        multiple: true,
        transformResponse: (_, record) => {
          const { pageConfigAuthList } = record;
          const allUnit = {
            unitId: 'ALL',
            unitName: intl.get('small.common.model.allOrganizations').d('所有组织'),
          };
          const list = isEmpty(pageConfigAuthList) ? [allUnit] : pageConfigAuthList;
          return list
            ? list.map((m) => ({
                ...m,
                unitCodeName: m.unitCode ? `${m.unitCode}-${m.unitName}` : m.unitName,
              }))
            : list;
        },
      },
      {
        name: 'validityDate',
        type: 'date',
        ignore: 'always',
        range: ['startDate', 'endDate'],
        min: moment().format(DATETIME_MIN),
        label: intl.get('small.common.model.validate.date').d('有效期'),
        computedProps: {
          required: ({ record }) => !record.get('startDate'),
        },
      },
      {
        name: 'startDate',
        type: 'date',
        required: true,
        bind: 'validityDate.startDate',
      },
      {
        name: 'endDate',
        type: 'date',
        bind: 'validityDate.endDate',
      },
    ],
  };
};
