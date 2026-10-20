/**
 * index.js - 供应商扣款录入
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'hzero-ui';
// import { parse } from 'querystring';
import { isUndefined, isEmpty, isArray, omit } from 'lodash';

import { connect } from 'dva';
import uuid from 'uuid/v4';
import moment from 'moment';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { stringify } from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import {
  filterNullValueObject,
  getEditTableData,
  addItemToPagination,
  delItemsToPagination,
  getCurrentOrganizationId,
} from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';
import { Bind, Throttle } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { fetchSettings } from '@/services/supplierChargeEntryServices';
import Icons from '../components/Icons';
import Search from './Search';
import List from './List';
// import { thousandBitSeparator } from '@/routes/utils';

const viewPrompt = 'sfin.supplierChargeEntry.view';

@connect(({ loading = {}, supplierChargeEntry = {}, supplierCommon = {} }) => ({
  queryListLoading: loading.effects['supplierChargeEntry/queryList'],
  loading:
    loading.effects['supplierChargeEntry/update'] ||
    loading.effects['supplierChargeEntry/submit'] ||
    loading.effects['supplierChargeEntry/handleCancel'] ||
    loading.effects['supplierChargeEntry/deleteList'],
  supplierChargeEntry,
  supplierCommon,
}))
@formatterCollections({
  code: [
    'hzero.common',
    'entity.company',
    'sfin.supplierChargeEntry',
    'entity.roles',
    'spcm.supplierChargeEntry',
  ],
})
@withCustomize({
  unitCode: ['SFIN.SUPPLIER_CHARGE_ENTRY.LIST', 'SFIN.SUPPLIER_CHARGE_ENTRY.FILTER_FORM'],
})
export default class SupplierChargeEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // pcTypeId,
      selectedRows: [],
      // selectedRowKeys: [],
      tenantId: getCurrentOrganizationId(),
      cancellFlag: false,
      deleteFlag: false,
      amountEditFlag: false, // 不含税扣款是否可编辑
    };
  }

  filterForm;

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      // supplierChargeEntry: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      // _back=-1 在详情页
      // this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
    this.fetchSettings();
  }

  componentDidUpdate(prevProps, prevState, pcTypeId) {
    if (pcTypeId) {
      this.fetchList();
    }
  }

  @Bind()
  fetchSettings() {
    fetchSettings().then((res) => {
      if (res) {
        this.setState({
          amountEditFlag: res['010531'] === 'NET_PRICE',
        });
      }
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */

  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    this.setState({ selectedRows: [] });
    const { supplierCompanyIdStash, ...values } = filterValues;
    dispatch({
      type: 'supplierChargeEntry/queryList',
      payload: {
        page,
        ...values,
        supplierCompanyId: supplierCompanyIdStash,
        statusCodeList: ['PENDING', 'REJECTED', 'RETURNED', 'RETURN'],
        customizeUnitCode: 'SFIN.SUPPLIER_CHARGE_ENTRY.LIST,SFIN.SUPPLIER_CHARGE_ENTRY.FILTER_FORM',
      },
    }).then(() => {
      this.resetDataForm();
    });
  }

  /**
   * onReset - 重置列表事件
   */
  @Bind()
  resetDataForm() {
    const { supplierChargeEntry } = this.props;
    const { dataSource = [] } = supplierChargeEntry;
    dataSource.forEach((item) => {
      item.$form.resetFields();
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierChargeEntry/init',
    });
  }

  /**
   * 新建列表
   * @param {String} supplierDeductionsId
   */
  @Bind()
  project() {
    const {
      dispatch,
      supplierChargeEntry: { dataSource = [], pagination = {} },
    } = this.props;
    const newDataSource = {
      edited: true,
      useFlag: 0,
      attachmentUuid: uuid(),
      supplierDeductionsId: uuid(),
      _status: 'create',
      statusCode: 'PENDING',
      taxIncludedAmount: 0,
    };
    dispatch({
      type: 'supplierChargeEntry/updateState',
      payload: {
        dataSource: [newDataSource, ...dataSource],
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
  }

  /**
   * save - 保存明细数据
   */
  @Bind()
  @Throttle(1000)
  save() {
    const { dispatch = (e) => e, supplierChargeEntry } = this.props;
    const { dataSource = [] } = supplierChargeEntry;
    const newDataSource = dataSource.filter((item) => item.edited);
    const data = getEditTableData(newDataSource, ['supplierDeductionsId', '_status']);
    const lines = data.map((item) => {
      return {
        ...item,
        billingDate: item.billingDate ? moment(item.billingDate).format(DATETIME_MIN) : null,
      };
    });
    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      const headerData = {
        lines,
      };
      dispatch({
        type: 'supplierChargeEntry/update',
        payload: { headerData },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchList();
        }
      });
    }
  }

  /**
   * save - 保存明细数据校验
   */
  // @Bind()
  // save() {
  //   const { dispatch = e => e, supplierChargeEntry } = this.props;
  //   const { dataSource = [] } = supplierChargeEntry;
  //   // const newDataSource = dataSource.filter(item => item.edited);
  //   const data = getEditTableData(dataSource, ['supplierDeductionsId', '_status']);
  //   const lines = data.map(item => {
  //     return {
  //       ...item,
  //       billingDate: item.billingDate ? moment(item.billingDate).format(DATETIME_MIN) : null,
  //     };
  //   });
  //   if ((Array.isArray(lines) && lines.length !== 0)) {
  //     const headerData = {
  //       lines,
  //     };
  //     dispatch({
  //       type: 'supplierChargeEntry/update',
  //       payload: { headerData },
  //     }).then(res => {
  //       if (res) {
  //         notification.success();
  //         this.fetchList();
  //       }
  //     });
  //   } else {
  //     notification.warning({ description: intl.get(`${viewPrompt}.fullRequire`).d('请完善必输字段') });
  //   }
  // }

  /**
   * handleRecordChange - 列表项数据修改
   */
  @Bind()
  handleRecordChange(record) {
    const { dispatch, supplierChargeEntry } = this.props;
    const { dataSource } = supplierChargeEntry;
    const newDataSource = dataSource.map((item) => {
      if (item.supplierDeductionsId === record.supplierDeductionsId) {
        return {
          ...item,
          edited: true,
          // supplierId: values.supplierId,
          // supplierCompanyId: values.supplierCompanyId,
          // supplierCompanyName: values.supplierCompanyName,
        };
      }
      return item;
    });
    dispatch({
      type: 'supplierChargeEntry/updateState',
      payload: {
        dataSource: newDataSource,
      },
    });
  }

  /**
   * handerNum - 列表项数据修改
   */
  @Bind()
  handerNum(text, record, values) {
    const { dispatch, supplierChargeEntry } = this.props;
    const { dataSource } = supplierChargeEntry;
    const newDataSource = dataSource.map((item) => {
      if (item.supplierDeductionsId === record.supplierDeductionsId) {
        return {
          ...item,
          edited: true,
          supplierId: values.supplierId,
          supplierCompanyId: values.supplierCompanyId,
          supplierCompanyNum: values.erpSupplierNum ? values.erpSupplierNum : values.supplierNum,
          supplierCompanyName: values.erpSupplierId
            ? values.erpSupplierName
            : values.supplierCompanyName,
          supplierTenantId: values.supplierTenantId,
          erpSupplierName: values.erpSupplierName,
        };
      }
      return item;
    });
    dispatch({
      type: 'supplierChargeEntry/updateState',
      payload: {
        dataSource: newDataSource,
      },
    });
  }

  /**
   * handerNum - 列表项数据修改
   */
  @Bind()
  handerSubjectNum(text, record, values) {
    const { dispatch, supplierChargeEntry } = this.props;
    const { dataSource } = supplierChargeEntry;
    const newDataSource = dataSource.map((item) => {
      if (item.supplierDeductionsId === record.supplierDeductionsId) {
        return {
          ...item,
          edited: true,
          // accountSubjectNum: values.accountSubjectNum,
          generalLedgerId: values.accountSubjectId,
          accountSubjectName: values.accountSubjectName,
        };
      }
      return item;
    });
    dispatch({
      type: 'supplierChargeEntry/updateState',
      payload: {
        dataSource: newDataSource,
      },
    });
  }

  /*
   * 提交
   */
  @Bind()
  @Throttle(1000)
  submit() {
    const {
      dispatch,
      supplierChargeEntry: { dataSource = [] },
    } = this.props;
    const { selectedRows = [] } = this.state;

    const selectedDatas = selectedRows.map((item) => {
      const { supplierDeductionsId } = item;
      return dataSource.find((record) => record.supplierDeductionsId === supplierDeductionsId);
    });
    const lines = getEditTableData(selectedDatas, ['supplierDeductionsId', '_status']);
    const newLines = lines.map((item) => {
      return {
        ...item,
        billingDate: item.billingDate ? moment(item.billingDate).format(DATETIME_MIN) : null,
      };
    });
    if (!isEmpty(lines)) {
      Modal.confirm({
        title: intl.get(`${viewPrompt}.confirmSubmit`).d('是否提交'),
        onOk: () => {
          dispatch({
            type: 'supplierChargeEntry/submit',
            payload: { sfinList: newLines },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchList();
            }
          });
        },
      });
    }
  }

  /**
   * delete - 删除列表
   */
  @Bind()
  @Throttle(1000)
  delete() {
    const sourceField = `dataSource`;
    const paginationField = `pagination`;
    const selectedField = `selectedRows`;
    const rowKey = `supplierDeductionsId`;
    const { [selectedField]: selectedRows = [] } = this.state;
    const { supplierChargeEntry, dispatch } = this.props;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
    } = supplierChargeEntry;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`sfin.supplierChargeEntry.verify.isDelete`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((item) => item[rowKey]);
        dataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            // 没有主键的数据
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            // 非新增的数据
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: `supplierChargeEntry/deleteList`,
            payload: {
              body: deleteList,
            },
          }).then((res) => {
            if (res) {
              this.setState({ [selectedField]: [] });
              notification.success();
              this.fetchList(pagination);
            }
          });
        } else {
          dispatch({
            type: 'supplierChargeEntry/updateState',
            payload: {
              [sourceField]: newDataSource,
              [paginationField]: delItemsToPagination(
                selectedRows.length,
                dataSource.length,
                pagination
              ),
            },
          });
          this.setState({ [selectedField]: [] });
          // this.ChangeAwait.setUpdate('deleteLine', selectedRowKeys);
        }
      },
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    let cancellFlag = false;
    let deleteFlag = false;
    // eslint-disable-next-line array-callback-return
    selectedRows.map((ele) => {
      if (ele.statusCode === 'PENDING') {
        cancellFlag = true;
      }
      if (ele.statusCode !== 'PENDING') {
        deleteFlag = true;
      }
    });
    this.setState({
      selectedRows,
      selectedChargeRowKeys: selectedRowKeys,
      cancellFlag,
      deleteFlag,
    });
  }

  /**
   * 批量导入
   */
  @Bind()
  @Throttle(1000)
  handleRoleImport() {
    const { tenantId } = this.state;
    openTab({
      key: '/sfin/supplier-chargeEntry/data-import/SFIN.SUPPLIER_DEDUCTION_IMPORT',
      title: intl.get('hzero.common.button.batchImport').d('批量导入'),
      search: stringify({
        action: intl.get('hzero.common.button.batchImport').d('批量导入'),
        backPath: '/sfin/supplier-chargeEntry/list',
        args: JSON.stringify({
          tenantId,
          templateCode: 'SFIN.SUPPLIER_DEDUCTION_IMPORT',
        }),
      }),
    });
  }

  /*
   * 取消
   */
  @Bind()
  @Throttle(1000)
  handleCancel() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    const lines = selectedRows;
    if (!isEmpty(lines)) {
      Modal.confirm({
        title: intl.get(`${viewPrompt}.confirmCancel`).d('是否取消'),
        onOk: () => {
          dispatch({
            type: 'supplierChargeEntry/handleCancel',
            payload: { lines },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchList();
            }
          });
        },
      });
    }
  }

  @Bind()
  handleDisabledCancel() {
    const { selectedRows = [], selectedChargeRowKeys = [] } = this.state;
    const returned = selectedRows.some((item) => item.statusCode === 'RETURNED');
    const rejected = selectedRows.some((item) => item.statusCode === 'REJECTED');
    if (isArray(selectedChargeRowKeys) && isEmpty(selectedChargeRowKeys)) {
      return true;
    }
    if (returned || rejected) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * 用户名称带出
   */
  // @Bind()
  // supplierNameText(text, values, record) {
  //   const {
  //     supplierChargeEntry: { dataSource = [] },
  //     dispatch,
  //   } = this.props;
  //   const oldList = dataSource.findIndex(
  //     e => e.supplierDeductionsId === record.supplierDeductionsId
  //   );
  //   const newDataSource = {
  //     ...record,
  //     supplierName: values.supplierName,
  //     _status: 'create',
  //   };
  //   if (oldList > -1) {
  //     dataSource[oldList] = newDataSource;
  //   }
  //   dispatch({
  //     type: 'supplierChargeEntry/updateState',
  //     payload: dataSource,
  //   });
  //   // debugger;
  // }

  render() {
    const {
      supplierChargeEntry: { enumMap = {}, dataSource = [], pagination = {} },
      queryListLoading = false,
      customizeTable,
      customizeFilterForm,
      dispatch,
      loading = false,
    } = this.props;
    const { selectedRows = [], cancellFlag, deleteFlag, amountEditFlag } = this.state;
    const disList = selectedRows.some((item) => item.statusCode === 'SUBMITTED');
    const disListt = selectedRows.some((item) => item.statusCode === 'APPROVED');
    // const selectedStatus =selectedRows.some(item=> item.statusCode === 'PENDING');
    // const selectedCancel =selectedRows.some(item=> item.statusCode === 'REJECTED');
    const selectedRowKeys = selectedRows.map((item) => item.supplierDeductionsId);
    const searchProps = {
      customizeFilterForm,
      enumMap,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      enumMap,
      dataSource,
      dispatch,
      pagination,
      selectedRows,
      amountEditFlag,
      customizeTable,
      handerNum: this.handerNum,
      onSearch: this.fetchList,
      loading: queryListLoading,
      handerSubjectNum: this.handerSubjectNum,
      supplierNameText: this.supplierNameText,
      handleUnitChange: this.handleUnitChange,
      onRowSelectChange: this.onRowSelectChange,
      handleRecordChange: this.handleRecordChange,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${viewPrompt}.title.supplierEntry`).d('供应商扣款录入')}>
          <Button icon="plus" type="primary" onClick={this.project}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button icon="save" loading={loading || queryListLoading} onClick={this.save}>
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button type="default" onClick={this.handleRoleImport}>
            <Icons type="main-import" style={{ marginRight: '8px' }} />
            {intl.get(`hzero.common.button.comming`).d('导入')}
          </Button>
          <Button
            icon="check"
            disabled={(isArray(selectedRowKeys) && isEmpty(selectedRowKeys)) || disList || disListt}
            loading={loading || queryListLoading}
            onClick={this.submit}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <Button
            icon="close"
            disabled={(isArray(selectedRowKeys) && isEmpty(selectedRowKeys)) || cancellFlag}
            loading={loading || queryListLoading}
            onClick={this.handleCancel}
          >
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          <Button
            icon="delete"
            loading={loading || queryListLoading}
            disabled={(isArray(selectedRowKeys) && isEmpty(selectedRowKeys)) || deleteFlag}
            onClick={this.delete}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
