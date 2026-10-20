/* eslint-disable eqeqeq */
import { Button, DataSet, Form, Lov, Table, Select, Spin } from "choerodon-ui/pro";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import intl from 'hzero-front/lib/utils/intl';
import notification from "hzero-front/lib/utils/notification";
import { LabelLayout } from "choerodon-ui/pro/lib/form/enum";
import { SelectionMode, TableButtonType } from "choerodon-ui/pro/lib/table/enum";
import { Popconfirm, Tag } from "choerodon-ui";
import { FuncType, ButtonColor } from "choerodon-ui/pro/lib/button/enum";
import { ColumnProps } from "choerodon-ui/pro/lib/table/Column";
import { FieldType, RecordStatus } from "choerodon-ui/dataset/data-set/enum";
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import { getResponse } from "hzero-front/lib/utils/utils";
import { condParaDs } from "../dataSets";

export default function CondParaConfig(props) {
  const [loading, setLoading] = useState(true);
  const headerDs = useMemo(() => new DataSet({
    fields: [
      {
        name: "cuszUseFlag",
        label: intl.get("hpfm.doc.common.cuszUseFlag").d("允许个性化字段作为参数"),
        lookupCode: "HPFM.ENABLED_FLAG",
        type: FieldType.string,
        transformRequest(value) {
          return Number(value);
        },
        transformResponse(value) {
          return Number(value || 0).toString();
        },
      },
      {
        name: "conUnitPath",
        label: intl.get("hpfm.doc.common.unitCode").d("单元编码"),
        lovCode: "HPFM.DOC.DOC_UNIT_BY_DOC.LIST",
        lovPara: {
          docCode: props.docCode,
          unitType: "FORM",
        },
        dynamicProps: {
          required({record}){
            // eslint-disable-next-line eqeqeq
            return record.get("cuszUseFlag") == 1;
          },
          disabled({record}){
            // eslint-disable-next-line eqeqeq
            return record.get("cuszUseFlag") != 1;
          },
        },
      },
    ],
    events: {
      update({value, name, record}){
        if(name === "cuszUseFlag" && (!value || value === "0")){
          record.set("conUnitPath", undefined);
        }
      },
    },
  }), []);
  const tableDs = useMemo(() => new DataSet(condParaDs(intl)), []);

  useEffect(() => {
    axios.get(`${HZERO_PLATFORM}/v1/docs/${props.docId}/condition-param`)
      .then(res => {
        if (getResponse(res)) {
          const { conditionParamList = [], ...header } = res;
          headerDs.loadData([header]);
          tableDs.loadData(conditionParamList);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const saveData = useCallback(async (onRes, onErr) => {
    const headerValidate = await headerDs.validate();
    const tableValidate = await tableDs.validate();
    if (headerDs.current && headerValidate && tableValidate) {
      setLoading(true);
      return axios.post(`${HZERO_PLATFORM}/v1/docs/${props.docId}/condition-param`, {
        ...headerDs.current.toJSONData(),
        conditionParamList: tableDs.toJSONData(),
        docCode: props.docCode,
      }).then(() => {
        notification.success(undefined as any);
        if(onRes) onRes();
      }, () => {
        notification.error(undefined as any);
        if(onErr) onErr();
      }).finally(() => {
        setLoading(false);
      });
    } else return Promise.reject();
  }, []);
  useImperativeHandle(props.externalRef, () => ({
    saveData,
  }), []);
  const columns = useMemo((): ColumnProps[] => [
    {
      name: "fieldAlias",
      editor: (record) => record.status === RecordStatus.add,
    },
    {
      name: "fieldName",
      editor: (record) => [RecordStatus.add, RecordStatus.update].includes(record.status),
    },
    {
      name: "fieldWidget",
      editor: (record) => {
        if ([RecordStatus.add, RecordStatus.update].includes(record.status)) {
          return (
            <Select
              record={record}
              optionsFilter={(r) => !["SECTION", "GRID", "FORM", "EMPTY", "WORKFLOW"].includes(r.get("value"))}
              name="fieldWidget"
            />
          );
        }
        return false;
      },
    },
    {
      name: "sourceCode",
      editor: (record) => {
        return [RecordStatus.add, RecordStatus.update].includes(record.status) && ["SELECT", "RADIOGROUP", "LOV"].includes(record.get("fieldWidget"));
      },
    },
    {
      name: "enabledFlag",
      renderer: ({ value }: any) => {
        return (
          <Tag color={value ? "green" : "yellow"} style={{ border: "none", lineHeight: "18px", height: "18px" }}>
            {value ? intl.get("hzero.common.status.enable").d("启用") : intl.get("hzero.common.status.disable").d("禁用")}
          </Tag>
        );
      },
    },
    {
      name: "action",
      header: intl.get("hzero.common.action").d("操作"),
      renderer: ({ record }) => {
        const operator = [
          record!.status !== RecordStatus.add && (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => record!.set("enabledFlag", record!.get("enabledFlag") == 1 ? 0 : 1)}
            >
              {record!.get("enabledFlag") == 1 ? intl.get("hzero.common.button.disable").d("禁用") : intl.get("hzero.common.button.enable").d("启用")}
            </Button>
          ),
          record!.status !== RecordStatus.add && (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => {
                if (record!.status !== RecordStatus.sync) {
                  record!.reset();
                  // eslint-disable-next-line no-param-reassign
                } else record!.status = RecordStatus.update;
              }}
            >
              {record!.status !== RecordStatus.sync ? intl.get("hzero.common.button.cancel").d("取消") : intl.get("hzero.common.button.edit").d("编辑")}
            </Button>
          ),
          <Popconfirm
            title={intl.get("hzero.common.message.confirm.delete").d("是否删除此条记录")}
          >
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => tableDs.remove(record!)}
            >
              {intl.get('hzero.common.button.delete').d("删除")}
            </Button>
          </Popconfirm>,
        ];
        if (operator.filter(Boolean).length > 0) return operator;
        else return "-";
      },
    },
  ], []);
  return (
    <Spin spinning={loading}>
      <Form dataSet={headerDs} columns={3} labelLayout={LabelLayout.float} style={{ marginBottom: "32px" }}>
        <Select name="cuszUseFlag" clearButton={false} />
        <Lov name="conUnitPath" />
      </Form>
      <Table
        dataSet={tableDs}
        columns={columns}
        buttons={[TableButtonType.add]}
        selectionMode={SelectionMode.none}
        filter={(record)=>!record.isRemoved}
      />
    </Spin>
  );
}