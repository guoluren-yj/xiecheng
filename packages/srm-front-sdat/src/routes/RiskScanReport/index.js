/**
 * 风险扫描报告
 */
import React, { useEffect, useState } from 'react';
// import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchRiskDetail } from '@/services/riskScan/riskScanReport';
import { getResponse, getRealUrlParam } from '@/utils/utils';

import Header from './components/Header';
import BasicForm from './components/BasicForm';
import RiskScanResult from './components/RiskScanResult';

import styles from './index.less';

const RiskScanReport = ({ location, history }) => {
  const { keyWord = '', passport = '', tenantId = '' } = getRealUrlParam(location.search);

  const [current, setCurrent] = useState({});

  useEffect(() => {
    document.title = keyWord;
    fetchRiskDetail({
      keyWord,
      passport,
      tenantId,
    }).then(res => {
      if (getResponse(res)) {
        setCurrent({ ...res });
      }
    });
  }, []);

  return (
    <div className={styles['risk-scan-basic']}>
      <Header
        companyDetail={{ ...current }}
        keyword={keyWord}
        passport={passport}
        tenantId={tenantId}
        history={history}
      />
      <BasicForm companyDetail={{ ...current }} />
      <RiskScanResult keyword={keyWord} passport={passport} tenantId={tenantId} />
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.riskScanReport', 'sdat.riskProfile'],
})(RiskScanReport);
