import React, { Component, Fragment } from 'react';
import { Tree, Spin, Menu } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Icon, Popover, Tooltip} from 'choerodon-ui';
import { Form, TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { breakEventBubble } from "../../utils/util";
import styles from './style/index.less';

const { TreeNode, DirectoryTree } = Tree;

@connect(({ loading = {} }) => ({
  fetchMenuLoading: loading.effects['individuationUnitCuz/fetchMenu'],
}))
export default class MenuTree extends Component {
  state = {
    menus: [], // 菜单数据
    dataMode: "tenant",
    filterStr: '',
    expandKeys: undefined,
  };

  componentDidMount() {
    this.fetchMenu();
  }

  @Bind()
  fetchMenu(checked) {
    let action = 'individuationUnitCuz/fetchMenu';
    if(checked){
      action = 'individuationUnitCuz/fetchMenuPlatform';
    }
    this.props
      .dispatch({
        type: action,
      })
      .then(res => {
        if (res) {
          this.setState({ menus: res || [] });
        }
      });
  }

  @Bind()
  selectMenu(selectedKeys = [], selectedNode = {}) {
    // 解决双击时tree组件会取消选中的问题
    if (selectedKeys[0]) {
      const { handleSelectMenu = () => {} } = this.props;
      const menuCode = selectedKeys[0];
      const {
        node: {
          props: { title },
        },
      } = selectedNode;
      const menuName = title;
      handleSelectMenu(menuCode, menuName, this.state.dataMode === "tenant");
    }
  }

  @Bind()
  renderMenuTree(menus = []) {
    const { filterStr } = this.state;
    return menus.map(menu => {
      const { menuCode, menuName, subMenus } = menu;
      if (subMenus) {
        const sub = this.renderMenuTree(subMenus).filter(Boolean);
        if (!sub.length) return null;
        return (
          <TreeNode title={menuName} key={menuCode} selectable={false}>
            {sub}
          </TreeNode>
        );
      }
      if (filterStr && (menuName || "").indexOf(filterStr) === -1) return null;
      return <TreeNode title={menuName} key={menuCode} />;
    });
  }

  changeDataMode = ({key}) => {
    this.fetchMenu(key === "platform");
    this.setState({dataMode: key}, () => {
      this.selectMenu(["root"], {node: {props: {title: intl.get('hpfm.individuationUnit.view.message.title.root').d('根目录')}}});
    });

  }

  executeFilter = (value) => {
    let expandKeys;
    if (value) {
      expandKeys = [];
      const traversal = (menus = []) => {
        return menus.map(menu => {
          const { menuCode, menuName, subMenus } = menu;
          if (subMenus) {
            const sub = traversal(subMenus).filter(Boolean);
            if (!sub.length) return false;
            expandKeys.push(menuCode)
            return true;
          }
          if ((menuName || "").indexOf(value) === -1) return false;
          return true;
        });
      }
      expandKeys.push("root");
      traversal(this.state.menus);
    }
    this.setState({ filterStr: value, expandKeys });
  }

  render() {
    const { menus = [], expandKeys } = this.state;
    const { fetchMenuLoading } = this.props;
    const directoryProps = {};
    if (expandKeys) directoryProps.expandedKeys = expandKeys;
    return (
      <Fragment>
        <Menu
          onClick={this.changeDataMode}
          defaultSelectedKeys={["tenant"]}
          mode="horizontal"
        >
          <Menu.Item key="tenant">
            {intl.get('hpfm.customize.common.tenantMenu').d('租户级菜单')}
          </Menu.Item>
          <Menu.Item key="platform">
            {intl.get('hpfm.customize.common.platformMenu').d('平台级菜单')}
          </Menu.Item>
        </Menu>
        <div className={styles["menu-wrap"]}>
          <Spin spinning={fetchMenuLoading} style={{ overflow: 'auto' }}>
            <Form className='menu-search-wrap' labelLayout="float">
              <TextField
                label={intl.get("hpfm.customize.common.filterByMenuName").d("请输入底层菜单名称查询")} 
                onChange={this.executeFilter}
              />
            </Form>
            <DirectoryTree onSelect={this.selectMenu} className={styles['unit-menu-tree']} style={{ flex: 1 }} {...directoryProps}>
              <TreeNode
                title={intl.get('hpfm.individuationUnit.view.message.title.root').d('根目录')}
                key="root"
                icon={null}
              >
                {this.renderMenuTree(menus)}
              </TreeNode>
            </DirectoryTree>
          </Spin>
        </div>
      </Fragment>
    );
  }
}
