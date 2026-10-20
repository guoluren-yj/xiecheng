import React, { Component, Fragment, ReactElement } from 'react';
import { Spin, Tree, Tooltip, Icon, DataSet, IntlField, Form, Modal, TextField } from 'choerodon-ui/pro';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import request from "hzero-front/lib/utils/request";
import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import notification from 'hzero-front/lib/utils/notification';
import { saveModule, deleteModule } from '../../services/customizeConfigService';

const { TreeNode } = Tree;

export default class ModuleTree extends Component<{
  onlyTenant?: boolean,
  tenantModuleUrl?: string,
  enableEditModuleName?: boolean;
  defaultExpandKeys?: string[];
  defaultSelectKey?: string;
  disableUnSelect?: boolean,
  noHeader?: boolean;
  // eslint-disable-next-line no-unused-vars
  onModuleChange: (code: string, moduleTitle?: string) => void,
  // eslint-disable-next-line no-unused-vars
  onExpand?: (x: string[]) => void;
}, any> {

  moduleTreeNode?: ReactElement;

  static defaultProps = {
    hasRootNode: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [],
      expandKeys: ["__root__"] as string[],
      treeLoading: true,
      defaultFinishInit: false,
    };
  }

  componentDidMount() {
    this.queryTree();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tenantModuleUrl !== this.props.tenantModuleUrl) this.queryTree();
  }

  queryTree = () => {
    this.setState({ treeLoading: true });
    const prefix = isTenantRoleLevel()
      ? `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}`
      : `${HZERO_PLATFORM}/v1`;
    let url = `${prefix}/docs/module`;
    if (this.props.tenantModuleUrl) url = this.props.tenantModuleUrl;
    request(url, {
      method: "GET",
    }).then(res => {
      if (getResponse(res)) {
        this.moduleTreeNode = (
          <TreeNode title={intl.get("hpfm.customize.common.rootDir").d("根目录")} key="__root__">
            {(res as any[]).map(module => {
              const { code, name, docModuleList } = module;
              const title = (
                <span className='tree-node-title'>
                  <Tooltip title={name}>{name}</Tooltip>
                  <Tooltip title={intl.get('hpfm.customize.view.tooltip.addModule').d('增加分类')}>
                    <Icon
                      type="add"
                      className='tree-node-title-icon'
                      style={{right: 0}}
                      onClick={event => this.handleEditModule(event, module, false)}
                    />
                  </Tooltip>
                </span>
              );
              return (
                <TreeNode title={title} key={code}>
                  {docModuleList && docModuleList.map(m => {
                    const { moduleCode, moduleName } = m;
                    return (
                      <TreeNode
                        title={
                          (
                            <span className='tree-node-title' style={{paddingRight: "40px"}}>
                              <Tooltip title={moduleName}>{moduleName}</Tooltip>
                              <Tooltip title={intl.get('hpfm.customize.common.editModule').d('编辑分类')}>
                                <Icon
                                  type="mode_edit"
                                  className='tree-node-title-icon'
                                  style={{right: 0}}
                                  onClick={event => this.handleEditModule(event, m, true)}
                                />
                              </Tooltip>
                              <Tooltip title={intl.get('hpfm.customize.common.deleteModule').d('删除分类')}>
                                <Icon
                                  type="delete"
                                  className='tree-node-title-icon'
                                  style={{right: "20px"}}
                                  onClick={(event) => handleDeleteModule(event, m, this.queryTree)}
                                />
                              </Tooltip>
                            </span>
                          )
                        }
                        key={moduleCode}
                        isLeaf
                      />
                    );
                  })}
                </TreeNode>
              );
            })}
          </TreeNode>
        );
        const newState: any = { treeLoading: false };
        if (!this.state.defaultFinishInit) {
          const { defaultExpandKeys, defaultSelectKey } = this.props;
          newState.expandKeys = defaultExpandKeys && defaultExpandKeys.length > 0 ? defaultExpandKeys : ["__root__"];
          newState.selectedKeys = defaultSelectKey ? [defaultSelectKey] : ["__root__"];
          newState.defaultFinishInit = true;
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
        this.setState(newState);
      }
    });
  }

  onSelectKey = (selectedKeys, e) => {
    const { key, isLeaf } = e.node;
    if (!isLeaf && key !== "__root__") {
      const newExpandKeys = this.state.expandKeys.includes(key) ? this.state.expandKeys.filter(_key => _key !== key) : this.state.expandKeys.concat(selectedKeys);
      this.setState({ expandKeys: newExpandKeys });
      // eslint-disable-next-line no-unused-expressions
      this.props.onExpand && this.props.onExpand(newExpandKeys);
    } else {
      this.props.onModuleChange(key, e.node.title);
      if (this.props.disableUnSelect && !selectedKeys[0]) return;
      this.setState({ selectedKeys });
    }
  }

  onExpand = (expandedKeys) => {
    this.setState({ expandKeys: expandedKeys });
    // eslint-disable-next-line no-unused-expressions
    this.props.onExpand && this.props.onExpand(expandedKeys);
  }

  handleEditModule = (event, module, isModule) => {
    event.stopPropagation();
    const formDs = new DataSet({
      fields: [
        {
          name: 'moduleName',
          type: FieldType.intl,
          label: intl.get('hpfm.customize.common.moduleName').d('分类名称'),
          required: true,
        },
        {
          name: 'moduleCode',
          type: FieldType.string,
          required: true,
          pattern: /^[a-zA-Z0-9.-_]+$/,
          label: intl.get('hpfm.customize.common.moduleCode').d('分类编码'),
        },
      ],
      data: isModule ? [{ ...module }] : [{ menuGroupCode: module.code }],
    });

    const handleSaveModule = async () => {
      if (formDs.current) {
        if (!await formDs.validate()) return false;
        const data = formDs.current.toData();
        const res = await saveModule(data);
        if (getResponse(res)) {
          notification.success(undefined as any);
          this.queryTree();
          return true;
        } else {
          return false;
        }
      }
    };
    Modal.open({
      title: isModule
        ? intl.get('hpfm.customize.common.editModule').d('编辑分类')
        : intl.get('hpfm.customize.common.addModule').d('新增分类'),
      closable: true,
      children: (
        <Form dataSet={formDs}>
          <TextField name="moduleCode" disabled={isModule} />
          <IntlField name="moduleName" />
        </Form>
      ),
      onOk: handleSaveModule,
    });

  }

  render() {
    const { noHeader } = this.props;
    const { treeLoading } = this.state;
    return (
      <Fragment>
        {!noHeader && (
          <div className="menu-tree-container-header">
            {this.props.children}
          </div>
        )}
        <div className='menu-tree-container-body'>
          <Spin spinning={treeLoading}>
            <Tree
              className='customize-menu-tree'
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
          </Spin>
        </div>
      </Fragment>
    );
  }
}

function handleDeleteModule(event, module, callback) {
  event.stopPropagation();
  Modal.confirm({
    title: intl.get('hpfm.customize.common.confirmDelete').d('确定删除吗？'),
    onOk: async () => {
      const res = await deleteModule({
        moduleId: module.moduleId,
      });
      if (getResponse(res)) {
        notification.success(undefined as any);
        callback();
      }
    },
  });
};