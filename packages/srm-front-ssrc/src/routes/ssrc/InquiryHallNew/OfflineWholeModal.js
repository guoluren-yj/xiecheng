import React, { Component } from 'react';
import { Form, Lov } from 'choerodon-ui/pro';

import Styles from './index.less';

export default class CreateModalComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      radioValue: 'rfx',
    };
  }

  render() {
    const { sourceFrom, offlineWholeDs } = this.props;
    const { radioValue } = this.state;
    return (
      <Form
        dataSet={offlineWholeDs}
        labelLayout="placeholder"
        className={Styles['offline-whole-model-form-wrap']}
        columns={1}
      >
        {sourceFrom !== 'inquiryRFQCreate' && radioValue === 'rfx' && <Lov name="templateLov" />}
      </Form>
    );
  }
}
