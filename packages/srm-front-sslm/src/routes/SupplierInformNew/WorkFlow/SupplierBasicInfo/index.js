/*
 * @Date: 2023-09-28
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Tabs, Badge } from 'choerodon-ui';
import { keys, isArray, forEach, isObject, isFunction, isNil } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import React, { useCallback, useState, useEffect, useImperativeHandle } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { useSetState } from '@/routes/components/utils';
import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';
import { fetchSupplierBasicInfoWfl } from '@/services/supplierInformCompareService';

import { dataSetFunc, fieldAssociation, fieldReflection } from './utils';

const { TabPane } = Tabs;
const tableMaxHeight = { maxHeight: 'calc(100vh - 400px)' };

const Index = ({ commonProps }) => {
  const {
    wfParams,
    headerInfo,
    isEdit,
    changeReqId,
    setLoading,
    custLoading,
    customizeForm,
    customizeTable,
    customizeTabPane,
    domesticForeignRelation,
    handleFieldRender = () => {},
    handleFieldProp = () => {},
    panelList,
    operateType = '',
    ref,
    viewUpdate,
    relTableList,
  } = commonProps;

  const [activeKey, setActiveKey] = useState('comBasicReq');
  const [state, setState] = useSetState({
    loadTab: {},
    currentDataSetList: {}, // 当前版本ds
  });
  const { loadTab, currentDataSetList } = state;

  const { configNames = [] } = headerInfo;

  useImperativeHandle(ref, () => {
    return {
      handleQuery,
      setActiveKey,
    };
  });

  const handleQuery = useCallback(
    (key, curOperateType) => {
      const dsInitFunc = dataSetFunc[key]; // 初始化ds的函数
      if (dsInitFunc && isFunction(dsInitFunc)) {
        const dsProps = dsInitFunc({ compareFlag: true, isEdit: false });
        const field = {
          name: 'objectFlag',
          ignore: 'always',
          label: intl.get('sslm.common.model.common.changeType').d('变更类型'),
        };
        const newField = [...dsProps.fields];
        newField.push(field);
        dsProps.fields = newField;
        const curDs = new DataSet(dsProps);
        handleDataSource(key, curDs, null, curOperateType);
        setState({
          currentDataSetList: { ...currentDataSetList, [key]: curDs },
        });
      } else if (dsInitFunc && isObject(dsInitFunc)) {
        const keyList = keys(dsInitFunc);
        const currentPurchaseDs = {};
        forEach(keyList, item => {
          const dsProps = dsInitFunc[item]({ compareFlag: true });
          const field = {
            name: 'objectFlag',
            ignore: 'always',
            label: intl.get('sslm.common.model.common.changeType').d('变更类型'),
          };
          const newField = [...dsProps.fields];
          newField.push(field);
          dsProps.fields = newField;
          currentPurchaseDs[item] = new DataSet(dsProps);
          handleDataSource(item, currentPurchaseDs[item], key, curOperateType);
        });
        setState({
          currentDataSetList: { ...currentDataSetList, [key]: currentPurchaseDs },
        });
      }
    },
    [currentDataSetList, loadTab, operateType]
  );

  /**
   * 处理数据源
   * key - 用于匹配后端所需的接口
   * curDs - 当前版本ds
   * parentKey - 父级key，适用于采购财务这种有子级的数据
   */
  const handleDataSource = useCallback(
    (key, curDs, parentKey, curOperateType) => {
      setLoading(true);
      fetchSupplierBasicInfoWfl({
        key,
        changeReqId,
        dataSource: 2,
        changeType: curOperateType || operateType,
        ...wfParams,
      })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            let currentData; // 当前版本数据
            if (isArray(res)) {
              currentData = res;
            } else if (res[`new${fieldAssociation[key] || key}`]) {
              const requestKey = fieldAssociation[key];
              currentData = isArray(res[`new${requestKey || key}`])
                ? res[`new${requestKey || key}`]
                : [res[`new${requestKey || key}`]];
            } else {
              currentData = [res];
            }
            curDs.loadData(currentData);
            // 每次切换查看维度时，重置已激活的tab，重新触发查询
            // curOperateType 有值标识切换维度查询需重置激活的tab
            if (isNil(curOperateType)) {
              setState({
                loadTab: {
                  ...loadTab,
                  [parentKey || key]: true,
                },
              });
            } else {
              setState({
                loadTab: {
                  [parentKey || key]: true,
                },
              });
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [changeReqId, loadTab, operateType]
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

  // 判断页签是否变更数据
  const getUpdateTabFlag = useCallback(
    key => {
      const updateTabFlag =
        (configNames.includes(fieldReflection[`${key}`]) || configNames.includes(key)) && !isEdit;
      return updateTabFlag;
    },
    [JSON.stringify(configNames)]
  );

  // 获取组件属性
  const componentProps = {
    showUpdateFlag: true,
    isEdit,
    custLoading,
    customizeForm,
    customizeTable,
    tableMaxHeight,
    domesticForeignRelation,
    handleCompareRender: handleFieldRender,
    handleFieldProp,
  };

  // 最终需展示的tab
  const panelLists = panelList.map(panel => {
    return { ...panel, componentProps };
  });

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
    <div className="card-wrap">
      <div className="enterprise-title">
        <div className="card-detail-title">
          {intl.get('sslm.supplierInform.view.tab.supplierBaseInfo').d('供应商基本信息')}
        </div>
      </div>
      {customizeTabPane(
        {
          code: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.SUPPLIER_BASIC_TABS',
          custDefaultActive: key => handleTabsChange(key || activeKey),
        },
        <Tabs
          tabPosition="left"
          customizable={false}
          activeKey={activeKey}
          onChange={handleTabsChange}
          inkBarStyle={{ right: 2 }}
        >
          {panelLists.map(panel => (
            <TabPane
              key={panel.key}
              tab={panel.tab}
              count={1}
              countRenderer={() =>
                getUpdateTabFlag(panel.key) &&
                !viewUpdate && <Badge dot style={{ marginTop: -3, marginLeft: 3 }} />
              }
            >
              {panel.type === 'DynamicTable' ? (
                <panel.component
                  readOnly
                  c7nButton
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
            </TabPane>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Index;
