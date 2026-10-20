/**
 * 寻源服务 - 预审小组
 * @date: 2020-04-09
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Button, Popover, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, filter } from 'lodash';
import uuid from 'uuid/v4';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { phoneRender } from '@/utils/renderer';

const { Option } = Select;
const organizationId = getCurrentOrganizationId();

@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  loading: loading.effects['inquiryHall/fetchPretrialPanel'],
  save: loading.effects['inquiryHall/savePretrialPanel'],
  deleting: loading.effects['inquiryHall/deletePretrialPanel'],
}))
export default class PretrialPanelModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rowKey: 'prequalMemberId',
      dataListName: 'pretrialPanelList',
      selectedRowKeys: [], // 勾选删除主键
    };
  }

  componentDidMount() {
    this.fetchPretrialPanel();
  }

  /* eslint-disable-next-line */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { visible } = this.props;
    if (nextProps.visible === true && nextProps.visible !== visible) {
      this.fetchPretrialPanel();
    }
  }

  /**
   * 预审小组-查询
   * @param {Object} page
   */
  @Bind()
  fetchPretrialPanel() {
    const { dispatch, sourceHeaderId } = this.props;
    dispatch({
      type: 'inquiryHall/fetchPretrialPanel',
      payload: {
        sourceHeaderId,
        sourceFrom: 'RFX',
        organizationId,
      },
    });
  }

  /**
   * 改变账号-带出名称，职责，手机号码，邮箱
   */
  @Bind()
  changeLoginName(value, dataList, record) {
    record.$form.setFieldsValue({
      loginName: dataList.loginName,
      realName: dataList.realName,
      phone: dataList.phone,
      email: dataList.email,
      internationalTelCode: dataList.internationalTelCode,
      internationalTelCodeMeaning: dataList.internationalTelCodeMeaning,
      leaderFlag: '0', // 默认组员
    });
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreateRows() {
    const { dispatch, inquiryHall = {} } = this.props;
    const { rowKey, dataListName } = this.state;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        [dataListName]: [
          {
            [rowKey]: uuid(),
            _status: 'create',
          },
          ...inquiryHall[dataListName],
        ],
      },
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { dispatch, inquiryHall } = this.props;
    const { selectedRowKeys, dataListName } = this.state;

    // 过滤出勾选数据
    const newParameters = filter(inquiryHall[dataListName], (item) => {
      return selectedRowKeys.indexOf(item.prequalMemberId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newDataList = filter(inquiryHall[dataListName], (item) => {
      return selectedRowKeys.indexOf(item.prequalMemberId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              [dataListName]: newDataList,
            },
          });
          this.setState({ selectedRowKeys: [] });
        } else {
          dispatch({
            type: 'inquiryHall/deletePretrialPanel',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'inquiryHall/updateState',
                payload: {
                  [dataListName]: newDataList,
                },
              });
              this.setState({ selectedRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 弹框-保存
   */
  @Bind()
  handleSaveRows() {
    const { dispatch, inquiryHall, sourceHeaderId } = this.props;
    const { rowKey, dataListName } = this.state;
    const dataList = getEditTableData(inquiryHall[dataListName], [rowKey]);
    if (isEmpty(dataList)) return;
    // 对leaderFlag作0和1的处理
    const newDataList = dataList.map((item) => {
      return {
        ...item,
        leaderFlag: Number(item.leaderFlag),
      };
    });
    dispatch({
      type: 'inquiryHall/savePretrialPanel',
      payload: {
        sourceHeaderId,
        organizationId,
        newDataList,
        sourceFrom: 'RFX',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleModalHide();
      }
    });
  }

  /**
   * 设置勾选行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 关闭modal
   */
  @Bind()
  handleModalHide() {
    this.props.onHideModal(false);
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        pretrialPanelList: [],
      },
    });
  }

  render() {
    const {
      loading,
      visible,
      save,
      deleting,
      inquiryHall,
      inquiryHall: {
        code: { duty = [] },
      },
    } = this.props;
    const { rowKey, dataListName, selectedRowKeys = [] } = this.state;

    const columns = [
      {
        title: intl.get(`ssrc.common.account`).d('账号'),
        dataIndex: 'userId',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('userId', {
                  initialValue: record.userId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.common.account`).d('账号'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSRC.PREQUAL_USER"
                    textValue={getFieldValue('loginName')}
                    lovOptions={{
                      displayField: 'loginName',
                      valueField: 'id',
                    }}
                    queryParams={{ organizationId }}
                    onChange={(value, dataList) => this.changeLoginName(value, dataList, record)}
                  />
                )}
                {getFieldDecorator('loginName', { initialValue: record.loginName })}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`ssrc.common.realName`).d('名称'),
        dataIndex: 'realName',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('realName', {
                  initialValue: record.realName,
                })(
                  <Popover content={getFieldValue('realName')}>{getFieldValue('realName')}</Popover>
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`ssrc.common.duty`).d('职责'),
        dataIndex: 'duty',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('leaderFlag', {
                  initialValue:
                    record._status === 'create' ? record.leaderFlag : String(record.leaderFlag),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.common.duty`).d('职责'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }}>
                    {duty &&
                      duty.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return <Popover content={val}>{val}</Popover>;
          }
        },
      },
      {
        title: intl.get(`ssrc.common.phone`).d('手机号码'),
        dataIndex: 'phone',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('phone', {
                  initialValue: record.phone,
                })(
                  <div>
                    {phoneRender(record.internationalTelCodeMeaning, getFieldValue('phone'))}
                  </div>
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`ssrc.common.email`).d('邮箱'),
        dataIndex: 'email',
        width: 130,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('email', {
                  initialValue: record.email,
                })(<Popover content={getFieldValue('email')}>{getFieldValue('email')}</Popover>)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <React.Fragment>
        <Modal
          destroyOnClose
          width="60%"
          visible={visible}
          onCancel={this.handleModalHide}
          title={intl.get('ssrc.common.view.title.pretrialPanelMembers').d('预审小组成员')}
          footer={null}
        >
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <Button
              disabled={isEmpty(selectedRowKeys)}
              loading={deleting}
              onClick={this.handleDelete}
              style={{ marginRight: '8px' }}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button type="default" onClick={this.handleCreateRows} style={{ marginRight: '8px' }}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button type="primary" onClick={this.handleSaveRows} loading={save}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
          <EditTable
            bordered
            loading={loading}
            rowKey={rowKey}
            rowSelection={rowSelection}
            dataSource={inquiryHall[dataListName]}
            columns={columns}
            pagination={false}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
