/* eslint-disable no-param-reassign */
/**
 * 事件定义步骤条
 */
import React, { useState, useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import { Tabs } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { Header } from 'components/Page';

import { getResponse } from '@/utils/utils';
import { getThemeList } from '@/services/riskDefinitionPlatService';

import { ScopeListDS, SupplierListDS, CompanyLovDS, SupplierLovDS } from '../stores/riskDetailDS';
import { AccountListDS } from '../stores/riskDefinitionDS';

import ScopeStep from './ScopeStep';
import ExternalRiskStep from './ExternalRiskStep';
import BusinessRiskStep from './BusinessRiskStep';
import styles from './index.less';

const { TabPane } = Tabs;

let scopeValue = null;
let defineId = null;

const Detail = (props) => {
  const scopeListDS = useMemo(() => new DataSet(ScopeListDS()), []);
  const supplierListDS = useMemo(() => new DataSet(SupplierListDS()), []);
  const companyLovDS = useMemo(() => new DataSet(CompanyLovDS()), []);
  const supplierLovDS = useMemo(() => new DataSet(SupplierLovDS()), []);
  const accountListDS = useMemo(() => new DataSet({ ...AccountListDS() }), []);

  const { match = {}, history } = props;

  defineId = match?.params?.id ?? ''; // 区分第一步是编辑还是新建 id值/add
  const groupCode = match?.params?.groupCode ?? '';
  const tenantId = match?.params?.tenantId ?? '';

  const [themeList, setThemeList] = useState([]);
  const [themeMap, setThemeMap] = useState({});
  const [activeKey, setActiveKey] = useState('1');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    getThemeList({
      tenantId,
    }).then((res) => {
      if (getResponse(res) && res.length) {
        const themeObj = {};
        const data = res.map((item) => item.themeCode);
        res.forEach((item) => {
          themeObj[item.themeCode] = item.themeName;
        });
        setThemeList(data || []);
        setThemeMap(themeObj);
      }
    });

    return () => {
      scopeValue = null;
      defineId = null;
    };
  }, [tenantId]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleChangeScope = (value) => {
    scopeValue = value;
  };

  const handleChangeTab = (key) => {
    setActiveKey(key);
    setRefresh(true);
  };

  const title = intl
    .get('sdat.riskDefinition.view.title.riskDefinitionDetailInfo')
    .d('风险定义详情');

  return (
    <div className={styles['risk-definition-detail-content']}>
      <Header title={title} backPath="/sdat/event-update-summary/list?activeTab=2" />
      <div className={styles['risk-definition-basic']}>
        <div
          style={{
            borderRight: '1px solid rgba(229,231,236,1)',
            padding: '20px 0 20px 20px',
            // width: '124px',
            flex: 1,
          }}
        >
          <Tabs activeKey={activeKey} tabPosition="left" onChange={handleChangeTab}>
            <TabPane
              tab={intl.get(`sdat.riskDefinition.model.applicationScope`).d('适用范围')}
              key="1"
            />
            {themeList.indexOf('externalRisk') !== -1 && (
              <TabPane tab={themeMap.externalRisk} key="2" />
            )}
            {themeList.indexOf('disasterRisk') !== -1 && (
              <TabPane tab={themeMap.disasterRisk} key="3" />
            )}
            {themeList.indexOf('businessRisk') !== -1 && (
              <TabPane tab={themeMap.businessRisk} key="4" />
            )}
          </Tabs>
        </div>

        <div style={{ marginLeft: '1px', padding: '16px', flex: 13 }}>
          {activeKey === '1' && (
            <ScopeStep
              key="applicationScope"
              onChangeScope={handleChangeScope}
              scopeListDS={scopeListDS}
              supplierListDS={supplierListDS}
              companyLovDS={companyLovDS}
              supplierLovDS={supplierLovDS}
              defineId={defineId}
              tenantId={tenantId}
              groupCode={groupCode}
            />
          )}
          {activeKey === '2' && (
            <ExternalRiskStep
              key="externalRisk"
              defineId={defineId}
              scope={scopeValue}
              history={history}
              accountListDS={accountListDS}
              tenantId={tenantId}
              riskFlag="externalRisk"
              groupCode={groupCode}
            />
          )}
          {activeKey === '3' && (
            <ExternalRiskStep
              key="disasterRisk"
              defineId={defineId}
              scope={scopeValue}
              history={history}
              accountListDS={accountListDS}
              tenantId={tenantId}
              riskFlag="disasterRisk"
              groupCode={groupCode}
            />
          )}
          {activeKey === '4' && (
            <BusinessRiskStep
              key="businessRisk"
              history={history}
              defineId={defineId}
              scope={scopeValue}
              tenantId={tenantId}
              accountListDS={accountListDS}
              groupCode={groupCode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default connect((state) => state)(
  formatterCollections({
    code: ['sdat.riskDefinition'],
  })(Detail)
);
