/**
 * ListTable - 监控提醒字段配置 - 数据维护表格
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

export default class ListTable extends PureComponent {
  /**
   * 清除新数据
   * @param {Object} record 行数据
   */
  @Bind()
  clearNewAddRow(record) {
    const { onClearNoticeFields } = this.props;
    if (onClearNoticeFields) {
      onClearNoticeFields(record);
    }
  }

  /**
   * 勾选改变函数
   */
  @Bind()
  onChangeCheckbox(record = {}) {
    const { onStoreChangedRows } = this.props;
    if (onStoreChangedRows && record._status !== 'create') {
      onStoreChangedRows(record);
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onSearch, key } = this.props;
    const prefix = 'sitf.interfaceMonitor.model.interfaceMonitor';
    const columns = [
      {
        title: intl.get('entity.interface.name').d('接口名称'),
        dataIndex: 'interfaceId',
        width: 150,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`interfaceId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.interface.name').d('接口名称'),
                    }),
                  },
                ],
                initialValue: record.interfaceId,
              })(<Lov code="SITF.INTERFACE" textValue={record.interfaceName} />)}
            </Form.Item>
          ) : (
            record.interfaceName
          ),
      },
      {
        title: intl.get('entity.interface.code').d('接口代码'),
        dataIndex: 'interfaceCode',
        width: 200,
      },
      {
        title: intl.get(`${prefix}.fieldName`).d('字段名称'),
        dataIndex: 'fieldName',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`fieldName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.fieldName`).d('字段名称'),
                    }),
                  },
                ],
                initialValue: val,
              })(<Input trim inputChinese={false} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.fieldDesc`).d('字段描述'),
        dataIndex: 'fieldDesc',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`fieldDesc`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.fieldDesc`).d('字段描述'),
                    }),
                  },
                ],
                initialValue: val,
              })(<Input trim />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.orderSeq`).d('字段排序'),
        dataIndex: 'orderSeq',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`orderSeq`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.orderSeq`).d('字段排序'),
                    }),
                  },
                ],
                initialValue: val,
              })(<InputNumber min={0} max={9999999} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'left',
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form &&
                record.$form.getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                })(<Checkbox onChange={() => this.onChangeCheckbox(record)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'left',
        render: (_, record) => {
          if (record._status === 'create') {
            return (
              <a onClick={() => this.clearNewAddRow(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            );
          } else {
            return (
              <span style={{ color: '#ddd' }}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </span>
            );
          }
        },
      },
    ];
    return (
      <Fragment>
        <EditTable
          key={key}
          bordered
          rowKey="fieldId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={page => onSearch(page)}
        />
      </Fragment>
    );
  }
}
