import React from 'react';
import { Modal, Input, Icon, Button, message } from 'hzero-ui';
import { isEmpty, isFunction, omit, isNil, isArray, isEqual, isString } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { queryLov, queryMapIdpValue } from 'services/api';

import LovModal from './LovModal';
import './index.less';

const defaultRowKey = 'key';

export default class Lov extends React.Component {
  // 选中记录
  selectedRows = [];

  preTextValue = '';

  static displayName = 'Lov';

  loading = false;

  modalRef = { current: null };

  constructor(props) {
    super(props);
    this.state = {
      currentText: null,
      text: props.textValue,
      textField: props.textField,
      lov: {},
      loading: false,
      ldpData: {},
    };
    this.modalRef = React.createRef();
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { currentText, text } = this.state;
    let data = {
      currentText: nextProps.textValue === currentText ? currentText : nextProps.textValue,
    };
    if (currentText && !isEqual(currentText, nextProps.textValue)) {
      data = {
        ...data,
        text: nextProps.textValue,
      };
    }
    if (!text && nextProps.textValue) {
      data = {
        ...data,
        text: nextProps.textValue,
      };
    }
    if (isEmpty(nextProps.value) || isNil(nextProps.value)) {
      data = {
        ...data,
        text: null,
      };
    }

    this.setState({
      ...data,
    });
  }

  @Bind()
  onSelect(selectedRows) {
    this.selectedRows = selectedRows;
  }

  @Bind()
  selectAndClose() {
    if (isEmpty(this.selectedRows)) {
      Modal.warning({
        title: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    }
    this.selectRecord();
    this.setState({
      modalVisible: false,
    });
  }

  getTextField() {
    const { form } = this.props;
    const { textField } = this.state;
    if (form && textField) {
      form.registerField(textField);
    }
    return textField;
  }

  selectRecord() {
    const { valueField: rowkey = defaultRowKey, displayField: displayName } = this.state.lov;
    // TODO: 值为 0 -0 '' 等的判断
    this.setState(
      {
        text: this.selectedRows.map((item) => this.parseField(item, displayName)),
      },
      () => {
        const { form } = this.props;
        const textField = this.getTextField();
        if (form && textField) {
          form.setFieldsValue({
            [textField]: this.selectedRows.map((item) => this.parseField(item, displayName)),
          });
        }
        // 设置额外表单值
        if (form && this.props.extSetMap) {
          this.selectedRows.forEach((item) => {
            this.setExtMapToForm(item, this.props.extSetMap, form);
          });
        }

        if (this.props.onChange) {
          const valueField = rowkey;
          this.props.onChange(
            this.selectedRows.map((item) => this.parseField(item, valueField)),
            this.selectedRows
          );
        }
        if (isFunction(this.props.onOk)) {
          this.props.onOk(this.selectedRows);
        }
        this.selectedRows = [];
      }
    );
  }

  /**
   * 设置额外表单值
   * @param {Object} record 数据对象
   * @param {String} extSetMap 额外字段映射, 可以有多个, 以逗号分隔 bankId,bankName->bankDescription
   * @param {表单对象} form 表单对象
   */
  setExtMapToForm(record, extSetMap, form) {
    const dataSet = {};
    extSetMap.split(/\s*,\s*/g).forEach((entryStr) => {
      const [recordField, formFieldTmp] = entryStr.split('->');
      const formField = formFieldTmp || recordField;
      form.getFieldDecorator(formField);
      dataSet[formField] = record[recordField];
    });
    form.setFieldsValue(dataSet);
  }

  @Bind()
  onCancel() {
    const { onCancel = (e) => e } = this.props;
    this.setState({
      modalVisible: false,
    });
    if (isFunction(onCancel)) {
      onCancel();
    }
    this.selectedRows = [];
  }

  showLoading(partialState = {}) {
    this.setState({
      loading: true,
      ...partialState,
    });
  }

  hideLoading() {
    this.setState({
      loading: false,
    });
  }

  @Bind()
  modalWidth(tableFields) {
    let width = 100;
    if (isArray(tableFields)) {
      tableFields.forEach((n) => {
        width += n.width;
      });
    }
    return width;
  }

  @Bind()
  onSearchBtnClick() {
    const {
      disabled = false,
      onClick = (e) => e,
      lovOptions: { valueField: customValueField, displayField: customDisplayField } = {},
    } = this.props;
    if (disabled || this.loading) return; // 节流
    this.selectedRows = [];
    const { code: viewCode, originTenantId: tenantId } = this.props;
    this.loading = true;
    this.showLoading({
      loading: true,
      modalVisible: true,
      lovModalKey: uuid(),
    });
    queryLov({ viewCode, tenantId })
      .then((oriLov) => {
        const lov = { ...oriLov };
        if (customValueField) {
          lov.valueField = customValueField;
        }
        if (customDisplayField) {
          lov.displayField = customDisplayField;
        }
        if (!isEmpty(lov)) {
          const { viewCode: hasCode, title = '', queryFields } = lov;
          // 获取独立值集编码
          const valueList = (queryFields || []).filter((item) => item.dataType === 'SELECT');
          if (valueList.length > 0) {
            const valueCode = {};
            valueList.forEach(({ sourceCode }) => {
              if (sourceCode) {
                valueCode[sourceCode] = sourceCode;
              }
            });
            queryMapIdpValue(valueCode).then((res) => {
              if (getResponse(res)) {
                this.setState({ ldpData: res });
              }
            });
          }

          if (hasCode) {
            // const width = this.modalWidth(tableFields);
            this.setState(
              {
                lov,
                title,
                // width,
              },
              () => {
                const { modalVisible: lovModalVisible } = this.state;
                if (lovModalVisible && this.modalRef.current) {
                  this.modalRef.current.loadOnFirstVisible();
                }
              }
            );
            if (isFunction(onClick)) {
              onClick();
            }
          } else {
            this.hideLoading();
            message.error(
              intl.get('hzero.common.components.lov.notification.undefined').d('值集视图未定义!')
            );
          }
        }
      })
      .finally(() => {
        this.hideLoading();
        this.loading = false;
      });
  }

  searchButton() {
    if (this.state.loading) {
      return <Icon key="search" type="loading" />;
    }
    return (
      <Icon
        key="search"
        type="search"
        onClick={this.onSearchBtnClick}
        style={{ cursor: 'pointer', color: '#666' }}
      />
    );
  }

  @Bind()
  emitEmpty() {
    const { text, lov } = this.state;
    const { form, onClear = (e) => e, value, onChange } = this.props;
    if (onChange) {
      const selectedRows = [];
      this.setState(
        {
          text: '',
        },
        () => {
          onChange(undefined, selectedRows);
          const textField = this.getTextField();
          if (form && textField) {
            form.setFieldsValue({
              [textField]: undefined,
            });
          }
        }
      );
    }
    // TODO: 当初次进入时的情况
    if (isFunction(onClear)) {
      let valueList = [];
      // eslint-disable-next-line no-nested-ternary
      const textList = isArray(text) ? text : isString(text) ? text.split(',') : [];
      if (isArray(value)) {
        valueList = value.map((item, index) => {
          const record = {
            [lov.displayField]: textList[index],
            [lov.valueField]: item,
          };
          return record;
        });
      }

      onClear(valueList);
    }
    this.selectedRows = [];
  }

  /**
   * 访问对象由字符串指定的多层属性
   * @param {Object} obj 访问的对象
   * @param {String} str 属性字符串，如 'a.b.c.d'
   */
  @Bind()
  parseField(obj, str) {
    if (obj) {
      // 修复端侧obj为null问题(场景未复现)
      if (/[.]/g.test(str)) {
        const arr = str.split('.');
        const newObj = obj[arr[0]];
        const newStr = arr.slice(1).join('.');
        return this.parseField(newObj, newStr);
      }
      return obj[str];
    }
  }

  /**
   * 同步 Lov 值节流以提高性能
   * @param {String} value - Lov 组件变更值
   */
  @Bind()
  @Throttle(500)
  setValue(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  /**
   * 同步输入值至 Input 及 Lov
   * @param {String} value - 输入框内的值
   */
  @Bind()
  setText(value) {
    const { isInput } = this.props;
    if (isInput) {
      this.setState(
        {
          text: value,
        },
        () => {
          this.setValue(value);
        }
      );
    }
  }

  render() {
    const { text: stateText, ldpData = {} } = this.state;
    const {
      form,
      value,
      textValue,
      queryParams,
      queryInputProps,
      style,
      isButton,
      className,
      isDbc2Sbc,
      allowClear = true,
      noCache = false,
      ...otherProps
    } = this.props;
    const textField = this.getTextField();
    const omitProps = ['onOk', 'onCancel', 'onClick', 'onClear', 'textField', 'lovOptions'];
    const texts = textField ? form && form.getFieldValue(textField) : stateText;
    // eslint-disable-next-line no-nested-ternary
    const text = isNil(value) ? '' : texts === 0 ? 0 : texts || textValue;
    const inputStyle = isButton
      ? style
      : {
          ...style,
          verticalAlign: 'middle',
          position: 'relative',
          top: -1,
        };
    const isDisabled = this.props.disabled !== undefined && !!this.props.disabled;
    const showSuffix = text && allowClear && !isButton && !isDisabled;
    const suffix = (
      <>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        {this.searchButton()}
      </>
    );

    const lovClassNames = [className, 'lov-input'];
    if (showSuffix) {
      lovClassNames.push('lov-suffix');
    }
    if (isDisabled) {
      lovClassNames.push('lov-disabled');
    }
    const { title = '', lov = {}, modalVisible, loading, lovModalKey } = this.state;
    const modalProps = {
      title,
      width: 700,
      destroyOnClose: true,
      wrapClassName: 'lov-modal',
      maskClosable: false,
      onOk: this.selectAndClose,
      bodyStyle: title ? { padding: '16px' } : { padding: '56px 16px 0' },
      onCancel: this.onCancel,
      style: {
        minWidth: 700,
      },
      visible: modalVisible,
    };
    const { disabled, onChange, placeholder } = this.props;
    const inputProps = {
      disabled,
      onChange,
      placeholder,
      // onClick,
    };
    return (
      <>
        {isButton ? (
          <Button
            onClick={this.onSearchBtnClick}
            disabled={this.props.disabled}
            {...otherProps}
            style={style}
            className={lovClassNames.join(' ')}
          />
        ) : (
          // ts-ignore
          <Input
            readOnly
            // addonAfter={this.searchButton()}
            value={text}
            style={inputStyle} // Lov 组件垂直居中样式，作用于 ant-input-group-wrapper
            suffix={suffix}
            {...omit(inputProps, omitProps)}
            className={lovClassNames.join(' ')}
          />
        )}
        <Modal {...modalProps}>
          <LovModal
            key={lovModalKey}
            lov={lov}
            initValue={value}
            preTextValue={text}
            ldpData={ldpData}
            noCache={noCache}
            queryParams={queryParams}
            queryInputProps={queryInputProps}
            onSelect={this.onSelect}
            onClose={this.selectAndClose}
            lovLoadLoading={loading}
            wrappedComponentRef={this.modalRef}
            isDbc2Sbc={isDbc2Sbc}
            // lovLoadLoading={loading}
          />
        </Modal>
      </>
    );
  }
}
