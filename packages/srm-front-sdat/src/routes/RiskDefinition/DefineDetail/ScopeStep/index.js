/**
 * 使用范围步骤
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { queryIdpValue } from 'services/api';
import { Table, Spin } from 'choerodon-ui/pro';

import { getResponse } from '@/utils/utils';
import { fetchScopeDetail } from '@/services/riskDefinitionService';

import styles from './index.less';

export default function ScopeStep(props) {
  const {
    scopeListDS,
    supplierListDS,
    defineId,
    groupCode,
    tenantId,
    onChangeScope = () => {},
  } = props;

  const [levelStr, setLevel] = useState('0');
  const [defineNameStr, setDefineNameStr] = useState('');
  const [enableFlag, setEnabledFlag] = useState('');
  const [scopeMap, setScopeMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    queryIdpValue('SDAT.RISK_DEFINITION_SCOPE').then(res => {
      if (getResponse(res) && res.length) {
        const obj = {};
        res.forEach(item => {
          obj[item.value] = item.meaning;
        });
        setScopeMap(obj);
      }
    });

    if (defineId && defineId !== 'add') {
      setLoading(true);
      fetchScopeDetail({ tenantId, defineId, groupCode }).then(res => {
        setLoading(false);
        if (getResponse(res)) {
          setLevel(res?.scope ?? '0');
          onChangeScope(res?.scope ?? '0');
          setDefineNameStr(res?.defineName ?? '');
          setEnabledFlag(String(res?.enableFlag ?? ''));
          const lineList = res.lineList && res.lineList.length ? res.lineList : [];
          const scopeVal = res?.scope ?? '0';
          if (lineList.length) {
            if ([1, '1'].includes(scopeVal)) {
              scopeListDS.data = [...lineList];
            } else if ([2, '2'].includes(scopeVal)) {
              supplierListDS.data = [...lineList];
            }
          }
        }
      });
    }

    return () => {
      scopeListDS.data = [];
      supplierListDS.data = [];
      scopeListDS.reset();
      supplierListDS.reset();
    };
  }, []);

  const columns = () => {
    return [
      {
        name: 'companyCode',
        width: 300,
      },
      {
        name: 'companyName',
      },
    ];
  };

  const supplierColumns = () => {
    return [
      {
        name: 'companyCode',
        width: 300,
      },
      {
        name: 'categoryDescription',
      },
    ];
  };

  return (
    <div className={styles['scope-step-basic']}>
      <Spin spinning={loading}>
        <div style={{ fontSize: '16px', fontWeight: '500', color: '#1D2129' }}>
          {intl.get(`sdat.riskDefinition.model.applicationScope`).d('基础信息')}
        </div>

        <div style={{ marginTop: '8px' }}>
          <span style={{ color: '#868D9C', lineHeight: '18px', fontWeight: '500' }}>
            {intl.get(`sdat.riskDefinition.model.defineName`).d('风险定义标题')}
          </span>
          :&nbsp;&nbsp;
          <span style={{ color: '#1D2129', lineHeight: '18px' }}>{defineNameStr}</span>
        </div>

        <div style={{ marginTop: '8px' }}>
          <span style={{ color: '#868D9C', lineHeight: '18px', fontWeight: '500' }}>
            {intl.get(`sdat.riskDefinition.model.applicationScope`).d('适用范围')}
          </span>
          :&nbsp;&nbsp;
          <span style={{ color: '#1D2129', lineHeight: '18px' }}>{scopeMap[levelStr]}</span>
        </div>

        {['1', 1].includes(levelStr) ? (
          <div style={{ marginTop: '16px', height: 'calc(100vh - 338px)' }}>
            <Table
              dataSet={scopeListDS}
              columns={columns()}
              queryBar="none"
              showRemovedRow={false}
              selectionMode={[1, '1'].includes(enableFlag) ? 'none' : 'rowbox'}
              autoHeight={{ type: 'maxHeight', diff: 20 }}
              customizable
              customizedCode="SDAT.RISK_DEFINITION_SCOPE_COMPANY_LIST"
            />
          </div>
        ) : null}

        {['2', 2].includes(levelStr) ? (
          <div style={{ marginTop: '16px', height: 'calc(100vh - 338px)' }}>
            <Table
              dataSet={supplierListDS}
              columns={supplierColumns()}
              queryBar="none"
              showRemovedRow={false}
              selectionMode={[1, '1'].includes(enableFlag) ? 'none' : 'rowbox'}
              autoHeight={{ type: 'maxHeight', diff: 20 }}
              customizable
              customizedCode="SDAT.RISK_DEFINITION_SCOPE_SUPPLIER_LIST"
            />
          </div>
        ) : null}
      </Spin>
    </div>
  );
}
