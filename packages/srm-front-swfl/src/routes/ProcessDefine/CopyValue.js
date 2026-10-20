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
  Select,
  Spin,
  Input,
  Switch,
  TreeSelect,
  Tooltip,
  InputNumber,
  Col,
  Row,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Icon, Text } from 'choerodon-ui';
import { isNil } from 'lodash';

import { MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import Lov from 'components/Lov';

import styles from './index.less';

@Form.create({ fieldNameProp: null })
export default class CopyValue extends React.Component {
  componentDidMount() {
    const { currentCopyRecord = {}, onFetchDocuments = (e) => e } = this.props;
    onFetchDocuments(currentCopyRecord.category);
  }

  @Bind()
  handleCategoryChange(value) {
    const {
      onFetchDocuments,
      form: { setFieldsValue },
    } = this.props;
    if (value) onFetchDocuments(value);
    setFieldsValue({ documentId: '', newKey: '', newName: '', defaultFormId: '' });
  }

  @Bind()
  handleOk() {
    const { form, onOk = (e) => e, currentCopyRecord } = this.props;
    form.validateFields((error, values) => {
      if (!error) {
        const { pushMessageType, ...other } = values;
        const params = {
          ...filterNullValueObject(other),
          carbonEventFlag: pushMessageType && pushMessageType.includes('carbon') ? 1 : 0,
          commentEventFlag: pushMessageType && pushMessageType.includes('comment') ? 1 : 0,
          remindEventFlag: pushMessageType && pushMessageType.includes('remindEventFlag') ? 1 : 0,
        };
        onOk({
          oldKey: currentCopyRecord.key,
          refTenantId: currentCopyRecord.tenantId,
          customizeUnitCode: 'HWFP.PROCESS_DEFINITION.COPY',
          ...params,
        });
      }
    });
  }

  @Bind()
  handleChangeOvertime(val) {
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

  @Bind()
  handleDocumentChange = () => {
    const {
      form: { setFieldsValue },
      isSiteFlag = false,
    } = this.props;
    if (!isSiteFlag) {
      setFieldsValue({ defaultFormId: '' });
    }
  };

  render() {
    const {
      form,
      onCancel,
      visible,
      dataLoading = false,
      loading = false,
      documents = [],
      currentCopyRecord = {},
      tenantId,
      messageTypeList = [],
      isSiteFlag,
      customizeForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    let copyDocumentId =
      documents.length > 0 && documents[0].value
        ? documents[0].value
        : currentCopyRecord.documentId;
    // 优先判断sourceParentId是否等于documentId
    for (const item of documents) {
      if (item.value === currentCopyRecord.documentId) {
        copyDocumentId = item.value;
      }
      if (item.sourceParentId && item.sourceParentId === currentCopyRecord.documentId) {
        copyDocumentId = item.value;
        break;
      }
    }
    const defaultPushMessageType = [];
    if (currentCopyRecord.fireMsgFlag) {
      defaultPushMessageType.push('task');
    }
    if (currentCopyRecord.carbonEventFlag) {
      defaultPushMessageType.push('carbon');
    }
    if (currentCopyRecord.commentEventFlag) {
      defaultPushMessageType.push('comment');
    }
    if (currentCopyRecord.remindEventFlag) {
      defaultPushMessageType.push('remindEventFlag');
    }
    return (
      <Modal
        title={intl.get('hwfp.processDefine.view.title.copyValue').d('流程复制')}
        visible={visible}
        width={600}
        confirmLoading={loading}
        onOk={this.handleOk}
        onCancel={onCancel}
      >
        <Spin spinning={dataLoading}>
          {customizeForm(
            { code: 'HWFP.PROCESS_DEFINITION.COPY', form, dataSource: currentCopyRecord },
            <Form>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label={intl.get('hwfp.common.model.process.code').d('流程编码')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('newKey', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hwfp.common.model.process.code').d('流程编码'),
                          }),
                        },
                        {
                          max: 32,
                          message: intl.get('hzero.common.validation.max', {
                            max: 32,
                          }),
                        },
                        {
                          pattern: /^[A-Z0-9-_.]*$/,
                          message: intl
                            .get('hzero.common.validation.codeUpperBegin.noSlash')
                            .d('全大写及数字，必须以字母开头，可包含“-”、“_”、“.”'),
                        },
                      ],
                    })(<Input trim typeCase="upper" inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={intl.get('hwfp.common.model.process.name').d('流程名称')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('newName', {
                      initialValue: currentCopyRecord.name,
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
                    label={intl.get('hwfp.common.model.process.class').d('流程分类')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('categoryId', {
                      initialValue: currentCopyRecord.category,
                    })(
                      <Lov
                        disabled
                        textValue={currentCopyRecord.categoryDescription}
                        code="HWFP.PROCESS_CATEGORY"
                        queryParams={{ tenantId }}
                        onChange={this.handleCategoryChange}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={intl.get('hwfp.common.model.documents.class').d('流程单据')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('documentId', {
                      initialValue: copyDocumentId,
                      rules: [
                        {
                          required: !isNil(form.getFieldValue('categoryId')),
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hwfp.common.model.documents.class').d('流程单据'),
                          }),
                        },
                      ],
                    })(
                      <Select allowClear={false} disabled onChange={this.handleDocumentChange}>
                        {documents.map((item) => (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={intl.get('hwfp.common.model.documents.defaultFormId').d('默认审批表单')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('defaultFormId', {
                      initialValue: currentCopyRecord.defaultFormId,
                      rules: [
                        {
                          required: !isNil(form.getFieldValue('categoryId')),
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
                          documentId: getFieldValue('documentId'),
                          tenantId,
                          ignoreCuszFlag: 1,
                          enabledFlag: 1,
                        }}
                        textValue={currentCopyRecord.defaultFormDescription}
                        disabled={!getFieldValue('documentId')}
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
                      initialValue: currentCopyRecord.fireMsgFlag || 0,
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
                      .get('hwfp.processDefine.model.processDefine.mobileFlag')
                      .d('启用移动端审批')}
                    {...MODAL_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('mobileMsgFlag', {
                      initialValue: currentCopyRecord.mobileMsgFlag || 0,
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
                      initialValue: currentCopyRecord.messageTypeList || [],
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
                        initialValue: currentCopyRecord.modelStandardTime,
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
