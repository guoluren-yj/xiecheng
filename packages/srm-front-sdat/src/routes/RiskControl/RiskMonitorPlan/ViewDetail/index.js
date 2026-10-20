/* eslint-disable eqeqeq */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header } from 'components/Page';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { fetchDetailConfig } from '@/services/riskScanConfig/monitorConfigService';
import {
  BasicInfoDS,
  SelectScopeListDS,
  CompanyLovDS,
  BusinessListDS,
} from '../stores/schemaConfigDS';
import BasicComp from './BasicComp';

import ScanProject from './ScanProject';

import styles from './index.less';

const { TabPane } = Tabs;

function EditDetail(props) {
  const { dispatch, match, monitorWorkbench = {} } = props;

  const localId = match?.params?.id ?? ''; // 区分第一步是编辑还是新建 id值/add

  const basicInfoDS = useMemo(() => new DataSet({ ...BasicInfoDS() }), []);
  const businessListDS = useMemo(() => new DataSet({ ...BusinessListDS(), selection: false }), []);

  const selectScopeListDS = useMemo(
    () => new DataSet({ ...SelectScopeListDS(), selection: false }),
    []
  );
  const companyLovDS = useMemo(() => new DataSet({ ...CompanyLovDS(), selection: false }), []);

  const scanProjectRef = useRef(null);

  const selectDS = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        forceValidate: true,
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

  const [current, setCurrent] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localId) {
      getDetailData(localId);
    }
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
  }, [localId]);

  const getDetailData = async id => {
    setLoading(true);
    const res = await fetchDetailConfig({
      riskPlanId: id,
      planContentType: 'basic',
      planType: 'MONITOR',
    });
    setLoading(false);

    if (getResponse(res)) {
      const { wb2RiskPlanUserList = [], autoFrequency, frequencyValue } = res;

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

      const yearList = autoFrequency === 'YEAR' ? frequencyValue?.split('|') : [];
      const scanFrequency = autoFrequency !== 'YEAR' ? frequencyValue?.split('|') : [];
      basicInfoDS.loadData([
        {
          ...res,
          chargeList,
          stakeholderList,
          scanFrequency,
          yearList,
        },
      ]);

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

  const handleChangeStep = num => {
    setCurrent(num);
  };

  return (
    <Spin spinning={loading}>
      <Header
        title={intl.get('sdat.riskScanConfig.view.title.viewMonitorConfig').d('查看风险监控方案')}
        backPath="/sdat/risk-workbench-new/monitor-plan/list"
      />

      <div style={{ display: 'flex' }}>
        <div
          className={styles['risk-scan-config-edit-detail-tabpanel']}
          style={{
            borderRight: '1px solid rgba(229,231,236,1)',
            padding: '20px 0 0 0',
            margin: '8px 0 8px 8px',
            background: '#fff',
            height: 'calc(100vh - 152px)',
          }}
        >
          <Tabs activeKey={current} tabPosition="left" onChange={handleChangeStep}>
            <TabPane
              tab={intl.get(`sdat.riskScanConfig.view.title.basicInfo`).d('基础信息')}
              key="0"
            />
            {/* <TabPane tab={intl.get('sdat.riskScanConfig.view.title.scope').d('适用范围')} key="1" /> */}
            <TabPane
              tab={intl.get('sdat.riskScanConfig.view.title.monitorProject').d('监控项目')}
              key="2"
            />
          </Tabs>
        </div>

        <div
          className={styles['risk-scan-config-edit-detail-basic']}
          style={{
            height: current === '2' ? 'calc(100vh - 144px)' : 'calc(100vh - 144px)',
            flex: 1,
          }}
        >
          {current === '0' && (
            <>
              <BasicComp
                basicInfoDS={basicInfoDS}
                localId={localId}
                dispatch={dispatch}
                monitorWorkbench={monitorWorkbench}
                selectScopeListDS={selectScopeListDS}
                companyLovDS={companyLovDS}
                selectDS={selectDS}
              />
            </>
          )}

          {/* {current === '1' && (
            <ScopePanel
              localId={localId}
              dispatch={dispatch}
              monitorWorkbench={monitorWorkbench}
              selectScopeListDS={selectScopeListDS}
              companyLovDS={companyLovDS}
              selectDS={selectDS}
            />
          )} */}

          {current === '2' && (
            <ScanProject
              ref={scanProjectRef}
              localId={localId}
              dispatch={dispatch}
              monitorWorkbench={monitorWorkbench}
              businessListDS={businessListDS}
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
