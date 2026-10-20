/**
 * index.js -
 * @date: 2024-06-06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import querystring from 'querystring';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import EmbedPage from '_components/EmbedPage';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';

const currentTenantId = getCurrentOrganizationId();

export const openRelationChart = (props = {}) => {
  const {
    supplierCompanyName,
    domesticForeignRelation,
    tenantId = currentTenantId,
    href = '/public/sdat/customized-relation-investigation',
    businessType = '',
  } = props;
  if ([0, 2, '0', '2'].includes(domesticForeignRelation)) {
    notification.error({
      message: intl
        .get('sslm.common.view.meaasge.relationSearchGroupError')
        .d('目前只支持对中国大陆境内企业发起关系排查，当前供应商无法排查'),
    });
    return;
  }
  const params = {
    supplierTenantId: tenantId,
    companyName: supplierCompanyName,
    businessType,
  };
  Modal.open({
    title: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
    children: <RiskProfile params={params} href={href} />,
    cancelButton: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    drawer: true,
    style: { width: 1100 },
    bodyStyle: { padding: 0 },
  });
};

export const RiskProfile = ({ href = '/public/sdat/risk-profile', params = {}, ...rest }) => {
  const param = querystring.stringify(params);

  return (
    <EmbedPage
      href={href}
      location={{
        search: `?${param}`,
      }}
      {...rest}
    />
  );
};
