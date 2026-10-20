/**
 * CommonModal - 电商账号管理 - 支付方式
 * @date: 2019-8-28
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { Modal, Form, Button, Select } from 'hzero-ui';

import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';

import styles from './CommonModal.less';

/**
 * 支付方式
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element
 */

export default class CommonModal extends React.Component {
  /**
   * 点击取消关闭模态框
   */
  @Bind()
  cancelHandle() {
    const { onCloseCommonModal } = this.props;
    onCloseCommonModal();
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { onCreate } = this.props;
    onCreate();
  }

  /**
   * 删除
   */
  @Bind()
  handleRemove(commonSelectedRowKeys) {
    const { onDelete } = this.props;
    onDelete(commonSelectedRowKeys);
  }

  /**
   * 保存
   */
  @Bind()
  handleSave(record) {
    const { onSave } = this.props;
    onSave(record);
  }

  /**
   * select改变回调
   */
  @Bind()
  handleSelectOnChange(value, record) {
    record.$form.setFieldsValue({ valueCode: value });
  }

  render() {
    const {
      commonModalVisible,
      commonData = [],
      loading,
      commonSelectedRowKeys = [],
      commonRowSelection,
      modalTitle,
      mapStatusList = [],
    } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.code').d('编号'),
        dataIndex: 'valueCode',
        width: 60,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('valueCode', {
                initialValue: val,
                rules: [
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.common.model.code').d('编号'),
                    }),
                  },
                ],
              })(<span>{record.$form.getFieldValue('valueCode')}</span>)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('scec.common.model.name').d('名称'),
        dataIndex: 'valueName',
        width: 80,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('name', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.common.model.name').d('名称'),
                    }),
                  },
                ],
              })(
                <Select
                  style={{ width: 120 }}
                  allowClear
                  onChange={(value, data) => {
                    record.$form.setFieldsValue({
                      valueName: value && data.props.children,
                    });
                    this.handleSelectOnChange(value, record);
                  }}
                >
                  {mapStatusList.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
              {record.$form.getFieldDecorator('valueName', { initialValue: val })}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('scec.common.model.enabledFlag').d('状态'),
        dataIndex: 'enabledFlag',
        width: 60,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('enabledFlag', {
                initialValue: val,
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    return (
      <div className={styles.accountManagement}>
        <Modal
          destroyOnClose
          footer={null}
          title={`${modalTitle}`}
          // visible
          visible={commonModalVisible}
          width={520}
          onCancel={this.cancelHandle}
        >
          <EditTable
            rowKey="valueId"
            resizable={false}
            loading={loading}
            columns={columns}
            dataSource={commonData}
            pagination={false}
            rowSelection={commonRowSelection}
          />
          <div className={styles['ladder-lever']}>
            <Form layout="inline" style={{ paddingTop: '12px' }}>
              <Button
                type="primary"
                style={{ margin: '0px 24px 0px 8px' }}
                onClick={() => this.handleAdd()}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button onClick={() => this.handleSave()}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                onClick={() => this.handleRemove(commonSelectedRowKeys)}
                disabled={commonSelectedRowKeys.length === 0}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}
