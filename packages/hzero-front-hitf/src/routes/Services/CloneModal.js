import React, { PureComponent } from 'react';
import { DataSet, Form, Lov, TextField } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { Bind } from 'lodash-decorators';
import getLang from '@/langs/serviceLang';
import notification from 'hzero-front/lib/utils/notification';
import { cloneFormDS } from '@/stores/Services/headerDS';

export default class RestfulModal extends PureComponent {
  constructor(props) {
    super(props);
    const { isCurrentRole, currentRecordTenantId } = props;
    this.cloneFormDS = new DataSet(cloneFormDS({ isCurrentRole, currentRecordTenantId }));
  }

  componentDidMount() {
    const { interfaceServerId } = this.props;
    this.cloneFormDS.create({ interfaceServerId });
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  @Bind()
  async handleSave() {
    const { onRefresh } = this.props;
    const validate = await this.cloneFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.cloneFormDS.submit().then((res) => {
      if (res && !res.failed) {
        onRefresh();
      }
    });
  }

  render() {
    const { isCurrentRole } = this.props;
    return (
      <Form dataSet={this.cloneFormDS}>
        {!isTenantRoleLevel() && isCurrentRole && <Lov name="tenantLov" />}
        <TextField name="serverCode" />
      </Form>
    );
  }
}
