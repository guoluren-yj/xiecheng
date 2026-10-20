import React, { Component, ReactElement } from 'react';
import { Spin, Tooltip, Tree } from 'choerodon-ui/pro';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import request from "hzero-front/lib/utils/request";
import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import styles from "./style.less";

const { TreeNode } = Tree;
export default class ModuleTree extends Component<{
  enableEditModuleName?: boolean;
  defaultSelectKey?: string;
  defaultSelectKeyModuleCode?: string;
  disableUnSelect?: boolean;
  defaultDocCode?: string;
  // eslint-disable-next-line no-unused-vars
  onDocChange: (docInfo) => void;
  // eslint-disable-next-line no-unused-vars
  onExpand?: (x: string[]) => void;
  toggleCollapse: () => void;
  collapse?: boolean;
}, any> {

  moduleTreeNode?: ReactElement;

  modules: any[] = [];

  static defaultProps = {
    hasRootNode: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [],
      expandKeys: ["__root__"] as string[],
      treeLoading: true,
    };
  }

  componentDidMount() {
    this.queryTree();
  }

  queryTree = () => {
    this.setState({ treeLoading: true });
    request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/docs/module`, {
      method: "GET",
    }).then(res => {
      if (getResponse(res)) {
        this.moduleTreeNode = renderModuleTree(res as any[]) as any;
        const newState: any = { treeLoading: false };
        this.modules = res;
        this.moduleTreeNode = renderModuleTree(res) as any;
        const { defaultSelectKey, defaultSelectKeyModuleCode } = this.props;
        const activeDocParentModule = findDocInfoParent(res, defaultSelectKeyModuleCode) || {};
        const defaultExpandedKey = activeDocParentModule.code;
        newState.expandKeys = [defaultExpandedKey, defaultSelectKeyModuleCode, "__root__"].filter(Boolean);
        newState.selectedKeys = ["__root__"];
        if (defaultSelectKey === "__root__") {
          this.props.onDocChange({ moduleCode: "__root__" });
        } else if (defaultSelectKey && activeDocParentModule) {
          newState.selectedKeys = [defaultSelectKey];
          const doc = findDocInfoFromModule(activeDocParentModule, defaultSelectKey);
          if (doc) this.props.onDocChange(doc);
          this.setState(newState, () => {
            const tree = document.querySelector(`.${styles["customize-menu-tree"]}`);
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
          return;
        }
        this.setState(newState);
      }
    });
  }

  onSelectKey = (selectedKeys, e) => {
    const { key, dataRef, isLeaf } = e.node;
    if (key !== "__root__" && !isLeaf) {
      const newExpandKeys = this.state.expandKeys.includes(key) ? this.state.expandKeys.filter(_key => _key !== key) : this.state.expandKeys.concat(key);
      this.setState({ expandKeys: newExpandKeys });
      // eslint-disable-next-line no-unused-expressions
      this.props.onExpand && this.props.onExpand(newExpandKeys);
    } else {
      this.props.onDocChange(dataRef);
      if (this.props.disableUnSelect && !selectedKeys[0]) return;
      this.setState({ selectedKeys });
    }
  }

  onExpand = (expandedKeys) => {
    this.setState({ expandKeys: expandedKeys });
    // eslint-disable-next-line no-unused-expressions
    this.props.onExpand && this.props.onExpand(expandedKeys);
  }

  onSelectRoot = () => {
    if (this.state.selectedKeys[0] === "__root__") return;
    this.props.onDocChange({ moduleCode: "__root__" });
    this.setState({ selectedKeys: ["__root__"] });
  }

  render() {
    const { treeLoading, selectedKeys } = this.state;
    return (
      <div id="doc-tpl-module-tree-container" className='menu-tree-container-body left-tree-ued-fix'>
        <Spin spinning={treeLoading}>
          <div id="doc-tpl-module-tree" style={{ minHeight: "100%" }}>
            <div
              className={["root-dir", (selectedKeys || []).includes("__root__") && "active"].filter(Boolean).join(" ")}
              onClick={this.onSelectRoot}
            >
              {intl.get("hzero.common.status.all").d("全部")}
            </div>
            <Tree
              className={styles['customize-menu-tree']}
              multiple={false}
              expandedKeys={this.state.expandKeys}
              selectedKeys={this.state.selectedKeys}
              showLine={{ showLeafIcon: false }}
              onSelect={this.onSelectKey}
              onExpand={this.onExpand}
              showIcon={false}
            >
              {this.moduleTreeNode}
            </Tree>
          </div>
        </Spin>
        
      </div>
    );
  }
}

function renderModuleTree(modules: any[] = []) {
  return modules.map(module => {
    const { code, name, docModuleList } = module;
    return (
      <TreeNode
        title={(
          <span className='tree-node-title'>
            <Tooltip title={name}>{name}</Tooltip>
          </span>
        )}
        key={code}
        isLeaf={false}
      >
        {docModuleList ? docModuleList.map(m => {
          const { moduleCode, moduleName, docList } = m;
          return (
            <TreeNode
              title={(
                <span className='tree-node-title'>
                  <Tooltip title={moduleName}>{moduleName}</Tooltip>
                </span>
              )}
              key={moduleCode}
              isLeaf={false}
            >
              {docList ? docList.map(doc => {
                return <TreeNode title={<Tooltip title={doc.docName}>{doc.docName}</Tooltip>} key={doc.docId} isLeaf dataRef={doc} />;
              }) : <TreeNode title={intl.get("hzero.common.message.data.none").d("暂无数据")} key={`${moduleCode}_empty`} selectable={false} isLeaf />}
            </TreeNode>
          );
        }) : <TreeNode title={intl.get("hzero.common.message.data.none").d("暂无数据")} key={`${code}_empty`} selectable={false} isLeaf />}
      </TreeNode>
    );
  });
};

function findDocInfoParent(modules, defaultSelectKey) {
  if (!defaultSelectKey) return;
  const moduleParent = modules.find(({ docModuleList }) => {
    if (docModuleList && docModuleList.some(({ moduleCode }) => defaultSelectKey === moduleCode)) {
      return true;
    }
    return false;
  });
  return moduleParent;
}

function findDocInfoFromModule(m, key) {
  let target;
  if (m && m.docModuleList && m.docModuleList.length) {
    m.docModuleList.forEach(docM => {
      if(docM.docList && docM.docList.length) {
        target = docM.docList.find(doc => doc.docId === key);
      }
    });
  }
  return target;
}