/**
 * SignStatusList - 签收状态明细
 * @date: 2020-2-24
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

@connect(({ businessOrderPublish, loading }) => ({
  businessOrderPublish,
  fetchSignLoading: loading.effects['businessOrderPublish/fetchSignStatusList'],
}))
/**
 * 签收状态明细
 * @extends {Component} - React.Component
 * @return React.element
 */
export default class SignStatusList extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      signVisible: false,
    };
  }

  /**
   * 签收状态modal
   */
  @Bind()
  handleOperatedModal() {
    this.setState(
      {
        signVisible: true,
      },
      () => {
        this.fetchSignRecord();
      }
    );
  }

  /**
   * 关闭签收状态
   */
  @Bind()
  handleCloseSign() {
    this.setState({
      signVisible: false,
    });
  }

  /**
   * 查询签收状态
   */
  @Bind()
  fetchSignRecord(page = {}) {
    const { dispatch, notificationId } = this.props;
    dispatch({
      type: 'businessOrderPublish/fetchSignStatusList',
      payload: {
        page,
        notificationId,
      },
    });
  }

  render() {
    const { signVisible } = this.state;
    const {
      fetchSignLoading,
      businessOrderPublish: { signRecord = [], signPagination = {} },
    } = this.props;
    const columns = [
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`spfm.businessOrder.model.businessOrder.receiveFlag`).d('是否签收'),
        dataIndex: 'receiveFlag',
        width: 120,
        render: (val) =>
          val === 1
            ? intl.get(`spfm.businessOrder.model.businessOrder.yesReceive`).d('已签收')
            : intl.get(`spfm.businessOrder.model.businessOrder.noReceive`).d('未签收'),
      },
      {
        title: intl.get(`spfm.businessOrder.model.businessOrder.receiveDate`).d('签收时间'),
        dataIndex: 'receiveDate',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`spfm.businessOrder.model.businessOrder.receivesAttachmentUuid`)
          .d('查看附件'),
        dataIndex: 'receivesAttachmentUuid',
        width: 120,
        render: (_, { receivesAttachmentUuid }) => {
          const uploadProps = {
            bucketName: PRIVATE_BUCKET,
            btnText: intl
              .get(`spfm.businessOrder.model.businessOrder.receivesAttachmentUuid`)
              .d('查看附件'),
            attachmentUUID: receivesAttachmentUuid,
            viewOnly: true,
            showFilesNumber: true,
            icon: false,
          };
          return receivesAttachmentUuid ? <UploadModal {...uploadProps} /> : null;
        },
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get(`spfm.businessOrder.model.businessOrder.receiveStatus`).d('签收状态')}
        visible={signVisible}
        footer={null}
        width={800}
        onCancel={this.handleCloseSign}
      >
        <Table
          bordered
          loading={fetchSignLoading}
          rowKey="supplierCompanyCode"
          dataSource={signRecord}
          columns={columns}
          pagination={signPagination}
          onChange={(page) => this.fetchSignRecord(page)}
        />
      </Modal>
    );
  }
}
