import React, { Component, ReactElement } from 'react';
import classnames from "classnames";
import { Spin, Tree, Tooltip, Icon, Form, TextField } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import request from "hzero-front/lib/utils/request";
import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import styles from './style.less';

const { TreeNode } = Tree;

@formatterCollections({ code: ['hiam.tenantMenu'] })
export default class MenuTree extends Component<{
  className?: string;
  hasRootNode?: boolean;
  disableUnSelect?: boolean,
  // eslint-disable-next-line no-unused-vars
  changeDataMode?: (key: string) => void;
  // eslint-disable-next-line no-unused-vars
  onMenuChange: (menuCode: string, menuTitle?: string) => void,
  onExpand: (expandKeys: any) => void;
  cacheExpandKeys?: string[];
}, any> {

  menuTreeNode?: ReactElement;
  filterStr?: string;
  initExpandKeysByCacheFlag?: boolean;

  static defaultProps = {
    defaultDataMode: "tenant",
    changeDataMode: () => { },
    hasRootNode: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [],
      expandKeys: [],
      treeLoading: true,
      menus: [],
    };
  }

  componentDidMount() {
    this.queryTree();
  }

  componentDidUpdate() {
    if (this.props.cacheExpandKeys && !this.initExpandKeysByCacheFlag) {
      this.initExpandKeysByCacheFlag = true;
      this.setState({ expandKeys: this.props.cacheExpandKeys });
    }
  }

  queryTree = () => {
    this.setState({ treeLoading: true });
    request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/menu-tree?onlyHasCuszUnitGroup=true`, {
      method: "GET",
    }).then(res => {
      if (getResponse(res)) {
        this.menuTreeNode = this.renderMenuTree(res as any[]) as any;
        const newState: any = { treeLoading: false, menus: res || [] };
        this.setState(newState);
      }
    });
  }

  renderMenuTree = (menus: any[] = [], filterStr?) => {
    return menus.map(menu => {
      const { id, menuName, subMenus } = menu;
      const title = (
        <span className='tree-node-title'>
          <Tooltip title={menuName}>{menuName}</Tooltip>
        </span>
      );
      if (subMenus) {
        const nodes = this.renderMenuTree(subMenus, filterStr)
        if (!nodes || !nodes.filter(Boolean).length) return false
        return (
          <TreeNode title={title} key={id} data={menu}>
            {nodes}
          </TreeNode>
        );
      }
      if (filterStr && (menuName as string || "").indexOf(filterStr) === -1) return false;
      return <TreeNode title={title} key={id} data={menu} />;
    }).filter(Boolean);
  };

  scrollToSelected = () => {
    setTimeout(() => {
      const tree = document.querySelector(".customize-menu-tree");
      if (!tree) return;
      const selected = tree.querySelector(".c7n-tree-treenode-selected");
      if (!selected) return;
      try {
        selected.scrollIntoView({
          behavior: 'instant' as any,
          block: 'nearest',
        });
      } catch (e) {
        selected.scrollIntoView();
      }
    });
  }

  onSelectKey = (selectedKeys, e) => {
    const { children, key, data } = e.node;
    if (children && children.length > 0) {
      const newExpandKeys = this.state.expandKeys.includes(key) ? this.state.expandKeys.filter(_key => _key !== key) : this.state.expandKeys.concat(selectedKeys);
      this.setState({ expandKeys: newExpandKeys });
      this.props.onExpand(newExpandKeys);
    } else {
      this.props.onMenuChange(data.menuCode, data.menuName);
      if (this.props.disableUnSelect && !selectedKeys[0]) return;
      this.setState({ selectedKeys });
    }
  }

  // 不知原因，展开函数不触发了
  onExpand = (expandedKeys) => {
    this.props.onExpand(expandedKeys);
    this.setState({ expandKeys: expandedKeys });
  }

  executeFilter = (value) => {
    let expandKeys: string[] = [];
    if (value) {
      expandKeys = [];
      const traversal = (menus = []) => {
        return menus.map(menu => {
          const { id, menuName, subMenus } = menu;
          if (subMenus) {
            const sub = traversal(subMenus).filter(Boolean);
            if (!sub.length) return false;
            expandKeys.push(String(id))
            return true;
          }
          if ((menuName as string || "").indexOf(value) === -1) return false;
          return true;
        });
      }
      traversal(this.state.menus);
    }
    this.menuTreeNode = this.renderMenuTree(this.state.menus, value) as any;
    this.setState({ expandKeys });
  }

  render() {
    const { treeLoading, selectedKeys } = this.state;
    const isRoot = selectedKeys[0] === "__root__";
    return (
      <div className={styles["unit-config-menu-tree"]}>
        <Form labelLayout={LabelLayout.none}>
          <TextField
            prefix={<Icon type="search" />}
            placeholder={intl.get("hpfm.customize.common.filterByMenuName").d("请输入底层菜单名称查询")}
            onChange={this.executeFilter}
          />
        </Form>
        <div className='unit-config-menu-tree-body'>
          <Spin spinning={treeLoading}>
            <div className={classnames('menu-tree-search-node', { 'active': true })}>
              {intl.get("hzero.common.status.all").d("全部")}
            </div>
            <Tree
              className='customize-menu-tree'
              multiple={false}
              expandedKeys={this.state.expandKeys}
              selectedKeys={isRoot ? [] : this.state.selectedKeys}
              showLine={{ showLeafIcon: false }}
              onSelect={this.onSelectKey}
              onExpand={this.onExpand}
              showIcon={false}
            >
              {this.menuTreeNode}
            </Tree>
          </Spin>
        </div>
      </div>
    );
  }
}
