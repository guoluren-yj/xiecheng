/* eslint-disable no-continue */
import React, { FunctionComponent, Component, JSXElementConstructor, createRef, Ref, ReactElement, useCallback, useRef } from 'react';
import { runInAction } from "mobx";
import { Button, DataSet, Select, TextField, Icon, Form, Spin, Output, Lov, Tooltip } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'hzero-front/lib/utils/intl';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { LabelLayout, ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { SelectProps } from 'choerodon-ui/pro/lib/select/Select';
import { isNil } from 'lodash';
import { getFilter, getParams } from '../../utils';
import FormInputWrapper from '../FormInputWrapper';

import styles from "./index.less";
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

interface LineData {
  __id__: number;
  actionType: string;
  conCode: string;
  sourceType: string;
  sourceUnitId?: string;
  sourceFieldCode?: string;
  ctxValue?: string;
  targetFieldCode?: string;
  targetType?: string;
  targetValue?: string;
}

interface UnitInfo {
  [x: string]: any;
}

const fieldSelectProps: any = {
  optionRenderer: ({ text, record: r }) => (
    <>
      <div style={{ color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        {text}
      </div>
      <div style={{ color: '#a5a5a5' }}>{r.get("textValue")}</div>
    </>
  ),
  renderer: ({ text }) => text,
  searchable: true,
  searchMatcher: ({ record, text }) => {
    const matchItems = [record.get("unitCode"), record.get("meaning"), record.get("fieldCodeAlias"), record.get("cuszFieldName")].filter(Boolean);
    if (matchItems.some(item => item.includes(text))) return true;
    return false;
  }
};
const unitFieldFilter = (r) => {
  const { widgetType, multipleFlag } = r.get(["widgetType", "multipleFlag"]);
  if (["SELECT", "LOV"].includes(widgetType) && multipleFlag) return true;
  return false;
};
export default class Condition extends Component<{
  unitId?: number | string;
  unitType: string;
  readOnly?: boolean;
  lineData: LineData[];
  Header: JSXElementConstructor<{
    headerData: any;
    readOnly?: boolean;
    lineDs: DataSet;
    ref: Ref<Pick<ReactElement, { validate: Function; getData: Function; } & keyof ReactElement>>;
  }>;
  headerProps?: any;
  type: string;
  relatedParams: any;
  ctxParams: any;
  ref: Ref<any>;
  isTemplate?: boolean;
}, any> {
  mapFieldList: {};

  unitList: any[];

  uniqueKeys: string[] = [];

  currentUnit: UnitInfo = {};

  headerRef = createRef<any>();

  constructor(props) {
    super(props);
    const { unitId, lineData = [] } = props;
    this.ds = new DataSet();
    this.state = {
      unitLoading: true,
    };
    this.mapFieldList = {};
    this.unitList = [];
    this.queryRelatedUnits(unitId)
      .then(r => {
        if (getResponse(r)) {
          const res = r;
          // eslint-disable-next-line eqeqeq
          this.currentUnit = res.find(item => item.unitId == unitId) || {};
          res.forEach(units => {
            const { unitFields = [], ...unit } = units;
            this.unitList.push(unit);
            this.mapFieldList[unit.unitId] = unitFields;
          });
          const newData = lineData.map(i => {
            const [realSourceType, ctxValue] = (i.sourceType || "").split("-");
            return {
              ...i,
              sourceType: realSourceType,
              ctxValue,
            };
          });
          this.initDS(this.unitList, newData);
        }
      })
      .finally(() => this.setState({ unitLoading: false }));
  }

  // eslint-disable-next-line no-unused-vars
  queryRelatedUnits(unitId: any): Promise<UnitInfo[]> {
    throw new Error('Method not implemented.');
  }

  ds: DataSet;

  initDS = (unitList, initData: any[] = []) => {
    const { readOnly, unitType, type } = this.props;
    this.ds = new DataSet({
      parentField: 'parentId',
      idField: '__id__',
      fields: [
        { name: '__id__', type: FieldType.number },
        {
          name: 'sourceType',
          label: intl.get('hpfm.customize.common.valueType').d('值类型'),
          defaultValue: "CUZ_UNIT",
          options: new DataSet({
            data: [
              {
                meaning: intl.get('hpfm.customize.common.unitField').d('单元字段'),
                value: 'CUZ_UNIT',
              },
              {
                meaning: intl.get('hpfm.customize.common.context').d('上下文'),
                value: 'CTX',
              },
            ],
          }),
          required: true,
          disabled: readOnly,
        },
        {
          name: 'ctxValue',
          label: intl.get('hpfm.customize.common.ctxParamValue').d('上下文参数值'),
          type: FieldType.string,
          disabled: readOnly,
          options: new DataSet({
            data: [
              {
                meaning: intl.get('hpfm.customize.common.defaultCompany').d('当前子账户默认公司'),
                value: 'defaultCompany',
              },
              {
                meaning: intl.get('hpfm.customize.common.role').d('角色'),
                value: 'currentRoleId',
              },
              {
                meaning: intl.get('hpfm.customize.common.userId').d('子账户(id)'),
                value: 'userId',
              },
              {
                meaning: intl.get('hpfm.customize.common.loginName').d('子账户(账号)'),
                value: 'loginName',
              },
              {
                meaning: intl.get('hpfm.customize.common.accountTenantId').d('子账户所属租户(id)'),
                value: 'ownTenantId',
              },
              {
                meaning: intl.get('hpfm.customize.common.accountTenant').d('子账户所属租户(编码)'),
                value: 'ownTenantNum',
              },
            ],
          }),
          dynamicProps: {
            required: ({ record }) => record.get('sourceType') === 'CTX',
          },
        },
        {
          name: 'sourceUnitId',
          label: intl.get('hpfm.individual.model.config.unitWhich').d('所属单元'),
          type: FieldType.string,
          options: new DataSet({
            paging: false,
            // eslint-disable-next-line array-callback-return
            data: unitList.filter(i => {
              let flag = false;
              if (unitType === "GRID" && !["fieldName", "visible"].includes(type)) flag = i.unitId === this.currentUnit.unitId;
              // 先加入COMMON类型单元，后续如果审批表单增加类表格单元这里就需要再判断单元标签了
              return flag || i.unitType === "FORM" || i.unitType === "COMMON" || i.unitType === "TABPANE" && unitType === "BTNGROUP";
            }).map(i => ({ ...i, meaning: i.unitName, value: `${i.unitId || ""}`, textValue: i.unitCode })),
          }),
          dynamicProps: {
            required: ({ record }) => record.get('sourceType') === 'CUZ_UNIT',
          },
          computedProps: {
            // eslint-disable-next-line eqeqeq
            currentUnitInfo: ({ record }) => unitList.find(i => i.unitId == record.get("sourceUnitId")) || {},
          } as any,
          disabled: readOnly,
        },
        {
          name: 'sourceUnitField',
          label: intl.get('hpfm.customize.common.unitField').d('单元字段'),
          type: FieldType.string,
          disabled: readOnly,
          dynamicProps: {
            required: ({ record }) => record.get('sourceType') === 'CUZ_UNIT',
          },
          computedProps: {
            options: ({ record }) => {
              const list = this.mapFieldList[record.get("sourceUnitId")] || [];
              return new DataSet({
                data: list.map(i => ({ ...i, meaning: i.unitFieldName, value: `${i.modelCode}#${i.modelFieldCode}`, textValue: i.fieldCodeAlias })),
                paging: false,
              });
            },
            currentFieldInfo: ({ record }) => {
              const list = this.mapFieldList[record.get("sourceUnitId")] || [];
              return list.find(i => `${i.modelCode}#${i.modelFieldCode}` === record.get("sourceUnitField")) || {};
            },
          } as any,
          transformResponse: (_, obj) => obj.sourceModelCode && obj.sourceFieldCode ? `${obj.sourceModelCode}#${obj.sourceFieldCode}` : undefined,
        },
        {
          name: 'targetUnitId',
          label: intl.get('hpfm.individual.model.config.unitWhich').d('所属单元'),
          type: FieldType.string,
          options: new DataSet({
            paging: false,
            // eslint-disable-next-line array-callback-return
            data: unitList.filter(i => {

              let flag = false;
              if (unitType === "GRID" && !["fieldName", "visible"].includes(type)) flag = i.unitId === this.currentUnit.unitId;
              return flag || i.unitType === "FORM" || i.unitType === "COMMON" || i.unitType === "TABPANE" && unitType === "BTNGROUP";
            }).map(i => ({ ...i, meaning: i.unitName, value: `${i.unitId || ""}`, textValue: i.unitCode })),
          }),
          dynamicProps: {
            required: ({ record }) => record.get('targetType') === 'formNow',
          },
          computedProps: {
            // eslint-disable-next-line eqeqeq
            currentUnitInfo: ({ record }) => unitList.find(i => i.unitId == record.get("targetUnitId")) || {},
          } as any,
          defaultValue: unitType === "GRID" && ["fieldName", "visible"].includes(type) ? undefined : this.currentUnit.unitId,
          disabled: readOnly,
          transformResponse(value, obj) {
            if(obj.targetType === "formNow") return value;
          },
          transformRequest(value, record) {
            if(record.get("targetType") === "formNow") return value;
          },
        },
        {
          name: 'targetUnitField',
          label: intl.get('hpfm.customize.common.unitField').d('单元字段'),
          type: FieldType.string,
          disabled: readOnly,
          dynamicProps: {
            required: ({ record }) => record.get('targetType') === 'formNow',
          },
          computedProps: {
            options: ({ record }) => {
              const list = this.mapFieldList[record.get("targetUnitId")] || [];
              return new DataSet({
                data: list.map(i => ({ ...i, meaning: i.unitFieldName, value: `${i.modelCode}#${i.modelFieldCode}`, textValue: i.fieldCodeAlias })),
                paging: false,
              });
            },
            currentFieldInfo: ({ record }) => {
              const list = this.mapFieldList[record.get("targetUnitId")] || [];
              return list.find(i => `${i.modelCode}#${i.modelFieldCode}` === record.get("targetUnitField")) || {};
            },
          } as any,
          transformResponse: (_, obj) => obj.targetModelCode && obj.targetFieldCode ? `${obj.targetModelCode}#${obj.targetFieldCode}` : undefined,
        },
        {
          name: 'targetType',
          label: intl.get('hpfm.individual.model.config.targetValueFrom').d('取值来源'),
          type: FieldType.string,
          disabled: readOnly,
          dynamicProps: {
            options: ({ record }) => {
              const fieldInfo = record.getField("sourceUnitField").get("currentFieldInfo");
              return new DataSet({
                data: [
                  {
                    meaning: intl.get('hpfm.individual.model.config.formNow').d('单元字段'),
                    value: 'formNow',
                  },
                  {
                    meaning: intl.get('hpfm.individual.model.config.fixed').d('手工录入'),
                    value: 'fixed',
                  },
                  fieldInfo && fieldInfo.widgetType === "DATE_PICKER" && {
                    meaning: intl.get('hpfm.individual.model.config.time').d('时间常量'),
                    value: 'time',
                  },
                ].filter(Boolean) as any,
                paging: false,
              });
            },
            defaultValue: ({ record }) => ["NOTNULL", "ISNULL"].includes(record.get("conExpression")) ? undefined : 'fixed',
            required: ({ record }) => !["ISNULL", "NOTNULL", "ACTIVE", "UNACTIVE", "", undefined, null].includes(record.get("conExpression")),
          },
        },
        {
          name: 'targetValueObj',
          label: intl.get('hpfm.individual.model.config.fieldValue').d('字段值'),
          type: FieldType.object,
          disabled: readOnly,
          dynamicProps: {
            required: ({ record }) => {
              const { targetType, ctxValue, sourceType, conExpression } = record.get(["ctxValue", "targetType", "sourceType", "conExpression"]);
              if (targetType === "formNow") return false;
              if (["ISNULL", "NOTNULL", "ACTIVE", "UNACTIVE"].includes(conExpression)) return false;
              if (
                targetType === "fixed" && (
                  sourceType === "CTX" && ["defaultCompany", "currentRoleId"].includes(ctxValue) ||
                  sourceType === "CUZ_UNIT" && record.getField("sourceUnitField").get("currentFieldInfo").widgetType) === "LOV"
              ) {
                return true;
              }
            },
            lovCode: ({ record }) => {
              const { targetType, sourceUnitId, sourceUnitField, ctxValue, sourceType } = record.get([
                "ctxValue", "targetType", "sourceUnitId", "sourceUnitField", "sourceType",
              ]);
              let fieldInfo: any = {};
              if (sourceType === "CUZ_UNIT") {
                const list = this.mapFieldList[sourceUnitId] || [];
                fieldInfo = list.find(field => `${field.modelCode}#${field.modelFieldCode}` === sourceUnitField) || {};
              } else if (sourceType === "CTX") {
                fieldInfo = {};
                switch (ctxValue) {
                  case 'defaultCompany': fieldInfo = { sourceFieldValueCode: 'HIAM.USER_MAINTAIN_COMPANY' }; break;
                  case 'currentRoleId': fieldInfo = { sourceFieldValueCode: 'HIAM.TENANT.ROLE' }; break;
                  default: ;
                }
              }
              switch (targetType) {
                case 'fixed': return fieldInfo.sourceFieldValueCode;
                default: return undefined;
              }
            },
            optionsProps: ({ record }) => {
              const { sourceUnitId, sourceUnitField, sourceType } = record.get([
                "sourceUnitId", "sourceUnitField", "sourceType",
              ]);
              const list = this.mapFieldList[sourceUnitId] || [];
              const fieldInfo = list.find(field => `${field.modelCode}#${field.modelFieldCode}` === sourceUnitField) || {};
              if (sourceType === "CUZ_UNIT" && fieldInfo && fieldInfo.widgetType === "LOV") {
                return {
                  childrenField: "children",
                  paging: "server",
                };
              }
              return {};
            },
            lovPara: ({ record }) => {
              const { sourceType } = record.get(["sourceType"]);
              const fieldInfo = record.getField("sourceUnitField").get("currentFieldInfo");
              if (sourceType === "CUZ_UNIT" && fieldInfo && fieldInfo.widgetType === "LOV" && fieldInfo.paramList) {
                return getParams({ paramList: fieldInfo.paramList || [], ctxParams: this.props.ctxParams });
              }
            },
            multiple: ({ record }) => {
              const fieldInfo = record.getField("sourceUnitField").get("currentFieldInfo");

              const { sourceType, conExpression } = record.get(["sourceType", "conExpression"]);
              if (sourceType === "CUZ_UNIT" && fieldInfo && fieldInfo.multipleFlag || ["IN", "NOTIN"].includes(conExpression)) return true;
              return false;
            },
          },
          transformResponse: (value, object) => {
            let lovInfo;
            let useMultipleLov = false;
            if (object.sourceType === "CUZ_UNIT") {
              // 未保存前不存在unitId，故需要根据配置的编码查找一次unitId
              const { unitId: _id } = (this.unitList.find(u => u.unitCode === object.sourceUnitCode) || {});
              const field = (this.mapFieldList[_id] || []).find(
                i => i.modelCode === object.sourceModelCode && i.modelFieldCode === object.sourceFieldCode
              );
              if (field){
                // eslint-disable-next-line prefer-destructuring
                lovInfo = field.lovInfo;
                if (["SELECT", "LOV"].includes(field.widgetType) && field.multipleFlag) useMultipleLov = true;
              }
            }
            if (lovInfo && ["IN", "NOTIN"].includes(object.conExpression)) useMultipleLov = true;
            let valueField = "value";
            let textField = "meaning";
            let valueFieldType;
            let newTargetValue: string[] = [];
            let newTargetValueMeaning: string[] = [];
            switch (object.ctxValue) {
              case "currentRoleId": return {
                id: value,
                name: object.targetValueMeaning,
              };
              case "defaultCompany": return {
                companyId: value,
                companyName: object.targetValueMeaning,
              };
              default:
                if (lovInfo) {
                  // eslint-disable-next-line prefer-destructuring
                  valueField = lovInfo.valueField;
                  textField = lovInfo.displayField;
                  valueFieldType = lovInfo.valueFieldType;
                }
                if (useMultipleLov) {
                  if (object.targetValue) newTargetValue = String(object.targetValue).split(",");
                  if (object.targetValueMeaning) newTargetValueMeaning = String(object.targetValueMeaning).split(',');
                  return newTargetValue.map((v, index) => {
                    let processV: any = v;
                    if (!isNil(processV)) {
                      switch(valueFieldType) {
                        case 'Number': processV = Number(v); break;
                        case 'String': processV = String(v); break;
                        default:;
                      }
                    }
                    return {
                      [valueField]: processV,
                      [textField]: newTargetValueMeaning[index],
                    };
                  });
                }
                return { [valueField]: object.targetValue, [textField]: object.targetValueMeaning };
            }
          },
        },
        {
          name: 'targetValue',
          label: intl.get('hpfm.individual.model.config.fieldValue').d('字段值'),
          disabled: readOnly,
          type: FieldType.string,
          dynamicProps: {
            required: ({ record }) => !["ISNULL", "NOTNULL", "ACTIVE", "UNACTIVE"].includes(record.get("conExpression")) && record.get('targetType') !== 'formNow',
            lookupCode: ({ record }) => {
              const { targetType, sourceUnitId, sourceUnitField } = record.get(["targetType", "sourceUnitId", "sourceUnitField"]);
              const list = this.mapFieldList[sourceUnitId] || [];
              const fieldInfo = list.find(field => `${field.modelCode}#${field.modelFieldCode}` === sourceUnitField) || {};
              if (fieldInfo.widgetType === "LOV") return undefined;
              switch (targetType) {
                case 'time': return 'HPFM.CUST.SPEC_VALUE.LIST';
                case 'fixed': return fieldInfo.sourceFieldValueCode;
                default: return undefined;
              }
            },
            multiple: ({ record }) => {
              const { conExpression } = record.get(["conExpression"]);
              if (["IN", "NOTIN"].includes(conExpression)) return ",";
              return false;
            },
          },
        },
        {
          name: "conExpression",
          lookupCode: 'HPFM.CUST.FIELD_COND_REALTION',
          required: true,
          disabled: readOnly,
        },
      ],
      events: {
        update: ({ name, record, value }) => {
          const targetValueField = record.getField("targetValueObj");
          const sourceUnitIdFieldInfo = record.getField("sourceUnitId").get("currentUnitInfo");
          const sourceUnitFieldInfo = record.getField("sourceUnitField").get("currentFieldInfo");
          const targetUnitFieldInfo = record.getField("targetUnitField").get("currentFieldInfo");
          const targetValueTextField = targetValueField!.get("textField");
          const targetValueValueField = targetValueField!.get("valueField");
          runInAction(() => {
            switch (name) {
              case 'sourceType':
              case "ctxValue":
                record.set("sourceUnitId", undefined);
                record.set("targetType", undefined);
                record.set("conExpression", undefined);
                break;
              case 'targetType':
                record.set("targetValueObj", undefined);
                record.set("targetValue", undefined);
                record.set("targetUnitField", undefined);
                break;
              case "sourceUnitId":
                record.set("sourceUnitCode", sourceUnitIdFieldInfo.unitCode);
                record.set("sourceUnitField", undefined);
                record.set("conExpression", undefined);
                record.set("sourceUnitField", undefined);
                record.set("targetType", undefined);
                break;
              case 'sourceUnitField':
                record.set("conExpression", undefined);
                record.set("sourceFieldCode", sourceUnitFieldInfo.modelFieldCode);
                record.set("sourceModelCode", sourceUnitFieldInfo.modelCode);
                record.set("targetUnitField", undefined);
                record.set("targetType", undefined);
                break;
              case 'conExpression':
                record.set("targetUnitField", undefined);
                record.set("targetValueObj", undefined);
                record.set("targetType", undefined);
                break;
              case 'targetUnitField':
                record.set("targetFieldCode", targetUnitFieldInfo.modelFieldCode);
                record.set("targetModelCode", targetUnitFieldInfo.modelCode);
                break;
              case 'targetValueObj':
                if (record.getField("targetValueObj").get("multiple")) {
                  if (!value || !value.length) {
                    record.set("targetValueMeaning", undefined);
                    record.set("targetValue", undefined);
                    break;
                  }
                  record.set("targetValueMeaning", value.map(v => v[targetValueTextField]).join(","));
                  record.set("targetValue", value.map(v => v[targetValueValueField]).join(","));
                } else {
                  record.set("targetValueMeaning", value && value[targetValueField!.get("textField")]);
                  record.set("targetValue", value && value[targetValueField!.get("valueField")]);
                }
                break;
              default: ;
            }
          });
        },
      },
    });
    this.records = initData.map(lineData => {
      const { conCode } = lineData;
      if (this.uniqueKeys.indexOf(conCode) > -1) return;
      this.uniqueKeys.push(conCode);
      // eslint-disable-next-line no-param-reassign
      const record = (this.ds as DataSet).create({
        ...lineData,
        __id__: this.nextRecordId,
      });
      const field = record.getField("targetValue")!;
      const lovCode = field.get("lovCode");
      const valueField = field.get("valueField");
      const displayField = field.get("textField");
      if (lovCode) {
        record.init("targetValue", {
          [valueField]: lineData.targetValue,
          [displayField]: lineData.targetValueMeaning,
        });
      }
      this.nextRecordId++;
      return record;
    }).filter(Boolean);
    if (this.records.length === 0 && !this.props.readOnly) this.addCondition();
  };

  nextRecordId: number = 0;

  records: any[] = [];

  render() {
    const { readOnly, Header, headerProps, unitType } = this.props;
    const { unitLoading } = this.state;
    return (
      <Spin spinning={unitLoading}>
        <div className='with-prefix-title'>
          {intl.get('hpfm.individual.view.message.title.conditionList').d('判断条件')}
        </div>
        {!readOnly && (
          <div className="add-condition" style={{margin: "-12px 0 4px"}}>
            <Button icon="playlist_add" onClick={() => this.addCondition()} funcType={FuncType.flat} color={ButtonColor.primary}>
              {intl.get('hpfm.customize.common.addCondition').d('添加条件')}
            </Button>
          </div>
        )}
        {
          readOnly && !this.records.length ? (
            <div style={{ fontWeight: 500, lineHeight: '32px', marginTop: '-8px', marginBottom: '8px' }}>
              {intl.get("hpfm.customize.common.noCondition").d("无条件")}
            </div>
          ) : (
            <>
              <div className="customize-condition-line-title" style={{ overflowY: this.records.length > 3 ? "scroll" : "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <td colSpan={1}>
                        {intl.get('hpfm.customize.common.conCode').d('编号')}
                      </td>
                      <td colSpan={2}>
                        {intl.get('hpfm.customize.common.valueType').d('值类型')}
                      </td>
                      <td colSpan={4}>
                        {intl.get('hpfm.customize.common.value').d('值')}
                      </td>
                      <td colSpan={2}>
                        {intl.get('hpfm.individual.model.config.relation').d('关系')}
                      </td>
                      <td colSpan={2}>
                        {intl.get('hpfm.customize.common.valueType').d('值类型')}
                      </td>
                      <td colSpan={4}>
                        {intl.get('hpfm.customize.common.value').d('值')}
                      </td>
                      <td className="control" />
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="customize-condition-line-editor">
                {this.renderRowForm()}
              </div>
            </>
          )
        }
        <Header readOnly={readOnly} lineDs={this.ds} ref={this.headerRef} unitType={unitType} {...headerProps} />
      </Spin>
    );
  }

  renderRowForm = () => {
    const Line = this.props.readOnly ? BaseLineReadonly : BaseLine;
    return this.records.map(record => (
      <Line
        record={record}
        deleteRecord={this.deleteRecord}
      />
    ));
  };

  addCondition(): void {
    if (!this.ds) return;
    const newLineRecord: any = {
      __id__: this.nextRecordId,
      sourceType: "CUZ_UNIT",
      conCode: this.getAutoKey(),
    };
    this.uniqueKeys.push(newLineRecord.conCode);
    this.nextRecordId++;
    this.records.push(this.ds.create(newLineRecord));
    this.forceUpdate();
  }

  getAutoKey() {
    let autoCode = 1;
    const existKeys = this.uniqueKeys.map(i => String(i));
    // eslint-disable-next-line no-constant-condition
    while (1) {
      if (existKeys.indexOf(String(autoCode)) === -1) {
        return String(autoCode);
      }
      autoCode++;
    }
  }

  deleteRecord = (record: any): void => {
    if (!this.ds) return;
    const currentId = record.get('__id__');
    const conCode = record.get('conCode');
    const deleteList = [record];
    this.records = this.records.filter(r => r.get('__id__') !== currentId);
    this.uniqueKeys = this.uniqueKeys.filter(key => key !== conCode);
    this.ds.remove(deleteList);
    this.forceUpdate();
  };

  getData = async () => {
    const headerCurrent: any = this.headerRef.current;
    if (this.ds && (await this.ds.validate()) && headerCurrent && await headerCurrent.validate()) {
      return {
        lineData: (this.ds.toJSONData() as LineData[]).sort((a, b) => a.__id__ - b.__id__).map(i => {
          return {
            ...i,
            sourceType: i.sourceType === "CUZ_UNIT" ? i.sourceType : `${i.sourceType}-${i.ctxValue}`,
            ctxValue: undefined,
          };
        }),
        headerData: headerCurrent.getData(),
      };
    }
  };
}

const BaseLine: FunctionComponent<{
  record: Record;
  deleteRecord: Function;
}> = observer(function BaseLine({
  record,
  deleteRecord,
}) {
  const targetValueObjLovRef = useRef<Lov>();
  const { sourceType, targetType, ctxValue } = record.get(["sourceType", "targetType", "ctxValue"]);
  const sourceUnitField = record.getField("sourceUnitField");
  const sourceUnitFieldInfo = sourceUnitField!.get("currentFieldInfo");
  const fieldInfo = sourceUnitField!.get("currentFieldInfo") || {};
  const sourceUnitInfo = record.getField("sourceUnitId")!.get("currentUnitInfo") || {};
  const expressionFilter = useCallback(
    (r) => getFilter(sourceUnitFieldInfo.widgetType, sourceUnitInfo.unitType).includes(r.get("value")),
    [sourceUnitInfo.unitType, sourceUnitFieldInfo.widgetType, sourceType]
  );
  let FixedWidget = TextField;
  const fixedWidgetProps: any = { name: "targetValue" };
  const unitFieldSelectProps: Partial<SelectProps> = {};
  if (["IN", "NOTIN"].includes(record.get("conExpression"))) {
    unitFieldSelectProps.optionsFilter = unitFieldFilter;
  }
  if (sourceType === "CUZ_UNIT" && fieldInfo.widgetType === "LOV" || sourceType === "CTX" && ["currentRoleId", "defaultCompany"].includes(ctxValue)) {
    FixedWidget = Lov;
    fixedWidgetProps.name = "targetValueObj";
    fixedWidgetProps.tableProps = { mode: "tree" };
    fixedWidgetProps.style = { maxWidth: "100%" };
    fixedWidgetProps.maxTagCount = 1;
    fixedWidgetProps.className = styles["multiple-lov-wrap-fix"];
    fixedWidgetProps.ref = targetValueObjLovRef;
    fixedWidgetProps.modalProps = {
      beforeOpen: () => {
        const lovDsField = targetValueObjLovRef.current ? targetValueObjLovRef.current.options : undefined;
        if (lovDsField) {
          const valueField = record.getField("targetValueObj")!.get("valueField");
          const dsField = valueField ? lovDsField.getField(valueField) : undefined;
          const newDsFieldProps = {};
          if (dsField) {
            Object.assign(newDsFieldProps, dsField.pristineProps, { type: "string" });
          } else {
            Object.assign(newDsFieldProps, {
              name: valueField,
              label: valueField,
              type: "string",
            });
          }
          lovDsField.addField(valueField, newDsFieldProps);
        } else {
          // nothing todo
        }
      },
    };
  } else if (sourceType === "CUZ_UNIT" && ["SELECT", "RADIOGROUP"].includes(fieldInfo.widgetType)) {
    FixedWidget = Select;
  }
  const fields = [
    <Output name="conCode" colSpan={1} />,
    <Select name="sourceType" colSpan={2} />,
  ];
  const hasTargetValue = !["ISNULL", "NOTNULL", "ACTIVE", "UNACTIVE", "", undefined, null].includes(record.get("conExpression"));

  switch (sourceType) {
    case 'CUZ_UNIT':
      fields.push(
        <FormInputWrapper
          Child={Select}
          Wrapper={Tooltip}
          wrapperProps={{ title: () => record.getField("sourceUnitId")!.get("currentUnitInfo").unitName }}
          name="sourceUnitId"
          colSpan={2}
          {...fieldSelectProps}
        />,
        <FormInputWrapper
          Child={Select}
          Wrapper={Tooltip}
          wrapperProps={{ title: () => record.getField("sourceUnitField")!.get("currentFieldInfo").unitFieldName }}
          name="sourceUnitField"
          colSpan={2}
          {...fieldSelectProps}
        />,
      );
      break;
    case 'CTX':
      fields.push(<Select name="ctxValue" colSpan={4} />);
      break;
    default: fields.push(React.createElement("div", { colSpan: 4, name: "_blank" }));
  }
  fields.push(<Select name="conExpression" colSpan={2} optionsFilter={expressionFilter} />);
  if (hasTargetValue) {
    fields.push(<Select name="targetType" colSpan={2} />);
    let disabled = false;
    switch (targetType) {
      case 'formNow':
        fields.push(
          <FormInputWrapper
            Child={Select}
            Wrapper={Tooltip}
            wrapperProps={{title: () => record.getField("targetUnitId")!.get("currentUnitInfo").unitName}}
            name="targetUnitId"
            colSpan={2}
            {...fieldSelectProps}
          />,
          <FormInputWrapper
            Child={Select}
            Wrapper={Tooltip}
            wrapperProps={{title: () => record.getField("targetUnitField")!.get("currentFieldInfo").unitFieldName}}
            name="targetUnitField"
            colSpan={2}
            {...fieldSelectProps}
            {...unitFieldSelectProps}
          />
        );
        break;
      case 'fixed':
        // eslint-disable-next-line no-multi-assign
        fixedWidgetProps.disabled = disabled = ["LOV", "SELECT"].includes(fieldInfo.widgetType) && fieldInfo.sourceFieldValueCode === undefined && targetType === "fixed";
        fields.push(React.createElement("div", { colSpan: 4 }, (
          <Tooltip title={disabled ? intl.get("hpfm.customize.common.noLovCode").d("该字段未配置值集编码") : ""}>
            <FixedWidget {...fixedWidgetProps} />
          </Tooltip>
        )));
        break;
      case 'time':
        fields.push(<Select name="targetValue" colSpan={2} />);
        break;
      default: fields.push(React.createElement("div", { colSpan: 4, name: "_blank" }));
    }
  } else {
    fields.push(React.createElement("div", { colSpan: 6, name: "_blank" }));
  }
  return (
    <Form record={record} columns={16} labelLayout={LabelLayout.none} showValidation={ShowValidation.tooltip}>
      {fields}
      {React.createElement(
        'div',
        {
          fieldClassName: 'control',
        },
        <a style={{ color: '#999' }} onClick={() => deleteRecord(record)}>
          <Icon type="delete" style={{ verticalAlign: 'text-bottom' }} />
        </a>
      )}
    </Form>
  );
});

const BaseLineReadonly: FunctionComponent<{
  record: Record;
  deleteRecord: Function;
}> = observer(function BaseLine({
  record,
  deleteRecord,
}) {
  const { sourceType, targetType, ctxValue } = record.get(["sourceType", "targetType", "ctxValue"]);
  const sourceUnitField = record.getField("sourceUnitField");
  const fieldInfo = sourceUnitField!.get("currentFieldInfo") || {};

  let FixedWidget = Output;
  const fixedWidgetProps: any = { name: "targetValue" };
  const unitFieldSelectProps: Partial<SelectProps> = {};
  if (["IN", "NOTIN"].includes(record.get("conExpression"))) {
    unitFieldSelectProps.optionsFilter = unitFieldFilter;
  }
  if (sourceType === "CUZ_UNIT" && fieldInfo.widgetType === "LOV" || sourceType === "CTX" && ["currentRoleId", "defaultCompany"].includes(ctxValue)) {
    fixedWidgetProps.name = "targetValueObj";
  }
  const fields = [
    <Output name="conCode" colSpan={1} />,
    <Output name="sourceType" colSpan={2} />,
  ];
  const hasTargetValue = !["ISNULL", "NOTNULL", "ACTIVE", "UNACTIVE", "", undefined, null].includes(record.get("conExpression"));

  switch (sourceType) {
    case 'CUZ_UNIT':
      fields.push(
        <FormInputWrapper
          Child={Output}
          Wrapper={Tooltip}
          wrapperProps={{ title: () => record.getField("sourceUnitId")!.get("currentUnitInfo").unitName }}
          className={styles["no-wrap-read-field"]}
          name="sourceUnitId"
          colSpan={2}
        />,
        <FormInputWrapper
          Child={Output}
          Wrapper={Tooltip}
          wrapperProps={{ title: () => record.getField("sourceUnitField")!.get("currentFieldInfo").unitFieldName }}
          className={styles["no-wrap-read-field"]}
          name="sourceUnitField"
          colSpan={2}
        />,
      );
      break;
    case 'CTX':
      fields.push(<Output name="ctxValue" colSpan={4} />);
      break;
    default: fields.push(React.createElement("div", { colSpan: 4, name: "_blank" }));
  }
  fields.push(<Output name="conExpression" colSpan={2} />);
  if (hasTargetValue) {
    fields.push(<Output name="targetType" colSpan={2} />);
    let disabled = false;
    switch (targetType) {
      case 'formNow':
        fields.push(
          <FormInputWrapper
            Child={Output}
            Wrapper={Tooltip}
            wrapperProps={{ title: () => record.getField("targetUnitId")!.get("currentUnitInfo").unitName }}
            className={styles["no-wrap-read-field"]}
            name="targetUnitId"
            colSpan={2}
          />,
          <FormInputWrapper
            Child={Output}
            Wrapper={Tooltip}
            wrapperProps={{ title: () => record.getField("targetUnitField")!.get("currentFieldInfo").unitFieldName }}
            className={styles["no-wrap-read-field"]}
            name="targetUnitField"
            colSpan={2}
          />
        );
        break;
      case 'fixed':
        // eslint-disable-next-line no-multi-assign
        disabled = ["LOV", "SELECT"].includes(fieldInfo.widgetType) && fieldInfo.sourceFieldValueCode === undefined && targetType === "fixed";
        fields.push(React.createElement("div", { colSpan: 4 }, (
          <Tooltip title={disabled ? intl.get("hpfm.customize.common.noLovCode").d("该字段未配置值集编码") : ""}>
            <FixedWidget {...fixedWidgetProps} />
          </Tooltip>
        )));
        break;
      case 'time':
        fields.push(<Output name="targetValue" colSpan={2} />);
        break;
      default: fields.push(React.createElement("div", { colSpan: 4, name: "_blank" }));
    }
  } else {
    fields.push(React.createElement("div", { colSpan: 6, name: "_blank" }));
  }
  return (
    <Form record={record} columns={16} labelLayout={LabelLayout.none} showValidation={ShowValidation.tooltip}>
      {fields}
      {React.createElement(
        'div',
        {
          fieldClassName: 'control',
        }
      )}
    </Form>
  );
});