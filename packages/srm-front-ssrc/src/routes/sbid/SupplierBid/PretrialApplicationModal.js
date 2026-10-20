/**
 * PretrialApplicationModal - 预审申请
 * @date: 2019-3-28
 * @author: ZT <tong.zhao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Button, Input, Spin, Icon, Tag, DatePicker } from 'hzero-ui';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { Header } from 'components/Page';
import { getResponse, getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { queryFileList } from 'services/api';
import { PRIVATE_BUCKET } from '_utils/config';

import common from '@/routes/sbid/common.less';
import styles from './PretrialApplicationModal.less';

// const promptCode = 'ssrc.supplierBid';

const { TextArea } = Input;
/**
 * 接收属性
 * @formData - 查询到的预审申请数据
 * @onClose - 关闭弹框
 * @onSave - 保存回调
 * @onSubmit - 提交回调
 * @onlyRead - 是否只读
 * @onClear - 关闭后的回调
 * @visible - 显示/隐藏控制
 * @submitPreApplyLoading - 保存loading
 * @submitPreApplyLoading - 提交loading
 * @selectPreApplyLoading - 预审申请数据查询loading
 */
@Form.create({ fieldNameProp: null })
export default class PretrialApplicationModal extends React.Component {
  state = {
    fileLength: 0, // 资格预审文件个数，用于付费情况下只读展示
  };

  /**
   * 查询资格预审文件数量
   * @param {*} nextProps
   */
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      formData: { prequalAttachmentUuid },
      organizationId,
    } = nextProps;
    const pre = this.props.formData.prequalAttachmentUuid;
    if (prequalAttachmentUuid && prequalAttachmentUuid !== pre) {
      queryFileList({
        organizationId,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-prequal',
        attachmentUUID: prequalAttachmentUuid,
      }).then((fileList) => {
        if (getResponse(fileList)) {
          this.setState({
            fileLength: fileList?.length || 0,
          });
        }
      });
    }
  }

  // 表单数据回调函数
  @Bind
  handleFormData(fn) {
    const {
      supplierCompanyId,
      form: { validateFields },
      formData,
      visible,
      currentAttachmentUuid = null,
    } = this.props;
    const uuid = currentAttachmentUuid || formData.currentAttachmentUuid;
    if (visible) {
      return validateFields((errors, values) => {
        if (!errors) {
          fn({
            supplierPrequalDTO: {
              ...formData,
              ...values,
              currentAttachmentUuid: uuid,
              prequalEndDate: formData.prequalEndDate,
            },
            supplierCompanyId,
          });
        }
      });
    }
  }

  // 当前供应商分类表格
  renderForm() {
    const {
      formData,
      organizationId,
      form = {},
      afterOpenUploadModal = () => {},
      // reviewMethodValues = [],
      quotationStatus,
      quotationStartDate,
      customizeForm = () => {},
    } = this.props;
    const { getFieldDecorator } = form;
    const formProps = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    let onlyRead = false || this.props.onlyRead;
    if (formData && formData.prequalEndDate) {
      onlyRead = moment().isAfter(formData.prequalEndDate, 'YYYY-MM-DD HH:mm:ss')
        ? !(
            quotationStatus === 'RETURN_PREQUAL' &&
            (moment().isBefore(quotationStartDate, 'YYYY-MM-DD HH:mm:ss') || !quotationStartDate)
          )
        : false;
    }
    const { fileLength } = this.state;

    return customizeForm(
      {
        code: 'SSRC.SUPPLIER_BID_LIST.PREQUAL_INFO',
        form,
        dataSource: formData,
      },
      <Form className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Row gutter={48}>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.supplierBid.model.supplierBid.reviewMethod`).d('审查方法')}
              {...formProps}
            >
              {getFieldDecorator('reviewMethodMeaning', {
                initialValue: formData.reviewMethodMeaning,
              })(<Input disabled trim maxLength={40} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.prequalEndDate`)
                .d('申请截止时间')}
              {...formProps}
            >
              {getFieldDecorator('prequalEndDate', {
                initialValue: formData.prequalEndDate && moment(formData.prequalEndDate),
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  showTime={{
                    defaultValue: moment('00:00:00', 'HH:mm:ss'),
                  }}
                  disabled
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.qualifiedUpperLimit`)
                .d('合格上限')}
              {...formProps}
            >
              {getFieldDecorator('qualifiedLimit', {
                initialValue: formData.qualifiedLimit,
              })(<Input disabled trim maxLength={40} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <Form.Item
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.prequalLocation`)
                .d('申请提交地点')}
              {...formProps}
            >
              {getFieldDecorator('prequalLocation', {
                initialValue: formData.prequalLocation,
              })(<Input disabled trim maxLength={40} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.common.qualRequirements`).d('资质要求')}
              {...formProps}
            >
              {getFieldDecorator('prequalRemark', {
                initialValue: formData.prequalRemark,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.prequalificationDocuments`)
                .d('资格预审文件')}
            >
              {getFieldDecorator('prequalAttachmentUuid', {
                initialValue: formData.prequalAttachmentUuid,
              })(
                <div>
                  {formData.fileFreeFlag === 0 ? (
                    <React.Fragment>
                      <a
                        onClick={this.openUploadModal}
                        style={{ pointerEvents: 'none', marginLeft: '20px' }}
                        disabled
                      >
                        <Icon type="download" />
                        {intl.get('hzero.common.upload.view').d('查看附件')}
                      </a>
                      {fileLength > 0 ? (
                        <Tag
                          color="#108ee9"
                          style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
                        >
                          {fileLength}
                        </Tag>
                      ) : null}
                    </React.Fragment>
                  ) : (
                    <UploadModal
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-prequal"
                      attachmentUUID={formData.prequalAttachmentUuid}
                      tenantId={organizationId}
                      viewOnly
                      icon="download"
                    />
                  )}
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <Form.Item
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.applicationDocuments`)
                .d('预审申请文件')}
              {...formProps}
            >
              {getFieldDecorator('currentAttachmentUuid', {
                initialValue: formData.currentAttachmentUuid,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierBid.model.supplierBid.applicationDocuments`)
                        .d('预审申请文件'),
                    }),
                  },
                ],
              })(
                <UploadModal
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-prequal"
                  viewOnly={onlyRead}
                  attachmentUUID={formData.currentAttachmentUuid}
                  tenantId={organizationId}
                  fileSize={FIlESIZE}
                  afterOpenUploadModal={afterOpenUploadModal}
                  {...ChunkUploadProps}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row className="half-row" gutter={48}>
          <Col span={12}>
            <Form.Item
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.applicationNotes`)
                .d('预审申请说明')}
            >
              {getFieldDecorator('applicationRemark', {
                initialValue: formData.applicationRemark,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierBid.model.supplierBid.applicationNotes`)
                        .d('预审申请说明'),
                    }),
                  },
                ],
              })(<TextArea trim disabled={onlyRead} maxLength={40} />)}
            </Form.Item>
          </Col>
        </Row>

        <Row className="half-row" gutter={48}>
          {quotationStatus === 'RETURN_PREQUAL' ? (
            <Col span={12}>
              <Form.Item
                label={intl.get(`ssrc.supplierBid.model.supplierBid.returnRemark`).d('退回说明')}
                {...formProps}
              >
                {getFieldDecorator('returnRemark', {
                  initialValue: formData.returnRemark,
                })(<TextArea trim disabled />)}
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    );
  }

  render() {
    const {
      queryLoading,
      selectPreApplyLoading = false,
      savePreApplyLoading,
      submitPreApplyLoading,
      formData: { prequalEndDate = '' },
      onClose,
      onClear,
      visible,
      onSave,
      onSubmit,
      formData,
      onlyRead = false,
      quotationStatus,
      quotationStartDate,
    } = this.props;
    const modalTitle =
      quotationStatus === 'RETURN_PREQUAL' ? (
        <span>
          {intl.get(`ssrc.supplierBid.view.message.title.applyPrequal`).d('资格预审申请')}
          <span style={{ marginLeft: '12px', color: '#aaa', fontSize: '12px' }}>
            {intl
              .get(`ssrc.supplierBid.view.message.title.returnedTip`)
              .d('资格预审申请被退回，请重新提交！')}
          </span>
        </span>
      ) : (
        intl.get(`ssrc.supplierBid.view.message.title.applyPrequal`).d('资格预审申请')
      );
    const flag =
      prequalEndDate && moment().isAfter(prequalEndDate, 'YYYY-MM-DD HH:mm:ss')
        ? !(
            quotationStatus === 'RETURN_PREQUAL' &&
            (moment().isBefore(quotationStartDate, 'YYYY-MM-DD HH:mm:ss') || !quotationStartDate)
          )
        : false;
    const title = (
      <Header title={modalTitle}>
        <React.Fragment>
          {onlyRead || flag || selectPreApplyLoading ? null : (
            <Button
              type="primary"
              loading={submitPreApplyLoading || queryLoading}
              disabled={submitPreApplyLoading || queryLoading}
              onClick={() => this.handleFormData(onSubmit)}
              style={{ marginRight: 24 }}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
          )}
          {onlyRead ||
          flag ||
          formData.prequalLineStatus === 'SUBMITED' ||
          selectPreApplyLoading ? null : (
            <Button loading={savePreApplyLoading} onClick={() => this.handleFormData(onSave)}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </React.Fragment>
      </Header>
    );
    return (
      <Modal
        visible={visible}
        width={1000}
        maskClosable
        destroyOnClose
        afterClose={onClear}
        wrapClassName={classNames([styles.modal_header_adjust])}
        title={title}
        onCancel={onClose}
        footer={null}
      >
        <Spin spinning={selectPreApplyLoading}>{this.renderForm()}</Spin>
      </Modal>
    );
  }
}
