/**
 * index.js - 风险档案
 * @date: 2024-06-06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import querystring from 'querystring';

import EmbedPage from '_components/EmbedPage';
import { getCurrentOrganizationId } from 'utils/utils';

const RiskProfile = ({ history, basic }) => {
  const { companyName } = basic || {};

  const param = querystring.stringify({ companyName, organizationId: getCurrentOrganizationId() });

  return companyName ? (
    <div className="supplier-detail-content" id="riskProfile">
      <EmbedPage
        href="/public/sdat/risk-profile"
        history={history}
        location={{
          search: `?${param}`,
        }}
      />
    </div>
  ) : null;
};

export default RiskProfile;
