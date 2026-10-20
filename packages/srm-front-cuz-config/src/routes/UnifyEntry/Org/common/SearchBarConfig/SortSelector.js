/* eslint-disable prefer-destructuring */
/* eslint-disable no-shadow */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unknown-property */
import React, { Component } from 'react';
import classnames from 'classnames';
import { Menu, Dropdown, Tooltip, Popover } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { getSortUpIcon, getSortDownIcon, breakEventBubble } from '../../../../../utils/util';
import SortCondition from './SortCondition';
import styles from './index.less';

const SORT_MODE = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
};

const MULTI_CONDITION = '_multi_condition_';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortFieldCode: null,
      sortFlag: 'asc',
      multConditions: [],
      mode: SORT_MODE.SINGLE,
    };
    this.contentRef = null;
  }

  componentWillReceiveProps(nextProps) {
    if (!isEmpty(nextProps.currentFilter)) {
      const { refreshFlag } = this.state;
      const {
        filterCode,
        filterFields = [],
        defaultSortedField = '',
        defaultSortedOrder = 'asc',
      } = nextProps.currentFilter;

      const {
        filterCode: oldFilterCode,
        filterFields: oldFilterFields = [],
      } = this.props.currentFilter;
      if (
        oldFilterCode !== filterCode ||
        oldFilterFields.length !== filterFields.length ||
        nextProps.unitInfo.orderCount !== this.props.unitInfo.orderCount ||
        refreshFlag
      ) {
        const { orderCount = 1 } = nextProps.unitInfo || {};
        let mode =
          defaultSortedField && defaultSortedField.split(',').length > 1
            ? SORT_MODE.MULTIPLE
            : SORT_MODE.SINGLE;
        let multConditions = [];
        let sortFieldCode = defaultSortedField;
        let sortFlag = defaultSortedOrder || 'asc';
        if (mode === SORT_MODE.MULTIPLE) {
          if (orderCount === 1) {
            mode = SORT_MODE.SINGLE;
            sortFieldCode = defaultSortedField.split(',')[0];
            sortFlag = defaultSortedOrder.split(',')[0] || 'asc';
          } else if (defaultSortedField.split(',').length > orderCount) {
            sortFieldCode = defaultSortedField
              .split(',')
              .filter((_, index) => index <= orderCount - 1)
              .join(',');
            sortFlag = defaultSortedOrder
              .split(',')
              .filter((_, index) => index <= orderCount - 1)
              .join(',');
            multConditions = sortFieldCode.split(',').map((fieldCode, index) => ({
              id: index,
              fieldCode,
              fieldName:
                nextProps.originFields.length > 0
                  ? (nextProps.originFields.find((i) => i.fieldAlias === fieldCode) || {}).fieldName
                  : undefined,
              fieldSortBy: (defaultSortedOrder && defaultSortedOrder.split(',')[index]) || 'asc',
            }));
          } else {
            multConditions = defaultSortedField.split(',').map((fieldCode, index) => ({
              id: index,
              fieldCode,
              fieldName:
                nextProps.originFields.length > 0
                  ? (
                      nextProps.originFields.find((i) => i.get('fieldAlias') === fieldCode) || {}
                    ).get('fieldName')
                  : undefined,
              fieldSortBy: (defaultSortedOrder && defaultSortedOrder.split(',')[index]) || 'asc',
            }));
          }
        }
        if (this.contentRef) {
          this.contentRef.setState({
            multConditions,
            mode,
          });
        }
        this.setState({
          mode,
          multConditions,
          sortFieldCode,
          sortFlag,
        });
      }
    }
  }

  @Bind()
  handleClear(event) {
    event.stopPropagation();
    this.setState(
      {
        sortFieldCode: null,
        sortFlag: undefined,
      },
      () => {
        this.handleChangeFilterSort();
      }
    );
  }

  @Bind()
  handleToogleSortFlag() {
    if (this.props.disabled) {
      return;
    }
    this.setState(
      {
        sortFlag: this.state.sortFlag === 'desc' ? 'asc' : 'desc',
      },
      () => {
        this.handleChangeFilterSort();
      }
    );
  }

  @Bind()
  handleSelectField({ key, domEvent }) {
    if (key !== MULTI_CONDITION) {
      this.setState(
        {
          sortFieldCode: key,
          multConditions: [],
          mode: SORT_MODE.SINGLE,
        },
        () => {
          this.handleChangeFilterSort();
        }
      );
      if (this.contentRef) {
        this.contentRef.setState({
          multConditions: [{ id: 1 }],
        });
      }
    } else if (this.state.multConditions.length === 0) {
      this.setState({
        multConditions: [{ id: 1 }],
      });
    }
    domEvent.preventDefault();
    domEvent.stopPropagation();
  }

  @Bind()
  onDragEnd({ source, destination }) {
    if (!destination || !source || !destination) {
      return;
    }
    if (source.index === destination.index) {
      return;
    }
    const { multConditions } = this.state;
    const newMultConditions = [];
    multConditions.forEach((condition, index) => {
      if (index === source.index) {
        newMultConditions.push(multConditions[destination.index]);
      } else if (index === destination.index) {
        newMultConditions.push(multConditions[source.index]);
      } else {
        newMultConditions.push(condition);
      }
    });
    this.setState({
      multConditions: newMultConditions,
    });
  }

  @Bind()
  getSortableFields(fields) {
    if (!fields || fields.length < 1) {
      return [];
    }
    return fields
      .filter((field) => {
        const { custType, unitSortedFlag, sortedFlag } = field.get([
          'custType',
          'unitSortedFlag',
          'sortedFlag',
        ]);
        // 标准字段
        if (custType === 'STD') {
          return unitSortedFlag !== 0 && sortedFlag !== 0;
        } else {
          return sortedFlag === 1;
        }
      })
      .map((i) => i.toData());
  }

  @Bind()
  handleAddCondition() {
    const { multConditions } = this.state;
    let maxId = multConditions[0].id;
    multConditions.forEach((condition) => {
      if (maxId < condition.id) {
        maxId = condition.id;
      }
    });
    this.setState({
      multConditions: multConditions.concat({ id: maxId + 1 }),
    });
  }

  @Bind()
  handleRemoveCondition(condition) {
    const { id: conditionId } = condition;
    const { multConditions } = this.state;
    let neMultConditions = multConditions.filter((condition) => condition.id !== conditionId);
    if (neMultConditions.length === 0) {
      neMultConditions = [{ id: 1 }];
    }
    this.setState({
      multConditions: neMultConditions,
    });
  }

  @Bind()
  getSelectFields(condition) {
    const { multConditions } = this.state;
    const { originFields = [] } = this.props;
    const fields = this.getSortableFields(originFields);
    let filterFieldCodes = multConditions.map((i) => i.fieldCode);
    if (condition.fieldCode) {
      filterFieldCodes = filterFieldCodes.filter((i) => i !== condition.fieldCode);
    }
    return fields.filter((i) => !filterFieldCodes.includes(i.fieldAlias));
  }

  @Bind()
  handleMultipleConditionSortBy(condition) {
    // eslint-disable-next-line no-param-reassign
    condition.fieldSortBy = condition.fieldSortBy === 'desc' ? 'asc' : 'desc';
    this.setState({
      multConditions: this.state.multConditions.map((c) => (c.id === condition.id ? condition : c)),
    });
  }

  @Bind()
  handleChangePopverVisible(visible) {
    if (!visible) {
      setTimeout(() => {
        this.handleMultpleQuery();
      }, 0);
    }
  }

  @Bind()
  handleMultpleQuery() {
    if (this.contentRef) {
      this.setState(
        {
          multConditions: this.contentRef.state.multConditions,
          mode: this.contentRef.state.mode,
        },
        () => {
          this.handleChangeFilterSort();
        }
      );
    }
  }

  @Bind()
  handleChangeFilterSort() {
    const { currentFilter, filterList = [], dispatch, onRefresh, mode: pageMode, tplParams } = this.props;
    const { sortFieldCode, sortFlag, multConditions, mode } = this.state;
    let defaultSortedField = sortFieldCode;
    let defaultSortedOrder = sortFlag;
    if (
      mode === SORT_MODE.MULTIPLE &&
      multConditions &&
      multConditions.length > 0 &&
      multConditions.filter((i) => i.fieldCode).length > 0
    ) {
      defaultSortedField = multConditions
        .filter((i) => i.fieldCode)
        .map((i) => i.fieldCode)
        .join(',');
      defaultSortedOrder = multConditions
        .filter((i) => i.fieldCode)
        .map((i) => i.fieldSortBy || 'asc')
        .join(',');
    }
    const newFilterList = filterList.map((item) => {
      if (item.filterId === currentFilter.filterId) {
        return {
          ...item,
          defaultSortedField,
          defaultSortedOrder,
        };
      }
      return item;
    });
    dispatch({
      type: 'searchBarConfig/saveUnitFilter',
      params: newFilterList,
      mode: pageMode,
      tplParams,
    }).then((res) => {
      if (res) {
        notification.success();
        if (typeof onRefresh === 'function') {
          onRefresh();
        }
      }
    });
  }

  render() {
    const { originFields = [], unitInfo = {}, disabled } = this.props;
    const { orderCount = 1 } = unitInfo;
    const sortFields = this.getSortableFields(originFields);

    const { sortFieldCode, sortFlag, mode, multConditions } = this.state;

    const sortField =
      sortFields.length < 1 || !sortFieldCode
        ? {}
        : sortFields.find((item) => item.fieldAlias === sortFieldCode) || {};
    const SortUpIcon = getSortUpIcon();
    const SortDownIcon = getSortDownIcon();
    const conditions = multConditions.filter((i) => i.fieldCode);
    const multipleFlag = mode === SORT_MODE.MULTIPLE && conditions.length > 0;
    return (
      <div className={styles['table-header-right']}>
        <div className={styles['left-item']}>
          <div className={styles['left-item-label']}>
            {intl.get('hpfm.searchBar.model.searchBar.defaultSortField').d('默认排序字段')}
          </div>
          <div
            className={classnames(styles['left-item-content'], {
              [styles['left-item-content-disabled']]: disabled,
            })}
          >
            <Dropdown
              disabled={disabled}
              overlay={
                !disabled && (
                  <div onClick={breakEventBubble}>
                    <Menu onClick={this.handleSelectField}>
                      {sortFields.map((field) => (
                        <Menu.Item key={field.fieldAlias}>{field.fieldName}</Menu.Item>
                      ))}
                      {orderCount > 1 && (
                        <Menu.Item key={MULTI_CONDITION}>
                          <Popover
                            trigger="click"
                            content={
                              <SortCondition
                                ref={(ref) => {
                                  this.contentRef = ref;
                                }}
                                mode={mode}
                                multConditions={multConditions}
                                {...this.props}
                              />
                            }
                            placement="rightBottom"
                            onVisibleChange={this.handleChangePopverVisible}
                          >
                            <div style={{ width: 'calc(100% + 16px)' }}>
                              {intl
                                .get('hpfm.searchBar.view.label.multiConditionSorting')
                                .d('多条件排序')}
                              <Icon type="keyboard_arrow_right" />
                            </div>
                          </Popover>
                        </Menu.Item>
                      )}
                    </Menu>
                  </div>
                )
              }
              trigger={['click']}
            >
              {multipleFlag ? (
                <span className={styles['sort-control-multiple']}>
                  {conditions.map((condition, index) => (
                    <span key={condition.id}>
                      {index > 0 && condition.fieldCode && <span>、</span>}
                      <span>{condition.fieldName}</span>
                      <span style={{ margin: '0 4px' }}>
                        {condition.fieldSortBy === 'desc' ? getSortDownIcon() : getSortUpIcon()}
                      </span>
                    </span>
                  ))}
                  <Icon type="expand_more" className={styles['sort-expand']} />
                </span>
              ) : !sortFieldCode ? (
                <span className={styles['sort-placeholder']}>
                  {intl.get('hpfm.searchBar.view.placeholder.selectOrderBy').d('选择排序字段')}
                  <Icon type="expand_more" />
                </span>
              ) : (
                <span className={styles['sort-control']}>
                  {sortField.fieldName}
                  <Icon type="expand_more" className={styles['sort-expand']} />
                  <Icon type="close" className={styles['sort-clear']} onClick={this.handleClear} />
                </span>
              )}
            </Dropdown>
            {!multipleFlag && sortFieldCode && (
              <Tooltip
                title={
                  sortFlag === 'asc'
                    ? intl.get('hpfm.searchBar.view.tooltip.asc').d('升序')
                    : intl.get('hpfm.searchBar.view.tooltip.desc').d('降序')
                }
              >
                <span
                  disabled={disabled}
                  onClick={this.handleToogleSortFlag}
                  className={styles['sort-icon']}
                >
                  {sortFlag === 'desc' ? SortDownIcon : SortUpIcon}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  }
}
