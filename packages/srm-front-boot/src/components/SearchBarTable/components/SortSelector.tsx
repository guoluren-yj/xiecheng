/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
import React, { PureComponent } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Dropdown, Tooltip, Select, Button } from 'choerodon-ui/pro';
import { Icon, Menu, Popover } from 'choerodon-ui';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { Bind } from 'lodash-decorators';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';

import intl from '../../../utils/intl';
import type { filterProperties, fieldProperties } from '../util';
import { stylePrefix, SortFieldName, getSortUpIcon, getSortDownIcon, SORT_MODE, MULTI_CONDITION } from '../util';

interface ISortSelector {
  dataSet?: DataSet;
  filter: filterProperties; // 当前筛选器
  fields: fieldProperties[]; // 可排序的字段列表
  onRef: any;
  onAction: (onOk?: Function, onCancel?: Function) => void;
  orderCount: number;
}

@observer
export default class SortSelector extends PureComponent<ISortSelector, any> {

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectorHidden: true,
      sortFlag: 'asc',
      sortFieldCode: null,
      multConditions: [],
      multConditionsOrigin: [],
      mode: SORT_MODE.SINGLE,
    };
  }

  componentDidMount() {
    const { fields = [], filter } = this.props;
    this.handleSortConfig(filter, fields);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.filter.filterCode &&
      nextProps.filter.filterCode !== this.props.filter.filterCode
    ) {
      const { fields = [], filter } = nextProps;
      this.handleSortConfig(filter, fields);
    }
  }

  @Bind()
  handleReset() {
    const { fields = [], filter } = this.props;
    this.handleSortConfig(filter, fields);
  }

  @Bind()
  handleSortConfig(filter, fields) {
    const { orderCount = 1 } = this.props;
    const { defaultSortedField, defaultSortedOrder = 'asc' } = filter;
    const multipleFlag = defaultSortedField && defaultSortedField.split(',').length > 1;
    let multConditions = [];
    let mode = multipleFlag ? SORT_MODE.MULTIPLE : SORT_MODE.SINGLE;
    let sortFieldCode = fields.length > 0 ? defaultSortedField : undefined;
    let sortFlag = defaultSortedField && fields.length > 0 ? (defaultSortedOrder || 'asc') : 'asc';
    if (multipleFlag) {
      if (orderCount === 1) {
        mode = SORT_MODE.SINGLE;
        sortFieldCode = (defaultSortedField || '').split(',')[0];
        sortFlag = (defaultSortedField || 'asc').split(',')[0];
      } else if (defaultSortedField.split(',').length > orderCount) {
        sortFieldCode = defaultSortedField
          .split(',')
          .filter((_, index) => index <= orderCount - 1)
          .join(',');
        sortFlag = defaultSortedOrder
          .split(',')
          .filter((_, index) => index <= orderCount - 1)
          .join(',');
        multConditions =
          sortFieldCode
            .split(',')
            .map((fieldCode, index) => ({
              id: index,
              fieldCode,
              fieldName: fields.length > 0 ? (fields.find(i => i.name === fieldCode) || {}).label : undefined,
              fieldSortBy: (defaultSortedOrder && defaultSortedOrder.split(',')[index]) || 'asc',
            }));

      } else {
        multConditions =
          defaultSortedField
            .split(',')
            .map((fieldCode, index) => ({
              id: index,
              fieldCode,
              fieldName: fields.length > 0 ? (fields.find(i => i.name === fieldCode) || {}).label : undefined,
              fieldSortBy: (defaultSortedOrder && defaultSortedOrder.split(',')[index]) || 'asc',
            }));
      }
    }
    this.setState({
      multConditions,
      mode,
      sortFieldCode,
      sortFlag,
    });
  }

  @Bind()
  handleToogleSortFlag() {
    this.props.onAction(() => {
      const { sortFlag } = this.state;
      const newSortFlag = sortFlag === 'asc' ? 'desc' : 'asc';
      this.handleQuery('sortFlag', newSortFlag);
    });
  }

  @Bind()
  handleQuery(key, value) {
    const { dataSet } = this.props;
    if (dataSet && dataSet.current) {
      const sortFieldValue = dataSet.current.get(SortFieldName) || '';
      let sortFieldCode = sortFieldValue.split(',')[0].split(':')[0];
      let sortFlag = sortFieldValue.split(',').length > 1 ? 'asc' : sortFieldValue.split(',')[0].split(':')[1] || 'asc';
      if (key === 'sortFieldCode') {
        sortFieldCode = value;
      } else {
        sortFlag = value;
      }
      this.setState({
        sortFieldCode,
        sortFlag,
      });
      dataSet.current.set(SortFieldName, `${sortFieldCode}:${sortFlag}`);
    }
  }

  @Bind()
  handleSelectSortField({ key }) {
    if (key !== MULTI_CONDITION) {
      this.props.onAction(() => {
        this.setState({ selectorHidden: true, multConditions: [], mode: SORT_MODE.SINGLE });
        this.handleQuery('sortFieldCode', key);
      });
    } else if (this.state.multConditions.length === 0) {
      this.setState({
        multConditions: [{ id: 1 }],
      });
    }
  }

  @Bind()
  handleMultpleQuery() {
    const { multConditions } = this.state;
    const { dataSet } = this.props;
    if (dataSet && dataSet.current) {
      dataSet.current.set(SortFieldName,
        multConditions.filter(i => i.fieldCode).map(i => `${i.fieldCode}:${i.fieldSortBy || 'asc'}`).join(',')
      );
    }
  }

  @Bind()
  onDragEnd({ source, destination }: DropResult) {
    if (!destination || !source) {
      return;
    }
    if (source.index === destination.index) {
      return;
    }
    const { multConditions } = this.state;
    const newMultConditions: any[] = [];
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
  handleAddCondition() {
    const { multConditions } = this.state;
    let maxId = multConditions[0].id;
    multConditions.forEach(condition => {
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
    let neMultConditions = multConditions.filter(condition => condition.id !== conditionId);
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
    const { fields = [] } = this.props;
    let filterFieldCodes = multConditions.map(i => i.fieldCode);
    if (condition.fieldCode) {
      filterFieldCodes = filterFieldCodes.filter(i => i !== condition.fieldCode);
    }
    return fields.filter(i => !filterFieldCodes.includes(i.name));
  }

  @Bind()
  handleMultipleConditionSortBy(condition) {
    condition.fieldSortBy = condition.fieldSortBy === 'desc' ? 'asc' : 'desc';
    this.setState({
      multConditions: this.state.multConditions.map(c => c.id === condition.id ? condition : c),
    });
  }

  @Bind()
  handleMultipleConditionFieldChange(value, condition) {
    condition.fieldCode = value;
    condition.fieldName = (this.props.fields.find(f => f.name === value) || {}).label;
    this.setState({
      mode: SORT_MODE.MULTIPLE,
      multConditions: this.state.multConditions.map(c => c.id === condition.id ? condition : c),
    });
  }

  @Bind()
  handleChangePopverVisible(visible) {
    if (visible) {
      this.setState({
        multConditionsOrigin: JSON.parse(JSON.stringify(this.state.multConditions))
      });
    }
    if (!visible) {
      setTimeout(() => {
        this.props.onAction(() => {
          this.handleMultpleQuery();
        }, () => {
          this.setState({
            multConditions: this.state.multConditionsOrigin,
          });
        });
      }, 0);
    }
  }

  @Bind()
  renderMultiConditionContent() {
    const { multConditions } = this.state;
    const { orderCount = 1, fields = [] } = this.props;
    return (
      <div className={`${stylePrefix}-sort-multi`} onClick={event => event.stopPropagation()}>
        <div className={`${stylePrefix}-sort-multi-title`}>
          {intl
            .get('srm.filterBar.view.label.multiConditionSorting')
            .d('多条件排序')}
        </div>
        <DragDropContext
          onDragEnd={this.onDragEnd}
        >
          <div className={`${stylePrefix}-sort-list`}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {multConditions.map((condition, index) => (
                    <Draggable key={condition.id} draggableId={String(condition.id)} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          key={condition.id}
                        >
                          <div className={`${stylePrefix}-sort-list-item`}>
                            <span className={`${stylePrefix}-sort-list-item-drag-icon`}>
                              <Icon
                                type="baseline-drag_indicator"
                                {...provided.dragHandleProps}
                                style={{ cursor: 'move' }}
                              />
                            </span>
                            <span className={`${stylePrefix}-sort-list-item-select`}>
                              <Select
                                clearButton={false}
                                value={condition.fieldCode}
                                onChange={(value) => this.handleMultipleConditionFieldChange(value, condition)}
                              >
                                {this.getSelectFields(condition).map(item => (
                                  <Select.Option value={item.name} className={`${stylePrefix}-sort-menu-item`}>
                                    {item.label}
                                  </Select.Option>
                                ))}
                              </Select>
                            </span>
                            <span
                              className={`${stylePrefix}-sort-list-item-sort-icon`}
                              onClick={() => this.handleMultipleConditionSortBy(condition)}
                            >
                              {condition.fieldSortBy === 'desc' ? getSortDownIcon(18) : getSortUpIcon(18)}
                            </span>
                            <span className={`${stylePrefix}-sort-list-item-close-icon`}>
                              <Icon type='close' onClick={() => this.handleRemoveCondition(condition)} />
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
        <Button
          funcType={FuncType.link}
          color={ButtonColor.primary}
          disabled={multConditions.length === orderCount}
          className={`${stylePrefix}-sort-add`}
          onClick={this.handleAddCondition}
        >
          <Icon type='add' />
          <span className={`${stylePrefix}-sort-add-text`}>
            {intl
              .get('srm.filterBar.view.label.addCondition')
              .d('添加排序')}
          </span>
          <span>{multConditions.length}/{orderCount}</span>
        </Button>
      </div>
    );
  }

  @Bind()
  renderOverlayMenu() {
    const { fields = [], orderCount = 1 } = this.props;
    const { sortFieldCode } = this.state;
    const multiConditionContent = this.renderMultiConditionContent();
    return (
      <Menu
        onClick={this.handleSelectSortField}
        className={`${stylePrefix}-sort-menu`}
        defaultSelectedKeys={[sortFieldCode]}
      >
        {fields.map(item => (
          <Menu.Item key={item.name} className={`${stylePrefix}-sort-menu-item`}>
            {intl
              .get('srm.filterBar.view.label.orderByLabel', { name: item.label })
              .d(`按${item.label}`)}
          </Menu.Item>
        ))}
        {orderCount > 1 && (
          <Menu.Item key={MULTI_CONDITION} className={`${stylePrefix}-sort-menu-item`}>
            <Popover
              trigger="click"
              content={multiConditionContent}
              placement='right'
              onVisibleChange={this.handleChangePopverVisible}
            >
              {intl
                .get('srm.filterBar.view.label.multiConditionSorting')
                .d('多条件排序')}
              <Icon type="keyboard_arrow_right" />
            </Popover>
          </Menu.Item>
        )}
      </Menu>
    );
  }

  @Bind()
  handleClear(event) {
    event.stopPropagation();
    this.props.onAction(() => {
      this.setState({
        selectorHidden: true,
        sortFieldCode: null,
      });
      const { dataSet } = this.props;
      if (dataSet && dataSet.current) {
        dataSet.current.set(SortFieldName, undefined);
      }
    });
  }

  @Bind()
  handleChangeSelectorHidden(hidden) {
    this.setState({
      selectorHidden: hidden,
    });
  }

  render() {
    const { selectorHidden, sortFlag, sortFieldCode, mode, multConditions } = this.state;
    const { fields = [] } = this.props;
    const overlayMenu = this.renderOverlayMenu();
    const sortField =
      fields.length < 1 || !sortFieldCode
        ? {}
        : fields.find(item => item.name === sortFieldCode) || {};
    const SortUpIcon = getSortUpIcon();
    const SortDownIcon = getSortDownIcon();
    const conditions = multConditions.filter(i => i.fieldCode);
    const multipleFlag = mode === SORT_MODE.MULTIPLE && conditions.length > 0;
    return (
      <span className={`${stylePrefix}-sort`}>
        <Dropdown
          hidden={selectorHidden}
          onHiddenChange={this.handleChangeSelectorHidden}
          overlay={overlayMenu}
          placement={Placements.bottomRight}
          trigger={[Action.click]}
        >
          {multipleFlag ? (
            <span className={`${stylePrefix}-sort-control-multiple`}>
              {intl.get('srm.filterBar.view.label.orderBy').d('按')}{' '}
              {conditions.map((condition, index) => (
                <span key={condition.id}>
                  {index > 0 && condition.fieldCode && <span>、</span>}
                  <span>{condition.fieldName}</span>
                  <span style={{ margin: '0 4px' }}>{condition.fieldSortBy === 'desc' ? getSortDownIcon() : getSortUpIcon()}</span>
                </span>
              ))}
              <Icon type="expand_more" className={`${stylePrefix}-sort-expand`} />
            </span>
          ) : (
              !sortFieldCode ? (
                <span className={`${stylePrefix}-sort-placeholder`}>
                  {intl.get('srm.filterBar.view.placeholder.selectOrderBy').d('选择排序字段')}
                  <Icon type="expand_more" />
                </span>
              ) : (
                  <span className={`${stylePrefix}-sort-control`}>
                    {sortField.label
                      ? intl
                        .get('srm.filterBar.view.label.orderByLabel', { name: sortField.label })
                        .d(`按${sortField.label}`)
                      : ''}
                    <Icon type="expand_more" className={`${stylePrefix}-sort-expand`} />
                    <Icon
                      type="close"
                      className={`${stylePrefix}-sort-clear`}
                      onClick={this.handleClear}
                    />
                  </span>
                )
            )}
        </Dropdown>
        {!multipleFlag && sortFieldCode && (
          <Tooltip
            title={
              sortFlag === 'asc'
                ? intl.get('srm.filterBar.view.tooltip.asc').d('升序')
                : intl.get('srm.filterBar.view.tooltip.desc').d('降序')
            }
          >
            <span
              onClick={this.handleToogleSortFlag}
              className={`${stylePrefix}-sort-icon`}
            >
              {sortFlag === 'asc' ? SortUpIcon : SortDownIcon}
            </span>
          </Tooltip>
        )}
      </span>
    );
  }
}
