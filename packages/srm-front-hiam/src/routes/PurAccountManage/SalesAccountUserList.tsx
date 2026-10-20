import React, { useCallback, useMemo, useRef } from "react";
import { observer } from 'mobx-react-lite';
import { Lov, Select, TextField, useDataSet } from "choerodon-ui/pro";
import intl from "hzero-front/lib/utils/intl";
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";
import { HZERO_IAM } from "hzero-front/lib/utils/config";
import { getCurrentOrganizationId, getResponse } from "hzero-front/lib/utils/utils";
import { FieldType } from "choerodon-ui/dataset/data-set/enum";
import notification from "hzero-front/lib/utils/notification";
import ObserverButton from "./ObserverButton";
import BasicUserList from "./BasicUserList";

const _a: any = axios;

export default observer<{permission: any, userChange: any, search: any}>(function PurAccountUserList(props) {
  const { search: { supplierTenantId }, permission, userChange } = props;

  const checkable = !!permission["recyle-admin-role"].value;
  const basicUserListRef = useRef<BasicUserList>(null);
  const finalVariable = useMemo(() => {
    return {
      queryUrl: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/members`,
      queryFields: [
        <TextField colSpan={2} name="name" />,
        <Select name="enableFlag" colSpan={1} />,
        <Lov name="tenantId" colSpan={3} />,
        (
          <Select name="enableAdminFlag" colSpan={3} >
            <Select.Option value>{intl.get("hzero.common.status.yes")}</Select.Option>
            <Select.Option value={false}>{intl.get("hzero.common.status.no")}</Select.Option>
          </Select>
        ),
        <TextField colSpan={3} name="phone" />,
        <TextField colSpan={3} name="email" />,
      ],
    };
  }, []);
  const queryDs = useDataSet(() => ({
    autoCreate: true,
    fields: [
      {
        name: "name",
        label: intl.get('hiam.purAccountManage.common.userSearch').d('请输入名称查询'),
        type: FieldType.string,
      },
      {
        name: 'tenantId',
        label: intl.get('hiam.subAccount.model.user.tenant').d('所属租户'),
        type: FieldType.object,
        lovCode: "SRM.PARTNER_TENANT_LIST",
        transformRequest(value) {
          return value && value.tenantId;
        },
      },
      {
        name: 'enableFlag',
        label: intl.get('hiam.purAccountManage.common.accountStatus').d('账户状态'),
        lookupCode: "HPFM.ENABLED_FLAG",
      },
      {
        name: "enableAdminFlag",
        label: intl.get('hiam.purAccountManage.common.enableAdminFlag').d('租户管理员'),
      },
      {
        name: "phone",
        label: intl.get('hzero.common.model.phoneNumber').d('手机号码'),
        type: FieldType.string,
      },
      {
        name: "email",
        label: intl.get('hzero.common.model.mail').d('邮箱'),
        type: FieldType.string,
      },
    ],
  }), []);

  const getUserOperators = useCallback((select: Map<string, any>, cacheSelected: Map<string, any>) => {
    const batchRecycleAdmin = () => {
      const submitData: any[] = [];
      Array.from(select.entries()).concat(Array.from(cacheSelected.entries())).forEach(([k, v]) => {
          submitData.push(v);
      });
      return axios.post(`${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/admin-role/recycle/batch`,
        submitData,
      ).then(res => {
        if (getResponse(res)) {
          /** [success, skip, failure] */
          const countArray = [0, 0, 0];
          res.forEach(result => {
            switch(result.status) {
              case "success": countArray[0] ++; break;
              case "skip": countArray[1] ++; break;
              default: countArray[2] ++;
            }
          });
          const api = countArray[0] === res.length ? notification.success : notification.warning;
          api({
            message: intl.get("hiam.purAccountManage.title.executeResult").d("执行结果"),
            description: (
              <>
                <div>{intl.get("hiam.purAccountManage.message.countSuccess", { num: countArray[0] }).d("{num} 条成功")}</div>
                <div>{intl.get("hiam.purAccountManage.message.countSkip", { num: countArray[1] }).d("{num} 条跳过")}</div>
                <div>{intl.get("hiam.purAccountManage.message.countFailure", { num: countArray[2] }).d("{num} 条失败")}</div>
              </>
            ),
          });
          if(basicUserListRef.current) {
            basicUserListRef.current.queryList(1, 20);
          }
          select.clear();
          cacheSelected.clear();
        }
      }).catch(e => {
        notification.error(e);
      });
    };
    return [
      checkable && (
        <ObserverButton
          color="primary"
          funcType="flat"
          name="recyleAdminRole"
          icon="cleaning_services"
          onClick={batchRecycleAdmin}
          style={{ padding: 0 }}
          disabled={() => select.size === 0}
          colSpan={2}
          newLine
        >
          {intl.get('hiam.purAccountManage.button.recyleAdminRole').d('供应商管理角色回收')}
        </ObserverButton>
      ),
    ].filter(Boolean);
  }, [checkable])
  const initQueryDs = useMemo(() => {
    if (supplierTenantId !== undefined) {
      return _a.get(`${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/tenants/list?partnerTenantId=${supplierTenantId}`).then(r => {
        if (getResponse(r)) {
          if (r.content && r.content.length > 0) {
            const { tenantName } = r.content[0];
            queryDs.getField("tenantId")!.set("defaultValue", {
              tenantId: supplierTenantId,
              tenantName,
            });
            queryDs.current!.init("tenantId", {
              tenantId: supplierTenantId,
              tenantName,
            });
          }
        }
      });
    } else return Promise.resolve();
  }, [supplierTenantId]);
  const parseUser = useCallback((data) => {
    return {
      id: data.id,
      title: data.realName,
      status: data.isEnabled,
      statusText: data.isEnabled ? intl.get('hzero.common.status.normal').d('正常') : intl.get('hiam.purAccountManage.common.frozen').d('冻结'),
      labelForDescription: intl.get('hiam.subAccount.model.user.tenant').d('所属租户'),
      description: data.tenantName,
      checkable: data.isOwnAdminRole,
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
      hasMoreFields
      ref={basicUserListRef}
    />
  );
});
