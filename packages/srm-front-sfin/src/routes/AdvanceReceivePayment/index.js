/**
 * 创建预收款申请页
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
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { thousandBitSeparator } from '@/routes/utils';
import { FilterForm } from '../components/custom';
import { useSetState, useScrollX } from './utils';
import Historys from './OperationRecord';

const common = 'sinv.advanceReceivePayment.model.common.';

// 搜索框配置表
const getFilterData = ({ tenantId, form: { getFieldValue, setFieldsValue, registerField } }) => {
  return [
    {
      type: 'Input_',
      label: intl.get(`${common}receivedPaymentNum`).d('预收款申请单号'),
      dataIndex: 'paymentNum',
    },
    {
      type: 'Lov_',
      label: intl.get(`${common}clientCompany`).d('客户公司'),
      dataIndex: 'companyId',
      code: 'SPFM.USER_AUTH.CUSTOMER',
      textField: 'companyName',
      onChange: () => {
        setFieldsValue({ ouId: null });
      },
      queryParams: {
        tenantId,
      },
    },
    {
      type: 'Lov_',
      label: intl.get(`${common}ouName`).d('业务实体'),
      dataIndex: 'ouId',
      code: 'HPFM.OU',
      textField: 'ouName',
      queryParams: {
        companyId: getFieldValue('companyId'),
        tenantId,
      },
      disabled: !getFieldValue('companyId'),
    },
    {
      type: 'Lov_',
      label: intl.get(`${common}clientCompanys`).d('公司'),
      dataIndex: 'supplierCompanyId',
      code: 'SFIN.USER_AUTH.COMPANY_FOR_SUPPLIER',
      textField: 'displayValue',
      // queryParams: {
      //   userId: getCurrentUserId(),
      //   tenantId,
      //   organizationId: getUserOrganizationId(),
      // },
      onChange: (_, record) => {
        const { supplierId } = record;
        registerField('supplierId');
        setFieldsValue({
          supplierId,
        });
      },
      onOk: (record) => {
        const { companyId } = record;
        setFieldsValue({
          supplierCompanyId: isNil(companyId) ? '' : companyId,
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
      title: intl.get(`${common}receivedPaymentNum`).d('预收款申请单号'),
      dataIndex: 'paymentNum',
      width: 150,
      render: (val, { paymentHeaderId }) => (
        <a onClick={() => routerInfo(paymentHeaderId)}>{val}</a>
      ),
    },
    {
      title: intl.get(`${common}clientCompany`).d('客户公司'),
      dataIndex: 'companyName',
      width: 200,
    },
    {
      title: intl.get(`${common}ouName`).d('业务实体'),
      dataIndex: 'ouName',
      width: 120,
    },
    {
      title: intl.get(`${common}supplierCompanyNum`).d('公司编码'),
      dataIndex: 'supplierCompanyNum',
      width: 120,
    },
    {
      title: intl.get(`${common}supplierCompanyName`).d('公司名称'),
      dataIndex: 'supplierCompanyName',
      width: 150,
    },
    {
      title: intl.get(`${common}receivedPaymentAmount`).d(`收款金额`),
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
      title: intl.get(`${common}receivedPaymentDate`).d(`收款日期`),
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
      // dataIndex: 'invoiceFlagMeaning',
      width: 90,
      render: (_, { paymentHeaderId }) => (
        <a onClick={() => history({ paymentHeaderId })}>
          {intl.get(`${common}history`).d(`操作记录`)}
        </a>
      ),
    },
  ];
};

const Index = ({
  historyLoading = false,
  listSettleLoading = false,
  submitValidateLoadng = false,
  submitLoading = false,
  dispatch,
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
    histpryPagination,
  });

  const {
    dataSource,
    pagination,
    selectedRowKeys,
    selectedRows,
    visible,
    id,
    histpryList,
    histpryPagination,
    filterParams,
  } = state;

  // 副作用
  useEffect(() => {
    onSearch();
  }, []);

  // 查询数据
  const onSearch = useCallback((page_ = {}, payload = {}, noPage) => {
    setState({ selectedRowKeys: [], filterParams: payload });
    dispatch({
      type: 'advanceReceivePayment/listSettle',
      payload: {
        page: noPage ? {} : page_,
        ...payload,
        creationDateStart:
          payload.creationDateStart &&
          moment(payload.creationDateStart).format('YYYY-MM-DD 00:00:00'),
        creationDateEnd:
          payload.creationDateEnd && moment(payload.creationDateEnd).format('YYYY-MM-DD 23:59:59'),

        paymentTypeCode: 'ADVANCE_PAYMENT',
        camp: 'SUPPLIER',
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
        type: 'advanceReceivePayment/batchValidateSubmit',
        payload: selectedRows,
      }).then((r) => {
        if (r) {
          if (r.validatedCode === 'SUCCESS') {
            dispatch({
              type: 'advanceReceivePayment/handleSubmitList',
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
                  type: 'advanceReceivePayment/handleSubmitList',
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
    }, 1000),
    [dispatch, onSearch, selectedRows]
  );

  // 新建
  const createList = () => {
    dispatch(
      routerRedux.push({
        pathname: `/sfin/advance-receive-payment/detail`,
      })
    );
  };

  // 调转明细
  const routerInfo = (paymentHeaderId) => {
    dispatch(
      routerRedux.push({
        pathname: `/sfin/advance-receive-payment/detail`,
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
      type: 'advanceReceivePayment/fetchOperationRecordList',
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
  };

  const submit = (
    <Button
      disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
      icon="check"
      onClick={submitReturn}
      loading={submitValidateLoadng || submitLoading}
    >
      {intl.get(`hzero.common.button.submit`).d('提交')}
    </Button>
  );

  const creat = (
    <Button icon="plus" type="primary" onClick={createList}>
      {intl.get(`hzero.common.button.create`).d('新建')}
    </Button>
  );

  return (
    <Spin spinning={listSettleLoading}>
      <Header
        title={intl
          .get('sinv.advanceReceivePayment.view.message.advanceReceivedPayment')
          .d('创建预收款申请')}
      >
        {creat}
        {submit}
      </Header>
      <Content>
        <div className="table-list-search">
          <FilterForm {...filterFormProps} />
        </div>
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
        <Historys {...operationRecordProps} />
      </Content>
    </Spin>
  );
};

export default compose(
  connect(({ advanceReceivePayment, loading }) => ({
    advanceReceivePayment,
    listSettleLoading: loading.effects['advanceReceivePayment/listSettle'],
    historyLoading: loading.effects['advanceReceivePayment/fetchOperationRecordList'],
    submitValidateLoadng: loading.effects['advanceReceivePayment/batchValidateSubmit'],
    submitLoading: loading.effects['advanceReceivePayment/handleSubmitList'],
  })),
  formatterCollections({
    code: [
      'sfin.advanceReceivePayment',
      'hzero.common',
      'entity.supplier',
      'sinv.advanceReceivePayment',
      'sfin.payment',
    ],
  })
)(Index);
