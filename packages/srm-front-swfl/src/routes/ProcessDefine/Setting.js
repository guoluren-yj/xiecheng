/**
 * 流程定义 - 复制
 * @date: 2019-5-29
 * @author: jiacheng.wang <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import {
  Form,
  Modal,
  Spin,
  Input,
  Switch,
  TreeSelect,
  Tooltip,
  InputNumber,
  Row,
  Col,
} from 'hzero-ui';
import { Icon, Text } from 'choerodon-ui';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import styles from './index.less';

@Form.create({ fieldNameProp: null })
export default class OverTimeSetting extends React.Component {
  // constructor(props) {
  //   super(props);
  //   const { currentRecord = {} } = props;
  //   this.state = {
  //     overTimeRequired: currentRecord.overtimeEnabled === 1,
  //   };
  // }

  @Bind()
  handleOk() {
    const { form, onOk = (e) => e, currentRecord = {} } = this.props;
    form.validateFields((error, values) => {
      if (!error) {
        const { pushMessageType, ...other } = values;
        const params = {
          ...filterNullValueObject(other),
          carbonEventFlag: pushMessageType && pushMessageType.includes('carbon') ? 1 : 0,
          commentEventFlag: pushMessageType && pushMessageType.includes('comment') ? 1 : 0,
          remindEventFlag: pushMessageType && pushMessageType.includes('remindEventFlag') ? 1 : 0,
        };
        if (isEmpty(params.messageTypeList)) {
          params.messageTypeList = null;
        }
        onOk({
          modelId: currentRecord.id,
          ...params,
        });
      }
    });
  }

  @Bind()
  handleCancle() {
    this.props.form.resetFields();
    this.props.onCancel();
  }

  @Bind()
  handleChangeOvertime(val) {
    // this.setState({
    //   overTimeRequired: val === 1,
    // });
    if (val === 0) {
      // 解决改变超时设置开关后超时时间必输校验未同步更新问题
      this.props.form.setFields({
        overtime: {
          value: this.props.form.getFieldValue('overtime'),
          errors: null,
        },
      });
    }
  }

  render() {
    const {
      form,
      visible,
      dataLoading = false,
      loading = false,
      tenantId,
      currentRecord = {},
      messageTypeList = [],
      isSiteFlag,
      customizeForm,
    } = this.props;
    // const { overTimeRequired } = this.state;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const defaultPushMessageType = [];
    if (currentRecord.fireMsgFlag) {
      defaultPushMessageType.push('task');
    }
    if (currentRecord.carbonEventFlag) {
      defaultPushMessageType.push('carbon');
    }
    if (currentRecord.commentEventFlag) {
      defaultPushMessageType.push('comment');
    }
    if (currentRecord.remindEventFlag) {
      defaultPushMessageType.push('remindEventFlag');
    }
    return (
      <Modal
        title={intl.get('hwfp.processDefine.view.title.setting').d('流程设置')}
        visible={visible}
        width={600}
        confirmLoading={loading}
        onOk={this.handleOk}
        onCancel={this.handleCancle}
      >
        <Spin spinning={dataLoading}>
          {customizeForm(
            { code: 'HWFP.PROCESS_DEFINITION.SETTING', form, dataSource: currentRecord },
            <Form>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label={intl.get('hwfp.common.model.process.name').d('流程名称')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('name', {
                      initialValue: currentRecord.name,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hwfp.common.model.process.name').d('流程名称'),
                          }),
                        },
                        {
                          max: 240,
                          message: intl.get('hzero.common.validation.max', {
                            max: 240,
                          }),
                        },
                      ],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={intl.get('hwfp.common.model.documents.defaultFormId').d('默认审批表单')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('defaultFormId', {
                      initialValue: currentRecord.defaultFormId,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('hwfp.common.model.documents.defaultFormId')
                              .d('默认审批表单'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        code="HWFP.PROCESS_FROM"
                        queryParams={{
                          documentId: currentRecord.documentId,
                          tenantId,
                          ignoreCuszFlag: 1,
                          enabledFlag: 1,
                        }}
                        textValue={currentRecord.defaultFormDescription}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={
                      <>
                        <Text className={styles['label-with-help']}>
                          {intl
                            .get('hwfp.processDefine.model.processDefine.pushMessageEnabled')
                            .d('待办消息推送外部系统')}
                        </Text>
                        <Tooltip
                          overlayClassName={styles['push-msg-help']}
                          title={
                            <>
                              <p>
                                {intl
                                  .get(
                                    'hwfp.processDefine.model.processDefine.pushMessageType.help1'
                                  )
                                  .d(
                                    '通过接口方式将工作流待办、已办、抄送通知推送外部系统（OA、企业、微信等），实现外部系统可收到消息提醒，并点击链接跳转到SRM进行待办审批与查看（需实现系统间单点登录）。'
                                  )}
                              </p>
                              <p>
                                {intl
                                  .get(
                                    'hwfp.processDefine.model.processDefine.pushMessageType.help2'
                                  )
                                  .d('推送消息类型说明：')}
                              </p>
                              <p>
                                {intl
                                  .get(
                                    'hwfp.processDefine.model.processDefine.pushMessageType.help3'
                                  )
                                  .d(
                                    '1）"待办/已办/办结"，审批人收到待办后，则给审批人推送待办消息，审批人审批后，则给审批人推送已办消息，流程审批完成后，推送办结消息给到流程发起人；'
                                  )}
                              </p>
                              <p>
                                {intl
                                  .get(
                                    'hwfp.processDefine.model.processDefine.pushMessageType.help4'
                                  )
                                  .d(
                                    '2)"抄送/传阅"，抄送与传阅，给被抄送人与被传阅人推送传阅消息；'
                                  )}
                              </p>
                              <p>
                                {intl
                                  .get(
                                    'hwfp.processDefine.model.processDefine.pushMessageType.help5'
                                  )
                                  .d(
                                    '3)"评论回复"，开启评论与回复权限后，消息推送给评论提醒人与回复给评论人的提醒'
                                  )}
                              </p>
                            </>
                          }
                        >
                          <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
                        </Tooltip>
                      </>
                    }
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('fireMsgFlag', {
                      initialValue: currentRecord.fireMsgFlag || 0,
                    })(
                      <Switch
                        checkedValue={1}
                        unCheckedValue={0}
                        onChange={(val) => {
                          setFieldsValue({ pushMessageType: val ? ['task'] : undefined });
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={intl
                      .get('hwfp.processDefine.model.processDefine.pushMessageType')
                      .d('推送类型')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                    style={{ display: getFieldValue('fireMsgFlag') === 1 ? 'block' : 'none' }}
                  >
                    {getFieldDecorator('pushMessageType', {
                      initialValue: defaultPushMessageType,
                    })(
                      <TreeSelect treeCheckable className={styles['push-msg-type-select']}>
                        <TreeSelect.TreeNode
                          key="task"
                          disabled
                          value="task"
                          title={intl
                            .get('hwfp.processDefine.view.option.taskType')
                            .d('待办/已办/办结')}
                        />
                        <TreeSelect.TreeNode
                          key="carbon"
                          value="carbon"
                          title={intl
                            .get('hwfp.processDefine.view.option.carbonType')
                            .d('抄送/传阅')}
                        />
                        <TreeSelect.TreeNode
                          key="comment"
                          value="comment"
                          title={intl
                            .get('hwfp.processDefine.view.option.commentType')
                            .d('评论回复')}
                        />
                        <TreeSelect.TreeNode
                          key="remindEventFlag"
                          value="remindEventFlag"
                          title={intl.get('hwfp.common.view.message.remind').d('催办')}
                        />
                      </TreeSelect>
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={intl
                      .get('hwfp.processDefine.model.processDefine.batchFlag')
                      .d('批量审批')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('batchFlag', {
                      initialValue: currentRecord.batchFlag === 0 ? 0 : 1,
                    })(<Switch checkedValue={1} unCheckedValue={0} />)}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={intl
                      .get('hwfp.processDefine.model.processDefine.mobileFlag')
                      .d('启用移动端审批')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('mobileMsgFlag', {
                      initialValue: currentRecord.mobileMsgFlag === 0 ? 0 : 1,
                    })(<Switch checkedValue={1} unCheckedValue={0} />)}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={
                      <>
                        <Text className={styles['label-with-help']}>
                          {intl
                            .get('hwfp.processDefine.model.processDefine.messageTypeList')
                            .d('SRM消息提醒配置')}
                        </Text>
                        <Tooltip
                          overlayClassName={styles['push-msg-help']}
                          title={intl
                            .get('hwfp.processDefine.model.processDefine.messageTypeList.help')
                            .d(
                              '通过邮件、站内信、短信等方式推送待办、催办等消息提醒，可在【消息发送配置】功能里维护消息通知类型'
                            )}
                        >
                          <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
                        </Tooltip>
                      </>
                    }
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('messageTypeList', {
                      initialValue: currentRecord.messageTypeList || [],
                    })(<TreeSelect treeCheckable allowClear treeData={messageTypeList} />)}
                  </Form.Item>
                </Col>
                {!isSiteFlag && (
                  <Col span={24}>
                    <Form.Item
                      label={
                        <>
                          <Text style={{ maxWidth: 'calc(100% - 40px)' }}>
                            {intl
                              .get('hwfp.processDefine.model.processDefine.modelStandardTime')
                              .d('人工节点默认标准用时(小时)')}
                          </Text>
                          <Tooltip
                            title={intl
                              .get('hwfp.processDefine.model.processDefine.modelStandardTime.help')
                              .d('流程所有人工节点默认用时,编辑器内节点未配置，审批用时取该字段')}
                          >
                            <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
                          </Tooltip>
                        </>
                      }
                      {...MODAL_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('modelStandardTime', {
                        initialValue: currentRecord.modelStandardTime,
                      })(<InputNumber min={0.1} precision={1} style={{ width: '100%' }} />)}
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Form>
          )}
        </Spin>
      </Modal>
    );
  }
}
