import React, { PureComponent } from 'react';
import { DataSet, Table, Lov, Icon } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { isEmpty, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_IAM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';

import { saveBatchAssign } from '@/services/purAccountManageService';

const organizationId = getCurrentOrganizationId();

export default class AssignMember extends PureComponent {
  constructor(props) {
    super(props);
    const { currentTenant } = props;
    const supplierTenantId = currentTenant && currentTenant.tenantId;
    this.dataSet = new DataSet({
      fields: [
        {
          name: 'loginName',
          label: intl.get('hiam.roleManagement.model.roleManagement.loginName').d('账户'),
        },
        {
          name: 'realName',
          label: intl.get('hiam.roleManagement.model.roleManagement.userLoginName').d('用户名'),
        },
        {
          name: 'email',
          label: intl.get('hiam.roleManagement.model.roleManagement.member.email').d('邮箱'),
        },
        {
          name: 'phone',
          label: intl.get('hiam.roleManagement.model.roleManagement.member.phone').d('电话'),
        },
        {
          name: 'isEnabled',
          label: intl.get('hzero.common.common.status').d('状态'),
        },
      ],
      queryFields: [
        {
          name: 'userLoginName',
          label: intl.get('hiam.roleManagement.model.roleManagement.loginName').d('账户'),
        },
        {
          name: 'userRealName',
          label: intl.get('hiam.roleManagement.model.roleManagement.userLoginName').d('用户名'),
        },
      ],
      transport: {
        read: ({ data }) => {
          const { roleId } = data || {};
          return {
            url: `${SRM_PLATFORM}/v1/${organizationId}/member-roles/role-users/${supplierTenantId}/${roleId}`,
            method: 'GET',
          };
        },
        destroy: ({ data, dataSet }) => {
          const roleId = dataSet.getQueryParameter('roleId');
          const newData = (data || []).map((i) => {
            const { id, ...others } = i;
            const item = {
              ...others,
              roleId,
              memberId: id,
            };
            return item;
          });
          return {
            url: `${HZERO_IAM}/hzero/v1/${organizationId}/member-roles/batch-delete`,
            method: 'DELETE',
            data: newData,
            params: {},
          };
        },
      },
    });
    this.userInfoDs = new DataSet({
      dataToJSON: 'selected',
      autoCreate: true,
      fields: [
        {
          name: 'userInfoLov',
          type: 'object',
          multiple: true,
          noCache: true,
          lovCode: 'HIAM.SUPPLIER_TENANT_USERS',
          lovPara: {
            tenantId: supplierTenantId,
          },
        },
      ],
    });
  }

  componentDidMount() {
    const { currentRecord = {}, onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
    const { roleId } = currentRecord;
    this.dataSet.setQueryParameter('roleId', roleId);
    this.dataSet.query();
  }

  columns = [
    { name: 'loginName' },
    {
      name: 'realName',
    },
    {
      name: 'email',
    },
    {
      name: 'phone',
    },
    {
      name: 'isEnabled',
      renderer: ({ value }) => {
        return isNil(value) ? (
          '-'
        ) : (
          <Tag color={value ? 'green' : 'gray'}>
            {value
              ? intl.get('hzero.common.status.normal').d('正常')
              : intl.get('hzero.common.status.frozen').d('冻结')}
          </Tag>
        );
      },
    },
  ];

  @Bind()
  handleCreateData() {
    const currentData = this.userInfoDs.current.toData();
    if (!isEmpty(currentData)) {
      const { userInfoLov = [] } = currentData;
      userInfoLov.forEach((item) => {
        this.dataSet.create(item);
      });
    }
    this.userInfoDs.current.set('userInfoLov', undefined);
  }

  @Bind()
  handleSaveData() {
    const { currentRecord = {} } = this.props;
    const { roleId } = currentRecord;
    const data = (this.dataSet.toData() || []).map((i) => {
      const { id, ...others } = i;
      const item = {
        ...others,
        roleId,
        memberId: id,
      };
      return item;
    });
    if (isEmpty(data)) {
      return true;
    }
    return new Promise(async (resolve) => {
      const res = await saveBatchAssign(data);
      if (getResponse(res)) {
        notification.success();
        resolve();
      } else {
        resolve(false);
      }
    });
  }

  render() {
    const buttons = [
      <Lov
        mode="button"
        name="userInfoLov"
        clearButton={false}
        dataSet={this.userInfoDs}
        modalProps={{
          afterClose: this.handleCreateData,
        }}
      >
        <Icon type="playlist_add" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
        {intl.get('hzero.common.button.add').d('新增')}
      </Lov>,
      ['delete'],
    ];
    return (
      <Table
        dataSet={this.dataSet}
        columns={this.columns}
        buttons={buttons}
        style={{ maxHeight: 'calc(100vh - 240px)' }}
        queryBar="normal"
        queryFieldsLimit={3}
      />
    );
  }
}
