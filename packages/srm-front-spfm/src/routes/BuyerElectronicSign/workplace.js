/* eslint-disable react/jsx-indent */
/* eslint-disable eqeqeq */
/* eslint-disable react/jsx-no-target-blank */
/**
 * 采购方电子签章工作台
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { Spin } from 'choerodon-ui/pro';

import { fetchCompanyList, fetchAuthStatus } from '@/services/electronicSignWorkplaceService';
import { fetchQysStep } from '@/services/supplierElecSignWorkplaceService';

import noOrder from '@/assets/sign/noOrder.svg';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';

import AuthDonePanel from './AuthDonePanel';
import AuthStepPanel from './AuthStepPanel';

import OldStepPanel from './OldStepPanel';

import OuterStepPage from './OuterStepPanel/OuterStepPage';

const Workplace = props => {
  const {
    history,
    customizeForm,
    queryDetailLoading,
    saving,
    submitting,
    approveLoading,
    reseting,
    dispatch,
    timeStr,
    basicFormDS,
    ds,
    origin,
    pathname,
    selected,
    queryBuyerParams,
    authInfoId,
    localPageStep,
    urlCompanyId,
    authFinish,
    detailDataSource,
    userAuthStatus,
    statementVisible,
    authType,
    step,
    companyList,
    current,
    isPayment,
    caAuthStatus,
    approveFlag,
    onChangeStatementVisible = () => {},
    onChangeAuthFinish = () => {},
    onCacheCompanyDetail = () => {},
    onChangeSelected = () => {},
    onChangePageStep = () => {},
    onChangeQueryBuyerParams = () => {},
    onChangeCompanyId = () => {},
    onChangeDetailDataSource = () => {},
    onChangeUserAuthStatus = () => {},
    onSubmit = () => {},
    onFetchDetailInfo = () => {},
    onChangeStep = () => {},
    onChangeCompanyList = () => {},
    onChangeCurrent = () => {},
    onChangeIsPayment = () => {},
    onChangeApproveFlag = () => {},
  } = props;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCompany(null, null, 'init');
  }, []);

  const handleRefreshCompanyList = param => {
    onChangeQueryBuyerParams(param?.companyNum ?? '');
    fetchCompany(null, param, selected);
  };

  /**
   * e签宝修改步骤
   */
  const handleChangeStep = num => {
    onChangeStep(num);
  };

  /**
   * 修改 detailDataSource
   * @param {*} data
   */
  const handleChangeDataSource = (data = {}) => {
    onChangeDetailDataSource(data);
  };

  /**
   * 修改实名认证状态
   * @param {*} flag
   */
  const handleChangeUserAuthStatus = flag => {
    onChangeUserAuthStatus(flag);
  };

  const fetchCompany = async (selectedItem = null, param, tag) => {
    const queryParamStr = param?.companyNum ?? '';
    const companyRes = await fetchCompanyList(param ? { ...param } : {});
    setLoading(false);

    if (getResponse(companyRes) && companyRes.length) {
      onChangeCompanyList(companyRes || []);

      if (!queryParamStr && tag) {
        // 初始化 且无查询条件才默认选中
        if (selectedItem) {
          let item = { ...selectedItem };
          if (companyRes.length) {
            companyRes.forEach(rcd => {
              if (rcd.companyId === selectedItem.companyId) {
                item = { ...rcd };
              }
            });
          }
          onChangeSelected({ ...item });
          const typeStr = selected.authType || selected.partnerCode;
          if (['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS', 'QYS'].includes(typeStr)) {
            getCompanyStatus({ ...item });
          } else {
            fetchDetailInfo();
          }
        } else {
          onChangeSelected({ ...companyRes[0] });

          const typeStr = selected.authType || selected.partnerCode;

          if (['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS', 'QYS'].includes(typeStr)) {
            getCompanyStatus({ ...companyRes[0] });
          } else {
            fetchDetailInfo();
          }
        }
      }
    } else {
      onChangeCompanyList([]);
    }
  };

  const handleStepRefresh = obj => {
    return refreshToManage(obj);
    // return fetchCompany(obj, null, 'init');
  };

  /**
   * 清空路由 pageStep 标记
   */
  const refreshToManage = obj => {
    onChangeCompanyId('');
    onChangePageStep('');
    fetchCompany(obj, null, 'init');
  };

  /**
   * 获取企业认证步骤
   * @param {*} comp
   */
  const getCompanyStatus = async (comp = {}) => {
    if (comp && comp.companyId) {
      const typeStr = comp.authType || comp.partnerCode;
      if (['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(typeStr)) {
        fetchAuthStatus({
          companyId: comp?.companyId ?? '',
          authType: typeStr,
          orderTenantId: getCurrentOrganizationId(),
          sourceMenu: 'pur',
        }).then(result => {
          setLoading(false);
          if (getResponse(result)) {
            onChangeCurrent(result?.currentNode ?? '');
            onChangeIsPayment(result?.payment ?? true);
            onChangeAuthFinish(result?.finish ?? false);
          } else {
            onChangeCurrent('');
          }
        });
      } else if (authType !== 'ESIGN') {
        // 非易签宝
        const result = await fetchQysStep({
          companyId: comp?.companyId ?? '',
          tenantId: getCurrentOrganizationId(),
          authType: authType || typeStr,
        });
        if (getResponse(result)) {
          onChangeCurrent(result?.currentNode ?? 0);
          onChangeIsPayment(result?.payment ?? true);
        }
      }
    }
  };

  /**
   * 从列表选择的公司
   * @param {*} company
   */
  const handleSelectCompany = (company = null) => {
    onChangeSelected({ ...company });
    const typeStr = selected.authType || selected.partnerCode;
    if (!['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(typeStr)) {
      fetchDetailInfo();
    }
  };

  const cacheCompanyDetail = record => {
    if (onCacheCompanyDetail && typeof onCacheCompanyDetail === 'function') {
      onCacheCompanyDetail(record);
    }
  };

  const handleChangeAuthFinish = status => {
    onChangeAuthFinish(status);
  };

  /**
   * fetchDetailInfo - 查询明细信息
   */
  const fetchDetailInfo = () => {
    if (onFetchDetailInfo && typeof onFetchDetailInfo === 'function') {
      onFetchDetailInfo();
    }
  };

  /**
   * submit - 提交
   */
  const submit = () => {
    if (onSubmit && typeof onSubmit === 'function') {
      onSubmit();
    }
  };

  const onChangeStatVisible = () => {
    onChangeStatementVisible(false);
    onChangeApproveFlag(`approve${new Date().getTime()}`);
  };

  // 只有一家公司 且 未认证通过
  const companyOnlyAuth = companyList && companyList.length === 1 && !queryBuyerParams;

  return (
    <div style={{ padding: '0', background: !loading ? 'none' : '#fff' }}>
      <Spin spinning={loading}>
        {!loading ? (
          <>
            {!queryBuyerParams && (!companyList || !companyList.length) ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff',
                  width: '100%',
                  height: 'calc(100vh - 156px)',
                }}
              >
                <div>
                  <NoContent style={{ width: '136px', height: '96px' }} />
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '8px',
                    color: '#101319',
                    fontSize: '14px',
                  }}
                >
                  {intl.get('spfm.buyerElectronicSign.view.message.noContent').d('暂无数据')}
                </div>
              </div>
            ) : companyOnlyAuth &&
              (!authFinish || localPageStep) &&
              caAuthStatus !== 'CA_SUCCESS' ? ( // 公司只有一家 而且 未完成所有认证 进入单公司认证页面
              <>
                {['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(authType) ? (
                  <AuthStepPanel
                    currentNode={current}
                    redirectUrl={`${origin}${pathname}`}
                    companyDetail={selected}
                    history={history}
                    authType={selected?.partnerCode}
                    onRefreshStatus={handleStepRefresh}
                    onRefreshToManage={refreshToManage}
                  />
                ) : selected?.foreignFlag === 0 && authType === 'QYS' ? (
                  <OuterStepPage
                    currentNode={current}
                    isPayment={isPayment}
                    approveFlag={approveFlag}
                    redirectUrl={`${origin}${pathname}`}
                    companyDetail={selected}
                    history={history}
                    authType={selected?.partnerCode}
                    onRefreshStatus={handleStepRefresh}
                    onRefreshToManage={refreshToManage}
                  />
                ) : (
                  <OldStepPanel
                    authType={authType}
                    companyDetail={selected}
                    history={history}
                    dispatch={dispatch}
                    step={step}
                    ds={ds}
                    currentNode={current}
                    saving={saving}
                    reseting={reseting}
                    submitting={submitting}
                    approveLoading={approveLoading}
                    queryDetailLoading={queryDetailLoading}
                    detailDataSource={detailDataSource}
                    statementVisible={statementVisible}
                    authInfoId={authInfoId}
                    userAuthStatus={userAuthStatus}
                    onReChangeStep={handleChangeStep}
                    onRefreshStatus={refreshToManage}
                    onCallBackCompanyDetail={cacheCompanyDetail}
                    onSubmit={submit}
                    onRefreshToManage={refreshToManage}
                    onFetchDetailInfo={fetchDetailInfo}
                    onChangeDataSource={handleChangeDataSource}
                    onChangeStatVisible={onChangeStatVisible}
                    onChangeUserAuthStatus={handleChangeUserAuthStatus}
                  />
                )}
              </>
            ) : (
              <AuthDonePanel
                approveFlag={approveFlag}
                companyArray={companyList}
                redirectUrl={`${origin}${pathname}`}
                companyDetail={selected}
                pageStep={localPageStep}
                step={step}
                ds={ds}
                timeStr={timeStr}
                urlCompanyId={urlCompanyId}
                history={history}
                dispatch={dispatch}
                authType={authType}
                customizeForm={customizeForm}
                selected={selected}
                basicFormDS={basicFormDS}
                statementVisible={statementVisible}
                detailDataSource={detailDataSource}
                onRefreshStatus={refreshToManage}
                onSelectCompany={handleSelectCompany}
                onChangeAuthFinish={handleChangeAuthFinish}
                onCacheCompanyDetail={cacheCompanyDetail}
                onFetchDetailInfo={fetchDetailInfo}
                onRefreshCompanyList={handleRefreshCompanyList}
                onCallBackCompanyDetail={cacheCompanyDetail}
                onSubmit={submit}
                onReChangeStep={handleChangeStep}
                onRefreshToManage={refreshToManage}
                onChangeDataSource={handleChangeDataSource}
                onChangeStatVisible={onChangeStatVisible}
                onChangeUserAuthStatus={handleChangeUserAuthStatus}
              />
            )}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              height: 'calc(100vh - 300px)',
            }}
          >
            <img src={noOrder} alt="" />
            <div
              style={{
                textAlign: 'center',
                fontSize: '16px',
                color: '#1D2129',
                fontWeight: '500',
                lineHeight: '24px',
                marginTop: '16px',
              }}
            >
              {intl.get('spfm.buyerElectronicSign.view.message.signNotOpen').d('暂未开通电签产品')}
            </div>
            <div
              style={{
                textAlign: 'center',
                color: '#4E5769',
                fontSize: '14px',
                lineHeight: '22px',
                marginTop: '8px',
              }}
            >
              {intl
                .get('spfm.buyerElectronicSign.view.message.applyOpenOrder')
                .d('请联系客户经理帮您申请开通相应产品服务')}
            </div>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default Workplace;
