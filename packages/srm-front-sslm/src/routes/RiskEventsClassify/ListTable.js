/**
 * Table - 风险分类table
 * @date: 2019-07-03
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { sum, isNumber, join } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Form, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import TLEditor from 'components/TLEditor';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import RiskClassifyModal from './RiskClassifyModal';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['sslm.riskEvents'] })
export default class ListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      riskClassifyVisible: false, // 风险分类的model
      selectRow: {}, // 当前行
    };
  }

  /**
   * 维护事件维度
   */
  @Bind()
  handleEventDimension(record = {}) {
    const { riskClassifyVisible } = this.state;
    this.setState({
      riskClassifyVisible: !riskClassifyVisible,
      selectRow: record,
    });
  }

  render() {
    const { riskClassifyVisible, selectRow } = this.state;
    const {
      dataSource,
      pagination,
      loading,
      onChange,
      handleEdit,
      handleEnabled,
      handleCancel,
      handleQuerySickDim,
      messageType,
    } = this.props;
    const riskClassifyModalProps = {
      selectRow,
      riskClassifyVisible,
      handleQuerySickDim,
      onCancel: this.handleEventDimension,
    };
    const columns = [
      {
        title: intl.get(`sslm.riskEvents.view.message.classifyNumber`).d('分类编码'),
        dataIndex: 'riskCategoryCode',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('riskCategoryCode', {
                initialValue: record.riskCategoryCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sslm.riskEvents.view.message.classifyNumber`).d('分类编码'),
                    }),
                  },
                ],
              })(<Input trim typeCase="upper" inputChinese={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.riskEvents.view.message.classifyName`).d('分类名称'),
        dataIndex: 'riskCategoryName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('riskCategoryName', {
                initialValue: record.riskCategoryName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sslm.riskEvents.view.message.classifyName`).d('分类名称'),
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get(`sslm.riskEvents.view.message.classifyName`).d('分类名称')}
                  field="riskCategoryName"
                  token={record._token}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('sslm.riskEvents.view.message.isSendMessage').d('是否发送提醒'),
        dataIndex: 'isSendMessage',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('isSendMessage', {
                initialValue: record.isSendMessage || 0,
              })(
                <Checkbox
                  onChange={() => {
                    record.$form.setFieldsValue({ messageType: [] });
                    setTimeout(() => {
                      record.$form.validateFields(['messageType'], { force: true });
                    }, 200);
                  }}
                  disabled={!record.enabledFlag}
                />
              )}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('sslm.riskEvents.view.message.messageType').d('消息提醒方式'),
        dataIndex: 'messageType',
        width: 280,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('messageType', {
                initialValue: record.messageType || [],
                rules: [
                  {
                    required: record.$form.getFieldValue('isSendMessage'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.riskEvents.view.message.messageType').d('消息提醒方式'),
                    }),
                  },
                ],
              })(
                <Select
                  allowClear
                  mode="multiple"
                  style={{ width: '100%' }}
                  disabled={!record.$form.getFieldValue('isSendMessage') || !record.enabledFlag}
                >
                  {messageType.map((item) => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            record.messageTypeMeaning && join(record.messageTypeMeaning, '、')
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'classifyOperate',
        render: (val, record) => {
          return (
            <Fragment>
              {(record._status === 'create' || record._status === 'update') && (
                <a onClick={() => handleCancel(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {record._status === 'update' && (
                <Fragment>
                  <a style={{ marginLeft: 16 }} onClick={() => this.handleEventDimension(record)}>
                    {intl
                      .get(`sslm.riskEvents.view.button.maintainEventDimension`)
                      .d('维护事件维度')}
                  </a>
                  <a style={{ marginLeft: 16 }} onClick={() => handleEnabled(record)}>
                    {record.enabledFlag
                      ? intl.get('hzero.common.button.disable').d('禁用')
                      : intl.get('hzero.common.status.enable').d('启用')}
                  </a>
                </Fragment>
              )}
              {!(record._status === 'create') && !(record._status === 'update') && (
                <Fragment>
                  <a onClick={() => handleEdit(record, true)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                  <a style={{ marginLeft: 16 }} onClick={() => this.handleEventDimension(record)}>
                    {intl
                      .get(`sslm.riskEvents.view.button.maintainEventDimension`)
                      .d('维护事件维度')}
                  </a>
                  <a style={{ marginLeft: 16 }} onClick={() => handleEnabled(record)}>
                    {record.enabledFlag
                      ? intl.get('hzero.common.button.disable').d('禁用')
                      : intl.get('hzero.common.status.enable').d('启用')}
                  </a>
                </Fragment>
              )}
            </Fragment>
          );
        },
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 150)));
    return (
      <Fragment>
        <EditTable
          bordered
          scroll={{ x: scrollX }}
          rowKey="riskCategoryId"
          loading={loading}
          columns={columns}
          onChange={onChange}
          dataSource={dataSource}
          pagination={pagination}
        />
        {riskClassifyVisible && <RiskClassifyModal {...riskClassifyModalProps} />}
      </Fragment>
    );
  }
}
