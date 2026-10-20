/* eslint-disable camelcase */
import React, { Component } from 'react';
import classnames from 'classnames';
import { Tree, DataSet } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { isAppleDevice } from '../../functions';
import styles from './index.less';

export default class SendTarget extends Component {
  constructor(props) {
    super(props);

    this.state = { selectedNode: {} };
    this.selectedNodes = [];
    if (typeof props.onSelect === 'function') {
      props.onSelect(this.selectedNodes);
    }
    if (typeof props.onRef === 'function') {
      props.onRef(this);
    }
    this.treeDataSet = new DataSet({
      primaryKey: 'treeId',
      autoQuery: false,
      data: [],
      parentField: 'parentNodeId',
      expandField: 'expand',
      idField: 'treeId',
      checkField: 'treeNodeChecked',
      fields: [
        { name: 'treeId' },
        { name: 'parentNodeId' },
        { name: 'treeName' },
        { name: 'treeNodeChecked' },
      ],
    });
  }

  treeDataSet = null;

  UNSAFE_componentWillReceiveProps(props) {
    const { sendToList } = props;
    this.treeDataSet.loadData(sendToList);
    if (sendToList && sendToList.length && !this.selectedNodes.length) {
      this.selectedNodes = [sendToList[0]];
      this.setState({
        selectedNode: { [sendToList[0].treeId]: true },
      });
    }
  }

  nodeRenderer = (param, selectedNode) => {
    const { record, text } = param;
    const treeId = record.get('treeId');
    const isSelect = selectedNode[treeId];

    const cls = classnames(styles['smbl-send-to-board-tree-node'], {
      [styles['smbl-send-to-board-tree-node-selected']]: isSelect,
    });
    return (
      <span className={cls} onClick={(e) => this.didSelect(e, record)}>
        <Tooltip title={text}>
          <span className={styles['smbl-tree-node-name']}>{text}</span>
        </Tooltip>
        {isSelect && (
          <span className={styles['smbl-tree-node-current']}>
            {intl.get('smbl.chat.view.message.currentSendTo').d('当前')}
          </span>
        )}
      </span>
    );
  };

  // 选中的nodes
  selectedNodes = [];

  didSelect = (event, record) => {
    const { selectedNode } = this.state;
    const treeId = record.get('treeId');
    const otherKey = isAppleDevice() ? event.metaKey : event.ctrlKey;
    if (!otherKey) {
      // 单选
      const result = [];
      result.push(record.toData());
      this.selectedNodes = result;
    } else if (selectedNode[treeId]) {
      // 多选已选中，取消选中
      if (this.selectedNodes.length === 1) {
        // 只有一条不允许取消
        return;
      }
      this.selectedNodes = this.selectedNodes.filter((e) => e.treeId !== treeId);
    } else {
      // 多选未选中，添加
      const hitType = record.get('hitType');
      const result = this.selectedNodes.filter((e) => e.hitType === hitType);
      result.push(record.toData());
      this.selectedNodes = result;
    }

    const selectedNodeMap = {};
    this.selectedNodes.forEach((e) => {
      selectedNodeMap[e.treeId] = true;
    });

    this.setState({ selectedNode: selectedNodeMap });
    this.props.onSelect(this.selectedNodes);
  };

  // 清除选择
  clearSelect = () => {
    this.setState({ selectedNode: {} });
    this.props.onSelect([]);
  };

  render() {
    const { selectedNode } = this.state;
    return (
      <div className={styles['smbl-send-to-board']}>
        <Tree
          showLine={false}
          className={styles['smbl-send-to-tree']}
          selectable={false}
          multiple={false}
          showIcon={false}
          checkable
          draggable={false}
          titleField="treeName"
          dataSet={this.treeDataSet}
          renderer={(param) => this.nodeRenderer(param, selectedNode)}
          onTreeNode={({ record }) => ({
            isLeaf: record.get('isLeaf'),
            selectable: record.get('selectable'),
            checkable: record.get('checkable'),
          })}
        />
      </div>
    );
  }
}
