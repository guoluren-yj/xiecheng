import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Form, TextField, Lov, Select, IntlField } from 'choerodon-ui/pro';
// import { Alert } from 'choerodon-ui';

import MonthDayPicker from './MonthDayPicker';
import ScopePanel from './ScopePanel';
import styles from './index.less';

export default function BasicComp(props) {
  const {
    localId,
    remote,
    dispatch,
    scanWorkbench,
    selectScopeListDS,
    companyLovDS,
    selectDS,
    defaultAutoType,
    defaultScanType,
    basicInfoDS,
    onFetch = () => {},
    onCallBackToSave = () => {},
    onSelectPolicy = () => {},
    onSelectType = () => {},
    onSelectScanType = () => {},
  } = props;

  const [scanType, setScanType] = useState();
  const [autoType, setAutoType] = useState('');

  useEffect(() => {
    setAutoType(defaultAutoType);
  }, [defaultAutoType]);

  useEffect(() => {
    setScanType(defaultScanType);
  }, [defaultScanType]);

  const handleChangeType = (value) => {
    if (basicInfoDS && basicInfoDS.current) {
      basicInfoDS.current.set('scanFrequency', '');
      basicInfoDS.current.set('yearList', []);
    }
    setScanType(value);
    if (onSelectScanType && typeof onSelectScanType === 'function') {
      onSelectScanType(value);
    }
  };

  const handleChangeAutoType = (value) => {
    if (basicInfoDS && basicInfoDS.current) {
      basicInfoDS.current.set('scanFrequency', '');
      basicInfoDS.current.set('autoFrequency', '');
      basicInfoDS.current.set('yearList', []);
    }
    setAutoType(value);
    setScanType('');
    if ([0, '0'].includes(value)) {
      onSelectPolicy('EVENT', false);
    }
    if (onSelectType && typeof onSelectType === 'function') {
      onSelectType(value);
    }
  };

  const handleSelectDates = (list = []) => {
    if (basicInfoDS && basicInfoDS.current) {
      basicInfoDS.current.set('yearList', list);
    }
  };

  /**
   * 年下拉选项
   */
  const renderPopContent = () => {
    return (
      <div>
        <MonthDayPicker defaultSelected={[]} onSelect={handleSelectDates} />
      </div>
    );
  };

  // let cacheTimeValue = 0;
  let riskPlanId = '';
  if (basicInfoDS && basicInfoDS.current) {
    // cacheTimeValue = basicInfoDS.current.get('cacheTimeValue') || 0;
    riskPlanId = basicInfoDS.current.get('riskPlanId') || '';
  }

  return (
    <>
      <div className={styles['risk-scan-config-edit-detail-basic-info']}>
        <div className={styles['risk-scan-config-edit-card-title']}>
          {intl.get('sdat.riskScanConfig.view.title.basicInfo').d('基础信息')}
        </div>
        <div style={{ marginTop: '16px' }}>
          <Form dataSet={basicInfoDS} columns={3} labelLayout="float">
            <TextField name="planNumber" disabled={riskPlanId} addonBefore="Scan_" />
            <IntlField name="planName" />
            <Select name="planCompanyType" disabled={riskPlanId} />
            <Lov name="chargeList" />
            <Lov name="stakeholderList" />
            <Select name="notifyFlag" />
          </Form>
        </div>
      </div>

      <div
        className={styles['risk-scan-config-edit-detail-frequency-config']}
        // style={{ flex: [0, '0'].includes(autoType) ? '1 1 0' : '1 1 100%' }}
      >
        <div className={styles['risk-scan-config-edit-card-title']}>
          {intl.get('sdat.riskScanConfig.view.title.frequencyConfig').d('频率配置')}
        </div>
        <div style={{ marginTop: '16px' }}>
          {/* {riskPlanId ? (
            <Alert
              message={intl.get('sdat.riskScanConfig.view.alert.cacheDays', {
                sum: cacheTimeValue,
              })}
              type="info"
              banner
              showIcon
              iconType="help"
              style={{ marginBottom: '16px', color: '#0161D5' }}
            />
          ) : null} */}

          <Form dataSet={basicInfoDS} columns={3} labelLayout="float">
            <Select name="autoFlag" onChange={handleChangeAutoType} />
            {[1, '1'].includes(autoType) ? (
              <Select name="autoFrequency" onChange={handleChangeType} />
            ) : null}
            {['WEEK', 'MONTH'].includes(scanType) ? (
              <Select
                name="scanFrequency"
                maxTagCount={3} // 多值标签最大数量
                maxTagTextLength={6} // 多值标签文案最大长度
                maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
              />
            ) : null}

            {scanType === 'YEAR' ? (
              <Select
                name="yearList"
                maxTagCount={3} // 多值标签最大数量
                maxTagTextLength={8} // 多值标签文案最大长度
                maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
                popupContent={renderPopContent}
              />
            ) : null}
          </Form>
        </div>
      </div>

      <div className={styles['risk-scan-config-edit-detail-policy-config']}>
        <div className={styles['risk-scan-config-edit-card-title']}>
          {intl.get('sdat.riskScanConfig.view.title.scope').d('适用范围')}
        </div>

        <ScopePanel
          localId={localId}
          remote={remote}
          dispatch={dispatch}
          scanWorkbench={scanWorkbench}
          selectScopeListDS={selectScopeListDS}
          companyLovDS={companyLovDS}
          selectDS={selectDS}
          onFetch={onFetch}
          onCallBackToSave={onCallBackToSave}
        />
      </div>
    </>
  );
}
