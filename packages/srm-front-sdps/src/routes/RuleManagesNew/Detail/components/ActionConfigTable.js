/**
 * 规则配置详情 - 策略配置（平台级）
 * @date: 2021-12-23
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const { Column } = Table;

export default function ActionConfigTable(props = {}) {
  const { tableDs, handleActionEdit, handleActionDelete } = props;

  return (
    <Table dataSet={tableDs}>
      <Column name="actionName" width={200} />
      <Column name="description" width={200} />
      <Column name="priority" width={100} />
      <Column name="conditionExpression" />
      <Column name="value" width={200} />
      <Column
        name="action"
        width={100}
        renderer={({ record }) => {
          return (
            <Fragment>
              <a onClick={() => handleActionEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a onClick={() => handleActionDelete(record)} style={{ marginLeft: '8px' }}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            </Fragment>
          );
        }}
      />
    </Table>
  );
}
