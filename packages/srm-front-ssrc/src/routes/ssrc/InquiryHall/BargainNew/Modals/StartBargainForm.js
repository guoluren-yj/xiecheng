import React, { Component } from 'react';
import { Form, DatePicker, TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

@observer
class StartBargainForm extends Component {
  /**
   * form fields
   */
  getFields = () => {
    const fields = [
      <DatePicker name="bargainEndDate" />,
      <TextArea name="bargainRemark" resize="vertical" clearButton />,
    ];
    return fields;
  };

  render() {
    const { customizeForm = false, dataSet, sourceKey } = this.props;

    return (
      <div>
        {customizeForm(
          {
            code: `SSRC.${sourceKey}_HALL_BARGAIN.START_ONLINE_BARGAIN`,
            dataSet,
          },
          <Form dataSet={dataSet} columns={3} labelLayout="float">
            {this.getFields()}
          </Form>
        )}
      </div>
    );
  }
}

export default StartBargainForm;
