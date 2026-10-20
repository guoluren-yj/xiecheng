import React, { Component } from 'react';
import { observer } from 'mobx-react';

const itemFolderProcess = require('@/assets/item_folder_process.svg');
const itemFolderFinish = require('@/assets/item_folder_finish.svg');
const itemFolderPaused = require('@/assets/item_folder_paused.svg');
const itemFolderClosed = require('@/assets/item_folder_closed.svg');

@observer
class ItemIcons extends Component {
  getIcon = () => {
    // quotationOrderType - 报价次序, index - 列表索引
    const { status = '', styles = {}, quotationOrderType, index, textColor = {} } = this.props;
    let icon = itemFolderProcess;

    if (status === 'BIDDING_IN_PROGRESS') {
      icon = itemFolderProcess;
    } else if (status === 'BIDDING_PAUSED') {
      icon = itemFolderPaused;
    } else if (status === 'BIDDING_END') {
      icon = itemFolderFinish;
    } else {
      icon = itemFolderClosed;
    }

    if (quotationOrderType === 'SEQUENCE') {
      return <span style={{ padding: '0 .05rem', ...textColor, ...(styles || {}) }}>{index}</span>;
    } else {
      return <img src={icon} style={{ width: 22, height: 22, ...(styles || {}) }} alt="icon" />;
    }
  };

  render() {
    return this.getIcon();
  }
}

export default ItemIcons;
