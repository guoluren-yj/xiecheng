import React from 'react';
import { Bind } from 'lodash-decorators';
import { Input, Icon } from 'hzero-ui';
import { isEmpty, isUndefined, isString, isArray } from 'lodash';

import { filterNullValueObject } from 'utils/utils';

import CostCenterModal from './CostCenterModal';

export default class CostCenter extends React.Component {
  constructor(props) {
    super(props);

    const value = isArray(this.props.value)
      ? this.props.value.map((o) => o[this.props.lovOptions.valueField])
      : [];
    const displayData = isArray(this.props.value)
      ? this.props.value.map((o) => o[this.props.lovOptions.displayField])
      : [];

    this.state = {
      value,
      displayData,
      selectedRowKeys: value,
      CostCenterModal: false,
      selectedChildRows: this.props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const { value } = nextProps;
      if (isString(value)) {
        this.setState({ value: value.split(',') });
      } else {
        this.setState(value);
      }
    }
  }

  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props;
    if (onChange) {
      onChange(changedValue);
    }
  };

  /**
   * 查询lov
   */
  @Bind()
  handleFecthRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleCancelModal() {
    this.setState({ visable: false });
  }

  @Bind()
  handleSearch(page = {}) {
    const { search, queryParams } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    search({
      page,
      ...queryParams,
      ...fieldValues,
    });
    this.setState({ visable: true });
  }

  /**
   * 更新modal列表数据
   * @param {Array} record 弹窗中选择的多条数据
   */
  @Bind()
  saveRecordRows() {
    const { lovOptions, form } = this.props;
    const { selectedChildRows = [] } = this.state;
    const displayArr = selectedChildRows.map((o) => o[lovOptions.displayField]);
    const valueArr = selectedChildRows.map((o) => o[lovOptions.valueField]);
    form.registerField('costIds');
    this.setState({
      displayData: displayArr,
    });
    form.setFieldsValue({
      costIds: valueArr,
    });
    this.triggerChange(selectedChildRows);
    this.setState({
      visable: false,
    });
  }

  @Bind()
  handleRowSelect(selectedRowKeys, selectedChild, rowSelect) {
    const { lovOptions } = this.props;
    if (rowSelect) {
      const includeFlag = selectedRowKeys.indexOf(rowSelect[lovOptions.valueField]);
      if (includeFlag >= 0) {
        selectedRowKeys.splice(includeFlag, 1);
        selectedChild.splice(includeFlag, 1);
      } else {
        selectedRowKeys.push(rowSelect[lovOptions.valueField]);
        selectedChild.push(rowSelect);
      }
    }
    const rowIds = selectedChild.map((ele) => ele[lovOptions.valueField]);
    const { selectedChildRows = [] } = this.state;
    const newRows = selectedChildRows.filter(
      (obj) => selectedRowKeys.findIndex((ele) => obj[lovOptions.valueField] === ele) !== -1
    );
    const dataSource = newRows.filter((ele) => !rowIds.includes(ele[lovOptions.valueField]));
    this.setState({
      selectedRowKeys,
      selectedChildRows: [...dataSource, ...selectedChild],
    });
  }

  @Bind()
  emitEmpty() {
    const { form } = this.props;
    this.setState({
      value: [],
      displayData: [],
      selectedRowKeys: [],
      CostCenterModal: false,
      selectedChildRows: [],
    });
    this.triggerChange(null);
    form.setFieldsValue({
      costIds: null,
    });
  }

  render() {
    const { data, lovOptions, readOnly = false } = this.props;
    const { visable, selectedChildRows, selectedRowKeys } = this.state;
    const { valueField, displayField } = lovOptions;
    const CostCenterModel = {
      // acceptorIdList,
      selectedChildRows,
      visable,
      data,
      valueField,
      displayField,
      readOnly,
      onRef: this.handleFecthRef,
      handleCancelModal: this.handleCancelModal,
      onSaveRecord: this.saveRecordRows,
      handleSearch: this.handleSearch,
      handleRowSelect: this.handleRowSelect,
      selectedRowKeys,
    };
    const suffix = (
      <React.Fragment>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        <Icon
          key="search"
          type="search"
          onClick={() => this.handleSearch()}
          style={{ cursor: 'pointer', color: '#666', marginLeft: '4px' }}
        />
      </React.Fragment>
    );
    const lovClassNames = ['lov-input'];
    if (!isEmpty(this.state.value) && !readOnly) {
      lovClassNames.push('lov-suffix');
    }
    const { size } = this.props;
    return (
      <span>
        <Input
          readOnly
          suffix={suffix}
          className={lovClassNames.join(' ')}
          allowClear
          size={size}
          value={String(this.state.displayData)}
        />
        <CostCenterModal {...CostCenterModel} />
      </span>
    );
  }
}
