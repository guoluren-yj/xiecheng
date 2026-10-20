import React, { useCallback, useMemo, useRef } from "react";
import { observer } from 'mobx-react-lite';
import { Icon, Modal, TextField, useDataSet } from "choerodon-ui/pro";
import intl from "hzero-front/lib/utils/intl";
import { HZERO_IAM } from "hzero-front/lib/utils/config";
import { getCurrentOrganizationId } from "hzero-front/lib/utils/utils";
import notification from "hzero-front/lib/utils/notification";
import { FieldType } from "choerodon-ui/dataset/data-set/enum";
import { Alert } from "choerodon-ui";
import ObserverButton from "./ObserverButton";
import BasicUserList from "./BasicUserList";

import styles from './styles.less';
import EditPermissionDimContent from "./EditPermissionDimContent";

export default observer<{ permission: any, userChange: any }>(function SalesRoleUserList(props) {
  const { permission, userChange } = props;

  const checkable = !!permission["role-auth-dim"].value;
  const basicUserListRef = useRef<BasicUserList>(null);
  const finalVariable = useMemo(() => {
    return {
      queryUrl: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/tenants/list`,
      queryFields: [
        <TextField colSpan={3} name="tenantName" />,
      ],
    };
  }, []);
  const queryDs = useDataSet(() => ({
    autoCreate: true,
    fields: [
      {
        name: "tenantName",
        label: intl.get('hiam.purAccountManage.common.userSearch').d('请输入名称查询'),
        type: FieldType.string,
      },
    ],
  }), []);

  const getUserOperators = useCallback((select: Map<string, any>, cacheSelected: Map<string, any>) => {
    const saveCallback = () => {
      if (basicUserListRef.current) {
        basicUserListRef.current.queryList(1, 20);
      }
      select.clear();
      cacheSelected.clear();
    };
    const recycleAuthDim = () => {
      const queryUrl = `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/roles/role-auths/list`;
      const saveUrl = `${HZERO_IAM}/v1/${getCurrentOrganizationId()}//supplier-user/roles/role-auths/batch`;
      const transformSaveData = (data) => {
        const allSelectedSize = select.size + cacheSelected.size;
        return {
          tenants: allSelectedSize === 0 ? null : Array.from(select.values()).concat(Array.from(cacheSelected.values())).map(d => d.tenantId),
          roleAuthorityDtos: data,
        };
      };
      Modal.open({
        title: null,
        key: Modal.key(),
        style: {
          width: "742px",
        },
        drawer: true,
        className: styles["permission-dim-modal"],
        children: (
          <EditPermissionDimContent
            alert={(
              <Alert
                message={
                  <div className="alert-message">
                    <Icon type="help" />
                    <div className="text">{intl.get("hiam.purAccountManage.authDim.Tip1").d("批量维护角色权限维度，将勾选用户/所有用户使用的角色，批量启用该页面开启的维度，请谨慎操作！")}</div>
                  </div>
                }
                type="warning"
              />
            )}
            queryUrl={queryUrl}
            saveUrl={saveUrl}
            transformSaveData={transformSaveData}
            saveCallback={saveCallback}
          />
        ),
        footer: null,
      });
    };
    return [
      checkable && (
        <ObserverButton
          color="primary"
          funcType="flat"
          icon={() => select.size + cacheSelected.size > 0 ? "checklist" : "add_task-o"}
          onClick={recycleAuthDim}
          style={{ padding: 0 }}
          colSpan={2}
          newLine
        >
          {() => {
            const allSelectedSize = select.size + cacheSelected.size;
            return allSelectedSize > 0
              ? intl.get('hiam.purAccountManage.button.batchRecyleRoleAuthDim').d('勾选批量启用角色权限维度')
              : intl.get('hiam.purAccountManage.button.recyleAllRoleAuthDim').d('全量启用角色权限维度');
          }}
        </ObserverButton>
      ),
    ].filter(Boolean);
  }, [checkable]);
  const initQueryDs = useMemo(() => {
    return Promise.resolve();
  }, []);
  const parseUser = useCallback((data) => {
    return {
      id: data.tenantId,
      title: data.tenantName,
      status: undefined,
      statusText: undefined,
      labelForDescription: undefined,
      description: undefined,
      checkable: true,
      originData: data,
    };
  }, []);
  return (
    <BasicUserList
      {...finalVariable}
      checkable={checkable}
      userChange={userChange}
      parseUser={parseUser}
      queryDs={queryDs}
      initQueryDs={initQueryDs}
      getUserOperators={getUserOperators}
      onlyShowTitle
      ref={basicUserListRef}
    />
  );
});