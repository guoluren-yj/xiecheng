import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Button, Form, Select, Popover, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { isEmpty, filter } from 'lodash';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import { phoneRender } from '@/utils/renderer';

const FormItem = Form.Item;
const { Option } = Select;

@formatterCollections({ code: ['ssrc.inquiryHall'] })
@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  fetchInquiryGroupLoading: loading.effects['inquiryHall/fetchInquiryGroup'],
  deleteInquiryGroupLoading: loading.effects['inquiryHall/deleteInquiryGroup'],
  saveInquiryGroupLoading: loading.effects['inquiryHall/saveInquiryGroup'],
  organizationId: getCurrentOrganizationId(),
}))
export default class InquiryGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.fetchInquiryGroup();
    this.fetchLovInfo();
  }

  @Bind()
  fetchLovInfo() {
    const { dispatch } = this.props;
    const lovCodes = {
      rfxRoles: 'SSRC.RFX_ROLE',
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    });
  }

  @Bind()
  fetchInquiryGroup() {
    const { dispatch, rfxHeaderId, organizationId, readOnly } = this.props;
    dispatch({
      type: 'inquiryHall/fetchInquiryGroup',
      payload: {
        rfxHeaderId,
        organizationId,
        readOnly,
      },
    });
  }

  @Bind()
  handleDelete() {
    const {
      dispatch,
      rfxHeaderId,
      organizationId,
      inquiryHall: { inquiryGroupList = [] },
    } = this.props;
    const { selectedRows } = this.state;
    const newGroupList = filter(inquiryGroupList, (item) => {
      return selectedRows && selectedRows.map((r) => r.rfxMemberId).indexOf(item.rfxMemberId) < 0;
    });

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        selectedRows.forEach((item) => {
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });

        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              inquiryGroupList: newGroupList,
            },
          });
        } else {
          dispatch({
            type: 'inquiryHall/deleteInquiryGroup',
            payload: { newParams: remoteDelete, organizationId, rfxHeaderId },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchInquiryGroup();
              this.setState({ selectedRows: [], selectedRowKeys: [] });
            }
          });
        }
      },
    });
  }

  @Bind()
  handleSave() {
    const {
      dispatch,
      rfxHeaderId,
      organizationId,
      inquiryHall: { inquiryGroupList = [] },
    } = this.props;

    const newParams = getEditTableData(inquiryGroupList, ['rfxMemberId']);

    if (!isEmpty(newParams)) {
      dispatch({
        type: 'inquiryHall/saveInquiryGroup',
        payload: { newParams, organizationId, rfxHeaderId },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchInquiryGroup();
        }
      });
    }
  }

  @Bind()
  handleCreate() {
    const {
      dispatch,
      rfxHeaderId,
      organizationId,
      inquiryHall: { inquiryGroupList = [] },
    } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        inquiryGroupList: [
          {
            rfxHeaderId,
            rfxMemberId: uuidv4(),
            rfxRole: undefined,
            tenantId: organizationId,
            loginName: undefined,
            realName: undefined,
            email: undefined,
            phone: undefined,
            passwordFlag: 0,
            objectVersionNumber: 0,
            _status: 'create',
          },
          ...inquiryGroupList,
        ],
      },
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce(
      (prev, current) => prev + (current.className ? 0 : current.width ? current.width : 0),
      0
    );
    return total + fixWidth + 0;
  }

  /**
   * 多选寻源小组
   *
   * @memberof Update
   */
  @Bind()
  onRowSelectionChange = (keys = [], rows = []) => {
    this.setState({
      selectedRowKeys: keys,
      selectedRows: rows,
    });
  };

  /**
   * 寻源小组 改变用户名
   *
   * @param {*} val
   * @param {*} dataList
   * @param {*} record
   * @returns
   * @memberof Update
   */
  @Bind()
  changeLoginName(val, dataList, record) {
    if (!val) {
      return;
    }

    const { email, id, phone, loginName, realName } = dataList;

    record.$form.setFieldsValue({
      email,
      userId: id,
      phone,
      loginName,
      realName,
    });
  }

  @Bind()
  userEditable(record) {
    const { rfxStatus } = this.props;
    const { rfxRole } = record.$form.getFieldsValue();
    const { openedFlag } = record;
    const PretrialList = ['CHECK_PENDING', 'FINISHED', 'CHECK_REJECTED', 'CHECK_APPROVING'];
    const checkList = ['FINISHED'];
    if (rfxRole === 'CHECKED_BY' && checkList.includes(rfxStatus)) {
      // 核价员
      return true;
    } else if (rfxRole === 'PRETRIAL_BY' && PretrialList.includes(rfxStatus)) {
      // 初审员
      return true;
    } else if (rfxRole === 'RFX_BY') {
      // 询价员
      return false;
    } else if (rfxRole === 'OPENED_BY' && openedFlag) {
      // 开标员
      return true;
    } else {
      return false;
    }
  }

  render() {
    const { selectedRows, selectedRowKeys } = this.state;
    const {
      organizationId,
      openerChooseFlag,
      readOnly = false,
      closeInquiryGroup,
      saveInquiryGroupLoading,
      inquiryGroupVisibleFlag,
      fetchInquiryGroupLoading,
      deleteInquiryGroupLoading,
      inquiryHall: {
        inquiryGroupList = [],
        code: { rfxRoles = [] },
      },
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryRole`).d('角色'),
        dataIndex: 'rfxRoleMeaning',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('rfxRole', {
                initialValue: record.rfxRole,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryRole`).d('角色'),
                    }),
                  },
                ],
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  disabled={
                    record.rfxRole === 'CHECKED_BY' ||
                    record.rfxRole === 'PRETRIAL_BY' ||
                    record.rfxRole === 'RFX_BY' ||
                    (record.openedFlag && record.rfxRole === 'OPENED_BY')
                  }
                >
                  {rfxRoles &&
                    rfxRoles.map((item) => (
                      <Option
                        key={item.value}
                        value={item.value}
                        disabled={
                          item.value === 'CHECKED_BY' ||
                          item.value === 'PRETRIAL_BY' ||
                          item.value === 'RFX_BY' ||
                          (!openerChooseFlag && item.value !== 'OBSERVE_BY')
                        }
                      >
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.userName`).d('用户名'),
        dataIndex: 'loginName',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <FormItem>
                <Popover content={record.loginName}>
                  {record.$form.getFieldDecorator('loginName', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.userName`).d('用户名'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SSRC.TENANT.USER"
                      queryParams={{
                        organizationId,
                      }}
                      textValue={record.loginName}
                      onChange={(value, dataList) => this.changeLoginName(value, dataList, record)}
                      disabled={this.userEditable(record)}
                    />
                  )}
                </Popover>
                {record.$form.getFieldDecorator('userId', {
                  initialValue: record.userId,
                })}
                {record.$form.getFieldDecorator('objectVersionNumber', {
                  initialValue: record.objectVersionNumber,
                })}
              </FormItem>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.name`).d('名称'),
        dataIndex: 'realName',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              <Popover content={record.realName}>
                {record.$form.getFieldDecorator('realName', {
                  initialValue: val,
                })(<Input disabled />)}
              </Popover>
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.Email`).d('邮箱'),
        dataIndex: 'email',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              <Popover content={record.email}>
                {record.$form.getFieldDecorator('email', {
                  initialValue: val,
                })(<Input disabled />)}
              </Popover>
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.phone`).d('手机'),
        dataIndex: 'phone',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              <Popover content={record.phone}>
                {record.$form.getFieldDecorator('phone', {
                  initialValue: val,
                })(
                  <span>
                    {phoneRender(
                      record.$form.getFieldValue('internationalTelCodeMeaning'),
                      record.$form.getFieldValue('phone')
                    )}
                  </span>
                )}
              </Popover>
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.passwordEnableFlag`).d('启用开标密码'),
        dataIndex: 'passwordFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.$form.getFieldValue('rfxRole') === 'OPENED_BY' ? (
            <FormItem>
              {record.$form.getFieldDecorator('passwordFlag', {
                initialValue: record.passwordFlag,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={record.openedFlag} />)}
            </FormItem>
          ) : readOnly && record.rfxRole === 'OPENED_BY' ? (
            <Checkbox value={record.passwordFlag} checkedValue={1} unCheckedValue={0} disabled />
          ) : (
            ''
          ),
      },
    ];
    const scrollX = this.scrollWidth(columns, 0);
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onRowSelectionChange,
      getCheckboxProps: (record) => ({
        disabled:
          record.rfxRole === 'CHECKED_BY' ||
          record.rfxRole === 'PRETRIAL_BY' ||
          record.rfxRole === 'RFX_BY' ||
          (record.openedFlag && record.rfxRole === 'OPENED_BY'),
      }),
    };
    return (
      <Modal
        width="68%"
        visible={inquiryGroupVisibleFlag}
        destroyOnClose
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryGroup`).d('寻源小组')}</span>
            {!readOnly && (
              <div style={{ paddingRight: '20px' }}>
                <Button
                  key="delete"
                  style={{ marginRight: '6px' }}
                  onClick={this.handleDelete}
                  disabled={!selectedRowKeys.length}
                  loading={deleteInquiryGroupLoading}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
                <Button
                  key="save"
                  loading={saveInquiryGroupLoading}
                  style={{ marginRight: '6px' }}
                  onClick={this.handleSave}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
                <Button key="create" type="primary" onClick={this.handleCreate}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>
              </div>
            )}
          </div>
        }
        footer={null}
        onCancel={closeInquiryGroup}
      >
        <EditTable
          bordered
          rowKey="rfxMemberId"
          loading={fetchInquiryGroupLoading}
          columns={columns}
          rowSelection={readOnly ? '' : rowSelection}
          scroll={{ x: scrollX }}
          dataSource={inquiryGroupList}
          pagination={false}
        />
      </Modal>
    );
  }
}
