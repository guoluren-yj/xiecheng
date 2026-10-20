/**
 * 风险报告下载
 */
import React, { useEffect, useState } from 'react';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { ReactComponent as NoContent } from '@/assets/images/reportDown.svg';
import { fetchPagePermission, fetchCompanyList } from '@/services/riskScan/reportDownloadService';

import AutoComplete from './AutoComplete';

import styles from './index.less';

const { realName, id, loginName = '' } = getCurrentUser();

let commonParams = {
  userId: id,
  tenantId: getCurrentOrganizationId(),
  operateName: realName,
  realName,
  loginName,
};

const RiskReportDownload = () => {
  const [hasPermission, setPermission] = useState(false);
  const [inputValue, setInput] = useState('');

  useEffect(() => {
    fetchPagePermission().then((res) => {
      if (getResponse(res)) {
        setPermission(res?.openStatus ?? false);
      }
    });

    return () => {
      commonParams = {};
    };
  }, []);

  const fetchSuggestions = async () => {
    if (!inputValue) return [];

    const result = await fetchCompanyList({
      searchName: inputValue,
      enterpriseName: inputValue,
      ...commonParams,
    });

    let list = [];
    if (result?.success) {
      const data = result?.data?.Data ?? [];
      list = data.map((item, index) => {
        return {
          id: item.KeyNo || index,
          value: item.Name,
        };
      });
    } else {
      notification.error({
        message: result?.message ?? result?.msg ?? '',
      });
    }

    return list;
  };

  const handleInput = (e) => {
    setInput(e || '');
  };

  return (
    <>
      <Header
        title={intl.get('sdat.reportDownload.view.title.riskReportQuery').d('风险报告查询')}
      />
      <Content className={styles['risk-report-download-basic']}>
        {hasPermission ? (
          <div style={{ marginTop: '100px' }}>
            <div style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>
              {intl.get('sdat.reportDownload.view.title.riskReportQuery').d('风险报告查询')}
            </div>
            <div className={styles['risk-scan-content-search-panel']}>
              <AutoComplete
                width={680}
                fetchSuggestions={fetchSuggestions}
                onChange={handleInput}
                placeholder={intl
                  .get('sdat.reportDownload.view.searchInput.placeholder')
                  .d('请输入企业名称查询')}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'calc(100vh - 200px)',
            }}
          >
            <div className={styles['risk-report-no-permission']}>
              <NoContent />
            </div>
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#1D2129' }}>
              {intl
                .get('sdat.reportDownload.view.msg.noOpenService')
                .d('暂未开通服务，请联系管理员开通后使用')}
            </div>
          </div>
        )}
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdat.reportDownload', 'sdat.riskScanReport'],
})(RiskReportDownload);
