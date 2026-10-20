/* eslint-disable no-continue */
import React, { FunctionComponent, useMemo } from 'react';
import { Button, DataSet, Select, TextField, Icon, Form, Spin, Output } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'hzero-front/lib/utils/intl';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { eatChar, eatShort } from 'srm-front-cuz/lib/utils/index.js';
import { queryRelatedUnits, queryTemplateRelatedUnits } from '../../../services/customizeConfigService.js';
import { filterFxUnitType } from "../../../utils/constConfig";

const { Option } = Select;

type EditorProps = {
  statement?: string;
  unitId: number | string;
  ref?: React.RefAttributes<TreeNodeEditor>;
  readOnly?: boolean;
  isTemplate?: boolean;
  templateParams?: any;
  fieldWidget?: string;
};

interface LineData {
  __id__: number;
  actionType: string;
  uniqueKey: string;
  varType: string;
  source?: string;
  sourceField?: string;
  unit?: string;
  unitField?: string;
  specialType?: string;
  specialValue?: string;
}

export default class TreeNodeEditor extends React.Component<EditorProps, any> {
  mapFieldList: {};

  unitList: any[];

  uniqueKeys: string[] = [];

  constructor(props) {
    super(props);
    const { unitId, isTemplate, templateParams } = props;
    this.ds = new DataSet();
    const { statement } = props;
    this.state = {
      unitLoading: true,
    };
    this.mapFieldList = {};
    this.unitList = [];
    (isTemplate
      ? queryTemplateRelatedUnits({ ...templateParams, unitId, returnVirtual: true, filterUnitType: filterFxUnitType })
      : queryRelatedUnits({ unitId, returnVirtual: true, filterUnitType: filterFxUnitType })
    ).then(r => {
      if (getResponse(r)) {
        const res = r;
        res.forEach(units => {
          const { unitFields = [], ...unit } = units;
          this.unitList.push(unit);
          this.mapFieldList[unit.unitId] = unitFields;
        });
        this.initDS(this.unitList, statement);
      }
    })
      .finally(() => this.setState({ unitLoading: false }));
  }

  type: string = '';

  ds: DataSet;

  initDS = (unitList, statement) => {
    const { fieldWidget } = this.props;
    const currentUnit = unitList.find(u => u.unitId === this.props.unitId);
    const fixUnitType = fieldWidget === 'LOV';
    this.ds = new DataSet({
      parentField: 'parentId',
      idField: '__id__',
      fields: [
        { name: '__id__', type: FieldType.number },
        {
          name: 'actionType',
          type: FieldType.string,
          required: true,
          defaultValue: 'DEF',
        },
        {
          name: 'varType',
          label: intl.get('hpfm.individual.common.paramFrom').d('参数来源'),
          type: FieldType.string,
          required: true,
          defaultValue: fixUnitType ? 'UNIT' : 'CTX',
        },
        {
          name: 'uniqueKey',
          label: intl.get('hpfm.individual.common.paramKey').d('参数名'),
          type: FieldType.string,
          required: true,
          validator: value => {
            if (!/^[_a-zA-Z]/.test(value)) {
              return intl.get('hpfm.customize.common.err1').d('参数名只能以下划线和字母开头');
            }
            return true;
          },
          // dynamicProps: {
          // required: ({ record }) => record.get("statementType").actionType === "DEF" },
        },
        // { name: "type", label: "类型", type: FieldType.string },
        // { name: "execStatement", type: FieldType.string, dynamicProps: { required: ({ record }) => record.get("statementType").actionType === "FUN" } },
        {
          name: 'source',
          label: '来源',
          type: FieldType.string,
          options: new DataSet({
            data: [
              { meaning: '租户信息', value: 'ACC' },
              { meaning: 'URL参数', value: 'URL' },
              { meaning: '功能预置', value: 'CUS' },
            ],
          }),
          defaultValue: 'ACC',
          dynamicProps: {
            required: ({ record }) => record.get('varType') === 'CTX',
          },
        },
        {
          name: 'sourceField',
          label: intl.get('hpfm.customize.common.ctxParamValue').d('上下文参数值'),
          type: FieldType.string,
          options: new DataSet({
            data: [
              {
                meaning: intl.get('hpfm.customize.common.organizationId').d('采购方租户'),
                value: 'organizationId',
              },
              {
                meaning: intl.get('hpfm.customize.common.tenantId').d('供应商租户'),
                value: 'tenantId',
              },
              {
                meaning: intl.get('hpfm.customize.common.loginName').d('登录名'),
                value: 'loginName',
              },
              {
                meaning: intl.get('hpfm.customize.common.realName').d('账户名'),
                value: 'realName',
              },
              {
                meaning: intl.get('hpfm.customize.common.currentRoleId').d('角色ID'),
                value: 'currentRoleId',
              },
              {
                meaning: intl.get('hpfm.customize.common.currentRoleName').d('角色名称'),
                value: 'currentRoleName',
              },
              {
                meaning: intl.get('hpfm.customize.common.currentRoleCode').d('角色编码'),
                value: 'currentRoleCode',
              },
            ],
          }),
          dynamicProps: {
            required: ({ record }) => record.get('varType') === 'CTX',
          },
        },
        {
          name: 'unit',
          label: intl.get('hpfm.individual.model.config.unitWhich').d('所属单元'),
          type: FieldType.string,
          options: new DataSet({
            paging: false,
            // eslint-disable-next-line array-callback-return
            data: unitList.filter(i => {
              const { unitType, unitId } = currentUnit || {};
              return i.unitType === "FORM" || unitType === "GRID" && i.unitId === unitId;
            }).map(i => ({ ...i, meaning: i.unitName, value: `${i.unitCode || ""}` })),
          }),
          dynamicProps: {
            required: ({ record }) => record.get('varType') === 'UNIT',
          },
        },
        {
          name: 'unitField',
          label: intl.get('hpfm.customize.common.unitField').d('单元字段'),
          type: FieldType.string,
          dynamicProps: {
            required: ({ record }) => record.get('varType') === 'UNIT',
          },
        },
        {
          name: 'specialType',
          label: intl.get('hpfm.customize.common.specialType').d('固定值分类'),
          type: FieldType.string,
          bind: 'special.specialType',
          // options: new DataSet({data: [{meaning: intl.get('hpfm.customize.common.date').d('日期'), value: "DATE"}]}),
          lookupCode: 'HPFM.CUST.SPEC_VALUE.TYPE',
          defaultValue: 'DATE',
          dynamicProps: {
            required: ({ record }) => record.get('varType') === 'SPEC',
          },
        },
        {
          name: 'specialValue',
          label: intl.get('hpfm.customize.common.fixed').d('固定值'),
          type: FieldType.string,
          lookupCode: 'HPFM.CUST.SPEC_VALUE.LIST',
          cascadeMap: { parentValue: 'specialType' },
          // options: new DataSet({
          //   data: [
          //     {meaning: intl.get('hpfm.customize.common.now').d('当前时间'), value: "NOW"},
          //     {meaning: intl.get('hpfm.customize.common.nowDay').d('当天'), value: "NOW_DAY"},
          //     {meaning: intl.get('hpfm.customize.common.lastDayOfMon').d('本月最后一天'), value: "LAST_MON_DAY"},
          //     {meaning: intl.get('hpfm.customize.common.firstDayOfMon').d('本月第一天'), value: "FIRST_MON_DAY"},
          //   ],
          // }),
          defaultValue: 'NOW',
          dynamicProps: {
            required: ({ record }) => record.get('varType') === 'SPEC',
          },
        },
        // {
        //   name: "argsList",
        //   label: "来源字段名",
        //   type: FieldType.string,
        //   bind: "special.argsList",
        //   dynamicProps: {
        //     required: ({ record }) => record.get("varType") === "FUN",
        //   },
        // },
        // { name: "result", label: "返回语句", type: FieldType.string, bind: "special.result" },
      ],
    });
    this.records = statementToData(statement).map(lineData => {
      const { uniqueKey } = lineData;
      if (this.uniqueKeys.indexOf(uniqueKey) > -1) return;
      this.uniqueKeys.push(uniqueKey);
      // eslint-disable-next-line no-param-reassign
      const record = (this.ds as DataSet).create({
        ...lineData,
        __id__: this.nextRecordId,
      });
      this.nextRecordId++;

      // 目前忽略children
      // if(lineData.children){
      // const parentId = this.nextRecordId-1;
      // lineData.children.forEach(childLine=>{
      //   this.ds.create({...childLine, __id__: this.nextRecordId, parentId});
      //   this.nextRecordId++;
      // });
      // }
      return record;
    }).filter(Boolean);
    if (this.records.length === 0) this.addStatement();
  };

  nextRecordId: number = 0;

  records: any[] = [];

  render() {
    const { readOnly } = this.props;
    const { unitLoading } = this.state;
    return (
      <Spin spinning={unitLoading}>
        <div className="show-header">
          <table>
            <thead>
              <tr>
                <td colSpan={2}>
                  <div>{intl.get('hpfm.individual.common.paramKey').d('参数名')}</div>
                </td>
                <td colSpan={3}>
                  <div>{intl.get('hpfm.individual.common.paramFrom').d('参数来源')}</div>
                </td>
                <td colSpan={8}>
                  <div>{intl.get('hpfm.customize.common.paramValue').d('参数值')}</div>
                </td>
                <td className="control" />
              </tr>
            </thead>
          </table>
        </div>
        <div className="default-exp-config-editor">
          {this.renderRowForm()}
          {!readOnly && (
            <div className="add-variable">
              <Button icon="add" onClick={() => this.addStatement()} funcType={FuncType.flat}>
                {intl.get('hzero.common.button.addParam').d('添加参数')}
              </Button>
            </div>
          )}
        </div>
      </Spin>
    );
  }

  renderRowForm = () => {
    const { readOnly, fieldWidget } = this.props;
    const { unitLoading } = this.state;
    const Line = readOnly ? BaseLineReadonly : BaseLine;
    return this.records.map(record => (
      <Line
        record={record}
        deleteRecord={this.deleteRecord}
        unitLoading={unitLoading}
        mapFieldList={this.mapFieldList}
        unitList={this.unitList}
        fieldWidget={fieldWidget}
      />
    ));
  };

  addStatement(actionType: string = 'DEF'): void {
    if (!this.ds) return;
    const newLineRecord: any = {
      __id__: this.nextRecordId,
      actionType,
      uniqueKey: this.getAutoKey(),
    };
    this.uniqueKeys.push(newLineRecord.uniqueKey);
    this.nextRecordId++;
    this.records.push(this.ds.create(newLineRecord));
    this.forceUpdate();
  }

  getAutoKey(prefixNum: number = 0) {
    let autoChar = 0;
    let prefix = '';
    for (let circle = prefixNum; circle > 0; circle--) {
      prefix += 'a';
    }
    let uniqueKey = `${prefix}a`;
    if (this.uniqueKeys.indexOf(uniqueKey) === -1) {
      return uniqueKey;
    } else {
      do {
        autoChar++;
        uniqueKey = prefix + String.fromCharCode(97 + autoChar);
        if (this.uniqueKeys.indexOf(uniqueKey) === -1) {
          return uniqueKey;
        }
      } while (autoChar < 25);
      return this.getAutoKey(prefixNum + 1);
    }
  }

  deleteRecord = (record: any): void => {
    if (!this.ds) return;
    const currentId = record.get('__id__');
    const uniqueKey = record.get('uniqueKey');
    const deleteList = [record];
    this.records = this.records.filter(r => r && r.get('__id__') !== currentId);
    this.uniqueKeys = this.uniqueKeys.filter(key => key !== uniqueKey);
    this.ds.remove(deleteList);
    this.forceUpdate();
  };

  validate = async () => {
    if (!this.ds) return true;
    const validateRes = await this.ds.validate();
    return validateRes;
  };

  getData = async (): Promise<LineData[]> => {
    if (this.ds && (await this.ds.validate())) {
      return (this.ds.toJSONData() as LineData[]).sort((a, b) => a.__id__ - b.__id__);
    }
    return [];
  };
}

const BaseLine: FunctionComponent<{
  record: Record;
  deleteRecord: Function;
  mapFieldList: any;
  unitLoading: boolean;
  unitList: any[];
  fieldWidget?: string;
}> = observer(function BaseLine({
  record,
  deleteRecord,
  mapFieldList,
  unitLoading,
  unitList,
  fieldWidget,
}) {
  const unitCode = record.get('unit');
  const varType = record.get('varType');
  const source = record.get('source');
  const fieldListDs = useMemo(() => {
    const unit = unitCode && unitList.find(i => i.unitCode === unitCode) || {};
    const list = unit.unitId !== undefined ? mapFieldList[unit.unitId] : [];
    return new DataSet({
      data: list.map(i => ({ meaning: i.unitFieldName, value: i.fieldCodeAlias })),
      paging: false,
    });
  }, [unitCode, mapFieldList, unitLoading]);
  const fixUnitType = fieldWidget === 'LOV';
  let varTypeOptipons = [
    { value: 'CTX', meaning: intl.get('hpfm.customize.common.context').d('上下文') },
    { value: 'UNIT', meaning: intl.get('hpfm.customize.common.unitField').d('单元字段') },
    { value: 'SPEC', meaning: intl.get('hpfm.customize.common.fixed').d('固定值') },
  ];
  if (fixUnitType) {
    varTypeOptipons = [
      { value: 'UNIT', meaning: intl.get('hpfm.customize.common.unitField').d('单元字段') },
    ];
  }
  const fields = [
    <Output name="uniqueKey" colSpan={2} />,
    <Select name="varType" colSpan={3} disabled={fixUnitType}>
      {varTypeOptipons.map(item => (
        <Option value={item.value}>{item.meaning}</Option>
      ))}
    </Select>,
  ];
  const FourthField: any =
    (varType === 'CTX' && source === 'ACC') || varType === 'UNIT' || varType === 'SPEC'
      ? Select
      : TextField;
  if (varType === 'CTX') {
    fields.push(
      <FourthField
        name="sourceField"
        colSpan={8}
        optionRenderer={({ value, text }) => (
          <>
            <div style={{ color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              {text}
            </div>
            <div style={{ color: '#a5a5a5' }}>{value}</div>
          </>
        )}
        searchable
        renderer={({ text }) => text}
      />
    );
  } else if (varType === 'UNIT') {
    fields.push(
      <FourthField
        name="unit"
        colSpan={4}
        searchable
        optionRenderer={({ value, text }) => (
          <>
            <div style={{ color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              {text}
            </div>
            <div style={{ color: '#a5a5a5' }}>{value}</div>
          </>
        )}
        renderer={({ text }) => text}
      />
    );
    fields.push(
      <FourthField
        name="unitField"
        colSpan={4}
        options={fieldListDs}
        searchable
        optionRenderer={({ value, text }) => (
          <>
            <div style={{ color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              {text}
            </div>
            <div style={{ color: '#a5a5a5' }}>{value}</div>
          </>
        )}
        renderer={({ text }) => text}
      />
    );
  } else if (varType === 'SPEC') {
    fields.push(<Select name="specialType" colSpan={4} />);
    fields.push(<FourthField name="specialValue" colSpan={4} />);
  }
  return (
    <Form record={record} columns={14} labelLayout={LabelLayout.none}>
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
  mapFieldList: any;
  unitLoading: boolean;
  unitList: any[];
  readOnly?: boolean;
  fieldWidget?: string;
}> = observer(function BaseLine({
  record,
  readOnly,
}) {
  const varType = record.get('varType');
  const fields = [
    <Output name="uniqueKey" colSpan={2} />,
    <Output name="varType" colSpan={3} renderer={({ value }) => {
      switch(value) {
        case "CTX": return intl.get('hpfm.customize.common.context').d('上下文');
        case "UNIT": return intl.get('hpfm.customize.common.unitField').d('单元字段');
        case "SPEC": return intl.get('hpfm.customize.common.fixed').d('固定值');
      }
    }} />,
  ];
  if (varType === 'CTX') {
    fields.push(
      <Output name="sourceField" colSpan={8} />
    );
  } else if (varType === 'UNIT') {
    fields.push(
      <Output name="unit" colSpan={4} />
    );
    fields.push(
      <Output name="unitField" colSpan={4} />
    );
  } else if (varType === 'SPEC') {
    fields.push(<Output name="specialType" colSpan={4} />);
    fields.push(<Output name="specialValue" colSpan={4} />);
  }
  return (
    <Form record={record} columns={14} labelLayout={LabelLayout.none}>
      {fields}
      {!readOnly &&
        React.createElement(
          'div',
          {
            fieldClassName: 'control',
          }
        )}
    </Form>
  );
});

function statementToData(statementStr: string) {
  const dataArr: any[] = [];
  let subBlock = false;
  const statementArr = eatChar(statementStr);
  for (let offset = 0; offset < statementArr.length; offset++) {
    const currentData: any = {};
    const shorts = eatShort(statementArr[offset]);
    let tmp2 = shorts.next();
    if (tmp2.value === 'THEN') {
      subBlock = true;
      continue;
    }
    if (tmp2.value === 'DONE') {
      subBlock = false;
      continue;
    }
    while (!tmp2.done) {
      let finsh = false;
      switch (tmp2.value) {
        case 'DEF':
          currentData.actionType = tmp2.value;
          currentData.uniqueKey = shorts.next().value;
          currentData.varType = shorts.next().value;
          if (currentData.varType === 'FUN') {
            currentData.argsList = shorts.next().value;
            finsh = true;
          } else if (currentData.varType === 'SPEC') {
            currentData.specialType = shorts.next().value;
            currentData.specialValue = shorts.next().value;
          } else if (currentData.varType === 'UNIT') {
            currentData.unit = shorts.next().value;
            currentData.unitField = shorts.next().value;
          } else if (currentData.varType === 'CTX') {
            currentData.source = shorts.next().value;
            currentData.sourceField = shorts.next().value;
          } else {
            currentData.valueType = shorts.next().value;
          }
          tmp2 = shorts.next();
          break;
        case 'EXEC':
        case 'RES':
          currentData.actionType = tmp2.value;
          tmp2 = shorts.next();
          currentData.execStatement = tmp2.value;
          finsh = true;
          break;
        default:
          tmp2 = shorts.next();
      }
      if (finsh) break;
    }
    if (!subBlock) {
      dataArr.push(currentData);
    } else {
      if (subBlock && !dataArr[dataArr.length - 1].children) {
        dataArr[dataArr.length - 1].children = [];
      }
      dataArr[dataArr.length - 1].children.push(currentData);
    }
  }
  return dataArr;
}
