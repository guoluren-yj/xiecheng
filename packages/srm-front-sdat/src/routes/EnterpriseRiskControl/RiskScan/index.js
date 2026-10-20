import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentUser, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { notification as C7nNotification } from 'choerodon-ui';

import AutoComplete from '@/components/AutoComplete';
import { fetchCompanyList } from '@/services/riskControl/riskScanService';
import { getRiskScanUrl } from '@/services/riskControl/monitorBusinessService';
import bgEn from '@/assets/risk/risk-en.png';
import bgCn from '@/assets/risk/risk-cn.png';

import styles from './index.less';

const { realName, id, loginName = '', language = 'zh_CN' } = getCurrentUser();

let commonParams = {
  userId: id,
  tenantId: getCurrentOrganizationId(),
  operateName: realName,
  realName,
  loginName,
};

const RiskScan = () => {
  const [inputValue, setInput] = useState('');

  useEffect(() => {
    return () => {
      commonParams = {};
    };
  }, []);

  const handleInput = (e) => {
    setInput(e || '');
  };

  const handleSelected = (item) => {
    const keyWord = item?.value ?? '';
    const creditCode = item?.creditCode ?? '';

    getRiskScanUrl({
      keyWord,
      socialCode: creditCode,
      gatewayUrl: location?.origin ?? '',
      ...commonParams,
    }).then((res) => {
      if (res && res.success) {
        if (res && res.data) {
          window.open(res.data);
        }
      } else {
        C7nNotification.error({
          message: intl.get('hzero.common.status.mistake').d('错误'),
          description: res?.message ?? res?.msg ?? '',
        });
      }
    });
  };

  const fetchSuggestions = async () => {
    if (!inputValue) {
      return [];
    }

    const result = await fetchCompanyList({
      searchName: inputValue,
      enterpriseName: inputValue,
      ...commonParams,
    });

    let list = [];
    if (getResponse(result)) {
      const data = result && result.length ? result : [];
      list = data.map((item, index) => {
        return {
          id: item.KeyNo || index,
          value: item.name,
          ...item,
        };
      });
    } else {
      notification.error({
        message: result?.message ?? result?.msg ?? '',
      });
    }

    return list;
  };

  const bgUrl = language === 'en_US' ? bgEn : bgCn;

  return (
    <div className={styles['risk-scan-content']}>
      <Header title={intl.get('sdat.monitorBusiness.view.button.riskScan').d('风险扫描')} />
      <Content className={styles['risk-scan-content-panel']}>
        <div
          style={{
            height: 'calc(100vh - 186px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className={styles['risk-scan-content-title']}>
            {intl
              .get('sdat.riskScan.view.title.monitorTitle')
              .d('风险扫描・助力风险防范，引领业务发展')}
          </div>
          <div className={styles['risk-scan-content-search-panel']}>
            <AutoComplete
              width={680}
              fetchSuggestions={fetchSuggestions}
              onSelect={handleSelected}
              onChange={handleInput}
              placeholder={intl
                .get('sdat.riskScan.view.searchInput.placeholder')
                .d('请输入企业名称查询')}
            />
          </div>
          <div style={{ width: '800px', margin: '0 auto', padding: '8px 0', color: '#868D9C' }}>
            {intl
              .get('sdat.riskScan.view.message.riskScanAlert')
              .d('说明：风险扫描按扫描次数计费，同一企业扫描多次计费多次。')}
          </div>
          <div
            className={styles['risk-scan-content-bottom-img']}
            style={{
              backgroundImage: `url(${bgUrl})`,
            }}
          />
        </div>
      </Content>
    </div>
  );
};

export default formatterCollections({
  code: [
    'sdat.riskScan',
    'sdat.common',
    'sdat.monitorBusiness',
    'sdat.riskScanReport',
    'spfm.wideArea',
  ],
})(RiskScan);
