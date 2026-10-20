import React, { PureComponent } from 'react';
import { Form, Input, Popconfirm } from 'hzero-ui';
import classnames from 'classnames';

import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { CODE } from 'utils/regExp';

import styles from '../index.less';

const FormItem = Form.Item;

export default class ListTable extends PureComponent {
  /**
   * 保存当前行
   * @param {Object} record - 当前行数据
   */
  @Bind()
  handleSave(record) {
    this.props.onSave(record);
  }

  /**
   * 编辑当前行
   * @param {Object} record - 当前行数据
   */
  @Bind()
  editRow(record) {
    this.props.onEdit(record);
  }

  /**
   * 删除当前行
   * @param {Object} record - 当前行数据
   */
  @Bind()
  deleteRow(record) {
    this.props.onDelete(record);
  }

  /**
   * 取消编辑当前行
   * @param {Object} record - 当前行数据
   */
  @Bind()
  cancelRow(record) {
    this.props.onCancel(record);
  }

  @Bind()
  onSelectUser(record) {
    this.props.onSelectUser(record);
  }

  render() {
    const {
      rowKey,
      dataSource,
      loading,
      pagination,
      onSearch,
      commonSourceCode,
      customizeTable,
      rowSelection,
    } = this.props;

    const columns = [
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.purchaseAgentCode').d('采购员编码'),
        width: 120,
        dataIndex: 'purchaseAgentCode',
        render: (value, record) => {
          if (record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('purchaseAgentCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.purchaseAgent.model.purchaseAgent.purchaseAgentCode')
                          .d('采购员编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                    {
                      pattern: CODE,
                      message: intl
                        .get('hzero.common.validation.code')
                        .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                    },
                  ],
                  initialValue: record.purchaseAgentCode,
                })(<Input trim inputChinese={false} />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.purchaseAgentName').d('采购员名称'),
        dataIndex: 'purchaseAgentName',
        render: (value, record) => {
          if (
            record.sourceCode === commonSourceCode &&
            (record._status === 'create' || record._status === 'update')
          ) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('purchaseAgentName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.purchaseAgent.model.purchaseAgent.purchaseAgentName')
                          .d('采购员名称'),
                      }),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                  initialValue: record.purchaseAgentName,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.officePhone').d('办公电话'),
        width: 120,
        dataIndex: 'officePhone',
        render: (value, record) => {
          if (
            // record.sourceCode === commonSourceCode &&
            record._status === 'create' ||
            record._status === 'update'
          ) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('officePhone', {
                  initialValue: record.officePhone,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.contactInfo').d('联系方式'),
        width: 120,
        dataIndex: 'contactInfo',
        render: (value, record) => {
          if (
            // record.sourceCode === commonSourceCode &&
            record._status === 'create' ||
            record._status === 'update'
          ) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('contactInfo', {
                  initialValue: record.contactInfo,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.extensionPhone').d('分机号'),
        width: 120,
        dataIndex: 'extensionPhone',
        render: (value, record) => {
          if (
            // record.sourceCode === commonSourceCode &&
            record._status === 'create' ||
            record._status === 'update'
          ) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('extensionPhone', {
                  initialValue: record.extensionPhone,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.fax').d('传真'),
        width: 120,
        dataIndex: 'fax',
        render: (value, record) => {
          if (
            // record.sourceCode === commonSourceCode &&
            record._status === 'create' ||
            record._status === 'update'
          ) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('fax', {
                  initialValue: record.fax,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.faxExtension').d('传真分机号'),
        width: 120,
        dataIndex: 'faxExtension',
        render: (value, record) => {
          if (
            // record.sourceCode === commonSourceCode &&
            record._status === 'create' ||
            record._status === 'update'
          ) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('faxExtension', {
                  initialValue: record.faxExtension,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.sourceCode').d('数据来源'),
        width: 100,
        dataIndex: 'sourceCode',
        render: (value, record) => (record._status === 'create' ? commonSourceCode : value),
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.externalSystemCode').d('来源系统'),
        width: 100,
        dataIndex: 'externalSystemCode',
        render: (value, record) => (record._status === 'create' ? commonSourceCode : value),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag ? 1 : 0,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return enableRender(value);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        dataIndex: 'action',
        fixed: 'right',
        render: (val, record) => (
          <span className="action-link">
            {record._status === 'update' && (
              <a onClick={() => this.cancelRow(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <React.Fragment>
                <a onClick={() => this.onSelectUser(record)}>
                  {intl.get('hpfm.purchaseAgent.model.purchaseAgent.userId').d('指定用户')}
                </a>
                <a onClick={() => this.editRow(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </React.Fragment>
            )}
            {record._status === 'create' && (
              <Popconfirm
                title={intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?')}
                onConfirm={() => this.deleteRow(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            )}
          </span>
        ),
      },
    ];
    return customizeTable(
      {
        code: 'SPFM_ORG-INFO_PURCHASEAGENT.LIST',
      },
      <EditTable
        bordered
        className={classnames(styles['db-list'])}
        loading={loading}
        rowKey={rowKey}
        scroll={{ x: tableScrollWidth(columns) }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onSearch}
        rowSelection={rowSelection}
      />
    );
  }
}
