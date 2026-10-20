import React, { Component } from 'react';
import { Checkbox } from 'hzero-ui';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isFunction, isArray } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { queryPurchaserPrequalGroups, querySupplierPrequalGroups } from './service';

import GroupItem from './GroupItem';
import SectionItem from './SectionItem';
import style from './index.less';

const promptCode = 'ssrc.common';
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['ssrc.common'] })
export default class PrequalPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      indeterminate: false,
      checkedAll: false, // 全选状态
      checkKeysMap: {}, // 勾选框key对象
      currentRecordKey: '',
      prequalGroupHeaders: [],
      mergeType: '',
    };
  }

  componentDidMount() {
    this.fetchPrequalGroupsData();
  }

  /**
   * 刷新内部state
   */
  refreshInternalState() {
    const { prequalGroupHeaders = [] } = this.state;
    const checkKeysMap = {};
    if (isArray(prequalGroupHeaders)) {
      prequalGroupHeaders.forEach((r) =>
        Object.assign(checkKeysMap, {
          [r.prequalGroupHeaderId]: false,
        })
      );
    }
    this.setState({
      checkKeysMap,
      indeterminate: false,
      checkedAll: false, // 全选状态
    });
  }

  /**
   * 查询资格预审分组数据
   */
  async fetchPrequalGroupsData() {
    const {
      type = 'supplier',
      queryParams = {},
      queryParams: { prequalGroupHeaderId },
    } = this.props;
    const params = {
      organizationId,
      ...queryParams,
    };
    let result;
    if (type === 'supplier') {
      result = getResponse(await querySupplierPrequalGroups(params));
    } else {
      result = getResponse(await queryPurchaserPrequalGroups(params));
    }
    if (result) {
      const { prequalGroupHeaders = [] } = result;
      const checkKeysMap = {};
      if (isArray(prequalGroupHeaders)) {
        prequalGroupHeaders.forEach((r) =>
          Object.assign(checkKeysMap, {
            [r.prequalGroupHeaderId]: false,
          })
        );
      }
      this.setState({
        checkKeysMap,
        prequalGroupHeaders,
        mergeType: result.mergeType,
        currentRecordKey: prequalGroupHeaderId || prequalGroupHeaders?.[0]?.prequalGroupHeaderId,
      });
    }
  }

  /**
   * 全选
   */
  @Bind()
  handleChangeCheckAll(e) {
    const { afterChangeCheckbox } = this.props;
    const { checkKeysMap } = this.state;
    const copyMap = {
      ...checkKeysMap,
    };
    Object.keys(copyMap).forEach((key) => {
      Object.assign(copyMap, {
        [key]: e.target.checked,
      });
    });
    this.setState({
      indeterminate: false,
      checkedAll: e.target.checked,
      checkKeysMap: copyMap,
    });
    if (isFunction(afterChangeCheckbox)) {
      afterChangeCheckbox(e.target.checked ? Object.keys(copyMap) : []);
    }
  }

  @Bind()
  handleChangeCheck(e, prequalGroupHeaderId) {
    const { afterChangeCheckbox } = this.props;
    const { checkKeysMap = {}, prequalGroupHeaders = [] } = this.state;
    const copyMap = {
      ...checkKeysMap,
    };
    Object.assign(copyMap, {
      [prequalGroupHeaderId]: e.target.checked,
    });
    const allCheckLength = Object.keys(checkKeysMap)?.length;
    const filterCheckedList = Object.keys(copyMap).filter((key) => copyMap[key]);
    const filterCheckedLength = filterCheckedList.length;
    this.setState({
      indeterminate: filterCheckedLength && filterCheckedLength < allCheckLength,
      checkedAll: filterCheckedLength === prequalGroupHeaders?.length,
      checkKeysMap: {
        ...copyMap,
      },
    });
    if (isFunction(afterChangeCheckbox)) {
      afterChangeCheckbox(filterCheckedList);
    }
  }

  /**
   * 切换选项
   * @param {!Object} item - 当前选项
   */
  @Bind()
  async handleChangeItem(item) {
    const { showCheckBoxFlag, validateDataBeforeChangeItem, afterChangeItem } = this.props;
    const { currentRecordKey } = this.state;
    if (showCheckBoxFlag || currentRecordKey === item.prequalGroupHeaderId) return;
    if (isFunction(validateDataBeforeChangeItem)) {
      const changeFlag = await validateDataBeforeChangeItem(item);
      if (changeFlag) {
        this.setState({
          currentRecordKey: item.prequalGroupHeaderId,
        });
        // eslint-disable-next-line no-unused-expressions
        isFunction(afterChangeItem) && afterChangeItem(item);
      }
    }
  }

  // 渲染全部合并方式
  renderMergeTypeByAll() {
    return (
      <React.Fragment>
        <div className={style['header-wrapper']}>
          <h2>{intl.get(`${promptCode}.view.title.projectSection`).d('项目标段')}</h2>
          <span>
            {intl
              .get(`${promptCode}.view.title.allSectionWithSamePrequal`)
              .d('所有标段统一资格预审')}
          </span>
        </div>
        <div className={style['list-container']}>
          <div className={classNames(style['list-item'], style['item-active'])}>
            <span className={style['list-item-content']}>
              {intl.get(`${promptCode}.view.message.allSection`).d('全部标段')}
            </span>
          </div>
        </div>
      </React.Fragment>
    );
  }

  // 渲染分组合并方式
  renderMergeTypeByGroup() {
    const { showCheckBoxFlag, validateDataBeforeChangeItem } = this.props;
    const { checkKeysMap, currentRecordKey, prequalGroupHeaders = [] } = this.state;
    const itemProps = {
      checkKeysMap,
      showCheckBoxFlag,
      currentRecordKey,
      validateDataBeforeChangeItem,
      onChangeCheck: this.handleChangeCheck,
      onChangeItem: this.handleChangeItem,
    };
    return (
      <React.Fragment>
        <div className={style['header-wrapper']}>
          <h2>{intl.get(`${promptCode}.view.title.projectSection`).d('项目标段')}</h2>
          <span>
            {intl
              .get(`${promptCode}.view.title.projectSectionMergeByGroup`)
              .d('项目标段分组资格预审')}
          </span>
        </div>
        <div className={style['list-container']}>
          {showCheckBoxFlag && this.renderSelectedAll()}
          {prequalGroupHeaders?.map((item, index) => {
            return (
              <div key={item.sourceProjectId}>
                <GroupItem item={item} index={index} {...itemProps} />
              </div>
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  // 渲染全选
  renderSelectedAll() {
    const { indeterminate, checkedAll } = this.state;
    return (
      <div className={style['list-item-check']}>
        <Checkbox
          indeterminate={indeterminate}
          onChange={this.handleChangeCheckAll}
          checked={checkedAll}
        >
          <span>{intl.get(`${promptCode}.view.button.selectAll`).d('全选')}</span>
        </Checkbox>
      </div>
    );
  }

  // 渲染标段合并方式
  renderMergeTypeBySection() {
    const { showCheckBoxFlag, validateDataBeforeChangeItem } = this.props;
    const { checkKeysMap, currentRecordKey, prequalGroupHeaders = [] } = this.state;
    const itemProps = {
      checkKeysMap,
      showCheckBoxFlag,
      currentRecordKey,
      validateDataBeforeChangeItem,
      onChangeCheck: this.handleChangeCheck,
      onChangeItem: this.handleChangeItem,
    };
    return (
      <React.Fragment>
        <div className={style['header-wrapper']}>
          <h2>{intl.get(`${promptCode}.view.title.projectSection`).d('项目标段')}</h2>
          <span>
            {intl
              .get(`${promptCode}.view.title.projectSectionMergeBySection`)
              .d('项目标段分别进行资格预审')}
          </span>
        </div>
        <div className={style['list-container']}>
          {showCheckBoxFlag && this.renderSelectedAll()}
          {prequalGroupHeaders?.map((item, index) => {
            return (
              <div key={item.sourceProjectId}>
                <SectionItem item={item} index={index} {...itemProps} />
              </div>
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  /**
   * 渲染分组 `ALL/SECTION/GROUP`
   */
  renderListWrapper() {
    const { mergeType } = this.state;
    switch (mergeType) {
      case 'ALL':
        return this.renderMergeTypeByAll();
      case 'SECTION':
        return this.renderMergeTypeBySection();
      case 'GROUP':
        return this.renderMergeTypeByGroup();
      default:
        return this.renderMergeTypeByGroup();
    }
  }

  render() {
    const { children, custClass = '', style: custStyle = {}, layoutType = 'left' } = this.props;
    return (
      <div
        className={classNames(style.container, custClass)}
        style={{ ...custStyle, flexDirection: layoutType === 'left' ? 'row' : 'row-reverse' }}
      >
        <div className={style['left-panel-list']}>{this.renderListWrapper()}</div>
        <div className={style['right-panel-content']}>{children}</div>
      </div>
    );
  }
}
