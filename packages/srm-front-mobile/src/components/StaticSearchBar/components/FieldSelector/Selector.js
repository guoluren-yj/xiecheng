/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Icon, TextField, CheckBox } from 'choerodon-ui/pro';
import { Divider, Menu } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEqual } from 'lodash';

import intl from 'utils/intl';

import { stylePrefix, FieldFlag, noop } from '../../utils/enum';

// interface SelectorProps {
//   displayFields?: fieldProperties[]; // 显示字段列表
//   optionalFields?: fieldProperties[]; // 可选字段列表
//   onSelectField?: (field: fieldProperties) => void; // 字段选择回调函数
//   onAllSelected?: (fields: fieldProperties[]) => void; // 字段全选回调函数
//   onClearSelected?: () => void; // 取消选择字段回调函数
//   onVisibleChange?: () => void; // 下拉框显示隐藏
// }

export default class Selector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      displayFields: props.displayFields || [],
      optionalFields: props.optionalFields || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const {
      displayFields: nextDisplayFields = [],
      optionalFields: nextOptionalFields = [],
    } = nextProps;
    const { displayFields = [], optionalFields = [] } = this.state;
    if (!isEqual(nextDisplayFields, displayFields)) {
      this.setState({
        displayFields: nextDisplayFields,
      });
    }
    if (!isEqual(nextOptionalFields, optionalFields)) {
      this.setState({
        optionalFields: nextOptionalFields,
      });
    }
  }

  @Bind()
  handleSelectorSearch(searchText) {
    this.setState({
      searchText,
    });
  }

  @Bind()
  handleAllSelected(field) {
    const { optionalFields = [] } = this.state;
    const { onAllSelected = noop } = this.props;
    const newOptionalFields = optionalFields.map((item) => ({
      ...item,
      display: field.some((f) => f.name === item.name) ? true : item.display,
    }));
    this.setState({
      optionalFields: newOptionalFields,
    });
    onAllSelected(field);
  }

  @Bind()
  handleSelectField(field) {
    const { onSelectField = noop, onVisibleChange = noop } = this.props;
    const { optionalFields = [] } = this.state;
    this.setState({
      optionalFields: optionalFields.map((item) => {
        if (item.name !== field.name) {
          return item;
        } else {
          return {
            ...item,
            [FieldFlag.DISPLAY]: !item[FieldFlag.DISPLAY],
          };
        }
      }),
    });
    onVisibleChange();
    onSelectField(field);
  }

  @Bind()
  handleClearSelected() {
    const { onClearSelected = noop } = this.props;
    const { optionalFields = [] } = this.state;
    onClearSelected();
    this.setState({
      optionalFields: optionalFields.map((item) => ({
        ...item,
        [FieldFlag.DISPLAY]: false,
      })),
    });
  }

  render() {
    const { searchText, optionalFields = [] } = this.state;
    let selectableFields = optionalFields;

    if (searchText) {
      selectableFields = selectableFields.filter(
        (item) => item.label && item.label.includes(searchText)
      );
    }
    // 非固定字段
    const noLockFields = selectableFields.filter((item) => item[FieldFlag.DISPLAY]);
    return (
      <div>
        <div className={`${stylePrefix}-field-selector-header`}>
          <span>
            <Icon type="search" />
          </span>
          <TextField
            clearButton
            className={`${stylePrefix}-field-selector-input`}
            onInput={(e) => this.handleSelectorSearch(e.target.value)}
            onChange={(value) => this.handleSelectorSearch(value)}
            placeholder={intl.get('srm.filterBar.view.title.filterCondition').d('筛选过滤条件')}
          />
        </div>
        <div className={`${stylePrefix}-field-selector-summary`}>
          <span>
            {intl
              .get('srm.filterBar.view.message.selectedField', { size: noLockFields.length })
              .d(`已选 ${noLockFields.length} 项`)}
          </span>
          <Divider type="vertical" />
          <span
            className={`${stylePrefix}-field-selector-allSelect`}
            onClick={() => this.handleAllSelected(selectableFields)}
            style={{ marginRight: '8px' }}
          >
            {intl.get('srm.filterBar.view.title.allSelect').d('全选')}
          </span>
          {noLockFields.length > 0 && (
            <span
              className={`${stylePrefix}-field-selector-clear`}
              onClick={this.handleClearSelected}
            >
              {intl.get('srm.filterBar.view.title.clearSelect').d('清除已选')}
            </span>
          )}
        </div>
        <div className={`${stylePrefix}-field-selector-list`}>
          <Menu>
            {selectableFields.map((item) => (
              <Menu.Item
                key={item.name}
                className={`${stylePrefix}-field-selector-list-item`}
                onClick={() => this.handleSelectField(item)}
              >
                <CheckBox checked={item[FieldFlag.DISPLAY]} />
                <span className={`${stylePrefix}-field-selector-list-item-label`}>
                  {item.label}
                </span>
              </Menu.Item>
            ))}
          </Menu>
        </div>
      </div>
    );
  }
}
