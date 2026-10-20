import React, { PureComponent } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import { interfaceTableDS } from '@/stores/ClientAuth/ClientAuthDS';
import { SOURCE_TYPE_TAGS } from '@/constants/constants';

export default class AuthDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.interfaceTableDS = new DataSet(interfaceTableDS());
  }

  componentDidMount() {
    const { clientId } = this.props;
    this.interfaceTableDS.setQueryParameter('clientId', clientId);
    this.interfaceTableDS.query();
  }

  get columns() {
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
      },
      isTenantRoleLevel() && {
        name: 'sourceType',
        width: 100,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, SOURCE_TYPE_TAGS, text),
      },
      {
        name: 'namespace',
        width: 120,
      },
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
      },
      {
        name: 'serverCode',
        width: 150,
      },
      {
        name: 'serverName',
        width: 150,
      },
    ];
  }

  render() {
    return <Table dataSet={this.interfaceTableDS} columns={this.columns} queryFieldsLimit={2} />;
  }
}
