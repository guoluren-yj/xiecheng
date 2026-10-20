/*
 * @Date: 2023-09-15 11:16:50
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import InvitationInfo from '../../InvitationInfo'; // 邀约信息

const Index = ({ commonProps }) => {
  const {
    companyBaseInfo,
    invitationInfoDs,
    purchaseSelectedRows,
    filterCompanyLovFlag,
    customizeForm,
    custLoading,
    isEdit = false,
  } = commonProps;

  return (
    <div className="card-wrap">
      <div className="enterprise-title-no-border">
        <div className="card-detail-title">
          {intl.get('sslm.supplierEntryDetail.view.entry.invitationInfo').d('邀请信息')}
        </div>
      </div>
      <InvitationInfo
        dataSet={invitationInfoDs}
        custLoading={custLoading}
        customizeForm={customizeForm}
        isEdit={isEdit}
        companyBaseInfo={companyBaseInfo}
        purchaseSelectedRows={purchaseSelectedRows}
        filterCompanyLovFlag={filterCompanyLovFlag}
        customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.INVITATION_INFO"
      />
    </div>
  );
};

export default Index;
