import React from 'react';
import { connect } from 'dva';
import { Tree } from 'hzero-ui';

const { TreeNode } = Tree;
@connect(({ ecAddressManage }) => ({
  ecAddressManage,
}))
export default class TreeList extends React.Component {
  loop = (data) =>
    data &&
    data.map((item) => {
      if (item.children && item.children.length) {
        return (
          <TreeNode
            dataRef={item}
            selectable={!item.isLeaf}
            isLeaf={item.isLeaf}
            key={item.regionCode}
            title={item.regionName}
          >
            {this.loop(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          dataRef={item}
          selectable={!item.isLeaf}
          isLeaf={item.isLeaf}
          key={item.regionCode}
          title={item.regionName}
        />
      );
    });

  /**
   * 展开子节点
   */
  onLoadData = (treeNode) => {
    return new Promise((resolve) => {
      if (treeNode.props.children) {
        resolve();
        return;
      }
      const {
        dispatch,
        ecAddressManage: { allList },
      } = this.props;
      const params = treeNode.props.dataRef.countryFlag
        ? {
            countryId: treeNode.props.dataRef.countryId,
            page: -1,
          }
        : {
            regionCode: treeNode.props.dataRef.regionCode,
            page: -1,
          };
      dispatch({
        type: 'ecAddressManage/fetchAllList',
        payload: params,
      }).then((res) => {
        // eslint-disable-next-line no-param-reassign
        treeNode.props.dataRef.children = res.content;
        dispatch({
          type: 'ecAddressManage/updateState',
          payload: {
            allList: [...allList],
          },
        });
        resolve();
      });
    });
  };

  /**
   * 地址节点选中
   * @param {String} key = 选中的key
   */
  onSelect = (key, e) => {
    const record = e.node.props.dataRef;
    this.props.setKey(key);
    if (record.countryFlag) {
      this.props.fetchList({ countryId: record.countryId }, record);
    } else {
      this.props.fetchList({ regionCode: record.regionCode }, record);
    }
  };

  /**
   * 地址导航栏展开收起
   * @param {Array} key = 展开的key
   */
  onExpand = (expandedKeys) => {
    this.props.onSelectChange(expandedKeys);
  };

  render() {
    return (
      <Tree
        onSelect={this.onSelect}
        loadData={this.onLoadData}
        expandedKeys={this.props.expandedKey}
        selectedKeys={this.props.regionLevel !== 1 ? this.props.selectedKey : []}
        onExpand={this.onExpand}
      >
        {this.loop(this.props.allList)}
      </Tree>
    );
  }
}
