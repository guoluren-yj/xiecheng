import React from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import StaticSearchBar from '@/components/StaticSearchBar';

import { ListDS } from './store/customerDS';
import CustomizedTable from './CustomizedTable';
import { getQueryConfig } from './queryConfig';

import styles from './index.less';

function BankStatementInquiry(props) {
  const { listDS, customizeTable } = props;

  const handleFilterQueryAll = ({ params }) => {
    const { pmtTime_range: rangeTime = '' } = params;
    const [pmtStartTimeFrom = undefined, pmtStartTimeTo = undefined] = rangeTime?.split(',') ?? [];

    listDS.queryParameter = { ...params, pmtStartTimeFrom, pmtStartTimeTo };
    listDS.query();
  };

  return (
    <>
      <Header
        title={intl
          .get('sdat.bankStatementInquiry.view.title.bankStatementInquiry')
          .d('银行流水查询')}
      />
      <Content style={{ margin: '8px' }} className={styles['customer-account-config-basic']}>
        <StaticSearchBar
          key="monitor-org-bar"
          cacheState
          clearButton
          searchCode="SDAT.BANK_STATEMENT_INQUIRY.QUERY_BAR"
          filters={getQueryConfig()}
          dataSet={[listDS]}
          onQuery={handleFilterQueryAll}
          showLoading={false}
          // defaultExpand={false}
        />
        <div className={styles['table-box']}>
          <CustomizedTable listDS={listDS} customizeTable={customizeTable} />
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.bankStatementInquiry', 'sdat.customerAccount'],
})(
  withCustomize({
    unitCode: ['SDAT.BANK_ENTER_DIRECT_LINK_CUSTOM'],
  })(
    withProps(
      () => {
        const listDS = new DataSet(ListDS());
        return { listDS };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(BankStatementInquiry)
  )
);
