/**
 * 左侧分类菜单展示组件
 * @author: qingxiang.luo@going-link.com
 * @date: 2022-04-21
 */
import React, { Component } from 'react';
import { TextField, Dropdown, Tooltip } from 'choerodon-ui/pro';
import { Menu, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { formatTree3Data, getPageData } from '@/utils/utils';
import { fetchThemeList, fetchTableList } from './menuService';

import './index.less';

const { SubMenu } = Menu;

let unattributedList = []; // 存储所有未归属数据 用于分页
const pageSize = 50; // 分页数据 50
let currentPage = 0;

class LeftMenuClassify extends Component {
  scrollRef = null;

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
      isHover: {}, // 列表 hover 标志 item: boolean
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
    currentPage = 0;
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
        // selectedKeys: [],
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
      topicNum: '',
      fetchTabsUrl,
    });
    if (getResponse(result)) {
      unattributedList = result || [];
    }
    return fetchThemeList({ fetchUrl }).then(res => {
      if (getResponse(res)) {
        const list = res || [];
        let stateList = [...list];

        if (result && result.length) {
          // 未归属主题有值 才会增加这一项
          stateList = [
            ...list,
            {
              topicName: intl.get('sdps.common.view.title.unattributedSubject').d('未归属主题'),
              topicNum: 'unattributed',
            },
          ];
        }

        this.setState({
          themeList: stateList,
        });
      }
    });
  };

  handleInput = e => {
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
  getAllTableList = async inputMsg => {
    const { fetchTabsUrl } = this.props;
    const res = await fetchTableList({ name: inputMsg, fetchTabsUrl });
    if (getResponse(res) && res && res.length) {
      const { selectItem } = this.state;
      let record = null;
      res.forEach(item => {
        if (selectItem === item.metaId) {
          record = item;
        }
      });

      this.props.onSelect(record);
      const { keyList, treeData } = formatTree3Data(res);
      this.setState({
        openAllKeys: keyList,
        treeData,
      });
    }
  };

  /**
   * 回车查询
   */
  handleKeyDown = () => {
    this.handleQuery(this.state.searchText);
  };

  onAllOpenChange = openKeys => {
    this.setState({
      openAllKeys: openKeys,
    });
  };

  onOpenChange = openKeys => {
    const { fetchTabsUrl } = this.props;
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
            currentPage = 0;
            // 未归属主题 直接从已存数据里进行查询
            list = getPageData(currentPage, pageSize, unattributedList);
          } else {
            const res = await fetchTableList({
              topicNum: openKey !== 'unattributed' ? openKey : '',
              fetchTabsUrl,
            });
            if (getResponse(res)) {
              list = res || [];
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
  drowAllSubList = () => {
    const { treeData } = this.state;
    return treeData.map(item => {
      return item && item.topicNum ? (
        <SubMenu key={`${item.topicNum}`} title={item.topicName}>
          {this.drowItemList(item.children, item.topicNum)}
        </SubMenu>
      ) : null;
    });
  };

  /**
   * 绘制submenu 不带参数
   */
  drowSubList = () => {
    const { themeList, tableList, openSubKey } = this.state;

    if (!themeList.length) {
      return (
        <div className="left-menu-item-nodata">
          {intl.get('hzero.common.message.data.none').d('暂无数据')}
        </div>
      );
    }

    return themeList.map(item => {
      if (item && item.topicNum && item.topicNum === openSubKey) {
        // 只渲染当前节点的 item
        return item.topicNum ? (
          <SubMenu key={`${item.topicNum}`} title={item.topicName}>
            {this.drowItemList(tableList || [], item.topicNum)}
          </SubMenu>
        ) : null;
      }
      return item && item.topicNum ? (
        <SubMenu key={`${item.topicNum}`} title={item.topicName}>
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

  getMenuList = (item, flag) => {
    return (
      <Menu onClick={e => this.handleClickItem(e, item)}>
        {flag === 'unattributed' && (
          <Menu.Item key="add">
            {intl.get('sdps.common.view.button.addTopic').d('添加主题')}
          </Menu.Item>
        )}
        {flag !== 'unattributed' && (
          <Menu.Item key="change">
            {intl.get('sdps.common.view.button.changeTopic').d('更换主题')}
          </Menu.Item>
        )}
        {flag !== 'unattributed' && (
          <Menu.Item key="remove">
            {intl.get('sdps.common.view.button.removeTopic').d('移除主题')}
          </Menu.Item>
        )}
      </Menu>
    );
  };

  /**
   * 绘制 item 列表
   */
  drowItemList = (list = [], topicTag) => {
    const { nodataMsg = '', isCanEdit } = this.props;
    const { selectItem, isHover } = this.state;
    const _self = this;

    if (list.length) {
      return list.map(item => {
        return (
          <Menu.Item
            key={`${item.metaId},${item.name}`}
            onMouseEnter={() => this.setState({ isHover: { [item.metaId]: true } })}
            onMouseLeave={() => this.setState({ isHover: { [item.metaId]: false } })}
          >
            <Tooltip title={`${item.name || ''} ${item.description || ''}`}>
              {`${item.name || ''} ${item.description || ''}`}
            </Tooltip>
            {(selectItem === item.metaId || isHover[item.metaId]) &&
            isCanEdit && ( //
                <Dropdown overlay={() => _self.getMenuList(item, topicTag)} trigger={['hover']}>
                  <Icon style={{ fontWeight: 400 }} className="item-icon-more" type="more_vert" />
                </Dropdown>
              )}
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
    const metaId = key ? key.split(',')[0] : '';
    const tableName = key ? key.split(',')[1] : '';
    this.setState({
      selectItem: metaId,
      selectedKeys: [key],
    });
    onSelect({ metaId, tableName });
  };

  /**
   * 设置默认展开submenu
   * @param {*} param
   */
  handleSetOpenItem = async (params = {}) => {
    const { fetchTabsUrl, onSelect } = this.props;
    const { topicNum = '', metaId = '', tableName = '' } = params;
    const { searchText } = this.state;

    if (searchText) {
      this.getAllTableList(searchText);
      this.setState(
        {
          selectItem: metaId,
        },
        () => {
          onSelect({ metaId, tableName });
        }
      );
      return false;
    }

    let list = [];
    await this.handleGetThemeList();
    if (topicNum === 'unattributed') {
      // 未归属主题 直接从已存数据里进行查询
      list = getPageData(0, pageSize, unattributedList);
    } else {
      const res = await fetchTableList({
        topicNum: topicNum === 'unattributed' ? '' : topicNum,
        fetchTabsUrl,
      });
      if (getResponse(res)) {
        list = res || [];
      } else {
        list = [];
      }
    }

    this.setState(
      {
        tableList: list,
        openSubKey: topicNum,
        selectItem: metaId,
        openKeys: [topicNum],
      },
      () => {
        onSelect({ metaId, tableName });
      }
    );
  };

  /**
   * 加载更多
   */
  loadMore = () => {
    const { tableList, allMapList } = this.state;
    const mapList = [...allMapList];

    currentPage += 1;
    const list = getPageData(currentPage, pageSize, unattributedList);

    const addList = [...tableList, ...list];

    if (mapList.length) {
      mapList.forEach(item => {
        if (item.topicNum === 'unattributed') {
          // eslint-disable-next-line no-param-reassign
          item.children = addList;
        }
      });
    }
    this.setState({
      tableList: addList,
    });
  };

  onScrollHandle = () => {
    const { openSubKey, tableList = [] } = this.state;
    const { scrollTop, clientHeight, scrollHeight } = this.scrollRef;
    if (
      scrollTop + clientHeight + 15 > scrollHeight &&
      openSubKey === 'unattributed' &&
      tableList.length < unattributedList.length
    ) {
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
          ref={ref => {
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
              {this.drowAllSubList()}
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
              {this.drowSubList()}
            </Menu>
          )}
        </div>
      </div>
    );
  }
}

export default formatterCollections({
  code: ['sdps.common'],
})(LeftMenuClassify);
