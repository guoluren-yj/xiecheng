import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, isArrayLike, computed, runInAction, observable } from 'mobx';
import Text from 'choerodon-ui/lib/text';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';

import { RegionOption } from '../tel-field/TelField';
import RegionSelect from '../tel-field/RegionSelect';
import { TextField, TextFieldProps } from '../text-field/TextField';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import { ModalProps } from '../modal/Modal';
import SecretFieldView from './SecretFieldView';
import autobind from '../_util/autobind';
import isEmpty from '../_util/isEmpty';
import CountDown from './CountDown';
import { Size } from '../core/enum';
import { FieldType } from '../data-set/enum';
import { LabelLayout } from '../form/enum';

export interface SecretFieldProps extends TextFieldProps {
  displayOutput?: boolean;
  modalProps?: ModalProps;
  renderEmpty?: () => ReactNode;
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
  onRegionChange?: (value: RegionOption) => void;
}

@observer
export default class SecretField extends TextField<SecretFieldProps> {
  static displayName = 'SecretField';

  static defaultProps = {
    ...TextField.defaultProps,
  };

  @observable regionOption: RegionOption | undefined;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.init();
      this.setAddonBefore();
    });
  }

  @action
  init() {
    const { name, record } = this;
    if (record) {
      const field = record.getField(name);
      if (field && field.get('type') === FieldType.tel) {
        record.setState(`_telField-secertMode-${name}`, true);
      }
    }
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
    const { regionName, dataSet, record } = this;
    const editable = !this.disabled && !this.readOnly;
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
            searchFieldInPopup
            searchable
            searchMatcher={this.searchMatcher}
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

  @action
  handleRegionChange(value) {
    const { onRegionChange } = this.props;
    if (onRegionChange && isFunction(onRegionChange)) {
      onRegionChange(value);
    }
  }

  getContextProPrefixCls(suffixCls: string, customizePrefixCls: string, nextProps: SecretFieldProps) {
    if (nextProps) {
      const { displayOutput } = nextProps;
      suffixCls = displayOutput ? 'output' : nextProps.suffixCls || 'input';
    }
    return super.getContextProPrefixCls(suffixCls as string, customizePrefixCls, nextProps);
  }

  needUpdatePrefixCls(props, nextProps) {
    return super.needUpdatePrefixCls(props, nextProps) || props.displayOutput !== nextProps.displayOutput;
  }

  // eslint-disable-next-line camelcase
  // static __IS_IN_CELL_EDITOR = true;

  modal;

  get multiple(): boolean {
    return false;
  }

  get range(): boolean {
    return false;
  }

  @computed
  get readOnly(): boolean {
    if (this.props.displayOutput) {
      return true;
    }
    return this.isReadOnly();
  }

  get border(): boolean | undefined {
    if (this.props.displayOutput) {
      return false;
    }
    return super.border;
  }

  @computed
  get isSecretEnable(): Boolean {
    const { record, name } = this;
    // 新增数据，record没有token或者查询没有返回值，显示为textfield
    if (!record || !record.get('_token') || !record.getPristineValue(name)) {
      return false;
    }
    const secretFieldEnableConfig = this.getContextConfig('secretFieldEnable');
    if (secretFieldEnableConfig) {
      // 从配置项获取是否开启脱敏组件
      return secretFieldEnableConfig();
    }
    return false;
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

  get regionValue() {
    const { record, pristine, regionName } = this;
    if (record) {
      return pristine ? record.getPristineValue(regionName) : record.get(regionName);
    }
    return undefined;
  }

  @action
  private openModal() {
    if (!this.modal) {
      const label = this.getLabel();
      const { readOnly, name, record } = this;
      const key = `_secretField_countDown_${name}`;
      if (record && !record.getState(key)) {
        record.setState(key, new CountDown());
      }
      const pattern = this.getProp('pattern');
      const restrict = this.getProp('restrict');
      const required = this.getProp('required');
      const { modalProps } = this.props;
      this.modal = open({
        title: label,
        drawer: true,
        size: Size.small,
        ...modalProps,
        children: (
          <SecretFieldView
            readOnly={readOnly}
            name={name || ''}
            record={record}
            label={label}
            pattern={pattern}
            restrict={restrict}
            required={required}
            token={record && record.get('_token')}
            onChange={this.handleSecretChange}
            countDown={record && record.getState(key)}
          />
        ),
        destroyOnClose: true,
        closable: true,
        autoFocus: false,
        footer: null,
        onClose: this.handleSecretFieldViewClose,
      } as ModalProps & { children });
    }
  }

  @autobind
  @action
  handleSecretFieldViewClose() {
    this.modal = undefined;
  }

  @autobind
  handleSecretChange(data?: any) {
    const { record } = this;
    if (record) {
      record.init(this.name || '', data);
    }
  }

  @autobind
  handleOpenModal() {
    return this.openModal();
  }

  getSuffix(): ReactNode {
    const { readOnly, record, name, isSecretEnable, props, disabled } = this;
    // 未开启脱敏组件或者脱敏组件值为空时,不显示编辑/查看按钮
    if (!isSecretEnable) {
      const { suffix } = props;
      return suffix ? this.wrapperSuffix(suffix) : null;
    }
    // 开启脱敏组件
    // 编辑
    if (!readOnly) {
      return this.wrapperSuffix(
        <Icon type='edit-o' />,
        {
          onClick: disabled ? null : this.handleOpenModal,
        },
      );
    }
    // 只读：已读不显示查看按钮
    // readFlag: true已查看 undefined未查看
    const readFlag = record && record.getState(`_secretField_queryFlag_${name}`);
    if (!readFlag && readOnly) {
      return this.wrapperSuffix(
        <Icon type='visibility-o' />,
        {
          onClick: disabled ? null : this.handleOpenModal,
        },
      );
    }
    return null;
  }

  isEditable(): boolean {
    if (this.props.displayOutput) {
      return false;
    }
    return !this.isSecretEnable && super.isEditable();
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    return super.getWrapperClassNames(...args, {
      [`${prefixCls}-secret`]: true,
    });
  }

  getInnerSpanButton(): ReactNode {
    const { isSecretEnable } = this;
    // 显示为脱敏组件时，禁用clearButton
    if (isSecretEnable) {
      return null;
    }
    // 显示为textField时，正常显示clearButton
    return super.getInnerSpanButton();
  }

  get clearButton(): boolean {
    const { isSecretEnable } = this;
    // 显示为脱敏组件时，clearButton为false
    if (isSecretEnable) {
      return false;
    }
    // 显示为textField时，正常显示clearButton
    return super.clearButton;
  }

  @action
  clear() {
    const { isSecretEnable } = this;
    // 只有显示为textField时，退格键正常删除内容
    if (!isSecretEnable) {
      super.clear();
    }
  }

  getEmptyResult() {
    const { renderEmpty } = this.props;
    return renderEmpty ? renderEmpty() : this.getContextConfig('renderEmpty')('SecretField') || '-'
  }

  renderWrapper(): ReactNode {
    const { readOnly, prefixCls, regionValue, labelLayout } = this;
    const result = this.getRenderedValue();
    const { displayOutput } = this.props;
    const isEmptyResult = isEmpty(result) || (isArrayLike(result) && !result.length);
    // 脱敏组件只读且值为空时，renderEmpty
    if (readOnly) {
      if (isEmptyResult && labelLayout !== LabelLayout.float) {
        return (
          <span {...this.getMergedProps()}>
            <span className={`${prefixCls}-secret-empty`}>
              {this.getEmptyResult()}
            </span>
          </span>
        );
      }
      if (displayOutput) {
        return (
          <span {...this.getMergedProps()}>
            <span className={`${prefixCls}-secret-output`}>
              {regionValue ? `${regionValue} ${result}` : result}
              {this.getSuffix()}
            </span>
          </span>
        );
      }
    }
    return super.renderWrapper();
  }
}
