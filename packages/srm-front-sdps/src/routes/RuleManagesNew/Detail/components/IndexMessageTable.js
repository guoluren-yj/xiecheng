/**
 * 规则配置详情 - 指标信息（平台级）
 * @date: 2021-12-20
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { Fragment } from 'react';
import { Table } from 'choerodon-ui/pro'; // Tooltip
// import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';

const { Column } = Table;
const viewPrompt = 'sdps.ruleManagesDetail.view'; // 多语言前缀

export default function IndexMessage(props = {}) {
  const { tableDs, tenantId } = props;

  return (
    <Table dataSet={tableDs} selectedHighLightRow selectionMode="click">
      <Column
        name="operation"
        width={150}
        lock="left"
        renderer={({ record, dataSet }) => {
          const { indexType, ruleManagementLineId } = record.get([
            'indexType',
            'ruleManagementLineId',
          ]);
          const jsonStr = record.get('dimensionality');
          const list = jsonStr ? JSON.parse(jsonStr) : [];
          return (
            <Fragment>
              {indexType !== 'transform_parameter' && ruleManagementLineId ? (
                <span style={{ position: 'relative' }}>
                  <a
                    // style={{ marginRight: '15px' }}
                    onClick={() => {
                      props.onDimensionClick(record, dataSet);
                    }}
                  >
                    {intl.get(`${viewPrompt}.modal.editDimension`).d('编辑维度')}
                  </a>
                  <span
                    style={{ position: 'absolute', top: '-12px', marginLeft: '2px', color: 'red' }}
                  >
                    {list.length}
                  </span>
                </span>
              ) : (
                <span style={{ position: 'relative' }}>
                  <a
                    onClick={() => {
                      props.onDimensionClick(record, dataSet);
                    }}
                  >
                    {intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度')}
                  </a>
                  <span
                    style={{ position: 'absolute', top: '-12px', marginLeft: '2px', color: 'red' }}
                  >
                    {list.length}
                  </span>
                </span>
              )}

              <a
                style={{ marginLeft: '20px' }}
                onClick={() => {
                  props.onDeleteIndex(record);
                }}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </a>

              {/* {!ruleManagementLineId && (
                <Tooltip
                  placement="top"
                  title={intl.get(`${viewPrompt}.modal.notSaveIndexHelp`).d('本指标尚未保存')}
                >
                  <Icon type="info" />
                </Tooltip>
              )} */}
            </Fragment>
          );
        }}
      />
      <Column name="indexCode" width={150} />
      <Column name="indexName" width={150} editor />
      <Column name="dataType" width={100} editor />
      <Column name="description" width={200} editor />
      {tenantId !== '0' && (
        <Column
          name="calculateCode"
          width={200}
          editor
          // help={intl.get(`${viewPrompt}.modal.codeForStrategy`).d('此编码用于策略配置')}
        />
      )}
      <Column name="serviceCode" width={150} />
      <Column name="serviceName" />
      <Column name="creationDate" width={200} />
      <Column name="lastUpdateDate" width={200} />
    </Table>
  );
}
