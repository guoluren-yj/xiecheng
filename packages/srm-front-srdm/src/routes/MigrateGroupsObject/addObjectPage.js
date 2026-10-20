import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

@observer
class AddObjectPage extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.tableDS = new DataSet({
      autoCreate: false,
      autoQuery: true,
      primaryKey: 'objectCode',
      cacheSelection: true,
      cacheModified: true,
      queryFields: [
        {
          type: 'string',
          name: 'objectCode',
          label: intl.get('hpdm.migrate-groups-obj.model.objectCode').d('配置对象编码'),
        },
        {
          type: 'string',
          name: 'objectName',
          label: intl.get('hpdm.migrate-groups-obj.model.objectName').d('配置对象名称'),
        },
        {
          type: 'number',
          name: 'enabledFlag',
          label: intl.get('hpdm.migrate-groups-obj.model.enabledFlag').d('是否启用'),
          lookupCode: 'HPDM.Y_N_FLAG',
        },
      ],
      fields: [
        {
          type: 'string',
          name: 'objectCode',
          required: true,
          label: intl.get('hpdm.migrate-groups-obj.model.objectCode').d('配置对象编码'),
        },
        {
          type: 'string',
          name: 'objectName',
          required: true,
          label: intl.get('hpdm.migrate-groups-obj.model.objectName').d('配置对象名称'),
        },
        {
          type: 'string',
          name: 'objectDesc',
          label: intl.get('hpdm.migrate-groups-obj.model.objectDesc').d('配置对象说明'),
        },
        {
          type: 'string',
          name: 'objectPriority',
          label: intl.get('hpdm.migrate-groups-obj.model.objectPriority').d('迁移优先级'),
        },
        {
          type: 'number',
          name: 'enabledFlag',
          required: true,
          label: intl.get('hpdm.migrate-groups-obj.model.enabledFlag').d('是否启用'),
          lookupCode: 'HPDM.Y_N_FLAG',
          defaultValue: 1,
        },
      ],
      transport: {
        read: (config) => {
          const { data, params } = config;
          const url = isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/simple-query`
            : `${HZERO_SRDM}/v1/hpdm-config-objects/simple-query`;
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
          columnTitleEditable
          columnDraggable
          editMode="cell"
          customizable={false}
          style={{ height: 200 }}
          border
          columns={[
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'objectCode',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'objectName',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'objectDesc',
            },
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'objectPriority',
            },
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'enabledFlag',
            },
          ]}
          buttons={[]}
          dataSet={this.tableDS}
        />
      </>
    );
  }
}

export default AddObjectPage;
