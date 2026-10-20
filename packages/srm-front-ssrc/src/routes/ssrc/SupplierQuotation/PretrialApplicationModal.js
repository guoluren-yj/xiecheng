/**
 * PretrialApplicationModal - 预审申请
 * @date: 2019-3-28
 * @author: ZT <tong.zhao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import {
  Modal,
  Form,
  Col,
  Row,
  Button,
  Input,
  Spin,
  Icon,
  Tag,
  Select,
  DatePicker,
} from 'hzero-ui';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { getResponse, getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import { queryFileList, queryMapIdpValue } from 'services/api';
import { compose } from 'lodash';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { PRIVATE_BUCKET } from '_utils/config';
import common from '@/routes/ssrc/common.less';
import styles from './PretrialApplicationModal.less';

const { Option } = Select;
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
class PretrialApplicationModal extends React.Component {
  state = {
    fileLength: 0, // 资格预审文件个数，用于付费情况下只读展示
    currentAttachmentUuid: null, // 资格预审申请文件的uuid
    lovList: {}, // 值集数据
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

  componentDidMount() {
    this.queryLov();
  }

  queryLov = async () => {
    const lovCodes = {
      reviewMethodValues: 'SSRC.REVIEW_METHOD', // 审查方式
    };

    let data = null;
    try {
      data = await queryMapIdpValue(lovCodes);
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        lovList: data,
      });
    } catch (e) {
      throw e;
    }
  };

  // 表单数据回调函数
  @Bind
  handleFormData(fn) {
    const {
      supplierCompanyId,
      form: { validateFields },
      formData,
    } = this.props;
    let { currentAttachmentUuid } = this.state;
    const { prequalHeaderId, prequalGroupHeaderId } = formData || {};
    currentAttachmentUuid = currentAttachmentUuid || formData.currentAttachmentUuid;
    if (!prequalGroupHeaderId && !prequalHeaderId) {
      return;
    }

    return validateFields((errors, values) => {
      if (!errors) {
        fn({
          supplierPrequalDTO: {
            ...formData,
            ...values,
            currentAttachmentUuid,
            prequalEndDate: formData.prequalEndDate,
          },
          supplierCompanyId,
        });
      }
    });
  }

  @Bind
  afterOpenUploadModal(attachmentUUID) {
    if (attachmentUUID) {
      this.setState({ currentAttachmentUuid: attachmentUUID });
    }
  }

  // 当前供应商分类表格
  renderForm() {
    const {
      onlyRead,
      organizationId,
      // reviewMethodValues = [],
      formData,
      onShowQualRequirementsDetails,
      form = {},
      customizeForm = () => {},
      prequalLineStatus,
      quotationStartDate,
      sourceKey = '',
    } = this.props;
    const { lovList = {} } = this.state;
    const { reviewMethodValues = [] } = lovList;

    const { getFieldDecorator } = form;
    const formProps = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const { fileLength } = this.state;
    const flag =
      formData.prequalEndDate && moment().isAfter(formData.prequalEndDate, 'YYYY-MM-DD HH:mm:ss')
        ? !(
            prequalLineStatus === 'RETURN_PREQUAL' &&
            (moment().isBefore(quotationStartDate, 'YYYY-MM-DD HH:mm:ss') || !quotationStartDate)
          )
        : false;
    return (
      <React.Fragment>
        {customizeForm(
          {
            code: `SSRC_${sourceKey === '' ? '' : 'BID_'}SUPPLIER_PREQUAL.DATA`,
            form,
            dataSource: formData,
          },
          <Form className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.prequalLocation`)
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
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.applicationDeadline`)
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
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.reviewMethod`).d('审查方式')}
                  {...formProps}
                >
                  {getFieldDecorator('reviewMethod', {
                    initialValue: formData.reviewMethod,
                  })(
                    <Select allowClear disabled>
                      {reviewMethodValues &&
                        reviewMethodValues.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              {/* <Col span={8}>
            <Form.Item
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.documentReviewFee`)
                .d('审查文件费')}
              {...formProps}
            >
              {getFieldDecorator('prequalFileExpense', {
                initialValue: formData.fileFreeFlag === 0 ? formData.prequalFileExpense : 0,
              })(<Input disabled trim maxLength={40} />)}
            </Form.Item>
          </Col> */}
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.qualifiedUpperLimit`)
                    .d('合格上限')}
                  {...formProps}
                >
                  {getFieldDecorator('qualifiedLimit', {
                    initialValue: formData.qualifiedLimit,
                  })(<Input disabled trim maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.qualRequirementDetails`)
                    .d('资质要求细项')}
                  {...formProps}
                >
                  {getFieldDecorator('qualRequirementDetails')(
                    <a onClick={() => onShowQualRequirementsDetails()}>
                      {intl.get('hzero.common.button.view').d('查看')}
                    </a>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.common.qualRequirements`).d('资质要求')}
                  {...formProps}
                >
                  {getFieldDecorator('prequalRemark', {
                    initialValue: formData.prequalRemark,
                  })(<TextArea disabled trim maxLength={120} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.prequalDoc`)
                    .d('资格预审文件')}
                  {...formProps}
                >
                  {getFieldDecorator(
                    'prequalAttachmentUuid',
                    {}
                  )(
                    <span>
                      {formData.fileFreeFlag === 0 ? (
                        <React.Fragment>
                          <a
                            onClick={this.openUploadModal}
                            style={{ pointerEvents: 'none' }}
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
                          fileSize={FIlESIZE}
                          bucketName={PRIVATE_BUCKET}
                          bucketDirectory="ssrc-rfx-prequal"
                          attachmentUUID={
                            formData.prequalAttachmentUuid === null
                              ? undefined
                              : formData.prequalAttachmentUuid
                          }
                          tenantId={organizationId}
                          viewOnly
                          icon="download"
                        />
                      )}
                    </span>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.applicationFile`)
                    .d('申请文件')}
                  {...formProps}
                >
                  {getFieldDecorator('currentAttachmentUuid', {
                    initialValue: formData.currentAttachmentUuid,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.supplierQuotation.model.supQuo.applicationFile`)
                            .d('申请文件'),
                        }),
                      },
                    ],
                  })(
                    <UploadModal
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-prequal"
                      fileSize={FIlESIZE}
                      viewOnly={onlyRead || flag}
                      attachmentUUID={
                        formData.currentAttachmentUuid === null
                          ? undefined
                          : formData.currentAttachmentUuid
                      }
                      tenantId={organizationId}
                      afterOpenUploadModal={this.afterOpenUploadModal}
                      {...ChunkUploadProps}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row className="half-row" gutter={48}>
              <Col className={styles.labelStyle} span={12}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.applicationNotes`)
                    .d('申请说明')}
                  {...formProps}
                >
                  {getFieldDecorator('applicationRemark', {
                    initialValue: formData.applicationRemark,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.supplierQuotation.model.supQuo.applicationNotes`)
                            .d('申请说明'),
                        }),
                      },
                    ],
                  })(<TextArea trim disabled={onlyRead || flag} maxLength={120} />)}
                </Form.Item>
              </Col>
            </Row>
            {prequalLineStatus === 'RETURN_PREQUAL' && (
              <Row className="half-row" gutter={48}>
                <Col className={styles.labelStyle} span={12}>
                  <Form.Item
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.returnRemark`)
                      .d('退回说明')}
                    {...formProps}
                  >
                    {getFieldDecorator('returnRemark', {
                      initialValue: formData.returnRemark,
                    })(<TextArea trim disabled />)}
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Form>
        )}
      </React.Fragment>
    );
  }

  render() {
    const {
      selectPreApplyLoading = false,
      savePreApplyLoading,
      submitPreApplyLoading,
      prequalLineStatus,
      formData: { prequalEndDate = '' },
      onClose,
      // onClear,
      visible,
      onSave,
      onSubmit,
      onlyRead = false,
      quotationStartDate,
    } = this.props;
    const title =
      prequalLineStatus === 'RETURN_PREQUAL' ? (
        <span>
          {intl.get(`ssrc.supplierQuotation.view.message.title.applyPrequal`).d('资格预审申请')}
          <span style={{ marginLeft: '12px', color: '#aaa', fontSize: '12px' }}>
            {intl
              .get(`ssrc.supplierQuotation.view.message.title.returnedTip`)
              .d('资格预审申请被退回，请重新提交！')}
          </span>
        </span>
      ) : (
        intl.get(`ssrc.supplierQuotation.view.message.title.applyPrequal`).d('资格预审申请')
      );
    const flag =
      prequalEndDate && moment().isAfter(prequalEndDate, 'YYYY-MM-DD HH:mm:ss')
        ? !(
            prequalLineStatus === 'RETURN_PREQUAL' &&
            (moment().isBefore(quotationStartDate, 'YYYY-MM-DD HH:mm:ss') || !quotationStartDate)
          )
        : false;
    return (
      <Modal
        visible={visible}
        width={1000}
        maskClosable
        destroyOnClose
        // afterClose={onClear}
        // wrapClassName={classNames([styles.modal_header_adjust])}
        title={title}
        onCancel={onClose}
        footer={
          onlyRead || flag ? null : (
            <React.Fragment>
              <Button
                loading={savePreApplyLoading}
                onClick={() => this.handleFormData(onSave)}
                disabled={prequalLineStatus === 'SUBMITED'}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                type="primary"
                loading={submitPreApplyLoading}
                onClick={() => this.handleFormData(onSubmit)}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
            </React.Fragment>
          )
        }
      >
        <Spin spinning={selectPreApplyLoading}>{this.renderForm()}</Spin>
      </Modal>
    );
  }
}

const withStandardCompEnhancer = (Comp, sourceKey = '') => {
  return compose(
    withCustomize({
      unitCode: [
        `SSRC_${sourceKey}SUPPLIER_PREQUAL.DATA`, // RFQ预审申请
      ],
    }),
    Form.create({ fieldNameProp: null })
  )(Comp);
};

export { withStandardCompEnhancer, PretrialApplicationModal };

export default withStandardCompEnhancer(PretrialApplicationModal);
