import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['hpdm.data-distribute', 'hpdm.deploy-info', 'hpdm.deploy-distribute'],
})
@observer
class DeployInfosPage extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.deployInfosDS = new DataSet({
      autoCreate: true,
      autoQuery: true,
      selection: 'single',
      fields: [
        {
          type: 'string',
          name: 'deployNum',
          label: intl.get('hpdm.data-distribute.model.deployNum').d('发版批次号'),
        },
        {
          type: 'dateTime',
          name: 'deployDate',
          label: intl.get('hpdm.data-distribute.model.deployDate').d('发版日期'),
        },
        {
          type: 'string',
          name: 'comments',
          label: intl.get('hpdm.deploy-distribute.model.comments').d('说明'),
        },
      ],
      queryFields: [
        {
          type: 'string',
          name: 'deployNum',
          label: intl.get('hpdm.data-distribute.model.deployNum').d('发版批次号'),
        },
        {
          type: 'dateTime',
          name: 'deployDateFrom',
          label: intl.get('hpdm.deploy-info.model.deployDateFrom').d('发版时间从'),
        },
        {
          type: 'dateTime',
          name: 'deployDateTo',
          label: intl.get('hpdm.deploy-info.model.deployDateTo').d('发版时间至'),
        },
        {
          type: 'string',
          name: 'comments',
          label: intl.get('hpdm.deploy-distribute.model.comments').d('说明'),
        },
      ],
      transport: {
        read: (config) => {
          const { data, params } = config;
          const url = isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/query`
            : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/query`;
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
              name: 'deployNum',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              name: 'deployDate',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              name: 'comments',
              type: 'string',
            },
          ]}
          dataSet={this.deployInfosDS}
        />
      </>
    );
  }
}

export default DeployInfosPage;
