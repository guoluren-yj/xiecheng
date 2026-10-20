import React, { useContext } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import { TopSection } from '_components/Section';
import intl from 'utils/intl';

import { StoreContext } from './store/StoreProvider';
import Style from './index.less';
import HeaderInfo from './components/HeaderInfo';
import BasicForm from './components/BasicForm';
import SupplierQuotationTable from './components/SupplierQuotationTable';

const Page = () => {
  const { getHocInstance, getCustomizeUnitCode = noop, pageLoading = false } = useContext(
    StoreContext
  );

  return (
    <div className={Style['ssrc-rfx-bargain-wrapper']}>
      <Spin spinning={pageLoading}>
        <TopSection
          code={getCustomizeUnitCode('headerInfoCard')}
          getHocInstance={getHocInstance}
          className={`${Style['approval-common-top-section-card']} ${Style['ssrc-rfx-bargain-approval-af-basic-card']}`}
          titleProps={{ style: { display: 'none' } }}
        >
          <HeaderInfo />
        </TopSection>
        <TopSection
          title={intl.get('ssrc.inquiryHall.view.inquiryHall.bargainInfo').d('议价信息')}
          code={getCustomizeUnitCode('basicInfoCard')}
          getHocInstance={getHocInstance}
          className={`${Style['approval-common-top-section-card']}`}
        >
          <BasicForm />
        </TopSection>
        <TopSection
          title={
            <div className={Style['ssrc-rfx-bargain-title']}>
              {intl.get('ssrc.inquiryHall.view.inquiryHall.bargainDetail').d('议价详情')}
            </div>
          }
          code={getCustomizeUnitCode('supplierListCard')}
          getHocInstance={getHocInstance}
          className={`${Style['ssrc-rfx-bargain-approval-content']}`}
        >
          <SupplierQuotationTable />
        </TopSection>
      </Spin>
    </div>
  );
};

export default observer(Page);
