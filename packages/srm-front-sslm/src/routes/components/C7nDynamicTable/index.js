/* ModelTable c7n模型表组件
 * @Date: 2022-06-29 14:06:46
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useCallback, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { Tabs } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';

import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';

import RelTable from './components/RelTable';

const { TabPane } = Tabs;

const ModelTable = ({
  targetPage = '',
  queryParams = {},
  reQueryFlag = false,
  readOnly = false,
  // tabType = 'Card', // 目前只支持卡片
  isPub = false,
}) => {
  const [tableList, setTableList] = useState([]);

  useEffect(() => {
    handleQueryRelTableConfig();
  }, [targetPage]);

  const handleQueryRelTableConfig = useCallback(() => {
    if (targetPage) {
      // 查询配置表
      queryRelTableConfig(targetPage).then(res => {
        setTableList(res);
      });
    }
  }, [targetPage]);

  const Component = (props = {}) => {
    const { config = {}, children } = props;
    let ComponentType = TabPane;
    let componentProps = {};
    switch ('card') {
      case 'TabPane':
        ComponentType = TabPane;
        componentProps = {
          tab: config.tableName,
          key: config.tableCode,
        };
        break;
      case 'card':
        ComponentType = Card;
        componentProps = {
          bordered: false,
          id: config.tableCode,
          title: config.tableName,
        };
        break;
      default:
        componentProps = {
          tab: config.tableName,
          key: config.tableCode,
        };
        break;
    }
    return React.createElement(ComponentType, { ...componentProps }, children);
  };

  // 渲染表格
  const renderModelTablePanel = () => {
    const tabs = [];
    if (isEmpty(tableList)) {
      return null;
    }
    tableList.forEach(n => {
      tabs.push(
        <Component config={n}>
          <RelTable
            modelTable={{
              ...n,
            }}
            queryParams={queryParams}
            reQueryFlag={reQueryFlag}
            readOnly={readOnly}
            isPub={isPub}
          />
        </Component>
      );
    });
    return tabs;
  };

  return renderModelTablePanel();
};

export default ModelTable;

export const tabModelTable = (props = {}) => {
  const { tableList = [], showTitle = false, ...others } = props;
  const tabs = [];
  if (isEmpty(tableList)) {
    return null;
  }
  tableList.forEach(n => {
    tabs.push(
      <TabPane tab={n.tableName} key={n.tableCode}>
        {showTitle && (
          <div
            id={n.tableCode}
            style={{
              fontSize: '16px',
              color: '#1d2129',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            {n.tableName}
          </div>
        )}
        <RelTable
          modelTable={{
            ...n,
          }}
          {...others}
        />
      </TabPane>
    );
  });
  return tabs;
};
