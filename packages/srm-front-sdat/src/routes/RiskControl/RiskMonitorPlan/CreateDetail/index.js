/* eslint-disable eqeqeq */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import intl from 'utils/intl';
import _ from 'lodash';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';
import { Header } from 'components/Page';
import { DataSet, Button, Spin } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import { formatDeleteOrAdd } from '@/utils/utils';
import {
  fetchSavePlanConfig,
  fetchDetailConfig,
} from '@/services/riskScanConfig/monitorConfigService';
import {
  BasicInfoDS,
  SelectScopeListDS,
  CompanyLovDS,
  BusinessListDS,
  BusinessAddDS,
} from '../stores/schemaConfigDS';
import BasicComp from './BasicComp';
import ScopePanel from './ScopePanel';
import ScanProject from './ScanProject';

import styles from './index.less';

const { Step } = Steps;

function EditDetail(props) {
  const { dispatch, monitorWorkbench = {}, match, history } = props;
  const { monitorConfigDetail = {} } = monitorWorkbench || {};

  const urlId = match?.params?.id ?? ''; // 区分第一步是编辑还是新建 id值/add

  const basicInfoDS = useMemo(() => new DataSet({ ...BasicInfoDS() }), []);
  const selectScopeListDS = useMemo(() => new DataSet({ ...SelectScopeListDS() }), []);
  const companyLovDS = useMemo(() => new DataSet({ ...CompanyLovDS() }), []);
  const businessListDS = useMemo(() => new DataSet({ ...BusinessListDS() }), []);
  const businessAddDS = useMemo(() => new DataSet({ ...BusinessAddDS() }), []);

  const scanProjectRef = useRef(null);

  const selectDS = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'scope',
            type: 'string',
            label: intl.get('sdat.riskScanConfig.view.title.scope').d('适用范围'),
            lookupCode: 'SDAT.WB2_SCAN_SCOPE_TYPE',
            required: true,
          },
        ],
      }),
    []
  );

  const [current, setCurrent] = useState(0);
  const [checkedValues, setCheckedValues] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      basicInfoDS.data = [];
      basicInfoDS.reset();
      dispatch({
        type: 'monitorWorkbench/updateState',
        payload: {
          monitorConfigDetail: {},
        },
      });
    };
  }, []);

  useEffect(() => {
    if (urlId !== 'create') {
      getDetailData(urlId);
    } else {
      basicInfoDS.loadData([
        {
          chargeList: [
            {
              id: getCurrentUser().id,
              realName: getCurrentUser().realName,
              loginName: getCurrentUser().loginName,
            },
          ],
        },
      ]);
    }
  }, [urlId]);

  const getDetailData = async id => {
    setLoading(true);
    const res = await fetchDetailConfig({
      riskPlanId: id,
      planContentType: 'basic',
      planType: 'MONITOR',
    });
    setLoading(false);

    if (getResponse(res)) {
      const { wb2RiskPlanUserList = [] } = res;

      const chargeList = wb2RiskPlanUserList.length
        ? wb2RiskPlanUserList
            .filter(rcd => [0, '0'].includes(rcd.userType))
            .map(item => ({
              ...item,
              id: item.userId,
              realName: item.userName,
              loginName: item.loginName,
            }))
        : [];

      const stakeholderList = wb2RiskPlanUserList.length
        ? wb2RiskPlanUserList
            .filter(rcd => [1, '1'].includes(rcd.userType))
            .map(item => ({
              ...item,
              id: item.userId,
              realName: item.userName,
              loginName: item.loginName,
            }))
        : [];

      const values = [];
      const yearList = [];
      const scanFrequency = [];
      const planNumber = res?.planNumber ?? '';
      basicInfoDS.loadData([
        {
          ...res,
          chargeList,
          stakeholderList,
          scanFrequency,
          yearList,
          planNumber:
            planNumber && planNumber.startsWith('Mon_') ? planNumber.substring(4) : planNumber,
        },
      ]);

      setCheckedValues(values);
      dispatch({
        type: 'monitorWorkbench/updateState',
        payload: {
          monitorConfigDetail: { ...res },
        },
      });

      return res;
    }

    return {};
  };

  const validFormIsChange = () => {
    // 校验基础信息是否发生变更
    const obj = basicInfoDS?.toData()[0] || {};
    const {
      chargeList = [],
      stakeholderList = [],
      scanFrequency = [],
      yearList = [],
      planNumber = '',
      planName = '',
      autoFrequency = '',
    } = obj || {};

    const wb2RiskPlanUserList = [];
    if (chargeList && chargeList.length) {
      // 负责人
      chargeList.forEach(item => {
        wb2RiskPlanUserList.push({
          ...item,
          userId: item.id,
          userType: 0,
          tenantId: getCurrentOrganizationId(),
        });
      });
    }

    if (stakeholderList && stakeholderList.length) {
      // 干系人
      stakeholderList.forEach(item => {
        wb2RiskPlanUserList.push({
          ...item,
          userId: item.id,
          userType: 1,
          tenantId: getCurrentOrganizationId(),
        });
      });
    }

    const planStrategy = checkedValues && checkedValues.length ? checkedValues.join('|') : '';
    const frequencyStr = scanFrequency && scanFrequency.length ? scanFrequency.join('|') : '';
    const yearStr = yearList && yearList.length ? yearList.join('|') : '';

    // let savePlanNumber = '';
    // if (riskPlanId) {
    //   savePlanNumber =
    //     planNumber && planNumber.startsWith('Mon_')
    //       ? planNumber
    //       : planNumber
    //       ? `Mon_${planNumber}`
    //       : '';
    // } else {
    //   savePlanNumber = `Mon_${planNumber}`;
    // }

    const params = {
      planNumber: planNumber && planNumber.startsWith('Mon_') ? planNumber : `Mon_${planNumber}`,
      planName: planName || '',
      planStrategy, // 扫描策略
      autoFrequency: autoFrequency || '',
      frequencyValue: autoFrequency === 'YEAR' ? yearStr : frequencyStr,
    };

    const originDEtail = {
      planNumber: monitorConfigDetail.planNumber,
      planName: monitorConfigDetail.planName,
      planStrategy: monitorConfigDetail.planStrategy, // 扫描策略
      autoFrequency: monitorConfigDetail.autoFrequency,
      frequencyValue: monitorConfigDetail.frequencyValue,
    };

    const oldUserList = monitorConfigDetail?.wb2RiskPlanUserList
      ?.map(item => {
        return {
          userId: item.userId,
          userType: item.userType,
          userName: item.userName,
          planUserId: item.planUserId,
          _token: item._token,
        };
      })
      .sort((a, b) => {
        return String(a.userId).localeCompare(String(b.userId));
      });

    const newUserList = wb2RiskPlanUserList
      ?.map(item => {
        return {
          userId: item.userId,
          userType: item.userType,
          userName: item.userName,
          planUserId: item.planUserId,
          _token: item._token,
        };
      })
      .sort((a, b) => {
        return String(a.userId).localeCompare(String(b.userId));
      });

    // 适用范围
    const newScopeValue = selectDS?.current?.get('scope') ?? '';
    const oldScopeValue = monitorConfigDetail?.scanScopeType ?? '';
    const { wb2RiskPlanScopePage = {} } = monitorConfigDetail || {};
    const { content = [] } = wb2RiskPlanScopePage || {};

    const oldWb2RiskPlanScopeList = (content ?? [])
      ?.map(item => {
        return {
          scopeObjectId: item.scopeObjectId,
          scanScopeType: item.scanScopeType,
          tenantId: item.tenantId,
          socialCode: item.socialCode,
        };
      })
      .sort((a, b) => {
        return a.scopeObjectId - b.scopeObjectId;
      });

    const newWb2RiskPlanScopeList =
      newScopeValue === 'GROUP'
        ? []
        : (selectScopeListDS?.toData() ?? [])
            ?.map(item => {
              return {
                scopeObjectId: item.scopeObjectId,
                scanScopeType: newScopeValue,
                socialCode: item.socialCode,
                tenantId: getCurrentOrganizationId(),
              };
            })
            .sort((a, b) => {
              return a.scopeObjectId - b.scopeObjectId;
            });

    return !(
      newScopeValue &&
      oldScopeValue &&
      _.isEqual(newScopeValue, oldScopeValue) &&
      _.isEqual(oldWb2RiskPlanScopeList, newWb2RiskPlanScopeList) &&
      _.isEqual(params, originDEtail) &&
      _.isEqual(oldUserList, newUserList)
    );
  };

  const handleChangeSteps = async type => {
    if (type === 'next') {
      if (current === 0) {
        const isChange = validFormIsChange('1');

        if (isChange) {
          const res = await handleSaveStepOne();
          if (getResponse(res)) {
            setCurrent(current + 1);
          }
        } else {
          setCurrent(current + 1);
        }
      }
    } else {
      setCurrent(current - 1);
    }
  };

  /**
   * 保存操作
   */
  const handleSave = async () => {
    if (current === 0) {
      // 保存第一步
      const res = await handleSaveStepOne();
      return res;
    }

    if (current === 1) {
      // 保存第二步
      const res = await handleSaveStepTwo();
      return res;
    }
  };

  const handleSaveStepOne = async () => {
    const isValid = await basicInfoDS.validate();

    if (isValid) {
      const obj = basicInfoDS?.toData()[0] || {};
      const {
        chargeList = [],
        stakeholderList = [],
        planNumber = '',
        planName = '',
        _tls = null,
        notifyFlag = '',
        riskPlanId,
      } = obj || {};

      const newChargeList = [];
      const newStakeholderList = [];
      const originUserList = monitorConfigDetail?.wb2RiskPlanUserList ?? []; // 接口返回的原始数据

      if (chargeList && chargeList.length) {
        // 负责人
        chargeList.forEach(item => {
          const filterList = newChargeList.length
            ? newChargeList?.filter(rcd => rcd.userId === item.id && rcd.userType == 0)
            : [];

          if (!filterList.length) {
            newChargeList.push({
              userId: item.id,
              userType: 0,
              tenantId: getCurrentOrganizationId(),
            });
          }
        });
      }

      const originChargeUserList = originUserList.filter(item => item.userType == 0);
      const formatChargeList = formatDeleteOrAdd(originChargeUserList, newChargeList);

      if (stakeholderList && stakeholderList.length) {
        // 干系人
        stakeholderList.forEach(item => {
          const filterList = newStakeholderList.length
            ? newStakeholderList?.filter(rcd => rcd.userId === item.id && rcd.userType == 1)
            : [];
          if (!filterList.length) {
            newStakeholderList.push({
              userId: item.id,
              userType: 1,
              tenantId: getCurrentOrganizationId(),
            });
          }
        });
      }

      const originStakeholderUserList = originUserList.filter(item => item.userType == 1);
      const formatStakeholderList = formatDeleteOrAdd(
        originStakeholderUserList,
        newStakeholderList
      );

      let companyList = [];
      let scopeValue = '';
      // 适用范围
      const isValid2 = await selectDS.validate();

      if (isValid2) {
        scopeValue = selectDS?.current?.get('scope') ?? '';
        if (scopeValue === 'COMPANY') {
          // 公司级
          companyList = (selectScopeListDS?.toData() ?? [])
            // ?.filter((item) => !item.planScopeId)
            .map(item => {
              return {
                scopeObjectId: item.scopeObjectId,
                scanScopeType: scopeValue,
                socialCode: item.socialCode,
                tenantId: getCurrentOrganizationId(),
                planScopeId: item.planScopeId || '',
              };
            });
          if (!companyList.length) {
            notification.error({
              message: intl
                .get('sdat.riskScanConfig.view.message.needCompany')
                .d('公司列表不能为空'),
            });
            return false;
          }
        }
      } else {
        return false;
      }

      const wb2RiskPlanScopeList = [];
      const realList = companyList.length ? companyList.filter(item => !item.planScopeId) : [];
      if (realList && realList.length) {
        realList.forEach(item => {
          wb2RiskPlanScopeList.push({
            scopeObjectId: item.scopeObjectId,
            socialCode: item.socialCode,
            scanScopeType: 'COMPANY',
            tenantId: getCurrentOrganizationId(),
          });
        });
      }

      let savePlanNumber = '';
      if (riskPlanId) {
        savePlanNumber =
          planNumber && planNumber.startsWith('Mon_')
            ? planNumber
            : planNumber
            ? `Mon_${planNumber}`
            : '';
      } else {
        savePlanNumber = `Mon_${planNumber}`;
      }

      const params = {
        planNumber: savePlanNumber,
        planName: planName || '',
        planStrategy: '', // 扫描策略
        autoFrequency: '',
        frequencyValue: '',
        enabledFlag: 0,
        _tls: _tls || {
          planName: {
            en_US: planName,
            ja_JP: planName,
            zh_CN: planName,
            zh_TW: planName,
          },
        },
        notifyFlag,
        wb2RiskPlanUserList: [...formatChargeList, ...formatStakeholderList],
        wb2RiskPlanScopeList,
        tenantId: getCurrentOrganizationId(),
      };

      const res = await fetchSavePlanConfig({
        ...obj,
        ...monitorConfigDetail,
        ...params,
        planContentType: 'basic',
        planType: 'MONITOR',
        scanScopeType: scopeValue,
        code: '',
        message: '',
        autoFlag: '1',
        autoFrequency: 'DAY',
      });
      if (getResponse(res)) {
        history.replace(`/sdat/risk-workbench-new/monitor-plan/detail/${res?.riskPlanId}`);

        dispatch({
          type: 'monitorWorkbench/updateState',
          payload: {
            monitorConfigDetail: { ...res },
          },
        });
        getDetailData(res?.riskPlanId);
        if (res?.scanScopeType === 'COMPANY') {
          selectScopeListDS.setQueryParameter('riskPlanId', res?.riskPlanId);
          selectScopeListDS.setQueryParameter('scanScopeType', res?.scanScopeType);
          selectScopeListDS.setQueryParameter('planContentType', 'basic');
          selectScopeListDS.setQueryParameter('planType', 'SCAN');
          selectScopeListDS.query();
        }
        return res;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const handleSaveStepTwo = async () => {
    if (scanProjectRef && scanProjectRef.current) {
      const { handleSave: saveStep3 } = scanProjectRef.current;
      if (saveStep3) {
        const res = await saveStep3();
        return res;
      }
    }
  };

  const handleCallBackToSave = async () => {
    const res = await handleSaveStepTwo();
    return res;
  };

  const localId = urlId ?? monitorConfigDetail?.riskPlanId ?? '';

  return (
    <Spin spinning={loading}>
      <div>
        <Header
          title={intl
            .get('sdat.riskScanConfig.view.title.createMonitorConfig')
            .d('新建风险监控方案')}
          backPath="/sdat/risk-workbench-new/monitor-plan/list"
        >
          {current < 1 ? (
            <Button
              icon="recover"
              color="primary"
              disabled={loading || fetching}
              onClick={() => handleChangeSteps('next')}
            >
              {intl.get('hzero.common.button.next').d('下一步')}
            </Button>
          ) : null}
          {current >= 1 ? (
            <Button
              icon="save"
              color="primary"
              disabled={loading || fetching}
              onClick={handleSave}
              style={{ border: 'none' }}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ) : (
            <Button
              icon="save"
              funcType="flat"
              disabled={loading || fetching}
              onClick={handleSave}
              style={{ border: 'none' }}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
          {current > 0 ? (
            <Button icon="reply" funcType="flat" onClick={() => handleChangeSteps('previous')}>
              {intl.get('hzero.common.button.previous').d('上一步')}
            </Button>
          ) : null}
        </Header>
        <div
          className={styles['risk-scan-config-edit-detail-basic']}
          style={{
            height: 'calc(100vh - 152px)',
          }}
        >
          <div className={styles['risk-scan-config-edit-detail-steps']}>
            <Steps size="small" current={current}>
              <Step title={intl.get('sdat.riskScanConfig.view.title.basicInfo').d('基础信息')} />
              <Step
                title={intl.get('sdat.riskScanConfig.view.title.monitorProject').d('监控项目')}
              />
            </Steps>
          </div>

          {current === 0 && (
            <>
              <BasicComp basicInfoDS={basicInfoDS} />
              <ScopePanel
                localId={localId}
                dispatch={dispatch}
                monitorWorkbench={monitorWorkbench}
                selectScopeListDS={selectScopeListDS}
                companyLovDS={companyLovDS}
                selectDS={selectDS}
                onFetch={e => setFetching(e)}
                onCallBackToSave={handleCallBackToSave}
              />
            </>
          )}

          {current === 1 && (
            <ScanProject
              ref={scanProjectRef}
              localId={localId}
              dispatch={dispatch}
              monitorWorkbench={monitorWorkbench}
              businessListDS={businessListDS}
              businessAddDS={businessAddDS}
              onFetch={e => setFetching(e)}
            />
          )}
        </div>
      </div>
    </Spin>
  );
}

export default connect(state => state)(
  formatterCollections({
    code: ['sdat.riskScanConfig', 'sdat.common'],
  })(EditDetail)
);
