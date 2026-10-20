/**
 * PromptModal - 需求分配
 * @date: 2019-07-11
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isArray } from 'lodash';

// import Lov from 'components/Lov';
import intl from 'utils/intl';

import Lov from 'components/Lov';
import Multiple from './../components/MultipleLov';
import styles from './index.less';

const modelPrompt = 'sprm.purchaseRequisitionAssign.model.common';
const commonPrompt = 'sprm.common.model.common';
const { TextArea } = Input;

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

@Form.create({ fieldNameProp: null })
export default class PromptModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // purchaseAgentId: undefined,
      okBtnLoading: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  @Bind()
  handleOkBtnLoading() {
    this.setState({ okBtnLoading: false });
  }

  /**
   * 保存多选数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  // @Bind()
  // onSaveRecord() {
  //   const { form } = this.props;
  //   const { selectedRows } = this.state;
  //   const value = selectedRows.map(o => o.userName);
  //   const executedBys = selectedRows.map(o => o.userId);
  //   form.registerField('executedBys');
  //   form.setFieldsValue({ executedBys, executedByName: value });
  //   this.setState({
  //     executedByName: value,
  //   });
  //   this.handleModal(false);
  // }

  /**
   * 获取 modal 体
   */
  @Bind()
  getBody() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      modalKey,
      tenantId,
      selectedRows = [],
      executionStrategyList = [],
      allTransferFlag, // 是否转单
      setting,
      customizeForm,
      isOldUser,
      getCuxAssignDefaultValue,
    } = this.props;
    const purchaseAgentIdFlag = selectedRows.every(
      ele => ele.purchaseAgentId === selectedRows[0]?.purchaseAgentId
    );
    const purchaseAgentLov = purchaseAgentIdFlag
      ? {
          purchaseAgentId: selectedRows[0]?.purchaseAgentId,
          purchaseAgentName: selectedRows[0]?.purchaseAgentName,
        }
      : {};
    const executionStrategyCode = selectedRows.every(item => item.executionStrategyCode === 'ORDER')
      ? 'ORDER'
      : selectedRows.every(item => item.executionStrategyCode === 'SOURCE')
      ? 'SOURCE'
      : undefined;
    const purchaseOrgIds = Array.from(
      new Set(selectedRows?.map(item => item.purchaseOrgId || 'purchaseOrgId'))
    ).filter(ele => ele !== 'purchaseOrgId');
    // getCuxAssignDefaultValue
    const defaultValue = isFunction(getCuxAssignDefaultValue)
      ? getCuxAssignDefaultValue({ purchaseOrgIds, selectedRows })
      : {};
    if (modalKey === 'assign') {
      return customizeForm(
        {
          code: 'SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.MODAL',
          form,
          dataSource: defaultValue,
        },
        <Form>
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl
                  .get(`sprm.purchaseRequisitionAssign.modal.purchaseAgentName`)
                  .d('采购员')}
                {...formItemLayout}
              >
                {getFieldDecorator('purchaseAgentId', {
                  initialValue: purchaseAgentLov.purchaseAgentId,
                })}
                {getFieldDecorator('currentPurchaseAgent', {
                  initialValue: purchaseAgentLov.purchaseAgentId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sprm.purchaseRequisitionAssign.modal.purchaseAgentName`)
                          .d('采购员'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPUC.PURCHASE_AGENT"
                    queryParams={{ purchaseOrgIds: purchaseOrgIds.join(',') }}
                    onChange={value => {
                      setFieldsValue({ purchaseAgentId: value });
                    }}
                    textValue={purchaseAgentLov.purchaseAgentName}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${commonPrompt}.handlePerson`).d('需求执行人')}
                {...formItemLayout}
              >
                {getFieldDecorator('executedBys')(
                  <Multiple
                    code="SSLM.KPI_USER"
                    disabled={!getFieldValue('purchaseAgentId')}
                    queryParams={{ tenantId }}
                    allowClear
                    lovOptions={{ displayField: 'userName' }}
                    oldValueField="executedByName"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              {setting === '1' && (
                <Form.Item
                  label={intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('executionStrategyCode', {
                    initialValue: executionStrategyCode,
                    rules: [
                      {
                        required: !allTransferFlag,
                        message: intl
                          .get('hzero.common.validation.notNull', {
                            name: intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略'),
                          })
                          .d(
                            `${intl
                              .get(`${commonPrompt}.executionStrategyCode`)
                              .d('执行策略')}不能为空`
                          ),
                      },
                    ],
                  })(
                    <Select allowClear style={{ width: '100%' }} disabled={allTransferFlag}>
                      {(isOldUser
                        ? executionStrategyList.filter(
                            item =>
                              ![
                                'BEFORE_SOURCE_AFTER_ORDER',
                                'SOURCE_AND_ORDER',
                                'PROJECT_INFO',
                              ].includes(item.value)
                          )
                        : executionStrategyList.filter(
                            item => item.value !== 'BEFORE_SOURCE_AFTER_ORDER'
                          )
                      )?.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              )}
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${modelPrompt}.assignedRemark`).d('分配说明')}
                {...formItemLayout}
              >
                {getFieldDecorator('assignedRemark')(
                  <TextArea rows={2} style={{ overflow: 'hidden', height: '56px' }} />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      );
    } else if (modalKey === 'suspend') {
      return (
        <Fragment>
          <Form.Item
            className={styles['ant-modal-body']}
            label={intl.get(`${modelPrompt}.suspendReason`).d('暂挂原因')}
            {...formItemLayout}
          >
            {getFieldDecorator('suspendRemark', {
              rules: [
                {
                  required: false,
                  message: intl
                    .get(`hzero.common.validation.notNull`, {
                      name: intl.get(`${modelPrompt}.suspendReason`).d('暂挂原因'),
                    })
                    .d(`${intl.get(`${modelPrompt}.suspendReason`).d('暂挂原因')}不能为空`),
                },
              ],
            })(<TextArea rows={2} style={{ overflow: 'hidden', height: '56px' }} />)}
          </Form.Item>
        </Fragment>
      );
    }
  }

  /**
   * 保存 modal 数据，并且关闭 modal
   */
  @Bind()
  handleOk() {
    this.setState({ okBtnLoading: true });
    const { form, onModalOk } = this.props;
    const { purchaseAgentId } = form.getFieldsValue();
    form.validateFields((err, values) => {
      if (!err) {
        const { executedByName = [] } = values;
        onModalOk({
          ...values,
          executedBys: (isArray(executedByName) ? executedByName : [])?.map(ele => ele.userId),
          executedByName: (isArray(executedByName) ? executedByName : [])?.map(ele => ele.userName),
          purchaseAgentId,
        });
      } else {
        this.setState({ okBtnLoading: false });
      }
    });
  }

  /**
   * 关闭 modal
   */
  @Bind()
  handleCancel = () => {
    const {
      onClose,
      form: { resetFields },
    } = this.props;
    onClose();
    resetFields();
  };

  render() {
    const { okBtnLoading } = this.state;
    const { visible, title, saveAssignmentLoading, saveSuspendLoading } = this.props;
    return (
      <Fragment>
        <Modal
          visible={visible}
          title={title}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          confirmLoading={saveSuspendLoading || saveAssignmentLoading || okBtnLoading}
          okText={intl.get('hzero.common.button.ok').d('确定')}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        >
          {this.getBody()}
        </Modal>
      </Fragment>
    );
  }
}
