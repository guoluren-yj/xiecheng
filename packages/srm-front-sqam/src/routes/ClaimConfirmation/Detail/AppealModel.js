import React, { Component, Fragment } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import UploadModal from '_components/Upload/index';
import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
@formatterCollections({
  code: ['spcm.common'],
})
@Form.create({ fieldNameProp: null })
// @withCustomize({
//   unitCode: ['SQAM.CLAIM_CONFIRMATION_DETAIL.REASON'],
// })
export default class componentName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      supplierAttachmentUuid: null,
    };
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { dataSource = {} } = this.props;
    if (isEmpty(dataSource.supplierAttachmentUuid)) {
      this.bindHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * bindHeaderAttachmentUuid - 绑定头附件id
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  bindHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch, formHeaderId, handleSearchLine, handleSearchHead } = this.props;
    dispatch({
      type: 'claimOrder/bindHeaderAttachmentUuid',
      payload: {
        formHeaderId,
        attachmentUuid,
      },
    }).then(res => {
      if (res) {
        handleSearchLine();
        handleSearchHead();
      }
    });
  }

  /**
   * 确认回调
   */
  @Bind()
  handleOk() {
    const {
      onOk,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        if (onOk) {
          onOk(values);
          this.handleCancel();
        }
      }
    });
  }

  @Bind()
  handleCancel() {
    const {
      onClose,
      form: { resetFields },
    } = this.props;
    resetFields();
    onClose();
  }

  render() {
    const {
      AppealModelVisible,
      loading,
      dataSource = {},
      applyTimes,
      form: { getFieldDecorator },
      appealContentSelects = [],
      customizeForm,
      form,
    } = this.props;
    const { supplierAttachmentUuid } = this.state;
    const uploadModalProps = {
      btnText: intl.get(`sqam.common.button.uploadAttachment`).d('附件上传'),
      btnProps: {
        icon: 'upload',
        disabled: !dataSource.formHeaderId,
      },
      showFilesNumber: false,
      attachmentUUID: dataSource.supplierAttachmentUuid || supplierAttachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };
    return (
      <Modal
        className={styles['reject-modal']}
        footer={
          <Fragment>
            <Button onClick={this.handleCancel}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
            <Button type="primary" onClick={this.handleOk} loading={loading}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          </Fragment>
        }
        title={intl.get(`spcm.common.title.statementReason`).d('申诉原因')}
        onCancel={this.handleCancel}
        visible={AppealModelVisible}
      >
        {customizeForm(
          {
            code: 'SQAM.CLAIM_CONFIRMATION_DETAIL.REASON',
            form,
            dataSource,
          },
          <Form>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={intl.get('sqam.common.model.applyTimes').d('申诉次数')}
                  labelCol={{ span: 6, offset: 0 }}
                  wrapperCol={{ span: 18 }}
                >
                  {getFieldDecorator('applyTimes')(<span>{applyTimes}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`sqam.common.panel.statementContent`).d('申诉内容')}
                  labelCol={{ span: 6, offset: 0 }}
                  wrapperCol={{ span: 18 }}
                >
                  {getFieldDecorator('appealContent', {
                    initialValue:
                      appealContentSelects.length > 0 ? appealContentSelects[0].value : 'AMOUNT',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spcm.common.panel.statementContent`).d('申诉内容'),
                        }),
                      },
                    ],
                  })(
                    <Select style={{ width: '100%' }} allowClear>
                      {appealContentSelects.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`sqam.common.button.uploadAttachment`).d('附件上传')}
                  labelCol={{ span: 6, offset: 0 }}
                  wrapperCol={{ span: 18 }}
                >
                  {getFieldDecorator('supplierAttachmentUuid')(
                    <UploadModal {...uploadModalProps} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <FormItem
                  label={intl.get(`sqam.common.model.statementOption`).d('申诉意见')}
                  labelCol={{ span: 6, offset: 0 }}
                  wrapperCol={{ span: 18 }}
                >
                  {getFieldDecorator('appealOpinion', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sqam.common.model.statementOption`).d('申诉意见'),
                        }),
                      },
                    ],
                  })(<TextArea className={styles['text-area']} rows={4} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
