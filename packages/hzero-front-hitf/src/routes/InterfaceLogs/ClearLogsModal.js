import React from 'react';
import { DataSet, Form, Select, Lov, DateTimePicker } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { clearLogFormDS } from '@/stores/InterfaceLog/InterfaceLogDS';
import getLang from '@/langs/interfaceLogLang';

export default class ClearLogsModal extends React.Component {
  constructor(props) {
    super(props);

    this.clearLogFormDS = new DataSet(
      clearLogFormDS({
        onFieldUpdate: this.handleFieldUpdate,
      })
    );

    this.state = {
      showTimePicker: false,
    };
  }

  componentDidMount() {
    this.props.modal.update({
      onOk: this.handleOk,
    });
  }

  @Bind
  handleFieldUpdate({ name, value, record }) {
    if (name === 'clearType') {
      record.set('requestTimeStart', undefined);
      record.set('requestTimeEnd', undefined);
      this.setState({ showTimePicker: value === 'SPECIFIED_TIME_RANGE' });
    }
  }

  @Bind()
  async handleOk() {
    const validate = await this.clearLogFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { onRefresh = () => {} } = this.props;
    return this.clearLogFormDS.submit().then((res) => {
      if (res && !res.failed) {
        onRefresh();
      }
    });
  }

  render() {
    const { showTimePicker } = this.state;
    return (
      <Form dataSet={this.clearLogFormDS} labelWidth={140}>
        {!isTenantRoleLevel() && <Lov name="tenantLov" />}
        <Select name="clearType" />
        {showTimePicker && <DateTimePicker name="requestTimeStart" />}
        {showTimePicker && <DateTimePicker name="requestTimeEnd" />}
      </Form>
    );
  }
}
