import React from 'react';
import { DataSet, Form, IntlField, Lov, Spin, Switch, TextField } from 'choerodon-ui/pro';
import { isTenantRoleLevel, getCurrentUser } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { Bind } from 'lodash-decorators';
import { domainFormDS } from '@/stores/ServerDomain/ServerDomainDS';
import getLang from '@/langs/serverDomainLang';

class DomainDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.domainFormDS = new DataSet(domainFormDS());
  }

  componentDidMount() {
    const { operateType, selectedDomainRecord } = this.props;
    switch (operateType) {
      // 新建子领域
      case 'addSon':
        {
          const {
            domainId,
            domainName,
            predefinedFlag,
            tenantId,
            tenantName,
          } = selectedDomainRecord.toData();
          this.domainFormDS.create({
            parentDomainId: domainId,
            parentDomainName: domainName,
            enabledFlag: true,
            tenantId: predefinedFlag ? getCurrentUser().tenantId : tenantId,
            tenantName: predefinedFlag ? getCurrentUser().tenantName : tenantName,
          });
        }
        break;
      // 编辑
      case 'edit':
        this.domainFormDS.setQueryParameter('domainId', selectedDomainRecord.get('domainId'));
        this.domainFormDS.query();
        break;
      // 新建根领域
      case 'add':
      default:
        this.domainFormDS.create({ enabledFlag: true });
    }
    this.handleUpdateModalProps();
  }

  handleUpdateModalProps() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.domainFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('VALIDATE'),
      });
      return false;
    }
    return this.domainFormDS.submit().then(() => {
      this.props.onRefresh();
    });
  }

  render() {
    const { operateType } = this.props;
    return (
      <Spin dataSet={this.domainFormDS}>
        <Form dataSet={this.domainFormDS}>
          {!isTenantRoleLevel() && <Lov name="tenantNameLov" disabled={operateType !== 'add'} />}
          <TextField name="domainCode" disabled={operateType === 'edit'} />
          <IntlField name="domainName" />
          <Lov name="serverDomainParentLov" disabled={operateType === 'addSon'} />
          <Switch name="enabledFlag" />
        </Form>
      </Spin>
    );
  }
}

export default DomainDrawer;
