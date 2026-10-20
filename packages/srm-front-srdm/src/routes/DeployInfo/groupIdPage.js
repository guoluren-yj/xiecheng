import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

@observer
class GroupIdPage extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.groupIdDS = new DataSet({
      autoCreate: true,
      autoQuery: true,
      selection: 'single',
      fields: [
        {
          type: 'string',
          name: 'groupId',
          label: intl.get('hpdm.data-distribute.model.groupId').d('组标识'),
        },
        {
          type: 'dateTime',
          name: 'creationDate',
          label: intl.get('hpdm.data-distribute.model.creationDate').d('处理日期'),
        },
        {
          type: 'string',
          name: 'processStatus',
          lookupCode: 'HPDM.PROCESS_STATUS',
          label: intl.get('hpdm.deploy-rec.model.processStatus').d('处理状态'),
        },
        {
          type: 'string',
          name: 'undistCount',
          label: intl.get('hpdm.data-distribute.model.undistCount').d('未分配记录数'),
        },
      ],
      queryFields: [
        {
          type: 'string',
          name: 'groupId',
          label: intl.get('hpdm.data-distribute.model.groupId').d('组标识'),
        },
        {
          type: 'dateTime',
          name: 'creationDateFrom',
          label: intl.get('hpdm.data-distribute.model.creationDateFrom').d('处理日期从'),
          max: 'creationDateTo',
        },
        {
          type: 'dateTime',
          name: 'creationDateTo',
          label: intl.get('hpdm.data-distribute.model.creationDateTo').d('处理日期至'),
          min: 'creationDateFrom',
        },
      ],
      transport: {
        read: (config) => {
          const { data, params } = config;
          const url = isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-processs/ob-list?processType=COLLECT`
            : `${HZERO_SRDM}/v1/data-migrate-processs/ob-list?processType=COLLECT`;
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
              name: 'groupId',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              name: 'creationDate',
            },
            {
              hideable: true,
              titleEditable: true,
              name: 'processStatus',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              name: 'undistCount',
            },
          ]}
          dataSet={this.groupIdDS}
        />
      </>
    );
  }
}

export default GroupIdPage;
