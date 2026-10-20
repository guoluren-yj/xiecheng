/* eslint-disable prefer-destructuring */
/* eslint-disable no-shadow */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unknown-property */
import React, { Component } from 'react';
import { Tooltip, Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';
import { getSortUpIcon, getSortDownIcon } from '@/utils/util';
import styles from './index.less';

const SORT_MODE = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
};


interface IProps {
  currentFilter: any;
  originFields: any[];
}

interface IState {
  sortFieldCode: string | null,
  sortFlag: string,
  multConditions: any[],
  mode: string,
}

export default class App extends Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      sortFieldCode: null,
      sortFlag: 'asc',
      multConditions: [],
      mode: SORT_MODE.SINGLE,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEmpty(nextProps.currentFilter)) {
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
        oldFilterFields.length !== filterFields.length
      ) {
        const { orderCount = 1 } = nextProps.unitInfo || {};
        let sortFieldCode = defaultSortedField;
        let sortFlag = defaultSortedOrder || 'asc';
        let mode =
          defaultSortedField && defaultSortedField.split(',').length > 1
            ? SORT_MODE.MULTIPLE
            : SORT_MODE.SINGLE;
        let multConditions = [];
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
                  ? (nextProps.originFields.find((i) => i.fieldAlias === fieldCode) || {}).fieldName
                  : undefined,
              fieldSortBy: (defaultSortedOrder && defaultSortedOrder.split(',')[index]) || 'asc',
            }));
          }
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


  render() {
    const { originFields = []} = this.props;
    const { sortFieldCode, sortFlag, mode, multConditions } = this.state;
    const fields =
      originFields && originFields.length > 0
        ? originFields.filter((item) => item.sortedFlag === 1)
        : [];
    const sortField =
      fields.length < 1 || !sortFieldCode
        ? {}
        : fields.find((item) => item.fieldAlias === sortFieldCode) || {};
    const SortUpIcon = getSortUpIcon();
    const SortDownIcon = getSortDownIcon();
    const conditions = multConditions.filter((i) => i.fieldCode);
    const multipleFlag = mode === SORT_MODE.MULTIPLE && conditions.length > 0;
    return (
      <div className={styles['table-header-left']}>
        <div className={styles['left-item']}>
          <div className={styles['left-item-label']}>
            {intl.get('hpfm.searchBar.model.searchBar.defaultSortField').d('默认排序字段')}
          </div>
          <div className={styles['left-item-content']}>
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
              </span>
            ) : !sortFieldCode ? (
              <span className={styles['sort-placeholder']}>
                {intl.get('hpfm.searchBar.view.placeholder.selectOrderBy').d('选择排序字段')}
                <Icon type="expand_more" />
              </span>
            ) : (
              <span className={styles['sort-control']}>
                {sortField.fieldName}
              </span>
            )}
            {!multipleFlag && sortFieldCode && (
              <Tooltip
                title={
                  sortFlag === 'asc'
                    ? intl.get('hpfm.searchBar.view.tooltip.asc').d('升序')
                    : intl.get('hpfm.searchBar.view.tooltip.desc').d('降序')
                }
              >
                <span className={styles['sort-icon']}>
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
