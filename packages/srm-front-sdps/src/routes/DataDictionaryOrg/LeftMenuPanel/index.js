/**
 * 左侧 menu 选择列表
 */
import React, { Component } from 'react';
import { TextField, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchList } from './menuService';
import './index.less';

export default class LeftMenu extends Component {
  scrollRef: null;

  constructor(props) {
    super(props);
    this.menuList = [];
    this.state = {
      selectItem: {},
      searchText: '',
      refresh: false,
      page: 0,
      hasLen: true,
    };
  }

  componentDidMount() {
    this.menuList = [];
    this.handleQuery('', 0);
  }

  componentWillUnmount() {
    this.menuList = [];
    this.setState({
      selectItem: {},
      page: 0,
    });
  }

  handleInput = (e) => {
    this.setState({
      searchText: e?.target?.value?.trim() ?? '',
      page: 0,
    });
  };

  handleClear = () => {
    this.setState({
      searchText: '',
      page: 0,
    });
    this.handleQuery('', 0);
  };

  /**
   * 执行查询
   */
  handleQuery = (value, pageNum) => {
    const {
      fetchUrl,
      config = {
        itemName: 'name',
        itemTitle: 'description',
        itemKey: 'id',
        searchField: 'name',
      },
    } = this.props;

    fetchList({
      fetchUrl,
      [config.searchField]: value,
      page: pageNum,
    }).then((res) => {
      if (getResponse(res) && res.content) {
        if ([...this.menuList, ...res.content].length >= res.totalElements) {
          // 小于20 说明没有数据了
          this.setState({ hasLen: false });
        } else {
          this.setState({ hasLen: true });
        }

        if (pageNum === 0) {
          // 第一页 说明输入内容查询 或初始查询
          this.menuList = [...res.content];
          this.handleSelected(res.content[0]);
          this.setState({ refresh: !this.state.refresh });
        } else {
          this.menuList = [...this.menuList, ...res.content];
          this.setState({ refresh: !this.state.refresh });
        }
      } else {
        this.menuList = [];
        this.setState({ hasLen: false });
      }
    });
  };

  handleKeyDown = () => {
    this.handleQuery(this.state.searchText, 0);
  };

  handleSelected = (item) => {
    const { onSelect } = this.props;
    this.setState({ selectItem: item });
    onSelect(item);
  };

  /**
   * 加载更多数据
   */
  loadMore = () => {
    const { searchText, page } = this.state;
    this.handleQuery(searchText, page + 1);
    this.setState({
      page: page + 1,
    });
  };

  /**
   * 绘制 table 列表
   */
  drawMenuList = () => {
    const { selectItem } = this.state;
    const {
      config = {
        itemName: 'name',
        itemTitle: 'description',
        itemKey: 'id',
        searchField: 'name',
      },
    } = this.props;
    const list = this.menuList || [];

    return list.map((item) => {
      const classes = selectItem[config.itemKey] === item[config.itemKey] ? 'selected-item' : '';
      return (
        <div
          key={item[config.itemKey]}
          className={`left-list-item ${classes}`}
          onClick={() => this.handleSelected(item)}
        >
          <Tooltip
            title={`${item[config.itemName]} ${item[config.itemTitle]}`}
            popupStyle={{
              maxWidth: '250px',
            }}
          >
            <span>{`${item[config.itemName]} ${item[config.itemTitle]}`}</span>
          </Tooltip>
        </div>
      );
    });
  };

  /**
   * 滚动加载更多
   */
  onScrollHandle = () => {
    const { hasLen } = this.state;
    const { scrollTop, clientHeight, scrollHeight } = this.scrollRef;
    if (scrollTop + clientHeight + 5 > scrollHeight && hasLen) {
      this.loadMore();
    }
  };

  render() {
    const { placeholder } = this.props;
    const { hasLen } = this.state;

    return (
      <div className="page-left-content">
        <div style={{ padding: '16px' }}>
          <TextField
            style={{ width: '100%' }}
            placeholder={placeholder}
            clearButton
            onInput={this.handleInput}
            onEnterDown={this.handleKeyDown}
            onClear={this.handleClear}
          />
        </div>
        <div
          className="left-list-panel"
          onScrollCapture={this.onScrollHandle}
          ref={(ref) => {
            this.scrollRef = ref;
          }}
        >
          {this.drawMenuList()}
          {hasLen ? null : (
            <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.45)', marginTop: '8px' }}>
              {intl.get('hzero.common.view.message.hasNoData').d('没有更多了')}
            </div>
          )}
        </div>
      </div>
    );
  }
}
