import React, { Component } from 'react';
import classnames from 'classnames';
//@ts-ignore
import { Spin, Icon, Menu, Dropdown, Text } from 'choerodon-ui';
import { Modal as ProModal, Form, IntlField, DataSet } from 'choerodon-ui/pro';
import { Button } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { FieldType, RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';

import { 
  deleteUnitFilter,
  saveUnitFilter,
  copyUnitFilter,
} from '../../../../../services/searchBarConfigService';
import { EditType } from '../../../../../utils/constConfig';

import styles from './index.less';


export default class FilterList<T> extends Component<T & {
  currentFilter?: any;
  filterList?: any[];
  unitInfo: any;
  onChange: Function;
  onRefresh: any;
  onSelectFilter: Function;
  tplParams?: any;
  mode?: string;
  readonly?: boolean;
}, any> {
  filterEditorRef: any = null;

  constructor(props) {
    super(props);
    this.state = {
      editorVisible: false,
      loading: false,
    };
  }

  @Bind()
  handleFilterEditorRef(ref) {
    this.filterEditorRef = ref;
  }

  @Bind()
  handleOpenFilterEditor(editType, filter: any = {}) {
    const ds = new DataSet({
      fields: [
        { 
          name: 'filterName',
          label: intl.get('hpfm.searchBar.model.searchBar.filterName').d('筛选器名称'),
          required: true,
          type: FieldType.intl,
          maxLength: 50,
        },
      ]
    });
    const record = ds.create(filter ? { filterName: filter.filterName, _token: filter._token } : {});
    record.status = RecordStatus.update;
    ProModal.open({
      title:
        editType === EditType.CREATE ? intl.get('hpfm.searchBar.view.message.createFilter').d('新建筛选器')
          : editType === EditType.UPDATE ? intl.get('hpfm.searchBar.view.message.editFilter').d('编辑筛选器')
            : editType === EditType.COPY ? intl.get('hpfm.searchBar.view.message.copyFilter').d('复制筛选器')
              : null,
      drawer: true,        
      style: { width: '380px' },
      children: (
        <Form labelLayout={LabelLayout.float} record={record}>
          <IntlField name='filterName' />
        </Form>
      ),
      onOk: async() => {
        const { filterList = [], unitInfo = {}, onRefresh = () => {}, mode, tplParams } = this.props;
        const { id: unitId, unitCode } = unitInfo;
        const flag = await record.validate();
        if (!flag) {
          return false;
        }
        const { _tls } = record.toData();
        const newFilter = {
          ...filter,
          filterName: record.get('filterName'),
          enabledFlag: 1,
          unitId,
          unitCode,
          _tls,
        };
        let newFilterList = filterList.filter(item => item.enabledFlag === 1);
        if (editType === EditType.UPDATE) {
          newFilterList = newFilterList.map(item => {
            if (item.filterId === filter.filterId) {
              return newFilter;
            } else {
              return item;
            }
          });
        } else {
          // 新建或复制都是在原启用list后增加元素
          newFilterList.push({
            ...newFilter,
            defaultFlag: 0,
          });
        }
        const method = editType === EditType.COPY ? copyUnitFilter : saveUnitFilter;
        const res = await method(
          newFilterList,
          mode,
          tplParams,
        );
        if (getResponse(res)) {
          notification.success({});
          if (typeof onRefresh === 'function') {
            onRefresh();
          }
          return true;
        }
      } 
    })
  }

  @Bind()
  deleteFilter(filter) {
    ProModal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录'),
      onOk: () => {
        const { unitInfo = {}, onRefresh, mode, tplParams } = this.props;
        const { unitCode } = unitInfo;
        deleteUnitFilter(
          { unitCode, filterId: filter.filterId }, 
          mode,
          tplParams,
        ).then(res => {
          if (getResponse(res)) {
            notification.success({});
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
    const { unitInfo = {}, filterList = [], onRefresh, mode, tplParams } = this.props;
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
    saveUnitFilter(newFilterList, mode, tplParams).then(res => {
      if (res) {
        notification.success({});
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
    const { unitInfo = {}, filterList = [], onChange, onRefresh, mode, tplParams } = this.props;
    // 过滤出启用的筛选器
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
    saveUnitFilter(enableFilterList, mode, tplParams).then(res => {
      if (res) {
        notification.success({});
        onRefresh();
      }
    });
  }

  @Bind()
  renderFilterMenu(filter) {
    const { filterList = [] } = this.props;
    const { filterId, enabledFlag, defaultFlag, tenantId } = filter;
    const custmoizeFlag = tenantId === getCurrentOrganizationId();
    const enabledFilterList = filterList.filter(item => item.enabledFlag === 1);
    const isFirstItem = !isEmpty(enabledFilterList) && enabledFilterList[0].filterId === filterId;
    const isLastItem =
      !isEmpty(enabledFilterList) &&
      enabledFilterList[enabledFilterList.length - 1].filterId === filterId;
    const menu = (
      <Menu className={styles['filter-menu']}>
        {enabledFlag === 1 && defaultFlag !== 1 && (
          <Menu.Item key="edit" onClick={() => this.handleFilterDefault(filter)}>
            {intl.get('hpfm.searchBar.button.setDefault').d('设为默认筛选器')}
          </Menu.Item>
        )}
        {enabledFlag === 1 && custmoizeFlag && (
          <Menu.Item
            key="edit"
            onClick={() => this.handleOpenFilterEditor(EditType.UPDATE, filter)}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Menu.Item>
        )}
        {/* <Menu.Item key="save" onClick={()=>this.handleOpenFilterEditor(EditType.COPY, filter)}>
          <Icon type="save" />
          {intl.get('hpfm.searchBar.button.copy').d('复制')}
        </Menu.Item> */}
        <Menu.Item key="save" onClick={() => this.handleFilterEnabled(filter)}>
          {enabledFlag === 1
            ? intl.get('hzero.common.button.unEnabled').d('禁用')
            : intl.get('hzero.common.button.enabled').d('启用')}
        </Menu.Item>
        {custmoizeFlag && (
          <Menu.Item
            key="delete"
            style={{ color: '#f00' }}
            onClick={() => this.deleteFilter(filter)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Menu.Item>
        )}
        {enabledFlag === 1 && !isFirstItem && (
          <Menu.Item
            key="arrow_upward"
            onClick={() => this.handleRankFilterList(filterId, true)}
          >
            {intl.get('hpfm.searchBar.button.moveUp').d('上移')}
          </Menu.Item>
        )}
         {enabledFlag === 1 && !isLastItem && (
          <Menu.Item
            key="arrow_upward"
            onClick={() => this.handleRankFilterList(filterId)}
          >
            {intl.get('hpfm.searchBar.button.moveDown').d('下移')}
          </Menu.Item>
        )}
      </Menu>
    );
    return (
      <>
        <span>
          <Dropdown trigger={['click']} overlay={menu}>
            <span>
              <Icon type="more_horiz" />
            </span>
          </Dropdown>
        </span>
      </>
    );
  }

  @Bind()
  renderFilterTag(filter) {
    const { tenantId } = filter;
    const custmoizeFlag = tenantId === getCurrentOrganizationId();
    return (
      <span
        className={classnames({
          [styles['searchBar-tag']]: true,
          [styles['searchBar-tag-pre']]: custmoizeFlag,
          [styles['searchBar-tag-normal']]: !custmoizeFlag,
        })}
      >
        {custmoizeFlag
          ? intl.get('hpfm.searchBar.model.searchBar.tenantId').d('租户')
          : intl.get('hpfm.searchBar.model.searchBar.platform').d('平台')}
      </span>
    );
  }

  @Bind()
  handleCloseEditor() {
    this.setState({
      editorVisible: false,
    });
  }

  render() {
    const { loading = false } = this.state;
    const {
      filterList = [],
      currentFilter = {},
      onSelectFilter,
      readonly,
    } = this.props;
    const enableFilterList = filterList.filter(item => item.enabledFlag === 1); // 启用列表
    const disabledFilterList = filterList.filter(item => !item.enabledFlag); // 禁用列表
    return (
      <Spin spinning={loading}>
        <div className={styles['searchBar-container-left-title']}>
          <span>
            {intl.get('hpfm.searchBar.view.message.searchBarList').d('筛选器列表')}
          </span>
          {!readonly && (
            <Button
              funcType={FuncType.link}
              icon="add"
              onClick={() => this.handleOpenFilterEditor(EditType.CREATE)}
            >
              {intl.get("hzero.common.button.create").d("新建")}
            </Button>
          )}
        </div>
        <div className={styles['searchBar-container-left-list']}>
          {!isEmpty(enableFilterList) &&
            enableFilterList.map(filter => (
              <div
                className={classnames({
                  [styles['searchBar-container-left-list-item']]: true,
                  [styles['searchBar-container-left-list-item-current']]:
                    filter.filterId === currentFilter.filterId,
                })}
                onClick={() => onSelectFilter(filter)}
              >
                {this.renderFilterTag(filter)}
                <div className={styles['searchBar-container-left-list-item-text']}>
                  <Text>{filter.filterName}</Text>
                  {filter.defaultFlag === 1 && (
                    <span className={styles['searchBar-tag-default']}>
                      {intl.get('hzero.common.status.default').d('默认')}
                    </span>
                  )}
                </div>
                {!readonly && (
                  <div
                    className={styles['searchBar-container-left-list-item-btns']}
                    onClick={event => {
                      event.stopPropagation();
                    }}
                  >
                    {this.renderFilterMenu(filter)}
                  </div>
                )}
              </div>
            ))}
        </div>
        {!isEmpty(disabledFilterList) && (
          <>
            <div className={styles['searchBar-container-left-list-title']}>
              {intl.get('hpfm.searchBar.view.message.disabled').d('禁用')}
            </div>
            <div
              className={classnames(
                styles['searchBar-container-left-list'],
                styles['searchBar-container-left-list-disabled']
              )}
            >
              {disabledFilterList.map(filter => (
                <div
                  className={classnames({
                    [styles['searchBar-container-left-list-item']]: true,
                    [styles['searchBar-container-left-list-item-current']]:
                      filter.filterId === currentFilter.filterId,
                  })}
                  onClick={() => onSelectFilter(filter)}
                >
                  {this.renderFilterTag(filter)}
                  <div className={styles['searchBar-container-left-list-item-text']}>
                    <Text>{filter.filterName}</Text>
                  </div>  
                  <div
                    className={styles['searchBar-container-left-list-item-btns']}
                    onClick={event => {
                      event.stopPropagation();
                    }}
                  >
                    {this.renderFilterMenu(filter)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Spin>
    );
  }
}
