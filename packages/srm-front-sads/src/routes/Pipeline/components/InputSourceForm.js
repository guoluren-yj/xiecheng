import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, TextField, Lov, TextArea, Select, NumberField } from 'choerodon-ui/pro';
import styles from '../index.less';

export default class OutputSourceForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldHidden: props.record.get('inputType') === 'PUSH',
    };
  }

  @Bind()
  changeInputType(value) {
    const { record } = this.props;
    if (value === 'PUSH') {
      this.setState({ fieldHidden: true });
      record.set('jdbcUrl', '');
      record.set('dbUsername', '');
      record.set('dbPassword', '');
      record.set('sourceStatement', '');
    } else {
      this.setState({ fieldHidden: false });
    }
  }

  render() {
    const { record, operation } = this.props;
    const { fieldHidden } = this.state;
    const disabled = operation === 'view';
    const codeDisabled = !!operation;
    const show = ['PULL', 'ALL'].includes(record.get('inputType'));

    return (
      <Form labelLayout="float" columns={1} record={record}>
        <TextField name="inputSourceCode" disabled={codeDisabled} />
        <TextField name="inputSourceName" disabled={disabled} />
        <TextField name="remark" disabled={disabled} />
        <Lov name="pipelineConfig" disabled={disabled} />
        <Lov name="tenant" disabled={disabled} />
        <Select name="syncMultiCloud" disabled={disabled} />
        <TextField name="objectVersionNumberWildcard" disabled={disabled} />
        <div>
          <TextArea
            className={styles['line-textarea']}
            name="dataTemplate"
            disabled={disabled}
            resize="vertical"
            rows={4}
            showLengthInfo
            // placeholder=" 数据模板(必须为JSON格式)"
          />
        </div>

        <Select name="inputType" disabled={disabled} onChange={this.changeInputType} />
        <Select name="dataSourceCode" disabled={disabled} />
        <NumberField name="preferenceIndex" disabled={disabled} />
        {show && (
          <>
            <TextField name="pullProcessUrl" disabled={disabled} hidden={fieldHidden} />
            <TextField name="pullProcessUrlMethod" disabled={disabled} hidden={fieldHidden} />
            <NumberField name="processBatchSize" disabled={disabled} hidden={fieldHidden} />
          </>
        )}
        {/* <TextField name="jdbcUrl" disabled={disabled} hidden={fieldHidden} />
        <TextField name="dbUsername" disabled={disabled} hidden={fieldHidden} />
        <Password name="dbPassword" disabled={disabled} hidden={fieldHidden} /> */}
        <div hidden={fieldHidden}>
          <TextArea
            className={styles['line-textarea']}
            name="sourceStatement"
            disabled={disabled}
            resize="vertical"
            rows={6}
            showLengthInfo
          />
        </div>
      </Form>
    );
  }
}
