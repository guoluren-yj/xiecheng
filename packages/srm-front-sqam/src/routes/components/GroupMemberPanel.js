/**
 * GroupMemberPanel - 小组成员
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, Spin, Select, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, throttle } from 'lodash';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import Lov from 'components/Lov';
import { yesOrNoRender } from 'utils/renderer';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import remote from 'hzero-front/lib/utils/remote';

const prefix = `sqam.common.model.qualityRectification`;
@remote({
  code: 'SQAM_GROUP_MEMBER_PANEL',
  name: 'remote',
})
export default class GroupMemberPanel extends Component {
  /**
   * 行操作
   * @param {array} selectedRowKeys - 选中行Rowkey
   */
  @Bind()
  handleRowSelect(selectedRowKeys, selectedRows) {
    this.props.onSelectRow(selectedRowKeys, selectedRows);
  }

  phoneBefore = (record, idd, preName, name) => {
    const { getFieldDecorator, setFields, getFieldValue } = record.$form;
    return getFieldDecorator(preName, {
      initialValue: record[preName] || (idd[0] && idd[0].value) || '+86',
    })(
      <Select
        onChange={(value) => {
          const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
          setFields({
            [name]: {
              value: getFieldValue(name),
              errors: !testReg.test(getFieldValue(name))
                ? [new Error(intl.get('hzero.common.validation.phone').d('手机号码格式不正确'))]
                : null,
            },
          });
        }}
      >
        {idd.map((item) => (
          <Select.Option value={item.value}>{item.meaning}</Select.Option>
        ))}
      </Select>
    );
  };

  render() {
    const { participateNode = [], camp = [], idd = [] } = this.props;
    const {
      readOnly = true,
      required,
      selectedRowKeys = [],
      selectedRowsMember = [],
      groupMember,
      onAdd = (e) => e,
      onRemove = (e) => e,
      onChangeLeader = (e) => e,
      loading = {},
      isSuppiler = false,
      basicInfo,
      customizeTable,
      code,
      custLoading,
      deleteLoading,
      remote: remoteProps,
      match,
    } = this.props;

    const cols = [
      {
        title: intl.get(`${prefix}.representor`).d('代表方'),
        dataIndex: 'campMeaning',
        align: 'center',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`camp`, {
                initialValue: record.camp || (isSuppiler ? 'SUPPLIER' : 'PURCHASER'),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.representor`).d('代表方'),
                    }),
                  },
                ],
              })(
                <Select
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    const { setFieldsValue, getFieldValue } = record.$form;
                    setFieldsValue({
                      emailFlag: value === 'SUPPLIER' ? 1 : 0,
                      visibleFlag: value === 'PURCHASER' ? getFieldValue('visibleFlag') : 0,
                      memberName: null,
                      phone: null,
                      email: null,
                      memberLoginName: null,
                      supplierContactId: null,
                      memberUserId: null,
                    });
                    if (remoteProps && remoteProps?.event && remoteProps?.event?.fireEvent) {
                      remoteProps.event.fireEvent('onCampChangeAfterCux', {
                        record,
                        value,
                      });
                    }
                  }}
                >
                  {camp.map((item) => (
                    <Select.Option value={item.value} showArrow={false}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.account`).d('账号'),
        dataIndex: 'memberLoginName',
        width: 150,
        render: (val, record) =>
          basicInfo &&
          ['PUBLISHED', 'ICA_REJECTED'].includes(basicInfo.problemStatus) &&
          !readOnly ? (
            <Form.Item record={record}>
              {record.$form.getFieldDecorator('memberUserId', {
                initialValue: record.memberUserId,
              })(
                <Lov
                  code="SQAM.TENANT_USER"
                  disabled={isSuppiler || record.$form.getFieldValue('camp') === 'SUPPLIER'}
                  textValue={record.memberLoginName}
                  onChange={(value, lovRecord) => {
                    const { setFieldsValue } = record.$form;
                    if (value) {
                      setFieldsValue({
                        memberName: lovRecord.realName,
                        phone: lovRecord.phone,
                        email: lovRecord.email,
                        camp: 'PURCHASER',
                      });
                    } else {
                      setFieldsValue({
                        memberName: null,
                        phone: null,
                        email: null,
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.supplierContactId`).d('供应商联系人'),
        dataIndex: 'supplierContactName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierContactId', {
                initialValue: record.supplierContactId,
              })(
                <Lov
                  code="SSLM.SUPPLIER_MAIN_DATA_CONTACT"
                  textValue={val}
                  queryParams={{
                    partnerCompanyId: basicInfo.supplierCompanyId,
                    companyId: basicInfo.companyId,
                  }}
                  disabled={
                    record.$form.getFieldValue('camp') === 'PURCHASER' ||
                    !basicInfo.supplierCompanyId ||
                    !basicInfo.companyId
                  }
                  onChange={(value, lovRecord) => {
                    const { setFieldsValue } = record.$form;
                    if (value) {
                      setFieldsValue({
                        memberName: lovRecord.name,
                        phone: lovRecord.mobilephone,
                        email: lovRecord.mail,
                        camp: 'SUPPLIER',
                      });
                    } else {
                      setFieldsValue({
                        memberName: null,
                        phone: null,
                        email: null,
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.name`).d('姓名'),
        dataIndex: 'memberName',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`memberName`, {
                initialValue: val,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.name`).d('姓名'),
                    }),
                  },
                  {
                    max: 85,
                    message: intl.get('hzero.common.validation.max', {
                      max: 85,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },

      {
        title: intl.get(`${prefix}.leader`).d('组长'),
        dataIndex: 'leaderFlag',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`leaderFlag`, {
                initialValue: val,
                valuePropName: 'checked',
              })(<Checkbox onChange={(e) => onChangeLeader(record, e.target.checked)} />)}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`${prefix}.responsibility`).d('职责'),
        dataIndex: 'memberResp',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`memberResp`, {
                initialValue: val,
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.participateNode`).d('参与节点'),
        dataIndex: 'participantNodeMeaning',
        align: 'center',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`participantNode`, {
                initialValue: record.participantNode,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {participateNode.map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.phone`).d('电话'),
        dataIndex: 'phone',
        align: 'center',
        width: 300,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`phone`, {
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
                  addonBefore={this.phoneBefore(record, idd, 'internationalTelCode', 'phone')}
                />
              )}
            </Form.Item>
          ) : record.internationalTelCodeMeaning && val ? (
            `${record.internationalTelCodeMeaning} | ${val}`
          ) : null,
      },
      {
        title: intl.get(`${prefix}.email`).d('邮箱'),
        dataIndex: 'email',
        align: 'center',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`email`, {
                initialValue: val,
                rules: [
                  {
                    required: !!record.$form.getFieldValue('emailFlag'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.email`).d('邮箱'),
                    }),
                  },
                ],
                getValueFromEvent: (event) => {
                  return event.target.value.replace(/^ +| +$/g, '');
                },
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.emailFlag`).d('邮件提醒'),
        dataIndex: 'emailFlag',
        width: 150,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              <Popover
                content={intl
                  .get(`sqam.common.view.message.willSendEmail`)
                  .d(
                    '勾选后，整改过程中，发送至采购方/供应商方的邮件类型消息提醒也会分别按阵营发送至勾选成员邮箱'
                  )}
              >
                {record.$form.getFieldDecorator(`emailFlag`, {
                  initialValue: isUndefined(val)
                    ? record.$form.getFieldValue('camp') === 'PURCHASER'
                      ? 0
                      : 1
                    : val,
                })(
                  <Checkbox
                    disabled={
                      !['PURCHASER', 'SUPPLIER'].includes(record.$form.getFieldValue('camp'))
                    }
                    onChange={(e) => {
                      const { getFieldValue, setFields } = record.$form;
                      if (e.target.checked === 0 && getFieldValue('email') === '') {
                        setFields({ email: { value: null, errors: null } });
                      }
                    }}
                  />
                )}
              </Popover>
            </Form.Item>
          ) : (
            yesOrNoRender(val || 0)
          ),
      },
      {
        title: intl.get(`${prefix}.visibleFlag`).d('供应商不可见'),
        dataIndex: 'visibleFlag',
        width: 150,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`visibleFlag`, {
                initialValue: val,
              })(
                <Checkbox
                  disabled={
                    record.$form.getFieldValue('camp') === 'SUPPLIER' ||
                    record.$form.getFieldValue('leaderFlag')
                  }
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`${prefix}.explain`).d('说明'),
        dataIndex: 'remark',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    if (isSuppiler) cols.splice(10, 1);
    if (isSuppiler) cols.splice(1, 1);
    const columns =remoteProps
    ? remoteProps.process("SQAM_GROUP_MEMBER_PANEL_TABLE_COLUMNS",cols,{_this:this})
    : cols;

    return (
      <React.Fragment>
        <Spin spinning={!isUndefined(loading.deletedMembers) && loading.deletedMembers}>
          <Row>
            <Col>
              <div
                className="table-groupMember-operator"
                style={{ display: readOnly ? 'none' : 'block', marginBottom: 16 }}
              >
                <Button
                  loading={deleteLoading}
                  icon="plus"
                  disabled={remoteProps? remoteProps.process('SQAM_GROUP_MEMBER_PANEL_BUTTON_ADDNAME', false, {
                    basicInfo,
                    match,
                    selectedRowsMember
                  }) : false}
                  onClick={throttle(onAdd, 1500, { trailing: false })}
                >
                  {intl.get(`${prefix}.addMember`).d('新增成员')}
                </Button>
                <Button
                  icon="delete"
                  onClick={throttle(onRemove, 1500, { trailing: false })}
                  disabled={remoteProps? remoteProps.process('SQAM_GROUP_MEMBER_PANEL_BUTTON_DELMENBER', selectedRowKeys.length === 0, {
                    basicInfo,
                    match,
                    selectedRowsMember
                  }) : selectedRowKeys.length === 0}
                  style={{ marginLeft: 16 }}
                  loading={deleteLoading}
                >
                  {intl.get(`${prefix}.delMember`).d('删除成员')}
                </Button>
              </div>
              {customizeTable(
                {
                  code,
                  custLoading,
                  clearCache: (a, b, cb) => {
                    if (a !== b) {
                      cb(a);
                    }
                  },
                },
                <EditTable
                  bordered
                  rowKey="problemTeamId"
                  dataSource={groupMember.filter((item) => item.deleteFlag !== 1)}
                  columns={readOnly ? columns : [...columns]}
                  pagination={false}
                  rowSelection={
                    readOnly
                      ? null
                      : {
                          selectedRowKeys,
                          onChange: this.handleRowSelect,
                        }
                  }
                />
              )}
            </Col>
          </Row>
        </Spin>
      </React.Fragment>
    );
  }
}
