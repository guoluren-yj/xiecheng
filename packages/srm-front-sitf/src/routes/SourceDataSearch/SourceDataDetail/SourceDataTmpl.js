/**
 * SourceDataTmpl - 源数据查询 - 源数据模板
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import DataTable from './DataTable';

/**
 * tab标签
 */
const { TabPane } = Tabs;

/**
 * 源数据模板
 * @extends {Component} - React.Component
 * @return React.element
 */
export default class SourceDataTmpl extends PureComponent {
  /**
   * 点击tab标签切换查询数据
   * @param {string} activeKey tab标签页键值
   * @memberof SourceDataTmpl
   */
  @Bind()
  queryData(activeKey) {
    const { queryData, config = [], sourceDataSearch = {} } = this.props;
    const currencyConfig = config.find(c => c.tableName === activeKey);
    const url = currencyConfig && currencyConfig.interfaceUrl;
    const data =
      sourceDataSearch && sourceDataSearch.tabTitle && sourceDataSearch.tabTitle[activeKey];
    if (queryData && !data) {
      queryData({}, url, activeKey);
    }
  }

  render() {
    const { config = [], sourceDataSearch = {}, queryData, loading } = this.props;
    return (
      <Tabs
        animated={false}
        defaultActiveKey={config[0] && config[0].tableName}
        onChange={this.queryData}
        tabBarStyle={{ marginTop: '-8px', paddingTop: '0px' }}
      >
        {config.length > 0 &&
          config
            .filter(con => con)
            .map(item => {
              const tableOptions = {
                queryData,
                loading,
                dataSource: sourceDataSearch.tabTitle && sourceDataSearch.tabTitle[item.tableName],
                columns:
                  item.columns &&
                  item.columns.map(column => {
                    return {
                      title: column.columnComment,
                      dataIndex: column.columnName,
                      width: 250,
                    };
                  }),
                rowKey: 'id',
                scroll: item.columns.length * 250,
                url: item.interfaceUrl,
                tableName: item.tableName,
              };
              return (
                <TabPane tab={item.tableName} key={item.tableName}>
                  <DataTable {...tableOptions} />
                </TabPane>
              );
            })}
      </Tabs>
    );
  }
}
