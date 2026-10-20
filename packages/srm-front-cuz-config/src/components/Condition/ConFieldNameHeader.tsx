/* eslint-disable no-continue */
import React, { Component, Ref } from 'react';
import { observer } from "mobx-react";
import { Button, DataSet, notification, Table, TextField, Output } from 'choerodon-ui/pro';
import { FieldType, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'hzero-front/lib/utils/intl';
import { getFieldNameAlias } from '../../utils/constConfig';

@observer
export default class ConFieldNameHeader extends Component<{
  headerData: any;
  readOnly?: boolean;
  lineDs: DataSet;
  ref: Ref<any>
  unitType: string;
  title?: string;
  errorMessageLabel?: string;
  conExpressionLabel?: string;
}, any> {

  uniqueKeys: number[] = [];

  ds: DataSet;

  constructor(props) {
    super(props);
    const { conExpressionLabel, errorMessageLabel, headerData: {valids}, readOnly, unitType } = props;
    this.uniqueKeys = (valids || []).map(i => Number(i.conCode));
    this.ds = new DataSet({
      autoCreate: !readOnly,
      paging: false,
      data: valids || [],
      fields: [
        {
          name: "conExpression",
          label: conExpressionLabel || intl.get('hpfm.customize.common.condExpression').d('当条件满足'),
          type: FieldType.string,
          disabled: readOnly,
          required: true,
          validator: (value) => {
            if(!value || !value.replace(" ", "")) return;
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
            const conCodes = this.props.lineDs.records.map(r=>String(r.get("conCode")));
            for (let i = 0; i < array2.length; i++) {
              const no = array2[i].match(/(\d+)/)[0];
              if (!conCodes.includes(no)) {
                return intl.get('hpfm.individual.model.config.conditionValidator', { no }).d(`条件${no}不存在`);
              }
            }
          },
        },
        {
          name: "errorMessage",
          label: errorMessageLabel || getFieldNameAlias(unitType),
          type: FieldType.intl,
          required: true,
          disabled: readOnly,
        },
      ],
    });
    // eslint-disable-next-line no-param-reassign
    this.ds.records.forEach(r=>{r.status = RecordStatus.update;});
  }

  columns: ColumnProps[] = [
    {
      name: "conExpression",
      editor: !this.props.readOnly && <TextField name="conExpression" placeholder={intl.get("hpfm.customize.common.exampleExpression").d("示例 (1 OR 2) AND 3")}/>,
    },
    {
      name: "errorMessage",
      editor: !this.props.readOnly,
    },
  ]

  render() {
    const {
      title = "",
      readOnly,
    } = this.props;
    return (
      <>
        <div className='with-prefix-title'>{title}</div>
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
    if(this.props.lineDs.length > 0 && this.ds.length === 0) {
      notification.error({
        message: intl.get('hpfm.individual.model.config.conditionValidator.tips2').d("条件行存在时至少有一行条件表达式"),
        description: undefined,
      });
      return false;
    }
    const validateRes = await this.ds.validate();
    return validateRes;
  };

  getNewDataConCode(){
    let conCode = 1;
    // eslint-disable-next-line no-constant-condition
    while(true){
      if(!this.uniqueKeys.includes(conCode)) {
        this.uniqueKeys.push(conCode);
        return conCode;
      }
      conCode ++;
    }
  }


  getData = () => {
    const { headerData: {valids = []}} = this.props;
    const validsMap = {};
    valids.forEach(old=>{
      validsMap[old.conCode] = old;
    });
    return {
      ...this.props.headerData,
      valids: this.ds.toJSONData().map((i: any)=>{
        const conCode = i.conCode || this.getNewDataConCode();
        return {...validsMap[conCode], ...i, conCode};
      }),
    };
  };
}
