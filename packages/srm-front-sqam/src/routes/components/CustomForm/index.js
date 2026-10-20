import React, { PureComponent } from 'react';
import { Form, Row } from 'hzero-ui';

@Form.create({ fieldNameProp: null })
export default class basicInfoPanel extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef, refField } = props;
    if (onRef) onRef(this, refField);
  }

  render() {
    const { form, basicInfo, customizeForm, code } = this.props;
    return customizeForm(
      {
        code,
        form,
        dataSource: basicInfo,
      },
      <Form layout="inline" className="more-fields-search-form more-fields-search-form-filter">
        <Row />
      </Form>
    );
  }
}
