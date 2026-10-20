import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { trim } from 'lodash';
import {
  Form,
  Input,
  Modal,
  Select,
  Switch,
  TreeSelect,
  Tooltip,
  InputNumber,
  Row,
  Col,
} from 'hzero-ui';
import { Icon, Text } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import styles from './index.less';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 流程定义-数据添加滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 操作对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onOk: (e) => e,
    onCancel: (e) => e,
  };

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          const { pushMessageType, ...other } = values;
          const params = {
            ...filterNullValueObject(other),
            carbonEventFlag: pushMessageType && pushMessageType.includes('carbon') ? 1 : 0,
            commentEventFlag: pushMessageType && pushMessageType.includes('comment') ? 1 : 0,
            remindEventFlag: pushMessageType && pushMessageType.includes('remindEventFlag') ? 1 : 0,
          };
          // 校验通过，进行保存操作
          const key = trim(params.key);
          onOk({ ...params, key });
        }
      });
    }
  }

  @Bind()
  checkUnique(rule, value, callback) {
    const { onCheck } = this.props;
    onCheck({ key: value }).then((res) => {
      if (res && res.failed) {
        callback(
          intl.get('hwfp.common.view.validation.code.exist').d('编码已存在，请输入其他编码')
        );
      }
      callback();
    });
  }

  @Bind()
  handleCategoryChange(value) {
    const {
      onFetchDocuments,
      form: { resetFields },
      isSiteFlag = false,
    } = this.props;
    if (value) onFetchDocuments(value);
    resetFields(!isSiteFlag ? ['documentId', 'defaultFormId'] : ['documentId']);
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
      anchor,
      title,
      visible,
      form,
      onCancel,
      saving,
      documents = [],
      messageTypeList = [],
      isSiteFlag,
      tenantId,
      customizeForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    return (
      <Modal
        title={title}
        width={600}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        confirmLoading={saving}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        destroyOnClose
      >
        {customizeForm(
          { code: 'HWFP.PROCESS_DEFINITION.CREATE', form },
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get('hwfp.common.model.process.code').d('流程编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('key', {
                    // validateFirst: true,
                    // validateTrigger: 'onBlur',
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
                        pattern: /^[A-Z][A-Z0-9-_.]*$/,
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
                  {...formLayout}
                >
                  {getFieldDecorator('name', {
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
                  {...formLayout}
                >
                  {getFieldDecorator('category', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hwfp.common.model.process.class').d('流程分类'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="HWFP.PROCESS_CATEGORY"
                      queryParams={isSiteFlag ? {} : { tenantId }}
                      onChange={this.handleCategoryChange}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get('hwfp.common.model.documents.class').d('流程单据')}
                  {...formLayout}
                >
                  {getFieldDecorator('documentId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hwfp.common.model.documents.class').d('流程单据'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      allowClear
                      style={{ width: '100%' }}
                      disabled={!getFieldValue('category')}
                      onChange={this.handleDocumentChange}
                    >
                      {documents.map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              {!isSiteFlag && (
                <Col span={24}>
                  <Form.Item
                    label={intl.get('hwfp.common.model.documents.defaultFormId').d('默认审批表单')}
                    {...formLayout}
                  >
                    {getFieldDecorator('defaultFormId', {
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
                          documentId: getFieldValue('documentId'),
                          tenantId,
                          ignoreCuszFlag: 1,
                          enabledFlag: 1,
                        }}
                        disabled={!getFieldValue('documentId')}
                      />
                    )}
                  </Form.Item>
                </Col>
              )}
              {!isSiteFlag && (
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
                    {...formLayout}
                  >
                    {getFieldDecorator('fireMsgFlag', {
                      initialValue: 0,
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
              )}
              {!isSiteFlag && (
                <Col span={24}>
                  <Form.Item
                    label={intl
                      .get('hwfp.processDefine.model.processDefine.pushMessageType')
                      .d('推送类型')}
                    {...formLayout}
                    style={{ display: getFieldValue('fireMsgFlag') === 1 ? 'block' : 'none' }}
                  >
                    {getFieldDecorator('pushMessageType')(
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
              )}
              {!isSiteFlag && (
                <Col span={24}>
                  <Form.Item
                    label={intl
                      .get('hwfp.processDefine.model.processDefine.mobileFlag')
                      .d('启用移动端审批')}
                    {...formLayout}
                  >
                    {getFieldDecorator('mobileMsgFlag', {
                      initialValue: 1,
                    })(<Switch checkedValue={1} unCheckedValue={0} />)}
                  </Form.Item>
                </Col>
              )}
              {!isSiteFlag && (
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
                    {...formLayout}
                  >
                    {getFieldDecorator(
                      'messageTypeList',
                      {}
                    )(<TreeSelect treeCheckable allowClear treeData={messageTypeList} />)}
                  </Form.Item>
                </Col>
              )}
              <Col span={24}>
                <Form.Item
                  label={intl.get('hwfp.common.model.common.description').d('描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('description', {
                    rules: [
                      {
                        max: 240,
                        message: intl.get('hzero.common.validation.max', {
                          max: 240,
                        }),
                      },
                    ],
                  })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
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
                    {...formLayout}
                  >
                    {getFieldDecorator('modelStandardTime')(
                      <InputNumber min={0.1} precision={1} style={{ width: '100%' }} />
                    )}
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
