import React, { PureComponent } from 'react';
import { DataSet, Form, Select, Table, TextField, Lov, Spin, Button } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import notification from 'hzero-front/lib/utils/notification';
import { roleFormDS, roleTableDS } from '@/stores/ClientAuth/ClientAuthDS';
import { ROLES_ORG, ROLES } from '@/constants/CodeConstants';
import getLang from '@/langs/clientAuthLang';

export default class AuthDrawer extends PureComponent {
  constructor(props) {
    super(props);
    const { clientOauthId, currentTenantId, currentOrganizationId } = props;
    this.roleFormDS = new DataSet(
      roleFormDS({
        clientOauthId,
        currentTenantId,
        currentOrganizationId,
        onLoad: this.handleLoad,
      })
    );
    this.roleTableDS = new DataSet(
      roleTableDS({
        clientOauthId,
        onBatchSelect: (params) => this.handleBatchSelect(params, 'deletedRoles'),
        onBatchUnSelect: (params) => this.handleBatchUnselect(params, 'deletedRoles', 'roleId'),
      })
    );
    this.lovBtnDS = new DataSet({
      primaryKey: 'id',
      autoCreate: false,
      fields: [
        {
          name: 'code',
          type: 'object',
          lovCode: isTenantRoleLevel() ? ROLES_ORG : ROLES,
          multiple: true,
          lovPara: { clientAuthId: clientOauthId },
          optionsProps: {
            cacheSelection: false,
            events: {
              batchSelect: (params) => this.handleBatchSelect(params, 'selectedRows'),
              batchUnSelect: (params) => this.handleBatchUnselect(params, 'selectedRows', 'id'),
            },
          },
        },
      ],
    });
    this.state = {
      isNew: true,
      selectedRows: [],
      deletedRoles: [],
    };
  }

  componentDidMount() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  @Bind()
  async handleSave() {
    const validate = await this.roleFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const roleData = this.roleTableDS.toData();
    this.roleFormDS.current.set('clientRoleList', roleData);
    return this.roleFormDS.submit().then((res) => {
      if (res && !res.failed) {
        this.roleFormDS.query();
      }
      return false;
    });
  }

  @Bind()
  handleLoad({ dataSet }) {
    const clientRoleList = dataSet.records[0].get('clientRoleList') || [];
    this.roleTableDS.loadData(clientRoleList);
    this.setState({ isNew: isUndefined(dataSet.records[0].get('id')) });
  }

  @Bind()
  handleBatchSelect({ records }, stateName) {
    this.setState({
      [stateName]: this.state[stateName].concat(records),
    });
  }

  @Bind()
  handleBatchUnselect({ records }, stateName, filterField) {
    const existRecords = this.state[stateName].filter((record) => {
      if (records.find((temp) => temp.get(filterField) === record.get(filterField))) {
        return false;
      }
      return true;
    });
    this.setState({
      [stateName]: existRecords,
    });
  }

  /**
   * 添加角色
   */
  @Bind()
  handleAddRoles() {
    const { selectedRows } = this.state;
    const selectedData = [];
    selectedRows.forEach((selectedRecord) => {
      const { id, name, code, levelPath, tenantId, tenantName } = selectedRecord.toData();
      if (!this.roleTableDS.find((record) => record.get('roleId') === id)) {
        selectedData.push({
          tenantId,
          tenantName,
          code,
          name,
          levelPath,
          roleId: id,
        });
      }
    });
    selectedData.forEach((data) => this.roleTableDS.create(data));
    this.lovBtnDS.clearCachedSelected();
    this.setState({ selectedRows: [] });
  }

  /**
   * 删除角色
   */
  @Bind()
  handleDeleteRoles() {
    return this.roleTableDS.delete(this.roleTableDS.selected).then((res) => {
      if (!res) {
        this.setState({ deletedRoles: [] });
      } else if (!res.failed) {
        this.roleFormDS.query();
        this.setState({ deletedRoles: [] });
      }
    });
  }

  get roleColumns() {
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 180,
      },
      {
        name: 'name',
        width: 180,
      },
      {
        name: 'code',
      },
      {
        name: 'levelPath',
      },
    ];
  }

  render() {
    const { isNew, deletedRoles } = this.state;
    const buttons = [
      <Button icon="remove" disabled={isEmpty(deletedRoles)} onClick={this.handleDeleteRoles}>
        {getLang('DELETE_ROLE')}
      </Button>,
      <Lov
        noCache
        color="primary"
        dataSet={this.lovBtnDS}
        mode="button"
        name="code"
        clearButton={false}
        icon="add"
        modalProps={{
          onOk: this.handleAddRoles,
        }}
      >
        {getLang('ADD_ROLE')}
      </Lov>,
    ];

    return (
      <Spin dataSet={this.roleFormDS}>
        <Form dataSet={this.roleFormDS} columns={2}>
          <Lov name="clientLov" disabled={!isNew} />
          <Select name="statisticsLevel" />
          <TextField name="remark" />
        </Form>
        <Table dataSet={this.roleTableDS} columns={this.roleColumns} buttons={buttons} />
      </Spin>
    );
  }
}
