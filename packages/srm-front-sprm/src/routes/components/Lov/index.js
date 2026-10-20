import React from 'react';
import { Input, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isArray } from 'lodash';

import LovModal from './LovModal';
import styles from './index.less';

export default class Lov extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.textValue || '',
      modalVisible: false,
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  /**
   * 改变弹窗方法
   * @param {Boolean} flag
   */
  @Bind()
  handleAddonClick(flag, fun) {
    const { disabled } = this.props;
    if (disabled) return;
    this.setState({
      modalVisible: flag,
    });
    if (!flag && isFunction(fun)) {
      fun();
    }
  }

  /**
   * 选中行回调
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   */
  @Bind()
  handleChangeSelect(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 单击行设置值
   * @param {Object} fields
   */
  @Bind()
  handleRowClick(fields) {
    this.setState(fields);
  }

  /**
   * 确定回调
   */
  @Bind()
  handleOk(selectedRows = this.state.selectedRows) {
    const { form = {}, onChange } = this.props;
    const { setFieldsValue } = form;
    const text = isArray(selectedRows[0]?.rgNameList)
      ? selectedRows[0]?.rgNameList.join('') + selectedRows[0]?.address ||
        selectedRows[0]?.fullAddress
      : selectedRows[0]?.fullAddress;
    if (isFunction(setFieldsValue)) {
      this.setState(
        {
          text,
        },
        () => {
          setFieldsValue({ invoiceAddressId: selectedRows[0]?.addressId });
          this.handleAddonClick(false);
        }
      );
    }
    if (isFunction(onChange)) {
      onChange(selectedRows, text);
    }
  }

  /**
   * 清空选中行
   */
  @Bind()
  handleClearSelect() {
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
  }

  @Bind()
  emitEmpty() {
    const {
      form: { setFieldsValue, validateFields },
    } = this.props;
    if (this.props.onChange) {
      const record = {};
      this.setState(
        {
          text: '',
        },
        () => {
          this.props.onChange(undefined, record);
          setFieldsValue({ invoiceAddressId: undefined });
          validateFields(['invoiceAddressId']);
        }
      );
    }
  }

  searchButton() {
    return (
      <Icon
        key="search"
        type="search"
        onClick={() => this.handleAddonClick(true)}
        style={{ cursor: 'pointer' }}
      />
    );
  }

  render() {
    const { text, modalVisible, selectedRowKeys } = this.state;
    const { disabled, queryParams = {}, newMallFlag } = this.props;
    const rowSelection = {
      selectedRowKeys,
      type: 'radio',
      onChange: this.handleChangeSelect,
    };
    const suffix = (
      <React.Fragment>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        {this.searchButton()}
      </React.Fragment>
    );
    return (
      <div className={styles.lov}>
        <Input
          readOnly
          value={text}
          suffix={disabled ? null : suffix}
          disabled={disabled}
          className="lov-suffix"
          onChange={(e) => this.setText(e.target.value)}
        />
        <LovModal
          queryParams={queryParams}
          handleRowClick={this.handleRowClick}
          searchClearSelect={this.handleClearSelect}
          visible={modalVisible}
          rowSelection={rowSelection}
          handleOk={this.handleOk}
          hideModal={(resetFields) => this.handleAddonClick(false, () => resetFields())}
          newMallFlag={newMallFlag}
        />
      </div>
    );
  }
}
