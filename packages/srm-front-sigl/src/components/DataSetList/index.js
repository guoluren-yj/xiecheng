/**
 * 选择人员展示列表组件
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-24
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { Icon, Tag } from 'choerodon-ui';
import styles from './index.less';

export default class DataSetList extends Component {
  ulRef = React.createRef();

  contentHeight = 0; // 展示区域的高度

  state = {
    isRefresh: false,
    isShowAll: false,
  };

  @Bind()
  handleRemoveItem(record) {
    const { dataSet } = this.props;
    dataSet.unSelect(record);
    this.setState({ isRefresh: !this.state.isRefresh });
  }

  @Bind()
  handleDrawNameList(dataList) {
    const labelList = dataList || [];

    return labelList.map((item) => {
      const label = item.get('memberName');
      return (
        <Tag
          color="#EBEBEB"
          className={classNames(styles['selected-count-tag'])}
          key={item.get('memberId')}
        >
          {label}
          <Icon type="cancel" onClick={() => this.handleRemoveItem(item)} />
        </Tag>
      );
    });
  }

  /**
   * 展开更多
   */
  @Bind()
  handleShowMore() {
    this.setState({ isShowAll: !this.state.isShowAll });
  }

  componentDidMount() {
    this.contentHeight = this.ulRef.current ? this.ulRef.current.scrollHeight : 0;
    this.setState({ isRefresh: !this.state.isRefresh });
  }

  componentDidUpdate() {
    this.contentHeight = this.ulRef.current ? this.ulRef.current.scrollHeight : 0;
  }

  render() {
    const { isShowAll } = this.state;
    const { dataSet } = this.props;
    const count = dataSet.selected.length;

    return (
      <div className={classNames(styles['selected-list'])}>
        <div className={classNames(styles['selected-count'])}>
          {intl
            .get('sigl.memberCenter.view.title.countPeople', { count })
            .d(`发放人员（共 ${count} 人）`)}
        </div>
        <ul style={{ height: isShowAll ? `${this.contentHeight}px` : '60px' }} ref={this.ulRef}>
          {this.handleDrawNameList(dataSet.selected)}
        </ul>
        {this.contentHeight > 60 && (
          <div className={classNames(styles['selected-more-btn'])} onClick={this.handleShowMore}>
            {intl.get(`sigl.memberCenter.view.button.moreContent`).d('更多')} &nbsp;{' '}
            <Icon type={isShowAll ? 'expand_less' : 'expand_more'} />
          </div>
        )}
      </div>
    );
  }
}
