/*
 * @Description:
 * @Autor: hongzhu.chen@going-link.com
 * @Date: 2021-05-20 20:58:31
 * @LastEditTime: 2021-06-15 17:10:59
 */
/**
 * OperationRecord - 供应商查看页面
 * @date: 2019 1/8
 * @author: zili.hou@hand-china
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal, Form } from 'hzero-ui';

import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import CPopover from '@/routes/ssrc/components/CPopover';

@Form.create({ fieldNameProp: null })
export default class OperationRecord extends PureComponent {
  componentDidMount() {}

  render() {
    const { visible, hideModal, supplierDataSource, form } = this.props;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPrice`).d('最低限价'),
        dataIndex: 'minLimitPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.maximumPrice`).d('最高限价'),
        dataIndex: 'maxLimitPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherToInvite`).d('是否邀请'),
        dataIndex: 'inviteFlag',
        width: 100,
        render: (val) => (
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('inviteFlag', {
              initialValue: val,
            })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
          </Form.Item>
        ),
      },
    ];
    const modalProps = {
      visible,
      width: 600,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      title: intl.get(`ssrc.inquiryHall.view.message,title.filterSupplier`).d('筛选供应商'),
    };
    const tableProps = {
      rowKey: 'rfxLineSupplierId',
      dataSource: supplierDataSource,
      columns,
      pagination: false,
    };
    return (
      <Modal {...modalProps}>
        <Table {...tableProps} bordered />
      </Modal>
    );
  }
}
