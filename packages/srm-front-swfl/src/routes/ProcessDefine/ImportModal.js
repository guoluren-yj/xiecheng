import React from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Upload,
  Switch,
  TreeSelect,
  Tooltip,
  Row,
  Col,
} from 'hzero-ui';
import { Text, Icon, InputNumber } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import styles from './index.less';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
export default class ImportModal extends React.PureComponent {
  state = {
    fileList: [],
  };

  @Bind()
  handleCancel() {
    const { form, onCancel = (e) => e } = this.props;
    this.setState({ fileList: [] });
    form.resetFields();
    onCancel();
  }

  @Bind()
  handleUploadChange({ file }) {
    const { form } = this.props;
    if (file) {
      this.setState({
        fileList: [file],
      });
      form.setFieldsValue({
        file,
      });
    }
  }

  @Bind()
  handleUploadBefore(file) {
    const isXml = file.type === 'application/xml';
    return isXml;
  }

  @Bind()
  handleRemove() {
    const { form } = this.props;
    this.setState({ fileList: [] });
    form.setFieldsValue({ file: undefined });
  }

  @Bind()
  handleOk() {
    const { form, onOk = (e) => e } = this.props;
    const formData = new FormData();
    form.validateFields((error, values) => {
      if (!error) {
        const { pushMessageType, ...other } = values;
        const fieldsValue = {
          ...filterNullValueObject(other),
          carbonEventFlag: pushMessageType && pushMessageType.includes('carbon') ? 1 : 0,
          commentEventFlag: pushMessageType && pushMessageType.includes('comment') ? 1 : 0,
          remindEventFlag: pushMessageType && pushMessageType.includes('remindEventFlag') ? 1 : 0,
        };
        for (const key of Object.keys(fieldsValue)) {
          if (key === 'file') {
            formData.append(key, fieldsValue[key]);
            // eslint-disable-next-line
            continue;
          }
          formData.append(key, fieldsValue[key]);
        }
        onOk(formData, () => {
          this.setState({ fileList: [] });
          form.resetFields();
        });
      }
    });
  }

  /**
   * 流程分类改变回调
   * @param {*} value
   */
  @Bind()
  handleCategoryChange(value) {
    const {
      onFetchDocuments,
      form: { resetFields },
      isSiteFlag = false,
    } = this.props;
    if (value) {
      onFetchDocuments(value);
    }
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
      form,
      importVisible,
      importLoading,
      documents = [],
      isSiteFlag,
      tenantId,
      messageTypeList = [],
      customizeForm,
    } = this.props;
    const { fileList } = this.state;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;

    return (
      <Modal
        title={intl.get('hwfp.processDefine.view.option.import').d('导入')}
        width={600}
        destroyOnClose
        visible={importVisible}
        confirmLoading={importLoading}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        {customizeForm(
          { code: 'HWFP.PROCESS_DEFINITION.IMPORT', form },
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formLayout}
                  style={{ marginBottom: 0 }}
                  label={
                    <span className="ant-form-item-required">
                      {intl.get('hwfp.common.model.process.file').d('BPMN定义文件')}
                    </span>
                  }
                >
                  {getFieldDecorator('importFile')(
                    <Upload
                      accept="application/xml"
                      name="file"
                      fileList={fileList}
                      onRemove={this.handleRemove}
                      onChange={this.handleUploadChange}
                      beforeUpload={this.handleUploadBefore}
                    >
                      <Button>{intl.get('hwfp.common.model.process.select').d('选择文件')}</Button>
                    </Upload>
                  )}
                </Form.Item>
              </Col>
              <Col span={24} style={{ display: 'none' }}>
                <Form.Item wrapperCol={{ span: 15, offset: 6 }}>
                  {getFieldDecorator('file', {
                    initialValue: fileList,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hwfp.common.model.process.file').d('BPMN定义文件'),
                        }),
                      },
                    ],
                  })(<div />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get('hwfp.common.model.process.code').d('流程编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('key', {
                    initialValue: '',
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
                  })(<Input inputChinese={false} typeCase="upper" />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get('hwfp.common.model.process.name').d('流程名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('name', {
                    initialValue: '',
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
                  {getFieldDecorator('categoryId', {
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
                        required: getFieldValue('categoryId'),
                        message: intl.get('hwfp.common.model.documents.class').d('流程单据'),
                      },
                    ],
                  })(
                    <Select
                      allowClear
                      style={{ width: '100%' }}
                      disabled={!getFieldValue('categoryId')}
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
                      <InputNumber min={0.1} precision={1} />
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
