/* eslint-disable react/jsx-key */
import React, { Component, createRef } from 'react';
import { Tooltip, Tree, Modal, TextField, Icon, DataSet, Form, Select } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { Icon as H0Icon } from 'hzero-ui';
import { withRouter } from 'react-router-dom';
import { isNil } from 'lodash';
import { debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { getFieldSvg, BLOCK_COLOR } from '../utils/constant';
import styles from '../index.less';
import AddFieldModal from '../../components/AddFieldModal';
import Store from '../store';
import { exitEditMode, arrayToTree } from '../utils/utils';
import { processApproveFieldList } from './const';
import {
  saveApproveNode,
} from '../../../../../../services/dataSetService';

@withRouter
export default class FieldSelect extends Component {
  static contextType = Store;

  constructor(props) {
    super(props);
    this.dragFlag = false;
    this.dragNode = null;
    this.addFieldModalRef = createRef();
    this.state = {
      objectList: [], // 字段所属对象数组
      loadTreeData: [], // 树当前加载数据（搜索）
      treeDataList: [],
      expandedKeys: [],
    };
  }

  componentDidMount() {
    const { datasetId, treeDs } = this.context.store;
    treeDs.setQueryParameter('datasetId', datasetId);
    this.initData();
  }

  componentWillReceiveProps(_, nextConetxt) {
    if (nextConetxt.store.activeFieldCode && nextConetxt.store.activeFieldCode !== this.context.store.activeFieldCode) {
      this.handleExpandTreeNode(nextConetxt.store.activeFieldCode);
    }
  }

  handleExpandTreeNode = (fieldCode) => {
    const { treeDataList, expandedKeys } = this.state;
    if (treeDataList.length > 0) {
      treeDataList.forEach((node) => {
        if (node.fields && node.fields.length > 0) {
          const field = node.fields.find((field) => field.code === fieldCode);
          if (field && !expandedKeys.includes(node.id)) {
            this.setState({
              expandedKeys: expandedKeys.concat(node.id),
            });
          }
        }
      });
    }
  }

  initData = () => {
    const { treeDs } = this.context.store;
    treeDs.query().then((res) => {
      if (res.datasetNodeList && res.datasetNodeList.length > 0) {
        const objectList = [];
        const result = [];
        const resultNew = [];
        res.datasetNodeList.forEach((node, index) => {
          const {
            nodeCode,
            nodeName,
            nodeUuid,
            parentNodeUuid,
            parentNodeCode,
            datasetObjectList,
          } = node;
          const color = BLOCK_COLOR[index % 5];
          const nodeItem = {
            id: nodeUuid,
            name: nodeName,
            code: nodeCode,
            type: 'node',
            color,
            parentId: parentNodeUuid === '0' ? undefined : parentNodeUuid,
            parentCode: parentNodeCode,
          };
          if (nodeCode === "XXXapprovalRecordRootXXX") {
            nodeItem.type = 'approve';
            nodeItem.originObj = node;
            nodeItem.config = node.config;
          }
          else if (parentNodeCode === "XXXapprovalRecordRootXXX") nodeItem.type = 'approveState';
          result.push(nodeItem);
          if (nodeItem.type === 'approveState') {
            nodeItem.config = node.config;
            processApproveFieldList(nodeItem, result, resultNew);
            return;
          }
          if (datasetObjectList && datasetObjectList.length > 0) {
            const fields = [];
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
                });
                nodeItem.fields = fields;
              }
            });
          }
          resultNew.push(nodeItem);
        });
        this.setState({
          objectList,
          treeDataList: resultNew,
          loadTreeData: arrayToTree(resultNew, 'id', 'parentId', 'children'),
        });
        this.syncSheetCycleBlockName(result);
        // treeDs 其他有用到,
        treeDs.loadData(result);
      }
    });
  };

  syncSheetCycleBlockName = (list) => {
    const { sheetPartRef } = this.context.store;
    const { sheetRef } = sheetPartRef.current || {};
    if (sheetRef && sheetRef.setCycleBlockNameMap) {
      const nodeList = list.filter(i => i.type === 'node');
      if (nodeList.length) {
        const map = {};
        nodeList.forEach(node => {
          if (node.code) {
            map[node.code] = node.name;
          }
        });
        sheetRef.setCycleBlockNameMap(map);
      }
    }
  };

  refreshTemplate = (data) => {
    const { setTemplateId, refreshReport, templateId } = this.context.store;
    setTemplateId(data && data.currentTemplateId ? data.currentTemplateId : templateId);
    refreshReport(data);
  };

  handleMouseDown = (event) => {
    event.stopPropagation();
    const copyNode = event.target.cloneNode(true);
    copyNode.style.position = 'fixed';
    copyNode.style.zIndex = '10000';
    document.body.appendChild(copyNode);
    document.body.addEventListener('mousemove', this.handleMouseMove);
    document.body.addEventListener('mouseup', this.handleMouseUp);
    document.body.addEventListener('mouseleave', this.handleMouseUp);
    this.dragNode = copyNode;
    this.dragFlag = true;
  };

  handleMouseUp = (event) => {
    event.stopPropagation();
    const { sheetPartRef } = this.context.store;
    const { sheetRef } = sheetPartRef.current;
    document.body.removeEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('mouseup', this.handleMouseUp);
    document.body.removeEventListener('mouseleave', this.handleMouseUp);
    if (document.body.contains(this.dragNode)) {
      document.body.removeChild(this.dragNode);
    }
    this.dragFlag = false;
    this.dragNode = null;
    const selectContainer = document.querySelector("#print-field-select");
    if (selectContainer) {
      const { top, left, width, height } = selectContainer.getBoundingClientRect();
      if (event.pageX >= left && event.pageX <= left + width && event.pageY >= top && event.pageY <= top + height) {
        return;
      }
    }
    const mouse = sheetRef.mouseposition(event.pageX, event.pageY);
    const x = mouse[0] + document.querySelector('#luckysheet-cell-main').scrollLeft;
    const y = mouse[1] + document.querySelector('#luckysheet-cell-main').scrollTop;
    if (x > 0 && y > 0) {
      const row_location = sheetRef.rowLocation(y);
      const row_index = row_location[2];
      const col_location = sheetRef.colLocation(x);
      const col_index = col_location[2];
      const type = event.target.getAttribute('data-type');
      const id = event.target.getAttribute('data-id');
      const parentId = event.target.getAttribute('data-parentId');
      const parentCode = event.target.getAttribute('data-parentCode');
      const code = event.target.getAttribute('data-code');
      const name = event.target.getAttribute('data-name');
      const color = event.target.getAttribute('data-color');
      if (type !== 'field') {
        sheetRef.setCycleBlock(row_index, col_index, {
          id,
          parentId,
          parentCode,
          name,
          code,
          color,
          type: '1', // 1为纵向循环块，0为横向循环块，默认为1
        });
      } else {
        sheetRef.setCellValue(row_index, col_index, {
          // eslint-disable-next-line no-useless-escape
          v: `#\{${name}\}`,
          extra: {
            code,
            name,
            color,
            type: 'FIELD',
          },
        });
      }
    }
  };

  handleMouseMove = (event) => {
    if (this.dragFlag) {
      this.dragNode.style.left = `${event.clientX - 10}px`;
      this.dragNode.style.top = `${event.clientY - 10}px`;
    }
  };

  handleAddField = (nodeId) => {
    const { templateId } = this.context.store;
    const { objectList } = this.state;
    let targetObjectList = [];
    if (objectList && objectList.length > 0) {
      targetObjectList = objectList.filter((obj) => obj.parentId === nodeId);
    }
    exitEditMode();
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
    const { templateId, treeDs } = this.context.store;
    if (data && data.currentTemplateId !== templateId) {
      this.refreshTemplate(data);
      treeDs.setQueryParameter('datasetId', data.datasetId);
    }
    this.initData();
  };

  editingCycleBolck = (e) => {
    if (e.target && e.target.dataset.code) {
    const { sheetPartRef } = this.context.store;
    const { sheetRef } = sheetPartRef.current;
      const sheetFile = sheetRef.getAllSheets()[0];
      const targetCycleBlock = (sheetFile.cycleBlock || []).find(c => c.code === e.target.dataset.code);
      if (targetCycleBlock) {
        sheetRef.setCycleBlockEditing(targetCycleBlock);
      }
    }
  }

  onTreeNode = (props) => {
    return {
      ...props,
      disabled: props.record && props.record.get("deprecatedFlag"),
    };
  }

  @debounce(300)
  handleSearch(filterStr) {
    const { treeDataList } = this.state;
    if (isNil(filterStr)) {
      this.setState({
        loadTreeData: arrayToTree(treeDataList, 'id', 'parentId', 'children'),
        expandedKeys: [],
      });
    } else {
      const { treeDataList } = this.state;
      const result = [];
      const expandedKeys = [];
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
                fields,
              });
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

  renderNodeTitle = (record) => {
    const { isPredefined } = this.props;
    const { activeFieldCode, activeNodeId } = this.context.store;
    const { id, code, name, parentId, parentCode, parentName, type, color, dataType, displayFieldCode, deprecatedFlag } = record;
    if (type !== 'field') {
      const isApproveRoot = type === 'approve';
      const showAddField = type === 'node';
      return (
        <div
          className={classnames(styles['field-tree-node'], {
            [styles['field-tree-node-active']]: activeNodeId === id,
          })}
        >
          <span>{getFieldSvg('header', color)}</span>
          <span
            data-id={id}
            data-parentId={parentId}
            data-parentCode={parentCode}
            data-name={name}
            data-type={type}
            data-color={color}
            data-code={code}
            onClick={this.editingCycleBolck}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onMouseMove={this.handleMouseMove}
            className={classnames(
              'hrpt-sheet-design-field-tree-node',
              styles['field-tree-node-content']
            )}
          >
            {name}
          </span>
          {isApproveRoot && (
            <Tooltip title={intl.get('hrpt.reportDesign.view.title.approveNodeSetting').d('审批记录设置')}>
              <H0Icon type="setting" onClick={() => this.approveNodeSetting(record)} />
            </Tooltip>
          )}
          {showAddField && !isPredefined && (
            <Tooltip title={intl.get('hrpt.reportDesign.view.title.addField').d('添加字段')}>
              <H0Icon type="plus" onClick={() => this.handleAddField(id)} />
            </Tooltip>
          )}
        </div>
      );
    } else {
      return (
        <div
          className={classnames(styles['field-tree-node'], {
            [styles['field-tree-node-active']]: activeFieldCode === code,
            [styles["deprecated-field"]]: !!deprecatedFlag,
          })}
        >
          <span>{getFieldSvg(dataType, color)}</span>
          <Tooltip title={displayFieldCode}>
            <span
              title={name}
              className={styles['field-tree-node-content']}
              data-id={id}
              data-name={name}
              data-type={type}
              data-code={code}
              onMouseDown={this.handleMouseDown}
              onMouseUp={this.handleMouseUp}
              onMouseMove={this.handleMouseMove}
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
      expandedKeys,
    });
  };

  approveNodeSetting = (record) => {
    let config = {};
    if (record.config) {
      try {
        config = JSON.parse(record.config);
      } catch { /** */ }
    }
    const ds = new DataSet({
      fields: [
        {
          name: "onlyShowNewlyRecord",
          label: intl.get('hrpt.reportDesign.approveNodeSetting.onlyShowNewlyRecord').d('仅显示最新审批记录'),
          defaultValue: false,
          type: 'boolean',
        },
        {
          name: "sortOrder",
          label: intl.get('hrpt.reportDesign.approveNodeSetting.sortOrder').d('记录排序设置'),
          defaultValue: "ASC",
          type: 'string',
        },
      ],
    });
    ds.create(config);
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.approveNodeSetting').d('审批记录设置'),
      children: (
        <Form dataSet={ds} labelLayout="float">
          <Select name="onlyShowNewlyRecord" clearButton={false} disabled={this.props.isPredefined}>
            <Select.Option value>{intl.get("hzero.common.status.yes").d("是")}</Select.Option>
            <Select.Option value={false}>{intl.get("hzero.common.status.no").d("否")}</Select.Option>
          </Select>
          <Select name="sortOrder" clearButton={false} disabled={this.props.isPredefined}>
            <Select.Option value="ASC">{intl.get('hrpt.reportDesign.option.approveEndTimeAsc').d('审批时间正序')}</Select.Option>
            <Select.Option value="DESC">{intl.get('hrpt.reportDesign.option.approveEndTimeDesc').d('审批时间倒序')}</Select.Option>
          </Select>
        </Form>
      ),
      footer: (ok, cancel) => [cancel, !this.props.isPredefined && ok],
      onOk: () => {
        const { onlyShowNewlyRecord, sortOrder } = ds.current?.toJSONData();
        const newData = {
          ...record.originObj,
          config: JSON.stringify({ onlyShowNewlyRecord, sortOrder }),
        };
        saveApproveNode({ data: newData }).then(res => {
          if (getResponse(res)) {
            record.originObj = res;
            record.config = newData.config;
            notification.success();
            return true;
          }
          return false;
        });
      },
    });
  }
  renderTree = (data, level) => {
    const { expandedKeys } = this.state;

    return data.map(item => (
      <div style={{ marginLeft: level === 0 ? 0 : '24px' }}>
        <Tree
          key={`tree-${item.id}`}
          expandedKeys={expandedKeys}
          onExpand={this.handleExpand}
        >
          <Tree.TreeNode
            key={item.id}
            title={this.renderNodeTitle(item)}
            selectable={false}
          >
            {item.fields && item.fields.length > 0 && item.fields.map(field => (
              <Tree.TreeNode disabled={field.deprecatedFlag} id={field.id} title={this.renderNodeTitle(field)} />
            ))}
          </Tree.TreeNode>
        </Tree>
        {item.children && item.children.length > 0 && this.renderTree(item.children, level + 1)}
      </div>
    ));
  };

  render() {
    const { loadTreeData } = this.state;
    return (
      <div className={styles['field-select']}>
        <div className={styles['field-input']}>
          <TextField
            placeholder={intl
              .get('hrpt.reportDesign.view.title.searchByFieldNameOrCode')
              .d('请输入字段编码或名称查询')}
            onInput={(e) => this.handleSearch(e.target.value)}
          />
        </div>
        <div id="print-field-select" className={styles['field-tree']}>
          {this.renderTree(loadTreeData, 0)}
        </div>
      </div>
    );
  }
}
