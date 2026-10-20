/*
 * InvestigaInfo - 调查表信息
 * @Date: 2023-08-16 13:55:38
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { map } from 'lodash';
import { Tabs, DataSet } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import React, { useState, useEffect, createElement } from 'react';

import intl from 'utils/intl';

import { useSetState } from '@/routes/components/utils';
import { questionnaireForm } from '@/routes/components/Investigation/utils';
import ComposeForm from '@/routes/components/Investigation/Compose/ComposeForm';
import ComposeTable from '@/routes/components/Investigation/Compose/ComposeTable';
import { getInvestigationDS } from '@/routes/components/Investigation/stores/getInvestigationDS';

const { TabPane } = Tabs;

const InvestigaInfo = ({
  tenantId,
  firstActiveKey,
  configList,
  supplierBasicId,
  tableMaxHeight,
}) => {
  const [loadTab, setLoadTab] = useState({});
  const [activeKey, setActiveKey] = useState(null);
  const [state, setState] = useSetState({
    dsList: {}, // ds集合
    investgHeaderIds: {}, // 调查表头id
  });
  const { dsList, investgHeaderIds } = state;

  const handleTabsChange = key => {
    setActiveKey(key);
    if (!loadTab[key]) {
      handleQuery(key);
    }
  };

  useEffect(() => {
    handleDataSet();
  }, [configList]);

  useEffect(() => {
    handleQuery(firstActiveKey);
  }, [supplierBasicId, dsList]);

  // 查询调查表数据
  const handleQuery = key => {
    const dataSet = dsList[key];
    if (dataSet) {
      dataSet.setQueryParameter('queryParam', {
        tenantId,
        supplierBasicId,
        investgHeaderId: investgHeaderIds[key],
      });
      dataSet.query().then(res => {
        if (res) {
          setLoadTab(prevState => ({ ...prevState, [key]: true }));
        }
      });
    }
  };

  // 生成ds
  const handleDataSet = () => {
    const ds = {};
    const headerIds = {};
    map(configList, config => {
      ds[config.configName] = new DataSet(getInvestigationDS({ config, type: '360QUERY' }));
      headerIds[config.configName] = config.investgHeaderId;
    });
    setState({
      dsList: ds,
      investgHeaderIds: headerIds,
    });
  };

  const renderTabPane = () => {
    return map(configList, config => {
      const { configName, configDescription, lines } = config;
      const componentProps = {
        configName,
        columns: lines,
        editable: false,
        dataSet: dsList[configName],
        tableStyle: { maxHeight: tableMaxHeight },
      };
      const ComponentType = questionnaireForm[configName] ? ComposeForm : ComposeTable;
      return (
        <TabPane key={configName} tab={configDescription}>
          {componentProps.dataSet &&
            createElement(ComponentType, Object.assign({}, componentProps))}
        </TabPane>
      );
    });
  };

  return (
    <div className="supplier-detail-content">
      <Card
        bordered={false}
        title={
          <div>
            <div>{intl.get('sslm.supplierDetail.view.title.supplementaryInfo').d('补充信息')}</div>
            <div className="section-title-help">
              {intl
                .get('sslm.supplierDetail.view.title.supplementaryInfoMsg')
                .d('通过调查表补充收集的供应商主数据信息')}
            </div>
          </div>
        }
      >
        <Tabs
          tabPosition="left"
          activeKey={activeKey || firstActiveKey}
          onChange={handleTabsChange}
        >
          {renderTabPane()}
        </Tabs>
      </Card>
    </div>
  );
};

export default InvestigaInfo;
