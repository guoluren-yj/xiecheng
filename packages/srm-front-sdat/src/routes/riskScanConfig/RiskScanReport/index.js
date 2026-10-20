/* eslint-disable react/jsx-indent */
/*
 * @Description: 风险扫描报告详情 风控 V2
 * @Author: lqx(qingxiang.luo@going-link.com)
 * @Date: 2025-01-16 14:46:58
 * @Last Modified by: lqx(qingxiang.luo@going-link.com)
 * @Last Modified time: 2025-06-20 17:08:04
 */

import React, { useEffect, useState } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { fetchRiskBasicInfo, fetchScanMessage } from '@/services/riskScanVersion2/riskScanReport';
import { getResponse, getURLSearchParams } from '@/utils/utils';

import Header from './components/Header';
import BasicForm from './components/BasicForm';
import RiskScanResult from './components/RiskScanResult';
import FinancialReport from './FinancialReport';

import styles from './index.less';

const RiskScanReport = ({ location, history }) => {
  const {
    keyWord = '',
    passport = '',
    // tenantId = '',
    companyId = '',
    planId,
    socialCode = '',
    supplierCompanyId = '',
  } = getURLSearchParams(location.search);

  const [current, setCurrent] = useState({});
  const [cardList, setCardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(true);
  const [scanData, setScanData] = useState([]);
  const [headerData, setHeaderData] = useState({});

  useEffect(() => {
    document.title = keyWord;
    getAllMsg();
  }, []);

  const getAllMsg = async () => {
    Promise.all([getRiskBasic(), getScanMsg()]).then((res) => {
      setLoading(false);
      const [obj1, arr1] = res || [];

      if (obj1 && obj1.constructor === Object) {
        setCardList(obj1?.riskOverviewDTOList ?? []);
        setHeaderData({
          dataDate: obj1?.dataDate ?? '',
          score: obj1?.score ?? 0,
          riskLevel: obj1?.riskLevel ?? '',
        });
      }

      if (arr1 && Array.isArray(arr1)) {
        if (arr1.length) {
          const changeArray =
            arr1.filter((item) => item.riskCode === 'QUERY_EP_RISK_BASIC_INFO_V2')[0]?.changeList ??
            [];
          const obj2 = changeArray.length ? changeArray[0]?.riskMessage : {};
          setCurrent(obj2);
          setScanData(arr1);
        }
      }
    });
  };

  const getRiskBasic = async () => {
    const res = await fetchRiskBasicInfo({
      enterpriseName: keyWord,
      passport,
      tenantId: '',
      socialCode: ['null', 'undefined']?.includes(socialCode) ? '' : socialCode,
      planId: ['null', 'undefined']?.includes(planId) ? '' : planId,
      supplierCompanyId: ['null', 'undefined']?.includes(supplierCompanyId)
        ? ''
        : supplierCompanyId,
      companyId: ['null', 'undefined']?.includes(companyId) ? '' : companyId,
    });
    return getResponse(res);
  };

  const getScanMsg = async () => {
    const res = await fetchScanMessage({
      enterpriseName: keyWord,
      passport,
      tenantId: '',
      socialCode: ['null', 'undefined']?.includes(socialCode) ? '' : socialCode,
      planId: ['null', 'undefined']?.includes(planId) ? '' : planId,
      supplierCompanyId: ['null', 'undefined']?.includes(supplierCompanyId)
        ? ''
        : supplierCompanyId,
      companyId: ['null', 'undefined']?.includes(companyId) ? '' : companyId,
    });
    return getResponse(res);
  };

  return (
    <Spin spinning={loading || loading1} tip="Loading...">
      <div className={styles['risk-scan-basic']} style={{ minHeight: '600px' }}>
        <>
          {(current && Object.keys(current).length) ||
          (headerData && Object.keys(headerData).length) ? (
            <Header
              loading={loading || loading1}
              companyDetail={{ ...current }}
              headerData={headerData}
              keyword={keyWord}
              passport={passport}
              tenantId=""
              companyId={companyId}
              planId={planId}
              socialCode={socialCode}
              history={history}
              supplierCompanyId={supplierCompanyId}
            />
          ) : null}

          {current && Object.keys(current).length ? (
            <BasicForm companyDetail={{ ...current }} loading={loading || loading1} />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                height: '48px',
                fontSize: '12px',
                color: 'rgba(0,0,0,0.5)',
              }}
            >
              {intl
                .get('sdat.riskScanReport.view.title.scanAlertMsg')
                .d(
                  '根据相关网站检索及大数据分析暂未查询到相关信息，不排除因信息公开来源尚未公开、公开形式存在差异、检索时间存在滞后等情况导致的信息与客观事实不完全一致的情形，仅供客户参考'
                )}
            </div>
          )}

          {scanData.length ? (
            <FinancialReport scanData={scanData} keyword={keyWord} loading={loading || loading1} />
          ) : null}
          <RiskScanResult
            loading={loading || loading1}
            keyword={keyWord}
            passport={passport}
            tenantId=""
            companyId={companyId}
            planId={planId}
            socialCode={socialCode}
            cardList={cardList}
            supplierCompanyId={supplierCompanyId}
            onCallBackForLoading={() => setLoading1(false)}
          />
        </>
      </div>
    </Spin>
  );
};

export default formatterCollections({
  code: ['sdat.riskScanReport', 'sdat.riskNewScanReport', 'sdat.riskProfile'],
})(RiskScanReport);
