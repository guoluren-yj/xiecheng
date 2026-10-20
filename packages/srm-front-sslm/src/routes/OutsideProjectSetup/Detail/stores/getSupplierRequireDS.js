/*
 * @Date: 2025-08-20 09:41:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import { isNil, isArray } from 'lodash';

import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const supplierRequireDS = ({ extSourceReqId }) => ({
  paging: false,
  forceValidate: true,
  autoCreate: isNil(extSourceReqId),
  primaryKey: 'supplierRequirementId',
  fields: [
    {
      name: 'companyType',
      lookupCode: 'SPFM.EXT_SOURCE_SUP_REQUIRE.COMPANY_TYPE',
      label: intl.get('sslm.outsideProjectSetup.modal.companyType').d('企业类型'),
    },
    {
      name: 'authCertification',
      lookupCode: 'SPFM.EXT_SOURCE_SUP_REQUIRE.AUTH_CERTIFY',
      label: intl.get('sslm.outsideProjectSetup.modal.authCertification').d('资质认证'),
    },
    {
      name: 'annualOutput',
      lookupCode: 'SPFM.EXT_SOURCE_SUP_REQUIRE.ANNUAL_OUTPUT',
      label: intl.get('sslm.outsideProjectSetup.modal.annualOutput').d('年产值'),
    },
    {
      name: 'employeeNumber',
      lookupCode: 'SPFM.EXT_SOURCE_SUP_REQUIRE.EMP_NUM',
      label: intl.get('sslm.outsideProjectSetup.modal.employeeNumber').d('雇员数量'),
    },
    {
      name: 'regionIds',
      label: intl.get('sslm.outsideProjectSetup.modal.areaCode').d('所在区域'),
      type: 'object',
      multiple: true,
      lovCode: 'SPFM.EXT_SOURCE_SUP_REQUIREMENT.REGION',
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
      },
      transformRequest: value => (isArray(value) ? value.map(n => n.regionId).join() : null),
      transformResponse: (value, data) => (value ? data.regionIdsMeaning : null),
    },
  ],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/ext-source-supplier-requirements/${extSourceReqId}`,
      method: 'GET',
    },
  },
});
