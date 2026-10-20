/**
 * GroupMemberPanel - 小组成员
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, Spin, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

const prefix = `sqam.common.model.qualityRectification`;
export default class GroupMemberPanelSupplier extends Component {
  /**
   * 行操作
   * @param {array} selectedRowKeys - 选中行Rowkey
   */
  @Bind()
  handleRowSelect(selectedRowKeys) {
    this.props.onSelectRow(selectedRowKeys);
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
      customizeTable,
      code,
      custLoading,
      readOnly = true,
      required,
      selectedRowKeys,
      groupMember,
      onAdd = (e) => e,
      onRemove = (e) => e,
      onChangeLeader = (e) => e,
      loading = {},
      hideLeaderContentWhenText = false,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.name`).d('姓名'),
        dataIndex: 'memberName',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
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
        title: intl.get(`${prefix}.representor`).d('代表方'),
        dataIndex: 'campMeaning',
        align: 'center',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`camp`, {
                initialValue: record.campMeaning,
              })(
                <Select disabled style={{ width: '100%' }}>
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
        title: intl.get(`${prefix}.supplierContactId`).d('供应商联系人'),
        dataIndex: 'supplierContactName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierContactId', {
                initialValue: record.supplierContactId,
              })}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.responsibility`).d('职责'),
        dataIndex: 'memberResp',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
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
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`participantNode`, {
                initialValue: record.participantNode,
                // rules: [
                //   {
                //     required,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl.get(`${prefix}.participantNode`).d('参与节点'),
                //     }),
                //   },
                // ],
              })(
                <Select disabled={readOnly} allowClear style={{ width: '100%' }}>
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
      // {
      //   title: intl.get(`${prefix}.role`).d('角色'),
      //   dataIndex: 'memberRole',
      //   align: 'center',
      //   width: 100,
      //   render: (val, record) =>
      //     ['update', 'create'].includes(record._status) ? (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator(`memberRole`, {
      //           initialValue: val,
      //           rules: [
      //             {
      //               required,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get(`${prefix}.role`).d('角色'),
      //               }),
      //             },
      //             {
      //               max: 50,
      //               message: intl.get('hzero.common.validation.max', {
      //                 max: 50,
      //               }),
      //             },
      //           ],
      //         })(<Input />)}
      //       </Form.Item>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl.get(`${prefix}.phone`).d('电话'),
        dataIndex: 'phone',
        align: 'center',
        width: 300,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
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
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`email`, {
                initialValue: val,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.email`).d('邮箱'),
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
        title: intl.get(`${prefix}.explain`).d('说明'),
        dataIndex: 'remark',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: val,
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
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`leaderFlag`, {
                initialValue: val,
                valuePropName: 'checked',
              })(<Checkbox onChange={(e) => onChangeLeader(record, e.target.checked)} />)}
            </Form.Item>
          ) : hideLeaderContentWhenText ? (
            ''
          ) : (
            <Checkbox
              disabled={readOnly}
              value={val}
              onChange={(e) => onChangeLeader(record, e.target.checked)}
            />
          ),
      },
    ];
    return (
      <React.Fragment>
        <Spin spinning={!isUndefined(loading.deletedMembers) && loading.deletedMembers}>
          <Row>
            <Col>
              <div
                className="table-groupMember-operator"
                style={{ display: readOnly ? 'none' : 'block', marginBottom: 16 }}
              >
                <Button icon="plus" onClick={onAdd}>
                  {intl.get(`${prefix}.addMember`).d('新增成员')}
                </Button>
                <Button
                  icon="delete"
                  onClick={onRemove}
                  disabled={selectedRowKeys.length === 0}
                  style={{ marginLeft: 16 }}
                >
                  {intl.get(`${prefix}.delMember`).d('删除成员')}
                </Button>
              </div>
              {customizeTable(
                {
                  code,
                  custLoading,
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
