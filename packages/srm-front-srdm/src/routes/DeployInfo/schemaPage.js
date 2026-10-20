import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

@observer
class SchemaPage extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.schemaDS = new DataSet({
      autoCreate: true,
      autoQuery: true,
      selection: 'single',
      paging: false,
      fields: [
        {
          type: 'string',
          name: 'schemaName',
          label: intl.get('hpdm.config-object-tbl.model.schemaName').d('数据库'),
        },
        {
          type: 'string',
          name: 'schemaDesc',
          label: intl.get('hpdm.config-object-tbl.model.schemaDesc').d('数据库描述'),
        },
      ],
      transport: {
        read: (config) => {
          const { data, params } = config;
          const url = isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/app-databases/db-list?env=${this.props.paramEnv}`
            : `${HZERO_SRDM}/v1/app-databases/db-list?env=${this.props.paramEnv}`;
          return {
            data,
            params,
            url,
            method: 'GET',
          };
        },
      },
    });
  }

  render() {
    return (
      <>
        <Table
          rowNumber={false}
          queryBar="professionalBar"
          columnResizable
          columnHideable
          columnTitleEditable
          columnDraggable
          editMode="cell"
          customizable={false}
          border
          columns={[
            {
              hideable: true,
              titleEditable: true,
              name: 'schemaName',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              name: 'schemaDesc',
              type: 'string',
            },
          ]}
          dataSet={this.schemaDS}
        />
      </>
    );
  }
}

export default SchemaPage;
