/**
 * 步骤条页
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Steps } from 'choerodon-ui';
import intl from 'utils/intl';

import RealNameAuth from '../AuthStepPanel/RealNameAuth';
import FinishedPanel from '../AuthStepPanel/FinishedPanel';

import OuterCaAuth from './OuterCaAuth';
import OuterCheckBank from './OuterCheckBank';

import styles from './index.less';

const { Step } = Steps;

export default function OuterStepPage(props) {
  const {
    currentNode = 0,
    companyDetail = {},
    authType = '',
    redirectUrl = '',
    styleCla,
    approveFlag,
    isPayment,
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
      authType,
      approveFlag,
    }),
    [redirectUrl, companyDetail, approveFlag]
  );

  const switchPanel = {
    0: <RealNameAuth {...commonParam} />,
    1: <OuterCaAuth {...commonParam} />,
    2: <OuterCheckBank {...commonParam} />,
    3: <FinishedPanel onRefreshToManage={onRefreshToManage} {...commonParam} />,
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        ...styleCla,
      }}
    >
      <div className={styles['auth-step-basic-panel']}>
        <div style={{ width: '90%', margin: '0 auto' }}>
          <Steps size="small" current={current}>
            <Step
              title={intl.get('spfm.buyerElectronicSign.view.title.realNameAuth').d('实名认证')}
            />
            <Step
              title={intl
                .get(`spfm.certificateAuthority.view.message.title.infoAuth`)
                .d('企业信息验证')}
            />
            <Step
              title={intl.get(`spfm.certificateAuthority.view.message.title.toPay`).d('打款验证')}
              status={current === 4 ? 'success' : !isPayment ? 'error' : null}
              description={
                current === 3 && !isPayment
                  ? intl.get(`spfm.certificateAuthority.view.message.checkFailed`).d('验证失败')
                  : null
              }
            />
            <Step title={intl.get('spfm.buyerElectronicSign.view.title.finished').d('完成')} />
          </Steps>
        </div>
      </div>
      <div
        style={{
          height: 'calc(100vh - 209px)',
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
