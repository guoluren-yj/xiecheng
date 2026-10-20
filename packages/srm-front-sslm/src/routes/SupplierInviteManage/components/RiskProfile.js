/**
 * index.js - 风险档案
 * @date: 2024-06-06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import querystring from 'querystring';
import { isEmpty } from 'lodash';

import { Card } from 'choerodon-ui';

import EmbedPage from '_components/EmbedPage';
import { getCurrentOrganizationId } from 'utils/utils';

const RiskProfile = ({ history, record }) => {
  const supplierName = !isEmpty(record) ? record.get('supplierName') : '';
  const param = querystring.stringify({
    companyName: supplierName,
    organizationId: getCurrentOrganizationId(),
    needFold: true,
  });

  return supplierName ? (
    <Card bordered={false} title="">
      <EmbedPage
        href="/public/sdat/risk-profile"
        history={history}
        location={{
          search: `?${param}`,
        }}
      />
    </Card>
  ) : null;
};

export default RiskProfile;
