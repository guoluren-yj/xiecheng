import React from 'react';
import intl from 'utils/intl';
import { Form, Row, Col, Input, DatePicker } from 'hzero-ui';
import classnames from 'classnames';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { getDateTimeFormat } from 'utils/utils';
import moment from 'moment';
// import DisplayFormItem from '../DisplayFormItem';

const { TextArea } = Input;
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class CreateForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const {
      form: { getFieldDecorator },
      questionInformationHeader = {},
      customizeForm,
      rfxTitle,
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.EXPERT_SCORE_MANAGE.SUPPLIER.REVIEW_NEW_BASICS',
        form: this.props.form,
        dataSource: questionInformationHeader,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.clarifyNotifyNum`)
                .d('澄清通知编号')}
              // value={questionInformationHeader.clarifyNotifyNum}
              value={getFieldDecorator('clarifyNotifyNum')(<span>{questionInformationHeader.clarifyNotifyNum}</span>)}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.clarifyNotifyNum`)
                .d('澄清通知编号')}
            >
              {getFieldDecorator('clarifyNotifyNum', {
                initialValue: questionInformationHeader.clarifyNotifyNum,
              })(<span>{questionInformationHeader.clarifyNotifyNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get('ssrc.common.company').d('公司')}
              value={questionInformationHeader.companyName}
            /> */}
            <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={intl.get('ssrc.common.company').d('公司')}>
              {getFieldDecorator('companyName', {
                initialValue: questionInformationHeader.companyName,
              })(<span>{questionInformationHeader.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号')}
              value={questionInformationHeader.sourceNum}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号')}
            >
              {getFieldDecorator('sourceNum', {
                initialValue: questionInformationHeader.sourceNum,
              })(<span>{questionInformationHeader.sourceNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.submittedDate`).d('提交时间')}
              value={questionInformationHeader.submittedDate}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.submittedDate`).d('提交时间')}
            >
              {getFieldDecorator('submittedDate', {
                initialValue: questionInformationHeader.submittedDate,
              })(<span>{questionInformationHeader.submittedDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyName`).d('供应商')}
              value={questionInformationHeader.supplierCompanyName}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyName`).d('供应商')}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: questionInformationHeader.supplierCompanyName,
              })(<span>{questionInformationHeader.supplierCompanyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationHeaderNum`)
                .d('投标单号')}
              value={questionInformationHeader.quotationHeaderNum}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationHeaderNum`)
                .d('投标单号')}
            >
              {getFieldDecorator('quotationHeaderNum', {
                initialValue: questionInformationHeader.quotationHeaderNum,
              })(<span>{questionInformationHeader.quotationHeaderNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="inclusion-row">
          <Col {...FORM_COL_3_LAYOUT} style={{ clear: 'both' }}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.replyEndDate`).d('回复截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('replyEndDate', {
                initialValue:
                  questionInformationHeader.replyEndDate &&
                  moment(questionInformationHeader.replyEndDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.replyEndDate`)
                        .d('回复截止时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  placeholder=""
                  format={getDateTimeFormat()}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.publisher`).d('发布人')}
              value={questionInformationHeader.userName}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.publisher`).d('发布人')}
            >
              {getFieldDecorator('userName')(<span>{questionInformationHeader.userName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.status`).d('状态')}
              value={questionInformationHeader.clarifyNotifyStatusMeaning}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.status`).d('状态')}
            >
              {getFieldDecorator('clarifyNotifyStatusMeaning')(
                <span>{questionInformationHeader.clarifyNotifyStatusMeaning}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyNotifyTitle`).d('标题')}
            >
              {getFieldDecorator('clarifyNotifyTitle', {
                initialValue:
                  questionInformationHeader.clarifyNotifyTitle ||
                  intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.rfxTitleContext`, { rfxTitle })
                    .d(`关于【${rfxTitle}】的询标问卷审批`),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.clarifyNotifyTitle`)
                        .d('标题'),
                    }),
                  },
                  {
                    max: 80,
                    message: intl.get('hzero.common.validation.max', {
                      max: 80,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.replyRequirement`).d('回复要求')}
            >
              {getFieldDecorator('replyRequirement', {
                initialValue: questionInformationHeader.replyRequirement,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<TextArea rows={4} style={{ height: '56px' }} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
