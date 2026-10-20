/*
 * GroupQuery - 集团查询汇总页面
 * @date: 2018-8-8
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React from 'react';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import notification from 'utils/notification';
import { filterNullValueObject, getDateFormat } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN } from 'utils/constants';

import FilterForm from './FilterForm';
import DataTable from './DataTable';
import EditModal from './EditModal';
@formatterCollections({ code: ['spfm.partnership', 'entity.group'] })
export default class GroupQuery extends React.Component {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */

  groupForm;

  constructor(props) {
    super(props);
    this.state = {
      format: getDateFormat(),
      visible: false,
      tableRecord: {}, // 所查询的数
    };
  }

  componentDidMount() {
    // this.fecthGroupDate();
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'partnership/updateState',
      payload: {
        groupDataSource: [],
      },
    });
  }

  /**
   * @param {*} ref 传入组件
   */
  @Bind()
  handleGroupRef(ref = {}) {
    this.groupForm = (ref.props || {}).form;
  }

  /**
   * 数据查询
   * @param {object} params 查询参数
   * @param {object} groupQuery 默认查询条件
   */
  @Bind()
  fecthGroupDate(params = {}) {
    const {
      dispatch,
      partnership: { groupPagination = {} },
    } = this.props;
    // const { form } = this.state;
    const { sort } = params;
    const fieldValues = isUndefined(this.groupForm)
      ? {}
      : filterNullValueObject(this.groupForm.getFieldsValue());
    const { registerTimeFrom, registerTimeTo, coreFlag, ...otherValues } = fieldValues;
    dispatch({
      type: 'partnership/queryGroupData',
      payload: {
        page: isEmpty(params) ? groupPagination : params,
        sort: isEmpty(sort) ? {} : sort,
        registerTimeFrom: registerTimeFrom ? registerTimeFrom.format(DATETIME_MIN) : undefined,
        registerTimeTo: registerTimeTo ? registerTimeTo.format(DATETIME_MIN) : undefined,
        ...otherValues,
        coreFlag: coreFlag ? 1 : 0,
      },
    });
  }

  /**
   * 打开模态框
   */
  showModel() {
    this.setState({
      visible: true,
    });
  }

  /**
   * 编辑
   * @param {object} record 当前行记录
   */
  @Bind()
  handleEditGroup(record = {}) {
    this.setState({
      tableRecord: record,
    });
    this.showModel();
  }

  /**
   * 取消模态框
   */
  @Bind()
  handleCancel() {
    this.setState({
      tableRecord: {},
      visible: false,
    });
  }

  /**
   * Group 将表单更改为编辑状态
   * @param {object} record 行记录
   * @param {boolean} flag  是否编辑 true为是，false为否
   */
  @Bind()
  onGroupTableEdit(record = {}, flag) {
    const {
      dispatch,
      partnership: { groupDataSource = {} },
    } = this.props;
    const index = groupDataSource.content.findIndex((item) => item.groupId === record.groupId);
    dispatch({
      type: 'partnership/updateState',
      payload: {
        groupSaveFlag: flag,
        groupDataSource: {
          content: [
            ...groupDataSource.content.slice(0, index),
            {
              ...record,
              isEdit: flag,
            },
            ...groupDataSource.content.slice(index + 1),
          ],
        },
      },
    });
  }

  /**
   * 表格变化时，分页切换
   * @param {object} pagination 分页信息
   * @param {object} filters 条件过滤
   * @param {object} sorter  排序规则
   */
  @Bind()
  handleStandardTableChange(pagination = {}, filters, sorter = {}) {
    const sort = sorter;
    const { field, order } = sort;
    this.fecthGroupDate({
      ...pagination,
      sort:
        field === undefined || field === undefined
          ? null
          : {
              field,
              order,
            },
    });
    this.groupForm.sort = sort;
  }

  /**
   *保存已编辑的数据
   * @param {object} values 待编辑数据
   */
  @Bind()
  handleGroupSave(values) {
    const { dispatch } = this.props;
    dispatch({
      type: 'partnership/updateGroupData',
      payload: values,
    }).then((response) => {
      if (response) {
        this.handleCancel();
        this.fecthGroupDate();
        notification.success();
      } else {
        notification.error();
      }
    });
  }

  render() {
    const {
      partnership: { groupDataSource = {}, groupSaveFlag, groupPagination = {} },
      saving,
      loading,
    } = this.props;
    const { visible, tableRecord, format } = this.state;
    const filterProps = {
      format,
      groupSaveFlag,
      onRef: this.handleGroupRef,
      onFecthGroupDate: this.fecthGroupDate,
    };
    const listProps = {
      groupDataSource,
      loading,
      groupPagination,
      onHandleEditGroup: this.handleEditGroup,
      onHandleStandardTableChange: this.handleStandardTableChange,
    };
    const detailProps = {
      visible,
      tableRecord,
      saving,
      anchor: 'right',
      onHandleGoupSave: this.handleGroupSave,
      onCancel: this.handleCancel,
    };
    return (
      <React.Fragment>
        <FilterForm {...filterProps} />
        <DataTable {...listProps} />
        <EditModal {...detailProps} />
      </React.Fragment>
    );
  }
}
