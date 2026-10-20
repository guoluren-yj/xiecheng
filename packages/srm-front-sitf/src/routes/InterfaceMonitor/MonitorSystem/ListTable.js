/**
 * ListTable - 系统监控 - 数据维护表格
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form } from 'hzero-ui';
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
    const { onClearMonitorSystem } = this.props;
    if (onClearMonitorSystem) {
      onClearMonitorSystem(record);
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

  @Bind()
  setTenantName(record = {}, rowRecord = {}) {
    const { $form } = rowRecord;
    $form.registerField('tenantName');
    $form.setFieldsValue({
      tenantName: record.tenantName,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onSearch, history, key } = this.props;
    const prefix = 'sitf.interfaceMonitor.model.interfaceMonitor';
    const columns = [
      {
        title: intl.get('entity.tenant.name').d('租户名称'),
        dataIndex: 'tenantId',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`tenantId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.tenant.name').d('租户名称'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <Lov
                  code="SITF.MONITOR_SYSTEM.TENANT"
                  textValue={record.tenantName}
                  onChange={(_, data) => this.setTenantName(data, record)}
                />
              )}
            </Form.Item>
          ) : (
            record.tenantName
          ),
      },
      {
        title: intl.get(`${prefix}.externalSystemName`).d('外部系统名称'),
        dataIndex: 'externalSystemName',
        width: 150,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`externalSystemCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.externalSystemName`).d('外部系统名称'),
                    }),
                  },
                ],
                initialValue: record.uomTypeCode,
              })(
                <Lov
                  code="SITF.MONITOR_ES"
                  disabled={
                    !(
                      record.$form &&
                      record.$form.getFieldValue('tenantId') !== undefined &&
                      record.$form.getFieldValue('tenantId') !== null
                    )
                  }
                  textValue={record.externalSystemName}
                  queryParams={{
                    relationDataId: record.$form && record.$form.getFieldValue('tenantId'),
                  }}
                />
              )}
            </Form.Item>
          ) : (
            record.externalSystemName
          ),
      },
      {
        title: intl.get(`${prefix}.externalSystemCode`).d('外部系统代码'),
        dataIndex: 'externalSystemCode',
        width: 200,
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
        width: 230,
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
              <span className="action-link">
                <a
                  onClick={() => {
                    history.push(
                      `/sitf/interface-monitor/monitor-interface-setting?monitorSystemId=${record.monitorSystemId}`
                    );
                  }}
                >
                  {intl
                    .get('sitf.interfaceMonitor.view.message.menu.monitorInterface')
                    .d('监控接口配置')}
                </a>
                <a
                  onClick={() => {
                    history.push(
                      `/sitf/interface-monitor/notice-receiver?monitorSystemId=${record.monitorSystemId}`
                    );
                  }}
                >
                  {intl
                    .get('sitf.interfaceMonitor.view.message.menu.noticeReceiver')
                    .d('监控联系人配置')}
                </a>
              </span>
            );
          }
        },
      },
    ];
    return (
      <Fragment>
        <EditTable
          bordered
          key={key}
          rowKey="monitorSystemId"
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
