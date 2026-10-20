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
    <div className={Style['ssrc-price-clarification-wrapper']}>
      <Spin spinning={pageLoading}>
        <TopSection
          code={getCustomizeUnitCode('headerInfoCard')}
          getHocInstance={getHocInstance}
          className={`${Style['approval-common-top-section-card']} ${Style['ssrc-price-clarification-approval-af-basic-card']}`}
          titleProps={{ style: { display: 'none' } }}
        >
          <HeaderInfo />
        </TopSection>
        <TopSection
          title={intl
            .get('ssrc.inquiryHall.view.inquiryHall.priceClarificationInfo')
            .d('价格澄清信息')}
          code={getCustomizeUnitCode('basicInfoCard')}
          getHocInstance={getHocInstance}
          className={`${Style['approval-common-top-section-card']}`}
        >
          <BasicForm />
        </TopSection>
        <TopSection
          code={getCustomizeUnitCode('supplierListCard')}
          getHocInstance={getHocInstance}
          className={`${Style['approval-common-top-section-card']} ${Style['ssrc-price-clarification-approval-content']}`}
          titleProps={{ style: { display: 'none' } }}
        >
          <SupplierQuotationTable />
        </TopSection>
      </Spin>
    </div>
  );
};

export default observer(Page);
