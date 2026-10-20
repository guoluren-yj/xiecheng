/**
 * ClientListModal 直连开票规则定义-客户列表弹窗
 * @date: 2019-9-25
 * @author MaoJiaqi <jiaqi.mao@hand-china.com >
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Form, Button } from 'hzero-ui';
import intl from 'utils/intl';

import EditTable from 'components/EditTable';
import Switch from 'components/Switch';

import styles from './index.less';

const modelPrompt = 'spfm.configServer.model.directInvoice';

@Form.create({ fieldNameProp: null })
export default class ClientListModal extends Component {
  render() {
    const {
      visible,
      onCancel,
      dataSource,
      ChangeDetailFormItem,
      handleSaveDetail = e => e,
      directInvoiceRulesDetailsLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.companyNum`).d('客户编码'),
        dataIndex: 'companyNum',
      },
      {
        title: intl.get(`${modelPrompt}.companyName`).d('客户名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`hzero.common.button.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        render: (val, record) => (
          <ChangeDetailFormItem record={record}>
            {record.$form.getFieldDecorator('enabledFlag', {
              initialValue: val,
            })(<Switch />)}
          </ChangeDetailFormItem>
        ),
      },
    ];
    return (
      <Modal
        visible={visible}
        title={intl.get(`${modelPrompt}.enablingCustomers`).d('启用客户')}
        onCancel={onCancel}
        footer={null}
        width={600}
        className={styles['direct-invoice']}
      >
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" style={{ marginBottom: '16px' }} onClick={handleSaveDetail}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
        <EditTable
          columns={columns}
          dataSource={dataSource}
          bordered
          rowKey="rowKey"
          loading={directInvoiceRulesDetailsLoading}
          pagination={false}
        />
      </Modal>
    );
  }
}
