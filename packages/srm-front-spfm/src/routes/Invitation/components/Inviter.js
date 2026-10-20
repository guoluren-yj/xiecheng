import React from 'react';
import { Bind } from 'lodash-decorators';
import { Input, Icon } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';

import { filterNullValueObject } from 'utils/utils';

import InviterModal from './InviterModal';

export default class Inviter extends React.Component {
  constructor(props) {
    super(props);

    const value = this.props.form.getFieldValue('companyNames') || [];
    this.state = {
      value,
      selectedRowKeys: (props.selectedRows || []).map((n) => n.companyId) || [],
      inviterModal: false,
      selectedChildRows: props.selectedRows || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const { value } = nextProps;
      this.setState(value);
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
   * 查询项目采购负责人lov
   */
  @Bind()
  handleFecthRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleCancelModal() {
    this.setState({ inviterVisble: false });
  }

  @Bind()
  fetchInviterData(page = {}) {
    const { onQueryInviterData, queryParams } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    onQueryInviterData({
      page,
      ...queryParams,
      ...fieldValues,
    });
    this.setState({ inviterVisble: true });
  }

  /**
   * 更新modal项目采购负责人列表数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  saveRecordRows() {
    const { form, changeSelectRows = () => {} } = this.props;
    const { selectedChildRows = [] } = this.state;
    const companyNames = selectedChildRows.map((o) => o.companyName);
    const companyIds = selectedChildRows.map((o) => o.companyId);
    changeSelectRows(selectedChildRows);
    if (companyIds) {
      form.registerField('companyNames');
      this.setState({
        value: companyNames,
      });
      form.setFieldsValue({
        companyNames,
      });
      this.triggerChange(companyIds);
    }
    this.setState({
      inviterVisble: false,
    });
  }

  @Bind()
  handleRowSelect(selectedRowKeys, selectedChild, rowSelect) {
    const { changeSelectRows = () => {} } = this.props;
    if (rowSelect) {
      const includeFlag = selectedRowKeys.indexOf(rowSelect.companyId);
      if (includeFlag >= 0) {
        selectedRowKeys.splice(includeFlag, 1);
        selectedChild.splice(includeFlag, 1);
      } else {
        selectedRowKeys.push(rowSelect.companyId);
        selectedChild.push(rowSelect);
      }
    }
    const rowIds = selectedChild.map((ele) => ele.companyId);
    const { selectedChildRows = [] } = this.state;
    const newRows = selectedChildRows.filter(
      (obj) => selectedRowKeys.findIndex((ele) => obj.companyId === ele) !== -1
    );
    const dataSource = newRows.filter((ele) => !rowIds.includes(ele.companyId));
    this.setState({
      selectedRowKeys,
      selectedChildRows: [...dataSource, ...selectedChild],
    });
    changeSelectRows([...dataSource, ...selectedChild]);
  }

  @Bind()
  emitEmpty() {
    const { form, changeSelectRows = () => {} } = this.props;
    changeSelectRows([]);
    this.setState({
      value: [],
      selectedRowKeys: [],
      inviterModal: false,
      selectedChildRows: [],
    });
    this.triggerChange(null);
    form.setFieldsValue({
      companyNames: null,
    });
  }

  render() {
    const { inviterData, selectedRows = [], changeSelectRows, disabled } = this.props;
    const { inviterVisble, selectedChildRows, selectedRowKeys } = this.state;
    const InviterModel = {
      // acceptorIdList,
      selectedChildRows,
      inviterVisble,
      inviterData,
      onRef: this.handleFecthRef,
      handleCancelModal: this.handleCancelModal,
      onSaveRecord: this.saveRecordRows,
      fetchInviterData: this.fetchInviterData,
      handleRowSelect: this.handleRowSelect,
      selectedRowKeys,
      changeSelectRows,
    };
    const text = selectedRows.map((n) => n.companyName);

    const suffix = (
      <React.Fragment>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={()=>disabled?{}: this.emitEmpty()} />
        <Icon
          key="search"
          type="search"
          onClick={() => disabled?{}:this.fetchInviterData()}
          style={{ cursor: 'pointer', color: '#666', marginLeft: '4px' }}
        />
      </React.Fragment>
    );
    const lovClassNames = ['lov-input'];
    if (!isEmpty(text)) {
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
          value={text}
          disabled={disabled}
        />
        <InviterModal {...InviterModel} />
      </span>
    );
  }
}
