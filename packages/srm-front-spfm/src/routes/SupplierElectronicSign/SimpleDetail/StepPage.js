/**
 * 步骤条页
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Steps } from 'choerodon-ui';
import intl from 'utils/intl';

import RealNameAuth from '../OldSteps/RealNameAuth';
import CaAuth from '../OldSteps/CaAuth';
import AuthorizedPanel from '../OldSteps/AuthorizedPanel';
import FinishedPanel from '../OldSteps/FinishedPanel';

import styles from './index.less';

const { Step } = Steps;

export default function StepPage(props) {
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

  const switchPanel =
    authType === 'QYS'
      ? {
          0: <RealNameAuth {...commonParam} />,
          1: <CaAuth {...commonParam} />,
          2: <FinishedPanel onRefreshToManage={onRefreshToManage} {...commonParam} />,
        }
      : {
          0: <RealNameAuth {...commonParam} />,
          1: <CaAuth {...commonParam} />,
          2: <AuthorizedPanel {...commonParam} />,
          3: <FinishedPanel onRefreshToManage={onRefreshToManage} {...commonParam} />,
        };

  return (
    <div
      style={{
        backgroundColor: '#fff',
      }}
    >
      <div className={styles['auth-step-basic-panel']}>
        <div style={{ width: '90%', margin: '0 auto' }}>
          <Steps size="small" current={current}>
            <Step
              title={intl.get('spfm.buyerElectronicSign.view.title.realNameAuth').d('实名认证')}
            />
            <Step
              title={intl.get('spfm.buyerElectronicSign.view.title.businessAuth').d('企业认证')}
            />
            {authType !== 'QYS' && (
              <Step
                title={intl
                  .get('spfm.buyerElectronicSign.view.title.businessAuthorized')
                  .d('企业授权')}
              />
            )}
            <Step title={intl.get('spfm.buyerElectronicSign.view.title.finished').d('完成')} />
          </Steps>
        </div>
      </div>
      <div
        style={{
          height: 'calc(100vh - 212px)',
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
