import React, { useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { Form, Output, Table, Modal } from 'choerodon-ui/pro';
import { deleteLine, deleUpdateAll } from './service.js';

const Index = function Index({
  tableDs,
  lineRecord,
  headerDs,
  readOnly,
  customizeTable,
  type,
  ...others
}) {
  const columns = [
    { name: 'lineNum' },
    { name: 'itemId', editor: !readOnly },
    { name: 'itemName', editor: !readOnly },
    { name: 'categoryId', editor: !readOnly },
    { name: 'quantity', editor: !readOnly },
    { name: 'uomId', editor: !readOnly },
    { name: 'invOrganizationId', editor: !readOnly },
    { name: 'neededDate', editor: !readOnly },
  ];

  useEffect(() => {
    // 当前行的 物料id, 行id，存的bom信息
    const { itemId, prLineId, prLineBomList } =
      lineRecord?.get(['itemId', 'prLineId', 'prLineBomList']) || {};
    // 当前行可能修改的物料id
    const itemOriginId = lineRecord?.getState('itemOriginId');
    // 原行的物料id
    const pristineItemId = lineRecord?.getPristineValue('itemId');

    if (prLineBomList && prLineBomList?.length > 0) {
      tableDs.loadData(prLineBomList);
      lineRecord.set({ updateQuantityFlag: 0 });
    } else if (itemId !== itemOriginId && itemId !== pristineItemId) {
      lineRecord.setState('itemOriginId', itemId);
      if (type !== 'change') {
        deleUpdateAll({ prLineId }).then((res) => {
          if (getResponse(res)) {
            tableDs.query();
          }
        });
      } else {
        tableDs.query();
      }
    } else {
      lineRecord.setState('itemOriginId', itemId);
      tableDs.query();
    }
  }, []);

  const handleLineAdd = () => {
    const { neededDate, prLineId, prHeaderId, itemId, quantity } = lineRecord.get([
      'neededDate',
      'prLineId',
      'prHeaderId',
      'itemId',
      'quantity',
    ]);
    tableDs.create(
      {
        neededDate,
        prLineId,
        prHeaderId,
        prLineItemId: itemId,
        prLineQuantity: quantity,
        tenantId: getCurrentOrganizationId(),
      },
      0
    );
  };

  // 删除采购申请行
  const handleLineDelete = () => {
    const { selected } = tableDs;
    const deleUpdateArr = selected.filter((ele) => ele.get('prLineBomId'));
    if (deleUpdateArr.length > 0 && type !== 'change') {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: (
          <div>
            {intl.get('hzero.c7nProUI.DataSet.delete_selected_row_confirm').d('确认删除选中行？')}
          </div>
        ),
        onOk: async () => {
          const deleteAllLine = deleUpdateArr.map((ele) => ele.toJSONData());
          const res = getResponse(await deleteLine(deleteAllLine));
          if (res) {
            tableDs.unSelectAll();
            tableDs.clearCachedSelected();
            tableDs.query({}, {}, true);
            notification.success();
          }
        },
      });
    } else if (deleUpdateArr.length > 0 && type === 'change') {
      const prLineBomList = lineRecord.get('prLineBomList') || [];
      const prLineBomIds = selected?.map((i) => i.get('prLineBomId'));
      lineRecord.set({
        prLineBomList: prLineBomList?.filter((i) => prLineBomIds.includes(i.prLineBomId)),
      });
      tableDs.remove(selected, true);
    } else {
      tableDs.remove(selected, true);
    }
  };

  return (
    <div>
      <Form record={lineRecord} columns={3} labelLayout="float">
        <Output name="itemCode" />
        <Output name="itemName" />
      </Form>

      {customizeTable(
        { code: others?.custCode },
        <Table
          style={{ maxHeight: 'calc(100vh - 204px)' }}
          dataSet={tableDs}
          columns={columns}
          selectionMode={readOnly ? 'none' : 'rowbox'}
          buttons={
            readOnly
              ? []
              : [
                  ['add', { onClick: handleLineAdd }],
                  // ['save', { onClick: handleSave }],
                  ['delete', { onClick: handleLineDelete }],
                ]
          }
        />
      )}
    </div>
  );
};

export default formatterCollections({
  code: [
    'entity.supplier',
    'sprm.common',
    'sprm.purchasePlatform',
    'hzero.common',
    'hzero.c7nProUI',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'entity.item',
    'sodr.sendOrder',
    'sodr.common',
    'smpc.product',
  ],
})(Index);
