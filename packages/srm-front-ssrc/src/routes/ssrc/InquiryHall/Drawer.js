import React, { Component } from 'react';
import { Modal, Table, Button } from 'hzero-ui';

import intl from 'utils/intl';

export default class Drawer extends Component {
  render() {
    const { visible, dataSource, loading, onOk, onCancel } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.participate`).d('是否参与'),
        dataIndex: 'feedbackStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationNumber`).d('报价行数'),
        dataIndex: 'quotationNumber',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.preQualification`).d('资格预审'),
        dataIndex: 'prequalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.postQualification`).d('资格后审'),
        dataIndex: 'postqualStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentHeader`).d('报价头附件'),
        dataIndex: 'attachmentFlagMeaning',
        width: 100,
      },
    ];
    return (
      <Modal
        destroyOnClose
        width={850}
        visible={visible}
        onCancel={onCancel}
        title={intl.get(`ssrc.inquiryHall.view.message.title.quotationResponse`).d('报价响应')}
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
