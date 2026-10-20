import React, { Component } from 'react';
import { Checkbox } from 'hzero-ui';
import { Popover } from 'choerodon-ui';
import classNames from 'classnames';

import intl from 'utils/intl';

import style from './index.less';

const promptCode = 'ssrc.common';

export default class GroupItem extends Component {
  renderPopoverValue(record) {
    const { prequalGroupLines = [] } = record;
    return (
      <section>
        {prequalGroupLines?.map((item) => {
          return (
            <div key={item.projectLineSectionId}>
              <h4>{`${item.sectionCode}-${item.sectionName}`}</h4>
            </div>
          );
        })}
      </section>
    );
  }

  renderCheckingItemWrapper() {
    const {
      item,
      checkKeysMap = {},
      onChangeCheck = () => {},
      onChangeItem = () => {},
    } = this.props;
    return (
      <div className={style['list-item-check']} onClick={() => onChangeItem(item)}>
        <Checkbox
          checked={checkKeysMap[item.prequalGroupHeaderId]}
          onChange={(e) => onChangeCheck(e, item.prequalGroupHeaderId)}
        >
          <span>{`${intl.get(`${promptCode}.view.message.group`).d('分组')}${item.indexNum}`}</span>
        </Checkbox>
      </div>
    );
  }

  renderItemWrapper() {
    const { item, currentRecordKey, onChangeItem = () => {} } = this.props;
    return (
      <Popover placement="leftTop" content={this.renderPopoverValue(item)}>
        <div
          className={classNames(style['list-item'], {
            [style['item-active']]: currentRecordKey === item.prequalGroupHeaderId,
          })}
          onClick={() => onChangeItem(item)}
        >
          <span className={style['list-item-content']}>
            {`${intl.get(`${promptCode}.view.message.group`).d('分组')}${item.indexNum}`}
          </span>
          <span className={style['list-item-tip']}>...</span>
        </div>
      </Popover>
    );
  }

  render() {
    const { showCheckBoxFlag } = this.props;
    return showCheckBoxFlag ? this.renderCheckingItemWrapper() : this.renderItemWrapper();
  }
}
