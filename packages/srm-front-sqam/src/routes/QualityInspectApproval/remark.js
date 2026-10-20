import React, { PureComponent } from 'react';
import { Form, Input } from 'hzero-ui';
import intl from 'utils/intl';

const prefix = `sqam.qualityInspectApproval`;
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <Form.Item
          label={intl.get(`${prefix}.model.qualityInspectApproval.approvedRemark`).d('审批意见')}
        >
          {getFieldDecorator('approvedRemark')(<Input.TextArea rows={3} />)}
        </Form.Item>
      </Form>
    );
  }
}
