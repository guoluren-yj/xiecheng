import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Tabs } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchModuleList, fetchAllColumns } from '@/services/priceModelService';
import ColumnTable from './ColumnTable';
import LineTable from './LineTable';
import { columnTableDS, lineTableDS } from '../../store/storeDS';

import Store from '../../store/index';

const { TabPane } = Tabs;

export default observer(function MainParameter() {
  const {
    routerParams: { modelId },
  } = useContext(Store);

  const [moduleList, setModuleList] = useState([]);
  const [activeModuleKey, setActiveModuleKey] = useState('');
  const [activityTabKey, setActivityTabKey] = useState('column');
  const [dynamicLineColumns, setDynamicLineColumns] = useState({});

  const columnDsMap = useMemo(() => new Map(), []);
  const lineDsMap = useMemo(() => new Map(), []);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    queryModules();
  };

  // 查询模块
  const queryModules = () => {
    fetchModuleList({ modelId }).then((res) => {
      const result = getResponse(res);
      if (Array.isArray(result) && result.length > 0) {
        // 设置模块dataset
        result.forEach((item) => {
          columnDsMap.set(item.moduleId, new DataSet(columnTableDS({ modelId })));
          lineDsMap.set(item.moduleId, new DataSet(lineTableDS({ modelId })));
        });

        // 新增保存或编辑保存或删除后查询取最后一个模块为当前活动模块
        const currentModuleId = result[0].moduleId;
        setModuleList(result);
        setActiveModuleKey(currentModuleId);
        queryColumnTable(currentModuleId);
      }
    });
  };

  // 查询columnTable
  const queryColumnTable = (moduleId) => {
    if (!columnDsMap.get(moduleId)) return;
    columnDsMap.get(moduleId).setState('moduleId', moduleId);
    columnDsMap.get(moduleId).query();
  };

  // 切换模块页签
  const handleChangeModuleKey = (key) => {
    setActiveModuleKey(key);
    if (activityTabKey === 'column') {
      if (!columnDsMap.get(key)?.getState('hasColumnQueriedFlag')) queryColumnTable(key);
    } else if (activityTabKey === 'line') {
      // 查询第模块动态列信息
      if (!dynamicLineColumns[key]) queryAllColumns(key);
    }
  };

  // 切换tab标签页
  const handleTabKeyChange = (key) => {
    setActivityTabKey(key);
    if (key === 'column' && !columnDsMap.get(activeModuleKey)?.getState('hasColumnQueriedFlag')) {
      queryColumnTable(activeModuleKey);
    }
    if (key === 'line' && !dynamicLineColumns[activeModuleKey]) queryAllColumns(activeModuleKey);
  };

  // 查询模块下所有动态列信息
  const queryAllColumns = (moduleId) => {
    const data = {
      modelId,
      moduleId,
    };
    fetchAllColumns(data).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        // 设置动态列
        setItemDynamicColumns(result, moduleId);
        // 查询
        if (lineDsMap.get(moduleId)) {
          lineDsMap.get(moduleId).setState('moduleId', moduleId);
          lineDsMap.get(moduleId).query();
        }
      }
    });
  };

  // 设置明细项动态列
  const setItemDynamicColumns = (data, moduleId) => {
    const columns = [];
    data.forEach((item) => {
      const { componentType, columnId, columnName } = item;
      const fieldName = ['Lov', 'ValueList'].includes(componentType)
        ? `${columnId}Meaning`
        : columnId;
      // eslint-disable-next-line no-unused-expressions
      lineDsMap.get(moduleId)?.addField(fieldName, {
        name: fieldName,
        label: columnName,
      });
      columns.push({
        name: fieldName,
        width: 150,
      });
    });
    setDynamicLineColumns({
      ...dynamicLineColumns,
      [moduleId]: columns,
    });
  };

  return (
    <Tabs activeKey={activeModuleKey} onChange={handleChangeModuleKey} animated={false}>
      {moduleList.map((item) => {
        return (
          <TabPane tab={item.moduleName} key={item.moduleId}>
            <Tabs
              type="card"
              activeKey={activityTabKey}
              onChange={handleTabKeyChange}
              animated={false}
            >
              <TabPane
                tab={intl.get('spc.priceModel.view.tab.column').d('列明细定义')}
                key="column"
              >
                <ColumnTable dataSet={columnDsMap.get(item.moduleId)} />
              </TabPane>
              <TabPane tab={intl.get('spc.priceModel.view.tab.line').d('行明细定义')} key="line">
                <LineTable
                  dataSet={lineDsMap.get(item.moduleId)}
                  dynamicLineColumns={dynamicLineColumns[item.moduleId]}
                />
              </TabPane>
            </Tabs>
          </TabPane>
        );
      })}
    </Tabs>
  );
});
