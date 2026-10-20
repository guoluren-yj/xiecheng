import DataSet, { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";
import { DataToJSON, FieldType } from "choerodon-ui/dataset/data-set/enum";
import { HZERO_IAM } from "hzero-front/lib/utils/config";
import { getCurrentOrganizationId } from "hzero-front/lib/utils/utils";

export const salesAccountBasicInfo = (intl): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'loginName',
        label: intl.get('hiam.subAccount.model.user.loginName').d('账号'),
      },
      {
        name: 'realName',
        label: intl.get('hiam.subAccount.model.user.realName').d('名称'),
      },
      {
        name: 'isEnabled',
        label: intl.get('hzero.common.model.status.enabledFlag').d('状态'),
      },
      {
        name: 'tenantName',
        label: intl.get('hiam.purAccountManage.common.tenantName').d('所属租户'),
      },
      {
        name: 'email',
        label: intl.get('hiam.subAccount.model.user.email').d('邮箱'),
      },
      {
        name: 'phone',
        label: intl.get('hiam.subAccount.model.user.phone').d('手机号码'),
      },
      {
        name: 'isOwnAdminRole',
        label: intl.get('hiam.purAccountManage.common.isOwnAdminRole').d('租户管理员'),
        type: FieldType.number,
        options: new DataSet({
          data: [
            { value: 1, meaning: intl.get("hzero.common.status.yes")},
            { value: 0, meaning: intl.get("hzero.common.status.no")},
          ],
        }),
      },
    ],
    transport: {
      // read: ({ data }) => {
      //   return {
      //     url: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/member/info/${data.userId}`,
      //     method: 'GET',
      //     data: {},
      //   };
      // },
    },
  };
};

export const salesRoleBasicInfo = (intl): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'groupName',
        label: intl.get('hiam.purAccountManage.common.groupName').d('集团名称'),
      },
      {
        name: 'tenantName',
        label: intl.get('hiam.purAccountManage.common.tenantName').d('所属租户'),
      },
    ],
    transport: {
    },
  };
};

export const salesAccountDetailRoleList = (intl): DataSetProps => {
  return {
    paging: false,
    fields: [
      {
        name: 'name',
        label: intl.get('hiam.subAccount.model.role.name').d('角色名称'),
      },
      {
        name: 'startDateActive',
        label: intl.get('hiam.subAccount.model.role.startDateActive').d('起始日期'),
        type: FieldType.date,
        transformRequest: (value) => value && value.format("YYYY-MM-DD"),
      },
      {
        name: 'endDateActive',
        label: intl.get('hiam.subAccount.model.role.endDateActive').d('失效日期'),
        type: FieldType.date,
        transformRequest: (value) => value && value.format("YYYY-MM-DD"),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/member/roles`,
          method: 'GET',
        };
      },
    },
  };
};

export const salesRoleDetailRoleList = (intl): DataSetProps => {
  return {
    paging: false,
    fields: [
      {
        name: 'name',
        label: intl.get('hiam.subAccount.model.role.name').d('角色名称'),
      },
      {
        name: 'tenantName',
        label: intl.get('hiam.purAccountManage.common.tenantName').d('所属租户'),
      },
      {
        name: 'enabled',
        label: intl.get('hzero.common.model.status.enabledFlag').d('状态'),
        type: FieldType.boolean,
      },
    ],
    transport: {
      read: ({data, params}) => {
        return {
          url: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/roles`,
          method: 'GET',
          params: {
            ...params,
            ...data,
          },
        };
      },
    },
  };
};

export const companyDataPermissionList = (intl, {selectCallback}): DataSetProps => {
  return {
    childrenField: "children",
    idField: "dataId",
    parentField: "parentCategoryId",
    treeCheckStrictly: false,
    fields: [
      {
        name: 'dataName',
        label: intl.get('hiam.purAccountManage.common.company').d('公司'),
      },
      {
        name: 'dataCode',
        label: intl.get('hiam.purAccountManage.common.companyCode').d('代码'),
      },
      {
        name: 'checkedFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
      },
    ],
    events: {
      load: ({dataSet}) => {
        dataSet.forEach(r => {
          if(r.get("checkedFlag")){
            r.setState({__SELECT_KEY__: true});
          }
        });
      },
      select: selectCallback,
      unSelect: selectCallback,
    },
    transport: {
      read: ({ data }) => {
        const { userId, ...other } = data || {};
        return {
          url: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/users/${userId}/data/customer-operation-unit`,
          method: 'GET',
          data: other,
          transformResponse: (res) => {
            try {
              const parseData = JSON.parse(res);
              if (parseData && !parseData.failed) {
                const checkList = parseData.originList.filter((list) => list.checkedFlag === 1).map((item) => item.dataId);
                return parseData.treeList.map(i => ({ ...i, checkedFlag: checkList.includes(i.dataId) ? 1 : 0 }));
              }
            } catch (e) {
              console.error(e);
            }
          },
        };
      },
    },
  };
};

export const customerItemDataPermissionList = (intl): DataSetProps => {
  return {
    childrenField: "children",
    idField: "dataId",
    parentField: "parentCategoryId",
    fields: [
      {
        name: 'dataName',
        label: intl.get('hiam.purAccountManage.common.itemCategoryName').d('物料品类名称'),
      },
      {
        name: 'dataCode',
        label: intl.get('hiam.purAccountManage.common.itemCategoryCode').d('物料品类编码'),
      },
      {
        name: 'checkedFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
      },
    ],
    events: {
      load: ({dataSet}) => {
        dataSet.forEach(r => {
          if(r.get("checkedFlag")){
            r.setState({__SELECT_KEY__: true});
          }
        });
      },
    },
    transport: {
      read: ({ data }) => {
        const { userId, ...other } = data || {};
        return {
          url: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/supplier-user/users/${userId}/data/customer-item-category`,
          method: 'GET',
          data: other,
          transformResponse: (res) => {
            try {
              const parseData = JSON.parse(res);
              if (parseData && !parseData.failed) {
                const checkList = parseData.originList.filter((list) => list.checkedFlag === 1).map((item) => item.dataId);
                return parseData.treeList.map(i => ({ ...i, checkedFlag: checkList.includes(i.dataId) ? 1 : 0 }));
              }
            } catch (e) {
              console.error(e);
            }
          },
        };
      },
    },
  };
};

export const maintainPermissionList = (intl, { roleId, cacheRecords, queryUrl }): DataSetProps => {
  return {
    modifiedCheck: false,
    dataToJSON: DataToJSON.normal,
    pageSize: 20,
    fields: [
      {
        name: 'docTypeName',
        label: intl.get('hiam.purAccountManage.common.docType').d('单据'),
      },
      {
        name: 'authScopeCode',
        label: intl.get('hiam.purAccountManage.common.permissionScope').d('权限范围'),
      },
      {
        name: 'authControlType',
        label: intl.get('hiam.purAccountManage.common.controlDimension').d('控制维度'),
      },
    ],
    transport: {
      read: {
        url: queryUrl,
        method: 'GET',
        transformResponse: (res) => {
          try {
            const data = JSON.parse(res);
            if(data && !data.failed) {
              return {
                ...data,
                content: data.content.map(i => {
                  const uuid = `${i.authDocTypeId}${i.authScopeCode}`;
                  const cacheData = cacheRecords.get(uuid);
                  let { roleAuthorityLines } = i;
                  if(roleAuthorityLines && cacheData && cacheData.roleAuthorityLines){
                    const cacheAuthLines = cacheData.roleAuthorityLines;
                    roleAuthorityLines = roleAuthorityLines.map(j => {
                      const cacheAuthLine = cacheAuthLines.find(k => j.authDimId === k.authDimId);
                      return cacheAuthLine ? {...j, ...cacheAuthLine} : j;
                    });
                  }
                  return {
                    ...i,
                    uuid,
                    roleAuthorityLines,
                  };
                }),
              };
            }
          } catch (e) {
            console.error(e);
          }
        },
      },
    },
  };
};
