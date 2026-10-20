/*
 * @Date: 2023-04-13 09:16:21
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

export const getOtherInfoDS = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'foreverBlacklistFlag',
      label: intl.get('sslm.commonApplication.model.coApp.foreverBlacklistFlag').d('永久黑名单'),
    },
    {
      name: 'blacklistFlag',
      label: intl.get('sslm.commonApplication.model.coApp.blacklistFlag').d('加入黑名单'),
    },
    {
      name: 'blacklistExpiryDate',
      type: 'date',
      label: intl.get('sslm.commonApplication.model.coApp.blacklistExpiryDate').d('黑名单失效时间'),
      dynamicProps: {
        required: ({ record }) =>
          Number(record.get('foreverBlacklistFlag')) === 0 &&
          Number(record.get('blacklistFlag')) === 1,
        disabled: ({ record }) =>
          Number(record.get('foreverBlacklistFlag')) === 1 ||
          Number(record.get('blacklistFlag')) === 0,
      },
      transformResponse: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'tempFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.common.stage.temporary').d('临时'),
      dynamicProps: {
        disabled: ({ record }) => record.get('foreverBlacklistFlag') || record.get('blacklistFlag'),
      },
    },
    {
      name: 'tempEndDate',
      type: 'date',
      min: moment(),
      label: intl.get('sslm.common.model.dateTo').d('有效期至'),
      dynamicProps: {
        required: ({ record }) => record.get('tempFlag'),
        disabled: ({ record }) => !record.get('tempFlag'),
      },
      transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'tempFlag':
          record.set({
            tempEndDate: null,
          });
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-others/getSupChangeOther`,
        method: 'GET',
        data: { changeReqId, customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OTHERS' },
      };
    },
  },
});
