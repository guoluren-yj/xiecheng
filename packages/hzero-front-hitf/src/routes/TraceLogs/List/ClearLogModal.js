/*
 * @Author: your name
 * @Date: 2020-10-09 14:47:55
 * @LastEditTime: 2020-10-19 19:51:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \hzero-front\packages\hzero-front-hitf\src\routes\TraceLogs\List\ClearLogModal.js
 */
import React, { PureComponent } from 'react';
import { DataSet, Form, Select, Lov, DateTimePicker } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { Bind } from 'lodash-decorators';
import { clearLogDS } from '@/stores/TraceLogs/TraceLogDS';

export default class ClearLogModal extends PureComponent {
  constructor(props) {
    super(props);
    this.clearLogDS = new DataSet(
      clearLogDS({
        onFieldUpdate: this.handleFieldUpdate,
      })
    );
    this.state = {
      showTimePicker: false,
    };
    props.onRef(this);
  }

  @Bind
  handleFieldUpdate({ name, value, record }) {
    if (name === 'clearType') {
      record.set('requestTimeStart', undefined);
      record.set('requestTimeEnd', undefined);
      this.setState({ showTimePicker: value === 'SPECIFIED_TIME_RANGE' });
    }
  }

  render() {
    const { showTimePicker } = this.state;
    return (
      <>
        <Form columns={1} dataSet={this.clearLogDS}>
          {!isTenantRoleLevel() && <Lov name="tenantLov" />}
          <Select name="clearType" />
          {showTimePicker && <DateTimePicker name="requestTimeStart" />}
          {showTimePicker && <DateTimePicker name="requestTimeEnd" />}
        </Form>
      </>
    );
  }
}
