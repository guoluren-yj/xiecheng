import React, { Component } from 'react';
import { Modal, Table, Button } from 'hzero-ui';

import intl from 'utils/intl';
import { yesOrNoRender, readFlagRender } from 'utils/renderer';

const promptCode = 'ssrc.offlineResultEntry';

export default class Drawer extends Component {
  render() {
    const { visible, dataSource, loading, onOk } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.offlineEntry.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.whetherRead`).d('是否已读'),
        dataIndex: 'readFlag',
        width: 100,
        align: 'center',
        render: readFlagRender,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.feedbackStatus`).d('是否参与'),
        dataIndex: 'feedbackStatusMeaning',
        align: 'center',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.quoLineNumber`).d('报价行数'),
        dataIndex: 'quotationLineNumber',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.isPrequalif`).d('是否提交预审申请'),
        dataIndex: 'submitPrequalificationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.isPostqualif`).d('是否提交后审申请'),
        dataIndex: 'submitPostqualificationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.isHeaderFile`).d('是否上传头附件'),
        dataIndex: 'attachmentFlag',
        width: 100,
        render: yesOrNoRender,
      },
    ];
    return (
      <Modal
        destroyOnClose
        width={850}
        visible={visible}
        title={intl.get(`${promptCode}.view.message.title.quoteResponse`).d('报价响应')}
        closable={false}
        footer={
          <Button type="primary" onClick={onOk}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        }
      >
        <Table
          bordered
          rowKey="rfxLineSupplierId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
      </Modal>
    );
  }
}
