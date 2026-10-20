/**
 * 规则配置详情 - 策略
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default function ActionConfig(props = {}) {
  const { actionConfigDs, openActionEditModal, deleteActionEditModal } = props;

  const columns = [
    {
      name: 'actionName',
      width: 200,
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'priority',
      width: 200,
    },
    {
      name: 'value',
    },
    {
      name: 'action',
      width: 100,
      renderer: ({ record }) => (
        <span className="action-link">
          <a
            onClick={() =>
              openActionEditModal(
                record,
                intl.get('sdps.ruleManagesDetail.view.modal.title.edit').d('编辑策略')
              )
            }
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a onClick={() => deleteActionEditModal(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        </span>
      ),
    },
  ];

  return <Table dataSet={actionConfigDs} columns={columns} />;
}
