/**
 * 财务规则配置 - 弹窗配置列表
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-29
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Table } from 'choerodon-ui/pro';
import { Button as ButtonPermission } from 'components/Permission';

const AccountConfigTable = observer((props) => {
  const { dataSet, onDeteleItem, onDeleteRuleList } = props;

  const handleDeteleItem = (record) => {
    if (onDeteleItem && typeof onDeteleItem === 'function') {
      onDeteleItem(record);
    }
  };

  const columns = () => {
    return [
      {
        name: 'priceFrom',
        editor: true,
      },
      {
        name: 'priceTo',
        editor: true,
      },
      {
        name: 'subjectsCategoryCode',
        editor: true,
      },
      {
        name: 'subjectsCode',
        editor: true,
      },
      {
        name: 'operation',
        header: intl.get(`smpc.product.view.modal.operation`).d('操作'),
        width: 100,
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <ButtonPermission type="text" onClick={() => handleDeteleItem(record)}>
                {intl.get('hzero.common.btn.delete').d('删除')}
              </ButtonPermission>
            </span>
          );
        },
      },
    ];
  };

  const buttons = () => {
    return [
      <ButtonPermission
        funcType="flat"
        icon="add_crt"
        onClick={addRuleItem}
        type="c7n-pro"
        key="add"
      >
        {intl.get(`hzero.common.button.create`).d('新建')}
      </ButtonPermission>,
      <ButtonPermission
        funcType="flat"
        icon="delete"
        onClick={deleteRuleItem}
        type="c7n-pro"
        key="delete"
      >
        {intl.get(`hzero.common.btn.delete`).d('删除')}
      </ButtonPermission>,
    ];
  };

  const addRuleItem = () => {
    dataSet.create({});
  };

  const deleteRuleItem = () => {
    if (onDeleteRuleList && typeof onDeleteRuleList === 'function') {
      onDeleteRuleList();
    }
  };

  return (
    <>
      <Table dataSet={dataSet} columns={columns()} buttons={buttons()} queryBar="normal" />
    </>
  );
});

export default AccountConfigTable;
