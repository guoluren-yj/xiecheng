/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-filename-extension */
import React, { Component, createRef } from "react";
import { Tag } from "choerodon-ui";
import { Record } from "choerodon-ui/dataset";
import { observer } from "mobx-react-lite"
import { observable } from "mobx";
import { Button, DataSet, Form, Icon, Lov, Modal, Output, Table, TextField } from "choerodon-ui/pro";
import { Buttons } from "choerodon-ui/pro/lib/table/Table";
import { ViewMode } from "choerodon-ui/pro/lib/lov/enum";
import { DataSetStatus, FieldType } from "choerodon-ui/dataset/data-set/enum";
import { LabelLayout } from "choerodon-ui/pro/lib/form/enum";
import intl from "hzero-front/lib/utils/intl";
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";
import { ColumnProps } from "choerodon-ui/pro/lib/table/Column";
import { SelectionMode, TableMode } from "choerodon-ui/pro/lib/table/enum";
import { ButtonColor, FuncType } from "choerodon-ui/pro/lib/button/enum";
import { getCurrentOrganizationId, getResponse } from "hzero-front/lib/utils/utils";
import { HZERO_IAM } from "hzero-front/lib/utils/config";
import notification from "hzero-front/lib/utils/notification";
import { operatorRender } from "hzero-front/lib/utils/renderer";
import { checkPermission } from "hzero-front/lib/services/api";
import styles from './styles.less';
import { salesAccountBasicInfo, companyDataPermissionList, customerItemDataPermissionList, salesAccountDetailRoleList } from "./dataSet";
import EditPermissionDimContent from "./EditPermissionDimContent";
import MenuPermission from "./MenuPermission";
import createRole from "./createRole";
import PurAccountUserList from "./SalesAccountUserList";

const useStatusColorMap = {
  0: "gray",
  1: "green",
};

const _a: any = axios;
function renderStatus(_) { return _.value !== undefined ? <Tag color={useStatusColorMap[_.value]}>{_.value ? intl.get('hzero.common.status.normal').d('正常') : intl.get('hiam.purAccountManage.common.frozen').d('冻结')}</Tag> : ''; }
const ObserverDsButton = observer<any>(({ dataSet, name, visible, child, ...props }) => {
  if (visible && !visible()) return null;
  return child || <Button {...props} disabled={dataSet.getField(name).get("disabled", dataSet.current)} dataSet={dataSet} name={name} />
});

const permissionCodePrefix = "srm.partner.my-partner.supplier-account-manage.button";

function childrenRecordSelect(record, targetValue) {
  if (record.children && record.children.length > 0) {
    record.children.forEach(r => {
      r.setState({ "__SELECT_KEY__": targetValue });
      if (r.children && r.children.length > 0) childrenRecordSelect(r, targetValue);
    });
  }
}
export default class PurAccount extends Component<any> {

  dataTableRef = createRef<Table>();

  basicDs = new DataSet(salesAccountBasicInfo(intl));

  roleDs = new DataSet(salesAccountDetailRoleList(intl));

  customerItemDs = new DataSet(customerItemDataPermissionList(intl));

  companyDs = new DataSet(companyDataPermissionList(intl, {
    selectCallback: ({ record }) => {
      childrenRecordSelect(record, record.getState("__SELECT_KEY__"))
    },
  }));

  roleColumns: ColumnProps[] = [
    { name: 'name' },
    { name: 'startDateActive', editor: (record) => !!record.editing },
    { name: 'endDateActive', editor: (record) => !!record.editing },
    {
      name: 'operator',
      header: intl.get('hzero.common.button.action').d('操作'),
      renderer: ({ record }: any) => {
        const { editFlag, createFlag } = record.get(["editFlag", "createFlag"]);
        return operatorRender(
          record.editing ? [
            {
              key: "save",
              ele: (
                <a onClick={() => this.saveRoleLine(record)}>
                  {intl.get("hzero.common.button.save").d("保存")}
                </a>
              ),
              len: 2,
              title: intl.get("hzero.common.button.save").d("保存"),
            },
            {
              key: "cancel",
              ele: (
                <a onClick={() => { record.editing = !record.editing; }}>
                  {intl.get("hzero.common.button.cancel").d("取消")}
                </a>
              ),
              len: 2,
              title: intl.get("hzero.common.button.cancel").d("取消"),
            },
          ] : [
            {
              key: "edit",
              ele: (
                <a onClick={() => { record.editing = !record.editing; }}>
                  {intl.get("hzero.common.button.edit").d("编辑")}
                </a>
              ),
              len: 2,
              title: intl.get("hzero.common.button.edit").d("编辑"),
            },
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
            createFlag === "1" && this.permissionConfig["role-create"].value && {
              key: "roleCreate",
              ele: (
                <a onClick={() => createRole(record, this.basicDs)} >
                  {intl.get('hiam.roleManagement.view.button.roleCreate').d('创建角色')}
                </a>
              ),
              len: 4,
              title: intl.get('hiam.roleManagement.view.button.roleCreate').d('创建角色'),
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
          ].filter(Boolean)
        )
      },
    },
  ]

  permissionConfig = observable({
    "role-create": { value: false, type: "disabled" },
    "role-assign": { value: false, type: "disabled" },
    "role-anti-assign": { value: false, type: "disabled" },
    "view-menu-permission": { value: false, type: "disabled" },
    "edit-menu-permission": { value: false, type: "disabled" },
    "recyle-admin-role": { value: false, type: "disabled" },
  });

  searchData: {
    dataSearchCompany?: string;
    dataSearchItem?: string;
  } = {};

  state = {
    permissionDimension: "company",
    companyRowExpanded: false,
    itemRowExpanded: false,
    dataSearchCompany: "",
    dataSearchItem: "",
    currentUser: {} as any,
    companySaving: false,
    itemSaving: false,
  }

  companyColumns: ColumnProps[] = [
    { name: 'dataName' },
    { name: 'dataCode' },
  ]

  customerItemColumns: ColumnProps[] = [
    { name: 'dataName' },
    { name: 'dataCode' },
  ]

  componentDidMount(): void {
    checkPermission(Object.keys(this.permissionConfig).map(code => `${permissionCodePrefix}.${code}`)).then(res => {
      if (getResponse(res)) {
        res.forEach(({ code, approve, controllerType }) => {
          const realCode = code.replace(`${permissionCodePrefix}.`, "");
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

  userChange = (userId, userInfo = {} as any) => {
    this.basicDs.loadData([userInfo]);
    this.roleDs.setQueryParameter("userId", userId);
    this.customerItemDs.setQueryParameter("userId", userId);
    this.customerItemDs.setQueryParameter("customerTenantId", userInfo.organizationId);
    this.companyDs.setQueryParameter("userId", userId);
    this.companyDs.setQueryParameter("customerTenantId", userInfo.organizationId);
    if (userId) {
      this.roleDs.query();
      this.customerItemDs.query();
      this.companyDs.query();
    }
    this.setState({
      currentUser: userInfo,
      dataSearchCompany: "",
      dataSearchItem: "",
    });
  }

  toggleDataPermission = (e) => {
    const classify = e.target.dataset.id;
    if (classify) {
      this.setState({ permissionDimension: classify });
    }
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

  onDataSearchChange = (value) => {
    if (this.state.permissionDimension === "company") {
      this.searchData.dataSearchCompany = value;
    } else {
      this.searchData.dataSearchItem = value;
    }
  };

  executeQueryDataAuth = () => {
    const { permissionDimension } = this.state;
    const { dataSearchCompany, dataSearchItem } = this.searchData
    if (permissionDimension === "company") {
      this.companyDs.setQueryParameter("companyName", dataSearchCompany);
      this.companyDs.query();
    } else {
      this.customerItemDs.setQueryParameter("dataName", dataSearchItem);
      this.customerItemDs.query();
    }
  }

  toggleAllExpand = () => {
    const { permissionDimension, companyRowExpanded, itemRowExpanded } = this.state;
    const newStateData: any = {};
    let currentExpandStatus;
    if (permissionDimension === "company") {
      currentExpandStatus = companyRowExpanded;
      newStateData.companyRowExpanded = !companyRowExpanded;
    } else {
      currentExpandStatus = itemRowExpanded;
      newStateData.itemRowExpanded = !itemRowExpanded;
    }
    if (currentExpandStatus) {
      this.dataTableRef.current!.tableStore.collapseAll();
    } else this.dataTableRef.current!.tableStore.expandAll();
    this.setState(newStateData);
  }

  saveDataAuth = () => {
    const { permissionDimension, currentUser = {} } = this.state;
    switch (permissionDimension) {
      case 'company':
        this.setState({ companySaving: true });
        _a.post(
          `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/users/${currentUser.id}/data/customer-operation-unit?customerTenantId=${currentUser.organizationId}`,
          this.companyDs.filter(r => !!r.getState("__SELECT_KEY__") !== !!r.get("checkedFlag")).map(r => ({
            ...r.toJSONData(),
            checkedFlag: !!r.getState("__SELECT_KEY__") ? 1 : 0,
          }))
        ).then(res => {
          if (getResponse(res)) {
            notification.success(undefined as any);
            this.companyDs.query();
          }
        }).finally(() => {
          this.setState({ companySaving: false });
        });
        break;
      case 'customerItem':
        this.setState({ itemSaving: true });
        _a.post(
          `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/users/${currentUser.id}/data/customer-item-category?customerTenantId=${currentUser.organizationId}`,
          this.customerItemDs.filter(
            r => !!r.getState("__SELECT_KEY__")
          ).map(r => ({
            ...r.toJSONData(),
            checkedFlag: !!r.getState("__SELECT_KEY__") ? 1 : 0,
          }))
        ).then(res => {
          if (getResponse(res)) {
            notification.success(undefined as any);
            this.customerItemDs.query();
          }
        }).finally(() => {
          this.setState({ itemSaving: false });
        });
        break;
      default: ;
    }
  }

  roleButtonsDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: "roleAssign",
        type: FieldType.object,
        lovCode: "SRM.SALES_ROLE_LIST",
        dynamicProps: {
          lovPara: () => {
            return {
              createByTenantId: this.basicDs.current!.get("organizationId"),
              tenantId: getCurrentOrganizationId(),
            }
          },
        }
      },
      {
        name: "roleAntiAssign",
        type: FieldType.auto,
        dynamicProps: {
          disabled: () => {
            return !this.roleDs.selected.length
          }
        }
      }
    ]
  });

  roleButtons: Buttons[] = [
    <ObserverDsButton
      visible={() => !!this.permissionConfig["role-assign"].value}
      child={(
        <Lov
          name="roleAssign"
          dataSet={this.roleButtonsDs}
          clearButton={false}
          onBeforeSelect={(record) => {
            if (!record) return true;
            (record as Record).dataSet.status = DataSetStatus.loading;
            return axios.post(`${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/member/role/assign`, {
              ...(record as Record).toJSONData(),
              userId: this.basicDs.current!.get("id"),
            }).then(res => {
              if (getResponse(res) || !res) {
                notification.success({});
                this.roleDs.query();
                return true;
              }
              return false;
            }).catch(err => {
              notification.error({ message: err.message });
              return false;
            }).finally(() => {
              (record as Record).dataSet.status = DataSetStatus.ready;
            })
          }}
          color={ButtonColor.primary}
          mode={ViewMode.button}
          funcType={FuncType.flat}
        >
          {intl.get('hiam.purAccountManage.button.assignRole').d('分配角色')}
        </Lov>
      )}
    />,
    <ObserverDsButton
      dataSet={this.roleButtonsDs}
      name="roleAntiAssign"
      visible={() => !!this.permissionConfig["role-anti-assign"].value}
      onClick={() => {
        Modal.confirm({
          title: intl.get('hiam.purAccountManage.title.confirmCancel').d('确认取消'),
          children: (
            <div>
              {intl.get('hiam.purAccountManage.tip.cancelAssignTip1').d("取消后，该供应商账户无法切换到该角色下进行单据操作")}<br />
              {intl.get('hiam.purAccountManage.tip.cancelAssignTip2').d("若该用户仅有一个销售员角色，请先操作分配其他子角色，再删除该角色")}<br />
              {intl.get('hiam.purAccountManage.tip.cancelAssignTip3').d("否则，取消角色分配后，该用户由于无当前公司有效角色，无法再列表展示")}<br />
            </div>
          ),
          onOk: () => {
            return axios.delete(
              `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/member/roles/delete`,
              { data: this.roleDs.selected.map(record => record.get(["roleId", "memberId"])) }
            ).then(res => {
              if (getResponse(res) || !res) {
                notification.success({});
                this.roleDs.query();
              }
            })
          }
        })
      }}
    >
      {intl.get('hiam.purAccountManage.button.cancelAssign').d('取消分配')}
    </ObserverDsButton>
  ];

  render() {
    const {
      permissionDimension, companyRowExpanded, itemRowExpanded,
      companySaving,
      itemSaving,
      currentUser,
    } = this.state;
    const { search } = this.props;
    const { dataSearchCompany, dataSearchItem } = this.searchData;
    const currentExpandedStatus = permissionDimension === "company" ? companyRowExpanded : itemRowExpanded;
    const currentSaveLoading = permissionDimension === "company" ? companySaving : itemSaving;
    return (
      <>
        <PurAccountUserList userChange={this.userChange} search={search} permission={this.permissionConfig} />
        <div className="divide-vertical"/>
        {
          currentUser && currentUser.id ? (

            <div className="user-detail">
              <div className="user-detail-clip">
                <div className="user-detail-card-info">
                  <h3>{intl.get('hiam.purAccountManage.title.basicInfo').d('基础信息')}</h3>
                  <Form dataSet={this.basicDs} labelLayout={LabelLayout.vertical} columns={3} className="c7n-pro-vertical-form-display">
                    <Output name="realName" />
                    <Output name="tenantName" />
                    <Output name="isEnabled" renderer={renderStatus} />
                    <Output name="email" />
                    <Output name="phone" />
                    <Output name="isOwnAdminRole" />
                  </Form>
                </div>
                <div className="user-detail-card-info">
                  <h3>{intl.get('hiam.purAccountManage.title.role').d('角色')}</h3>
                  <Table
                    buttons={this.roleButtons}
                    dataSet={this.roleDs}
                    columns={this.roleColumns}
                    selectionMode={SelectionMode.rowbox}
                  />
                </div>
                <div className="user-detail-card-info">
                  <h3>{intl.get('hiam.purAccountManage.title.dataPermission').d('数据权限')}</h3>
                  <div className="data-classify-cards" onClick={this.toggleDataPermission}>
                    <div data-id="company" className={`card-item${permissionDimension === "company" ? ' active' : ''}`}>{intl.get('hiam.purAccountManage.common.company').d('公司')}<i><span></span></i></div>
                    <div data-id="customerItem" className={`card-item${permissionDimension === "customerItem" ? ' active' : ''}`}>{intl.get('hiam.purAccountManage.common.customerItemCategory').d('客户物料类别')}<i><span></span></i></div>
                  </div>
                  <Form className="search-form" columns={3}>
                    <TextField
                      name="search"
                      placeholder={
                        permissionDimension === "company"
                          ? intl.get("hiam.purAccountManage.title.companySearch").d("请输入公司、代码查询")
                          : intl.get("hiam.purAccountManage.title.itemSearch").d("请输入物料品类名称、编码查询")
                      }
                      value={permissionDimension === "company" ? dataSearchCompany : dataSearchItem}
                      onChange={this.onDataSearchChange}
                      onBlur={this.executeQueryDataAuth}
                      addonBefore={<Icon type="search" />}
                    />
                    <div className="search-btn-groups">
                      <Button funcType={FuncType.flat} color={ButtonColor.primary} icon="format_indent_increase" onClick={this.toggleAllExpand}>
                        {
                          currentExpandedStatus
                            ? intl.get("hzero.common.button.collapseAll").d("全部收起")
                            : intl.get("hzero.common.button.expandAll").d("全部展开")
                        }
                      </Button>
                      <Button loading={currentSaveLoading} funcType={FuncType.flat} color={ButtonColor.primary} icon="save" onClick={this.saveDataAuth}>
                        {intl.get("hzero.common.button.save").d("保存")}
                      </Button>
                    </div>
                  </Form>
                  <Table
                    style={{ maxHeight: "250px" }}
                    mode={TableMode.tree}
                    ref={this.dataTableRef}
                    selectionMode={SelectionMode.rowbox}
                    bodyExpanded={companyRowExpanded}
                    virtualCell={false}
                    dataSet={permissionDimension === "company" ? this.companyDs : this.customerItemDs}
                    columns={permissionDimension === "company" ? this.companyColumns : this.customerItemColumns}
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