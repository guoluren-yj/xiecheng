import React, { PureComponent, Fragment } from 'react';
import { Switch, Row, Col, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import intl from 'utils/intl';

// const { Option } = Select;

const getFormItemSchema = ({ fieldType, onChange = () => {}, disabled }) => {
  const defaultItemSchema = {
    // input: ({ typeCase, dbc2sbc/* , trim, trimAll */ }) => (
    //   <Fragment>
    //     <Row style={{ marginBottom: 8 }}>
    //       {/* <Col span={8} style={{ lineHeight: '36px' }}>
    //         <Col span={8}>
    //           {intl.get('hzero.common.title.individuation.formInputPropsSize').d('控件大小')}:
    //         </Col>
    //         <Col span={16}>
    //           <Select
    //             style={{ width: 120 }}
    //             disabled={disabled}
    //             defaultValue={size}
    //             onChange={val => onChange({ size: val })}
    //           >
    //             {['large', 'default', 'small'].map(n => (
    //               <Option key={n} value={n}>
    //                 {n}
    //               </Option>
    //             ))}
    //           </Select>
    //         </Col>
    //       </Col> */}
    //       <Col span={8} style={{ lineHeight: '36px' }}>
    //         <Col span={12}>
    //           {intl
    //             .get('hzero.common.title.individuation.formInputPropsTypeCase')
    //             .d('组件的大小写输入限制')}
    //           :
    //         </Col>
    //         <Col span={12}>
    //           <Select
    //             style={{ width: 120 }}
    //             disabled={disabled}
    //             defaultValue={typeCase}
    //             onChange={val => onChange({ typeCase: val })}
    //           >
    //             {['upper', 'lower'].map(n => (
    //               <Option key={n} value={n}>
    //                 {n}
    //               </Option>
    //             ))}
    //           </Select>
    //         </Col>
    //       </Col>
    //       <Col span={8} style={{ lineHeight: '36px' }}>
    //         <Col span={12}>
    //           {intl
    //             .get('hzero.common.title.individuation.formInputPropsDbc2sbc')
    //             .d('是否转换全角到半角')}
    //           :
    //         </Col>
    //         <Col span={12}>
    //           <Switch
    //             checked={dbc2sbc}
    //             disabled={disabled}
    //             onChange={val => onChange({ dbc2sbc: val })}
    //           />
    //         </Col>
    //       </Col>
    //     </Row>
    //     {/* <Row style={{ marginBottom: 8 }}>
    //       <Col span={8} style={{ lineHeight: '36px' }}>
    //         <Col span={10}>
    //           {intl
    //             .get('hzero.common.title.individuation.formInputPropsTrim')
    //             .d('是否删除前后空格')}
    //           :
    //         </Col>
    //         <Col span={14}>
    //           <Switch
    //             checked={trim}
    //             disabled={disabled}
    //             onChange={val => onChange({ trim: val })}
    //           />
    //         </Col>
    //       </Col>
    //       <Col span={8} style={{ lineHeight: '36px' }}>
    //         <Col span={12}>
    //           {intl
    //             .get('hzero.common.title.individuation.formInputPropsTrimAll')
    //             .d('是否删除所有空格')}
    //           :
    //         </Col>
    //         <Col span={12}>
    //           <Switch
    //             checked={trimAll}
    //             disabled={disabled}
    //             onChange={val => onChange({ trimAll: val })}
    //           />
    //         </Col>
    //       </Col>
    //     </Row> */}
    //   </Fragment>
    // ),
    inputNumber: ({ max, min, precision, allowThousandth }) => (
      <Fragment>
        <Row style={{ marginBottom: 8 }}>
          <Col span={8} style={{ lineHeight: '36px' }}>
            <Col span={8}>
              {intl.get('hzero.common.title.individuation.formInputPropsMax').d('最大值')}:
            </Col>
            <Col span={16}>
              <InputNumber
                defaultValue={max}
                disabled={disabled}
                onChange={val => onChange({ max: val })}
              />
            </Col>
          </Col>
          <Col span={8} style={{ lineHeight: '36px' }}>
            <Col span={8}>
              {intl.get('hzero.common.title.individuation.formInputPropsMin').d('最小值')}:
            </Col>
            <Col span={16}>
              <InputNumber
                defaultValue={min}
                disabled={disabled}
                onChange={val => onChange({ min: val })}
              />
            </Col>
          </Col>
          <Col span={8} style={{ lineHeight: '36px' }}>
            <Col span={8}>
              {intl.get('hzero.common.title.individuation.formInputPropsPrecision').d('数值精度')}:
            </Col>
            <Col span={16}>
              <InputNumber
                defaultValue={precision}
                disabled={disabled}
                onChange={val => onChange({ precision: val })}
              />
            </Col>
          </Col>
        </Row>
        <Row style={{ marginBottom: 8 }}>
          <Col span={8} style={{ lineHeight: '36px' }}>
            <Col span={10}>
              {intl.get('hzero.common.title.individuation.allowThousandth').d('是否启用千分位')}:
            </Col>
            <Col span={14}>
              <Switch
                checked={allowThousandth}
                disabled={disabled}
                onChange={val => onChange({ allowThousandth: val })}
              />
            </Col>
          </Col>
        </Row>
      </Fragment>
    ),
    // select: ({ size }) => (
    //   <Row style={{ marginBottom: 8 }}>
    //     <Col span={8} style={{ lineHeight: '36px' }}>
    //       <Col span={8}>
    //         {intl.get('hzero.common.title.individuation.formInputPropsSize').d('控件大小')}:
    //       </Col>
    //       <Col span={16}>
    //         <Select
    //           style={{ width: 120 }}
    //           defaultValue={size}
    //           disabled={disabled}
    //           onChange={val => onChange({ size: val })}
    //         >
    //           {['large', 'default', 'small'].map(n => (
    //             <Option key={n} value={n}>
    //               {n}
    //             </Option>
    //           ))}
    //         </Select>
    //       </Col>
    //     </Col>
    //   </Row>
    // ),
    // switch: ({ size }) => (
    //   <Row style={{ marginBottom: 8 }}>
    //     <Col span={8} style={{ lineHeight: '36px' }}>
    //       <Col span={8}>
    //         {intl.get('hzero.common.title.individuation.formInputPropsSize').d('控件大小')}:
    //       </Col>
    //       <Col span={16}>
    //         <Select
    //           style={{ width: 120 }}
    //           defaultValue={size}
    //           disabled={disabled}
    //           onChange={val => onChange({ size: val })}
    //         >
    //           {['large', 'default', 'small'].map(n => (
    //             <Option key={n} value={n}>
    //               {n}
    //             </Option>
    //           ))}
    //         </Select>
    //       </Col>
    //     </Col>
    //   </Row>
    // ),
  };
  const renderItem = defaultItemSchema[fieldType.toLocaleLowerCase()];
  return isFunction(renderItem) ? renderItem : () => {};
};

export default class FieldPropsPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  @Bind()
  onMoreClick() {
    const { showMore } = this.state;
    this.setState({
      showMore: !showMore,
    });
  }

  render() {
    const {
      dataSource = {},
      onFieldPropsChange = () => {},
      onLayoutChange = () => {},
      dataSourceLayoutRowGroup,
      dataSourceLayoutColGroup,
    } = this.props;
    const {
      fieldName,
      fieldEnabledFlag,
      // fieldDescription,
      disabledRequired,
      fieldProps = {},
      fieldType,
    } = dataSource;
    // const rules = (fieldProps['data-__meta'] || {}).rules || [];
    // const requiredRule = find(rules, o => isBoolean(o.required)) || {
    //   required: true,
    //   message: intl.get('hzero.common.validation.notNull', {
    //     name: fieldDescription,
    //   }),
    // };
    const { col, row } = fieldProps;

    return (
      <Fragment>
        <Row style={{ marginBottom: 8 }}>
          <Col span={8} style={{ lineHeight: '36px' }}>
            <Col span={8}>
              {intl.get('hzero.common.title.individuation.required').d('是否必输')}:
            </Col>
            <Col span={16}>
              <Switch
                onChange={value =>
                  onFieldPropsChange(fieldName, {
                    required: value,
                  })
                }
                checked={fieldProps.required}
                disabled={disabledRequired || fieldEnabledFlag !== 1}
              />
            </Col>
          </Col>
          <Col span={8} style={{ lineHeight: '36px' }}>
            <Col span={8}>
              {intl
                .get('hzero.common.title.individuation.formInputPropsDisabled')
                .d('是否不可编辑')}
              :
            </Col>
            <Col span={16}>
              <Switch
                checked={fieldProps.disabled}
                onChange={value => onFieldPropsChange(fieldName, { disabled: value })}
                disabled={fieldEnabledFlag !== 1}
              />
            </Col>
          </Col>
        </Row>
        <Row style={{ marginBottom: 8 }}>
          <Col span={8} style={{ lineHeight: '36px' }}>
            <Col span={8}>{intl.get('hzero.common.title.individuation.row').d('字段行')}:</Col>
            <Col span={16}>
              <InputNumber
                defaultValue={row + 1}
                disabled={fieldEnabledFlag !== 1}
                onChange={value => onLayoutChange(fieldName, { row: value - 1 })}
                min={1}
                max={dataSourceLayoutColGroup[col]}
                step={1}
              />
            </Col>
          </Col>
          <Col span={8} style={{ lineHeight: '36px' }}>
            <Col span={8}>{intl.get('hzero.common.title.individuation.col').d('字段列')}:</Col>
            <Col span={16}>
              <InputNumber
                defaultValue={col + 1}
                disabled={fieldEnabledFlag !== 1}
                onChange={value => onLayoutChange(fieldName, { col: value - 1 })}
                min={1}
                max={dataSourceLayoutRowGroup[row]}
                step={1}
              />
            </Col>
          </Col>
        </Row>
        {getFormItemSchema({
          fieldType,
          onChange: value => onFieldPropsChange(fieldName, value),
          disabled: fieldEnabledFlag !== 1,
        })(fieldProps)}
      </Fragment>
    );
  }
}
