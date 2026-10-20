import React, { Component } from 'react';
import { isEmpty } from "lodash";
import { Dropdown, Icon, Menu } from 'choerodon-ui/pro';
import { Spin, Collapse, Tag, Tree } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import request from "hzero-front/lib/utils/request";
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import { unitTypeColorMap } from "../../../../utils/constConfig";

const customPanelStyle = {
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};
const TreeNode = Tree.TreeNode as any;
const { Panel } = Collapse;

export default class PageTree extends Component<{
  editable?: boolean;
  stage?: any;
  templateId?: string;
  unitTypeObj: any;
  publishStatus?: string;
  // eslint-disable-next-line no-unused-vars
  onUnitChange: (unitCode: string, pageUuid: string, dataRef: any) => void,
}, any> {

  unitTreeNode: any[] = [];

  unitTreeNodes: Map<number, string[]>;

  initlock = false;

  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [],
      expandKeys: [] as string[],
      treeLoading: true,
      currentPageId: '',
    };

    this.unitTreeNodes = new Map();
  }

  init() {

    const { stage } = this.props;
    const pages = stage && stage.children || [];
    this.setState({ currentPageId: pages.length > 0 ? pages[0].pageId : '' }, this.queryTree);
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    if (this.props.stage !== prevProps.stage) {
      const callback = () => {
        if (isEmpty(this.props.unitTypeObj)) {
          setTimeout(callback, 500);
          return;
        }
        this.init();
      };
      callback();
    }
  }

  queryTree = (pageId?) => {
    const id = this.state.currentPageId;
    if (!id && !pageId) return;
    this.setState({ treeLoading: true, currentPageId: id });
    const params: any = { pageId: pageId || id, templateId: this.props.templateId };
    request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-unit-tenants`, {
      method: "GET",
      query: params,
    }).then(res => {
      if (getResponse(res)) {
        this.setState({ cacheTreeData: res || [] });
        this.setTree(res || []);
      }
    });
  }

  setTree = (units) => {
    const { unitTypeObj, editable } = this.props;

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
    traversal(units, 0);
    const renderUnitsTree = (_children: any[] = [], level) => {
      return _children.map(unit => {
        const { unitName, unitType, children, enabledFlag, unitCode } = unit;
        let cacheKeys: string[] = [];
        let _level = level - 1;
        while (_level >= 0) {
          cacheKeys = cacheKeys.concat(this.unitTreeNodes.get(_level)!);
          _level--;
        }
        if (cacheKeys.includes(unitCode)) return;
        return (
          <TreeNode
            dataRef={unit}
            title={
              <div className='customize-treenode-wrapper'>
                <div>
                  {unitType === "SECTION" && (
                    <Icon type={enabledFlag ? "check_circle_outline-o" : "cancel-o"} style={{ color: enabledFlag ? "#47B883" : "#F56649" }} />
                  )}
                  <Tag color={unitTypeColorMap[unitType]}>{unitTypeObj[unitType]}</Tag>
                  <span>{unitName}</span>
                </div>
                {editable && unitType === "SECTION" && (
                  <Dropdown
                    overlay={(
                      <Menu onClick={({ key }) => this.clickUnitCtrl(key, unit)}>
                        <Menu.Item key="enable">
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
                )}
              </div>
            }
            key={unitCode}
          >
            {children ? renderUnitsTree(children, level + 1) : null}
          </TreeNode>
        );
      });
    };
    setTimeout(() => {
      this.unitTreeNode = renderUnitsTree(units as any[], 0);
      this.forceUpdate();
    });
    (this.unitTreeNode as any) = null;
    const defaultSelectedData = (units || [])[0] || {};
    const defaultSelectedKeys = defaultSelectedData.unitType ? [defaultSelectedData.unitCode] : [];
    this.setState({ treeLoading: false, selectedKeys: defaultSelectedKeys });
    this.props.onUnitChange(defaultSelectedData.unitType ? defaultSelectedData.unitCode : undefined, defaultSelectedData.pageUuid, defaultSelectedData);
  }

  onSelectKey = (selectedKeys, e) => {
    const { dataRef } = e.node;
    if (!selectedKeys[0]) return;
    this.props.onUnitChange(selectedKeys[0], dataRef.pageUuid, dataRef);
    this.setState({ selectedKeys });
  }

  onExpand = (expandedKeys) => {
    this.setState({ expandKeys: expandedKeys });
  }

  changePage = (pageId) => {
    if (!pageId || pageId == this.state.currentPageId) return;
    const { stage } = this.props;
    const page = (stage && stage.children || []).find(p => p.pageId == pageId);
    if (page) {
      this.queryTree(page.pageId);
      this.setState({ currentPageId: pageId });
    }
  }

  clickUnitCtrl = (key, unit) => {
    if (key === "enable") {
      request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-unit-tenants/enabled-flag/${unit.id}`, {
        method: "PUT",
      }).then(res => {
        if (getResponse(res)) {
          this.queryTree();
        }
      });
    }
  }

  render() {
    const { stage } = this.props;
    const pages = stage && stage.children || [];
    const { treeLoading, currentPageId } = this.state;
    return (
      <Collapse bordered={false} accordion onChange={this.changePage} activeKey={[currentPageId]}>
        {pages.map(page => (
          <Panel
            header={
              <div className='doc-page-header'>
                {page.pageName}
              </div>
            }
            key={page.pageId}
            style={customPanelStyle}
          >
            <Spin spinning={treeLoading}>{
              this.unitTreeNode && this.unitTreeNode.length > 0 ? (
                <Tree
                  key={currentPageId}
                  multiple={false}
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
