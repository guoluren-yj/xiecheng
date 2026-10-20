import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Form, Output, Table } from 'choerodon-ui/pro';
// import { Alert } from 'choerodon-ui';

import MonthDayPicker from './MonthDayPicker';
import styles from './index.less';

export default function BasicComp(props) {
  const {
    // remote,
    selectScopeListDS,
    selectDS,
    scanScopeType,
    pageType,
    defaultAutoType,
    defaultScanType,
    basicInfoDS,
    onSelectPolicy = () => {},
    onSelectType = () => {},
    onSelectScanType = () => {},
  } = props;

  const [scanType, setScanType] = useState();
  const [autoType, setAutoType] = useState('');

  useEffect(() => {
    setAutoType(defaultAutoType);
    if ([0, '0'].includes(autoType)) {
      handleSelectPolicy('EVENT', false);
    }
  }, [defaultAutoType]);

  useEffect(() => {
    setScanType(defaultScanType);
  }, [defaultScanType]);

  const handleSelectPolicy = (a, b) => {
    if (onSelectPolicy && typeof onSelectPolicy === 'function') {
      onSelectPolicy(a, b);
    }
  };

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
  // if (basicInfoDS && basicInfoDS.current) {
  //   cacheTimeValue = basicInfoDS.current.get('cacheTimeValue') || 0;
  // }

  const columns = () => {
    return [{ name: 'companyNum' }, { name: 'companyName' }, { name: 'socialCode' }];
  };

  return (
    <>
      <div className={styles['risk-scan-config-edit-detail-basic-info']}>
        <div className={styles['risk-scan-config-edit-card-title']}>
          {intl.get('sdat.riskScanConfig.view.title.basicInfo').d('基础信息')}
        </div>
        <div style={{ marginTop: '16px' }}>
          <Form dataSet={basicInfoDS} columns={3} labelLayout="float">
            <Output name="planNumber" disabled />
            <Output name="planName" />
            <Output name="scanPlanType" />
            <Output name="chargeList" />
            <Output name="stakeholderList" />
            <Output name="notifyFlag" />
          </Form>
        </div>
      </div>

      <div
        className={styles['risk-scan-config-edit-detail-frequency-config']}
        // style={{ flex: '1' }}
      >
        <div className={styles['risk-scan-config-edit-card-title']}>
          {intl.get('sdat.riskScanConfig.view.title.frequencyConfig').d('频率配置')}
        </div>
        <div style={{ marginTop: '16px' }}>
          {/* <Alert
            message={intl.get('sdat.riskScanConfig.view.alert.cacheDays', {
              sum: cacheTimeValue,
            })}
            type="info"
            banner
            showIcon
            iconType="help"
            style={{ marginBottom: '16px', color: '#0161D5' }}
          /> */}
          <Form dataSet={basicInfoDS} columns={3} labelLayout="float">
            <Output
              name="autoFlag"
              onChange={handleChangeAutoType}
              disabled={pageType === 'view'}
            />
            {[1, '1'].includes(autoType) ? (
              <Output
                name="autoFrequency"
                onChange={handleChangeType}
                disabled={pageType === 'view'}
              />
            ) : null}
            {['WEEK', 'MONTH'].includes(scanType) ? (
              <Output
                name="scanFrequency"
                maxTagCount={3} // 多值标签最大数量
                maxTagTextLength={6} // 多值标签文案最大长度
                maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
                disabled={pageType === 'view'}
              />
            ) : null}

            {scanType === 'YEAR' ? (
              <Output
                name="yearList"
                disabled={pageType === 'view'}
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

        <Form dataSet={selectDS} columns={3} labelLayout="float">
          <Output name="scope" />
        </Form>

        {scanScopeType === 'COMPANY' ? (
          <div style={{ height: 'calc(100vh - 630px)', marginTop: '16px' }}>
            <Table
              queryBar="none"
              dataSet={selectScopeListDS}
              columns={columns()}
              autoHeight={{ type: 'maxHeight', diff: 40 }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
