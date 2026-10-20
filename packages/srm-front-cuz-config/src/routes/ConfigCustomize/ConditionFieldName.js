import React from 'react';
import { Form, Popconfirm, Icon, Input } from 'hzero-ui';
import intl from 'utils/intl';
import { connect } from 'dva';
import TLEditor from 'components/TLEditor';
import { Bind } from 'lodash-decorators';
import { getEditTableData } from 'utils/utils';

import BaseCondition from './BaseCondition.js';

const FormItem = Form.Item;

@connect(({ configCustomizeCuz }) => {
  const {
    codes,
    fieldNameValidList = [],
    fieldNameConList = [],
    fieldNameProps = {},
    cacheWidget = {},
  } = configCustomizeCuz;
  return {
    codes,
    headerProps: fieldNameProps,
    conditionList: fieldNameConList,
    validatorList: fieldNameValidList,
    cacheWidget,
  };
})
@Form.create({ fieldNameProp: null })
export default class ConditionFieldName extends BaseCondition {
  getValidatorColumns() {
    const { conditionNo } = this.state;
    const { fieldNameAlias } = this.props;
    return [
      {
        title: intl.get('hpfm.individual.view.message.title.calculatLogic').d('表达式'),
        dataIndex: 'conExpression',
        width: 350,
        render: (val, record) => (
          <FormItem wrapperCol={{ span: 24 }}>
            {record.$form.getFieldDecorator(`conExpression`, {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.individual.view.message.title.calculatLogic').d('表达式'),
                  }),
                },
                {
                  validator: (_, value, cb) => {
                    const array = (value !== undefined && value.match(/\s?\d+\s?/g)) || [];
                    for (let i = 0; i < array.length; i += 1) {
                      const no = array[i].match(/(\d+)/)[0];
                      if (conditionNo[no] !== 1) {
                        cb(
                          intl
                            .get('hpfm.individual.model.config.conditionValidator', {
                              no,
                            })
                            .d(`条件${no}不存在`)
                        );
                        return;
                      }
                    }
                    cb();
                  },
                },
                {
                  validator: (_, value, cb) => {
                    const array = (value !== undefined && value.match(/[^0-9()\s]+/g)) || [];
                    const equalOrAnd =
                      array.length > 0
                        ? array.reduce((prev, next) => prev && /OR|AND/.test(next), true)
                        : false;
                    if (array.length > 0 && !equalOrAnd) {
                      cb(
                        intl
                          .get('hpfm.individual.model.config.conditionValidator.tips1')
                          .d('不允许输入字母及 ( )  OR AND 以外的字符')
                      );
                      return;
                    }
                    cb();
                  },
                },
              ],
            })(<Input inputChinese={false} />)}
          </FormItem>
        ),
      },
      {
        title: fieldNameAlias,
        dataIndex: 'errorMessage',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`errorMessage`, {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: fieldNameAlias,
                  }),
                },
              ],
            })(<TLEditor label={fieldNameAlias} field="errorMessage" token={record._token} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get('hzero.common.action').d('操作'),
        dataIndex: '_op',
        width: 60,
        render: (_, record) => (
          <Popconfirm
            title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
            okText={intl.get('hzero.common.status.yes').d('是')}
            cancelText={intl.get('hzero.common.status.no').d('否')}
            onConfirm={() => this.delValidator(record.conCode)}
          >
            <a className="delete" role="button" style={{ color: '#333' }}>
              <Icon type="delete" />
            </a>
          </Popconfirm>
        ),
      },
    ];
  }

  @Bind()
  onOk() {
    const { form, onClose, updateSelfValidator, selfValidator } = this.props;
    const { conditionList, validatorList } = this.state;
    const validateData = getEditTableData(validatorList, ['_status']) || [];
    if (validatorList.length > 0 && validateData.length === 0) {
      return;
    }
    form.validateFields((err, values) => {
      if (err) return;
      const newConditionList = conditionList
        .map(lineData => {
          if (!lineData) return false;
          const { conCode } = lineData;
          let sourceType = values[`sourceType#${conCode}`];
          if (values[`ctxValue#${conCode}`]) {
            sourceType += `-${values[`ctxValue#${conCode}`]}`;
          }
          return {
            ...lineData,
            sourceType,
            sourceUnitId: values[`sourceUnitId#${conCode}`],
            sourceUnitCode: values[`sourceUnitCode#${conCode}`],
            sourceModelCode: values[`sourceModelCode#${conCode}`],
            sourceModelFieldCode: values[`sourceModelFieldCode#${conCode}`],
            // sourceFieldId: values[`sourceFieldId#${conCode}`],
            sourceFieldCode: values[`sourceFieldCode#${conCode}`],
            // sourceModelId: values[`sourceModelId#${conCode}`],
            sourceFieldValueCode: values[`sourceFieldValueCode#${conCode}`],
            conExpression: values[`conExpression#${conCode}`],
            targetType: values[`targetType#${conCode}`],
            targetValue: values[`targetValue#${conCode}`],
            targetValueMeaning: values[`targetValueMeaning#${conCode}`],
            targetModelCode: values[`targetModelCode#${conCode}`],
            targetModelFieldCode: values[`targetModelFieldCode#${conCode}`],
            // targetFieldId: values[`targetFieldId#${conCode}`],
            targetFieldCode: values[`targetFieldCode#${conCode}`],
            // targetModelId: values[`targetModelId#${conCode}`],
          };
        })
        .filter(Boolean);
      if (typeof updateSelfValidator === 'function') {
        updateSelfValidator("fieldName", {
          ...selfValidator,
          conType: 'fieldName',
          lines: newConditionList,
          valids: validateData,
        });
      }
      onClose();
    });
  }
}
