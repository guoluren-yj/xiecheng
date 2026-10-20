/**
 * 认证步骤页
 */
import React, { useState, useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import { Steps } from 'choerodon-ui';

import RealNameAuth from './RealNameAuth';
import CaAuth from './CaAuth';
import AuthorizedPanel from './AuthorizedPanel';
import FinishedPanel from './FinishedPanel';

import styles from './index.less';

const { Step } = Steps;

export default function AuthStepPanel(props) {
  const {
    currentNode = 0,
    companyDetail = {},
    companyId = '',
    tenantId = '',
    authType = '',
    redirectUrl = '',
    history,
    onRefreshStatus = () => {},
    onRefreshToManage = () => {},
    style,
  } = props;

  const [current, setCurrent] = useState(3);

  useEffect(() => {
    setCurrent(currentNode > 0 ? currentNode - 1 : 0);
  }, [currentNode]);

  const commonParam = useMemo(
    () => ({
      redirectUrl,
      companyDetail,
      onRefreshStatus,
      history,
      companyId,
      tenantId,
      authType,
    }),
    [redirectUrl, companyDetail]
  );

  const switchPanel = {
    0: <RealNameAuth {...commonParam} />,
    1: <CaAuth {...commonParam} />,
    2: <AuthorizedPanel {...commonParam} />,
    3: <FinishedPanel onRefreshToManage={onRefreshToManage} {...commonParam} />,
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        ...style,
      }}
    >
      <div className={styles['auth-step-basic-panel']}>
        <div style={{ width: '90%', margin: '0 auto' }}>
          <Steps size="small" current={current}>
            <Step
              title={intl.get('spfm.buyerElectronicSign.view.title.realNameAuth').d('实名认证')}
            />
            <Step title={intl.get('spfm.buyerElectronicSign.view.title.caAuth').d('CA认证')} />
            <Step title={intl.get('spfm.buyerElectronicSign.view.title.authorized').d('授权')} />
            <Step title={intl.get('spfm.buyerElectronicSign.view.title.finished').d('完成')} />
          </Steps>
        </div>
      </div>
      <div
        style={{
          height: 'calc(100vh - 210px)',
          padding: '16px',
          border: '1px solid rgba(229,231,236,1)',
          borderTop: 'none',
        }}
      >
        {switchPanel[current]}
      </div>
    </div>
  );
}
