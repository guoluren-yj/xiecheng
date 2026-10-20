/**
 * bidHall - 确认中标候选人 - 招标小组Modal
 * @date: 2019-07-02
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Modal, Popover, Table } from 'hzero-ui';
import { sum, isNumber } from 'lodash';

import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import CPopover from '@/routes/sbid/components/CPopover';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall'] })
export default class BidMembersModal extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      match,
      bidMembersModalVisible,
      bidMembersList,
      loading,
      handleMembersCancel,
    } = this.props;
    const pathFrom = match.path === '/pub/ssrc/expert-scoring/workflow/bid/:sourceHeaderId';

    const columnsBidMember = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidRole`).d('招标角色'),
        dataIndex: 'bidRoleMeaning',
        width: 120,
        render: val => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.userName`).d('用户名'),
        dataIndex: 'loginName',
        width: 150,
        render: val => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.designation`).d('名称'),
        dataIndex: 'userName',
        width: 150,
        render: val => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`hzero.common.email`).d('邮箱'),
        dataIndex: 'email',
        width: 200,
        render: val => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.phone`).d('电话'),
        dataIndex: 'phone',
        width: 150,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.openbidPassword`).d('启用开标密码'),
        dataIndex: 'passwordFlag',
        width: 120,
        render: (val, record) =>
          pathFrom ? (
            <Checkbox checked={record.passwordFlag} disabled />
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('passwordFlag', {
                initialValue: record.passwordFlag,
              })(<Checkbox checked={record.passwordFlag} disabled />)}
            </FormItem>
          ),
      },
    ];

    const scrollX = sum(columnsBidMember.map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Modal
        width="68%"
        visible={bidMembersModalVisible}
        title={<span>{intl.get(`ssrc.bidHall.view.message.modal.bidMembers`).d('招标小组')}</span>}
        footer={null}
        onCancel={handleMembersCancel}
      >
        {pathFrom ? (
          <Table
            bordered
            loading={loading}
            columns={columnsBidMember}
            scroll={{ x: scrollX }}
            dataSource={bidMembersList}
            pagination={false}
          />
        ) : (
          <EditTable
            bordered
            rowKey="bidMemberId"
            loading={loading}
            columns={columnsBidMember}
            scroll={{ x: scrollX }}
            dataSource={bidMembersList}
            pagination={false}
          />
        )}
      </Modal>
    );
  }
}
