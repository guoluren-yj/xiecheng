/*
 * @Date: 2023-09-15 11:16:50
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';
import Investigation from '@/routes/components/Investigation';

const Index = ({ commonProps }) => {
  const { changeReqId, companyBaseInfo, entryBaseInfoDs, isEdit = false, userInfo } = commonProps;

  const { investgHeaderId, investigateTemplateId } = entryBaseInfoDs.getState('investgateObj');

  return (
    <div className="card-wrap">
      <div className="enterprise-title">
        <div className="card-detail-title">
          {intl.get('sslm.supplierEntryDetail.view.entry.supplementaryInfo').d('补充信息')}
          <span className="card-detail-title-tips">
            {intl
              .get('sslm.supplierEntryDetail.view.entry.supplementaryInfoTips')
              .d('通过调查表补充收集的供应商主数据信息')}
          </span>
        </div>
      </div>
      <Investigation
        showTabBar={false}
        editable={isEdit}
        investgHeaderId={investgHeaderId}
        investigateTemplateId={investigateTemplateId}
        organizationId={getCurrentOrganizationId()}
        userInfo={userInfo}
        changeReqId={changeReqId}
        tableStyle={{ maxHeight: 'calc(100vh - 400px)' }}
        defaultBankCompanyName={companyBaseInfo.companyName}
        filertDuplicateTabFlag={1}
      />
    </div>
  );
};

export default Index;
