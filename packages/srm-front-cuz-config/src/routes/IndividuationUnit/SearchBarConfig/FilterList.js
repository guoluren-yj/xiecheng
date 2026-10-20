import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import {
  Spin,
  Tooltip,
  Icon,
  Menu,
  Dropdown,
  Modal,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';

import styles from './index.less';
import { EditType } from '@/utils/constConfig';
import FilterEditor from './FilterEditor';

@connect(({ loading }) => ({
  deleteLoading: loading.effects['searchBarConfig/deleteUnitFilter'],
  saveLoading: loading.effects['searchBarConfig/saveUnitFilter'],
}))
export default class SearchBarConfig extends Component {
  constructor(props) {
    super(props);
    this.filterEditorRef = null;
    this.state = {
      editorVisible: false,
    };
  }

  @Bind()
  handleFilterEditorRef(ref) {
    this.filterEditorRef = ref;
  }

  @Bind()
  handleOpenFilterEditor(editType, filter = {}) {
    this.setState({
      editorVisible: true,
    }, () => {
      if (this.filterEditorRef) {
        this.filterEditorRef.handleOpenModal(editType, filter);
      }
    });
  }

  @Bind()
  deleteFilter(filter) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录'),
      onOk: () => {
        const { dispatch, unitInfo = {}, onRefresh = () => { } } = this.props;
        const { unitCode } = unitInfo;
        dispatch({
          type: 'searchBarConfig/deleteUnitFilter',
          params: {
            unitCode,
            filterId: filter.filterId,
          },
        }).then(res => {
          if (res) {
            notification.success();
            if (typeof onRefresh === 'function') {
              onRefresh();
            }
          }
        });
      },
    });
  }




  @Bind()
  handleFilterEnabled(filter) {
    const { enabledFlag, defaultFlag } = filter;
    const newEnabledFlag = enabledFlag === 1 ? 0 : 1;
    this.saveFilter({
      ...filter,
      enabledFlag: newEnabledFlag,
      defaultFlag: newEnabledFlag === 1 ? defaultFlag : 0,
      originEnabledFlag: enabledFlag === 1 ? enabledFlag : 0,
    });
  }

  @Bind()
  handleFilterDefault(filter) {
    const { defaultFlag } = filter;
    this.saveFilter({
      ...filter,
      defaultFlag: defaultFlag === 1 ? 0 : 1,
    });
  }

  @Bind()
  saveFilter(filter) {
    const {
      dispatch,
      unitInfo = {},
      filterList,
      onRefresh = () => { },
    } = this.props;
    const { id: unitId, unitCode } = unitInfo;
    const newFilter = {
      ...filter,
      unitId,
      unitCode,
    };
    const enabledFilterList = filterList.filter(item => item.enabledFlag === 1);
    const newFilterList = enabledFilterList.map(item => {
      if (filter.filterId === item.filterId) {
        return newFilter;
      } else {
        return {
          ...item,
          defaultFlag: filter.defaultFlag === 1 ? 0 : item.defaultFlag,
        };
      }
    });
    // 如果是禁用改成启用，需将当前筛选器拼到启用列表后
    const targetFilter = enabledFilterList.find(item => item.filterId === newFilter.filterId);
    if (!targetFilter) {
      newFilterList.push(newFilter);
    }
    dispatch({
      type: 'searchBarConfig/saveUnitFilter',
      params: newFilterList,
    }).then(res => {
      if (res) {
        notification.success();
        if (typeof onRefresh === 'function') {
          onRefresh();
        }
      }
    });
  }

  /**
   * @param {需移动的filter的主键} targetFilterId
   * @param {上移或下移,true-上移,false-下移} rankType
   */
  @Bind()
  handleRankFilterList(targetFilterId, rankType = false) {
    const {
      dispatch,
      unitInfo = {},
      filterList = [],
      onChange = () => { },
      onRefresh,
    } = this.props;
    const disabledFilterList = filterList.filter(item => item.enabledFlag !== 1); // 禁用列表
    let enableFilterList = filterList.filter(item => item.enabledFlag === 1); // 启用列表
    // 先设置每个filter的rank为 index * 10
    enableFilterList = enableFilterList.map((item, index) => {
      let num = index * 10;
      // 设置需移动的filter的rank
      if (item.filterId === targetFilterId) {
        num = rankType ? (index - 1) * 10 - 1 : (index + 1) * 10 + 1;
      }
      return {
        ...item,
        num,
        unitCode: unitInfo.unitCode,
      };
    });
    enableFilterList.sort((before, after) => before.num - after.num);
    const newFilterList = enableFilterList.concat(disabledFilterList);
    if (typeof onChange === 'function') {
      onChange(newFilterList);
    }
    dispatch({
      type: 'searchBarConfig/saveUnitFilter',
      params: enableFilterList,
    }).then(res => {
      if (res) {
        notification.success();
        onRefresh();
      }
    });
  }

  @Bind()
  renderFilterMenu(filter) {
    const {
      filterList = [],
    } = this.props;
    const { filterId, enabledFlag, defaultFlag } = filter;
    const enabledFilterList = filterList.filter(item => item.enabledFlag === 1);
    const isFirstItem = !isEmpty(enabledFilterList) && enabledFilterList[0].filterId === filterId;
    const isLastItem = !isEmpty(enabledFilterList) && enabledFilterList[enabledFilterList.length - 1].filterId === filterId;
    const menu = (
      <Menu>
        {enabledFlag === 1 && defaultFlag !== 1 && (
          <Menu.Item key="edit" onClick={() => this.handleFilterDefault(filter)}>
            <Icon type='star' />
            {intl.get('hpfm.searchBar.button.setDefault').d('设为默认筛选器')}
          </Menu.Item>
        )}
        {enabledFlag === 1 && (
          <Menu.Item key="edit" onClick={() => this.handleOpenFilterEditor(EditType.UPDATE, filter)}>
            <Icon type="edit" />
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Menu.Item>
        )}
        {/* <Menu.Item key="save" onClick={()=>this.handleOpenFilterEditor(EditType.COPY, filter)}>
          <Icon type="save" />
          {intl.get('hpfm.searchBar.button.copy').d('复制')}
        </Menu.Item> */}
        <Menu.Item key="save" onClick={() => this.handleFilterEnabled(filter)}>
          <Icon type={enabledFlag === 1 ? "pause-circle-o" : "check-circle-o"} />
          {enabledFlag === 1 ? intl.get('hzero.common.button.unEnabled').d('禁用')
            : intl.get('hzero.common.button.enabled').d('启用')
          }
        </Menu.Item>
        <Menu.Item key="delete" style={{ color: '#f00' }} onClick={() => this.deleteFilter(filter)}>
          <Icon type="delete" style={{ minWidth: '12px', marginRight: '8px' }} />
          {intl.get('hzero.common.button.delete').d('删除')}
        </Menu.Item>
      </Menu>
    );
    return (
      <>
        {enabledFlag === 1 && (
          isFirstItem ? (
            <Icon type="arrow-up" className={styles['searchBar-btn-disabled']} />
          ) : (
            <Tooltip placement="bottom" title={intl.get('hpfm.searchBar.button.moveUp').d('上移')}>
              <span onClick={() => this.handleRankFilterList(filterId, true)}>
                <Icon type="arrow-up" />
              </span>
            </Tooltip>
          )
        )}
        {enabledFlag === 1 && (
          isLastItem ? (
            <Icon type="arrow-down" className={styles['searchBar-btn-disabled']} />
          ) : (
            <Tooltip placement="bottom" title={intl.get('hpfm.searchBar.button.moveDown').d('下移')}>
              <span onClick={() => !isLastItem && this.handleRankFilterList(filterId)}>
                <Icon type="arrow-down" />
              </span>
            </Tooltip>
          )
        )}
        <span>
          <Dropdown trigger={['click']} overlay={menu}>
            <span><Icon type="ellipsis" /></span>
          </Dropdown>
        </span>
      </>
    );
  }

  @Bind()
  handleCloseEditor() {
    this.setState({
      editorVisible: false,
    });
  }

  render() {
    const { editorVisible } = this.state;
    const {
      filterList = [],
      currentFilter = {},
      unitInfo = {},
      saveLoading = false,
      deleteLoading = false,
      onSelectFilter = () => { },
      onRefresh = () => { },
    } = this.props;
    const enableFilterList = filterList.filter(item => item.enabledFlag === 1); // 启用列表
    const disabledFilterList = filterList.filter(item => item.enabledFlag !== 1); // 禁用列表
    return (
      <Spin spinning={saveLoading || deleteLoading || false}>
        <div className={styles['searchBar-container-left-title']}>
          <span>{intl.get('hpfm.searchBar.view.message.searchBarList').d('筛选器列表')}</span>
          <Tooltip placement="bottom" title={intl.get('hzero.common.button.createFilter').d('新建筛选器')}>
            <span>
              <Icon type='plus' onClick={() => this.handleOpenFilterEditor(EditType.CREATE)} />
            </span>
          </Tooltip>
        </div>
        {!isEmpty(enableFilterList) && (
          <div className={styles['searchBar-container-left-list']}>
            {enableFilterList.map(filter => (
              <div
                className={classnames({
                  [styles['searchBar-container-left-list-item']]: true,
                  [styles['searchBar-container-left-list-item-current']]: filter.filterId === currentFilter.filterId,
                })}
                onClick={() => onSelectFilter(filter)}
              >
                <div>
                  {filter.filterName}
                  {filter.defaultFlag === 1 && (
                    <span className={styles['searchBar-tag']}>
                      {intl.get('hzero.common.status.default').d('默认')}
                    </span>
                  )}
                </div>
                <div
                  className={styles['searchBar-container-left-list-item-btns']}
                  onClick={(event) => { event.stopPropagation(); }}
                >
                  {this.renderFilterMenu(filter)}
                </div>
              </div>
            ))}
          </div>
        )}
        {!isEmpty(disabledFilterList) && (
          <>
            <div className={styles['searchBar-container-left-list-title']}>
              {intl.get('hpfm.searchBar.view.message.disabled').d('禁用')}
            </div>
            <div
              className={classnames(
                styles['searchBar-container-left-list'],
                styles['searchBar-container-left-list-disabled'])
              }
            >
              {disabledFilterList.map(filter => (
                <div
                  className={classnames({
                    [styles['searchBar-container-left-list-item']]: true,
                    [styles['searchBar-container-left-list-item-current']]: filter.filterId === currentFilter.filterId,
                  })}
                  onClick={() => onSelectFilter(filter)}
                >
                  <div>{filter.filterName}</div>
                  <div
                    className={styles['searchBar-container-left-list-item-btns']}
                    onClick={(event) => { event.stopPropagation(); }}
                  >
                    {this.renderFilterMenu(filter)}
                  </div>
                </div>
              ))
              }
            </div>
          </>
        )}
        {editorVisible && (
          <FilterEditor
            filterList={filterList}
            onRef={this.handleFilterEditorRef}
            unitInfo={unitInfo}
            onRefresh={onRefresh}
            onClose={this.handleCloseEditor}
          />
        )}
      </Spin>
    );
  }

}