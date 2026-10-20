/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { isEmpty } from "lodash";
import { Tooltip } from 'choerodon-ui/pro';
import { Tag, Tree } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { unitTypeColorMap } from '../../../../../utils/constConfig.js';
import {
  queryGroup,
} from '../../../../../services/customizeConfigService';

const TreeNode = Tree.TreeNode as any;

export default class PageTree extends Component<{
  menuCode?: string;
  unitTypeObj: any;
  // eslint-disable-next-line no-unused-vars
  onUnitChange: (unit: any, groupCode: string, forceUpdate?: boolean) => void,
  groupCode, unitCode, firstLoadFlag
}, any> {

  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [],
      expandKeys: [],
      treeLoading: true,
      currentGroupCode: '',
      unitGroup: [],
    };
  }

  init() {
    this.setState({ treeLoading: true });
    queryGroup({ menuCode: this.props.menuCode }).then(res => {
      if (getResponse(res)) {
        const unitGroup = res.map(group => ({
          ...group,
          units: (group.units || []).filter(unit => unit.enableFlag),
          __isGroup__: true,
        })).filter(group => group.units.length > 0);
        unitGroup.forEach(group => {
          if (group.units) {
            group.units.sort((p, n) =>
              (p.unitName || '').localeCompare(n.unitName || '', 'zh-Hans-CN')
            );
          }
        });
        unitGroup.sort((p, n) => (p.groupName || '').localeCompare(n.groupName || '', 'zh-Hans-CN'));
        const { menuCode, groupCode, unitCode, firstLoadFlag = [] } = this.props;
        if(menuCode && groupCode && unitCode && !firstLoadFlag.includes("group")) {
          this.setState({
            unitGroup,
            currentGroupCode: groupCode,
            selectedKeys: [unitCode],
            expandKeys: [groupCode],
          }, this.scrollToSelected);
          firstLoadFlag.push("group");
        } else {
          let currentUnit: any = {};
          let groupCode: string = '';
          const currentUnitGroup = unitGroup.find(g => {
            // if(!g.enabledFlag) return false;
            const unit = (g.units || []).find(u => !u.tplUsedFlag) || {};
            if (unit.id) {
              currentUnit = unit;
              // eslint-disable-next-line prefer-destructuring
              groupCode = g.groupCode;
              return true;
            }
            return false;
          }) || {};
          this.props.onUnitChange(currentUnit, groupCode);
          this.setState({
            unitGroup,
            currentGroupCode: currentUnitGroup.groupCode,
            selectedKeys: currentUnit.id !== undefined ? [currentUnit.unitCode] : [],
            expandKeys: [currentUnitGroup.groupCode],
          });
        }
      }
    }).finally(() => {
      this.setState({ treeLoading: false });
    });
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    if (this.props.menuCode && this.props.menuCode !== prevProps.menuCode) {
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

  renderUnitsTree = (_children: any[] = []) => {
    const { unitTypeObj } = this.props;
    return _children.map(unit => {
      const { unitName, unitType, unitCode, tplUsedFlag } = unit;
      let title = (
        <div className='customize-treenode-wrapper'>
          <div>
            <Tag color={unitTypeColorMap[unitType]}>{unitTypeObj[unitType]}</Tag>
            <Tooltip title={unitName}>
              {unitName}
            </Tooltip>
          </div>
        </div>
      );
      if (tplUsedFlag) {
        title = (
          <Tooltip placement="bottom" title={intl.get("hpfm.customize.common.tip.unitUsedByTpl").d("该单元已用于“单据样式定制”功能，请至“单据样式定制”进行配置")}>
            {title}
          </Tooltip>
        );
      }
      return (
        <TreeNode
          dataRef={unit}
          disabled={!!tplUsedFlag}
          title={title}
          key={unitCode}
        />
      );
    });
  };

  onSelectKey = (selectedKeys, e) => {
    const { dataRef } = e.node;
    if (!selectedKeys[0]) return;
    this.props.onUnitChange(dataRef, this.state.currentGroupCode);
    this.setState({ selectedKeys });
  }

  changeGroup = (groupCode) => {
    if (!groupCode) return;
    const { unitGroup, currentGroupCode } = this.state;
    const group = (unitGroup || []).find(p => p.groupCode === groupCode);
    // 无法复现，推测是切换菜单时，两次单元组查询中，首次查询的返回时间晚于二次查询，导致单元组和实际单元编码不匹配
    if (!group) return;
    const unit = (group.units || []).find(u => !u.tplUsedFlag) || {};
    const changeUnitFlag = currentGroupCode !== groupCode;
    this.setState({
      currentGroupCode: groupCode,
      selectedKeys: unit.id !== undefined ? [unit.unitCode] : [],
      expandKeys: this.state.expandKeys.includes(groupCode) ? this.state.expandKeys.filter(code => code !== groupCode) : [this.state.expandKeys, groupCode],
    });
    this.props.onUnitChange(changeUnitFlag ? unit : null, groupCode);
  }

  selectGroupAndUnit = (selectedKeys, e) => {
    const { dataRef } = e.node;
    // 避免loading和暂无数据时报错
    if (!dataRef) return;
    if (dataRef.__isGroup__) {
      if (!selectedKeys.length) return;
      this.changeGroup(dataRef.groupCode);
    } else {
      let forceUpdate = false;
      if (!selectedKeys.length) {
        // eslint-disable-next-line prefer-destructuring, no-param-reassign
        selectedKeys = this.state.selectedKeys;
        forceUpdate = true;
      }
      if (!selectedKeys.length) return;
      this.props.onUnitChange(dataRef, this.state.currentGroupCode, forceUpdate);
      this.setState({ selectedKeys });
    }
  }

  onExpandGroup = (keys) => {
    this.setState({ expandKeys: keys });
  }

  scrollToSelected = () => {
    setTimeout(() => {
      const tree = document.querySelector("#unit-tree-container-cusz");
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

  render() {
    const { treeLoading, unitGroup } = this.state;
    if (!unitGroup || unitGroup.length === 0) {
      return (
        <div className="no-data-block">
          {intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
        </div>
      );
    }
    return (
      <Tree
        multiple={false}
        expandedKeys={this.state.expandKeys}
        selectedKeys={this.state.selectedKeys}
        showLine={{ showLeafIcon: false }}
        onSelect={this.selectGroupAndUnit}
        onExpand={this.onExpandGroup}
        showIcon={false}
      >
        {unitGroup.map(group => (
          <TreeNode
            dataRef={group}
            title={group.groupName}
            key={group.groupCode}
          >
            {
              treeLoading ? <TreeNode key={`${group.groupCode}_loading`}>Loading...</TreeNode>
                : group.units && group.units.length > 0
                  ? this.renderUnitsTree(group.units)
                  : <TreeNode key={`${group.groupCode}_empty`}>{intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}</TreeNode>
            }
          </TreeNode>
        ))}
      </Tree>
    );
  }
}
