/* eslint-disable no-nested-ternary */
import React from 'react';
import {
  Form,
  Popconfirm,
  Icon,
  Input,
  Switch,
  InputNumber,
  DatePicker,
  Checkbox,
  Badge,
} from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isNil, omit, isArray } from 'lodash';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { Bind } from 'lodash-decorators';
import { getParams } from '@/utils';
import { FlexSelect } from 'srm-front-cuz/lib/custH0X/getComponent';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import Lov from 'components/Lov';
import { getEditTableData } from 'utils/utils';
import DefaultExpConfig from '../../../components/DefaultExpConfig';
import BaseCondition from './BaseCondition';

import styles from './index.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class DefaultValueModal extends BaseCondition {
  getDefaultValueComponent(record) {
    const { externalForm, paramList, ctxParams, unitType } = this.props;
    const {
      fieldWidget,
      multipleFlag,
      sourceCode,
      format = DEFAULT_DATE_FORMAT,
      proDefaultFlag,
    } = externalForm.getFieldsValue();
    const isSearchBar = unitType === 'SEARCHBAR';
    if (proDefaultFlag) {
      return record.$form.getFieldDecorator('value', { initialValue: record.value })(
        <Badge dot={!!record.$form.getFieldValue('value')}>
          <a
            style={{ lineHeight: '28px', marginLeft: '8px' }}
            onClick={() => this.openProDefaultModal(record.$form)}
          >
            {intl.get('hpfm.individual.model.config.proDefault').d('公式配置')}
          </a>
        </Badge>
      );
    }
    let Widget;
    let formOptions = { initialValue: record.value };
    let widgetProps = {};
    switch (fieldWidget) {
      case 'RADIOGROUP':
      case 'SELECT':
        Widget = FlexSelect;
        widgetProps = {
          lovCode: sourceCode,
          fieldCode: 'value',
          multipleFlag,
          params: getParams({ paramList, ctxParams }),
        };
        break;
      case 'LOV':
        widgetProps = { code: sourceCode, queryParams: getParams({ paramList, ctxParams }) };
        if (multipleFlag === 1) {
          Widget = LovMulti;
          widgetProps.translateData = record.valueMeaning || {};
        } else {
          Widget = Lov;
          widgetProps.textValue = record.valueMeaning || record.value;
        }
        break;
      case 'CURRENCY':
      case 'INPUT_NUMBER': {
        if (isSearchBar && multipleFlag === 1) {
          const newDefaultValue = record.value;
          let defaultStartValue;
          let defaultEndValue;
          // 多选
          if (newDefaultValue) {
            const newDefaultValueArr = newDefaultValue.split(',');
            defaultStartValue = newDefaultValueArr[0]
              ? parseInt(newDefaultValueArr[0], 10)
              : undefined;
            defaultEndValue = newDefaultValueArr[1]
              ? parseInt(newDefaultValueArr[1], 10)
              : undefined;
          }
          return (
            <Input.Group className={styles['input-number-range']}>
              {record.$form.getFieldDecorator('startValue', {
                initialValue: defaultStartValue,
              })(<InputNumber allowClear />)}
              <div className={styles['input-number-range-divider']}>~</div>
              {record.$form.getFieldDecorator('endValue', {
                initialValue: defaultEndValue,
              })(<InputNumber allowClear />)}
            </Input.Group>
          );
        } else {
          Widget = InputNumber;
          widgetProps = {
            className: styles['input-number-single'],
          };
        }
        break;
      }
      case 'DATE_PICKER': {
        const isMonthPicker = /^(YYYY)?[-/]?MM$/.test(format);
        const isTimeType = format.includes('mm:ss');
        Widget =
          isSearchBar && multipleFlag === 1
            ? DatePicker.RangePicker
            : isMonthPicker
            ? DatePicker.MonthPicker
            : DatePicker;
        widgetProps = {
          format,
          showTime: true,
          mode: isMonthPicker ? 'month' : isTimeType ? 'dateTime' : 'date',
          style: { width: '100%' },
        };
        let initialValue = record.value;
        if (isSearchBar && multipleFlag === 1 && initialValue) {
          const newDefaultValueArr = initialValue.split(',');
          if (multipleFlag !== 1) {
            initialValue = newDefaultValueArr[0] ? moment(newDefaultValueArr[0]) : undefined;
          } else {
            const startDate = newDefaultValueArr[0] ? moment(newDefaultValueArr[0]) : undefined;
            const endDate = newDefaultValueArr[1] ? moment(newDefaultValueArr[1]) : undefined;
            initialValue = [startDate, endDate];
          }
        }
        formOptions = {
          initialValue,
          getValueProps: (dateStr) => {
            if (isSearchBar && multipleFlag === 1 && isArray(dateStr)) {
              return {
                value: dateStr.map((d) => (d ? moment(d, format) : d)),
              };
            }
            return {
              value: dateStr ? moment(dateStr, format) : dateStr,
            };
          },
          getValueFromEvent(e) {
            const getValueFn = (date) => {
              if (!date || !date.target) {
                return date && date.format ? date.format(format) : date;
              }
              const { target } = date;
              return target.type === 'checkbox' ? target.checked : target.value;
            };
            if (isSearchBar && multipleFlag === 1 && isArray(e)) {
              return e.map((item) => getValueFn(item));
            } else {
              return getValueFn(e);
            }
          },
        };
        break;
      }
      case 'CHECKBOX':
        Widget = Checkbox;
        widgetProps = { checkedValue: 1, unCheckedValue: 0 };
        formOptions.initialValue = Number(record.value || 0);
        break;
      case 'SWITCH':
        Widget = Switch;
        widgetProps = { checkedValue: 1, unCheckedValue: 0 };
        formOptions.initialValue = Number(record.value || 0);
        break;
      default:
        Widget = Input;
        widgetProps = { trim: true };
    }

    return (
      <FormItem>
        {record.$form.getFieldDecorator('value', formOptions)(<Widget {...widgetProps} />)}
      </FormItem>
    );
  }

  @Bind()
  openProDefaultModal(form) {
    const { record, unitId, ctxParams } = this.props;
    Modal.open({
      title: intl.get('hpfm.individual.model.config.proDefault').d('公式配置'),
      closable: true,
      movable: false,
      drawer: false,
      key: Modal.key(),
      style: { width: 1000 },
      footer: null,
      children: (
        <DefaultExpConfig
          propName="value"
          record={record}
          form={form}
          ctxParams={ctxParams}
          closeModal={this.openProDefaultModal}
          unitId={unitId}
        />
      ),
    });
  }

  getValidatorColumns() {
    const { conditionNo } = this.state;
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
        title: intl.get('hpfm.individual.model.config.defaultValue').d('默认值'),
        dataIndex: 'value',
        render: (_, record) => this.getDefaultValueComponent(record),
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
    const { form, onClose, updateSelfValidator, headerProps, unitType, externalForm } = this.props;
    const { conditionList, validatorList } = this.state;
    const isSearchBar = unitType === 'SEARCHBAR';
    const {
      fieldWidget,
      multipleFlag,
      format = DEFAULT_DATE_FORMAT,
    } = externalForm.getFieldsValue();
    let validateData = getEditTableData(validatorList, ['_status']) || [];
    if (validatorList.length > 0 && validateData.length === 0) {
      return;
    }
    // 逻辑复用，后端必输，故这里给空字符串
    validateData = validateData.map((i) => {
      let newItem = i;
      if (isSearchBar && newItem) {
        if (newItem.startValue || newItem.endValue) {
          newItem.value = `${!isNil(newItem.startValue) ? newItem.startValue : ''},${
            !isNil(newItem.endValue) ? newItem.endValue : ''
          }`;
          newItem = omit(newItem, ['startValue', 'endValue']);
        } else if (multipleFlag === 1 && fieldWidget === 'DATE_PICKER' && isArray(newItem.value)) {
          // eslint-disable-next-line no-nested-ternary
          newItem.value =
            newItem.value.map((j) => (isNil(j) ? '' : j.format ? j.format(format) : j)).join(',') ||
            '';
        }
      }
      return { ...newItem, errorMessage: '' };
    });
    form.validateFields((err, values) => {
      if (err) return;
      const newConditionList = conditionList
        .map((lineData) => {
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
            sourceFieldId: values[`sourceFieldId#${conCode}`],
            sourceFieldCode: values[`sourceFieldCode#${conCode}`],
            sourceModelId: values[`sourceModelId#${conCode}`],
            sourceModelCode: values[`sourceModelCode#${conCode}`],
            sourceFieldValueCode: values[`sourceFieldValueCode#${conCode}`],
            conExpression: values[`conExpression#${conCode}`],
            targetType: values[`targetType#${conCode}`],
            targetValue: values[`targetValue#${conCode}`],
            targetValueMeaning: values[`targetValueMeaning#${conCode}`],
            targetFieldId: values[`targetFieldId#${conCode}`],
            targetFieldCode: values[`targetFieldCode#${conCode}`],
            targetModelId: values[`targetModelId#${conCode}`],
            targetModelCode: values[`targetModelCode#${conCode}`],
          };
        })
        .filter(Boolean);
      if (typeof updateSelfValidator === 'function') {
        updateSelfValidator({
          ...headerProps,
          conType: 'defaultValue',
          lines: newConditionList,
          valids: validateData,
        });
      }
      onClose();
    });
  }
}
