import React, { useMemo } from 'react';
import { Table, DataSet, Tabs } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { getUrlParam } from '@/utils/utils';
import configDs from './configDs';

const { TabPane } = Tabs;

const ConfigObjectAsync = (props) => {
  const { objectCode, tableName } = props.match.params;
  const body = { objectCode, tableName, fieldsKeys: getUrlParam() };
  const testDs = useMemo(() => new DataSet(configDs('test', body)), []);
  const prodDs = useMemo(() => new DataSet(configDs('prod', body)), []);
  const column = useMemo(
    () => [
      { name: 'tableName', width: 150 },
      { name: 'uniqueCode', width: 300 },
      { name: 'fieldName', width: 150 },
      { name: 'curValue' },
      { name: 'targetValue' },
      {
        name: 'type',
        width: 80,
        renderer: ({ value }) => {
          if (value === 'update') {
            return '更新';
          }
          return '新增';
        },
      },
    ],
    []
  );

  return (
    <>
      <Header title="配置对象同步-差异对比" backPath="/srdm/config-object-async" />
      <Content>
        <Tabs>
          <TabPane tab="与测试环境对比" key="test">
            <Table selectionMode="none" dataSet={testDs} columns={column} />
          </TabPane>
          <TabPane tab="与正式环境对比" key="prod">
            <Table selectionMode="none" dataSet={prodDs} columns={column} />
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
};

export default ConfigObjectAsync;
