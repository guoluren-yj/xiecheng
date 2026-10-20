import React, { Component, createRef } from 'react';
import { Tooltip, Tree, Modal, TextField, Icon, Spin } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { Icon as H0Icon } from 'hzero-ui';
import { isNil } from 'lodash';
import { debounce } from 'lodash-decorators';

import intl from 'hzero-front/lib/utils/intl';
import { getFieldSvg, BLOCK_COLOR } from '../../ReportDesign/utils/constant';
import { arrayToTree } from '../../ReportDesign/utils/utils';
import styles from '../index.less';
import AddFieldModal from '../../components/AddFieldModal';
import Store from '../store';
import { createNewDocumentFieldIndex } from '../utils';

type businessObjectField = {
  id: string;
  name: string;
  parentName: string;
  code: string;
  parentId: string | number;
  parentCode: string;
  type: string;
  color: string;
  dataType: string;
  businessType: string;
  displayFieldCode: string;
  deprecatedFlag: number;
}

type businessObject = {
  id: string | number;
  name: string;
  code: string;
  parentId: string | number;
  type: string;
  fields?: businessObjectField[];
}

type treeItem = {
  id: string | number;
  name: string;
  code: string;
  type: string;
  color: string;
  parentId: string | number,
  parentCode: string,
  fields?: businessObjectField[];
}

interface IState {
  filterStr: undefined | string;
  treeData: treeItem[];
  objectList: businessObject[];
  loadTreeData: any[];
  treeDataList: any[];
  expandedKeys: any[];
  loading: boolean;
  activeFieldCode?: string;
}

export default class FieldSelect extends Component<{ isPredefined: boolean }, IState> {
  static contextType = Store;

  addFieldModalRef: any;

  fieldIndexMap: any;

  fieldTreeRef: any;

  scrollDomRef: any;

  scrollIntoFieldTimer: any = null;

  constructor(props) {
    super(props);
    this.addFieldModalRef = createRef();
    this.fieldIndexMap = {};
    this.state = {
      filterStr: undefined,
      treeData: [], // 树原始数据
      objectList: [], // 字段所属对象数组
      loadTreeData: [], // 树当前加载数据（搜索）
      treeDataList: [],
      expandedKeys: [],
      loading: true,
      activeFieldCode: undefined,
    };
  }

  componentDidMount() {
    const { datasetId, treeDs } = this.context.store;
    treeDs.setQueryParameter('datasetId', datasetId);
    this.initData(true);
  }

  componentDidUpdate() {
    const { state: { activeFieldCode } } = this.context.store;
    if (activeFieldCode && activeFieldCode !== this.state.activeFieldCode) {
      this.setState({ activeFieldCode });
      this.handleActiveField(activeFieldCode);
    }
  }

  handleActiveField = fieldCode => {
    this.handleScrollIntoTreeNode(fieldCode);
  };

  handleScrollIntoTreeNode = (fieldCode) => {
    clearInterval(this.scrollIntoFieldTimer);
    this.scrollIntoFieldTimer = null;
    const { treeDataList, expandedKeys } = this.state;
    if (treeDataList.length > 0) {
      let newExpandedKeys = expandedKeys;
      treeDataList.forEach((node) => {
        if (node.fields && node.fields.length > 0) {
          const field = node.fields.find((field) => field.code === fieldCode);
          if (field && !expandedKeys.includes(node.id)) {
            newExpandedKeys = newExpandedKeys.concat(node.id);
          }  
        }
      });
      this.setState({
        expandedKeys: newExpandedKeys,
      }, () => {
        this.scrollIntoFieldTimer = setInterval(() => {
          const node = this.fieldTreeRef.querySelector(`.c7n-tree-title>div[data-code='${fieldCode}']`);
          if (node) {
            clearInterval(this.scrollIntoFieldTimer);
            this.scrollIntoFieldTimer = null;
            let offsetTop = node.offsetTop;
            let parentNode = node.offsetParent;
            while (parentNode && parentNode !== this.scrollDomRef) {
              offsetTop += parentNode.offsetTop;
              parentNode = parentNode.offsetParent;
            }
            this.scrollDomRef.scrollTop = offsetTop  < this.scrollDomRef.clientHeight/2 ? offsetTop : offsetTop - this.scrollDomRef.clientHeight / 2;
          }
        }, 200);
      });
    }
  }

  initData = (init: boolean = false) => {
    const { treeDs } = this.context.store;
    treeDs.query().then((res) => {
      if (res.datasetNodeList && res.datasetNodeList.length > 0) {
        const objectList: businessObject[] = [];
        const result: treeItem[] = [];
        const resultNew: any[] = [];
        res.datasetNodeList.forEach((node, index) => {
          const {
            nodeCode,
            nodeName,
            nodeId,
            nodeUuid,
            parentNodeUuid,
            parentNodeCode,
            datasetObjectList,
          } = node;
          const isHeaderNode = parentNodeUuid === '0';
          const color = BLOCK_COLOR[index % 5];
          const nodeItem: treeItem = {
            id: nodeUuid,
            name: nodeName,
            code: nodeCode,
            type: 'node',
            color,
            parentId: isHeaderNode ? undefined : parentNodeUuid,
            parentCode: parentNodeCode,
          };
          if (nodeCode === "XXXapprovalRecordRootXXX") {
           return;
          }
          result.push(nodeItem);
          if (datasetObjectList && datasetObjectList.length > 0) {
            const fields: businessObjectField[] = [];
            datasetObjectList.forEach((obj) => {
              const { objectCode, objectUuid, objectName, datasetFieldList } = obj;
              objectList.push({
                id: objectUuid,
                name: objectName,
                code: objectCode,
                parentId: nodeUuid,
                type: 'object',
              });
              if (datasetFieldList && datasetFieldList.length > 0) {
                datasetFieldList.forEach((field) => {
                  const { fieldId, fieldName, fieldCode, dataType, businessType, displayFieldCode, deprecatedFlag } = field;
                  const fieldItem = {
                    id: `${nodeUuid}_${fieldId}`,
                    name: `${fieldName}`,
                    parentName: objectName,
                    code: `${nodeCode}_${fieldCode}`,
                    parentId: nodeUuid,
                    parentCode: nodeCode,
                    type: 'field',
                    color,
                    dataType,
                    businessType,
                    displayFieldCode,
                    deprecatedFlag,
                  };
                  result.push(fieldItem);
                  fields.push(fieldItem);
                  if (!isHeaderNode) {
                    const fieldItemTmp = {
                      ...fieldItem,
                      id: `${fieldItem.id}#{index}`,
                      name: `${fieldName}#${intl.get('hrpt.reportDesign.view.title.sequence').d('序号')}`,
                      code: `${fieldItem.code}#{index}`,
                      _code_: fieldItem.code,
                    };
                    result.push(fieldItemTmp);
                    fields.push(fieldItemTmp);
                  }
                });
                nodeItem.fields = fields;
              }
            });
          }
          resultNew.push(nodeItem);
        });
        this.setState({
          objectList,
          treeData: result,
          treeDataList: resultNew,
          loadTreeData: arrayToTree(resultNew, 'id', 'parentId', 'children'),
          loading: false,
        });
        // treeDs 其他有用到, 
        treeDs.loadData(result);
        if (init) {
          treeDs.setState("initStatus", true);
        }
      }
    });
  };

  refreshTemplate = (data) => {
    const { state: { templateId }, refreshReport, updateState, } = this.context.store;
    updateState({ templateId: data && data.currentTemplateId ? data.currentTemplateId : templateId });
    if (refreshReport) {
      refreshReport(data);
    }
  };

  handleAddField = (nodeId) => {
    const { state: { templateId } } = this.context.store;
    const { objectList } = this.state;
    let targetObjectList: businessObject[] = [];
    if (objectList && objectList.length > 0) {
      targetObjectList = objectList.filter((obj) => obj.parentId === nodeId);
    }
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.addField').d('添加字段'),
      style: {
        width: '800px',
      },
      className: styles['field-select-modal'],
      children: (
        <AddFieldModal
          templateId={templateId}
          onRef={this.handleAddFieldRef}
          objectList={targetObjectList}
          handleRefresh={this.handleRefresh}
        />
      ),
      onOk: this.handleAddFieldSubmit,
    });
  };

  handleAddFieldRef = (ref) => {
    this.addFieldModalRef = ref;
  };

  handleAddFieldSubmit = async () => {
    if (this.addFieldModalRef && this.addFieldModalRef.submit) {
      const flag = await this.addFieldModalRef.submit();
      return flag;
    }
  };

  handleRefresh = (data) => {
    const { state: { templateId }, treeDs } = this.context.store;
    if (data && data.currentTemplateId !== templateId) {
      this.refreshTemplate(data);
      treeDs.setQueryParameter('datasetId', data.datasetId);
    }
    this.initData();
  };

  onTreeNode = (props) => {
    return {
      ...props,
      disabled: props.record && props.record.get("deprecatedFlag"),
    };
  }

  @debounce(300)
  handleSearch(filterStr) {
    this.setState({ filterStr });
    const { treeDataList } = this.state;
    if (isNil(filterStr)) {
      this.setState({
        loadTreeData: arrayToTree(treeDataList, 'id', 'parentId', 'children'),
        expandedKeys: [],
      });
    } else {
      const { treeDataList } = this.state;
      const result: any[] = [];
      const expandedKeys: any[] = [];
      if (treeDataList.length > 0) {
        treeDataList.forEach((node) => {
          if (node.fields && node.fields.length > 0) {
            const fields =
              node.fields.filter((field) => 
                (!isNil(field.code) && field.code.toLowerCase().includes(filterStr.toLowerCase()))
                  || (!isNil(field.name) && field.name.toLowerCase().includes(filterStr.toLowerCase())) 
              );
            if (fields.length > 0) {
              expandedKeys.push(node.id);
              result.push({
                ...node,
                fields
              })
            }  
          }
        });
      }
      this.setState({
        loadTreeData: arrayToTree(result, 'id', 'parentId', 'children'),
        expandedKeys,
      });
    }
  }

  handleClickField = async(field) => {
    if (this.props.isPredefined) {
      return;
    }
    const { state: { wpsOffice } } = this.context.store;
    const { code, name, deprecatedFlag, _code_ } = field;
    if (!wpsOffice.app || deprecatedFlag) {
      return;
    }
    const text = `\${${name}}`;
    // 带序号的字段
    const isFieldIndex = code && code.endsWith('#{index}');
    // 获取新建字段的序号
    const index = await createNewDocumentFieldIndex(code, wpsOffice.app);
    const indexSuffix = isFieldIndex ? `#${index}` : '';
    // index为0表示该字段第一次添加，不需要加name后缀
    const nameSuffix = index ? `-${index}` : '';
    const { Selection } = wpsOffice.app.ActiveDocument.ActiveWindow;
    await Selection.InsertAfter({ Text: text });
    // 选区对象
    const end  = await Selection.Range.End;
    const documentFields = await wpsOffice.app.ActiveDocument.DocumentFields;
    const End = end || 0;
    const Start = End - text.length;
    await documentFields.Add({
      Name: `\${${code}}${nameSuffix}`,
      Range: { Start, End },
      Hidden: false, // 是否隐藏，默认 false
      PrintOut: true, // 是否可打印，默认 true
      ReadOnly: !indexSuffix, // 是否只读，默认 false
      Value: text,
    });
  };

  renderNodeTitle = (record) => {
    const { isPredefined } = this.props;
    const { activeFieldCode } = this.state;
    const { id, name, parentId, parentName, type, color, dataType, displayFieldCode, deprecatedFlag, code } = record
    if (type !== 'field') {
      return (
        <div className={styles['field-tree-node']}>
          <span>{getFieldSvg('header', color)}</span>
          <span
            className={classnames(
              'hrpt-sheet-design-field-tree-node',
              styles['field-tree-node-content']
            )}
          >
            {name}
          </span>
          {!isPredefined && (
            <Tooltip title={intl.get('hrpt.reportDesign.view.title.addField').d('添加字段')}>
              <H0Icon type="plus" onClick={() => this.handleAddField(id)} />
            </Tooltip>
          )}
        </div>
      );
    } else {
      return (
        <div
          data-code={code}
          data-parentId={parentId}
          className={classnames(styles['field-tree-node'], {
            [styles["deprecated-field"]]: !!deprecatedFlag,
          })}
        >
          <span>{getFieldSvg(dataType, color)}</span>
          <Tooltip title={displayFieldCode}>
            <span
              title={name}
              className={classnames(
                styles['field-tree-node-content'],
                styles['field-tree-leaf-node-content'],
                { [styles['field-tree-leaf-active-node-content']]: activeFieldCode === code },
              )}
              onClick={() => this.handleClickField(record)}
            >
              {parentName}.{name}
            </span>
          </Tooltip>
          {deprecatedFlag && (
            <Tooltip title={intl.get('hrpt.common.view.title.deprecatedField').d('该字段已在业务对象中删除，模板中该字段可能无法正常打印出值，如有需要请联系对象所属功能团队')}>
              <Icon type="help" className='deprecated-tip' />
            </Tooltip>
          )}
        </div>
      );
    }
  };

  handleExpand = (expandedKeys) => {
    this.setState({
      expandedKeys
    });
  };

  renderTree = (data, level) => {
    const { expandedKeys } = this.state;

    return data.map(item => (
      <div style={{ marginLeft: level === 0 ? 0 : '24px'  }}>
        <Tree 
          key={`tree-${item.id}`}
          expandedKeys={expandedKeys}
          onExpand={this.handleExpand}
        >
          <Tree.TreeNode
            key={item.id}
            title={this.renderNodeTitle(item)}
          >
            {item.fields && item.fields.length > 0 && item.fields.map(field => (
              <Tree.TreeNode disabled={field.deprecatedFlag} id={field.id} title={this.renderNodeTitle(field)} />
            ))}
          </Tree.TreeNode>
        </Tree>
        {item.children && item.children.length > 0 && this.renderTree(item.children, level + 1)}
      </div>
    ))
  };

  handleRef = ref => {
    this.fieldTreeRef = ref;
  };

  handleScrollDomRef = ref => {
    this.scrollDomRef = ref;
  };

  render() {
    const { loadTreeData, loading } = this.state;
    return (
      <Spin spinning={loading} wrapperClassName={styles['field-select-spin']}>
        <div className={styles['field-select']} ref={this.handleRef}>
          <div className={styles['field-input']}>
            <TextField
              placeholder={intl
                .get('hrpt.reportDesign.view.title.searchByFieldNameOrCode')
                .d('请输入字段编码或名称查询')}
              onInput={(event: any) => this.handleSearch(event.target.value)}
            />
          </div>
          <div className={styles['field-tree']} id="print-field-select" ref={this.handleScrollDomRef}>
            {this.renderTree(loadTreeData, 0)}
          </div>
        </div>
      </Spin>
    );
  }
}
