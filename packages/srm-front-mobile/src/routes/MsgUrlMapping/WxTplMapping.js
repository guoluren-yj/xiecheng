import React, { useCallback, useEffect, useImperativeHandle, useMemo } from 'react';
import { observer } from "mobx-react-lite";
import { Alert, Spin } from 'choerodon-ui';
import { Button, Form, Table, TextField, useDataSet, Icon, DataSet, Select, Tooltip } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import request from "hzero-front/lib/utils/request";


import styles from "./index.less";

export default formatterCollections({ code: ['smbl.common'] })(observer(function WxTplMapping({ urlMappingId, parentRef }) {
  const headerDs = useDataSet(() => ({
    fields: [
      { name: "messageTemplateInfo.templateCode", label: intl.get("smbl.common.field.msgCode").d("消息模板编码") },
      { name: "messageTemplateInfo.templateName", label: intl.get("smbl.common.field.msgName").d("消息模板名称") },
      { name: "channelName", label: intl.get("smbl.common.field.channel").d("推送频道") },
    ],
    transport: {
      read: {
        method: "GET",
        url: `/smbl/v1/${getCurrentOrganizationId()}/msg-url-mapping/category-template`,
        params: {
          urlMappingId,
        },
      },
    },
  }), []);
  const wxTplList = headerDs.current && headerDs.current.get("categoryTemplateList");
  const messageTemplateParamMappingList = headerDs.current && headerDs.current.get("messageTemplateParamMappingList");
  const dsList = useMemo(() => {
    if (wxTplList && wxTplList.length) {
      return wxTplList.map(wxTpl => {
        const paramDs = new DataSet({
          paging: false,
          selection: "none",
          dataToJSON: "all",
          fields: [
            { name: "categoryTemplateKey", label: intl.get("smbl.common.field.tplKeyWord").d("模板关键字"), type: "string" },
            { name: "categoryTemplateKeyName", label: intl.get("smbl.common.field.tplKeyCode").d("模板字段编码"), type: "string" },
            { name: "messageTemplateKey", label: intl.get("smbl.common.field.srmTplVar").d("SRM模板变量"), type: "string", required: true },
          ],
        });
        const lineHeaderDs = new DataSet({
          fields: [
            { name: "categoryTemplateId", label: intl.get("smbl.common.field.templateId").d("类目模板ID") },
            { name: "categoryTemplateName", label: intl.get("smbl.common.field.templateTitle").d("标题") },
          ],
        });
        if (wxTpl) {
          paramDs.loadData(wxTpl.paramMappingList || []);
          lineHeaderDs.loadData([wxTpl]);
        }
        return [lineHeaderDs, paramDs];
      });
    }
    return [];
  }, [wxTplList]);
  useImperativeHandle(parentRef, () => ({
    headerDs,
    dsList,
  }), [dsList]);
  useEffect(() => {
    headerDs.query();
  }, []);
  const columns = useMemo(() => ([
    {
      name: "categoryTemplateKey",
      renderer: ({ text, record }) => {
        const flag1 = record && record.get("categoryTemplateParamNotMatchedFlag") === 1;
        const flag2 = record && record.get("messageTemplateParamNotMatchedFlag") === 1;
        return (
          <Tooltip
            title={flag1 || flag2 ?(
              <>
                <div>{flag1 && intl.get("smbl.common.validate.wxTplVarMissMatch1").d("类目模版中不存在此参数")}</div>
                <div>{flag1 && intl.get("smbl.common.validate.wxTplVarMissMatch2").d("该参数对应的SRM模板变量在消息模板中不存在")}</div>
              </>
            ) : null}
          >
            <span style={{ color: flag1 || flag2 ? "red" : "unset"}}>{text}</span>
          </Tooltip>
        );
      },
    },
    { name: "categoryTemplateKeyName" },
    {
      name: "messageTemplateKey",
      editor: (
        <Select>
          {messageTemplateParamMappingList && messageTemplateParamMappingList.map(param => (
            <Select.Option value={param.messageTemplateKey}>
              {param.messageTemplateKey}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ]), [messageTemplateParamMappingList]);
  const validateTpl = useCallback((dataSet, lineDataSet) => {
    if (!dataSet || !dataSet.current) return;
    const categoryTemplateId = dataSet.current.get("categoryTemplateId");
    const thirdPartyAccountId = dataSet.current.get("thirdPartyAccountId");
    return request(`/smbl/v1/${getCurrentOrganizationId()}/msg-url-mapping/category-template-param`, {
      method: "GET",
      query: {
        urlMappingId,
        categoryTemplateId,
        thirdPartyAccountId,
      },
    }).then(res => {
      if (getResponse(res)) {
        dataSet.loadData([{
          ...res,
          thirdPartyAccountId,
          thirdPartyAccountDesc: dataSet.current.get("thirdPartyAccountDesc"),
          srmAccount: dataSet.current.get("srmAccount"),
          applicationName: dataSet.current.get("applicationName"),
        }]);
        dataSet.setState({ categoryTemplateId });
        if (lineDataSet) {
          const newData = (res.paramMappingList || []).map(param => {
            const oldData = lineDataSet.find(r => r.get("categoryTemplateKey") === param.categoryTemplateKey);
            if (oldData) return oldData.toJSONData();
            return param;
          });
          lineDataSet.loadData(newData);
        }
      }
    });
  }, []);
  return (
    <div className={styles["wx-tpl-container"]}>
      <Spin spinning={headerDs.status !== "ready"}>
        <Alert type="info" message={<><Icon type="info" />{intl.get("smbl.common.alert.wxTplTip").d("微信公众号通知模板ID,需在对应微信公众号端申请「类目模板」，该功能下需将类目模板参数与SRM消息模板映射")}</>} />
        <Form dataSet={headerDs} labelLayout="float" columns={3} style={{ paddingBottom: "16px" }}>
          <TextField name="messageTemplateInfo.templateCode" disabled />
          <TextField name="messageTemplateInfo.templateName" disabled />
          <TextField name="channelName" disabled />
        </Form>
        <div className="wx-account-list">
          {(wxTplList || []).map((wxTpl, index) => {
            const { srmAccount, applicationName, thirdPartyAccountDesc } = wxTpl || {};
            if (!dsList[index]) return null;
            return (
              <div className='wx-tpl-item'>
                <div className='wx-tpl-title'>{srmAccount}-{applicationName}-{thirdPartyAccountDesc}</div>
                <Form dataSet={dsList[index][0]} labelLayout="float" columns={3}>
                  <TextField
                    name="categoryTemplateId"
                    colSpan={3}
                    clearButton
                    onClear={() => {
                      if (dsList[index][0] && dsList[index][0].current) dsList[index][0].current.set("categoryTemplateId", undefined);
                      if (dsList[index][1]) dsList[index][1].loadData([]);
                    }}
                    addonAfter={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Button
                          funcType='link'
                          style={{ height: "100%" }}
                          disabled={!dsList[index][0] || !dsList[index][0].current.get("categoryTemplateId")}
                          onClick={() => validateTpl(dsList[index][0], dsList[index][1])}
                        >
                          {intl.get("smbl.common.button.validate").d("点击验证")}
                        </Button>

                        <Tooltip title={intl.get("smbl.common.buttonTip.wxTplValidate").d("点击可同步最新的微信类目模版")}>
                          <Icon type="help" style={{ fontSize: "14px", marginleft: "4px" }} />
                        </Tooltip>
                      </div>
                    }
                  />
                  <TextField name="categoryTemplateName" colSpan={3} disabled />
                </Form>
                <Table dataSet={dsList[index][1]} columns={columns} style={{ marginTop: "16px", padding: "0 8px" }} selectionMode='none' />
              </div>
            );
          })}
        </div>
      </Spin>
    </div>
  );
}));