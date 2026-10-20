/* eslint-disable no-continue */
import React, { Component, Ref } from 'react';
import { observer } from 'mobx-react';
import { DataSet, TextField, Form, Radio, Output, Tooltip, Icon } from 'choerodon-ui/pro';
import { FieldType, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'hzero-front/lib/utils/intl';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

@observer
export default class ConNormalHeader extends Component<
  {
    title?: string;
    headerData: any;
    readOnly?: boolean;
    lineDs: DataSet;
    ref: Ref<any>;
  },
  any
> {
  uniqueKeys: number[] = [];

  ds: DataSet;

  constructor(props) {
    super(props);
    const { headerData, readOnly } = props;
    this.ds = new DataSet({
      autoCreate: true,
      data: [headerData],
      fields: [
        { name: 'quickConfig' },
        {
          name: 'conExpression',
          label: intl.get('hpfm.individual.view.message.title.calculatLogic').d('表达式'),
          type: FieldType.string,
          disabled: readOnly,
          dynamicProps: {
            required: ({record}) => this.props.lineDs.records.length > 0 && record.get("quickConfig") === "input",
          },
          validator: (value, name, record) => {
            if (!value || !value.replace(' ', '')) return;
            const array1 = (value !== undefined && value.match(/[^0-9()\s]+/g)) || [];
            const equalOrAnd =
              array1.length > 0
                ? array1.reduce((prev, next) => prev && /OR|AND|or|and/.test(next), true)
                : false;
            if (/（|）/.test(value)) {
              return intl.get('hpfm.customize.common.conditionValidator.tips3').d('请输入英文括号');
            }
            if (array1.length > 0 && !equalOrAnd) {
              return intl
                .get('hpfm.individual.model.config.conditionValidator.tips1')
                .d('不允许输入字母及 ( ) OR AND 以外的字符');
            }
            const array2 = (value !== undefined && value.match(/\s?\d+\s?/g)) || [];
            const conCodes = this.props.lineDs.records.map((r) => String(r.get('conCode')));
            if (record && ["all", "any"].includes((record as any).get("quickConfig"))) return;
            for (let i = 0; i < array2.length; i++) {
              const no = array2[i].match(/(\d+)/)[0];
              if (!conCodes.includes(no)) {
                return intl
                  .get('hpfm.individual.model.config.conditionValidator', { no })
                  .d(`条件${no}不存在`);
              }
            }
          },
        },
      ],
      events: {
        update: ({ record, name }) => {
          if (name === "quickConfig") {
            record.set("conExpression", undefined);
          }
        }
      }
    });
    // eslint-disable-next-line no-param-reassign
    this.ds.records.forEach((r) => {
      r.status = RecordStatus.add;
    });
    const { conExpression = "" } = headerData || {};
    
    if (!/OR|or/.test(conExpression) && !readOnly) this.ds.get(0)!.init("quickConfig", "all");
    else if (!/AND|and/.test(conExpression) && !readOnly) this.ds.get(0)!.init("quickConfig", "any");
    else {
      this.ds.get(0)!.init("quickConfig", "input");
    }
  }

  render() {
    const { readOnly } = this.props;
    const conMeaningMap = {
      all: intl.get('hpfm.customize.common.satisifyAll').d('满足所有条件'),
      any: intl.get('hpfm.customize.common.satisifyAny').d('满足任一条件'),
      input: intl.get('hpfm.customize.common.inputCondRule').d('自定义组合条件'),
    }
    const conExpression = this.ds.current && this.ds.current.get('conExpression');
    return (
      <>
        <div className="with-prefix-title">
          {intl.get('hpfm.individual.view.message.title.calculatLogic').d('表达式')}
          <Tooltip title={intl.get("hpfm.customize.common.satisifyCondTip", { type: this.props.title }).d("满足条件将会{type}")}>
            <Icon type="help" style={{fontSize: "14px", color: "#868d9c", marginLeft: "4px"}} />
          </Tooltip>
        </div>
        {
          !readOnly && (
            <div className="with-prefix-title-help">
              {intl
                .get('hpfm.individual.view.message.title.tips3')
                .d('设置满足不同条件下的默认值。使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3')}
            </div>
          )
        }
        <Form
          dataSet={this.ds}
          className="customize-condition-header-editor single"
          labelLayout={LabelLayout.float}
        >
          {readOnly ? (
            <div style={{ marginTop: '-16px' }}>
              <div style={{ fontWeight: 500, lineHeight: '32px' }}>
                {conExpression || intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
              </div>
            </div>
          ) : (
            <div className="quick-config">
              <Radio dataSet={this.ds} name="quickConfig" value="all" style={{ backgroundColor: "unset" }}>
                {conMeaningMap.all}
              </Radio>
              <Radio dataSet={this.ds} name="quickConfig" value="any" style={{ backgroundColor: "unset" }}>
                {conMeaningMap.any}
              </Radio>
              <Radio dataSet={this.ds} name="quickConfig" value="input" style={{ backgroundColor: "unset" }}>
                {conMeaningMap.input}
              </Radio>
            </div>
          )}
          {this.ds.current && this.ds.current.get('quickConfig') === 'input' && !readOnly && (<TextField name="conExpression" />)}
        </Form>
      </>
    );
  }

  validate = async () => {
    if (!this.ds) return true;
    const validateRes = await this.ds.validate();
    return validateRes;
  };

  getData = () => {
    const data = this.ds.current!.toJSONData();
    const conCodes = this.props.lineDs.records.map((r) => String(r.get('conCode')));
    if (!conCodes.length) {
      return {
        ...data,
        conExpression: undefined
      }
    }
    if (data.quickConfig === 'all') {
      data.conExpression = conCodes.join(" AND ");
    } else if (data.quickConfig === 'any') {
      data.conExpression = conCodes.join(" OR ");
    }
    return data;
  };
}
