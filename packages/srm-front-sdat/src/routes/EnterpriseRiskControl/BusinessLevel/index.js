/**
 * 风险报告下载页面
 */
import React, { useState, useEffect } from 'react';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import { getBusinessLevelUrl } from '@/services/riskControl/monitorBusinessService';

import './index.less';

const BusinessLevel = () => {
  const [urlStr, setUrl] = useState('');

  useEffect(() => {
    getBusinessLevelUrl().then((res) => {
      if (!res.success) {
        notification.error({
          message: res?.message ?? res?.msg ?? '',
        });
      } else {
        setUrl(res?.data ?? '');
      }
    });
  }, []);

  return (
    <div className="report-download-basic-page">
      <Header title={intl.get('sdat.businessLevel.view.title.businessLevel').d('企业等级')} />
      <Content>
        {urlStr && (
          <iframe title={urlStr} src={urlStr} frameBorder={0} height="100%" width="100%" />
        )}
      </Content>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.businessLevel'],
})(BusinessLevel);
