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

const { Column } = Table;

const ListNode = (props) => {
  const { nodeDs, createModal = (e) => e } = props;

  const commands = ({ record }) => {
    const btns = [];
    btns.push(
      <Button
        funcType="link"
        color="primary"
        onClick={() => handleEdit(record)}
        disabled={record.status === 'delete'}
      >
        {intl.get('hzero.common.button.editor').d('编辑')}
      </Button>
    );
    return [<span className="action-link">{btns}</span>];
  };

  const handleEdit = (record) => {
    createModal(record, 'edit');
  };

  const listProps = {
    key: 'user',
    dataSet: nodeDs,
    queryFieldsLimit: 3,
    customizedCode: 'node-codes',
  };

  return (
    <div style={{ height: 'calc(100vh - 245px)' }}>
      <Table {...listProps} boxSizing="wrapper" style={{ maxHeight: `calc(100% - 10px)` }}>
        <Column
          header={intl.get('hzero.common.table.column.options').d('操作')}
          width={100}
          align="left"
          // lock="left"
          command={commands}
        />
        <Column name="nodeConfigCode" editor={(record) => record.getState('editing')} width={150} />
        <Column name="nodeConfigName" editor={(record) => record.getState('editing')} width={150} />
        <Column
          name="nodeTemplateCode"
          editor={(record) => record.getState('editing')}
          width={150}
        />
        <Column
          name="customerUnitCodeAll"
          editor={(record) => record.getState('editing')}
          width={150}
        />
        <Column
          name="cuszDocTmplCodeObj"
          editor={(record) => record.getState('editing')}
          width={250}
        />
        <Column
          name="documentCodeRuleAll"
          editor={(record) => record.getState('editing')}
          width={150}
        />
        <Column
          name="uniqueLabelCodeRuleAll"
          editor={(record) => record.getState('editing')}
          width={150}
          minWidth={50}
        />
        <Column name="nodeRemark" editor={(record) => record.getState('editing')} width={150} />
      </Table>
    </div>
  );
};

export default ListNode;
