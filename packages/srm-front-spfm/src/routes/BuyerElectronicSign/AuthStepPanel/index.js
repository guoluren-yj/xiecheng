/**
 * 认证步骤页
 */
import React, { useState, useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Steps } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';
import { queryIdpValue } from 'services/api';

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
    // detailDataSource,
    redirectUrl = '',
    history,
    onRefreshStatus = () => {},
    onRefreshToManage = () => {},
    styleCla,
    authType,
    loading = false,
  } = props;

  const [current, setCurrent] = useState(0);
  const [typeMap, setTypeMap] = useState({});

  useEffect(() => {
    queryIdpValue('SPFM.PERSON_AUTH_PRODUCT_VERSION').then((res) => {
      if (getResponse(res) && res.length) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });

        setTypeMap(obj);
      }
    });
  }, []);

  useEffect(() => {
    setCurrent(currentNode > 0 ? currentNode - 1 : 0);
  }, [currentNode]);

  const commonParam = useMemo(
    () => ({
      redirectUrl,
      companyDetail,
      onRefreshStatus,
      history,
      authType,
      typeMap,
    }),
    [redirectUrl, companyDetail, authType, typeMap]
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
        ...styleCla,
      }}
    >
      <Spin spinning={loading}>
        <>
          <div className={styles['auth-step-basic-panel']}>
            <div style={{ width: '90%', margin: '0 auto' }}>
              <Steps size="small" current={current}>
                <Step
                  title={intl.get('spfm.buyerElectronicSign.view.title.realNameAuthWithType', {
                    name: typeMap[authType],
                  })}
                />
                <Step title={intl.get('spfm.buyerElectronicSign.view.title.caAuth').d('CA认证')} />
                <Step
                  title={intl.get('spfm.buyerElectronicSign.view.title.authorized').d('授权')}
                />
                <Step title={intl.get('spfm.buyerElectronicSign.view.title.finished').d('完成')} />
              </Steps>
            </div>
          </div>
          <div
            style={{
              padding: '16px',
              border: '1px solid rgba(229,231,236,1)',
              borderTop: 'none',
            }}
          >
            {switchPanel[current]}
          </div>
        </>
      </Spin>
    </div>
  );
}
