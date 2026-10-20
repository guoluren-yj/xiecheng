/**
 * 常用卡片配置
 * CommonUserTree
 * @date 2021-8-24
 * @author: Danica <ke.wang01@gonig-link.com>
 * @copyright © HAND 2019
 */

import React from 'react';
import { Bind } from 'lodash-decorators';
import { Modal, Tree, Row, Col, Card, message } from 'hzero-ui';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * @ReactProps {!Function} onFetchRoleCards - 查询已经分配的卡片
 */

export default class CommonUserTree extends React.Component {
  state = {
    addLoading: false,
    expandedKeys: [],
    autoExpandParent: true,
    // selectedKeys: [],
    allCheckedKeys: {},
  };

  componentDidUpdate(prevProps) {
    const prevCodes = prevProps.treeData.codes;
    const { codes = {}, tree = [] } = this.props.treeData;
    if (JSON.stringify(prevCodes) !== JSON.stringify(codes)) {
      const newCheckedKeys = [];
      for (const key in codes) {
        if (codes[key]) {
          newCheckedKeys.push(`${key}_child_${codes[key]}`);
        }
      }
      this.findTreeNode(tree);
    }
  }

  @Bind()
  findTreeNode(data) {
    data.map((item, index) => {
      if (item.children) {
        return this.findTreeNodeList(item.children, index);
      }
      return this.loadKey(item, index);
    });
  }

  @Bind()
  findTreeNodeList(data, parentIndex) {
    data.map((item) => {
      if (item.children) {
        return this.findTreeNodeList(item.children, parentIndex);
      }
      return this.loadKey(item, parentIndex);
    });
  }

  @Bind()
  loadKey(data, index) {
    if (this.props.treeData.codes[data.menuCode]) {
      const { allCheckedKeys } = this.state;
      allCheckedKeys[index] = [
        ...(allCheckedKeys[index] || []),
        `${data.menuCode}_child_${data.orderSeq}`,
      ];
      this.setState(allCheckedKeys);
    }
  }

  /**
   * 校验所选项
   */
  @Bind()
  checkValidity() {
    const { allCheckedKeys } = this.state;
    let checkList = [];
    for (const key in allCheckedKeys) {
      if (allCheckedKeys[key].length > 0) {
        checkList = [...checkList, ...allCheckedKeys[key]];
      }
    }
    checkList = checkList.filter((item) => item.indexOf('parent') === -1);
    if (!checkList || checkList.length === 0) {
      message.warning(
        intl.get(`spfm.dashboard.view.commonlyUsed.warning.002message`).d('请选择常用功能！')
      );
    } else if (checkList.length > 7) {
      message.warning(
        intl
          .get(`spfm.dashboard.view.commonlyUsed.warning.001message`)
          .d('选择的常用功能不能超过7个！')
      );
    } else {
      const tenantId = getCurrentOrganizationId();
      this.setState({
        addLoading: true,
      });
      const data = checkList.map((item) => {
        const itemAry = item.split('_child_');
        return {
          tenantId,
          menuCode: itemAry[0],
          orderSeq: itemAry[1],
        };
      });
      this.saveMenu(data);
    }
  }

  /**
   * 保存管理员配置的默认常用功能
   */
  @Bind()
  saveMenu(payload) {
    this.props
      .dispatch({
        type: 'commonUser/createMenu',
        payload: {
          payload,
          roleId: this.props.role.id,
        },
      })
      .then((res) => {
        if (res) {
          this.props.hideModal();
          this.setState({
            allCheckedKeys: {},
          });
        }
        this.setState({
          addLoading: false,
        });
      });
  }

  @Bind()
  onExpand(expandedKeys) {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  @Bind()
  onCheck = (index) => (checkedKeys) => {
    const { allCheckedKeys } = this.state;
    allCheckedKeys[index] = checkedKeys;
    this.setState(allCheckedKeys);
  };

  @Bind()
  renderTreeNodes(data) {
    return data.map((item) => {
      if (item.children) {
        return (
          <Tree.TreeNode title={item.title} key={`${item.menuCode}_parent`}>
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode {...item} key={`${item.menuCode}_child_${item.orderSeq}`} />;
    });
  }

  @Bind()
  handleCancel() {
    this.props.hideModal();
    this.setState({
      allCheckedKeys: {},
    });
  }

  @Bind()
  render() {
    const { autoExpandParent, expandedKeys, addLoading, allCheckedKeys } = this.state;
    const { visible, treeData } = this.props;
    const { tree = [] } = treeData;
    return (
      <Modal
        title={intl.get(`spfm.dashboard.model.commonlyUsed.modalTitle`).d('固定至常用功能')}
        onOk={this.checkValidity}
        visible={visible}
        onCancel={this.handleCancel}
        confirmLoading={addLoading}
        width={900}
        height={400}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        {tree.length === 0 ? (
          <Card loading={tree.length === 0} bordered={false} bodyStyle={{ padding: '0 20px' }} />
        ) : (
          <Row>
            {tree.map((item, index) => (
              <Col span={8} key={item.menuCode}>
                <Tree
                  checkable // 节点前添加 Checkbox 复选框
                  autoExpandParent={autoExpandParent} // 是否自动展开父节点
                  onExpand={this.onExpand} // 展开/收起节点时触发
                  expandedKeys={expandedKeys} // 展开指定的树节点
                  onCheck={this.onCheck(index)}
                  checkedKeys={allCheckedKeys[index]}
                >
                  {this.renderTreeNodes([item])}
                </Tree>
              </Col>
            ))}
          </Row>
        )}
      </Modal>
    );
  }
}
