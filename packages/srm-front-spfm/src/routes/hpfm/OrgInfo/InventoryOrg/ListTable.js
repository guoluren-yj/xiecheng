/**
 * InventoryOrg -库存组织页面 -表格部分
 * @date: 2018-11-5
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.3
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Input, Select } from 'hzero-ui';
import classnames from 'classnames';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import { Button as ButtonPermission } from 'components/Permission';

import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import { CODE, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

import styles from '../index.less';

export default class ListTable extends Component {
  render() {
    const {
      pagination = {},
      fetchInventoryData = {},
      match,
      iddList = [],
      fetchInventoryDataLoading,
      getOrganizationId,
      onFetchInventory,
      onHandleCancelOrg,
      onHandleOrgEdit,
      commonSourceCode,
      customizeTable,
      rowSelection,
      inventotyOrgRemote,
    } = this.props;
    const columns = [
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.organizationCode').d('库存组织编码'),
        dataIndex: 'organizationCode',
        width: 150,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('organizationCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.inventoryOrg.model.inventoryOrg.organizationCode')
                          .d('库存组织编码'),
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
                  initialValue: val,
                })(<Input trim inputChinese={false} disabled={record.organizationCode} />)}
              </Form.Item>
            );
          }
          return val;
        },
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.organizationName').d('库存组织名称'),
        dataIndex: 'organizationName',
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('organizationName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.inventoryOrg.model.inventoryOrg.organizationName')
                          .d('库存组织名称'),
                      }),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                  initialValue: val,
                })(<Input disabled={record.sourceCode !== commonSourceCode} />)}
              </Form.Item>
            );
          }
          return val;
        },
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.ouId').d('业务实体'),
        dataIndex: 'ouId',
        width: 150,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('ouId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.inventoryOrg.model.inventoryOrg.ouId').d('业务实体'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    textValue={record.ouName || ''}
                    disabled={record.sourceCode !== commonSourceCode}
                    style={{ width: '100%' }}
                    queryParams={{ organizationId: getOrganizationId }}
                    code="HPFM.OU"
                  />
                )}
              </Form.Item>
            );
          }
          return record.ouName;
        },
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.postalCodeAddress').d('邮编地址'),
        dataIndex: 'postalCode',
        width: 150,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('postalCode', {
                  initialValue: val,
                })(<Input disabled={record.sourceCode !== commonSourceCode} />)}
              </Form.Item>
            );
          }
          return val;
        },
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.consignee').d('收货人'),
        dataIndex: 'recipientUserId',
        width: 150,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('recipientUserId', {
                  initialValue: val,
                })(
                  <Lov
                    textValue={record.recipientUserName || ''}
                    disabled={record.sourceCode !== commonSourceCode}
                    style={{ width: '100%' }}
                    code="HIAM.TENANT.USER"
                    onChange={(_, lovRecord) => {
                      const { internationalTelCode, phoneText } = lovRecord || {};
                      record.$form.setFieldsValue({
                        recipientPhone: phoneText,
                        internationalTelCode: internationalTelCode || '+86',
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          }
          return record.recipientUserName;
        },
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.consigneePhone').d('收货人电话'),
        dataIndex: 'recipientPhone',
        align: 'left',
        width: 300,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`recipientPhone`, {
                initialValue: val,
                rules: [
                  {
                    pattern:
                      record.$form.getFieldValue('internationalTelCode') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机号码格式不正确'),
                  },
                ],
              })(
                <Input
                  addonBefore={record.$form.getFieldDecorator('internationalTelCode', {
                    initialValue: record.internationalTelCode || '+86',
                  })(
                    <Select onChange={() => record.$form.setFieldsValue({ recipientPhone: null })}>
                      {iddList.map((item) => (
                        <Select.Option value={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                />
              )}
            </Form.Item>
          ) : record.internationalTelMeaning && val ? (
            `${record.internationalTelMeaning} | ${val}`
          ) : null,
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.address').d('地址信息'),
        dataIndex: 'address',
        width: 150,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('address', {
                  initialValue: val,
                })(<Input disabled={record.sourceCode !== commonSourceCode} />)}
              </Form.Item>
            );
          }
          return val;
        },
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.sourceCode').d('数据来源'),
        width: 100,
        align: 'center',
        dataIndex: 'sourceCode',
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.externalSystemCode').d('来源系统'),
        width: 100,
        align: 'center',
        dataIndex: 'externalSystemCode',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                  valuePropName: 'checked',
                })(<Checkbox />)}
              </Form.Item>
            );
          }
          return <span>{enableRender(val)}</span>;
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 80,
        align: 'center',
        render: (val, record) => {
          if (record._status === 'create') {
            return (
              <span className="action-link">
                <a onClick={() => onHandleCancelOrg(record)}>
                  {intl.get('hzero.common.button.clean').d('清除')}
                </a>
              </span>
            );
          }
          if (record._status === 'update') {
            return (
              <span className="action-link">
                <a onClick={() => onHandleOrgEdit(record, false)}>
                  {intl.get('hzero.common.status.cancel').d('取消')}
                </a>
              </span>
            );
          }
          return (
            <span className="action-link">
              <ButtonPermission
                type="text"
                permissionList={[
                  {
                    code: `${match.path}.button.edit`,
                    type: 'button',
                    meaning: '库存组织-编辑',
                  },
                ]}
                onClick={() => onHandleOrgEdit(record, true)}
              >
                {intl.get('hzero.common.status.edit').d('编辑')}
              </ButtonPermission>
            </span>
          );
        },
      },
    ];
    const cuxColumns = inventotyOrgRemote?.process('SPFM_ORGINFO_INVENTOTYORG_COLS', columns, { ...(this.props) }) || columns;
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SPFM_ORG-INFO_INVENTORYORG.LIST',
          },
          <EditTable
            bordered
            loading={fetchInventoryDataLoading}
            rowKey="organizationId"
            className={classnames(styles['db-list'])}
            dataSource={fetchInventoryData.content || []}
            columns={cuxColumns}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={(page) => onFetchInventory(page)}
          />
        )}
      </Fragment>
    );
  }
}
