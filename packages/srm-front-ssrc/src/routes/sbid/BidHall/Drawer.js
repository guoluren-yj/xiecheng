/**
 * create 创建招标
 * @date: 2019-05-13
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Table, Button } from 'hzero-ui';

import intl from 'utils/intl';

export default class Drawer extends Component {
  render() {
    const { visible, dataSource = [], loading, onOk, preQualificationFlag } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.postqualStatusMeaning`).d('是否参与'),
        dataIndex: 'postqualStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationNumber`).d('投标行数'),
        dataIndex: 'quotationNumber',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.prequalLineMeaning`).d('资格预审'),
        dataIndex: 'prequalLineMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.attachmentFlagMeaning`).d('投标头附件'),
        dataIndex: 'attachmentFlagMeaning',
        width: 100,
      },
    ];
    if (!preQualificationFlag) {
      columns.splice(4, 1);
    }
    return (
      <Modal
        destroyOnClose
        width={850}
        visible={visible}
        title={intl.get(`ssrc.bidHall.view.title.quotationResponse`).d('投标响应')}
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
