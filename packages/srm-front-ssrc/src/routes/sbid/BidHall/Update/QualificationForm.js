/**
 * bidHall - 寻源服务/招标维护 - 资格预审表单
 * @date: 2019-06-27
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
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';

import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

import PretrialPanelModal from './PretrialPanelModal';

const { Option } = Select;
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall'] })
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
      form,
      organizationId,
      header,
      reviewMethods = [],
      changeReviewMethod,
      changeScoreFlag,
      showScoringElement,
      match: { params },
      customizeForm = () => {},
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    const { pretrialPanelVisible = false } = this.state;

    const pretrialPanelProps = {
      sourceHeaderId: params.bidId,
      visible: pretrialPanelVisible,
      onHideModal: this.showPretrialPanel,
    };

    return (
      <>
        {customizeForm(
          {
            code: 'SSRC.BID_HALL_EDIT.EDIT_QUALIFICATION',
            form,
            dataSource: header,
          },
          <Form className="writable-row-custom">
            <Row gutter={48}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.prequalEndDate`).d('预审截止时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalEndDate', {
                    initialValue: header.prequalEndDate && moment(header.prequalEndDate),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.bidHall.model.bidHall.prequalEndDate`)
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
                  label={intl.get(`ssrc.bidHall.model.bidHall.reviewMethod`).d('审查方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('reviewMethod', {
                    initialValue: header.reviewMethod,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.reviewMethod`).d('审查方式'),
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
                  label={intl.get(`ssrc.bidHall.model.bidHall.qualifiedLimit`).d('合格上限')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('qualifiedLimit', {
                    initialValue: header.qualifiedLimit,
                    rules: [
                      {
                        required: getFieldValue('reviewMethod') === 'LIMITED_QUANTITY',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.qualifiedLimit`).d('合格上限'),
                        }),
                      },
                      {
                        pattern: /^\d*$/,
                        message: intl
                          .get('hzero.common.validation.positiveInteger', {
                            name: intl
                              .get(`ssrc.bidHall.model.bidHall.qualifiedLimit`)
                              .d('合格上限'),
                          })
                          .d('合格上限正整数'),
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
            <Row gutter={48}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.prequalFileExpense`).d('预审文件费')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalFileExpense', {
                    initialValue: header.prequalFileExpense,
                    rules: [
                      // {
                      //   required: false,
                      //   message: intl.get('hzero.common.validation.notNull', {
                      //     name: intl
                      //       .get(`ssrc.bidHall.model.bidHall.prequalFileExpense`)
                      //       .d('预审文件费'),
                      //   }),
                      // },
                    ],
                  })(<InputNumber min={0} precision={4} style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.prequalLocation`).d('申请提交地点')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalLocation', {
                    initialValue: header.prequalLocation,
                  })(<Input maxLength={40} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.enableScoreFlag`).d('启用评分细项')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('enableScoreFlag', {
                    initialValue: header.enableScoreFlag,
                  })(
                    <Checkbox
                      defaultValue={0}
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
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.prequalAttachment`).d('资格预审文件')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalAttachmentUuid', {
                    initialValue: header.prequalAttachmentUuid,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.bidHall.model.bidHall.prequalAttachment`)
                            .d('资格预审文件'),
                        }),
                      },
                    ],
                  })(
                    <Upload
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-prequal"
                      attachmentUUID={header.prequalAttachmentUuid}
                      tenantId={organizationId}
                      filePreview
                      {...ChunkUploadProps}
                      fileSize={FILE_SIZE}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  required
                  label={intl.get(`ssrc.common.pretrialPanel`).d('预审小组')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalUserId', {
                    initialValue: header.prequalUserId,
                    rules: [
                      // {
                      //   required: true,
                      //   message: intl.get('hzero.common.validation.notNull', {
                      //     name: intl.get(`ssrc.bidHall.model.bidHall.pretrialPanel`).d('预审小组'),
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
            <Row gutter={48} className="half-row">
              <Col span={12}>
                <FormItem label={intl.get(`ssrc.common.qualRequirements`).d('资质要求')}>
                  {getFieldDecorator('prequalRemark', {
                    initialValue: header.prequalRemark,
                  })(<Input.TextArea />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        <PretrialPanelModal {...pretrialPanelProps} />
      </>
    );
  }
}
