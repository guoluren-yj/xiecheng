/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { getReadTransport } from '../utils';

const organizationId = getCurrentOrganizationId();

export const getOtherInfoDS = ({
  partnerTenantId,
  readOnlyFlag = false,
  code = '',
  ...rest
} = {}) => ({
  forceValidate: true,
  paging: false,
  fields: [],
  transport: {
    read: ({ dataSet }) => {
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { changeReqId } = dataSet.getState('dsState') || {};
      return !readOnlyFlag
        ? {
            url: `${SRM_SSLM}/v1/${organizationId}/sup-change-others/firmChange/getSupChangeOther`,
            method: 'GET',
            data: {
              changeReqId,
              customizeUnitCode: code,
              customizeTenantId: partnerTenantId,
            },
          }
        : readUrlProps;
    },
  },
});
