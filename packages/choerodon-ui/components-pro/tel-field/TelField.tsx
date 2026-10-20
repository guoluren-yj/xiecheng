import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import Text from 'choerodon-ui/lib/text';
import { TextField, TextFieldProps } from '../text-field/TextField';
import SecretField, { SecretFieldProps } from '../secret-field/SecretField';
import { ValidationMessages } from '../validator/Validator';
import ValidationResult from '../validator/ValidationResult';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';
import autobind from '../_util/autobind';
import RegionSelect from './RegionSelect';
import DataSet from '../data-set';
import { Mode } from './enum';

export interface RegionOption extends TextFieldProps {
  regionCode: string;
  regionName: string;
  pattern?: string | RegExp;
}

export interface TelFieldProps extends SecretFieldProps  {
  /**
   * 区号下拉列表
   */
  regionOptions?: RegionOption[];
  /**
   * 区号字段
   */
  regionField?: string;
  /**
   * 切换区号
   */
  /**
   * 编辑模式
   */
  mode?: Mode;
  onRegionChange?: (value: RegionOption) => void;
}

@observer
export default class TelField extends TextField<TelFieldProps> {
  static displayName = 'TelField';

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'tel',
    pattern: /^1\d{10}$|^(\d{2,5}-?|\(\d{2,5}\))?[1-9]\d{4,7}(-\d{1,8})?$/,
    addonBefore: '+86',
    mode: Mode.text,
  };

  type = 'tel';

  @observable regionOption: RegionOption | undefined;

  @observable regionDataSet: DataSet | undefined;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.setAddonBefore();
    });
  }

  get regionField(): string | undefined {
    return this.props.regionField;
  }

  get regionName() {
    const { dataSet, field } = this;
    const { regionField } = this.props;
    if (dataSet && field) {
      return field ? field.get('regionField') : regionField;
    }
    return this.regionField;
  }

  get range(): boolean {
    return false;
  }

  get pattern(): string | RegExp | undefined {
    const { pattern } = this.observableProps;
    const { regionName, record, regionOption } = this;
    if (regionName && record) {
      return record.get(regionName);
    }
    if (regionOption) {
      return regionOption.pattern;
    }
    return pattern;
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Tel', label ? 'value_missing' : 'value_missing_no_label', { label }),
      patternMismatch: $l('Tel', 'type_mismatch_tel'),
    };
  }

  getValidatorProp(key: string) {
    if (key === 'pattern') {
      return this.pattern || TelField.defaultProps.pattern;
    }
    return super.getValidatorProp(key);
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      pattern: props.pattern,
    };
  }

  getFieldType(): FieldType {
    return FieldType.tel;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'regionOptions',
      'regionField',
      'onRegionChange',
    ]);
  }

  prepareSetValue(value: any): void {
    if (isEmpty(value)) {
      super.prepareSetValue(null);
    } else {
      super.prepareSetValue(value);
    }
  }

  @action
  handleRegionChange(value) {
    const { onRegionChange } = this.props;
    if (onRegionChange && isFunction(onRegionChange)) {
      onRegionChange(value);
    }
  }

  @autobind
  @action
  handleAddonChange(value: any) {
    const { regionOptions } = this.props;
    const { regionName, dataSet, field, record } = this;
    const regionField = dataSet && dataSet.getField(regionName);
    if (regionField) {
      const regionDataSet = regionField.get('options');
      if (regionDataSet && record && field) {
        const valueField = regionField.get('valueField');
        const v = isObject(value) ? value[valueField] : value;
        const patternRecord = v && regionDataSet.find(r => r.get(valueField) === v);
        if (patternRecord) {
          const region = patternRecord.get([valueField, 'pattern']);
          record.set(regionName, region[valueField]);
          field.set('pattern', region.pattern);
          this.handleRegionChange(region);
        }
      } else if (regionOptions) {
        const region = regionOptions.find(opt => opt.regionCode === value);
        if (region) {
          this.regionOption = region;
          this.handleRegionChange(region);
        }
      }
    }
    this.validate();
  }

  @autobind
  regionOptionRenderer({ text, value }) {
    return (
      <div className={`${this.prefixCls}-option-region`}>
        <span className={`${this.prefixCls}-option-region-code`}>
          {value}
        </span>
        <Text className={`${this.prefixCls}-option-region-name`}>
          {text}
        </Text>
      </div>
    )
  }

  searchMatcher({ record, text, textField, valueField }) {
    const textValue = record.get(textField);
    const value = record.get(valueField);
    return (isString(textValue) ? textValue.toLowerCase() : textValue)?.indexOf(text.toLowerCase()) !== -1
      || (isString(value) ? value.toLowerCase() : value)?.indexOf(text.toLowerCase()) !== -1;
  }

  @action
  async setAddonBefore() {
    const { regionOptions } = this.props;
    const { regionName, dataSet, record, editable } = this;
    if (dataSet && regionName) {
      const regionField = dataSet.getField(regionName);
      const options = regionField ? regionField.get('options') : undefined;
      if (editable) {
        const selectProps: any = {
          isFlat: true,
          dataSet,
          name: regionName,
          onChange: this.handleAddonChange,
          popupCls: `${this.prefixCls}-popup`,
          optionRenderer: this.regionOptionRenderer,
          options,
          valueField: regionField ? regionField.get('valueField') : undefined,
          searchFieldInPopup: true,
          searchable: true,
          searchMatcher: this.searchMatcher,
          onPopupHiddenChange: hidden => {
            this.isFocused = !hidden;
          },
        };
        if (record) {
          selectProps.record = record;
        }
        this.observableProps.addonBefore = (
          <RegionSelect {...selectProps} />
        );
      } else if (regionField && record) {
        const value = record.get(regionName);
        const valueField = regionField.get('valueField');
        const textField = regionField.get('textField');
        const region = options ? options.find(r => r.get(valueField) === value) : undefined;
        if (region) {
          this.observableProps.addonBefore = `${value}(${region.get(textField)})`
        }
      }
    } else if (regionOptions && regionOptions.length) {
      const { regionField } = this;
      if (editable) {
        this.observableProps.addonBefore = (
          <RegionSelect
            isFlat
            onChange={this.handleAddonChange}
            defaultValue={regionField || regionOptions[0].regionCode}
            popupCls={`${this.prefixCls}-popup`}
            searchable
            searchFieldInPopup
            searchMatcher={this.searchMatcher}
            onPopupHiddenChange={hidden => {
              this.isFocused = !hidden;
            }}
          >
            {regionOptions.map(option => {
              const { regionCode, regionName } = option;
              return (
                <RegionSelect.Option key={regionCode} value={regionCode} className={`${this.prefixCls}-option-region`}>
                  <span className={`${this.prefixCls}-option-region-code`}>
                    {regionCode}
                  </span>
                  <Text className={`${this.prefixCls}-option-region-name`}>
                    {regionName}
                  </Text>
                </RegionSelect.Option>
              );
            })}
          </RegionSelect>
        );
      } else {
        const value = regionField || regionOptions[0].regionCode;
        const region = regionOptions.find(opt => opt.regionCode === value);
        if (region) {
          this.observableProps.addonBefore = `${value}(${region.regionName})`;
        }
      }
    }
  }

  renderWrapper(): ReactNode {
    const { mode } = this.props;
    if (mode === Mode.secret) {
      return <SecretField {...this.props} />;
    }
    return super.renderWrapper();
  }

  renderValidationResult(validationResult?: ValidationResult): ReactNode {
    const { mode } = this.props;
    if (mode === Mode.secret) {
      // 防止 SecretField 重复报错
      return null;
    }
    return super.renderValidationResult(validationResult);
  }
}
