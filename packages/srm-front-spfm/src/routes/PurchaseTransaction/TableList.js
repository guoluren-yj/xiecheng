/**
 * PurchaseTransaction -采购事务类型定义 table 表格部分
 * @date: 2018-12-18
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment } from 'react';
import { Form, Input, Checkbox, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber, sum } from 'lodash';

import intl from 'utils/intl';
import TLEditor from 'components/TLEditor';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';

export default class TableList extends React.Component {
  @Bind()
  changeReverse(record = {}) {
    const { onChangeRecordStatus } = this.props;
    const { getFieldValue, resetFields } = record.$form;
    const reverseFlag = getFieldValue('reverseFlag');
    if (reverseFlag) {
      resetFields(['reverseTrxTypeId']);
    }
    onChangeRecordStatus(record, 'reverseFlag');
  }

  render() {
    const {
      dataSource,
      pagination,
      loading,
      onFetchPurchaseTransList,
      onHandleCancelOrg,
      onHandleOrgEdit,
      onChangeRecordStatus,
      businessTypeList = [],
    } = this.props;

    const columns = [
      {
        title: intl.get(`spfm.purchaseTransaction.model.purchase.rcvTrxTypeCode`).d('事务类型代码'),
        dataIndex: 'rcvTrxTypeCode',
        align: 'left',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('rcvTrxTypeCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.purchaseTransaction.model.purchase.rcvTrxTypeCode`)
                          .d('事务类型代码'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Input
                    disabled={!!record.rcvTrxTypeCode}
                    trim
                    inputChinese={false}
                    typeCase="upper"
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spfm.purchaseTransaction.model.purchase.rcvTrxTypeName`).d('事务类型名称'),
        dataIndex: 'rcvTrxTypeName',
        align: 'left',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('rcvTrxTypeName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.purchaseTransaction.model.purchase.rcvTrxTypeName`)
                          .d('事务类型名称'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <TLEditor
                    label={intl
                      .get(`spfm.purchaseTransaction.model.purchase.rcvTrxTypeName`)
                      .d('事务类型名称')}
                    field="rcvTrxTypeName"
                    token={record._token}
                    dbc2sbc={false}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spfm.purchaseTransaction.model.purchase.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        align: 'left',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('businessType', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.purchaseTransaction.model.purchase.businessType`)
                          .d('业务类别'),
                      }),
                    },
                  ],
                  initialValue: record.businessType,
                })(
                  <Select onChange={() => onChangeRecordStatus(record)} style={{ width: '90%' }}>
                    {businessTypeList.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl.get(`spfm.purchaseTransaction.model.purchase.poFlag`).d('采购订单关联标识'),
        dataIndex: 'poFlag',
        width: 130,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('poFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl.get(`spfm.purchaseTransaction.model.purchase.asnFlag`).d('送货单关联标识'),
        dataIndex: 'asnFlag',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('asnFlag', {
                  initialValue: val,
                  valuePropName: 'checked',
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl.get(`spfm.purchaseTransaction.model.purchase.receiveFlag`).d('接收标识'),
        dataIndex: 'receiveFlag',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('receiveFlag', {
                  initialValue: val,
                  valuePropName: 'checked',
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl.get(`spfm.purchaseTransaction.model.purchase.deliverFlag`).d('入库标识'),
        dataIndex: 'deliverFlag',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('deliverFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl
          .get(`spfm.purchaseTransaction.model.purchase.returnToReceiving`)
          .d('退回至接收标识'),
        dataIndex: 'returnToReceivingFlag',
        width: 130,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('returnToReceivingFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl
          .get(`spfm.purchaseTransaction.model.purchase.SupplierFlag`)
          .d('退回至供应商标识'),
        dataIndex: 'returnToSupplierFlag',
        width: 140,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('returnToSupplierFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl.get(`spfm.purchaseTransaction.model.purchase.flag`).d('反冲标识'),
        dataIndex: 'reverseFlag',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('reverseFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={() => this.changeReverse(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl
          .get(`spfm.purchaseTransaction.model.purchase.reverseTypeName`)
          .d('反冲事务类型'),
        dataIndex: 'reverseTrxTypeName',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            const reverseFlag = getFieldValue('reverseFlag');
            return (
              <Form.Item>
                {getFieldDecorator('reverseTrxTypeId', {
                  initialValue: record.reverseTrxTypeId,
                  rules: reverseFlag
                    ? [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`spfm.purchaseTransaction.model.purchase.reverseTypeName`)
                              .d('反冲事务类型'),
                          }),
                        },
                      ]
                    : [],
                })(
                  <Lov
                    code="SPFM.RECEIVE_TRX_TYPE"
                    disabled={!reverseFlag}
                    textValue={reverseFlag ? record.reverseTrxTypeName : ''}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.reverseTrxTypeName;
          }
        },
      },
      {
        title: intl
          .get(`spfm.purchaseTransaction.model.purchase.canCreateBillFlag`)
          .d('允许创建对账单标志'),
        dataIndex: 'canCreateBillFlag',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('canCreateBillFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={() => onChangeRecordStatus(record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        align: 'left',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('remark', {
                  initialValue: val,
                })(<Input onChange={() => onChangeRecordStatus(record)} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        fixed: 'right',
        render: (val, record) => {
          if (record._status === 'create') {
            return (
              <a onClick={() => onHandleCancelOrg(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            );
          } else if (record._status === 'update') {
            return (
              <a onClick={() => onHandleOrgEdit(record, false)}>
                {intl.get('hzero.common.status.cancel').d('取消')}
              </a>
            );
          } else {
            return (
              <a onClick={() => onHandleOrgEdit(record, true)}>
                {intl.get('hzero.common.status.edit').d('编辑')}
              </a>
            );
          }
        },
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Fragment>
        <EditTable
          bordered
          dataSource={dataSource}
          scroll={{ x: scrollX }}
          loading={loading}
          rowKey="rcvTrxTypeId"
          columns={columns}
          pagination={pagination}
          onChange={(page) => onFetchPurchaseTransList(page)}
        />
      </Fragment>
    );
  }
}
