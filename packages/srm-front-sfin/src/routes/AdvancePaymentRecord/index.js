/**
 * 创建预付款申请页
 * @date: 2020-03-09
 * @author zuoxiangyu <xiangyu.zuog@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { Spin, Button, Modal } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { connect } from 'dva';
import { compose, isArray, isEmpty, isNil, throttle } from 'lodash';
import { dateRender, dateTimeRender } from 'utils/renderer';
import { createPagination } from 'utils/utils';
import moment from 'moment';

import { routerRedux } from 'dva/router';
import querystring from 'querystring';

import formatterCollections from 'utils/intl/formatterCollections';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Button as PermissionButton } from 'components/Permission';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import { thousandBitSeparator } from '@/routes/utils';
import { FilterForm } from '../components/custom';
import { useSetState, useScrollX } from './utils';
import Historys from './OperationRecord';

const common = 'sinv.advancePaymentRecord.model.common.';
// 搜索框配置表
const getFilterData = ({ tenantId, form }) => {
  const { setFieldsValue, registerField } = form;
  return [
    {
      type: 'Input_',
      label: intl.get(`${common}paymentNum`).d('预付款申请单号'),
      dataIndex: 'paymentNum',
    },
    {
      type: 'Lov_',
      label: intl.get(`${common}companys`).d('公司'),
      dataIndex: 'companyId',
      code: 'SPFM.USER_AUTH.COMPANY',
      textField: 'companyName',
      queryParams: {
        tenantId,
      },
    },
    {
      type: 'Lov_',
      label: intl.get(`${common}ouName`).d('业务实体'),
      dataIndex: 'ouId',
      code: 'SPFM.USER_AUTH.OU',
      textField: 'ouName',
      queryParams: {
        tenantId,
      },
    },
    {
      type: 'Lov_',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
      dataIndex: 'supplierCompanyId',
      code: 'SFIN.USER_AUTH.EXT_SUPPLIER',
      textField: 'displaySupplierName',
      queryParams: {
        tenantId,
      },
      onChange: (_, record) => {
        const { supplierId } = record;
        registerField('supplierId');
        setFieldsValue({
          supplierId,
        });
      },
      onOk: (record) => {
        const { supplierCompanyId } = record;
        setFieldsValue({
          supplierCompanyId: isNil(supplierCompanyId) ? '' : supplierCompanyId,
        });
      },
    },
    {
      type: 'DatePicker_',
      label: intl.get(`${common}creationDateStart`).d('创建日期从'),
      dataIndex: 'creationDateStart',
      // showTime: {
      //   defaultValue: moment().format(DEFAULT_DATETIME_FORMAT),
      // },
      //   disabledDate: currentDate => {
      //     console.log(currentDate);
      //     // eslint-disable-next-line no-unused-expressions
      //     getFieldValue('submittedDateTo') &&
      //       moment(getFieldValue('submittedDateTo')).isBefore(currentDate, 'day');
      //   },
    },
    {
      type: 'DatePicker_',
      label: intl.get(`${common}creationDateEnd`).d('创建日期至'),
      dataIndex: 'creationDateEnd',
      // showTime: {
      //   defaultValue: moment().format(DEFAULT_DATETIME_FORMAT),
      // },
      //   disabledDate: currentDate => {
      //     console.log(currentDate);
      //     console.log(getFieldValue('submittedDateFrom'));
      //     // eslint-disable-next-line no-unused-expressions
      //     getFieldValue('submittedDateFrom') &&
      //       moment(getFieldValue('submittedDateFrom')).isAfter(currentDate, 'day');
      //   },
    },
    {
      type: 'Select_',
      label: intl.get(`${common}paymentHeaderStatus`).d('申请单状态'),
      dataIndex: 'paymentHeaderStatus',
      code: 'SFIN.PAYMENT_STATUS',
      queryParams: {
        tenantId,
      },
    },
  ];
};

// 展示行配置
const getColumns = ({ routerInfo, history }) => {
  return [
    {
      title: intl.get(`${common}paymentHeaderStatus`).d('申请单状态'),
      dataIndex: 'paymentStatusMeaning',
      width: 100,
    },
    {
      title: intl.get(`${common}paymentNum`).d('预付款申请单号'),
      dataIndex: 'paymentNum',
      width: 150,
      render: (val, { paymentHeaderId }) => (
        <a onClick={() => routerInfo(paymentHeaderId)}>{val}</a>
      ),
    },
    {
      title: intl.get(`entity.company.ta`).d('公司'),
      dataIndex: 'companyName',
      width: 200,
    },
    {
      title: intl.get(`${common}ouName`).d('业务实体'),
      dataIndex: 'ouName',
      width: 120,
    },
    {
      title: intl.get(`${common}supplierCompanyNum`).d('供应商编码'),
      dataIndex: 'supplierCompanyNum',
      width: 120,
    },
    {
      title: intl.get(`${common}companyName`).d('供应商名称'),
      dataIndex: 'supplierCompanyName',
      width: 150,
    },
    {
      title: intl.get(`${common}paymentAmount`).d(`付款金额`),
      dataIndex: 'paymentAmount',
      width: 120,
      render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
    },
    {
      title: intl.get(`${common}currencyCode`).d(`币种`),
      dataIndex: 'currencyCode',
      width: 120,
    },
    {
      title: intl.get(`${common}paymentDate`).d(`付款日期`),
      dataIndex: 'paymentDate',
      width: 160,
      render: dateRender,
    },
    {
      title: intl.get(`${common}createdByName`).d(`申请人`),
      dataIndex: 'createdByName',
      width: 120,
    },
    {
      title: intl.get(`${common}creationDate`).d(`创建日期`),
      dataIndex: 'creationDate',
      width: 160,
      render: dateTimeRender,
    },
    {
      title: intl.get(`${common}remark`).d(`备注`),
      dataIndex: 'remark',
      width: 120,
    },
    {
      title: intl.get(`${common}history`).d(`操作记录`),
      dataIndex: 'invoiceFlagMeaning',
      width: 90,
      render: (_, { paymentHeaderId }) => (
        <a onClick={() => history({ paymentHeaderId })}>
          {intl.get(`${common}history`).d(`操作记录`)}
        </a>
      ),
    },
    // {
    //   title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    //   dataIndex: 'pcTypeCode',
    //   width: 80,
    //   render: (val, record) => (
    //     <a color="#29BECE" onClick={() => this.handleInvoiceDetail(record)}>
    //       {intl.get(`hzero.common.button.operating`).d('操作记录')}
    //     </a>
    //   ),
    // },
  ];
};

const Index = ({
  historyLoading = false,
  dispatch,
  customizeFilterForm,
  customizeTable,
  loading = false,
}) => {
  const { state, setState } = useSetState({
    visible: false,
    paymentHeaderId: '',
    id: '',
    dataSource: [],
    pagination: {},
    selectedRowKeys: [],
    selectedRows: [],
    histpryList: [],
    histpryPagination: {},
    filterParams: {},
  });
  const {
    dataSource,
    pagination,
    selectedRowKeys,
    selectedRows,
    visible,
    id,
    histpryList,
    filterParams,
    histpryPagination = {},
  } = state;

  // 副作用
  useEffect(() => {
    onSearch();
  }, []);

  // 查询数据
  const onSearch = useCallback((page_ = {}, payload = {}, noPage) => {
    setState({ selectedRowKeys: [], filterParams: payload });
    dispatch({
      type: 'advancePaymentRecord/listSettle',
      payload: {
        page: noPage ? {} : page_,
        ...payload,
        customizeUnitCode:
          'SFIN.ADVANCE_PAYMENT_RECORD_LIST.FILTER,SFIN.ADVANCE_PAYMENT_RECORD_LIST.GRID',
        creationDateStart:
          payload.creationDateStart && moment(payload.creationDateStart).format(DATETIME_MIN),
        creationDateEnd:
          payload.creationDateEnd && moment(payload.creationDateEnd).format(DATETIME_MAX),

        paymentTypeCode: 'ADVANCE_PAYMENT',
      },
      setPagination: (pagination_) => setState({ pagination: pagination_ }),
    }).then(([list, pagination_]) => {
      setState({
        dataSource: list,
        pagination: pagination_,
      });
    });
  }, []);

  // 提交
  const submitReturn = useCallback(
    throttle(() => {
      dispatch({
        type: 'advancePaymentRecord/batchValidateSubmit',
        payload: selectedRows,
      }).then((r) => {
        if (r) {
          if (r.validatedCode === 'SUCCESS') {
            dispatch({
              type: 'advancePaymentRecord/handleSubmitList',
              payload: [...selectedRows],
            }).then((res) => {
              if (res) {
                notification.success();
                onSearch();
              }
            });
          }
          if (r.validatedCode === 'WIATING_CONFIRM') {
            const { msg } = r;
            Modal.confirm({
              content: intl
                .get(`sfin.payment.view.message.verifyError`, { msg })
                .d(`校验资金计划失败,${msg},您是否继续提交？`),
              onOk: () => {
                dispatch({
                  type: 'advancePaymentRecord/handleSubmitList',
                  payload: [...selectedRows],
                }).then((res) => {
                  if (res) {
                    notification.success();
                    onSearch();
                  }
                });
              },
            });
          }
        }
      });
    }, 2000),
    [dispatch, onSearch, selectedRows]
  );

  // 新建
  const createList = () => {
    dispatch(
      routerRedux.push({
        pathname: `/sfin/advance-payment-record/detail`,
      })
    );
  };

  // 调转明细
  const routerInfo = (paymentHeaderId) => {
    dispatch(
      routerRedux.push({
        pathname: `/sfin/advance-payment-record/detail/`,
        search: paymentHeaderId ? querystring.stringify({ paymentHeaderId }) : null,
      })
    );
  };

  // 操作记录
  const history = (paymentHeaderId) => {
    setState({
      id: paymentHeaderId,
      visible: true,
    });
  };
  /**
   * 查询操作记录列表
   */
  const handleOperationRecordSearch = (page = {}) => {
    dispatch({
      type: 'advancePaymentRecord/fetchOperationRecordList',
      payload: {
        ...id,
        page,
      },
    }).then((result) => {
      if (result) {
        setState({
          histpryList: result.content,
          histpryPagination: createPagination(result),
        });
      }
    });
  };

  // 勾选数据
  // eslint-disable-next-line no-shadow
  const onRowSelectChange = (selectedRowKeys, selectedRows) => {
    setState({ selectedRowKeys, selectedRows });
  };

  const columns = useMemo(() => getColumns({ routerInfo, setState, history }), []);
  const x = useScrollX(columns);

  const filterFormProps = {
    getFilterData,
    onSearch,
    pagination,
    customizeFilterForm,
    // dataSource: {
    //   submittedDateFrom: moment(),
    //   submittedDateTo: moment(),
    // },
  };

  const operationRecordProps = {
    visible,
    pagination: histpryPagination,
    dataSource: histpryList,
    loading: historyLoading,
    handleOperationRecordSearch,
    hideModal: () => setState({ visible: false }),
    customizeTable,
  };

  const submit = (
    <PermissionButton
      permissionList={[
        {
          code: `srm.finance.payment.advance.ps.button.submit`,
          type: 'button',
        },
      ]}
      disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
      icon="check"
      onClick={submitReturn}
      loading={loading}
    >
      {intl.get(`hzero.common.button.submit`).d('提交')}
    </PermissionButton>
  );

  const creat = (
    <Button icon="plus" type="primary" onClick={createList}>
      {intl.get(`hzero.common.button.create`).d('新建')}
    </Button>
  );

  return (
    <Spin spinning={loading}>
      <Header
        title={intl
          .get('sinv.advancePaymentRecord.view.message.advancePaymentRecords')
          .d('创建预付款申请')}
      >
        {creat}
        {submit}
      </Header>
      <Content>
        <div className="table-list-search">
          <FilterForm {...filterFormProps} />
        </div>
        {customizeTable(
          {
            code: 'SFIN.ADVANCE_PAYMENT_RECORD_LIST.GRID',
          },
          <EditTable
            columns={columns}
            scroll={{ x }}
            bordered
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={{
              selectedRowKeys,
              // onChange: e => setState({ selectedRows: e }),
              onChange: onRowSelectChange,
            }}
            onChange={(page) => onSearch(page, filterParams)}
          />
        )}
        <Historys {...operationRecordProps} />
      </Content>
    </Spin>
  );
};
export default compose(
  connect(({ advancePaymentRecord, loading }) => ({
    advancePaymentRecord,
    loading:
      loading.effects['advancePaymentRecord/listSettle'] ||
      loading.effects[' advancePaymentRecord/handleSubmitList'],
    historyLoading: loading.effects['advancePaymentRecord/fetchOperationRecordList'],
  })),
  formatterCollections({
    code: [
      'sinv.advancePaymentRecord',
      'hzero.common',
      'entity.tenant',
      'entity.company',
      'entity.business',
      'entity.supplier',
      'sfin.payment',
    ],
  }),
  withCustomize({
    unitCode: ['SFIN.ADVANCE_PAYMENT_RECORD_LIST.FILTER', 'SFIN.ADVANCE_PAYMENT_RECORD_LIST.GRID'],
  })
)(Index);
