/**
 * 规则配置详情 - 指标信息(只读)
 * @date: 2021-12-28
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
  const { tableDs, tenantId } = props;

  return (
    <div className="index-tab-panel">
      <Table dataSet={tableDs} selectedHighLightRow selectionMode="click">
        <Column
          name="operation"
          width={150}
          lock="left"
          renderer={({ record, dataSet }) => {
            const jsonStr = record.get('dimensionality');
            const list = jsonStr ? JSON.parse(jsonStr) : [];
            return (
              <Fragment>
                {record.get('indexType') !== 'transform_parameter' && (
                  <span style={{ position: 'relative' }}>
                    <a
                      onClick={() => {
                        props.onDimensionClick(record, dataSet);
                      }}
                    >
                      {intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度')}
                    </a>
                    <span
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        marginLeft: '2px',
                        color: 'red',
                      }}
                    >
                      {list.length}
                    </span>
                  </span>
                )}
              </Fragment>
            );
          }}
        />
        <Column name="indexCode" width={150} />
        <Column name="indexName" width={150} />
        <Column name="dataType" width={100} />
        <Column name="description" width={200} />
        {tenantId !== '0' && <Column name="calculateCode" width={200} />}
        <Column name="serviceCode" width={150} />
        <Column name="serviceName" />
        <Column name="creationDate" width={200} />
        <Column name="lastUpdateDate" width={200} />
      </Table>
    </div>
  );
}
