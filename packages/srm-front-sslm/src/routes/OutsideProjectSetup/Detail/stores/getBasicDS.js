/*
 * @Date: 2025-08-20 09:41:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import moment from 'moment';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const handleRequired = ({ record }) => {
  return ['NEW', 'CONFIRM_EXT_REJECTED'].includes(record.get('reqStatus'));
};

export const basicDS = ({ extSourceReqId }) => ({
  paging: false,
  forceValidate: true,
  primaryKey: 'extSourceReqId',
  autoCreate: isNil(extSourceReqId),
  fields: [
    {
      name: 'reqNumber',
      disabled: true,
      label: intl.get('sslm.outsideProjectSetup.modal.reqNumber').d('编号'),
    },
    {
      name: 'reqTitle',
      label: intl.get('hzero.common.button.title').d('标题'),
      dynamicProps: {
        required: handleRequired,
      },
    },
    {
      name: 'reqStatus',
      disabled: true,
      defaultValue: 'NEW',
      lookupCode: 'SPFM.EXT_SOURCE_REQ_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      type: 'object',
      name: 'companyId',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      label: intl.get(`sslm.common.view.company.name`).d('公司'),
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: {
        required: handleRequired,
      },
      transformRequest: value => (value ? value.companyId : null),
      transformResponse: (value, data) =>
        value
          ? {
              companyId: data.companyId,
              companyName: data.companyName,
            }
          : null,
    },
    {
      type: 'date',
      name: 'endDate',
      label: intl.get('sslm.outsideProjectSetup.modal.endDate').d('响应截止日期'),
      min: moment(),
      dynamicProps: {
        required: handleRequired,
      },
    },
    {
      type: 'object',
      name: 'sourceContactUserId',
      lovCode: 'SSLM.TENANT.SUB.ACCOUNT',
      label: intl.get(`sslm.outsideProjectSetup.modal.sourceContactId`).d('寻源联系人'),
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: {
        required: handleRequired,
      },
      transformRequest: value => (value ? value.id : null),
      transformResponse: (value, data) =>
        value
          ? {
              id: data.sourceContactUserId,
              name: data.sourceContactName,
            }
          : null,
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.view.description').d('描述'),
    },
    {
      name: 'rejectRemark',
      disabled: true,
      label: intl.get('sslm.outsideProjectSetup.modal.reason').d('拒绝原因'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/${extSourceReqId}`,
      method: 'GET',
    },
  },
});
