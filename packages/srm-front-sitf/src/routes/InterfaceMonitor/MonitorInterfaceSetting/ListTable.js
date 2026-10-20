/**
 * ListTable - 监控接口配置 - 数据维护表格
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

export default class ListTable extends PureComponent {
  /**
   * 清除新数据
   * @param {Object} record 行数据
   */
  @Bind()
  clearNewAddRow(record) {
    const { onClearMonitorInterfaceSetting } = this.props;
    if (onClearMonitorInterfaceSetting) {
      onClearMonitorInterfaceSetting(record);
    }
  }

  /**
   * 勾选改变事件
   * @param {Object} record 行数据
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
    const {
      loading,
      dataSource,
      pagination,
      onSearch,
      externalSystemCode,
      tenant,
      key,
    } = this.props;
    const prefix = 'sitf.monitorInterfaceSetting.model.monitorInterfaceSetting';
    const columns = [
      {
        title: intl.get('entity.interface.name').d('接口名称'),
        dataIndex: 'interfaceId',
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
              })(
                <Lov
                  code="SITF.ES_INTERFACES"
                  textValue={record.interfaceName}
                  queryParams={{ externalSystemCode, tenant }}
                />
              )}
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
        title: intl.get(`${prefix}.maxErrorTimes`).d('最大错误次数'),
        dataIndex: 'maxErrorTimes',
        align: 'left',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`maxErrorTimes`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.maxErrorTimes`).d('最大错误次数'),
                    }),
                  },
                ],
                initialValue: val,
              })(<InputNumber min={0} max={999999999} />)}
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
          rowKey="monitorInterfaceId"
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
