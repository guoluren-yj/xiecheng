import React, { useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';

import { openSkuDetail, openSkuEdit } from '@/utils/openCommonTab';

export default observer(function TransferModal(props) {
  const { dataSet: ds, modal, onOk = (e) => e, readOnly, backPath } = props;

  modal.handleOk(() => onOk(ds.selected));
  if (readOnly) {
    modal.update({
      okProps: { disabled: false },
    });
    modal.handleOk(() => true);
  }

  useEffect(() => {
    const disabled = ds.selected.length === 0;
    if (!readOnly) {
      modal.update({
        okProps: { disabled },
      });
    }
  }, [ds.selected]);

  function handleGoodsPreview(record) {
    openSkuDetail({
      record,
      backPath: backPath || '/sagm/sagm-protocol-workbench/list?tabKey=product_detail',
    });
  }

  function handleGoodsEdit(record) {
    const { spuId } = record.toData();
    openSkuEdit({
      spuId,
      backPath: backPath || '/sagm/sagm-protocol-workbench/list?tabKey=product_detail',
    });
  }

  const columns = [
    {
      name: 'skuCode',
      width: 150,
      renderer: ({ record, text }) => <a onClick={() => handleGoodsPreview(record)}>{text}</a>,
    },
    {
      name: 'skuName',
    },
    {
      name: 'categoryName',
      width: 150,
    },
    {
      title: intl.get('small.common.view.operate').d('操作'),
      width: 120,
      lock: 'right',
      renderer: ({ record }) => {
        return (
          <span className="action-link">
            {/* <a onClick={() => handleGoodsPreview(record)}>
              {intl.get('small.common.model.look').d('查看')}
            </a> */}
            {!readOnly && (
              <a onClick={() => handleGoodsEdit(record)}>
                {intl.get('hzero.common.model.edit').d('编辑')}
              </a>
            )}
          </span>
        );
      },
    },
  ];
  return (
    <Table
      dataSet={ds}
      columns={columns}
      queryFieldsLimit={2}
      customizedCode="PROTOCOL.SKU.LIST"
      style={{ maxHeight: 'calc(100vh - 250px)' }}
    />
  );
});
