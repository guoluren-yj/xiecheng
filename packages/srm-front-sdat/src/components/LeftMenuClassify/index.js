/**
 * 左侧分类菜单展示组件
 * @author: qingxiang.luo@going-link.com
 * @date: 2022-04-21
 */
import React, { Component } from 'react';
import { TextField } from 'choerodon-ui/pro'; // tooltip
import { Menu } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { formatTreeData, getPageData } from '@/utils/utils';
import { fetchThemeList, fetchTableList } from './menuService';

import './index.less';

const { SubMenu } = Menu;

let unattributedList = []; // 存储所有未归属数据 用于分页
const pageSize = 50; // 分页数据 50

class LeftMenuClassify extends Component {
  constructor(props) {
    super(props);
    this.panelRef = React.createRef();
    this.state = {
      searchText: '',
      openKeys: [],
      selectItem: '',
      themeList: [],
      tableList: [],
      openSubKey: '',
      openAllKeys: [], // 展开全部项
      treeData: [], // 输入查询条件时，查出的数据树形
      selectedKeys: [],
      currentPage: 0, // 当前页数
    };
  }

  componentDidMount() {
    const { onRef = () => {}, onInit = () => {} } = this.props;
    this.handleGetThemeList();
    onRef(this.handleSetOpenItem);
    onInit(this.handleInit);
  }

  componentWillUnmount() {
    unattributedList = []; // 数据清空
  }

  handleInit = () => {
    const { searchText } = this.state;
    this.setState(
      {
        openKeys: [],
        themeList: [],
        tableList: [],
        openSubKey: '',
        openAllKeys: [], // 展开全部项
        treeData: [], // 输入查询条件时，查出的数据树形
        selectedKeys: [],
      },
      () => {
        if (searchText) {
          this.getAllTableList(searchText);
          return;
        }
        this.handleGetThemeList();
      }
    );
  };

  /**
   * 获取主题列表
   */
  handleGetThemeList = async () => {
    const { fetchUrl, fetchTabsUrl } = this.props;
    const result = await fetchTableList({
      // 先查询未归属主题的表数据
      groupCode: '',
      level: 'org',
      fetchTabsUrl,
    });

    if (getResponse(result)) {
      unattributedList = result?.content ?? [];
    }
    return fetchThemeList({ fetchUrl, level: 'org' }).then((res) => {
      if (getResponse(res)) {
        const list = res || [];
        let stateList = [...list];

        if (result && result.content && result.content.length) {
          // 未归属主题有值 才会增加这一项
          stateList = [
            ...list,
            // {
            //   meaning: intl.get('sdat.common.view.title.unattributedGroup').d('未归属分组'),
            //   value: 'unattributed',
            // },
          ];
        }

        this.setState({
          themeList: stateList,
        });
      }
    });
  };

  handleInput = (e) => {
    this.setState({
      searchText: e?.target?.value?.trim() ?? '',
    });
  };

  handleClear = () => {
    this.setState({
      searchText: '',
    });
    this.handleQuery('');
  };

  /**
   * 执行查询
   * @param {string} text
   * @param {*} page
   */
  handleQuery = (inputMsg = '') => {
    const { onSelect } = this.props;
    onSelect(null);
    this.setState(
      {
        selectItem: '',
        treeData: [],
        openAllKeys: [],
        openKeys: [],
        themeList: [],
        tableList: [],
        selectedKeys: [],
        openSubKey: '',
      },
      async () => {
        if (!inputMsg) {
          // 没有查询条件 直接查询主题列表
          this.handleGetThemeList();
          return;
        }

        this.getAllTableList(inputMsg);
      }
    );
  };

  /**
   * 查询全部
   * @param {*} inputMsg
   */
  getAllTableList = async (inputMsg) => {
    const { fetchTabsUrl } = this.props;
    const { fetchUrl } = this.props;

    const res = await fetchTableList({ name: inputMsg, fetchTabsUrl, level: 'org' });

    if (getResponse(res) && res.content && res.content.length) {
      const { selectItem } = this.state;
      let record = null;

      res.content.forEach((item) => {
        if (selectItem === item.cardId) {
          record = item;
        }
      });

      fetchThemeList({ fetchUrl, level: 'org' }).then((result) => {
        if (getResponse(result)) {
          this.props.onSelect(record);
          const { keyList, treeData } = formatTreeData(res.content, result || []);

          this.setState({
            openAllKeys: keyList,
            treeData,
          });
        }
      });
    }
  };

  /**
   * 回车查询
   */
  handleKeyDown = () => {
    this.handleQuery(this.state.searchText);
  };

  onAllOpenChange = (openKeys) => {
    this.setState({
      openAllKeys: openKeys,
    });
  };

  onOpenChange = (openKeys) => {
    const { fetchTabsUrl } = this.props;
    const { currentPage } = this.state;
    // 只展开最后一次点击的节点
    const openKey = openKeys.length ? openKeys[openKeys.length - 1] : '';

    this.setState(
      {
        openSubKey: openKey,
      },
      async () => {
        if (openKey) {
          let list = [];
          if (openKey === 'unattributed') {
            // 未归属主题 直接从已存数据里进行查询
            list = getPageData(currentPage, pageSize, unattributedList);
          } else {
            const res = await fetchTableList({
              groupCode: openKey !== 'unattributed' ? openKey : '',
              fetchTabsUrl,
              level: 'org',
            });
            if (getResponse(res)) {
              list = res?.content ?? [];
            } else {
              list = [];
            }
          }
          this.setState({
            tableList: list,
            openKeys: [openKey],
          });
        } else {
          this.setState({
            tableList: [],
            openKeys: [openKey],
          });
        }
      }
    );
  };

  /**
   * 有查询条件时 绘制全部主题和表数据
   * @returns
   */
  drawAllSubList = () => {
    const { treeData } = this.state;
    return treeData.map((item) => {
      return item && item.groupCode ? (
        <SubMenu key={`${item.groupCode}`} title={item.groupName}>
          {this.drawItemList(item.children, item.groupCode)}
        </SubMenu>
      ) : null;
    });
  };

  /**
   * 绘制submenu 不带参数
   */
  drawSubList = () => {
    const { themeList, tableList, openSubKey } = this.state;

    if (!themeList.length) {
      return (
        <div className="left-menu-item-nodata">
          {intl.get('hzero.common.message.data.none').d('暂无数据')}
        </div>
      );
    }

    return themeList.map((item) => {
      if (item && item.value && item.value === openSubKey) {
        // 只渲染当前节点的 item
        return item.value ? (
          <SubMenu key={`${item.value}`} title={item.meaning}>
            {this.drawItemList(tableList || [], item.value)}
          </SubMenu>
        ) : null;
      }
      return item && item.value ? (
        <SubMenu key={`${item.value}`} title={item.meaning}>
          <></>
        </SubMenu>
      ) : null;
    });
  };

  /**
   * 对主题进行操作
   * @param {*} e
   * @param {*} id
   */
  handleClickItem = ({ key }, item) => {
    const { onOperate = () => {} } = this.props;
    onOperate(key, item);
  };

  /**
   * 绘制 item 列表
   */
  // eslint-disable-next-line no-unused-vars
  drawItemList = (list = [], topicTag) => {
    const { nodataMsg = '' } = this.props;

    if (list.length) {
      return list.map((item) => {
        return (
          <Menu.Item key={`${item.cardId},${item.code}`}>
            {`${item.code || ''}     ${item.name || ''}`}
          </Menu.Item>
        );
      });
    } else {
      return <div className="left-menu-item-nodata">{nodataMsg}</div>;
    }
  };

  /**
   * 选中数据
   * @param {*} item
   */
  handleSelect = ({ key }) => {
    const { onSelect = () => {} } = this.props;

    const cardId = key ? key.split(',')[0] : '';
    const code = key ? key.split(',')[1] : '';
    this.setState({
      selectItem: cardId,
      selectedKeys: [key],
    });

    onSelect({ cardId, code });
  };

  /**
   * 设置默认展开submenu
   * @param {*} param
   */
  handleSetOpenItem = async (params = {}) => {
    const { fetchTabsUrl, onSelect } = this.props;
    const { value = '', cardId = '', code = '' } = params;
    const { searchText, currentPage } = this.state;

    if (searchText) {
      this.getAllTableList(searchText);
      this.setState(
        {
          selectItem: cardId,
        },
        () => {
          onSelect({ cardId, code });
        }
      );
      return false;
    }

    let list = [];
    await this.handleGetThemeList();
    if (value === 'unattributed') {
      // 未归属主题 直接从已存数据里进行查询
      list = getPageData(currentPage, pageSize, unattributedList);
    } else {
      const res = await fetchTableList({
        groupCode: value === 'unattributed' ? '' : value,
        fetchTabsUrl,
        level: 'org',
      });
      if (getResponse(res)) {
        list = res?.content ?? [];
      } else {
        list = [];
      }
    }

    this.setState(
      {
        tableList: list,
        openSubKey: value,
        selectItem: cardId,
        openKeys: [value],
      },
      () => {
        onSelect({ cardId, code });
      }
    );
  };

  /**
   * 加载更多
   */
  loadMore = () => {
    const { currentPage, tableList } = this.state;
    const list = getPageData(currentPage + 1, pageSize, unattributedList);
    this.setState({
      currentPage: currentPage + 1,
      tableList: [...tableList, ...list],
    });
  };

  onScrollHandle = () => {
    const { openSubKey } = this.state;
    const { scrollTop, clientHeight, scrollHeight } = this.scrollRef;
    if (scrollTop + clientHeight + 5 > scrollHeight && openSubKey === 'unattributed') {
      this.loadMore();
    }
  };

  render() {
    const { placeholder } = this.props;
    const { treeData, selectedKeys } = this.state;

    return (
      <div className="left-menu-classify" ref={this.panelRef}>
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
          className="left-menu-panel"
          onScrollCapture={this.onScrollHandle}
          ref={(ref) => {
            this.scrollRef = ref;
          }}
        >
          {treeData.length ? (
            <Menu
              key="withSearchParam"
              mode="inline"
              openKeys={this.state.openAllKeys}
              onOpenChange={this.onAllOpenChange}
              onSelect={this.handleSelect}
              style={{ width: 256 }}
              selectedKeys={selectedKeys}
            >
              {this.drawAllSubList()}
            </Menu>
          ) : (
            <Menu
              key="withNull"
              mode="inline"
              openKeys={this.state.openKeys}
              onOpenChange={this.onOpenChange}
              onSelect={this.handleSelect}
              style={{ width: 256 }}
              selectedKeys={selectedKeys}
            >
              {this.drawSubList()}
            </Menu>
          )}
        </div>
      </div>
    );
  }
}

export default formatterCollections({
  code: ['sdat.common'],
})(LeftMenuClassify);
