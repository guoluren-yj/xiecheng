import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Form, TextArea, TextField, NumberField, Lov, Select } from 'choerodon-ui/pro';
import styles from '../index.less';

@observer
export default class DataScheduleForm extends Component {
  render() {
    const { record } = this.props;
    // 查看
    const disabled = record && record.getState('viewFlag');
    return (
      <Form labelLayout="float" columns={1} record={record}>
        <Lov name="inputSourceCodeObject" disabled={disabled} />
        <TextField name="inputSourceName" disabled />
        <TextField name="pipelineName" disabled />
        <NumberField name="threadTotal" disabled={disabled} />
        <TextField name="cron" disabled={disabled} />
        <Select name="loopFlag" disabled={disabled} />
        {record.get('loopFlag') && (
          <>
            <Select name="loopType" disabled={disabled} />
            {Number(record.get('loopType')) === 0 && (
              <>
                <NumberField name="loopFrom" disabled={disabled} />
                <NumberField name="loopTo" disabled={disabled} />
              </>
            )}
            {Number(record.get('loopType')) === 1 && (
              <TextArea name="loopSql" disabled={disabled} cols={1} showLengthInfo />
            )}
            <TextArea name="loopPlaceholder" disabled={disabled} cols={1} showLengthInfo />
          </>
        )}
        <TextArea name="taskParameters" disabled={disabled} />
        <div>
          <TextArea
            name="remark"
            showLengthInfo
            className={styles['line-textarea']}
            disabled={disabled}
          />
        </div>
      </Form>
    );
  }
}
