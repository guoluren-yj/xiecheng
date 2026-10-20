import React, { Component } from 'react';
import { Form, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

@observer
class HeaderForm extends Component {
  /**
   * header form fields
   */
  getHeaderFields = () => {
    const { remote, bargainFlag, sourceKey, headerDS, rfxHeaderId, bidFlag } = this.props;

    const fieldProps = {
      bargainFlag,
      rfxHeaderId,
      sourceKey,
      bidFlag,
      headerDS,
    };

    const currentFields = [
      <TextField name="rfxNum" />,
      <TextField name="rfxTitle" />,
      <TextField
        name="quotationRoundNumber"
        renderer={({ value }) => {
          return value || '1';
        }}
      />,
    ];

    const Fields = remote
      ? remote.process('SSRC_BARGAIN_NEW_PROCESS_HEADER_FIELDS', currentFields, fieldProps)
      : currentFields;

    return Fields;
  };

  render() {
    const { customizeForm = false, headerDS, sourceKey } = this.props;

    return (
      <div>
        {customizeForm(
          {
            code: `SSRC.${sourceKey}_HALL_BARGAIN.HEADER`,
            dataSet: headerDS,
          },
          <Form dataSet={headerDS} columns={3} labelLayout="float">
            {this.getHeaderFields()}
          </Form>
        )}
      </div>
    );
  }
}

export default HeaderForm;
