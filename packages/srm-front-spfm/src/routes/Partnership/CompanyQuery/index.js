/**
 * CompanyQuery -公司查询汇总页面
 * @date: 2018-8-8
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { filterNullValueObject, getDateFormat } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DATETIME_MIN } from 'utils/constants';

import FilterForm from './FilterForm';
import DataTable from './DataTable';
import EditModal from './EditModal';

@formatterCollections({ code: ['spfm.partnership', 'entity.company'] })
export default class CompanyQuery extends React.Component {
  companyForm;

  constructor(props) {
    super(props);
    this.state = {
      format: getDateFormat(),
      visible: false,
      tableRecord: {}, // 所查询的数据
    };
  }

  componentDidMount() {
    // this.feacthCompanyDate();
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
        companyDataSource: [],
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
   * 取消模态框
   */
  @Bind()
  onCancel() {
    this.setState({
      tableRecord: {},
      visible: false,
    });
  }

  /**
   * 编辑公司信息
   * @param {object} record 编辑当前行记录
   */
  @Bind()
  handleEditCompany(record = {}) {
    this.setState({
      tableRecord: record,
    });
    this.showModel();
  }

  @Bind()
  cancelEsign(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'partnership/cancelEsign',
      payload: {
        companyId: record.companyId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  @Bind()
  handleFormRef(ref = {}) {
    this.companyForm = (ref.props || {}).form;
  }

  /**
   * 查询或带参数的查询
   * @param {object} params -- 查询条件
   * @param {object} companyQuery --初始查询时的默认参数
   * @param {number} companyQuery.page --页码
   * @param {number} companyQuery.size --条数
   */
  @Bind()
  feacthCompanyDate(params = {}) {
    const {
      dispatch,
      partnership: { companyPagination = {} },
    } = this.props;
    //   const { form } = this.state;
    const { sort } = params;
    const fieldValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    const { registerTimeFrom, registerTimeTo, ...otherValues } = fieldValues;
    dispatch({
      type: 'partnership/queryCompanyData',
      payload: {
        page: isEmpty(params) ? companyPagination : params,
        sort: isEmpty(sort) ? {} : sort,
        registerTimeFrom: registerTimeFrom ? registerTimeFrom.format(DATETIME_MIN) : undefined,
        registerTimeTo: registerTimeTo ? registerTimeTo.format(DATETIME_MIN) : undefined,
        ...otherValues,
      },
    });
  }

  /**
   * 保存编辑公司后的数据
   * @param {object} values --编辑后的数据
   */
  @Bind()
  companyDateSave(values = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'partnership/updateCompanyData',
      payload: values,
    }).then((response) => {
      if (response) {
        this.onCancel();
        this.feacthCompanyDate();
        notification.success();
      } else {
        notification.error();
      }
    });
  }

  /**
   * 表格发生改变时(如切换分页)
   * @param {object} pagination 分页信息
   * @param {object} filters 过滤条件
   * @param {object} sorter  排序条件
   */
  @Bind()
  handleStandardTableChange(pagination = {}, filters, sorter = {}) {
    const sort = sorter;
    const { field, order } = sort;
    this.feacthCompanyDate({
      ...pagination,
      sort:
        field === undefined || field === undefined
          ? null
          : {
              field,
              order,
            },
    });
    this.companyForm.sort = sort;
  }

  render() {
    const {
      partnership: { companyDataSource = {}, companyPagination = {} },
      loading,
      saving,
    } = this.props;
    const { visible, tableRecord, format } = this.state;
    const companyList = {
      format,
      onRef: this.handleFormRef,
      onFeacthCompanyDate: this.feacthCompanyDate,
    };
    const companyTable = {
      loading,
      companyDataSource,
      companyPagination,
      onHandleEditCompany: this.handleEditCompany,
      onCancelEsign: this.cancelEsign,
      onHandleStandardTableChange: this.handleStandardTableChange,
    };
    const detailProps = {
      saving,
      visible,
      tableRecord,
      anchor: 'right',
      onCompanyDateSave: this.companyDateSave,
      onCancel: this.onCancel,
    };
    return (
      <React.Fragment>
        <FilterForm {...companyList} />
        <DataTable {...companyTable} />
        <EditModal {...detailProps} />
      </React.Fragment>
    );
  }
}
