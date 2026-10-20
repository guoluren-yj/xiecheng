import React, { PureComponent } from 'react';
import { Form, Input } from 'hzero-ui';
import classnames from 'classnames';

import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';

import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { enableRender, operatorRender, yesOrNoRender } from 'utils/renderer';
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

  render() {
    const {
      rowKey,
      dataSource,
      loading,
      pagination,
      onSearch,
      tenantId,
      rowSelection,
      commonSourceCode,
      customizeTable,
    } = this.props;

    const columns = [
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.ouCode').d('业务实体编码'),
        width: 150,
        align: 'left',
        dataIndex: 'ouCode',
        render: (value, record) => {
          if (record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('ouCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.operationUnit.model.operationUnit.ouCode')
                          .d('业务实体编码'),
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
                  initialValue: record.ouCode,
                })(<Input trim inputChinese={false} />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.ouName').d('业务实体名称'),
        dataIndex: 'ouName',
        width: 200,
        render: (value, record) => {
          if (
            record.sourceCode === commonSourceCode &&
            (record._status === 'create' || record._status === 'update')
          ) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('ouName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.operationUnit.model.operationUnit.ouName')
                          .d('业务实体名称'),
                      }),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                  initialValue: record.ouName,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        width: 200,
        align: 'left',
        dataIndex: 'companyId',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('companyId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.company.tag').d('公司'),
                      }),
                    },
                  ],
                  initialValue: record.companyId,
                })(
                  <Lov
                    code="SPFM.OPERATION_UNIT.COMPANY"
                    queryParams={{ tenantId, enabledFlag: 1 }}
                    textValue={record.companyName}
                  />
                )}
              </FormItem>
            );
          } else {
            return record.companyName;
          }
        },
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.isPublic').d('是否公开'),
        width: 80,
        align: 'center',
        dataIndex: 'isPublic',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('isPublic', {
                  initialValue: record.isPublic ? 1 : 0,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return yesOrNoRender(value);
          }
        },
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.sourceCode').d('数据来源'),
        width: 100,
        align: 'center',
        dataIndex: 'sourceCode',
        render: (value, record) => (record._status === 'create' ? commonSourceCode : value),
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.externalSystemCode').d('来源系统'),
        width: 100,
        align: 'center',
        dataIndex: 'externalSystemCode',
        render: (value, record) => (record._status === 'create' ? commonSourceCode : value),
      },
      {
        title: intl
          .get('hpfm.operationUnit.model.operationUnit.assignProOrganization')
          .d('分配采购组织'),
        width: 150,
        align: 'center',
        dataIndex: 'assignProOrganization',
        render: (_, record) => {
          if (record._status !== 'create') {
            return (
              <a onClick={() => this.props.onAssignOrgModal(record)}>
                {intl
                  .get('hpfm.operationUnit.model.operationUnit.assignProOrganization')
                  .d('分配采购组织')}
              </a>
            );
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        align: 'center',
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
        align: 'center',
        width: 100,
        dataIndex: 'action',
        render: (val, record) => {
          const operators = [
            record._status === 'update' && {
              key: 'cancel',
              ele: (
                <a onClick={() => this.cancelRow(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.cancel').d('取消'),
            },
            record._status !== 'create' &&
              record._status !== 'update' && {
                key: 'edit',
                ele: (
                  <a onClick={() => this.editRow(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.edit').d('编辑'),
              },
            record._status === 'create' && {
              key: 'edit',
              ele: (
                <a onClick={() => this.deleteRow(record)}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.delete').d('删除'),
            },
          ];
          return operatorRender(operators.filter(Boolean));
        },
      },
    ];

    return customizeTable(
      {
        code: 'SPFM_ORG-INFO_OPERATION-UNIT.LIST',
      },
      <EditTable
        bordered
        className={classnames(styles['db-list'])}
        loading={loading}
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onSearch}
        rowSelection={rowSelection}
      />
    );
  }
}
