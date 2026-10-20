import React, { PureComponent } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { isEmpty } from 'lodash';
import { internalInterfaceTableDS } from '@/stores/Services/detailDS';
import getLang from '@/langs/serviceLang';

export default class InternalInterfaceModal extends PureComponent {
  constructor(props) {
    super(props);

    this.internalInterfaceTableDS = new DataSet(
      internalInterfaceTableDS({
        tenantId: props.tenantId,
        interfaceServerId: props.interfaceServerId,
        onFieldUpdate: this.handleFieldUpdate,
      })
    );
  }

  componentDidMount() {
    this.props.modal.update({
      onOk: this.handleOk,
    });
  }

  @Bind()
  handleFieldUpdate({ name, value, record, dataSet }) {
    if (name === 'interfaceCode' && value) {
      dataSet.select(record);
    }
  }

  @Bind()
  async handleOk() {
    const { onSave = () => {} } = this.props;
    const selectedData = this.internalInterfaceTableDS.selected.map((record) => record.toData());
    if (isEmpty(selectedData)) {
      notification.warning({
        message: getLang('AT_LEAST'),
      });
      return false;
    }
    const validate = await this.internalInterfaceTableDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return onSave(selectedData, () => {});
  }

  get internalInterfaceColumns() {
    return [
      {
        name: 'interfaceCode',
        width: 300,
        editor: true,
      },
      {
        name: 'interfaceName',
        width: 250,
      },
      {
        name: 'requestMethod',
        width: 100,
      },
      {
        name: 'path',
      },
    ];
  }

  render() {
    return (
      <Table
        dataSet={this.internalInterfaceTableDS}
        columns={this.internalInterfaceColumns}
        queryFieldsLimit={2}
      />
    );
  }
}
