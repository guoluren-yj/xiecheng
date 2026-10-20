import React from 'react';
import intl from 'utils/intl';
import { Form, Row, Col, Input } from 'hzero-ui';
import { FORM_COL_3_LAYOUT, FORM_COL_2_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import DisplayFormItem from '../DisplayFormItem';

// const { TextArea } = Input;
const FormItem = Form.Item;

const promptCode = 'ssrc.supplierBid';

@Form.create({ fieldNameProp: null })
export default class CreateForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const {
      form: { getFieldDecorator },
      questionNoticeHeader = {},
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.clarifyNum`).d('澄清单号')}
              value={questionNoticeHeader.clarifyNotifyNum}
            />
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.supplierBid.clarifyNotifyTitle`).d('标题')}
            >
              {getFieldDecorator('clarifyNotifyTitle', {
                initialValue: questionNoticeHeader.clarifyNotifyTitle,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.supplierBid.clarifyNotifyTitle`)
                        .d('标题'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.sourceNum`).d('寻源单号')}
              value={questionNoticeHeader.sourceNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.sourceTitle`).d('询价单标题')}
              value={questionNoticeHeader.sourceTitle}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.customer`).d('客户')}
              value={questionNoticeHeader.companyName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.supplierCompanyName`).d('供应商')}
              value={questionNoticeHeader.supplierCompanyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.replayDate`).d('回复时间')}
              value={questionNoticeHeader.replayDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.clarifyNotifyStatus`).d('状态')}
              value={questionNoticeHeader.clarifyNotifyStatusMeaning}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
