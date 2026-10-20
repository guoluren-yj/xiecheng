import React from "react";
import { Form, TextField, DataSet, Modal, Select } from "choerodon-ui/pro";
import { LabelLayout } from "choerodon-ui/pro/lib/form/enum";
import intl from "hzero-front/lib/utils/intl";
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";
import { CODE_LOWER } from 'hzero-front/lib/utils/regExp';
import notification from "hzero-front/lib/utils/notification";
import { HZERO_IAM } from "hzero-front/lib/utils/config";
import { getCurrentOrganizationId, getCurrentUserId, getResponse } from "hzero-front/lib/utils/utils";

export default function createRole(parentRecord, parentHeaderDataSet) {

  const ds = new DataSet({
    fields: [
      {
        name: "parentRoleName",
        label: intl
          .get('hiam.roleManagement.model.roleManagement.adminRole')
          .d('父级管理角色'),
        disabled: true,
      },
      {
        name: "code",
        label: intl.get('hiam.roleManagement.model.roleManagement.code').d('角色编码'),
        required: true,
        validator: (value) => {
          if(!CODE_LOWER.test(value || "")) {
            return intl
            .get('hzero.common.validation.codeLower')
            .d('全小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”');
          }
        },
        maxLength: 64,
      },
      {
        name: "name",
        label: intl.get(`hiam.roleManagement.model.roleManagement.name`).d('角色名称'),
        required: true,
        maxLength: 64,
      },
      {
        name: "description",
        label: intl
          .get('hiam.roleManagement.model.roleManagement.description')
          .d('角色描述'),
          maxLength: 240,
      },
      {
        name: "labelCode",
        label: intl
          .get('hiam.roleManagement.model.roleManagement.roleUser')
          .d('角色使用方'),
        required: true,
        disabled: true,
        defaultValue: "SUPPLIER",
        lookupCode: 'HIAM_MENU_ROLE_LABEL',
      },
    ],
  });
  ds.create({
    parentRoleId: parentRecord.get("roleId"),
    parentRoleName: parentRecord.get("name"),
    tenantId: getCurrentOrganizationId(),
    labelCode: parentRecord.get("labelCode"),
    userId: parentHeaderDataSet.current.get('id'),
  });
  Modal.open({
    title: null,
    key: Modal.key(),
    style: {
      width: "742px",
    },
    drawer: true,
    children: (
      <Form dataSet={ds} labelLayout={LabelLayout.float} columns={2}>
        <TextField name="parentRoleName" />
        <TextField name="code" />
        <TextField name="name" />
        <TextField name="description" />
        <Select name="labelCode" />
      </Form>
    ),
    onOk: () => {
      return axios.post(`${HZERO_IAM}//v1/${getCurrentOrganizationId()}/supplier-user/member/role/create`, ds.current!.toJSONData()).then(res => {
        if(getResponse(res)){
          parentRecord.dataSet.query();
          notification.success({});
          return true;
        }
      });
    },
  });
}