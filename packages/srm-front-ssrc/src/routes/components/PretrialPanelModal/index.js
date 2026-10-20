/**
 * 寻源服务 - 预审小组
 * @date: 2020-04-09
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Popover, Table } from 'hzero-ui';

import intl from 'utils/intl';
import { phoneRender } from '@/utils/renderer';

export default class PretrialPanelModal extends PureComponent {
  render() {
    const { loading, visible, dataSource, onHideModal } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.common.account`).d('账号'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.common.realName`).d('名称'),
        dataIndex: 'realName',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.common.duty`).d('职责'),
        dataIndex: 'leaderFlagMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.phone`).d('手机号码'),
        dataIndex: 'phone',
        render: (_, record) => phoneRender(record.internationalTelCodeMeaning, record.phone),
      },
      {
        title: intl.get(`ssrc.common.email`).d('邮箱'),
        dataIndex: 'email',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ];

    return (
      <React.Fragment>
        <Modal
          destroyOnClose
          width="60%"
          visible={visible}
          onCancel={() => onHideModal(false)}
          title={intl.get('ssrc.common.view.title.pretrialPanelMembers').d('预审小组成员')}
          footer={null}
        >
          <Table
            bordered
            loading={loading}
            rowKey="prequalMemberId"
            dataSource={dataSource}
            columns={columns}
            pagination={false}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
