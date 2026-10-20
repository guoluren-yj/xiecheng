/**
 * inquiryHall - 寻源服务 - 资格预审表单
 * @date: 2019-08-09
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, InputNumber, DatePicker } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT, EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE } from '@/utils/SsrcRegx';

import PretrialPanelModal from './PretrialPanelModal';
import styles from './index.less';

const { Option } = Select;
const FormItem = Form.Item;
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
export default class QualificationForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pretrialPanelVisible: false, // 预审小组弹框显隐
    };
  }

  /**
   * 预审小组弹框显隐
   */
  @Bind()
  showPretrialPanel(visible) {
    this.setState({
      pretrialPanelVisible: visible,
    });
  }

  /**
   * 资格预审表
   */
  render() {
    const {
      form = {},
      organizationId,
      header,
      reviewMethods = [],
      changeReviewMethod,
      changeScoreFlag,
      showScoringElement,
      rfxId,
      customizeForm = () => {},
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { pretrialPanelVisible = false } = this.state;

    const pretrialPanelProps = {
      sourceHeaderId: rfxId,
      visible: pretrialPanelVisible,
      onHideModal: this.showPretrialPanel,
    };

    return (
      <React.Fragment>
        {customizeForm(
          { code: 'SSRC.INQUIRY_HALL_EDIT.PREQUAL', form, dataSource: header },
          <Form className="writable-row-custom">
            <Row gutter={48} className={styles.headerInfo}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                    .d('预审截止时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalEndDate', {
                    initialValue: header.prequalEndDate && moment(header.prequalEndDate),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                            .d('预审截止时间'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateTimeFormat()}
                      showTime
                      disabledDate={(currentDate) =>
                        getFieldValue('quotationStartDate') &&
                        moment(getFieldValue('quotationStartDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.reviewMethod`).d('审查方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('reviewMethod', {
                    initialValue: header.reviewMethod,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.reviewMethod`)
                            .d('审查方式'),
                        }),
                      },
                    ],
                  })(
                    <Select onChange={(value) => changeReviewMethod(value)}>
                      {reviewMethods &&
                        reviewMethods.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.qualifiedLimit`)
                    .d('合格上限')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('qualifiedLimit', {
                    initialValue: header.qualifiedLimit,
                    rules: [
                      {
                        required: getFieldValue('reviewMethod') === 'LIMITED_QUANTITY',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.qualifiedLimit`)
                            .d('合格上限'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled={getFieldValue('reviewMethod') === 'QUALIFIED'}
                      min={0}
                      step={1}
                      presion={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className={styles.headerInfo}>
              <Col span={8} style={{ display: 'none' }}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.prequalFileExpense`)
                    .d('预审文件费')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalFileExpense', {
                    initialValue: 0,
                    rules: [
                      {
                        required: false,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.prequalFileExpense`)
                            .d('预审文件费'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} precision={4} style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.prequalLocation`)
                    .d('申请提交地点')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalLocation', {
                    initialValue: header.prequalLocation,
                  })(<Input maxLength={40} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.enableScoreFlag`)
                    .d('启用评分细项')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('enableScoreFlag', {
                    initialValue: header.enableScoreFlag || 0,
                  })(
                    <Checkbox
                      // defaultValue={0}
                      checkedValue={1}
                      onCheckedValue={0}
                      onChange={changeScoreFlag}
                    />
                  )}
                  {getFieldValue('enableScoreFlag') ? (
                    <span>
                      <a onClick={showScoringElement}>
                        {intl.get('hzero.common.button.edit').d('编辑')}
                      </a>
                    </span>
                  ) : null}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.prequalAttachment`)
                    .d('资格预审文件')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalAttachmentUuid', {
                    initialValue: header.prequalAttachmentUuid,
                  })(
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-prequal"
                      attachmentUUID={header.prequalAttachmentUuid}
                      tenantId={organizationId}
                      fileSize={FIlESIZE}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className={styles.headerInfo}>
              <Col span={8}>
                <FormItem
                  required
                  label={intl.get(`ssrc.common.pretrialPanel`).d('预审小组')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('pretrialPanel', {
                    rules: [
                      // {
                      //   required: isEmpty(pretrialPanelList),
                      //   message: intl.get('hzero.common.validation.notNull', {
                      //     name: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialPanel`).d('预审小组'),
                      //   }),
                      // },
                    ],
                  })(
                    <a onClick={() => this.showPretrialPanel(true)}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </a>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className={styles.headerInfo}>
              <Col span={12}>
                <FormItem
                  label={intl.get(`ssrc.common.qualRequirements`).d('资质要求')}
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                >
                  {getFieldDecorator('prequalRemark', {
                    initialValue: header.prequalRemark,
                  })(<TextArea rows={2} style={{ marginLeft: '-6px' }} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        <PretrialPanelModal {...pretrialPanelProps} />
      </React.Fragment>
    );
  }
}
