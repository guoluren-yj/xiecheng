/**
 * 左侧分类菜单展示组件
 * @author: qingxiang.luo@going-link.com
 * @date: 2022-04-21
 */
import React, { Component } from 'react';
import { TextField, Dropdown } from 'choerodon-ui/pro'; // tooltip
import { Menu, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { formatTreeData } from '@/utils/utils';
import { fetchTableList } from './menuService';

import './index.less';

const { SubMenu } = Menu;

class LeftMenuClassify extends Component {
  constructor(props) {
    super(props);
    this.panelRef = React.createRef();
    this.state = {
      searchText: '',
      openKeys: [],
      selectItem: '',
      treeData: [], // 输入查询条件时，查出的数据树形
      selectedKeys: [],
    };
  }

  componentDidMount() {
    this.handleQuery('');
  }

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
        selectedKeys: [],
      },
      () => {
        this.getAllTableList(inputMsg);
      }
    );
  };

  /**
   * 查询全部
   * @param {*} inputMsg
   */
  getAllTableList = async (inputMsg) => {
    const { fetchUrl } = this.props;
    const res = await fetchTableList({ name: inputMsg, fetchUrl });
    if (getResponse(res) && res.length) {
      const { keyList, treeData } = formatTreeData(res);
      this.setState({
        openKeys: inputMsg ? keyList : this.state.openKeys,
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

  /**
   * 有查询条件时 绘制全部主题和表数据
   * @returns
   */
  drowAllSubList = () => {
    const { treeData } = this.state;
    return treeData.map((item) => {
      return (
        <SubMenu key={`${item.topicNum}`} title={item.topicName}>
          {this.drowItemList(item.children, item.topicNum)}
        </SubMenu>
      );
    });
  };

  /**
   * 对主题进行操作
   * @param {*} e
   * @param {*} id
   */
  handleClickItem = ({ key }) => {
    const { onOperate = () => {} } = this.props;
    onOperate(key);
  };

  getMenuList = (item, flag) => {
    return (
      <Menu onClick={this.handleClickItem}>
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
    const { selectItem } = this.state;
    const _self = this;

    if (list.length) {
      return list.map((item) => {
        return (
          <Menu.Item key={`${item.metaId},${item.name}`}>
            {`${item.name || ''} ${item.description || ''}`}
            {selectItem === item.metaId && isCanEdit && (
              <Dropdown overlay={() => _self.getMenuList(item, topicTag)} trigger={['hover']}>
                <Icon className="item-icon-more" type="more_vert" />
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

  onOpenChange = (openKeys) => {
    // 只展开最后一次点击的节点
    const openKey = openKeys.length ? openKeys[openKeys.length - 1] : '';

    this.setState({
      openKeys: [openKey],
    });
  };

  render() {
    const { placeholder } = this.props;
    const { selectedKeys, openKeys } = this.state;

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
        <div className="left-menu-panel">
          <Menu
            key="withSearchParam"
            mode="inline"
            openKeys={openKeys}
            onSelect={this.handleSelect}
            style={{ width: 256 }}
            onOpenChange={this.onOpenChange}
            selectedKeys={selectedKeys}
          >
            {this.drowAllSubList()}
          </Menu>
        </div>
      </div>
    );
  }
}

export default formatterCollections({
  code: ['sdps.common'],
})(LeftMenuClassify);
