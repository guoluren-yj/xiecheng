/*
 * @Description:
 * @Date: 2021-11-24 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Tag } from 'choerodon-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SLOD } from '_utils/config';
import { formatColumnCommand } from '../components/historyVerison';
import VersionCmp from '../components/historyVerison/VerisonRecord';

const { Column } = Table;

const ListStrategy = (props) => {
  const { strategyDs, onHandleDetailChange = (e) => e, handleDetailTable = (e) => e } = props;

  const getActionCommand = ({ record }) => {
    const buttons = [
      {
        name: 'edit',
        text: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleDetail(record),
        // showFlag: Number(snapshotFlag) === 1,
      },
      {
        name: 'historyVersion',
        group: true,
        showFlag: true,
        text: intl.get('hzero.common.button.historyVersion').d('历史版本'),
        children: (
          <VersionCmp
            primaryKey="strategyHeaderId"
            onClick={({ record: versionRecord }) =>
              handleDetailTable(
                versionRecord?.get('strategyHeaderId'),
                'history',
                versionRecord?.get('dataVersion')
              )
            }
            fieldsConfig={{
              userName: { alias: 'createdName' },
              time: { alias: 'creationDate' },
              versionNumber: { alias: 'dataVersion' },
            }}
            readTransport={{
              url: `${SRM_SLOD}/v1/${getCurrentOrganizationId()}/delivery/strategy/strategy-line/list/publish`,
              method: 'GET',
              params: { strategyHeaderId: record?.get('strategyHeaderId') },
            }}
          />
        ),
      },
    ];
    return formatColumnCommand({ buttons });
  };

  // 查看明细
  const handleDetail = (record) => {
    handleDetailTable(record, null);
  };

  const listProps = {
    dataSet: strategyDs,
    key: 'user',
    queryFieldsLimit: 3,
    customizedCode: 'node-codes',
  };

  /**
   * 状态颜色控制
   */
  const colorRender = (_value, record, name) => {
    const value = record.get(name);
    if (['PUBLISHED'].includes(value)) {
      // 绿色: 已发布
      return (
        <Tag style={{ border: 'none' }} color="green">
          <span>{record.get(`${name}Meaning`)}</span>
        </Tag>
      );
    } else if (['UNPUBLISHED'].includes(value)) {
      //  灰色: 未发布
      return (
        <Tag style={{ border: 'none' }} color="yellow">
          <span>{record.get(`${name}Meaning`)}</span>
        </Tag>
      );
    } else {
      return '-';
    }
  };

  // DOM 结构渲染
  return (
    <div style={{ height: 'calc(100vh - 245px)' }}>
      <Table {...listProps} boxSizing="wrapper" style={{ maxHeight: `calc(100% - 10px)` }}>
        <Column
          name="strategyStatusMeaning"
          editor={(record) => record.getState('editing')}
          width={120}
          renderer={({ value, record }) => colorRender(value, record, 'strategyStatus')}
        />
        <Column
          header={intl.get('hzero.common.table.column.options').d('操作')}
          width={220}
          align="left"
          // lock="left"
          command={getActionCommand}
        />
        <Column
          name="strategyCode"
          renderer={({ value, record }) => {
            return (
              <Button funcType="link" color="primary" onClick={() => onHandleDetailChange(record)}>
                {' '}
                {value || '-'}
              </Button>
            );
          }}
          editor={(record) => record.getState('editing')}
        />
        <Column name="strategyName" editor={(record) => record.getState('editing')} />
        <Column name="sourceCode" editor={(record) => record.getState('editing')} />
        <Column name="dataVersion" width={80} />
      </Table>
    </div>
  );
};

export default ListStrategy;
