/*
 * @Date: 2023-04-06 09:34:55
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Tabs, Badge } from 'choerodon-ui';
import { keys, isArray, forEach, isObject, isFunction } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import React, { useCallback, useState, useEffect } from 'react';

import inlt from 'utils/intl';
import { getResponse } from 'utils/utils';

import { handleCompareRender, useSetState } from '@/routes/components/utils';
import { fetchSupplierBasicInfo } from '@/services/supplierInformCompareService';
import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';

import styles from '../styles.less';
import { getPanelList, dataSetFunc, fieldAssociation } from './utils';

const { TabPane } = Tabs;
const tableMaxHeight = { maxHeight: 'calc(100vh - 400px)' };

const Index = ({
  isEdit,
  changeReqId,
  setLoading,
  headerInfo,
  relTableList,
  custLoading,
  customizeForm,
  customizeTable,
  customizeTabPane,
  investigationTab,
}) => {
  const {
    companyId,
    countryCode,
    configNames = [],
    hideConfigNames = [],
    isSubdomainsRegister,
    domesticForeignRelation,
  } = headerInfo;

  const [activeKey, setActiveKey] = useState('comBasicReq');
  const [state, setState] = useSetState({
    loadTab: {},
    currentDataSetList: {}, // 当前版本ds
    historyDataSetList: {}, // 历史版本ds
  });
  const { loadTab, currentDataSetList, historyDataSetList } = state;

  const handleQuery = useCallback(
    key => {
      const dsInitFunc = dataSetFunc[key]; // 初始化ds的函数
      if (dsInitFunc && isFunction(dsInitFunc)) {
        const curDs = new DataSet(dsInitFunc({ compareFlag: true }));
        const historyDs = new DataSet(dsInitFunc({ compareFlag: true }));
        handleDataSource(key, curDs, historyDs);
        setState({
          currentDataSetList: { ...currentDataSetList, [key]: curDs },
          historyDataSetList: { ...historyDataSetList, [key]: historyDs },
        });
      } else if (dsInitFunc && isObject(dsInitFunc)) {
        const keyList = keys(dsInitFunc);
        const currentPurchaseDs = {};
        const historyPurchaseDs = {};
        forEach(keyList, item => {
          currentPurchaseDs[item] = new DataSet(dsInitFunc[item]({ compareFlag: true }));
          historyPurchaseDs[item] = new DataSet(dsInitFunc[item]({ compareFlag: true }));
          handleDataSource(item, currentPurchaseDs[item], historyPurchaseDs[item], key);
        });
        setState({
          currentDataSetList: { ...currentDataSetList, [key]: currentPurchaseDs },
          historyDataSetList: { ...historyDataSetList, [key]: historyPurchaseDs },
        });
      }
    },
    [currentDataSetList, historyDataSetList, loadTab]
  );

  /**
   * 处理数据源
   * key - 用于匹配后端所需的接口
   * curDs - 当前版本ds
   * historyDs - 历史版本ds
   * parentKey - 父级key，适用于采购财务这种有子级的数据
   */
  const handleDataSource = useCallback(
    (key, curDs, historyDs, parentKey) => {
      setLoading(true);
      fetchSupplierBasicInfo({
        key,
        changeReqId,
        dataSource: 2,
        isNewMenu: 1,
      })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            let currentData; // 当前版本数据
            let historyData; // 历史版本数据
            if (isArray(res)) {
              const [oldData, newData] = res;
              currentData = newData;
              historyData = oldData;
            } else {
              const requestKey = fieldAssociation[key];
              currentData = isArray(res[`new${requestKey || key}`])
                ? res[`new${requestKey || key}`]
                : [res[`new${requestKey || key}`]];
              historyData = isArray(res[`old${requestKey || key}`])
                ? res[`old${requestKey || key}`]
                : [res[`old${requestKey || key}`]];
            }
            curDs.loadData(currentData);
            historyDs.loadData(historyData);
            setState({
              loadTab: {
                ...loadTab,
                [parentKey || key]: true,
              },
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [companyId, changeReqId, loadTab]
  );

  useEffect(() => {
    if (!loadTab[activeKey]) {
      handleQuery(activeKey);
    }
  }, [activeKey]);

  // 处理查询逻辑
  const handleTabsChange = useCallback(key => {
    setActiveKey(key);
  }, []);

  // 获取组件属性
  const componentProps = {
    isEdit,
    countryCode,
    custLoading,
    customizeForm,
    customizeTable,
    tableMaxHeight,
    isSubdomainsRegister,
    domesticForeignRelation,
    handleCompareRender,
  };

  // 最终需展示的tab
  const panelList = getPanelList({ investigationTab, platformTabsHidden: hideConfigNames }).map(
    panel => {
      return { ...panel, componentProps };
    }
  );

  const modelTableList = relTableList.map(item => {
    return {
      key: item.tableCode,
      tab: item.tableName,
      component: DynamicTable,
      type: 'DynamicTable',
      modelTable: item,
    };
  });
  panelList.push(...modelTableList);

  return (
    <div className={styles['compare-tabs-wrap']}>
      {customizeTabPane(
        {
          code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLIER_BASIC_TABS',
          custDefaultActive: key => handleTabsChange(key || activeKey),
        },
        <Tabs
          tabPosition="left"
          customizable={false}
          activeKey={activeKey}
          onChange={handleTabsChange}
          inkBarStyle={{ right: 2 }}
        >
          {panelList.map(panel => (
            <TabPane
              key={panel.key}
              tab={panel.tab}
              count={1}
              countRenderer={() =>
                configNames.includes(panel.key) && (
                  <Badge dot style={{ marginTop: -3, marginLeft: 3 }} />
                )
              }
            >
              <div className={styles['compare-container']}>
                <div className={styles['compare-header']}>
                  <div>{inlt.get('sslm.common.view.compare.currentVersion').d('当前版本')}</div>
                  <div>{inlt.get('sslm.common.view.compare.historyVersion').d('历史版本')}</div>
                </div>
                <div className={styles['compare-content']}>
                  <div>
                    <div className={styles['compare-content-detail']}>
                      <div className={styles['compare-content-title']}>{panel.tab}</div>
                      {panel.type === 'DynamicTable' ? (
                        <panel.component
                          readOnly
                          compareFlag
                          compare={1}
                          pageFlag={false}
                          relationId={changeReqId}
                          modelTable={panel.modelTable}
                        />
                      ) : (
                        currentDataSetList[panel.key] && (
                          <panel.component
                            {...panel.componentProps}
                            {...panel.customizeParam}
                            status="current"
                            dataSet={currentDataSetList[panel.key]}
                          />
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <div className={styles['compare-content-title']}>{panel.tab}</div>
                    {panel.type === 'DynamicTable' ? (
                      <panel.component
                        readOnly
                        compareFlag
                        compare={2}
                        pageFlag={false}
                        relationId={changeReqId}
                        modelTable={panel.modelTable}
                      />
                    ) : (
                      historyDataSetList[panel.key] && (
                        <panel.component
                          {...panel.componentProps}
                          {...panel.customizeParam}
                          status="history"
                          dataSet={historyDataSetList[panel.key]}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </TabPane>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Index;
