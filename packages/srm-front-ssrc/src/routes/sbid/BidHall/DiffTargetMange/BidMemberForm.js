/**
 * CalibrationManagementYes - 寻源服务/询价大厅-分标段定标管理
 * @date: 2018-12-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Modal, Popover } from 'hzero-ui';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { phoneRender } from '@/utils/renderer';

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall'] })
export default class BidMemberForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      form,
      editBidMembersFlag,
      bidMembersList,
      onMembersCancel,
      fetchBidMembersLoading,
    } = this.props;
    const { getFieldDecorator } = form;
    const columnsBidMember = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidRole`).d('招标角色'),
        dataIndex: 'bidRoleMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.userName`).d('用户名'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.designation`).d('名称'),
        dataIndex: 'userName',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`hzero.common.email`).d('邮箱'),
        dataIndex: 'email',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.phone`).d('电话'),
        dataIndex: 'phone',
        render: (_, record) => phoneRender(record.internationalTelCodeMeaning, record.phone),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.openbidPassword`).d('启用开标密码'),
        dataIndex: 'passwordFlag',
        width: 120,
        render: (val) => (
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('passwordFlag', {
              initialValue: val,
            })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
          </Form.Item>
        ),
      },
    ];

    return (
      <Modal
        width="68%"
        visible={editBidMembersFlag}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{intl.get(`ssrc.bidHall.view.message.modal.bidMembers`).d('招标小组')}</span>
          </div>
        }
        footer={null}
        onCancel={onMembersCancel}
      >
        <EditTable
          bordered
          rowKey="bidMemberId"
          loading={fetchBidMembersLoading}
          columns={columnsBidMember}
          dataSource={bidMembersList}
          pagination={false}
        />
      </Modal>
    );
  }
}
