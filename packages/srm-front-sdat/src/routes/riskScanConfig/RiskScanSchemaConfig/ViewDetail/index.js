/* eslint-disable eqeqeq */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header } from 'components/Page';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { fetchDetailConfig } from '@/services/riskScanConfig/schemaConfigService';
import {
  BasicInfoDS,
  ScanSchemeDS,
  AccountListDS,
  HandListDS,
  SelectHandListDS,
  SelectScopeListDS,
  TypeSupplierListDS,
} from '../stores/schemaConfigDS';
import BasicComp from './BasicComp';
import ScanObject from './ScanObject';
// import ScopePanel from './ScopePanel';
import ScanProject from './ScanProject';

import styles from './index.less';

const { TabPane } = Tabs;

function EditDetail(props) {
  const { dispatch, match, scanWorkbench = {}, remote } = props;

  const { scanConfigDetail = {} } = scanWorkbench || {};

  const localId = match?.params?.id ?? ''; // 区分第一步是编辑还是新建 id值/add

  const basicInfoDS = useMemo(() => new DataSet({ ...BasicInfoDS() }), []);
  const scanSchemeDS = useMemo(() => new DataSet({ ...ScanSchemeDS() }), []);
  const accountListDS = useMemo(() => new DataSet({ ...AccountListDS(), selection: false }), []);
  const handListDS = useMemo(() => new DataSet({ ...HandListDS(), selection: false }), []);
  const categoryListDS = useMemo(() => new DataSet({ ...HandListDS(), selection: false }), []);
  const coopSupplierListDS = useMemo(() => new DataSet({ ...HandListDS(), selection: false }), []);
  const outerListDS = useMemo(() => new DataSet({ ...HandListDS(), selection: false }), []);
  const selectHandListDS = useMemo(
    () =>
      new DataSet(
        remote.process(
          'RISKSCAN_SCHEMA_CONFIG_PROCESS_CODE_SELECTED_HAND_LIST_DS',
          { ...SelectHandListDS(), selection: false },
          {}
        )
      ),
    []
  );
  const selectScopeListDS = useMemo(
    () => new DataSet({ ...SelectScopeListDS(), selection: false }),
    []
  );
  const typeSupplierListDS = useMemo(
    () => new DataSet({ ...TypeSupplierListDS(), selection: false }),
    []
  );

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
  const [autoType, setAutoType] = useState('');
  const [scanType, setScanType] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectType, setSelectType] = useState('');

  useEffect(() => {
    if (localId) {
      getDetailData(localId);
    }
    return () => {
      basicInfoDS.data = [];
      basicInfoDS.reset();
      dispatch({
        type: 'scanWorkbench/updateState',
        payload: {
          scanConfigDetail: {},
        },
      });
    };
  }, [localId]);

  const getDetailData = async (id) => {
    setLoading(true);
    const res = await fetchDetailConfig({
      riskPlanId: id,
      planContentType: 'basic',
      planType: 'SCAN',
    });
    setLoading(false);

    if (getResponse(res)) {
      const {
        wb2RiskPlanUserList = [],
        autoFlag,
        autoFrequency,
        frequencyValue,
        scanObjectType,
        scanScopeType,
      } = res;

      if (scanScopeType === 'COMPANY') {
        selectScopeListDS.setQueryParameter('riskPlanId', id);
        selectScopeListDS.setQueryParameter('scanScopeType', scanScopeType);
        selectScopeListDS.setQueryParameter('planContentType', 'basic');
        selectScopeListDS.setQueryParameter('planType', 'SCAN');
        selectScopeListDS.query();
      }

      const chargeList = wb2RiskPlanUserList.length
        ? wb2RiskPlanUserList
            .filter((rcd) => [0, '0'].includes(rcd.userType))
            .map((item) => ({
              ...item,
              id: item.userId,
              realName: item.userName,
              loginName: item.loginName,
            }))
        : [];

      const stakeholderList = wb2RiskPlanUserList.length
        ? wb2RiskPlanUserList
            .filter((rcd) => [1, '1'].includes(rcd.userType))
            .map((item) => ({
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

      selectDS.loadData([
        {
          scope: scanScopeType,
        },
      ]);

      setScanType(autoFrequency);
      setAutoType(autoFlag);
      setSelectType(scanObjectType);
      dispatch({
        type: 'scanWorkbench/updateState',
        payload: {
          scanConfigDetail: { ...res },
        },
      });

      return res;
    }

    return {};
  };

  const handleSelectAutoType = (type) => {
    setAutoType(type);
  };

  const handleSelectScanType = (type) => {
    setScanType(type);
  };

  const handleChangeStep = (num) => {
    setCurrent(num);
  };

  const { autoFlag } = scanConfigDetail || {};

  return (
    <Spin spinning={loading}>
      <Header
        title={intl.get('sdat.riskScanConfig.view.title.viewConfig').d('查看风险扫描方案')}
        backPath="/sdat/risk-workbench-new/scheme-config/list"
      />

      <div style={{ display: 'flex' }}>
        <div
          className={styles['risk-scan-config-edit-detail-tabpanel']}
          style={{
            borderRight: '1px solid rgba(229,231,236,1)',
            padding: '20px 0 0 0',
            margin: '8px 0 8px 8px',
            background: '#fff',
            height: 'calc(100vh - 148px)',
          }}
        >
          <Tabs activeKey={current} tabPosition="left" onChange={handleChangeStep}>
            <TabPane
              tab={intl.get(`sdat.riskScanConfig.view.title.basicInfo`).d('基础信息')}
              key="0"
            />
            {[0, '0'].includes(autoType) ? null : (
              <TabPane
                tab={intl.get('sdat.riskScanConfig.view.title.scanObject').d('扫描对象')}
                key="1"
              />
            )}
            <TabPane
              tab={intl.get('sdat.riskScanConfig.view.title.scanProject').d('扫描项目')}
              key="2"
            />
          </Tabs>
        </div>

        <div
          className={styles['risk-scan-config-edit-detail-basic']}
          style={{
            height:
              current === 2
                ? [1, '1'].includes(autoFlag)
                  ? 'calc(100vh - 276px)'
                  : 'calc(100vh - 282px)'
                : 'calc(100vh - 140px)',
          }}
        >
          {current === '0' && (
            <BasicComp
              remote={remote}
              defaultAutoType={autoType}
              defaultScanType={scanType}
              basicInfoDS={basicInfoDS}
              selectDS={selectDS}
              scanScopeType={scanConfigDetail?.scanScopeType}
              selectScopeListDS={selectScopeListDS}
              onSelectType={handleSelectAutoType}
              onSelectScanType={handleSelectScanType}
            />
          )}

          {current === '1' && (
            <>
              {[0, '0'].includes(autoType) ? null : (
                <ScanObject
                  localId={localId}
                  remote={remote}
                  dispatch={dispatch}
                  scanWorkbench={scanWorkbench}
                  scanSchemeDS={scanSchemeDS}
                  handListDS={handListDS}
                  categoryListDS={categoryListDS}
                  coopSupplierListDS={coopSupplierListDS}
                  outerListDS={outerListDS}
                  selectHandListDS={selectHandListDS}
                  accountListDS={accountListDS}
                  typeSupplierListDS={typeSupplierListDS}
                  selectType={selectType}
                  setSelectType={setSelectType}
                />
              )}
            </>
          )}

          {current === '2' ? (
            <ScanProject
              ref={scanProjectRef}
              remote={remote}
              localId={localId}
              dispatch={dispatch}
              scanWorkbench={scanWorkbench}
            />
          ) : null}
        </div>
      </div>
    </Spin>
  );
}

export default connect((state) => state)(
  cuxRemote({
    code: 'SDAT_RISK_WORKPLACE_RISKSCAN_SCHEMA_CONFIG',
    name: 'remote',
  })(
    formatterCollections({
      code: ['sdat.riskScanConfig', 'sdat.common'],
    })(EditDetail)
  )
);
