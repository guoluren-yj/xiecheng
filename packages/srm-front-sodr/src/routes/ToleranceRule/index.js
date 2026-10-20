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

import { Header, Content } from 'components/Page';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';

const modelPrompt = 'sodr.toleranceRule.model.common';
const titlePrompt = 'sodr.toleranceRule.view.title';

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

    const payloadData = tableData.map(item => {
      return { tenantId: organizationId, ...item };
    });
    dispatch({
      type: 'toleranceRule/saveToleranceRule',
      payload: { payloadData, organizationId },
    }).then(res => {
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
    const newToleranceRuleData = toleranceRuleData.filter(item => item.ruleId !== record.ruleId);
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
    const newToleranceRuleData = toleranceRuleData.map(item =>
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
    const newToleranceRuleData = toleranceRuleData.map(item => {
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
    const isSave = toleranceRuleData.filter(o => o._status === 'create' || o._status === 'update');

    const modalProps = {
      visible,
      width: 1000,
      footer: null,
      onCancel: () => handleModal('toleranceRuleVisible', false),
    };

    const columns = [
      {
        title: intl.get(`${modelPrompt}.toleranceType`).d('允差类型'),
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
                        name: intl.get(`${modelPrompt}.toleranceType`).d('允差类型'),
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
        title: `${intl.get(`${modelPrompt}.toleranceRuleUpperLimit`).d('允差上限')}（%）`,
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
        title: `${intl.get(`${modelPrompt}.toleranceRuleLowerLimit`).d('允差下限')}（%）`,
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
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        align: 'center',
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
        align: 'center',
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
          <Header title={intl.get(`${titlePrompt}.toleranceRuleSetting`).d('发票允差设置')}>
            <Button type="primary" onClick={this.handleCreateRow}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button
              loading={saving || loading}
              disabled={isEmpty(isSave)}
              onClick={this.handleSave}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Header>
          <Content>
            <EditTable
              bordered
              rowKey="ruleId"
              pagination={false}
              loading={loading}
              columns={columns}
              dataSource={toleranceRuleData}
            />
          </Content>
        </Modal>
      </React.Fragment>
    );
  }
}
