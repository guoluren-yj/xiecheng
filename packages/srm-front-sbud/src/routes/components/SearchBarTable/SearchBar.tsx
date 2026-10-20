/* eslint-disable no-unused-vars */
/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */
import type { MouseEvent } from 'react';
import React, { Component } from 'react';
import classnames from 'classnames';
import { DataSet, Button, Tooltip, TextField } from 'choerodon-ui/pro';
import { Divider, Icon } from 'choerodon-ui';
import type { Buttons } from 'choerodon-ui/pro/lib/table/interface';
import type { TableMode } from 'choerodon-ui/pro/lib/table/enum';
import { Bind } from 'lodash-decorators';
import {
  isEmpty,
} from 'lodash';
import { observer } from 'mobx-react';

import intl from 'srm-front-boot/lib/utils/intl';

import {
  filterNullValueObject,
} from 'hzero-front/lib/utils/utils';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import CollapseUpIcon from '../../../assets/collapse_up.svg';
import RefreshIcon from '../../../assets/refresh.svg';

import TableButtonRenderer from './components/TableButtonRenderer';
// import CollpaseFilter from './components/CollpaseFilter';
// import FilterSeletor from './components/FilterSeletor';
// import FieldSelector from './components/FieldSelector';
import Field from './components/Field';
// import SortSelector from './components/SortSelector';
import { SearchInputDS } from './store';
import type {
  searchBarConfigProperties,
} from './util';
import {
  stylePrefix,
  getContext,
  transformNilValue,
  getFieldWidget,
} from './util';
import './index.less';

interface SearchBarProps extends searchBarConfigProperties {
  cacheState?: boolean; // 是否缓存筛选器, 为true则开启缓存
  onRef?: (elem: any) => any; // searchBar ref
  dataSet: DataSet; // table DataSet
  tableButtons?: Buttons[]; // table buttons
  tableRef?: any;
  queryFields?: any;
  queryDataSet?: DataSet;
  tableMode?: TableMode;
  queryFieldsLimit?: Number;
  cacheFlag?: Boolean; // 是否缓存分页查询
}
@formatterCollections({ code: ['srm.filterBar'] })
@observer
export default class SearchBar extends Component<SearchBarProps, any> {

  searchInputDs: DataSet; // 合并查询输入框dataSet

  customizeDs: DataSet; // 自定义区域关联dataSet

  computedFieldMap = new Map();

  sortSelectorRef;

  contextParams: any;

  cleanFlag: boolean;

  constructor(props) {
    super(props);
    const { defaultExpand, fuzzyQueryCode } = props;
    // 查询区域展开收起标识, true-展开, false-收起, 关闭筛选器切换功能默认收起, 其他情况默认展开
    const expand = !defaultExpand ? false : transformNilValue(defaultExpand, true);
    this.searchInputDs = new DataSet(SearchInputDS(fuzzyQueryCode));
    this.customizeDs = new DataSet();
    this.contextParams = {
      ctx: getContext(),
    };
    this.cleanFlag = false; // 清空操作标识
    this.state = {
      expand, // 查询区域展开收起标识
      // fields: [], // 所有查询字段列表
      // originFields: [], // fields 备份，以便还原
      // displayFields: [], // 显示的查询字段列表
      // optionalFields: [], // 可选的查询字段列表
      // invisibleFields: [], // 不显示的查询字段列表
      // sortableFields: [], // 可排序的查询字段列表
      // currentFilter: {}, // 当前选择的筛选器
      changeFlag: false, // 当前筛选器是否发生更改
      // sortedEnabled: false, // 是否开启排序
      currentField: {}, // 正在编辑的字段
      // initFlag: true,
    };
  }

  static defaultProps = {
    queryDataSet: new DataSet(),
    queryFieldsLimit: 3,
    closeMergeSearchInput: false,
    defaultExpand: true,
    expandable: true,
    showLoading: true,
  };

  get queryFields(): any[] {
    const { queryDataSet } = this.props;
    const originQueryFields = ([] as any[]);
    /* eslint-disable no-unused-expressions */
    queryDataSet?.fields.forEach((field: any) =>{
      originQueryFields.push({
        ...field.pristineProps,
        fieldWidget: getFieldWidget(field),
        multipleFlag: field.get('multipleFlag') || !isEmpty(field.get('range')) ? 1: 0,
      });
    });
    return originQueryFields;
  }

  componentDidMount() {
    this.initConfig();
    this.addEventListener();
    this.handleRef();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.queryDataSet && nextProps.queryDataSet !== this.props.queryDataSet) {
      this.removeEventListener();
      this.searchInputDs.reset();
      setTimeout(()=>{
        this.addEventListener();
      }, 50);
    }
  }

  componentWillUnmount() {
    this.removeEventListener();
  }

  @Bind()
  handleQuery(){
    const { dataSet, cacheFlag } = this.props;
    dataSet.query( cacheFlag ? dataSet.currentPage : undefined);
  }

  /**
   * 注册DS事件监听
   */
  @Bind()
  addEventListener() {
    const { queryDataSet = this.customizeDs } = this.props;
    this.searchInputDs.addEventListener('update', this.handleSearchInputDsUpdate);
    queryDataSet.addEventListener('update', this.handlequeryDsUpdate);
  }

  /**
   * 移除DS事件监听
   */
  @Bind()
  removeEventListener() {
    const { queryDataSet = this.customizeDs } = this.props;
    this.searchInputDs.removeEventListener('update', this.handleSearchInputDsUpdate);
    queryDataSet.removeEventListener('update', this.handlequeryDsUpdate);
  }

  @Bind()
  handleSearchInputDsUpdate({ name, value, record }){
    const { dataSet, fuzzyQueryCode, fuzzyQueryMultipleFlag } = this.props;
    if (name === fuzzyQueryCode) {
      if(!record.dirty){
        this.setState({
          changeFlag: false,
        });
      }else{
        this.setState({
          changeFlag: true,
        });
      }
      if(fuzzyQueryMultipleFlag){
        dataSet.setQueryParameter(name, value ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',') : undefined,);
        if(value && value.some(ele => ele.includes(' '))){
          record.set(name, value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',').split(','))
        }
      }else{
        dataSet.setQueryParameter(name, value);
      }
      this.handleQuery();
    }
  }

  @Bind()
  handlequeryDsUpdate({ record }){
    if(!record.dirty){
      this.setState({
        changeFlag: false,
      });
    }else{
      this.setState({
        changeFlag: true,
      });
    }
    this.handleQuery();
  }

  /**
   * 初始化配置
   */
  @Bind()
  initConfig() {
    //  searchInputDs
    const { dataSet, fuzzyQueryCode, fuzzyQueryMultipleFlag } = this.props;
    if(dataSet.queryParameter && fuzzyQueryCode && dataSet.queryParameter[fuzzyQueryCode]){
      if(fuzzyQueryMultipleFlag){
        this.searchInputDs.create({ [fuzzyQueryCode]: dataSet.queryParameter[fuzzyQueryCode]?.split(',') });
      }else{
        this.searchInputDs.create({ [fuzzyQueryCode]: dataSet.queryParameter[fuzzyQueryCode] });
      }
      this.setState({
        changeFlag: true,
      });
    }
  }

  @Bind()
  handleRefresh(event: MouseEvent) {
    if (event.target) {
      const iconEl: HTMLElement =
        (event.target as HTMLElement).querySelector('i') || (event.target as HTMLElement);
      if (iconEl) {
        iconEl.style.animation = 'none';
        setTimeout(() => {
          iconEl.style.animation = 'rotateImg 0.3s linear';
        }, 100);
      }
    }
    this.handleQuery();
  }

  @Bind()
  handleRef() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  @Bind()
  handleExpand() {
    this.setState({
      expand: !this.state.expand,
      // 展开收起时，重置 currentField
      currentField: {},
    });
  }

  /**
   * 清空筛选器字段值
   */
  @Bind()
  handleCleanFilter() {
    // 清空
    const { dataSet, queryDataSet, fuzzyQueryCode } = this.props;
    queryDataSet?.current?.reset();
        /* eslint-disable no-unused-expressions */
    if(fuzzyQueryCode){
      this.searchInputDs.reset();
      dataSet.setQueryParameter(fuzzyQueryCode, undefined);
    }
    this.setState({
      changeFlag: false,
    });
    this.handleQuery();
  }

  /**
   * 重置筛选器字段值
   */
  @Bind()
  handleResetFilter() {
    // 重置
    const { dataSet, queryDataSet, fuzzyQueryCode } = this.props;
    queryDataSet?.current?.reset();
        /* eslint-disable no-unused-expressions */
    if(fuzzyQueryCode){
      this.searchInputDs.reset();
      dataSet.setQueryParameter(fuzzyQueryCode, undefined);
    }
    this.setState({
      changeFlag: false,
    });
    this.handleQuery();
  }


  @Bind()
  checkDataSetBeforeAction() {

  }

  /**
  * 筛选字段选择回调
  * @param field 当前选中的字段
  */
  @Bind()
  handleSelectField() {

  }

  // /**
  // * 筛选字段全选回调
  // */
  // @Bind()
  // handleSelectAllField(selectFields: fieldProperties[]) {

  // }

  @Bind()
  renderFields() {
    const { expandable = true, dataSet } = this.props;
    const { currentField } = this.state;
    return (
      <div>
        {(!expandable) ? (
          <>
            {this.renderCustomLeft()}
            {this.renderFuzzyQueryInput()}
          </>
        ) : null}
        {!isEmpty(this.queryFields) &&
          this.queryFields.map(field => (
            <Field
              key={field.name}
              autoFocus={currentField.name === field.name}
              dataSet={dataSet.queryDataSet}
              field={field}
              onDelete={this.handleSelectField}
              onAction={this.checkDataSetBeforeAction}
            />
        ))}
        {/* <FieldSelector
          displayFields={displayFields}
          optionalFields={optionalFields}
          queryDs={this.queryDs}
          onClearSelected={this.handleClearSelected}
          onAllSelected={this.handleSelectAllField}
          onSelectField={this.handleSelectField}
          onAction={this.checkDataSetBeforeAction}
        /> */}
        {(!expandable) ?
          this.renderFixButtons() : null
        }
      </div>
    );
  }

  // 模糊查询
  @Bind()
  renderFuzzyQueryInput() {
    const { closeMergeSearchInput, fuzzyQueryCode, fuzzyQueryPlaceholder, fuzzyQueryName, fuzzyQueryMultipleFlag } = this.props;
    if (closeMergeSearchInput) {
      return null;
    }

    if (isEmpty(fuzzyQueryCode)) {
      return null;
    }

    const queryPlaceholder =
      fuzzyQueryPlaceholder ||
      intl
        .get('srm.filterBar.view.message.mergeSearchPlaceholder', { name: fuzzyQueryName })
        .d(`请输入${fuzzyQueryName}`);

    return (
      <Tooltip title={queryPlaceholder}>
        <span className={`${stylePrefix}-merge-field`} style={{ display: 'inline-block' }}>
          <TextField
            dataSet={this.searchInputDs}
            name={fuzzyQueryCode}
            multiple={fuzzyQueryMultipleFlag}
            clearButton
            placeholder={queryPlaceholder}
            prefix={<Icon type="search" />}
          />
        </span>
      </Tooltip>
    );
  }

  @Bind()
  renderCustomLeft() {
    const { left = {} } = this.props;
    if (typeof left.render !== 'function') {
      return null;
    }
    return (
      <>
        <div className={`${stylePrefix}-operator-custom-wrap`}>
          {typeof left.render === 'function' && left.render(this.customizeDs)}
        </div>
        <Divider type="vertical" style={{ background: '#ccc' }} />
      </>
    );
  }

  @Bind()
  renderCustomRight() {
    const { right = {} } = this.props;
    if (typeof right.render !== 'function') {
      return null;
    }
    return (
      <>
        <Divider type="vertical" style={{ background: '#ccc' }} />
        <div className={`${stylePrefix}-operator-custom-wrap`}>
          {typeof right.render === 'function' && right.render(this.customizeDs)}
        </div>
      </>
    );
  }

  @Bind()
  renderFixButtons() {
    return (
      <>
        <Divider type="vertical" style={{ margin: '0 0.02rem', background: '#ccc' }} />
        <Tooltip title={intl.get('hzero.common.button.clear').d('清空')}>
          <Icon
            style={{ fontSize: '14px' }}
            type='cleaning_services'
            className={`${stylePrefix}-operator-icon`}
            onClick={this.handleCleanFilter}
          />
        </Tooltip>
        <Tooltip title={intl.get('hzero.common.button.refresh').d('刷新')}>
          <span className={`${stylePrefix}-operator-icon`} onClick={this.handleRefresh}>
            <img alt={intl.get('hzero.common.button.refresh').d('刷新')} src={RefreshIcon} />
          </span>
        </Tooltip>
      </>
    );
  }

  @Bind()
  renderButtons() {
    const { expand, changeFlag } = this.state;
    const { dataSet = [], tableButtons, tableRef, tableMode } = this.props;

    return (
      <>
        <ResetButton
          changeFlag={changeFlag}
          dataSet={this.customizeDs}
          handleClick={this.handleResetFilter}
        />
        {this.renderFixButtons()}
        <Tooltip
          title={
            expand
              ? intl.get('hzero.common.button.up').d('收起')
              : intl.get('hzero.common.button.expand').d('展开')
          }
        >
          <span className={`${stylePrefix}-operator-icon`} onClick={this.handleExpand}>
            <img
              alt={
                expand
                  ? intl.get('hzero.common.button.up').d('收起')
                  : intl.get('hzero.common.button.expand').d('展开')
              }
              src={CollapseUpIcon}
              className={!expand ? `${stylePrefix}-operator-icon-unFold` : undefined}
            />
          </span>
        </Tooltip>
        {!isEmpty(tableButtons) && dataSet ? (
          <>
            <Divider type="vertical" style={{ background: '#ccc' }} />
            <TableButtonRenderer
              dataSet={dataSet[0]}
              tableRef={tableRef}
              tableMode={tableMode}
              buttons={tableButtons as Buttons[]}
            />
          </>
        ) : null}
      </>
    );
  }

  @Bind()
  renderHeaderLeft() {
    // const { changeFlag } = this.state;

    return (
      <div className={`${stylePrefix}-operator-left`}>
        {this.renderCustomLeft()}
        {this.renderFuzzyQueryInput()}
        {/* <div className={`${stylePrefix}-qucik-filter`}>
          <span>
            <Icon type="filter_list" style={{ fontWeight: 600, color: '#000', fontSize: '15px' }} />
          </span>
          <>
            <span className={`${stylePrefix}-filter-text`}>{intl.get('srm.filterBar.view.default.filter').d('默认筛选')}</span>
            {changeFlag && (
              <span className={`${stylePrefix}-filter-has-changed`}>
                {intl.get('srm.filterBar.view.title.alreadyEdited').d('已修改')}
              </span>
            )}
          </>
        </div> */}
        {this.renderButtons()}
      </div>
    );
  }

  @Bind()
  renderHeaderRight() {
    const { right = {} } = this.props;
    return (
      <div
        className={`${stylePrefix}-operator-right`}
      >
        {/* {showSorterFlag ? (
          <SortSelector
            onRef={this.handleSortSelectorRef}
            filter={currentFilter}
            fields={sortableFields}
            dataSet={this.queryDs}
            onAction={this.checkDataSetBeforeAction}
          />
        ) : null} */}
        {typeof right.render === 'function' ? (
          <>
            {/* {showSorterFlag ? (
              <Divider type="vertical" style={{ margin: '0 0.16rem', background: '#ccc' }} />
            ) : null} */}
            {right.render(this.customizeDs)}
          </>
        ) : null}
      </div>
    );
  }

  render() {
    const { expand } = this.state;
    const { dataSet = [], expandable = true, showLoading = true, tableButtons, tableRef, tableMode } = this.props;
    const headerLeft = this.renderHeaderLeft();
    const headerRight = this.renderHeaderRight();
    const wrapClsName = classnames(stylePrefix, { [`${stylePrefix}-expand`]: expand });
    if (expandable) {
      return (
        <div className={wrapClsName}>
          {showLoading && <SearchBarSpin dataSet={dataSet} />}
          <div className={`${stylePrefix}-left`}>
            <div className={`${stylePrefix}-operator`}>
              {headerLeft}
              {headerRight}
            </div>
            {expand && <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>}
          </div>
        </div>
      );
    } else {
      return (
        <>
          <div className={wrapClsName}>
            <SearchBarSpin dataSet={dataSet} />
            <div className={`${stylePrefix}-left`}>
              <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>
            </div>
            <div className={`${stylePrefix}-right`}>{!expandable && headerRight}</div>
          </div>
          {!isEmpty(tableButtons) && dataSet ? (
            <div>
              <TableButtonRenderer
                dataSet={dataSet[0]}
                tableRef={tableRef}
                tableMode={tableMode}
                buttons={tableButtons as Buttons[]}
              />
            </div>
          ) : null}
        </>
      );
    }
  }
}

const SearchBarSpin = observer(({ dataSet }) => {
  if (isEmpty(dataSet)) {
    return null;
  }
  const loading = dataSet.some(item => item.status === 'loading');
  if (!loading) {
    return null;
  }
  return <div className={`${stylePrefix}-loading`} />;
});

const ResetButton = observer(({ dataSet, handleClick, changeFlag }): any => {
  if (!changeFlag && isEmpty(filterNullValueObject(dataSet.current?.data))) {
    return;
  }
  return (
    <Button className={`${stylePrefix}-operator-btn`} onClick={handleClick}>
      {intl.get('hzero.common.button.reset').d('重置')}
    </Button>
  );
});