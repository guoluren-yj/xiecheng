import {last} from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, DataSet, Icon, SelectBox, Table, TextField } from "choerodon-ui/pro";
import intl from "hzero-front/lib/utils/intl";
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";
import { SelectionMode } from "choerodon-ui/pro/lib/table/enum";
import { ButtonColor } from "choerodon-ui/pro/lib/button/enum";
import { queryMapIdpValue } from "hzero-front/lib/services/api";
import { getResponse } from "hzero-front/lib/utils/utils";
import notification from "hzero-front/lib/utils/notification";
import { maintainPermissionList } from "./dataSet";

export default function EditPermissionDimContent(props) {
  const cacheRecords = useMemo(() => new Map<string, any>(), []);
  const [saving, setSaving] = useState(false);
  const permissionDimDs = useMemo(() => new DataSet(maintainPermissionList(intl, { roleId: props.roleId, cacheRecords, queryUrl: props.queryUrl })), []);
  const [currentAuthScpoe, setCurrentAuthScpoe] = useState<any>(null);
  const [currentAuthScpoeValue, setCurrentAuthScpoeValue] = useState([]);
  const authTranslate = useMemo(() => ({ scopeCodeMapping: {}, scopeTypeCodeMapping: {} }), []);
  const columns = useMemo(() => [
    { name: 'docTypeName', width: 150 },
    { name: 'authScopeCode', width: 90, renderer: ({ value }) => authTranslate.scopeCodeMapping[value] },
    {
      name: 'authControlType', width: 120, renderer: ({ record }) => {
        const controlScope = record.get("roleAuthorityLines") || [];
        return controlScope.filter(v => v.enabledFlag).map(v => v.authTypeMeaning).join("、");
      },
    },
  ] as any, []);
  const onSearch = useCallback((e) => {
    const oldQuery = permissionDimDs.getQueryParameter("docTypeName");
    if (oldQuery !== e.target.value) {
      permissionDimDs.setQueryParameter("docTypeName", e.target.value);
      permissionDimDs.query();
      pageChange();
    }
  }, [currentAuthScpoe]);

  const rowClick = useCallback((record) => {
    const controlScopeList = record.get("roleAuthorityLines");
    if (controlScopeList && controlScopeList.length) {
      setCurrentAuthScpoeValue(record.get("roleAuthorityLines").filter(v => v.enabledFlag).map(i => i.authTypeCode));
    }
    if (currentAuthScpoe && currentAuthScpoe.status !== 'sync') {
      const roleAuthData = currentAuthScpoe && currentAuthScpoe.toJSONData() || {};
      if (roleAuthData.uuid) cacheRecords.set(roleAuthData.uuid, roleAuthData);
    }
    setCurrentAuthScpoe(record);
  }, [currentAuthScpoe]);

  const authControlScopeChange = useCallback((value) => {
    const {authScopeCode,roleAuthorityLines} = currentAuthScpoe?.get(["authScopeCode","roleAuthorityLines"])||{};
    let newControlList=[];
    if(authScopeCode === "USER"){
      const latestValue = (last(value||[])?[last(value||[])]:[]) as [];
      setCurrentAuthScpoeValue(latestValue);
      newControlList = roleAuthorityLines.map(i => {
        return { ...i, enabledFlag: last(latestValue) === i.authTypeCode ? 1 : 0 };
      });
    }else{
      setCurrentAuthScpoeValue(value || []);
      newControlList = roleAuthorityLines.map(i => {
        return { ...i, enabledFlag: (value || []).includes(i.authTypeCode) ? 1 : 0 };
      });
    } 
    currentAuthScpoe.set("roleAuthorityLines", newControlList);
  }, [currentAuthScpoe]);

  const save = useCallback(() => {
    setSaving(true);
    const submitData = Array.from(cacheRecords.values());
    if (currentAuthScpoe && !cacheRecords.get(currentAuthScpoe.get("uuid"))) {
      submitData.push(currentAuthScpoe.toJSONData());
    }
    const newData = submitData.map(data=>{
      const {authScopeCode, roleAuthorityLines} = data;
      if(authScopeCode === "USER"){
        return {
          ...data,
          roleAuthorityLines: roleAuthorityLines.filter(n=>n.enabledFlag),
        }
      }else{
        return data;
      }
    });
    axios.post(props.saveUrl,
      props.transformSaveData ? props.transformSaveData(newData) : newData
    ).then(res => {
      if (getResponse(res)) {
        notification.success(undefined as any);
        if (props.saveCallback) props.saveCallback(res);
        props.modal.close();
      }
    }).finally(() => {
      setSaving(false);
    });
  }, [currentAuthScpoe]);
  const pageChange = useCallback(() => {
    const roleAuthData = currentAuthScpoe && currentAuthScpoe.toJSONData() || {};
    if (roleAuthData.uuid) cacheRecords.set(roleAuthData.uuid, roleAuthData);
    setCurrentAuthScpoe(null);
    setCurrentAuthScpoeValue([]);
  }, [currentAuthScpoe]);
  useEffect(() => {
    queryMapIdpValue({
      roleAuthScopeCode: 'HIAM.AUTHORITY_SCOPE_CODE',
    }).then(res => {
      if (getResponse(res)) {
        const scopeCodeMapping = {};
        res.roleAuthScopeCode.forEach(i => { scopeCodeMapping[i.value] = i.meaning; });
        authTranslate.scopeCodeMapping = scopeCodeMapping;
        permissionDimDs.query();
      }
    });
  }, []);

  const currentControlScopeList = currentAuthScpoe && currentAuthScpoe.get("roleAuthorityLines") || [];
  return (
    <>
      <div className="doc-list">
        <h3 className="doc-list-title">{intl.get('hiam.purAccountManage.common.editPermissionDim').d('维护权限维度')}</h3>
        {props.alert}
        <div className="doc-list-search">
          <TextField onBlur={onSearch} addonBefore={<Icon type="search" />} />
        </div>
        <Table
          selectionMode={SelectionMode.none}
          className="doc-list-table"
          style={{ maxHeight: `calc(100% - ${props.alert ? 281 : 261}px)` }}
          dataSet={permissionDimDs}
          columns={columns}
          onRow={({ record }) => {
            return {
              onClick: () => rowClick(record),
            };
          }}
          pagination={{ onChange: pageChange }}
        />
        <footer className="doc-permission-dim-footer">
          <Button color={ButtonColor.primary} onClick={save} loading={saving}>
            {intl.get("hzero.common.button.save").d("保存")}
          </Button>
          <Button color={ButtonColor.default} onClick={() => props.modal.close()}>
            {intl.get("hzero.common.button.cancel").d("取消")}
          </Button>
        </footer>
      </div>
      <div className="dim-list">
        <h2 className="dim-list-title">
          {
            currentAuthScpoe
              ? currentControlScopeList.length
                ? (
                  <>
                    {intl.get('hzero.common.button.selected').d("已选择")}
                    <span className="count">{currentAuthScpoeValue.length}</span>
                    {intl.get('hiam.purAccountManage.title.controlScopeNum').d('个控制维度')}
                  </>
                )
                : intl.get('hiam.purAccountManage.title.noControlScope').d('所选单据无控制维度')
              : intl.get('hiam.purAccountManage.title.selectLeftData').d('请在左侧选中行后维护控制维度')
          }
        </h2>
        <SelectBox vertical multiple value={currentAuthScpoeValue} onChange={authControlScopeChange} className="dim-list-check">
          {
            currentControlScopeList.map(i => (
              <SelectBox.Option value={i.authTypeCode}>{i.authTypeMeaning}</SelectBox.Option>
            ))
          }
        </SelectBox>
      </div>
    </>
  );
}