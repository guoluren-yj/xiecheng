import React from 'react';
import { DataSet, TextField, Select, Table, Spin, Output } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { runInAction } from "mobx";
import { getResponse } from 'hzero-front/lib/utils/utils';
import { FieldType, RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { SelectionMode, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { SelectProps } from 'choerodon-ui/pro/lib/select/Select';
import { RenderProps } from 'choerodon-ui/pro/lib/field/FormField';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';

const { Option } = Select;
const selectStyle = { height: "0.28rem" };
const unitSelectRender: Pick<SelectProps, "optionRenderer" | "renderer" | "showValidation"> = {
  optionRenderer: ({ record: r }) => r && (
    <>
      <div style={{ color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        {r.get("unitName")}
      </div>
      <div style={{ color: '#a5a5a5' }}>{r.get("unitCode")}</div>
    </>
  ),
  renderer: ({ record: r }) => {
    const currentUnitInfo = r && r!.getField("paramUnitId")!.get("currentUnitInfo") || {};
    return currentUnitInfo.unitName;
  },
  showValidation: ShowValidation.tooltip,
};
const fieldSelectRender: Pick<SelectProps, "renderer" | "showValidation"> = {
  renderer: ({ record: r }) => {
    const currentUnitInfo = r && r!.getField("paramField")!.get("currentFieldInfo") || {};
    if (!currentUnitInfo.unitFieldCode) return;
    return `${currentUnitInfo.unitFieldName}(${currentUnitInfo.unitFieldCode})`;
  },
  showValidation: ShowValidation.tooltip,
};

const ctxSelectRender = ({ value }: RenderProps) => {
  switch (value) {
    case 'organizationId': return intl.get('hpfm.customize.common.organizationId').d('采购方租户');
    case 'tenantId': return intl.get('hpfm.customize.common.tenantId').d('供应商租户');
    default: ;
  }
};
export default class ParamsConfig extends React.Component<{
  readOnly?: boolean;
  paramList: any[];
  unitId?: string | number;
  relatedParams: any;
}, any> {
  ds: DataSet;

  unitList: any[] = [];

  mapFieldList: any = {};

  constructor(props) {
    super(props);
    const { paramList = [], readOnly, unitId } = props;
    this.state = {
      unitLoading: true,
    };
    this.ds = new DataSet({ paging: false });

    this.queryRelatedUnits(unitId)
      .then(r => {
        if (getResponse(r)) {
          let res = r;
          const currentUnit = res.find(item => item.unitId === unitId) || {};
          // 筛选器单元只能选择到当前单元的字段
          if (currentUnit && currentUnit.unitType === 'SEARCHBAR') {
            res = [currentUnit];
          }
          res.forEach(units => {
            const { unitFields = [], ...unit } = units;
            this.unitList.push(unit);
            this.mapFieldList[unit.unitId] = unitFields;
          });
          this.ds = new DataSet({
            data: paramList,
            paging: false,
            fields: [
              {
                name: "paramKey",
                label: intl.get('hpfm.customize.common.paramKey').d('参数名'),
                type: FieldType.string,
                required: true,
                validator: (value) => {
                  if (/^\d+$/.test(value)) {
                    return intl.get('hpfm.customize.common.validate.notAllNum').d('不能为纯数字');
                  }
                },
                disabled: readOnly,
              },
              {
                name: 'paramType',
                label: intl.get('hpfm.customize.common.paramType').d('参数类型'),
                defaultValue: "fixed",
                options: new DataSet({
                  data: [
                    { value: "context", meaning: intl.get('hpfm.customize.common.contextParam').d('上下文参数') },
                    { value: "url", meaning: intl.get('hpfm.customize.common.urlParam').d('url参数') },
                    { value: "fixed", meaning: intl.get('hpfm.customize.common.fixed').d('固定值') },
                    { value: "unit", meaning: intl.get('hpfm.customize.common.unit').d('表单字段') },
                    { value: "self", meaning: intl.get('hpfm.customize.common.self').d('自定参数') },
                  ],
                }),
                required: true,
                disabled: readOnly,
              },
              {
                name: 'paramValue',
                label: intl.get('hpfm.customize.common.paramValue').d('参数值'),
                type: FieldType.string,
                disabled: readOnly,
                dynamicProps: {
                  required: ({ record }) => !["unit", "url"].includes(record.get("paramType")),
                },
              },
              {
                name: 'paramUnitId',
                label: intl.get('hpfm.individual.common.paramUnit').d('所属单元'),
                disabled: readOnly,
                options: new DataSet({
                  paging: false,
                  data: this.unitList.filter(i => i.unitType !== "GRID" || i.unitType === "GRID" && i.unitId === unitId).map(i => ({ ...i, value: i.unitId })),
                }),
                dynamicProps: {
                  required: ({ record }) => record.get("paramType") === 'unit',
                },
                computedProps: {
                  currentUnitInfo: ({ record }) => {
                    const paramUnitId = record.get("paramUnitId");
                    return this.unitList.find(i => i.unitId === paramUnitId);
                  },
                } as any,
              },
              {
                name: 'paramField',
                label: intl.get('hpfm.individual.common.paramField').d('字段编码'),
                disabled: readOnly,
                computedProps: {
                  currentFieldInfo: ({ record }) => {
                    const { paramUnitId, paramField } = record.get(["paramUnitId", "paramField"]);
                    const [modelCode, modelFieldCode] = (paramField || "").split("#");
                    return (this.mapFieldList[paramUnitId] || []).find(i => i.modelCode === modelCode && i.modelFieldCode === modelFieldCode);
                  },
                  optionsData: ({ record }) => {
                    const { paramType, paramUnitId } = record.get(["paramType", "paramUnitId"]);
                    if (paramType === "unit" && paramUnitId !== undefined) {
                      return this.mapFieldList[paramUnitId];
                    }
                  },
                } as any,
                transformResponse: (_, data) => {
                  if (data.paramType === "unit") {
                    return `${data.paramModelCode}#${data.paramFieldCode}`;
                  } else return undefined;
                },
              },
            ],
            events: {
              update: ({ record, name }) => {
                runInAction(() => {
                  const { modelCode, modelFieldCode } = record.getField("paramField").get("currentFieldInfo") || {};
                  switch (name) {
                    case 'paramField':
                      record.set("paramModelCode", modelCode);
                      record.set("paramFieldCode", modelFieldCode);
                      break;
                    default: ;
                  }
                });
              },
            },
          });
          // eslint-disable-next-line no-param-reassign
          this.ds.records.forEach(record => { record.status = RecordStatus.add; });
        }
      })
      .finally(() => this.setState({ unitLoading: false }));
  }

  // eslint-disable-next-line no-unused-vars
  queryRelatedUnits(unitId: any): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  columns: ColumnProps[] = [
    { name: "paramKey", editor: !this.props.readOnly, width: 150 },
    { name: "paramType", editor: !this.props.readOnly, width: 110 },
    {
      name: "paramValue",
      editor: false,
      onCell: () => ({
        className: "editor-cell-by-renderer",
      }),
      renderer: ({ record }) => {
        const { paramType } = record!.get(["paramType"]);
        let editNode;
        const UnitAndCtxComp: any = this.props.readOnly ? Output : Select;
        switch (paramType) {
          case "url": editNode = false; break;
          case "fixed": editNode = <TextField record={record!} name="paramValue" />; break;
          case "self": editNode = <TextField record={record!} name="paramValue" placeholder={intl.get('hpfm.customize.common.selfParamKey').d('自定参数名')} />; break;
          case "unit":
            editNode = (
              <>
                <UnitAndCtxComp
                  name="paramUnitId"
                  record={record!}
                  style={selectStyle}
                  {...unitSelectRender}
                />
                <UnitAndCtxComp
                  record={record!}
                  {...fieldSelectRender}
                  name="paramField"
                >
                  {(record!.getField("paramField")!.get("optionsData") || []).map(i => (
                    <Option value={`${i.modelCode}#${i.modelFieldCode}`}>
                      <div style={{ color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        {i.unitFieldName}
                      </div>
                      <div style={{ color: '#a5a5a5' }}>{i.unitFieldCode}</div>
                    </Option>
                  ))}
                </UnitAndCtxComp>
              </>
            ); break;
          case 'context':
            editNode = (
              <UnitAndCtxComp
                name="paramValue"
                record={record!}
                renderer={ctxSelectRender}
              >
                <Option value="organizationId">
                  <div style={{ color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    {intl.get('hpfm.customize.common.organizationId').d('采购方租户')}
                  </div>
                  <div style={{ color: '#a5a5a5' }}>organizationId</div>
                </Option>
                <Option value="tenantId">
                  <div style={{ color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    {intl.get('hpfm.customize.common.tenantId').d('供应商租户')}
                  </div>
                  <div style={{ color: '#a5a5a5' }}>tenantId</div>
                </Option>
              </UnitAndCtxComp>
            ); break;
          default: ;
        }
        if (['url', 'fixed', 'self'].includes(paramType) && this.props.readOnly) {
          return <Output record={record!} name="paramValue" />
        }
        return editNode;
      },
    },
  ];

  buttons = [TableButtonType.add, TableButtonType.remove]

  render() {

    return (
      <Spin spinning={this.state.unitLoading}>
        <Table
          style={{ height: "300px" }}
          dataSet={this.ds}
          columns={this.columns}
          selectionMode={this.props.readOnly ? SelectionMode.none : SelectionMode.rowbox}
          buttons={this.props.readOnly ? [] : this.buttons}
        />
      </Spin>
    );
  }
}
