import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { DataSet, Form, Lov, Select } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { userTenantFormDS } from '@/stores/InterfaceForward/InterfaceForwardDS';
import getLang from '@/langs/interfaceForwardLang';
import { FORWARD_MATCH_TYPE_CONSTANT } from '@/constants/constants';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class UserTenantModal extends React.Component {
  constructor(props) {
    super(props);

    this.userTenantFormDS = new DataSet(
      userTenantFormDS({
        urlRuleId: props.urlRuleId,
        onFieldUpdate: this.handleFieldUpdate,
      })
    );

    this.state = {};
  }

  componentDidMount() {
    const { urlRuleId } = this.props;
    this.userTenantFormDS.create({ urlRuleId });
    this.updateModalProps();
  }

  updateModalProps() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  @Bind()
  handleFieldUpdate({ name, value, record }) {
    if (name === 'type') {
      record.set('userLov', undefined);
      record.set('tenantLov', undefined);
      this.setState({ type: value });
    }
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.userTenantFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { onRefresh } = this.props;
    return this.userTenantFormDS.submit().then((res) => {
      if (res && res.success) {
        onRefresh();
      }
    });
  }

  render() {
    const { type } = this.state;
    return (
      <Form dataSet={this.userTenantFormDS}>
        <Select name="type" />
        {type === FORWARD_MATCH_TYPE_CONSTANT.USER && <Lov name="userLov" />}
        {type === FORWARD_MATCH_TYPE_CONSTANT.TENANT && <Lov name="tenantLov" />}
      </Form>
    );
  }
}
