import React from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export function editSkuModal(goEdit = (e) => e) {
  confirm({
    // closable: true,
    // autoCenter: true,
    content: intl
      .get('smpc.product.view.message.skuEditApprove')
      .d('该商品已更新，存在待审批版本，请选择要编辑的版本'),
    footer: (ok, cancel, modal) => (
      <>
        <Button onClick={() => modal.close()}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
        <Button onClick={() => goEdit()}>
          {intl.get('smpc.product.model.editCurrentVersion').d('编辑当前版本')}
        </Button>
        <Button color="primary" onClick={() => goEdit(true)}>
          {intl.get('smpc.product.model.editWaitApproveVersion').d('编辑待审批版本')}
        </Button>
      </>
    ),
  });
}

export function newEditSkuModal() {
  confirm({
    okCancel: false,
    content: intl
      .get('smpc.product.view.message.skuEditApproveNew')
      .d('该商品存在待审批版本，请编辑待审批信息；商品若无待审批版本可直接编辑'),
  });
}

export default async function confirm({
  title,
  content,
  onOk = (e) => e,
  onCancel = (e) => e,
  footer,
  ...other
}) {
  Modal.confirm({
    title: <span>{title || intl.get('hzero.common.message.confirm.title').d('提示')}</span>,
    children: <span>{content}</span>,
    footer,
    onOk,
    onCancel,
    ...other,
  });
}
