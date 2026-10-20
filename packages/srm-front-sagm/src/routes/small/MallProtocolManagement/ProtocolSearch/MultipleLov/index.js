import React, { Fragment } from 'react';
import { Modal, Select, Input, message, Icon, Button } from 'hzero-ui';
import { isEmpty, isFunction, isNil } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import { queryLov } from 'services/api';
import LovModal from './LovModal';
import ModalContainer, { registerContainer, open } from './ModalContainer';

import styles from './index.less';

const InputGroup = Input.Group;

const defaultRowKey = 'key';
export default class MultipleLov extends React.Component {
  // 当前 LOV 窗口
  modal;

  // 选中记录
  record;

  loading = false;

  constructor(props) {
    super(props);
    this.state = {
      currentText: null,
      text: props.isInput ? props.value : props.textValue,
      textField: props.textField,
      lov: [],
      loading: false,
    };
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { currentText, text } = this.state;
    let data = {
      currentText: nextProps.textValue === currentText ? currentText : nextProps.textValue,
    };

    if (currentText && currentText !== nextProps.textValue) {
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
    if (nextProps.value === null || nextProps.value === undefined) {
      data = {
        ...data,
        text: null,
      };
    }
    if (nextProps.isInput) {
      data = {
        ...data,
        text: nextProps.value,
      };
    }

    this.setState({
      ...data,
    });
  }

  @Bind()
  onSelect(records) {
    this.records = records;
  }

  @Bind()
  selectAndClose() {
    const { onOkCallback, require = true } = this.props;
    if (require) {
      if (!this.records || this.records.length === 0) {
        Modal.warning({
          title: intl.get('hzero.common.message.selectAtLeastOne').d('请至少选择一条数据'),
        });
        return false;
      }
    }

    if (onOkCallback) {
      onOkCallback(this.records);
    }
    this.selectRecord();
    if (this.modal) {
      this.modal.close();
    }
  }

  getTextField() {
    const { form } = this.props;
    const { textField } = this.state;
    if (form && textField) {
      form.registerField(textField);
    }
    return textField;
  }

  @Bind()
  onCancel() {
    const { onCancel = (e) => e } = this.props;
    if (isFunction(onCancel)) {
      onCancel();
    }
    this.record = null;
  }

  componentWillUnmount() {
    this.showLoading.cancel();
  }

  @Debounce(500)
  showLoading() {
    this.setState({
      loading: true,
    });
  }

  hideLoading() {
    this.showLoading.cancel();
    this.setState({
      loading: false,
    });
  }

  @Bind()
  modalWidth(tableFields) {
    let width = 100;
    tableFields.forEach((n) => {
      width += n.width;
    });
    return width;
  }

  selectRecord() {
    const { valueField: rowKey = defaultRowKey, displayField: displayName } = this.state.lov;

    // TODO: 值为 0 -0 '' 等的判断

    const { records } = this;

    const currentRecord = {
      [rowKey]: [],
      [displayName]: [],
    };
    if (rowKey === displayName) {
      records.forEach((record) => {
        currentRecord[rowKey].push(record[rowKey]);
      });

      currentRecord[rowKey] = currentRecord[rowKey].join(',');
    } else {
      records.forEach((record) => {
        currentRecord[rowKey].push(record[rowKey]);
        currentRecord[displayName].push(record[displayName]);
      });

      currentRecord[rowKey] = currentRecord[rowKey].join(',');
      currentRecord[displayName] = currentRecord[displayName].join(',');
    }
    this.setValueAndText({
      value: this.parseField(currentRecord, rowKey),
      text: this.parseField(currentRecord, displayName),
      records,
    });
  }

  @Bind()
  setValueAndText({ value, text, records }) {
    this.setState(
      {
        text,
      },
      () => {
        const { form } = this.props;
        const textField = this.getTextField();
        if (form && textField) {
          form.setFieldsValue({
            [textField]: text,
          });
        }
        if (this.props.onChange) {
          this.props.onChange(value, records);
        }
        if (isFunction(this.props.onOk)) {
          this.props.onOk(records);
        }
        this.records = [];
      }
    );
  }

  @Bind()
  onSearchBtnClick() {
    const {
      disabled = false,
      queryParams = {},
      onClick = (e) => e,
      isTenant,
      value,
      form,
      purchaserTenantId,
      textValue,
      usePurchaserTenantId,
      lovOptions: { valueField: customValueField, displayField: customDisplayField } = {},
    } = this.props;
    if (disabled || this.loading) return; // 节流

    this.record = null;
    const { code: viewCode } = this.props;
    this.loading = true;
    this.showLoading();
    queryLov({ viewCode })
      .then((oriLov) => {
        const lov = { ...oriLov };
        if (customValueField) {
          lov.valueField = customValueField;
        }
        if (customDisplayField) {
          lov.displayField = customDisplayField;
        }
        if (!isEmpty(lov)) {
          const { viewCode: hasCode, title, tableFields } = lov;
          if (hasCode) {
            const width = this.modalWidth(tableFields);
            this.setState({ lov });
            const { text: stateText } = this.state;
            const textField = this.getTextField();
            const text = isNil(value)
              ? ''
              : (textField ? form && form.getFieldValue(textField) : stateText) || textValue;

            const records = [];
            if (value) {
              const valueArr = value.split(',');
              const textArr = text ? text.split(',') : valueArr;
              valueArr.forEach((valueItem, index) => {
                records.push({
                  [lov.valueField]: valueItem,
                  [lov.displayField]: textArr[index],
                });
              });
            }
            this.onSelect(records);
            this.modal = open({
              title,
              width,
              wrapClassName: 'lov-modal',
              maskClosable: false,
              onOk: this.selectAndClose,
              bodyStyle: title ? { padding: '16px' } : { padding: '56px 16px 0' },
              onCancel: this.onCancel,
              style: {
                minWidth: 400,
              },
              children: (
                <LovModal
                  lov={lov}
                  records={records}
                  purchaserTenantId={purchaserTenantId}
                  isTenant={isTenant}
                  usePurchaserTenantId={usePurchaserTenantId}
                  width={width}
                  queryParams={queryParams}
                  onSelect={this.onSelect}
                  onClose={this.selectAndClose}
                />
              ),
            });
            if (isFunction(onClick)) {
              onClick();
            }
          } else {
            message.error(
              `${intl
                .get('hzero.common.components.lov.notification.undefined')
                .d('值集视图未定义!')}`
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
    const style = {
      cursor: 'pointer',
      width: 32,
      position: 'absolute',
      top: 0,
      right: 0,
      padding: 8,
      color: 'rgba(0, 0, 0, 0.25)',
    };
    if (this.state.loading) {
      return <Icon type="loading" style={style} />;
    } else {
      return <Icon type="search" style={style} onClick={this.onSearchBtnClick} />;
    }
  }

  @Bind()
  emitEmpty() {
    const { text, lov } = this.state;
    const { form, onClear = (e) => e, value } = this.props;
    if (this.props.onChange) {
      const record = [];
      this.setState(
        {
          text: '',
        },
        () => {
          this.props.onChange(undefined, record);
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
      const record = {
        [lov.displayField]: text,
        [lov.valueField]: value,
      };
      onClear(record);
    }
  }

  @Bind()
  handleSelectChange(newValues) {
    const { value, form, textValue } = this.props;
    const { lov } = this.state;
    const newValueArr = [];
    const newTextArr = [];
    const newRecords = [];
    if (value) {
      const valueArr = value.split(',');
      const textField = this.getTextField();
      const { text: stateText } = this.state;

      const text = isNil(value)
        ? ''
        : (textField ? form && form.getFieldValue(textField) : stateText) || textValue;
      const textArr = text ? text.split(',') : valueArr;
      valueArr.forEach((valueItem, index) => {
        if (newValues.includes(valueItem)) {
          newValueArr.push(valueItem);
          newTextArr.push(textArr[index]);
          newRecords.push({
            [lov.valueField]: valueItem,
            [lov.displayField]: textArr[index],
          });
        }
      });
      this.setValueAndText({
        text: newTextArr.join(','),
        value: newValueArr.join(','),
        records: newRecords,
      });
    }
  }

  /**
   * 访问对象由字符串指定的多层属性
   * @param {Object} obj 访问的对象
   * @param {String} str 属性字符串，如 'a.b.c.d'
   */
  @Bind()
  parseField(obj, str) {
    if (/[.]/g.test(str)) {
      const arr = str.split('.');
      const newObj = obj[arr[0]];
      const newStr = arr.slice(1).join('.');
      return this.parseField(newObj, newStr);
    } else {
      return obj[str];
    }
  }

  render() {
    const { text: stateText } = this.state;
    const {
      form,
      value,
      textValue,
      disabled,
      isButton = false,
      style,
      allowClear = true,
      buttonText = intl.get('hzero.common.button.create').d('新建'),
      ...otherProps
    } = this.props;
    const textField = this.getTextField();
    const text = isNil(value)
      ? ''
      : (textField ? form && form.getFieldValue(textField) : stateText) || textValue;
    const valueArr = value ? value.split(',') : [];
    const textArr = text ? text.split(',') : valueArr;
    const options = valueArr.map((item, index) => (
      <Select.Option value={item} key={item}>
        {textArr[index]}
      </Select.Option>
    ));
    return (
      <Fragment>
        <ModalContainer ref={registerContainer} />
        {isButton ? (
          <Button style={style} {...otherProps} disabled={disabled} onClick={this.onSearchBtnClick}>
            {buttonText}
          </Button>
        ) : (
          <InputGroup compact style={style}>
            <Select
              className={styles.select}
              allowClear={allowClear}
              value={valueArr}
              disabled={disabled}
              filterOption={false}
              onChange={this.handleSelectChange}
              readOnly
              style={{ width: '100%', maxWidth: '100%' }} // Lov 组件垂直居中样式，作用于 ant-input-group-wrapper ; add width 调整样式为自适应
              mode="multiple"
              showArrow={false}
              open={false}
            >
              {options}
            </Select>
            {this.searchButton()}
          </InputGroup>
        )}
      </Fragment>
    );
  }
}
