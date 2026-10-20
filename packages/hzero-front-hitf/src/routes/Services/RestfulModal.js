import React, { PureComponent } from 'react';
import { Card } from 'choerodon-ui';
import { DataSet, Form, Lov, TextField, Select } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { Bind } from 'lodash-decorators';
import getLang from '@/langs/serviceLang';
import notification from 'hzero-front/lib/utils/notification';
import { restfulDS } from '@/stores/Services/ImportServiceDS';

export default class RestfulModal extends PureComponent {
  constructor(props) {
    super(props);
    this.restfulDS = new DataSet(restfulDS());
  }

  componentDidMount() {
    this.props.modal.update({
      onOk: this.handleOk,
    });
  }

  @Bind()
  async handleOk() {
    const { onGotoDetail } = this.props;
    const validate = await this.restfulDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.restfulDS.submit().then((res) => {
      if (res && res.success) {
        onGotoDetail(res.content[0].interfaceServerId);
      }
    });
  }

  render() {
    return (
      <Card>
        <Form dataSet={this.restfulDS}>
          {!isTenantRoleLevel() && <Lov name="tenantLov" />}
          <TextField name="serverName" />
          <TextField name="serverCode" />
          <Select name="requestMethod" placeholder={getLang('REQUEST_PLACEHOLDER')} />
          <TextField name="importUrl" />
          <Select name="publicFlag" placeholder={getLang('IMPORT_PLACEHOLDER')} />
        </Form>
      </Card>
    );
  }
}
