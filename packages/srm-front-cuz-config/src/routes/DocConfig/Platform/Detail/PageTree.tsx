import React, { Component } from 'react';
import { Dropdown, Icon, Menu } from 'choerodon-ui/pro';

import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import request from "hzero-front/lib/utils/request";
import { getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import { Spin, Collapse, Tag, Tree } from 'choerodon-ui';
import { chooseUnit, pageModal } from './modalUtils';
import { unitTypeColorMap } from '../../../../utils/constConfig.js';

const customPanelStyle = {
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};
const TreeNode = Tree.TreeNode as any;
const { Panel } = Collapse;

export default class PageTree extends Component<{
  stageId?: string;
  docId?: string;
  onRef: Function;
  unitTypeObj: any;
  // eslint-disable-next-line no-unused-vars
  onUnitChange: (unitCode: string) => void,
}, any> {

  unitTreeNode: any[] | null = [];

  lazyCacheTreeData: Map<string, any>;

  unitTreeNodes: Map<number, string[]>;

  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [],
      expandKeys: [] as string[],
      treeLoading: true,
      currentPageId: '',
      pages: [] as any[],
      unitsUnderPages: [] as any[],
    };
    props.onRef(this);

    this.lazyCacheTreeData = new Map<string, any>();

    this.unitTreeNodes = new Map();
  }

  queryPages = () => {
    request(`${HZERO_PLATFORM}/v1/doc-pages`, {
      method: "GET",
      query: { stageId: this.props.stageId },
    }).then(res => {
      if (getResponse(res)) {
        this.setState({
          pages: res,
        }, this.queryTree);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.stageId && this.props.stageId !== prevProps.stageId) this.queryPages();
  }

  queryTree = (pageId?: string) => {
    if (!this.state.pages || this.state.pages.length === 0) return;
    const id = pageId || this.state.pages[0].pageId;
    this.setState({ treeLoading: true, currentPageId: id });
    request(`${HZERO_PLATFORM}/v1/doc-units`, {
      method: "GET",
      query: { pageId: id },
    }).then(res => {
      if (getResponse(res)) {
        setTimeout(() => {
          this.unitTreeNode = this.getUnitsTree(res as any[], true);
          this.forceUpdate();
        });
        (this.unitTreeNode as any) = null;
        const defaultSelectedData = (res || [])[0] || {};
        const defaultSelectedKeys = defaultSelectedData.unitType ? [defaultSelectedData.unitId] : [];
        this.setState({ treeLoading: false, selectedKeys: defaultSelectedKeys, unitsUnderPages: res });
        this.props.onUnitChange(defaultSelectedKeys[0]);
      }
    });
  }

  onSelectKey = (selectedKeys) => {
    if (!selectedKeys[0]) return;
    this.props.onUnitChange(selectedKeys[0]);
    this.setState({ selectedKeys });
  }

  onExpand = (expandedKeys) => {
    this.setState({ expandKeys: expandedKeys });
  }

  changePage = (pageId) => {
    if (!pageId || pageId == this.state.currentPageId) return;
    this.lazyCacheTreeData.clear();
    this.setState({
      expandKeys: [],
      selectedKeys: [],
    });
    this.queryTree(pageId);
  }

  clickPageCtrl = (pageId, op) => {
    const pageInfo = this.state.pages.find(i => i.pageId === pageId);
    if (op === 'edit') {
      pageModal([pageInfo], { docId: this.props.docId, stageId: this.props.stageId }, this.queryPages);
    } else if (op === 'chooseUnit') {
      chooseUnit({
        docId: this.props.docId,
        stageId: this.props.stageId,
        pageId,
      }, {
        unitTypeObj: this.props.unitTypeObj,
        callback: () => {
          this.setState({ currentPageId: pageId });
          this.queryTree(pageId);
        },
      });
    }
  }

  filterEventPop = (e) => {
    if (e.target.className.indexOf('doc-page-header') === -1) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  lazyLoad = (a) => {
    if (a.dataRef.children) return Promise.resolve();
    return request(`${HZERO_PLATFORM}/v1/doc-units/get/card-tree`, {
      method: "GET",
      query: { unitCardCode: a.dataRef.unitCode },
    }).then(res => {
      if (getResponse(res)) {
        this.lazyCacheTreeData.set(res.unitCode, res.children || [{ unitId: `${a.dataRef.unitCode}-empty`, unitType: "__empty__" }]);
        this.unitTreeNode = this.getUnitsTree(this.state.unitsUnderPages, true);
        this.forceUpdate();
      }
    });
  }

  itemClick = (key, index, unit) => {
    switch (key) {
      case 'enabledFlag':
        return request(`${HZERO_PLATFORM}/v1/doc-units/enabled-flag/${unit.id}`, {
          method: "PUT",
        }).then(res => {
          if (getResponse(res)) {
            notification.success(undefined as any);
            this.queryTree(this.state.currentPageId);
          }
        });
      default: ;
    }
  }

  getUnitsTree(_data: any[], isRoot?) {
    const { unitTypeObj } = this.props;
    if (isRoot) {
      this.unitTreeNodes.clear();
      const traversal = (data: any[] = [], level) => {
        const nextTraversalData: any[] = [];
        this.unitTreeNodes.set(level, data.map(i => {
          if (i.children && i.children.length > 0) {
            nextTraversalData.push(i.children);
          }
          return i.unitCode;
        }));
        if (nextTraversalData.length > 0) {
          nextTraversalData.forEach(sub => traversal(sub, level + 1));
        }
      };
      traversal(_data, 0);
    }
    const inner = (_children, level) => {
      return _children.map((unit, index, arr) => {
        const { unitId, unitName, unitType, unitCode, fieldName, enabledFlag } = unit;
        let cacheKeys: string[] = [];
        let _level = level - 1;
        while (_level >= 0) {
          cacheKeys = cacheKeys.concat(this.unitTreeNodes.get(_level)!);
          _level--;
        }
        if (cacheKeys.includes(unitCode)) return;
        const children = this.lazyCacheTreeData.get(unitCode) || unit.children;
        if (unitType === "__empty__") {
          return <TreeNode title="empty" key={unitId} isLeaf dataRef={unit} selectable={false} disabled />;
        }
        const hasMoveOrder = !level && arr.length > 1;
        return (
          <TreeNode
            title={
              <div className='customize-treenode-wrapper'>
                <div>
                  <Tag color={unitTypeColorMap[unitType]}>{unitTypeObj[unitType]}</Tag>
                  <span>{level > 0 ? fieldName : unitName}</span>
                </div>
                {
                  level === 0 && (
                    <Dropdown
                      overlay={(
                        <Menu onClick={({ key }) => this.itemClick(key, index, unit)}>
                          <Menu.Item key="enabledFlag">
                            {
                              enabledFlag
                                ? intl.get("hzero.common.status.disabled").d("禁用")
                                : intl.get('hzero.common.button.enabled').d('启用')
                            }
                          </Menu.Item>
                        </Menu>
                      )}
                    >
                      <Icon type="more_vert" className='doc-page-header-ctrl' />
                    </Dropdown>
                  )
                }
              </div>
            }
            key={unitId}
            isLeaf={unitType !== "SECTION"}
            dataRef={unit}
          >
            {children ? inner(children, level + 1) : null}
          </TreeNode>
        );
      });
    };
    return inner(_data, 0);
  }

  render() {
    const { treeLoading, currentPageId, pages } = this.state;
    return (
      <Collapse bordered={false} accordion onChange={this.changePage} activeKey={[currentPageId]}>
        {pages.map(page => (
          <Panel
            header={
              <div className='doc-page-header' onClick={this.filterEventPop}>
                {page.pageName}
                <Dropdown
                  overlay={(
                    <Menu onClick={({ key }) => this.clickPageCtrl(page.pageId, key)}>
                      <Menu.Item key="edit">{intl.get('hzero.common.button.edit').d("编辑")}</Menu.Item>
                      <Menu.Item key="chooseUnit">{intl.get('hpfm.doc.common.chooseUnit').d("选择单元")}</Menu.Item>
                    </Menu>
                  )}
                >
                  <Icon type="more_vert" className='doc-page-header-ctrl' />
                </Dropdown>
              </div>
            }
            key={page.pageId}
            style={customPanelStyle}
          >
            <Spin spinning={treeLoading}>
              {
                this.unitTreeNode && this.unitTreeNode.length > 0 ? (
                  <Tree
                    multiple={false}
                    loadData={this.lazyLoad}
                    loadedKeys={[]}
                    expandedKeys={this.state.expandKeys}
                    selectedKeys={this.state.selectedKeys}
                    showLine={{ showLeafIcon: false }}
                    onSelect={this.onSelectKey}
                    onExpand={this.onExpand}
                    showIcon={false}
                  >
                    {this.unitTreeNode}
                  </Tree>
                ) : (
                  <div className="no-data-block">
                    {intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
                  </div>
                )
              }
            </Spin>
          </Panel>
        ))}
        {
          !pages || pages.length === 0 && (
            <div className="no-data-block">
              {intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
            </div>
          )
        }
      </Collapse>
    );
  }
}
