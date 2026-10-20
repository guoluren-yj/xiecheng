/**
 * 风险报告下载页面
 */
import React, { useState, useEffect } from 'react';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { getDownLoadUrl } from '@/services/riskControl/monitorBusinessService';

import './index.less';

const { realName, id, loginName = '' } = getCurrentUser();

let commonParams = {
  userId: id,
  tenantId: getCurrentOrganizationId(),
  operateName: realName,
  realName,
  loginName,
};

const ReportDownload = () => {
  const [urlStr, setUrl] = useState('');

  useEffect(() => {
    getDownLoadUrl({
      ...commonParams,
    }).then((res) => {
      if (!res.success) {
        notification.error({
          message: res?.message ?? res?.msg ?? '',
        });
      } else {
        setUrl(res?.data ?? '');
      }
    });

    return () => {
      commonParams = {};
    };
  }, []);

  return (
    <div className="report-download-basic-page">
      <Header title={intl.get('sdat.reportDownload.view.title.reportDownload').d('报告下载')} />
      <Content>
        {urlStr && (
          <iframe title={urlStr} src={urlStr} frameBorder={0} height="100%" width="100%" />
        )}
      </Content>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.reportDownload'],
})(ReportDownload);
