/*
 * @Descripttion: 关闭征询书--DS
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-09-01 10:54:34
 * @LastEditors: yiping.liu
 */
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const closeRfDS = ({ rfHeaderId }) => ({
  selection: false,
  autoCreate: true,
  fields: [
    {
      name: 'closeRemark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.view.message.close.inquiryListReason`).d('关闭理由'),
      required: true,
    },
    {
      name: 'closeAttachmentUuid',
      type: 'string',
    },
  ],
  transport: {
    submit: ({ dataSet }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/close`,
        method: 'GET',
        data: '',
        params: {
          ...dataSet.current.toData(),
        },
      };
    },
  },
});

export { closeRfDS };
