/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Dropdown } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { stylePrefix } from '../../util';
import Selector from './Selector';

export default class FieldSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  shouldComponentUpdate(_, nextState) {
    return nextState.visible !== this.state.visible;
  }

  @Bind()
  handleVisibleChange() {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  }

  @Bind()
  getPopupContainer() {
    const dom = document.getElementById('root');
    return dom;
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
          <Icon type="add" />
          <span>{intl.get('ssrc.filterBar.view.title.filter').d('筛选')}</span>
          <Icon type="expand_more" />
        </div>
      </Dropdown>
    );
  }
}
