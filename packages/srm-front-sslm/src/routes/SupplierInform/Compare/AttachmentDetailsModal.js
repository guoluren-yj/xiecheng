/**
 * AttachmentDetailsModal -  信息对比 --- 供货能力清单 附件弹框
 * @date: 2020-06-25
 * @author: 杨一昊 <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import moment from 'moment';
import { connect } from 'dva';
import Bind from 'lodash-decorators/bind';
import React, { PureComponent } from 'react';
import { Modal, Input, Form, DatePicker, Spin } from 'hzero-ui';

import { PRIVATE_BUCKET } from '_utils/config';
import { dateTimeRender } from 'utils/renderer';
import Table from 'srm-front-boot/lib/components/EditTable';
import { getAccessToken, getAttachmentUrl } from 'utils/utils';

const FormItem = Form.Item;

@connect(({ supplierInform, user, loading }) => ({
  user,
  supplierInform,
  queryLoading: loading.effects['supplierInform/queryLineAttachmentcontrast'],
}))
export default class AttachmentDetailsModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [], // 选中项的key
      dataSource: [],
    };
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
    this.queryAttachment();
  }

  /**
   * 查询
   */
  @Bind()
  queryAttachment() {
    const { dispatch, abilityLineId, attachment } = this.props;
    dispatch({
      type: 'supplierInform/queryLineAttachmentcontrast',
      payload: {
        abilityLineId,
        compareFlag: attachment === 'old' ? 1 : 2,
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res[`${attachment}SupChangeAbilityLnAtts`],
        });
      }
    });
  }

  render() {
    const { selectedRowKeys, selectedRows, dataSource } = this.state;
    const { isVisible, onCancel, queryLoading } = this.props;
    const columns = [
      {
        title: intl.get('sslm.common.view.attachment.name').d('附件名称'),
        dataIndex: 'attachmentDesc',
        width: 200,
        render: (value, record) => {
          const { attachmentUrl, tenantId } = record;
          const bucketName = PRIVATE_BUCKET;
          const url = getAttachmentUrl(attachmentUrl, bucketName, tenantId);
          return (
            <a href={url} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          );
        },
      },
      {
        title: intl.get('sslm.common.view.attachment.size').d('附件大小(MB)'),
        dataIndex: 'attachmentSize',
        width: 130,
        render: value => {
          if (value) {
            const size = `${value / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.realName`).d('上传人'),
        dataIndex: 'uploadUserName',
        width: 120,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间'),
        dataIndex: 'uploadDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型'),
        width: 150,
        dataIndex: 'attachmentType',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('attachmentType', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.maturityDate`).d('文件到期日'),
        width: 200,
        dataIndex: 'dueDate',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('dueDate', {
                initialValue: val && moment(val),
              })(<DatePicker placeholder="" showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.handleRowSelectChange,
    };

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    return (
      <Modal
        width={900}
        visible={isVisible}
        onCancel={onCancel}
        title={intl.get('hzero.common.upload.modal.title').d('附件')}
        footer={null}
      >
        <Spin spinning={queryLoading}>
          <Table
            bordered
            rowKey="attachmentLineId"
            columns={columns}
            rowSelection={rowSelection}
            dataSource={dataSource}
            pagination={false}
          />
        </Spin>
      </Modal>
    );
  }
}
