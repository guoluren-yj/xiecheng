import React from 'react';
import { DataSet, Form, Modal, Output, Spin, Table, TextField } from 'choerodon-ui/pro';
import { isTenantRoleLevel, getCurrentRole } from 'hzero-front/lib/utils/utils';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import { roleFormDS, authTableDS } from '@/stores/ClientRole/ClientRoleDS';
import getLang from '@/langs/clientRoleLang';
import { SOURCE_TYPE_TAGS } from '@/constants/constants';
import InterfaceModal from './InterfaceModal';

export default class AuthDrawer extends React.Component {
  constructor(props) {
    super(props);
    const { roleId } = props;
    this.roleFormDS = new DataSet(roleFormDS({ roleId }));
    this.authTableDS = new DataSet(
      authTableDS({
        roleId,
        onSelect: this.handleSelect,
        onUnselect: this.handleUnselect,
        onSelectAll: this.handleSelectAll,
        onUnSelectAll: this.handleUnSelectAll,
      })
    );
    this.state = {
      selectedRows: [],
    };
  }

  @Bind()
  handleSelect({ dataSet }) {
    this.setState({
      selectedRows: dataSet.selected,
    });
  }

  @Bind()
  handleUnselect({ dataSet }) {
    this.setState({
      selectedRows: dataSet.selected,
    });
  }

  @Bind()
  handleSelectAll({ dataSet }) {
    this.setState({
      selectedRows: dataSet.selected,
    });
  }

  @Bind()
  handleUnSelectAll() {
    this.setState({
      selectedRows: [],
    });
  }

  @Bind()
  handleOpenInterfaceModal() {
    const { roleId } = this.props;
    const modalProps = {
      roleId,
      onRefresh: () => this.authTableDS.query(),
    };
    Modal.open({
      title: getLang('INTERFACE_INFO'),
      style: { width: 1000 },
      children: <InterfaceModal {...modalProps} />,
    });
  }

  @Bind()
  async handleDeleteAuth() {
    return this.authTableDS.delete(this.authTableDS.selected).then((res) => {
      if (res && !res.failed) {
        this.authTableDS.query();
        this.setState({ selectedRows: [] });
      }
    });
  }

  get authColumns() {
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
    const { path, roleId } = this.props;
    const { selectedRows } = this.state;
    const currentRoleFlag = getCurrentRole().id === roleId;

    const buttons = [
      <ButtonPermission
        permissionList={[
          {
            code: `${path}.button.unauthorized`,
            type: 'button',
            meaning: '角色授权-删除授权',
          },
        ]}
        icon="remove"
        type="c7n-pro"
        disabled={isEmpty(selectedRows) || currentRoleFlag}
        onClick={this.handleDeleteAuth}
      >
        {getLang('DELETE_AUTH')}
      </ButtonPermission>,
      <ButtonPermission
        permissionList={[
          {
            code: `${path}.button.authorized`,
            type: 'button',
            meaning: '角色授权-添加授权',
          },
        ]}
        icon="add"
        type="c7n-pro"
        disabled={currentRoleFlag}
        onClick={this.handleOpenInterfaceModal}
      >
        {getLang('ADD_AUTH')}
      </ButtonPermission>,
    ];

    return (
      <Spin dataSet={this.roleFormDS}>
        <Form dataSet={this.roleFormDS} columns={2}>
          <Output name="code" />
          <Output name="name" />
          <Output name="description" />
        </Form>
        <Table
          dataSet={this.authTableDS}
          columns={this.authColumns}
          buttons={buttons}
          queryFields={{
            interfaceName: <TextField colSpan={2} />,
          }}
        />
      </Spin>
    );
  }
}
