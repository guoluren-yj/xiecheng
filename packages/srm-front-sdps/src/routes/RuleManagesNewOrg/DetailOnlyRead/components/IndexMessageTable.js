/**
 * 规则配置详情 - 指标信息（只读）（租户级）
 * @date: 2021-12-20
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const { Column } = Table;
const viewPrompt = 'sdps.ruleManagesDetail.view'; // 多语言前缀

export default function IndexMessage(props = {}) {
  const { tableDs } = props;

  return (
    <Table dataSet={tableDs}>
      <Column name="calculateCode" width={200} />
      <Column name="indexName" width={150} />
      <Column name="dataType" width={100} />
      <Column name="description" width={200} />
      <Column name="serviceCode" width={150} />
      <Column name="serviceName" />
      <Column name="creationDate" width={200} />
      <Column name="lastUpdateDate" width={200} />
      <Column
        name="operation"
        width={200}
        lock="right"
        renderer={({ record, dataSet }) => {
          const { indexType, servicePath } = record.get(['indexType', 'servicePath']);
          const jsonStr = record.get('dimensionality');
          const list = jsonStr ? JSON.parse(jsonStr) : [];
          return (
            <Fragment>
              {indexType !== 'transform_parameter' && (
                <Fragment>
                  <span style={{ position: 'relative' }}>
                    <a
                      onClick={() => {
                        props.onDimensionClick(record, dataSet);
                      }}
                    >
                      {intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度')}
                      {`(${list.length})`}
                    </a>
                  </span>
                  {servicePath && (
                    <a
                      style={{ marginLeft: '20px' }}
                      onClick={() => {
                        props.onRouterDimension(record);
                      }}
                    >
                      {intl.get(`${viewPrompt}.ruleManages.indexSearch`).d('指标探查')}
                    </a>
                  )}
                </Fragment>
              )}
            </Fragment>
          );
        }}
      />
    </Table>
  );
}
