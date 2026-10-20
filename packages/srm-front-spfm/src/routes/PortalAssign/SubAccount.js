import React from 'react';
import { Bind } from 'lodash-decorators';
import { Input, Icon } from 'hzero-ui';
import { isEmpty, isUndefined, isArray } from 'lodash';

import { filterNullValueObject } from 'utils/utils';

import SubAccountModal from './SubAccountModal';

export default class SubAccount extends React.Component {
  constructor(props) {
    super(props);
    const value = this.props.form.getFieldValue('userNameList') || [];
    this.state = {
      value,
      selectedRowKeys: this.props.value || [],
      inviterModal: false,
      selectedChildRows: isArray(this.props.value)
        ? this.props.value.map((e, index) => {
            return { userId: e, userName: value[index] };
          })
        : [],
    };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const { value } = nextProps;
      this.setState(value);
    }
  }

  triggerChange = changedValue => {
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
    const { form } = this.props;
    const { selectedChildRows = [] } = this.state;
    const userNameList = selectedChildRows.map(o => o.userName);
    const userIdList = selectedChildRows.map(o => o.userId);
    if (userNameList) {
      form.registerField('userNameList');
      this.setState({
        value: userNameList,
      });
      form.setFieldsValue({
        userNameList,
      });
      this.triggerChange(userIdList);
    }
    this.setState({
      inviterVisble: false,
    });
  }

  @Bind()
  handleRowSelect(selectedRowKeys, selectedChild, rowSelect) {
    if (rowSelect) {
      const includeFlag = selectedRowKeys.indexOf(rowSelect.userId);
      if (includeFlag >= 0) {
        selectedRowKeys.splice(includeFlag, 1);
        selectedChild.splice(includeFlag, 1);
      } else {
        selectedRowKeys.push(rowSelect.userId);
        selectedChild.push(rowSelect);
      }
    }
    const rowIds = selectedChild.map(ele => ele.userId);
    const { selectedChildRows = [] } = this.state;
    const newRows = selectedChildRows.filter(
      obj => selectedRowKeys.findIndex(ele => obj.userId === ele) !== -1
    );
    const dataSource = newRows.filter(ele => !rowIds.includes(ele.userId));
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
      selectedRowKeys: [],
      inviterModal: false,
      selectedChildRows: [],
    });
    this.triggerChange([]);
    form.setFieldsValue({
      userNameList: [],
    });
  }

  render() {
    const { inviterData } = this.props;
    const { inviterVisble, selectedChildRows, selectedRowKeys } = this.state;
    const SubAccountModalProps = {
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
    };
    const suffix = (
      <React.Fragment>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        <Icon
          key="search"
          type="search"
          onClick={() => this.fetchInviterData()}
          style={{ cursor: 'pointer', color: '#666', marginLeft: '4px' }}
        />
      </React.Fragment>
    );
    const lovClassNames = ['lov-input'];
    if (!isEmpty(this.state.value)) {
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
          value={this.state.value}
        />
        <SubAccountModal {...SubAccountModalProps} />
      </span>
    );
  }
}
