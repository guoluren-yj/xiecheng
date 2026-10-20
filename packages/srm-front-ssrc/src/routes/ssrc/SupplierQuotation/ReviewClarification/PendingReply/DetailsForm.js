import React from 'react';
import intl from 'utils/intl';
import { Form, Row, Col } from 'hzero-ui';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import DisplayFormItem from '../DisplayFormItem';

// const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class CreateForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const {
      // form: { getFieldDecorator },
      questionNoticeHeader = {},
    } = this.props;
    // const formItemLayout = {
    //   labelCol: { span: 3 },
    //   wrapperCol: { span: 21 },
    // };
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.clarifyNum`).d('澄清单号')}
              value={questionNoticeHeader.clarifyNotifyNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.title`).d('标题')}
              value={questionNoticeHeader.clarifyNotifyTitle}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.sourceNum`).d('寻源单号')}
              value={questionNoticeHeader.sourceNum}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.source.title`).d('寻源标题')}
              value={questionNoticeHeader.sourceTitle}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户')}
              value={questionNoticeHeader.companyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.questionSupplier`).d('供应商')}
              value={questionNoticeHeader.supplierCompanyName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.replyEndDate`).d('回复截止时间')}
              value={questionNoticeHeader.replyEndDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.replayDate`).d('回复时间')}
              value={questionNoticeHeader.replayDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get('hzero.common.status').d('状态')}
              value={questionNoticeHeader.clarifyNotifyStatusMeaning}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
