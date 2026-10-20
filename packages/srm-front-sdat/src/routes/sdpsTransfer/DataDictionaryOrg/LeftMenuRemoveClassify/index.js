/* eslint-disable no-param-reassign */
/**
 * 左侧分类菜单展示组件
 * @author: qingxiang.luo@going-link.com
 * @date: 2022-04-21
 */
import React, { Component } from 'react';
import { TextField, Dropdown, Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { Icon, Checkbox, Menu } from 'choerodon-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { formatTree3Data, getPageData } from '@/utils/utils';
import { fetchThemeList, fetchTableList, removeData } from './menuService';

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
      batchFlag: false, // 是否是批量操作状态
      allMapList: [], // 存储所有分类的数据，点开一个主题 查询对应的数据后放到列表内
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
    return fetchThemeList({ fetchUrl }).then((res) => {
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
              children: [...result],
            },
          ];
        }

        this.setState({
          themeList: stateList,
          allMapList: stateList,
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
    const { themeList } = this.state;
    const res = await fetchTableList({ name: inputMsg || '', fetchTabsUrl });
    if (getResponse(res) && res && res.length) {
      const { selectItem } = this.state;
      let record = null;
      res.forEach((item) => {
        if (selectItem === item.sourceTableId) {
          record = item;
        }
      });

      this.props.onSelect(record);
      const { keyList, treeData } = formatTree3Data(res, themeList);

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

  onAllOpenChange = (openKeys) => {
    this.setState({
      openAllKeys: openKeys,
    });
  };

  onOpenChange = (openKeys) => {
    const { fetchTabsUrl } = this.props;
    const { allMapList } = this.state;
    // 只展开最后一次点击的节点
    const openKey = openKeys.length ? openKeys[openKeys.length - 1] : '';

    const mapList = [...allMapList];
    let isChecked = false;
    mapList.forEach((item) => {
      if (item.topicNum === openKey) {
        isChecked = item.checked;
      }
    });

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

          if (list.length) {
            list.forEach((item) => {
              item.checked = isChecked;
            });
          }

          if (mapList.length) {
            mapList.forEach((item) => {
              if (item.topicNum === openKey) {
                item.children = [...list];
              }
            });
          }

          this.setState({
            tableList: list,
            openKeys,
            allMapList: mapList,
          });
        } else {
          this.setState({
            tableList: [],
            openKeys,
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
    const _self = this;
    const { treeData, batchFlag } = this.state;

    return treeData.map((item) => {
      return item && item.topicNum ? (
        <SubMenu
          key={`${item.topicNum}`}
          title={
            <div style={{ display: 'flex' }}>
              {batchFlag && (
                <span onClick={(e) => _self.handleChangeGroup(e, item)}>
                  <Checkbox
                    checked={!!item.checked}
                    // onChange={(e) => _self.handleChangeGroup(e, item)}
                  />
                  &nbsp;&nbsp;
                </span>
              )}
              <span>{item.topicName}</span>
            </div>
          }
        >
          {this.drawItemList(item.children, item.topicNum)}
        </SubMenu>
      ) : null;
    });
  };

  /**
   * 切换分组选择状态
   * @param {*} e
   * @param {*} record
   */
  handleChangeGroup = (e, record = {}) => {
    e.stopPropagation();
    e.preventDefault();

    const { allMapList, treeData } = this.state;
    const { topicNum = '' } = record;

    const list = treeData.length ? [...treeData] : [...allMapList];

    const checkFlag = !record.checked;

    if (topicNum) {
      if (list.length) {
        list.forEach((item) => {
          if (item.topicNum === topicNum) {
            item.checked = checkFlag;

            if (item.children && item.children.length) {
              item.children.forEach((item2) => {
                item2.checked = checkFlag;
              });
            }
          }
        });
      }
    }

    const obj = treeData.length ? { treeData: list } : { allMapList: list };
    this.setState(obj);
  };

  /**
   * 选中或去选单条数据
   * @param {*} e
   * @param {*} record
   */
  handleCheckItem = (e, record, topicNum) => {
    const { allMapList, treeData } = this.state;
    const allMap = treeData.length ? [...treeData] : [...allMapList];

    const isCheck = e.target.checked;

    if (allMap.length) {
      allMap.forEach((item) => {
        if (item.topicNum === topicNum && item.children && item.children.length) {
          let hasCheckAll = true;
          item.children.forEach((item2) => {
            if (item2.sourceTableId === record.sourceTableId) {
              item2.checked = isCheck;
            }

            if (!item2.checked) {
              hasCheckAll = false;
            }
          });

          item.checked = hasCheckAll;
        }
      });
    }

    const obj = treeData.length ? { treeData: allMap } : { allMapList: allMap };
    this.setState(obj);
  };

  /**
   * 绘制submenu 不带参数
   */
  drawSubList = () => {
    const { allMapList, batchFlag } = this.state;
    const _self = this;

    if (!allMapList.length) {
      return (
        <div className="left-menu-item-nodata">
          {intl.get('hzero.common.message.data.none').d('暂无数据')}
        </div>
      );
    }

    return allMapList.map((item) => {
      return item && item.topicNum ? (
        <SubMenu
          key={`${item.topicNum}`}
          title={
            <div style={{ display: 'flex' }}>
              {batchFlag && (
                <span onClick={(e) => _self.handleChangeGroup(e, item)}>
                  <Checkbox checked={!!item.checked} />
                  &nbsp;&nbsp;
                </span>
              )}
              <span>{item.topicName}</span>
            </div>
          }
        >
          {this.drawItemList(item.children || [], item.topicNum)}
        </SubMenu>
      ) : null;
    });
  };

  /**
   * 对主题进行操作 移除
   * @param {*} e
   * @param {*} id
   */
  handleClickItem = (e, item) => {
    this.callRemoveFun([{ ...item }]);
  };

  getMenuList = (item) => {
    return (
      <Menu onClick={(e) => this.handleClickItem(e, item)}>
        <Menu.Item key="remove">
          {intl.get('sdps.common.view.button.removeTable').d('移除表')}
        </Menu.Item>
      </Menu>
    );
  };

  /**
   * 绘制 item 列表
   */
  drawItemList = (list = [], topicTag) => {
    const { nodataMsg = '' } = this.props;
    const { selectItem, isHover, batchFlag } = this.state;
    const _self = this;

    if (list.length) {
      return list.map((item) => {
        return (
          <Menu.Item
            key={`${item.sourceTableId},${item.sourceTableNum}`}
            onMouseEnter={() => this.setState({ isHover: { [item.sourceTableId]: true } })}
            onMouseLeave={() => this.setState({ isHover: { [item.sourceTableId]: false } })}
            style={{ display: 'flex' }}
          >
            {batchFlag && (
              <span>
                <Checkbox
                  checked={!!item.checked}
                  onChange={(e) => _self.handleCheckItem(e, item, topicTag)}
                />
                &nbsp;&nbsp;
              </span>
            )}

            <Tooltip title={`${item.sourceTableNum || ''} ${item.sourceTableName || ''}`}>
              <span
                style={{
                  width: '220px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {`${item.sourceTableNum || ''} ${item.sourceTableName || ''}`}
              </span>
            </Tooltip>

            {(selectItem === item.sourceTableId || isHover[item.sourceTableId]) &&
              !batchFlag && ( //
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
    const sourceTableId = key ? key.split(',')[0] : '';
    const tableName = key ? key.split(',')[1] : '';
    this.setState({
      selectItem: sourceTableId,
      selectedKeys: [key],
    });
    onSelect({ metaId: sourceTableId, tableName });
  };

  /**
   * 设置默认展开submenu
   * @param {*} param
   */
  handleSetOpenItem = async (params = {}) => {
    const { fetchTabsUrl, onSelect } = this.props;
    const { topicNum = '', sourceTableId = '', tableName = '' } = params;
    const { searchText } = this.state;

    if (searchText) {
      this.getAllTableList(searchText);
      this.setState(
        {
          selectItem: sourceTableId,
        },
        () => {
          onSelect({ metaId: sourceTableId, tableName });
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
        selectItem: sourceTableId,
        openKeys: [topicNum],
      },
      () => {
        onSelect({ metaId: sourceTableId, tableName });
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
      mapList.forEach((item) => {
        if (item.topicNum === 'unattributed') {
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

  /**
   * 添加订阅
   */
  handleAdd = () => {
    const { onAddScription } = this.props;
    if (onAddScription && typeof onAddScription === 'function') {
      onAddScription();
    }
  };

  /**
   * 批量移除
   */
  handleBatchRemove = () => {
    this.setState({ batchFlag: true });
  };

  handleCancel = () => {
    this.setState({ batchFlag: false });
    this.handleInit();
  };

  batchRemoveOk = () => {
    const { allMapList, treeData, searchText } = this.state;

    const commonList = searchText ? treeData : allMapList;

    if (commonList.length) {
      const deleteList = [];

      commonList.forEach((item) => {
        if (item.children && item.children.length) {
          item.children.forEach((item2) => {
            if (item2.checked) {
              deleteList.push({ ...item2 });
            }
          });
        }
      });

      this.callRemoveFun(deleteList);
    }
  };

  callRemoveFun = (list = []) => {
    const { callBackToRefresh = () => {} } = this.props;
    const { selectItem } = this.state;

    if (list && list.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        okText: intl.get('hzero.common.button.remove').d('移除'),
        children: (
          <div>
            {intl.get('sdps.common.view.message.deleteConfirmMsg', {
              name: list.length,
            })}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          removeData(list).then((res) => {
            const includeKey = list.filter((item) => item.sourceTableId === selectItem);
            if (getResponse(res)) {
              notification.success();
              this.setState({ batchFlag: false });
              this.handleInit();
              if (callBackToRefresh) {
                callBackToRefresh(includeKey || []);
              }
            }
          });
        }
      });
    }
  };

  render() {
    const { placeholder, coreUser } = this.props;
    const { treeData, selectedKeys, batchFlag } = this.state;

    return (
      <div className="left-menu-classify" ref={this.panelRef}>
        <div style={{ padding: '16px 16px 8px' }}>
          <TextField
            style={{ width: '100%' }}
            placeholder={placeholder}
            clearButton
            onInput={this.handleInput}
            onEnterDown={this.handleKeyDown}
            onClear={this.handleClear}
          />
        </div>
        <div style={{ paddingLeft: '20px' }}>
          {!batchFlag ? (
            <>
              {['1', 1].includes(coreUser) ? (
                <Button funcType="flat" icon="add" key="add" onClick={this.handleAdd}>
                  {intl.get('sdps.dataDictionary.view.title.addSubscription').d('添加订阅')}
                </Button>
              ) : null}
              <Button funcType="flat" icon="delete" key="remove" onClick={this.handleBatchRemove}>
                {intl.get('sdps.common.button.batchRemove').d('批量移除')}
              </Button>
            </>
          ) : (
            <>
              <Button
                color="red"
                funcType="flat"
                icon="delete"
                key="ok"
                onClick={this.batchRemoveOk}
              >
                {intl.get('sdps.common.button.removeOk').d('确定移除')}
              </Button>
              <Button funcType="flat" icon="replay" key="replay" onClick={this.handleCancel}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </>
          )}
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
  code: ['sdps.common'],
})(LeftMenuClassify);
