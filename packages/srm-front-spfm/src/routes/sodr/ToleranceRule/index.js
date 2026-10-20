/**
 * ToleranceRule - 发票允差控制
 * @date: 2018-11-12
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, InputNumber, Modal } from 'hzero-ui';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';

/**
 * 发票允差控制
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} libraryPosition - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} saving - 保存操作是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@connect(({ toleranceRule, loading }) => ({
  toleranceRule,
  loading: loading.effects['toleranceRule/fetchToleranceRule'],
  saving: loading.effects['toleranceRule/saveToleranceRule'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sodr.toleranceRule', 'hzero.common'],
})
export default class ToleranceRule extends PureComponent {
  state = {};

  componentDidMount() {
    this.handleSearchToleranceRule();
  }

  /**
   * 查询发票允差配置数据
   * @param {Object} payload 请求参数
   */
  @Bind()
  handleSearchToleranceRule() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'toleranceRule/fetchToleranceRule',
      payload: { organizationId },
    });
  }

  /**
   * 新建行
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      organizationId,
      toleranceRule: { toleranceRuleData },
    } = this.props;
    const tableData = getEditTableData(toleranceRuleData, ['ruleId']);
    if (isEmpty(tableData)) return;

    const payloadData = tableData.map((item) => {
      return { tenantId: organizationId, ...item };
    });
    dispatch({
      type: 'toleranceRule/saveToleranceRule',
      payload: { payloadData, organizationId },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchToleranceRule();
      }
    });
  }

  /**
   * 新建一行
   */
  @Bind()
  handleCreateRow() {
    const {
      dispatch,
      toleranceRule: { toleranceRuleData = [] },
    } = this.props;
    const row = {
      ruleId: uuid(),
      toleranceType: '',
      upperLimit: null,
      lowerLimit: null,
      allowanceAmount: null,
      enabledFlag: 1,
      _status: 'create',
    };
    dispatch({
      type: 'toleranceRule/updateState',
      payload: { toleranceRuleData: [row, ...toleranceRuleData] },
    });
  }

  /**
   * 删除新建的行
   * @param {Object} record 行数据
   */
  @Bind()
  handleDeleteRow(record) {
    const {
      dispatch,
      toleranceRule: { toleranceRuleData = [] },
    } = this.props;
    const newToleranceRuleData = toleranceRuleData.filter((item) => item.ruleId !== record.ruleId);
    dispatch({
      type: 'toleranceRule/updateState',
      payload: { toleranceRuleData: newToleranceRuleData },
    });
  }

  /**
   * 编辑行
   * @param {Object} record 行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      dispatch,
      toleranceRule: { toleranceRuleData = [] },
    } = this.props;
    const newToleranceRuleData = toleranceRuleData.map((item) =>
      item.ruleId === record.ruleId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'toleranceRule/updateState',
      payload: { toleranceRuleData: newToleranceRuleData },
    });
  }

  /**
   * 取消编辑行
   * @param {Object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      dispatch,
      toleranceRule: { toleranceRuleData = [] },
    } = this.props;
    const newToleranceRuleData = toleranceRuleData.map((item) => {
      if (item.ruleId === record.ruleId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'toleranceRule/updateState',
      payload: { toleranceRuleData: newToleranceRuleData },
    });
  }

  render() {
    const {
      loading,
      saving,
      visible,
      handleModal,
      toleranceRule: { toleranceRuleData = [] },
    } = this.props;
    const style = { width: '100%' };
    const isSave = toleranceRuleData.filter(
      (o) => o._status === 'create' || o._status === 'update'
    );

    const modalProps = {
      visible,
      width: 1000,
      footer: null,
      title: intl.get(`sodr.toleranceRule.view.title`).d('发票允差设置'),
      onCancel: () => handleModal('toleranceRuleVisible', false),
    };

    const columns = [
      {
        title: intl.get(`sodr.toleranceRule.model.toleranceRule.toleranceType`).d('允差类型'),
        dataIndex: 'toleranceType',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('toleranceType', {
                  initialValue: record.toleranceType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.toleranceRule.model.toleranceRule.toleranceType`)
                          .d('允差类型'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    style={{ width: 200 }}
                    disabled={record._status === 'update'}
                    lovCode="SFIN.TOLERANCE_TYPE"
                    textValue={record.toleranceTypeMeaning}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.toleranceTypeMeaning;
          }
        },
      },
      {
        title: `${intl
          .get(`sodr.toleranceRule.model.toleranceRule.upperLimit`)
          .d('允差上限')}（%）`,
        width: 200,
        dataIndex: 'upperLimit',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('upperLimit', {
                  initialValue: record.upperLimit,
                })(<InputNumber style={style} precision={2} max={100} min={0} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: `${intl
          .get(`sodr.toleranceRule.model.toleranceRule.lowerLimit`)
          .d('允差下限')}（%）`,
        width: 200,
        dataIndex: 'lowerLimit',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('lowerLimit', {
                  initialValue: record.lowerLimit,
                })(<InputNumber style={style} precision={2} max={100} min={0} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.allowanceAmount').d('允差金额'),
        width: 100,
        dataIndex: 'allowanceAmount',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('allowanceAmount', {
                  initialValue: record.allowanceAmount,
                })(<InputNumber style={style} precision={2} min={0} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag ? 1 : 0,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return enableRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 100,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.handleDeleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.handleCancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.handleEditRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Modal {...modalProps}>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', marginBottom: 16 }}>
            <Button type="primary" onClick={this.handleCreateRow} style={{ marginLeft: 8 }}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button
              loading={saving || loading}
              disabled={isEmpty(isSave)}
              onClick={this.handleSave}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
          <EditTable
            bordered
            rowKey="ruleId"
            pagination={false}
            loading={loading}
            columns={columns}
            dataSource={toleranceRuleData}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
