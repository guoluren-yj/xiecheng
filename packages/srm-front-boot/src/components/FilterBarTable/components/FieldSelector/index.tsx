/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui/pro';
import { Dropdown } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import intl from '../../../../utils/intl';
import type { fieldProperties } from '../../util';
import { stylePrefix } from '../../util';
import Selector from './Selector';

interface FieldSelectorProps {
  displayFields?: fieldProperties[]; // 显示字段列表
  optionalFields?: fieldProperties[]; // 可选字段列表
  onSelectField?: (field: fieldProperties) => void; // 字段选择回调函数
  onAllSelected?: (fields: fieldProperties[]) => void; // 字段全选回调函数
  onClearSelected?: () => void; // 取消选择字段回调函数
  onAction: (onOk?: Function, onCancel?: Function) => void;
  queryDs: DataSet;
}

export default class FieldSelector extends Component<FieldSelectorProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  @Bind()
  handleVisibleChange() {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  }

  @Bind()
  getPopupContainer() {
    const dom = document.getElementById('root');
    return dom as HTMLElement;
  }

  render() {
    const { visible } = this.state;
    const selectorProps = {
      ...this.props,
      onVisibleChange: this.handleVisibleChange,
    };
    return (
      <Dropdown
        visible={visible}
        onVisibleChange={this.handleVisibleChange}
        getPopupContainer={this.getPopupContainer}
        overlay={<Selector {...selectorProps} />}
        trigger={['click']}
        overlayClassName={`${stylePrefix}-field-selector`}
      >
        <div className={`${stylePrefix}-add-field`}>
          <Icon type="add" style={{ verticalAlign: 'top' }} />
          <span>{intl.get('srm.filterBar.view.title.filter').d('筛选')}</span>
          <Icon type="expand_more" style={{ verticalAlign: 'top' }} />
        </div>
      </Dropdown>
    );
  }
}
