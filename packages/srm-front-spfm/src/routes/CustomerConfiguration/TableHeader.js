/**
 * LedgerAccount  客户配置表
 * @date: 2020-07-17
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.1.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Form, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { tableScrollWidth } from 'utils/utils';

/**
 * 租户期间定义数据展示组件
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChangeFlag - 行编辑
 * @reactProps {Function} onCleanLine - 行清除操作
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Array} dataSource - table数据源
 * @reactProps {object} pagination - 分页器
 * @reactProps {object} [pagination.current] - 当前页码
 * @reactProps {object} [pagination.pageSize] - 分页大小
 * @reactProps {object} [pagination.total] - 数据总量
 * @return React.element
 */
export default class ListTable extends PureComponent {
  @Bind()
  async handleSave(record) {
    const { handleEnalbed } = this.props;
    record.$form.validateFields((err) => {
      if (!err) {
        handleEnalbed(record, 'save');
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dataSource,
      pagination,
      loading,
      onSearch,
      handleEnalbed,
      handleUpdateState,
      selectedRowKeys,
      onSelectRows,
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfm.customerConfiguration.view.message.tenantNum`).d('租户编码'),
        dataIndex: 'tenantId',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item style={{ display: 'inline-block', marginBottom: 0 }}>
              {record.$form.getFieldDecorator('tenantId', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.customerConfiguration.view.message.tenantNum`)
                        .d('租户编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HPFM.TENANT"
                  // textValue={record.tenantNum}
                  onChange={(_, vals) =>
                    handleUpdateState(record, {
                      tenantId: vals.tenantId,
                      tenantNum: vals.tenantNum,
                      tenantName: vals.tenantName,
                    })
                  }
                />
              )}
            </Form.Item>
          ) : (
            record.tenantNum
          ),
      },
      {
        title: intl.get(`spfm.customerConfiguration.view.message.tenantName`).d('租户名称'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get(`spfm.customerConfiguration.view.message.loginName`).d('子账户编码'),
        dataIndex: 'loginName',
        width: 150,
        render: (val, record) => {
          const { tenantId, $form } = record;
          return ['create', 'update'].includes(record._status) &&
            (tenantId || $form.getFieldValue('tenantId')) ? (
            <Form.Item style={{ display: 'inline-block', marginBottom: 0 }}>
              {record.$form.getFieldDecorator('loginName', {
                initialValue: val,
                rules: [
                  {
                    required: record.$form.getFieldValue('enabledCloopmFlag') === 1,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.customerConfiguration.view.message.loginName`)
                        .d('子账户编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPFM.CUST_SERVICE_ACCOUNT"
                  textValue={record.loginName}
                  queryParams={{ tenantId: record.tenantId }}
                  onChange={(_, vals) =>
                    handleUpdateState(record, {
                      loginName: vals.loginName,
                      realName: vals.realName,
                      userId: vals.userId,
                    })
                  }
                  lovOptions={{ displayField: 'loginName', valueField: 'loginName' }}
                />
              )}
            </Form.Item>
          ) : (
            record.loginName
          );
        },
      },
      {
        title: intl.get(`spfm.customerConfiguration.view.message.realName`).d('子账户名称'),
        dataIndex: 'realName',
        width: 150,
      },
      // {
      //   title: intl.get(`spfm.customerConfiguration.view.message.cloopmAccount`).d('燕千云账号'),
      //   dataIndex: 'cloopmAccount',
      //   width: 150,
      //   render: (val, record) =>
      //     ['create', 'update'].includes(record._status) ? (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator(`cloopmAccount`, {
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get(`spfm.customerConfiguration.view.message`).d('燕千云账号'),
      //               }),
      //             },
      //             {
      //               max: 24,
      //               message: intl.get('hzero.common.validation.max', {
      //                 max: 24,
      //               }),
      //             },
      //           ],
      //           initialValue: val,
      //         })(<Input trim inputChinese={false} typeCase="upper" />)}
      //       </Form.Item>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl
          .get('spfm.customerConfiguration.view.message.partnerEnable')
          .d('合作伙伴是否启用'),
        dataIndex: 'partnerFlag',
        width: 180,
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`partnerFlag`, {
                initialValue: val === 1 ? 1 : 0,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
            </Form.Item>
          ) : val === 1 ? (
            intl.get('hzero.common.status.yes').d('是')
          ) : (
            intl.get('hzero.common.status.no').d('否')
          ),
      },
      {
        title: intl.get('hzero.common.status.enableOnlienService').d('启用在线客服'),
        dataIndex: 'enabledFlag',
        width: 150,
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: val === 1 ? 1 : 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  // onChange={() => record.$form.setFieldsValue({ enabledCloopmFlag: 0 })}
                  // disabled={record.$form.getFieldValue('enabledCloopmFlag') === 1}
                />
              )}
            </Form.Item>
          ) : val === 1 ? (
            intl.get('hzero.common.status.yes').d('是')
          ) : (
            intl.get('hzero.common.status.no').d('否')
          ),
      },
      {
        title: intl.get('hzero.common.status.enableOnlienIssue').d('启用在线提单'),
        dataIndex: 'enabledCloopmFlag',
        width: 150,
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`enabledCloopmFlag`, {
                initialValue: val === 1 ? 1 : 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  // onChange={() => record.$form.setFieldsValue({ enabledFlag: 0 })}
                  // disabled={record.$form.getFieldValue('enabledFlag') === 1}
                />
              )}
            </Form.Item>
          ) : val === 1 ? (
            intl.get('hzero.common.status.yes').d('是')
          ) : (
            intl.get('hzero.common.status.no').d('否')
          ),
      },
      {
        title: intl.get('spfm.customerConfiguration.model.importState').d('导入状态'),
        dataIndex: 'importStateMeaning',
        width: 100,
        align: 'left',
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            if (record.$form.getFieldValue('enabledCloopmFlag') === 1) {
              return (
                val || intl.get('spfm.customerConfiguration.view.message.noImport').d('未导入')
              );
            }
          } else if (record.enabledCloopmFlag === 1) {
            return val || intl.get('spfm.customerConfiguration.view.message.noImport').d('未导入');
          }
          return null;
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'action',
        width: 90,
        align: 'left',
        render: (val, record) => {
          return record._status === 'update' ? (
            <>
              <a onClick={() => this.handleSave(record)} style={{ marginRight: '10px' }}>
                {intl.get('hzero.common.button.save').d('保存')}
              </a>
              <a onClick={() => handleEnalbed(record, 'cancel')}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            </>
          ) : record._status === 'create' ? (
            <a onClick={() => handleEnalbed(record, 'clear')}>
              {intl.get('hzero.common.button.clean').d('清除')}
            </a>
          ) : (
            <a onClick={() => handleEnalbed(record, 'edit')}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const scrollX = tableScrollWidth(columns);
    return (
      <Fragment>
        <EditTable
          bordered
          loading={loading}
          rowKey="custServiceConfigId"
          scroll={{ x: scrollX }}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={(page) => onSearch(page)}
          rowSelection={{
            getCheckboxProps: (record) => ({
              /**
               * importState 值来自 SPFM.CUST_SERVICE.IMPORT_STATE 值集: 0-未导入，1-导入成功，2-导入失败
               * 只有未导入和导入失败状态的数据可以手动同步
               * 在线提单数据才可同步
               */
              disabled:
                record.enabledCloopmFlag !== 1 ||
                ['create', 'update'].includes(record._status) ||
                record.importState === 1,
            }),
            selectedRowKeys,
            onChange: onSelectRows,
          }}
        />
      </Fragment>
    );
  }
}
