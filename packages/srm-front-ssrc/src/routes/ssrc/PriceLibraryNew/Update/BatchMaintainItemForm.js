import React from 'react';
import {
  DataSet,
  Output,
  Form,
  TextField,
  TextArea,
  NumberField,
  Select,
  DateTimePicker,
  DatePicker,
  Lov,
  CheckBox,
  Icon,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isArray, isEmpty, isNil } from 'lodash';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import moment from 'moment';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

const CurrentOrganizationId = getCurrentOrganizationId();

export default class BatchMaintainItemForm extends React.Component {
  constructor(props) {
    super(props);
    const { checkData, param } = this.props;
    const tableDs = {
      fields: [],
      autoCreate: true,
      events: {
        update: ({ name, value, record }) => {
          // 更新值集映射关系
          if (name.includes('LOV') && value) {
            const dimensionCode = name.split('LOV')[0];
            const priceLibDimMapList = record
              .getField(`${dimensionCode}MapList`)
              .get('defaultValue');
            // 更新值集映射关系
            if (!isEmpty(priceLibDimMapList) && record.get(name)) {
              priceLibDimMapList.forEach((item) => {
                // 存在targetDimensionCode，目标维度编码
                if (item.targetDimensionCode) {
                  // lov对象中的字段赋值到targetDimensionCode
                  record.set(item.targetDimensionCode, record.get(name)[item.sourceFromFieldName]);
                  // 设置meaning
                  if (item.sourceFromFieldMeaning) {
                    record.set(
                      `${item.targetDimensionCode}Meaning`,
                      record.get(name)[item.sourceFromFieldMeaning]
                    );
                  }
                }
              });
            }
          } else if (name.includes('LOV') && !value) {
            const dimensionCode = name.split('LOV')[0];
            const priceLibDimMapList = record
              .getField(`${dimensionCode}MapList`)
              .get('defaultValue');
            if (!isEmpty(priceLibDimMapList)) {
              priceLibDimMapList.forEach((item) => {
                // 存在targetDimensionCode，目标维度编码
                if (item.targetDimensionCode) {
                  record.set(item.targetDimensionCode, undefined);
                  // 设置meaning
                  if (item.sourceFromFieldMeaning) {
                    record.set(`${item.targetDimensionCode}Meaning`, undefined);
                  }
                }
              });
            }
          }
        },
      },
      transport: {
        submit({ data }) {
          return {
            url: `${SRM_SPC}/v1/${CurrentOrganizationId}/price-lib-mains/batch-update`,
            method: 'POST',
            data: {
              priceLibMain: data[0],
              priceLibIds: checkData.reduce((prev, cur) => {
                if (cur._status !== 'create') {
                  prev.push(cur.priceLibId);
                }
                return prev;
              }, []),
              priceLibParam: {
                ...param,
              },
            },
          };
        },
      },
    };
    this.state = {
      formItems: [],
    };
    this.tableDs = new DataSet(tableDs);
  }

  renderFieldType(field = {}, currencyCodeFlag) {
    const { renderDateFormat, renderQueryParams } = this.props;
    let fieldConfig = {};

    const { dimensionCode } = field;

    const displayField = field.priceLibDimMapList?.find(
      (n) => n.targetDimensionCode === dimensionCode
    )?.sourceFromFieldMeaning;
    const valueField = field.priceLibDimMapList?.find(
      (n) => n.targetDimensionCode === dimensionCode
    )?.sourceFromFieldName;

    switch (field.fieldWidget) {
      case 'INPUT':
        fieldConfig = {
          type: 'string',
          maxLength: field.textMaxLength,
          minLength: field.textMinLength,
        };
        break;
      case 'LONG_INPUT':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'SELECT':
        fieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
          // multiple: Number(field.multipleFlag) === 1 ? ',' : false,
          dynamicProps: {
            // 设置下拉框查询参数
            lovPara: ({ record }) => renderQueryParams(field, record),
          },
        };
        break;
      case 'LOV':
        fieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          textField: displayField || field.displayField,
          valueField: valueField || field.valueField,
          dynamicProps: {
            // 设置lov查询参数
            lovPara: ({ record }) => renderQueryParams(field, record),
          },
        };
        break;
      case 'INPUT_NUMBER':
        fieldConfig = {
          type: 'number',
          nonStrictStep: true,
          min: field.numberMin !== null ? new BigNumber(field.numberMin) : undefined,
          max: field.numberMax !== null ? new BigNumber(field.numberMax) : undefined,
          dynamicProps: {
            step: ({ record }) => {
              return currencyCodeFlag &&
                record.get('currencyCode') &&
                ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
                  dimensionCode
                )
                ? null
                : field.numberPrecision || field.numberPrecision === 0
                ? math.div(1, math.pow(10, field.numberPrecision))
                : null;
            },
          },
        };
        break;
      case 'DATE_PICKER':
        fieldConfig = {
          type:
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: renderDateFormat(field.dateFormat),
          transformRequest: (val) =>
            val &&
            moment(val).format(
              field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
                field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
                ? 'YYYY-MM-DD HH:mm:ss'
                : 'YYYY-MM-DD 00:00:00'
            ),
        };
        break;
      case 'SWITCH':
        fieldConfig = {
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          transformResponse: (val) => (isNil(val) ? val : Number(val)),
        };
        break;
      default:
        fieldConfig = {
          type: 'string',
        };
        break;
    }
    return fieldConfig;
  }

  componentDidMount() {
    const { columnList } = this.props;
    const formItems = [];
    if (!isArray(columnList) || isEmpty(columnList)) return [];
    const currencyCodeFlag = columnList.some(
      (item) => item.dimensionCode === 'currencyCode' && item.fieldVisible
    );
    columnList.forEach((item) => {
      if (!item.fieldBatchEditable) {
        return null;
      }
      if (Number(item.fieldVisible) || item.dimensionCode === 'benchmarkPriceType') {
        if (item.fieldWidget === 'LOV') {
          const displayField = item.priceLibDimMapList?.find(
            (n) => n.targetDimensionCode === item.dimensionCode
          )?.sourceFromFieldMeaning;
          const valueField = item.priceLibDimMapList?.find(
            (n) => n.targetDimensionCode === item.dimensionCode
          )?.sourceFromFieldName;

          this.tableDs.addField(`${item.dimensionCode}LOV`, {
            name: `${item.dimensionCode}LOV`,
            label: item.dimensionName,
            ignore: 'always',
            ...this.renderFieldType(item, currencyCodeFlag),
          });
          this.tableDs.addField(`${item.dimensionCode}`, {
            name: `${item.dimensionCode}`,
            type: 'string',
            bind: `${item.dimensionCode}LOV.${valueField || item.valueField}`,
            defaultValue: item.defaultValue,
          });
          this.tableDs.addField(`${item.dimensionCode}Meaning`, {
            name: `${item.dimensionCode}Meaning`,
            type: 'string',
            bind: `${item.dimensionCode}LOV.${displayField || item.displayField}`,
            defaultValue: item.defaultValueMeaning,
          });
          // 设置值集映射关系
          this.tableDs.addField(`${item.dimensionCode}MapList`, {
            name: `${item.dimensionCode}MapList`,
            defaultValue: item.priceLibDimMapList,
            ignore: 'always',
          });
        } else if (item.fieldWidget === 'LINK') {
          return null;
        } else if (item.fieldWidget === 'UPLOAD') {
          return null;
        } else {
          this.tableDs.addField(`${item.dimensionCode}`, {
            name: `${item.dimensionCode}`,
            label: item.dimensionName,
            // required: Number(item.fieldRequired) === 1,
            defaultValue:
              item.fieldWidget === 'SWITCH' ? Number(item.defaultValue) : item.defaultValue,
            ...this.renderFieldType(item, currencyCodeFlag),
          });
        }
      }
      if (Number(item.fieldVisible)) {
        formItems.push(this.getFormItems(item, currencyCodeFlag));
      }
    });
    this.setState({ formItems });
  }

  getFormItems(item, currencyCodeFlag) {
    const { fieldWidget, dimensionCode, sourceCode } = item;
    const record = this.tableDs.current;
    const { getSupplierLovProps } = this.props;

    switch (fieldWidget) {
      case 'INPUT_NUMBER':
        // 含税未税，每一含税未税，全球化
        if (
          ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
            dimensionCode
          )
        ) {
          // 如果有币种，用币种的精度(前提币种存在)，不然就是维度配置的
          const expandProps =
            currencyCodeFlag && record.get('currencyCode')
              ? {}
              : {
                  precision: item.numberPrecision,
                };
          return (
            <C7nPrecisionInputNumber
              name={dimensionCode}
              record={record}
              currency="currencyCode"
              precisionPropIsFirst={false}
              {...expandProps}
            />
          );
        }
        return (
          <NumberField name={dimensionCode} record={record} precision={item.numberPrecision} />
        );
      case 'LOV':
        // 供应商组件
        if (
          dimensionCode === 'supplierCompanyId' &&
          ['SSLM.SUPPLIER', 'SPRM.SUPPLIER_FOR_SPC'].includes(sourceCode)
        ) {
          // 固定值
          const { ...resetProps } = getSupplierLovProps(item, record);
          return (
            <SupplierLov {...resetProps} name={`${dimensionCode}LOV`} dataSet={this.tableDs} />
          );
        }
        return <Lov name={`${dimensionCode}LOV`} record={record} />;
      case 'SELECT':
        return <Select name={dimensionCode} record={record} />;
      case 'SWITCH':
        return <CheckBox name={dimensionCode} record={record} />;
      case 'DATE_PICKER':
        if (
          item.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
          item.dateFormat === 'yyyy-MM-dd hh:mm:ss'
        ) {
          return <DateTimePicker name={dimensionCode} record={record} />;
        }
        return <DatePicker name={dimensionCode} record={record} />;
      case 'INPUT':
        return <TextField name={dimensionCode} record={record} />;
      case 'LONG_INPUT':
        return (
          <TextArea
            name={dimensionCode}
            record={record}
            resize
            rows={1}
            valueChangeAction="input"
          />
        );
      default:
        return <Output name={dimensionCode} record={record} />;
    }
  }

  render() {
    const { checkData } = this.props;
    const { formItems } = this.state;
    return (
      <div>
        <div
          style={{
            margin: '-20px -20px 10px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
          }}
        >
          <Icon type="icon icon-help" />
          &nbsp;&nbsp;
          {isEmpty(checkData)
            ? intl
                .get('ssrc.priceLibraryNew.view.batchMaintainForAllData')
                .d('批量编辑对所有数据进行操作')
            : intl
                .get('ssrc.priceLibraryNew.view.batchMaintainForSelectData')
                .d(`批量编辑仅对勾选数据进行操作（支持跨页勾选）`)}
        </div>
        {
          <Form labelLayout="float" dataSet={this.tableDs}>
            {formItems.map((item) => item)}
          </Form>
        }
      </div>
    );
  }
}
