import React from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { isEmpty } from 'lodash';
import notification from 'hzero-front/lib/utils/notification';
import { Bind } from 'lodash-decorators';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import { interfaceTableDS } from '@/stores/ClientRole/ClientRoleDS';
import getLang from '@/langs/clientRoleLang';
import { SOURCE_TYPE_TAGS } from '@/constants/constants';

export default class InterfaceModal extends React.PureComponent {
  constructor(props) {
    super(props);
    const { roleId } = props;
    this.interfaceTableDS = new DataSet(interfaceTableDS({ roleId }));
  }

  componentDidMount() {
    this.props.modal.update({
      onOk: this.handleOk,
    });
  }

  @Bind()
  handleOk() {
    const selectedInterfaces = this.interfaceTableDS.selected.map((record) => record.toData());
    if (isEmpty(selectedInterfaces)) {
      notification.warning({
        message: getLang('AT_LEAST'),
      });
      return false;
    }
    const { onRefresh = () => {} } = this.props;
    this.interfaceTableDS.records[0].set('submittedData', selectedInterfaces);
    return this.interfaceTableDS.submit().then((res) => {
      if (res && !res.failed) {
        onRefresh();
      }
    });
  }

  get interfaceColumns() {
    return [
      isTenantRoleLevel() && {
        name: 'sourceType',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, SOURCE_TYPE_TAGS, record.get('sourceTypeMeaning')),
      },
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 180,
      },
      {
        name: 'namespace',
        width: 180,
      },
      {
        name: 'interfaceCode',
        width: 250,
      },
      {
        name: 'interfaceName',
        width: 250,
      },
      {
        name: 'serverCode',
        width: 100,
      },
      {
        name: 'serverName',
        width: 300,
      },
    ];
  }

  render() {
    return <Table dataSet={this.interfaceTableDS} columns={this.interfaceColumns} />;
  }
}
