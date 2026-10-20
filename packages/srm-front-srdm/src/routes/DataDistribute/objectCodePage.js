import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

@observer
class ObjectCodePage extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.objectCodeDS = new DataSet({
      autoCreate: true,
      autoQuery: true,
      selection: 'single',
      fields: [
        {
          type: 'string',
          name: 'objectCode',
          label: intl.get('hpdm.data-distribute.model.objectCode').d('配置对象'),
        },
        {
          type: 'string',
          name: 'objectName',
          label: intl.get('hpdm.data-distribute.model.objectName').d('配置对象名称'),
        },
      ],
      queryFields: [
        {
          type: 'string',
          name: 'objectCode',
          label: intl.get('hpdm.data-distribute.model.objectCode').d('配置对象'),
        },
        {
          type: 'string',
          name: 'objectName',
          label: intl.get('hpdm.data-distribute.model.objectName').d('配置对象名称'),
        },
      ],
      transport: {
        read: (config) => {
          const { data, params } = config;
          const url = isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/query`
            : `${HZERO_SRDM}/v1/hpdm-config-objects/query`;
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
          queryFieldsLimit={2}
          border
          columns={[
            {
              hideable: true,
              titleEditable: true,
              name: 'objectCode',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              name: 'objectName',
              type: 'string',
            },
          ]}
          dataSet={this.objectCodeDS}
        />
      </>
    );
  }
}

export default ObjectCodePage;
