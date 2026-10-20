import React, { PureComponent } from 'react';
import { Table, Modal } from 'hzero-ui';
import intl from 'utils/intl';

export default class InfoModal extends PureComponent {
  render() {
    const {
      infoVisible,
      infoModalCancel,
      infoList,
      infoPagination,
      shareModalOk,
      infoLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.common.productNum').d('商品编码'),
        width: 100,
        dataIndex: 'productNum',
      },
      {
        title: intl.get('scec.common.model.common.productName').d('商品名称'),
        width: 150,
        dataIndex: 'productName',
      },
      {
        title: intl.get('scec.common.model.common.shareTo').d('分享给'),
        width: 150,
        dataIndex: 'beSharedCompanyName',
      },
      {
        title: intl.get('scec.common.model.common.explain').d('说明'),
        width: 150,
        dataIndex: 'shareRecord',
      },
    ];
    return (
      <Modal
        footer={null}
        destroyOnClose
        visible={infoVisible}
        title={intl.get('scec.goodsShare.model.goodsShare.shelvesReminder').d('自动上架提示')}
        onCancel={infoModalCancel}
        width="60%"
      >
        <Table
          bordered
          loading={infoLoading}
          rowKey="productId"
          columns={columns}
          dataSource={infoList}
          pagination={infoPagination}
          onChange={page => shareModalOk(page)}
        />
      </Modal>
    );
  }
}
