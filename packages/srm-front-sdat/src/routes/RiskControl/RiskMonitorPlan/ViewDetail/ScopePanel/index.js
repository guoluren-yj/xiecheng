/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import { getResponse } from 'utils/utils';
import { Form, Table, Output } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';

import styles from './index.less';

export default function ScopePanel({
  selectScopeListDS,
  selectDS,
  monitorWorkbench,
  localId,
  dispatch,
  onFetch = () => {},
}) {
  const { monitorConfigDetail = {} } = monitorWorkbench || {};

  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    return () => {
      selectScopeListDS.removeEventListener('select', selectEvent);
      selectScopeListDS.removeEventListener('unSelect', selectEvent);
      selectScopeListDS.removeEventListener('selectAll', selectEvent);
      selectScopeListDS.removeEventListener('unSelectAll', selectEvent);
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (selectScopeListDS) {
      selectScopeListDS.addEventListener('select', selectEvent);
      selectScopeListDS.addEventListener('unSelect', selectEvent);
      selectScopeListDS.addEventListener('selectAll', selectEvent);
      selectScopeListDS.addEventListener('unSelectAll', selectEvent);
    }
    if (localId) {
      getDetailData(localId);
    }
  }, [localId]);

  const selectEvent = () => {
    setRefresh(true);
  };

  const getDetailData = async id => {
    const { scanScopeType: scopeType } = monitorConfigDetail;
    selectScopeListDS.setQueryParameter('riskPlanId', id);
    selectScopeListDS.setQueryParameter('scanScopeType', scopeType);
    selectScopeListDS.setQueryParameter('planContentType', 'basic');
    selectScopeListDS.setQueryParameter('planType', 'MONITOR');

    setLoading(true);
    onFetch(true);
    const res = await selectScopeListDS.query();
    onFetch(false);
    setLoading(false);

    if (getResponse(res)) {
      const { originData = {} } = res;
      const { scanScopeType = '' } = originData || {};

      selectDS.loadData([
        {
          scope: scanScopeType,
        },
      ]);

      setScope(scanScopeType);
      dispatch({
        type: 'monitorWorkbench/updateState',
        payload: {
          monitorConfigDetail: { ...monitorConfigDetail, ...originData },
        },
      });
    }
  };

  const columns = () => {
    return [{ name: 'companyNum' }, { name: 'companyName' }, { name: 'socialCode' }];
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['scan-config-scope-basic']}>
        <Form dataSet={selectDS} columns={3} labelLayout="float">
          <Output name="scope" />
        </Form>
        {scope === 'COMPANY' ? (
          <div style={{ height: 'calc(100vh - 530px)', marginTop: '16px' }}>
            <Table
              queryBar="none"
              dataSet={selectScopeListDS}
              columns={columns()}
              autoHeight={{ type: 'maxHeight', diff: 40 }}
            />
          </div>
        ) : null}
      </div>
    </Spin>
  );
}
