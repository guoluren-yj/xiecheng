/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-filename-extension */
import React, { Component, createRef } from "react";
import { observable } from "mobx";
import { DataSet, Form, Modal, Output, Table } from "choerodon-ui/pro";
import { LabelLayout } from "choerodon-ui/pro/lib/form/enum";
import intl from "hzero-front/lib/utils/intl";
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";
import { ColumnProps } from "choerodon-ui/pro/lib/table/Column";
import { SelectionMode } from "choerodon-ui/pro/lib/table/enum";
import { getCurrentOrganizationId, getResponse } from "hzero-front/lib/utils/utils";
import { HZERO_IAM } from "hzero-front/lib/utils/config";
import notification from "hzero-front/lib/utils/notification";
import { operatorRender } from "hzero-front/lib/utils/renderer";
import { checkPermission } from "hzero-front/lib/services/api";
import styles from './styles.less';
import { salesRoleDetailRoleList, salesRoleBasicInfo } from "./dataSet";
import EditPermissionDimContent from "./EditPermissionDimContent";
import MenuPermission from "./MenuPermission";
import SalesRoleUserList from "./SalesRoleUserList";
import AssignMember from "./AssignMember";

const _a: any = axios;

const permissionCodePrefix = "srm.partner.my-partner.supplier-account-manage.button";
const permissionCodePostfix = "byRole";

export default class SalesRole extends Component<any> {

  dataTableRef = createRef<Table>();

  basicDs = new DataSet(salesRoleBasicInfo(intl));

  roleDs = new DataSet(salesRoleDetailRoleList(intl));

  assignMemberRef: any = null;

  roleColumns: ColumnProps[] = [
    { name: 'name' },
    // { name: 'tenantName' },
    { name: 'enabled' },
    {
      name: 'operator',
      width: 300,
      header: intl.get('hzero.common.button.action').d('操作'),
      renderer: ({ record }: any) => {
        const { editFlag, createFlag } = record.get(["editFlag", "createFlag"]);
        return operatorRender(
          [
            editFlag === "1" && {
              key: "editPermissionDim",
              ele: (
                <a onClick={() => this.openPermissionDimModal(record)}>
                  {intl.get('hiam.purAccountManage.common.editPermissionDim').d('维护权限维度')}
                </a>
              ),
              len: 6,
              title: intl.get('hiam.purAccountManage.common.editPermissionDim').d('维护权限维度'),
            },
            createFlag === "1" && this.permissionConfig["view-menu-permission"].value && {
              key: "viewMenuPermission",
              ele: (
                <a onClick={() => this.openMenuPermission(record)} >
                  {intl.get('hiam.purAccountManage.common.viewMenuPermission').d('查看菜单权限')}
                </a>
              ),
              len: 6,
              title: intl.get('hiam.purAccountManage.common.viewMenuPermission').d('查看菜单权限'),
            },
            createFlag === "0" && this.permissionConfig["edit-menu-permission"].value && {
              key: "editMenuPermission",
              ele: (
                <a onClick={() => this.openMenuPermission(record, true)}>
                  {intl.get('hiam.purAccountManage.common.editMenuPermission').d('编辑菜单权限')}
                </a>
              ),
              len: 6,
              title: intl.get('hiam.purAccountManage.common.editMenuPermission').d('编辑菜单权限'),
            },
            {
              key: "editMembers",
              ele: (
                <a onClick={() => this.openEditMembers(record)}>
                  {intl.get('hiam.roleManagement.view.button.editMembers').d('分配用户')}
                </a>
              ),
              len: 6,
              title: intl.get('hiam.roleManagement.view.button.editMembers').d('分配用户'),
            },
          ].filter(Boolean)
        )
      },
    },
  ]

  permissionConfig = observable({
    "view-menu-permission": { value: false, type: "disabled" },
    "edit-menu-permission": { value: false, type: "disabled" },
    "role-auth-dim": { value: false, type: "disabled" },
  });

  state = {
    currentUser: {} as any,
  }

  componentDidMount(): void {
    checkPermission(Object.keys(this.permissionConfig).map(code => `${permissionCodePrefix}.${code}.${permissionCodePostfix}`)).then(res => {
      if (getResponse(res)) {
        res.forEach(({ code, approve, controllerType }) => {
          const realCode = code.replace(`${permissionCodePrefix}.`, "").replace(`.${permissionCodePostfix}`, "");
          // 存储权限对象
          if (realCode) {
            this.permissionConfig[realCode] = {
              value: !!approve,
              type: controllerType,
            }
          }
        });
      }
    })
  }

  userChange = (tenantId, tenantInfo = {} as any) => {
    this.basicDs.loadData([tenantInfo]);
    this.roleDs.setQueryParameter("tenantId", tenantId);
    if (tenantId) {
      this.roleDs.query();
    }
    this.setState({
      currentUser: tenantInfo,
    });
  }



  saveRoleLine(record) {
    record.setState({ saving: true });
    _a.post(`${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/role`, [record.toJSONData()]).then(res => {
      if (getResponse(res)) {
        notification.success({});
        this.roleDs!.query();
      }
    }).finally(() => {
      record.editing = false;
      record.setState({ saving: false });
    });
  }

  openPermissionDimModal(record) {
    const roleId = record.get("roleId");
    const queryUrl = `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/roles/${roleId}/role-auths`;
    const saveUrl = `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/roles/${roleId}/role-auths`
    Modal.open({
      title: null,
      key: Modal.key(),
      style: {
        width: "742px",
      },
      drawer: true,
      className: styles["permission-dim-modal"],
      children: (
        <EditPermissionDimContent queryUrl={queryUrl} saveUrl={saveUrl} />
      ),
      footer: null,
    });
  }

  openMenuPermission(record, allowEdit?) {
    const roleId = record.get("roleId");

    const queryUrl = allowEdit
      ? `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/roles/${roleId}/permission-set-tree`
      : `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/${roleId}/permission-set-tree`;
    const checkUrl = `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/roles/${roleId}/permission-sets/assign`;
    const recyleUrl = `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/roles/${roleId}/permission-sets/recycle`;
    Modal.open({
      title: intl.get("hiam.purAccountManage.title.roleMenuPermission", { roleName: record.get("name") }).d("“{roleName}”菜单权限"),
      key: Modal.key(),
      style: {
        width: "742px",
      },
      drawer: true,
      children: (
        <MenuPermission editFlag={allowEdit} queryUrl={queryUrl} checkUrl={checkUrl} recyleUrl={recyleUrl} />
      ),
      okButton: false,
      cancelText: intl.get("hzero.common.button.close").d("关闭"),
      cancelProps: {
        color: "primary"
      }
    });
  }

  openEditMembers(record) {
    const {
      currentUser,
    } = this.state;
    const currentRecord = record.toData();
    Modal.open({
      title: intl.get('hiam.roleManagement.view.button.editMembers').d('分配用户'),
      key: Modal.key(),
      style: {
        width: "742px",
      },
      drawer: true,
      children: (
        <AssignMember
          currentRecord={currentRecord}
          onRef={(node) => {
            this.assignMemberRef = node;
          }}
          currentTenant={currentUser}
        />
      ),
      onOk: () => {
        if(this.assignMemberRef){
          return this.assignMemberRef.handleSaveData();
        }
      }
    });
  }


  render() {
    const {
      currentUser,
    } = this.state;
    return (
      <>
        <SalesRoleUserList userChange={this.userChange} permission={this.permissionConfig} />
        <div className="divide-vertical"/>
        {
          currentUser && currentUser.tenantId ? (
            <div className="user-detail">
              <div className="user-detail-clip">
                <div className="user-detail-card-info">
                  <h3>{intl.get('hiam.purAccountManage.title.basicInfo').d('基础信息')}</h3>
                  <Form dataSet={this.basicDs} labelLayout={LabelLayout.vertical} columns={3} className="c7n-pro-vertical-form-display">
                    <Output name="groupName" />
                    <Output name="tenantName" />
                  </Form>
                </div>
                <div className="user-detail-card-info">
                  <h3>{intl.get('hiam.purAccountManage.title.role').d('角色')}</h3>
                  <Table
                    dataSet={this.roleDs}
                    columns={this.roleColumns}
                    selectionMode={SelectionMode.rowbox}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="user-detail">
              <div className="no-data">{intl.get('hiam.purAccountManage.common.noData').d('无数据')}</div>
            </div>
          )
        }
      </>
    );
  }
}
