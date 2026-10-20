/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-10-25 10:38:57
 * @LastEditors: yanglin
 * @LastEditTime: 2022-04-07 17:33:23
 */
import React from 'react';

import intl from 'utils/intl';
import { Table, Modal, useDataSet } from 'choerodon-ui/pro';

import ItemCustomDs from './ItemCustomDs';
import { customAttribute } from '@/services/purchaseRequisitionCreationService';

export const ItemCustom = ({ record, disabled }) => {
  const itemCustomLineDs = useDataSet(() => ItemCustomDs(), []);

  const openModal = () => {
    itemCustomLineDs.status = 'loading';

    if (record.get('customAttributeList')) {
      itemCustomLineDs.loadData(record.get('customAttributeList'));
      itemCustomLineDs.status = 'ready';
    } else if (record.get('itemId')) {
      customAttribute({
        itemId: record.get('itemId'),
        prLineId: record.get('prLineId'),
        customMadeFlag: 1,
      }).then((res) => {
        if (res) {
          itemCustomLineDs.status = 'ready';
          itemCustomLineDs.loadData(res);
        }
      });
    }

    const cols = [
      {
        name: 'attributeName',
      },
      {
        name: 'attributeValue',
        editor: !disabled,
      },
    ];

    Modal.open({
      key: Modal.key(),
      title: intl.get(`sprm.common.model.common.customAttributeList`).d('物料定制属性'),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      children: <Table dataSet={itemCustomLineDs} columns={cols} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {
        if (!disabled) {
          const customAttributeListData = itemCustomLineDs.toJSONData();
          record.set({ customAttributeList: customAttributeListData });
        }
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn} {cancelBtn}
        </div>
      ),
    });
  };

  return <a onClick={openModal}>{intl.get('sprm.common.itemcustom.special').d('定制属性')}</a>;
};
