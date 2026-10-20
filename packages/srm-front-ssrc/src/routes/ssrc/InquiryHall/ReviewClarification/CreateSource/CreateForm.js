import React from 'react';
import intl from 'utils/intl';
import { Form, Row, Col, Input, DatePicker } from 'hzero-ui';
import Lov from 'components/Lov';
import classnames from 'classnames';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { Bind } from 'lodash-decorators';
import { getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';
import DisplayFormItem from '../DisplayFormItem';

const { TextArea } = Input;
const FormItem = Form.Item;

const organizationId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
export default class CreateForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  handleLovChange(value, record) {
    const { onLovChange } = this.props;
    onLovChange(value, record);
  }

  render() {
    const {
      form: { getFieldDecorator },
      questionInformationHeader = {},
      rfHeaderId,
    } = this.props;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.clarifyNotifyNum`)
                .d('澄清通知编号')}
              value={questionInformationHeader.clarifyNotifyNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get('ssrc.common.company').d('公司')}
              value={questionInformationHeader.companyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号')}
              value={questionInformationHeader.sourceNum}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.submittedDate`).d('提交时间')}
              value={questionInformationHeader.submittedDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyName`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierCompanyId', {
                initialValue: questionInformationHeader.supplierCompanyId || '',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyName`)
                        .d('供应商'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.RF_QUOTATION_HEADER"
                  queryParams={{ tenantId: organizationId, rfHeaderId }}
                  onChange={this.handleLovChange}
                  textValue={questionInformationHeader.supplierCompanyName}
                  lovOptions={{
                    valueField: 'supplierCompanyId',
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationHeaderNum`)
                .d('投标单号')}
              value={questionInformationHeader.quotationHeaderNum}
            />
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
                        .get(`ssrc.inquiryHall.model.inquiryHall.creationDate`)
                        .d('创建日期'),
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
            <DisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.publisher`).d('发布人')}
              value={questionInformationHeader.userName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.status`).d('状态')}
              value={questionInformationHeader.clarifyNotifyStatusMeaning}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyNotifyTitle`).d('标题')}
            >
              {getFieldDecorator('clarifyNotifyTitle', {
                initialValue: questionInformationHeader.clarifyNotifyTitle,
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
