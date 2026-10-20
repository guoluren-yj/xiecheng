/**
 * inquiryHall - 寻源服务/询价大厅-定义开标人
 * @date: 2019-10-18
 * @author:  <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Modal } from 'hzero-ui';
// import Checkbox from 'components/Checkbox';
import classNames from 'classnames';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import styles from './index.less';

@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
export default class BidOpenerCartridge extends PureComponent {
  render() {
    const {
      dataSource = [],
      pagination = {},
      bidholderVisible = false,
      onCancel = () => {},
      fetchOpenBidHolder = () => {},
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.loginName`).d('用户名'),
        dataIndex: 'loginName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.realName`).d('名称'),
        dataIndex: 'realName',
        key: 'realName',
        width: 150,
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        dataIndex: 'email',
        key: 'email',
        width: 200,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.telPhone`).d('电话'),
        key: 'phone',
        dataIndex: 'phone',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.passwordFlag`).d('启用开标密码'),
        dataIndex: 'passwordFlag',
        width: 120,
        render: (val) => <span>{enableRender(val)}</span>,
      },
    ];
    return (
      <Modal
        width={800}
        title={intl.get(`ssrc.inquiryHall.view.message.title.onlyViewOpener`).d('查看开标人')}
        visible={bidholderVisible}
        footer={null}
        onCancel={onCancel}
      >
        <Table
          bordered
          rowKey="openPasswordId"
          className={classNames(styles['ssrc-bid-list'])}
          style={{ marginTop: 20 }}
          columns={columns}
          dataSource={dataSource}
          onChange={(page) => fetchOpenBidHolder(page)}
          pagination={pagination}
        />
      </Modal>
    );
  }
}
