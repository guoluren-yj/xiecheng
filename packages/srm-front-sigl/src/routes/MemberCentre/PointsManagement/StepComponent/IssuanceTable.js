/**
 * 会员管理 - 需要发放积分的列表弹窗
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import {
  Table,
  Button,
  Form,
  NumberField,
  DatePicker,
  Select,
  TextArea,
  DataSet,
} from 'choerodon-ui/pro';
import c7nModal from '@/utils/c7nModal';
import { batchEditDS } from '@/stores/PointsManagementDS';

const IssuanceTable = observer((props) => {
  const { dataSet, onRemoveItem } = props;

  /**
   * 确认发放列表删除一条数据，同时会员列表去选此条数据
   */
  const handleRemoveItem = () => {
    if (onRemoveItem && typeof onRemoveItem === 'function') {
      onRemoveItem(dataSet.selected?.map((r) => r.get('memberId')) || []);
    }
    dataSet.remove(dataSet.selected || [], true); // 确认发放列表移除该条数据
  };

  const handleBatchEdit = () => {
    const batchDS = new DataSet(batchEditDS());
    c7nModal({
      style: { width: '380px' },
      title: intl.get(`sigl.memberCenter.view.button.batchEdit`).d('批量编辑'),
      children: (
        <Form dataSet={batchDS} labelLayout="float">
          <Select name="pointsTypeId" noCache />
          <NumberField
            name="modifyIntegralCount"
            addonAfter={`/${intl.get('sigl.memberCenter.view.numberField.unitPeople').d('人')}`}
          />
          <DatePicker name="expirationDate" />
          <TextArea name="remarks" maxLength={30} />
        </Form>
      ),
      onOk: () => {
        const fields = ['pointsTypeId', 'modifyIntegralCount', 'expirationDate', 'remarks'];
        dataSet.forEach((record) => {
          fields.forEach((f) => {
            const value = batchDS.current?.get(f);
            if (value) {
              record.set(f, value);
            }
          });
        });
      },
    });
  };

  const buttons = [
    <Button icon="mode_edit" disabled={!dataSet.selected.length} onClick={() => handleBatchEdit()}>
      {intl.get(`sigl.memberCenter.view.button.batchEdit`).d('批量编辑')}
    </Button>,
    <Button
      icon="delete_sweep"
      disabled={!dataSet.selected.length}
      onClick={() => handleRemoveItem()}
    >
      {intl.get(`sigl.memberCenter.view.button.batchDelete`).d('批量删除')}
    </Button>,
  ];

  const columns = () => {
    return [
      {
        name: 'memberCode',
        width: 130,
      },
      {
        name: 'memberName',
        width: 100,
      },
      {
        name: 'pointsTypeId',
        editor: true,
        width: 130,
      },
      {
        name: 'modifyIntegralCount',
        editor: true,
        align: 'right',
        width: 110,
      },
      {
        name: 'expirationDate',
        editor: true,
        width: 120,
      },
      {
        name: 'remarks',
        editor: true,
        width: 120,
      },
    ];
  };

  return (
    <>
      <Table
        key="basic"
        customizedCode="SIGL.PONIT_MANAGE.ISSUANCE_LIST"
        buttons={buttons}
        dataSet={dataSet}
        columns={columns()}
        queryBar="normal"
        style={{ maxHeight: `calc(100vh - 258px)` }}
      />
    </>
  );
});

export default IssuanceTable;
