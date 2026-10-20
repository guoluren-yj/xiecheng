import React, { Component } from 'react';
import { observer } from 'mobx-react';

const itemFolderProcess = require('@/assets/item_folder_process.svg');
const itemFolderFinish = require('@/assets/item_folder_finish.svg');
const itemFolderPaused = require('@/assets/item_folder_paused.svg');
const itemFolderClosed = require('@/assets/item_folder_closed.svg');

@observer
class ItemIcons extends Component {
  getIcon = () => {
    const { status = '', styles = {}, size = 24 } = this.props;
    let icon = itemFolderProcess;

    if (status === 'IN_PROGRESS') {
      icon = itemFolderProcess;
    }
    if (status === 'NOT_START' || status === 'CLOSED' || status === 'SIGN_IN') {
      icon = itemFolderClosed;
    }
    if (status === 'PAUSED') {
      icon = itemFolderPaused;
    }
    if (status === 'SUGGESTED' || status === 'BIDDING_END') {
      icon = itemFolderFinish;
    }

    return <img src={icon} style={{ width: size, height: size, ...(styles || {}) }} alt="icon" />;
  };

  render() {
    return this.getIcon();
  }
}

export default ItemIcons;
