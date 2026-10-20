/**
 * PretrialApplicationGroupingModal - 预审申请_分组(分标段)
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
  Checkbox,
} from 'hzero-ui';
import classNames from 'classnames';
import { isFunction, isEmpty, compose } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import UploadModal from 'srm-front-boot/lib/components/Upload/index';

import { getResponse, getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import { queryFileList, queryMapIdpValue } from 'services/api';
import notification from 'utils/notification';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { PRIVATE_BUCKET } from '_utils/config';

import common from '@/routes/ssrc/common.less';
import PrequalPanel from '@/routes/ssrc/components/PrequalPanel';
import { BID } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';
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
 * @savePreApplyGroupLoading - 保存loading
 * @submitPreApplyGroupLoading - 提交loading
 * @selectPreApplyGroupLoading - 预审申请数据查询loading
 */
class PretrialApplicationModal extends React.Component {
  state = {
    fileLength: 0, // 资格预审文件个数，用于付费情况下只读展示
    currentAttachmentUuid: null, // 资格预审申请文件的uuid
    showCheckBoxFlag: false, // 是否开启
    prequalCheckedKeyList: [], // 资格预审勾选集合
    hideTipsFlag: false, // 是否隐藏提交时tips
    lovList: {}, // 值集数据
  };

  modalInfo = null;

  prequalPanelRef = null;

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
    const { prequalCheckedKeyList = [] } = this.state;
    currentAttachmentUuid = currentAttachmentUuid || formData.currentAttachmentUuid;

    if (prequalCheckedKeyList?.length === 1) {
      // 仅提交当前组时, 提示
      notification.warning({
        message: intl
          .get(`ssrc.supplierQuotation.view.validation.submitCurrentGroupPrequalMsg`)
          .d(
            '是否确认仅提交当前分组的资格预审信息？若需要批量提交所有分组，请先点击选择分组按钮，勾选分组后一起提交'
          ),
      });
      return;
    }
    return validateFields((errors, values) => {
      if (!errors) {
        fn({
          supplierPrequalDTO: {
            ...formData,
            ...values,
            supplierCompanyId,
            currentAttachmentUuid,
            prequalEndDate: formData.prequalEndDate,
          },
          supplierCompanyId,
        });
      }
    });
  }

  /**
   * `下次不再显示勾选框` 切换状态
   */
  @Bind()
  handleChangeHideTips(e) {
    this.setState({
      hideTipsFlag: e.target.checked,
    });
  }

  /**
   * `下次不再显示info-modal`, 点击确认
   */
  @Bind()
  handleTipsModalOk(cb, params) {
    if (this.modalInfo) {
      // 用户记忆
      this.modalInfo.destroy();
      // eslint-disable-next-line no-unused-expressions
      isFunction(cb) && cb(params);
    }
  }

  // 提交
  @Bind()
  handleSubmit(fn) {
    const {
      supplierCompanyId,
      form: { validateFields },
      formData,
    } = this.props;
    let { currentAttachmentUuid } = this.state;
    const { hideTipsFlag = false, prequalCheckedKeyList = [] } = this.state;
    currentAttachmentUuid = currentAttachmentUuid || formData.currentAttachmentUuid;
    return validateFields((errors, values) => {
      if (!errors) {
        const params = {
          supplierPrequalDTO: {
            ...formData,
            ...values,
            supplierCompanyId,
            currentAttachmentUuid,
            prequalEndDate: formData.prequalEndDate,
          },
          supplierCompanyId,
          prequalGroupHeaderIds: isEmpty(prequalCheckedKeyList)
            ? [formData.prequalGroupHeaderId]
            : prequalCheckedKeyList,
        };
        if (prequalCheckedKeyList?.length === 1 && !hideTipsFlag) {
          this.modalInfo = Modal.info({
            title: intl.get(`ssrc.supplierQuotation.view.title.tips`).d('提示'),
            content: (
              <div>
                <span>
                  {intl
                    .get(`ssrc.supplierQuotation.view.message.submitCurrentGroupPrequalMsg`)
                    .d(
                      '是否确认仅提交当前分组的资格预审信息？若需要批量提交所有分组，请先点击选择分组按钮，勾选分组后一起提交'
                    )}
                </span>
                <Checkbox onChange={this.handleChangeHideTips}>
                  <span>
                    {intl
                      .get(`ssrc.supplierQuotation.view.message.neverShowAgainTips`)
                      .d('下次不再提示')}
                  </span>
                </Checkbox>
              </div>
            ),
            onOk: () => this.handleTipsModalOk(fn, params),
          });
        } else {
          fn(params);
        }
      }
    });
  }

  @Bind
  afterOpenUploadModal(attachmentUUID) {
    if (attachmentUUID) {
      this.setState({ currentAttachmentUuid: attachmentUUID });
    }
  }

  /**
   * 切换checkbox后需要更新state
   */
  @Bind()
  afterChangeCheckbox(checkedKeyList) {
    this.setState({
      prequalCheckedKeyList: checkedKeyList,
    });
  }

  /**
   * 控制开关checkbox
   */
  @Bind()
  handleToggleCheckBox() {
    const { showCheckBoxFlag } = this.state;
    this.setState({
      showCheckBoxFlag: !showCheckBoxFlag,
      prequalCheckedKeyList: [],
    });
    // eslint-disable-next-line no-unused-expressions
    this.prequalPanelRef &&
      isFunction(this.prequalPanelRef.refreshInternalState) &&
      this.prequalPanelRef.refreshInternalState();
  }

  /**
   * 切换资格预审item后的钩子函数
   * @param {*} item - 资格预审组item
   */
  @Bind()
  afterChangeItem(item) {
    const { form, supplierCompanyId, fetchPretrialApplicationData } = this.props;
    // 重置表单form
    form.resetFields();
    this.setState({
      currentAttachmentUuid: null, // 清空uuid
    });
    // eslint-disable-next-line no-unused-expressions
    isFunction(fetchPretrialApplicationData) &&
      fetchPretrialApplicationData(supplierCompanyId, item.prequalGroupHeaderId).then((res) => {
        if (res && !res.currentAttachmentUuid) {
          this.setState({
            currentAttachmentUuid: uuidv4(),
          });
        }
      });
  }

  /**
   * 切换资格预审item前校验
   */
  @Bind()
  async validateDataBeforeChangeItem(item) {
    // 校验通过直接保存+切换item, 校验不通过弹窗提示
    return this.validateData(item);
  }

  async validateData(item) {
    const {
      supplierCompanyId,
      form: { validateFields },
      formData,
      onSave,
    } = this.props;
    let { currentAttachmentUuid } = this.state;
    const { prequalGroupHeaderId } = item;
    currentAttachmentUuid = currentAttachmentUuid || formData.currentAttachmentUuid;
    if (formData.prequalGroupSupplierLineStatus === 'APPROVED') return true; // 审批后的数据, 无需保存
    return new Promise((resolve) => {
      validateFields(async (errors, values) => {
        if (!errors) {
          const res = await onSave({
            supplierPrequalDTO: {
              ...formData,
              ...values,
              supplierCompanyId,
              currentAttachmentUuid,
              prequalEndDate: formData.prequalEndDate,
            },
            supplierCompanyId,
            prequalGroupHeaderId,
          });
          if (getResponse(res)) return resolve(true);
          return resolve(false);
        } else {
          // 校验不通过
          Modal.confirm({
            title: intl
              .get(`ssrc.supplierQuotation.view.title.giveupSaveMessage`)
              .d('是否放弃保存当前页，直接切换?'),
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        }
      });
    });
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
    const { currentAttachmentUuid, lovList = {} } = this.state;
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
    const approvedFlag = formData.prequalGroupSupplierLineStatus === 'APPROVED'; // 如果已经审批, 禁止编辑
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
              <Col span={12}>
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
              <Col span={12}>
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
            </Row>
            <Row gutter={48}>
              {/* <Col span={12}>
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
              <Col span={12}>
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
              <Col span={12}>
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
            </Row>
            <Row gutter={48}>
              <Col span={12}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.qualRequirementDetails`)
                    .d('资质要求细项')}
                  {...formProps}
                >
                  {getFieldDecorator('qualRequirementDetails')(
                    <a onClick={() => onShowQualRequirementsDetails(true)}>
                      {intl.get('hzero.common.button.view').d('查看')}
                    </a>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
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
              <Col span={12}>
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
              <Col span={12}>
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
                      viewOnly={onlyRead || flag || approvedFlag}
                      attachmentUUID={formData.currentAttachmentUuid || currentAttachmentUuid}
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
                  })(<TextArea trim disabled={onlyRead || flag || approvedFlag} maxLength={120} />)}
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
      submitPreApplyGroupLoading = false,
      selectPreApplyGroupLoading = false,
      savePreApplyGroupLoading = false,
      prequalLineStatus,
      formData: { prequalEndDate = '' },
      onClose,
      // onClear,
      visible,
      onSubmit,
      onlyRead = false,
      quotationStartDate,
      mergeType,
      supplierCompanyId,
      sourceProjectId,
      prequalGroupHeaderId,
    } = this.props;
    const { showCheckBoxFlag } = this.state;
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
    const prequalPanelProps = {
      showCheckBoxFlag,
      layoutType: 'right',
      queryParams: {
        sourceProjectId,
        supplierCompanyId,
        prequalGroupHeaderId,
      },
      afterChangeCheckbox: this.afterChangeCheckbox,
      validateDataBeforeChangeItem: this.validateDataBeforeChangeItem,
      afterChangeItem: this.afterChangeItem,
    };
    return (
      <Modal
        visible={visible}
        width={1000}
        closable
        maskClosable
        destroyOnClose
        // afterClose={onClear}
        // wrapClassName={classNames([styles.modal_header_adjust])}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        onCancel={onClose}
        style={{ paddingTop: 0 }}
        footer={
          onlyRead || flag ? null : (
            <React.Fragment>
              <Button
                type="primary"
                loading={
                  submitPreApplyGroupLoading ||
                  selectPreApplyGroupLoading ||
                  savePreApplyGroupLoading
                }
                onClick={() => this.handleSubmit(onSubmit)}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
              {mergeType !== 'ALL' && (
                <Button onClick={this.handleToggleCheckBox}>
                  {showCheckBoxFlag
                    ? intl.get('ssrc.supplierQuotation.view.button.cancelSelect').d('取消选择')
                    : mergeType === 'GROUP'
                    ? intl.get('ssrc.supplierQuotation.view.button.selectGroup').d('选择分组')
                    : intl.get('ssrc.supplierQuotation.view.button.selectSection').d('选择标段')}
                </Button>
              )}
              {/* <Button
                loading={savePreApplyGroupLoading}
                onClick={() => this.handleFormData(onSave)}
                disabled={prequalLineStatus === 'SUBMITED'}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button> */}
              <Button onClick={onClose}>{intl.get('hzero.common.button.close').d('关闭')}</Button>
            </React.Fragment>
          )
        }
      >
        <Spin
          spinning={
            submitPreApplyGroupLoading || savePreApplyGroupLoading || selectPreApplyGroupLoading
          }
        >
          {mergeType ? (
            <PrequalPanel
              ref={(vnode) => {
                this.prequalPanelRef = vnode;
              }}
              {...prequalPanelProps}
            >
              {this.renderForm()}
            </PrequalPanel>
          ) : (
            this.renderForm()
          )}
        </Spin>
      </Modal>
    );
  }
}

const hocComponent = (Comp, sourceKey = '') => {
  return compose(
    withCustomize({
      unitCode: [
        `SSRC_${sourceKey}SUPPLIER_PREQUAL.DATA`, // RFQ预审申请
      ],
    }),
    Form.create({ fieldNameProp: null })
  )(Comp);
};
const BidPretrialApplicationGroupingModal = CombineComponent({
  sourceKey: BID,
})(hocComponent(PretrialApplicationModal, `${BID}_`));

export { hocComponent, BidPretrialApplicationGroupingModal };

export default hocComponent(PretrialApplicationModal);
