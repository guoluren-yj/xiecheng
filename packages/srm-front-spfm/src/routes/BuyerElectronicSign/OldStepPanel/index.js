/* eslint-disable eqeqeq */
import React, { useState, useMemo, useEffect } from 'react';
import intl from 'utils/intl';
import { Steps } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';
import { queryIdpValue } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import OldDetail from '../OldDetail';

import RealNameAuth from './OldSteps/RealNameAuth';
import CaAuth from './OldSteps/CaAuth';
import FinishedPanel from './OldSteps/FinishedPanel';
import AuthorizedPanel from './OldSteps/AuthorizedPanel';

import styles from './index.less';

const { Step } = Steps;

const OldStepPanel = (props) => {
  const {
    currentNode = 0,
    companyDetail = {},
    companyId = '',
    authType = '',
    redirectUrl = '',
    history,
    dispatch,
    styleCla,
    step = 0,
    ds,
    detailDataSource,
    statementVisible,
    authInfoId,
    userAuthStatus,
    saving,
    reseting,
    submitting,
    loading = false,
    approveLoading,
    queryDetailLoading,
    onRefreshStatus = () => {},
    onRefreshToManage = () => {},
    onReChangeStep = () => {},
    onChangeDataSource = () => {},
    onFetchDetailInfo = () => {},
    onChangeUserAuthStatus = () => {},
    onChangeStatVisible = () => {},
    onSubmit = () => {},
  } = props;

  const [current, setCurrent] = useState(3);
  const [typeMap, setTypeMap] = useState({});

  useEffect(() => {
    queryIdpValue('SPFM.PERSON_AUTH_PRODUCT_VERSION').then((res) => {
      if (getResponse(res) && Array.isArray(res) && res.length) {
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
      companyId,
      tenantId: getCurrentOrganizationId(),
      authType,
      dispatch,
      typeMap,
      detailDataSource,
    }),
    [redirectUrl, companyDetail, typeMap, detailDataSource]
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

  // const { authStatus } = companyDetail;

  return (
    <div
      style={{
        backgroundColor: '#fff',
        ...styleCla,
      }}
    >
      <Spin spinning={loading}>
        <>
          {authType === 'ESIGN' ? (
            <>
              <OldDetail
                step={step}
                ds={ds}
                authInfoId={authInfoId}
                authType={authType}
                companyId={companyId}
                userAuthStatus={userAuthStatus}
                saving={saving}
                dispatch={dispatch}
                history={history}
                reseting={reseting}
                submitting={submitting}
                approveLoading={approveLoading}
                queryDetailLoading={queryDetailLoading}
                detailDataSource={detailDataSource}
                statementVisible={statementVisible}
                onRefreshStatus={onRefreshStatus}
                onReChangeStep={onReChangeStep}
                onRefreshToManage={onRefreshToManage}
                onFetchDetailInfo={onFetchDetailInfo}
                onChangeDataSource={onChangeDataSource}
                onChangeUserAuthStatus={onChangeUserAuthStatus}
                onChangeStatVisible={onChangeStatVisible}
                onSubmit={onSubmit}
              />
            </>
          ) : (
            <>
              <div className={styles['auth-step-basic-panel']}>
                <div style={{ width: '90%', margin: '0 auto' }}>
                  <Steps size="small" current={current}>
                    <Step
                      title={intl.get('spfm.buyerElectronicSign.view.title.realNameAuthWithType', {
                        name: typeMap[authType],
                      })}
                    />
                    <Step
                      title={intl
                        .get('spfm.buyerElectronicSign.view.title.businessAuth')
                        .d('企业认证')}
                    />
                    {authType !== 'QYS' && (
                      <Step
                        title={intl
                          .get('spfm.buyerElectronicSign.view.title.businessAuthorized')
                          .d('企业授权')}
                      />
                    )}
                    <Step
                      title={intl.get('spfm.buyerElectronicSign.view.title.finished').d('完成')}
                    />
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
            </>
          )}
        </>
      </Spin>
    </div>
  );
};

export default OldStepPanel;
