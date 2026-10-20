import React, { PureComponent } from 'react';
import { Form, Lov, DataSet, Switch, TextField, NumberField } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { omit, isUndefined } from 'lodash';
import getLang from '@/langs/rateLimitLang';
import { rateLimitFormDS } from '@/stores/RateLimit/RateLimitDS';

export default class CreateRateLimitDrawer extends PureComponent {
  constructor(props) {
    super(props);
    const { replenishRateMax, rateLimitType } = props;
    this.rateLimitFormDS = new DataSet(rateLimitFormDS({ replenishRateMax, rateLimitType }));
  }

  componentDidMount() {
    const { ruleData } = this.props;
    if (!isUndefined(ruleData)) {
      this.rateLimitFormDS.loadData([ruleData]);
    }
    this.updateModalProps();
  }

  @Bind()
  updateModalProps() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  @Bind()
  async handleSave() {
    const validate = await this.rateLimitFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { ruleData, onAddRule } = this.props;
    const data = omit(this.rateLimitFormDS.current.toData(), ['userLov', 'tenantLov', 'roleLov']);
    onAddRule(data, isUndefined(ruleData));
    return true;
  }

  render() {
    return (
      <Form dataSet={this.rateLimitFormDS} labelWidth={140}>
        <NumberField name="replenishRate" />
        {isTenantRoleLevel() && <TextField name="original" />}
        {isTenantRoleLevel() && <Lov name="userLov" />}
        {!isTenantRoleLevel() && <Lov name="tenantLov" />}
        {isTenantRoleLevel() && <Lov name="roleLov" />}
        {isTenantRoleLevel() && <TextField name="header" />}
        {isTenantRoleLevel() && <TextField name="body" />}
        <Switch name="enabledFlag" />
      </Form>
    );
  }
}
