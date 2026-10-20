/* eslint-disable no-continue */
import React, { Component, JSXElementConstructor, Ref } from 'react';
import { observer } from "mobx-react";
import { isNil, isArray } from 'lodash';
import { Button, DataSet, Output, Table, TextField } from 'choerodon-ui/pro';
import { FieldType, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import { NOT_CHINA_PHONE } from 'hzero-front/lib/utils/regExp';
import moment from 'moment';

@observer
export default class ConDefaultValueHeader extends Component<{
  headerData: any;
  readOnly?: boolean;
  lineDs: DataSet;
  ref: Ref<any>;
  unitType: string;
  lovCode?: string;
  lookupCode?: string;
  disabled?: boolean;
  valueField?: string;
  displayField?: string;
  multiple?: boolean | 0 | 1;
  lovPara?: any,
  regionField?: string;
  landlineNumFlag?: -1 | 0 | 1;
  proDefaultFlag?: 0 | 1;
  Widget: JSXElementConstructor<any>,
  fieldWidget?: string;
}, any> {

  uniqueKeys: number[] = [];

  ds: DataSet;

  constructor(props) {
    super(props);
    const {
      multiple,
      disabled,
      headerData: { valids },
      readOnly,
      range,
      unitType,
      fieldWidget,
      format,
      proDefaultFlag,
      regionField,
      landlineNumFlag,
      precision,
      padDecimalZeros,
    } = props;
    let { lovCode, lookupCode, lovPara, displayField, valueField, valueFieldType } = props;
    const isSeachBarType = unitType === 'SEARCHBAR';
    this.uniqueKeys = (valids || []).map(i => Number(i.conCode));
    if (Number(proDefaultFlag || 0)) {
      // 如果是高级默认值，屏蔽值集编码配置
      lovCode = undefined;
      lookupCode = undefined;
      lovPara = undefined;
      displayField = undefined;
      valueField = undefined;
    }
    this.ds = new DataSet({
      autoCreate: !readOnly,
      paging: false,
      data: valids || [],
      fields: [
        {
          name: "conExpression",
          label: intl.get('hpfm.customize.common.condExpression').d('当条件满足'),
          type: FieldType.string,
          disabled: readOnly,
          required: true,
          validator: (value) => {
            if (!value || !value.replace(" ", "")) return;
            const array1 = (value !== undefined && value.match(/[^0-9()\s]+/g)) || [];
            const equalOrAnd =
              array1.length > 0
                ? array1.reduce((prev, next) => prev && /OR|AND|or|and/.test(next), true)
                : false;
            if (/（|）/.test(value)) {
              return intl.get('hpfm.customize.common.conditionValidator.tips3').d('请输入英文括号');
            }
            if (array1.length > 0 && !equalOrAnd) {
              return intl.get('hpfm.individual.model.config.conditionValidator.tips1').d('不允许输入字母及 ( ) OR AND 以外的字符');
            }
            const array2 = (value !== undefined && value.match(/\s?\d+\s?/g)) || [];
            const conCodes = this.props.lineDs!.records.map(r => String(r.get("conCode")));
            for (let i = 0; i < array2.length; i++) {
              const no = array2[i].match(/(\d+)/)[0];
              if (!conCodes.includes(no)) {
                return intl.get('hpfm.individual.model.config.conditionValidator', { no }).d(`条件${no}不存在`);
              }
            }
          },
        },
        {
          name: "value",
          label: intl.get('hpfm.individual.model.config.defaultValue').d('默认值'),
          required: true,
          disabled: disabled || readOnly,
          lovCode,
          lookupCode,
          range: isSeachBarType && range && Number(proDefaultFlag) !== 1,
          lovPara,
          format,
          regionField,
          precision,
          padDecimalZeros,
          defaultValidationMessages: {
            patternMismatch: intl.get('hpfm.individual.model.config.defaultValue.patternMismatch').d('手机号码格式有误'),
          },
          multiple: (isSeachBarType && range) ? false : multiple,
          transformRequest: (value, record) => {
            if (isSeachBarType) {
              // 公式默认值不处理
              if (Number(proDefaultFlag) === 1 || !value) {
                return value;
              } else if (lovCode) {
                return multiple ? value.map(v => v[valueField]).join(",") : value[valueField];
              } else if (lookupCode) {
                return multiple ? value.join(",") : value;
              } else if (range) {
                if (fieldWidget === 'DATE_PICKER') {
                  // eslint-disable-next-line no-nested-ternary
                  return value.map(v => isNil(v) ? '' : v.format ? v.format(format) : v).join(',');
                }
                return value.map(v => isNil(v) ? '' : v).join(',');
              }
            } else if (lovCode) {
              return multiple ? value.map(v => v[valueField]).join(",") : value[valueField];
            }
            return value;
          },
          transformResponse: (value, record = {}) => {
            const { value: _d = '', valueMeaning: _dm = '' } = record;
            if (isSeachBarType) {
              if (Number(proDefaultFlag) === 1 || !value) {
                return value;
              } else if (lovCode) {
                let defaultValue = _d;
                let defaultValueMeaning = _dm;
                if (!multiple) {
                  return {
                    [valueField]: defaultValue,
                    [displayField]: defaultValueMeaning,
                  };
                } else {
                  defaultValue = defaultValue ? defaultValue.split(",") : [];
                  const v = _d.split(",").map((item) => {
                    let processV: any = item;
                    if (!isNil(processV)) {
                      switch(valueFieldType) {
                        case 'Number': processV = Number(item); break;
                        case 'String': processV = String(item); break;
                        default:;
                      }
                    }
                    return {
                      [valueField]: processV,
                      [displayField]: defaultValueMeaning && defaultValueMeaning[item],
                    };
                  });
                  return v;
                }
              } else if (lookupCode) {
                return multiple ? value.split(",") : value;
              } else if (range) {
                if (fieldWidget === 'DATE_PICKER') {
                  return value.split(',').map(v => isNil(v) ? '' : moment(v));
                } else {
                  return value.split(',');
                }
              }
            } else if (lovCode) {
              let defaultValue = _d;
              let defaultValueMeaning = _dm;
              if (multiple) {
                defaultValue = _d.split(",");
                return _d.split(",").filter(v => !!v).map(v => ({ [valueField]: v, [displayField]: _dm && _dm[v] }));
              }
              return {
                [valueField]: defaultValue,
                [displayField]: defaultValueMeaning,
              };
            }
            return value;
          },
          dynamicProps: {
            pattern: ({ record }) => {
              if (fieldWidget !== 'TEL_FIELD') {
                return undefined;
              }
              if (record.get('regionField') === '+86') {
                return landlineNumFlag == '1' ? /^1\d{10}$|^(\d{2,5}-?|\(\d{2,5}\))?[1-9]\d{4,7}(-\d{1,8})?$/ : /^1\d{10}$/;
              }
              return NOT_CHINA_PHONE;
            },
            type: () => {
              if (proDefaultFlag === 1) {
                return FieldType.string;
              }
              if (lovCode) {
                return FieldType.object;
              }
              if (fieldWidget === 'TEL_FIELD') {
                return FieldType.tel;
              }
              if (fieldWidget === 'INPUT_NUMBER') {
                return FieldType.number;
              }
              if (fieldWidget === 'CURRENCY') {
                return FieldType.currency;
              }
              if (fieldWidget === 'EMAIL_FIELD') {
                return FieldType.email;
              }
              return FieldType.string
            },
          },
          optionsProps: {
            childrenField: lovCode ? "children" : undefined,
            paging: lovCode ? "server" : false,
          },
        },
        {
          name: 'regionField',
          lookupCode: 'HPFM.IDD',
          defaultValue: '+86',
        },
        // 默认值公式默认使用widget.defaultValue存储
        {
          name: "widget.defaultValue",
          transformResponse: (_, record = {}) => {
            return record.value;
          },
        },
        {
          name: "errorMessage",
          type: FieldType.string,
          defaultValue: "",
        },
      ],
      events: {
        load: ({ dataSet }) => {
          dataSet.forEach(record => {
            if (fieldWidget === 'TEL_FIELD') {
              if (record.get('value')) {
                const value = record.get('value');
                const [regionCode, phoneNum] = value.split('|');
                record.init('regionField', regionCode);
                record.init('value', phoneNum);
              } else {
                record.init('regionField', '+86');
              }
            }
          });
        },
        update: ({ record, name, value }) => {
          if (name === "widget.defaultValue") {
            record.set("value", value);
          } else if (name === "value") {
            const textField = record.getField("value").get("textField");
            let text = (value || {})[textField];
            if (isSeachBarType && multiple && value && value.length && isArray(value)) {
              text = value.map(i => i && i[textField]).join(',');
            }
            record.set("valueMeaning", text);
          }
        },
      },
    });
    // eslint-disable-next-line no-param-reassign
    this.ds.records.forEach(r => { r.status = RecordStatus.add; });
  }

  columns: ColumnProps[] = [
    {
      name: "conExpression",
      editor: !this.props.readOnly && <TextField name="conExpression" placeholder={intl.get("hpfm.customize.common.exampleExpression").d("示例 (1 OR 2) AND 3")}/>,
    },
    {
      name: "value",
      editor: this.props.proDefaultFlag ? undefined : (record, name) => {
        const { Widget } = this.props;
        return <Widget name={name} record={record} tableProps={{ mode: "tree" }} />;
      },
      renderer: this.props.proDefaultFlag ? this.props.Widget as any : undefined,
    },
  ]

  render() {
    const {
      readOnly,
    } = this.props;
    return (
      <>
        <div className='with-prefix-title'>
          {intl.get('hpfm.customize.common.defaultValueList').d('默认值列表')}
        </div>
        <div className="with-prefix-title-help">{intl.get('hpfm.individual.view.message.title.tips3').d('使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3')}</div>
        <Table
          dataSet={this.ds}
          buttons={readOnly ? [] : [
            TableButtonType.add,
            <Button icon="remove_circle" disabled={!this.ds.selected.length} onClick={() => {
              return this.ds.delete(this.ds.selected, {
                children: intl.get("hzero.c7nProUI.DataSet.delete_selected_row_confirm").d("确认删除选中行？"),
                onOk: () => {
                  this.ds.selected.forEach(r => r.status = RecordStatus.add);
                }
              });
            }}>
              {intl.get("hzero.common.button.batchdelete")}
            </Button>
          ]}
          style={{ maxHeight: "180px" }}
          className="customize-condition-header-editor single"
          columns={this.columns}
        />
      </>
    );
  }

  validate = async () => {
    if (!this.ds) return true;
    if (this.props.lineDs.length > 0 && this.ds.length === 0) {
      notification.error({
        description: undefined,
        message: intl.get('hpfm.individual.model.config.conditionValidator.tips2').d("条件行存在时至少有一行条件表达式"),
      });
      return false;
    }
    const validateRes = await this.ds.validate();
    return validateRes;
  };

  getNewDataConCode() {
    let conCode = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.uniqueKeys.includes(conCode)) {
        this.uniqueKeys.push(conCode);
        return conCode;
      }
      conCode++;
    }
  }

  getData = () => {
    const { headerData: { valids = [] }, fieldWidget } = this.props;
    const validsMap = {};
    valids.forEach(old => {
      validsMap[old.conCode] = old;
    });
    return {
      ...this.props.headerData,
      valids: this.ds.toJSONData().map((i: any) => {
        const conCode = i.conCode || this.getNewDataConCode();
        if (fieldWidget === 'TEL_FIELD' && i.value && i.regionField) {
          i.value = `${i.regionField}|${i.value}`;
        }
        return { ...validsMap[conCode], ...i, conCode, widget: undefined };
      }),
    };
  };
}
