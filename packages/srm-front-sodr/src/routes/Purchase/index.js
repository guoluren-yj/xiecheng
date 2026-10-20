import React, { useState, useEffect, useCallback, Fragment, useMemo, useRef } from 'react';
import { Button, Spin, Modal, Form, InputNumber } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { connect } from 'dva';
import moment from 'moment';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { compose, isNumber, sum } from 'lodash';
import querystring from 'querystring';

import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentOrganizationId, createPagination, getEditTableData } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import { FilterForm } from '../components/FilterForm';
import { formatAumont } from '../components/utils';

const FormItem = Form.Item;

const useSetState = (initialState) => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    (newState) => {
      set((prevState) => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

const tenantId = getCurrentOrganizationId();
const common = 'sodr.common.model.common';

const getFilterData = ({ form }) => {
  const { getFieldValue } = form;
  return [
    {
      type: 'Input_',
      label: intl.get('spcm.orderMaintenanceEntry.model.common.orderNumber').d('采购协议编号'),
      dataIndex: 'pcNum',
    },
    {
      type: 'Input_',
      label: intl.get('sodr.orderMaintain.sourceFrom.pcName').d('采购协议名称'),
      dataIndex: 'pcName',
    },
    {
      type: 'Lov_',
      label: intl.get('sodr.orderMaintain.sourceFrom.supplierCompanyId').d('协议对象'),
      dataIndex: 'supplierCompanyId',
      code: 'SPCM.USER_AUTH.SUPPLIER',
      textField: 'supplierCompanyName',
      queryParams: {
        tenantId,
      },
    },
    {
      type: 'Lov_',
      label: intl.get(`entity.company.tag`).d('公司'),
      dataIndex: 'companyId',
      code: 'SPCM.USER_AUTH.COMPANY',
      textField: 'companyName',
      queryParams: {
        tenantId,
      },
    },
    {
      type: 'Select_',
      label: intl.get('sodr.orderMaintain.sourceFrom.pcKindCode').d('协议性质'),
      dataIndex: 'pcKindCode',
      code: 'SPCM.CONTRACT.KIND',
    },
    {
      type: 'Lov_',
      label: intl.get('sodr.orderMaintain.sourceFrom.pcType').d('协议类型'),
      dataIndex: 'pcTypeId',
      code: 'SPCM.PC_TYPE',
      textField: 'pcTypeName',
      queryParams: {
        companyId: getFieldValue('companyId'),
        tenantId,
      },
    },
    {
      type: 'Lov_',
      label: intl.get('sodr.orderMaintain.sourceFrom.pcHeaderId').d('主协议编码'),
      dataIndex: 'pcHeaderId',
      code: 'SPCM.CONTRACT',
      textField: 'displaySupplierName',
    },
    {
      type: 'Input_',
      label: intl.get('entity.roles.creator').d('创建人'),
      dataIndex: 'createdByName',
    },
    {
      type: 'DatePicker_',
      label: intl.get('hzero.common.date.creation.from').d('创建日期从'),
      dataIndex: 'creationDateFrom',
      showTime: false,
      dateFlag: 'date',
      disabledDate: (currentDate) =>
        getFieldValue('creationDateTo') &&
        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day'),
    },
    {
      type: 'DatePicker_',
      label: intl.get('hzero.common.date.creation.to').d('创建日期至'),
      dataIndex: 'creationDateTo',
      showTime: false,
      dateFlag: 'date',
      disabledDate: (currentDate) =>
        getFieldValue('creationDateFrom') &&
        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day'),
    },
    {
      type: 'Input_',
      label: intl.get('sodr.orderMaintain.sourceFrom.itemName').d('物品'),
      dataIndex: 'itemName',
      // code: 'SPRM.ITEM',
      // textField: 'itemName',
      // params: { tenantId },
    },
  ];
};
const purchase = 'purchase';

const InfoChangeApproval = ({
  history: { push = () => {} },
  dispatch = () => {},
  fetchLineLoading = false,
  creationLoading = false,
}) => {
  const [state, setState] = useSetState({
    selectedRowKeys: [],
    dataSource: [],
    pagination: {},
  });

  const { selectedRowKeys, dataSource, pagination } = state;

  useEffect(() => {
    onSearch();
  }, []);

  const validator = useCallback((record, value, callback) => {
    const { orderQuantityFlag, residueOrderQuantity } = record;
    if (orderQuantityFlag === 1 && residueOrderQuantity < value) {
      callback(intl.get(`sodr.order.view.message.validator`).d('本次下单数量大于剩余可下单数量'));
    }
    if (value <= 0) {
      callback(intl.get(`sodr.order.view.message.mustExceedZero`).d('本次下单数量必须大于零'));
    }
    callback();
  }, []);

  const creation = useCallback(() => {
    Modal.confirm({
      title: intl.get('sodr.orderMaintenanceEntry.view.confirmMsg.creation').d('确认创建？'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        const values =
          getEditTableData(
            selectedRowKeys.map((i) => dataSource.find((o) => o.pcSubjectId === i)),
            ['_status']
          ) || [];
        if (values.length === 0) return;
        dispatch({
          type: 'orderMaintenanceEntry/creation',
          payload: values,
        }).then((res) => {
          onSearch();
          if (res) {
            notification.success();
            setState({ selectedRowKeys: [] });
            push({
              pathname: '/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation',
              search: `?poHeaderId=${res.poHeaderId}&source=contract`,
            });
          }
        });
      },
    });
  }, [selectedRowKeys, dataSource]);

  const onSearch = useCallback((page = {}, payload = {}) => {
    dispatch({
      type: 'orderMaintenanceEntry/fetchLine',
      payload: {
        page,
        ...payload,
        creationDateTo: payload.creationDateTo
          ? moment(payload.creationDateTo).format(DATETIME_MAX)
          : undefined,
        creationDateFrom: payload.creationDateFrom
          ? moment(payload.creationDateFrom).format(DATETIME_MIN)
          : undefined,
      },
    }).then((res = {}) => {
      setState({
        dataSource: (res.content || []).map((n) => ({ ...n, _status: 'update' })),
        pagination: createPagination(res),
      });
    });
  }, []);

  const filterFormProps = {
    onSearch,
    loading: fetchLineLoading,
    getFilterData,
    pagination,
  };

  const columns = [
    {
      title: intl.get('spcm.orderMaintenanceEntry.model.common.pcNum').d('采购协议编号'),
      dataIndex: 'pcNum',
      width: 180,
      render: (val, { pcHeaderId }) => (
        <a
          onClick={() => {
            push({
              pathname: `/sodr/purchase-order-maintain/purchase/detail`,
              search: pcHeaderId
                ? querystring.stringify({ pcHeaderId, purchase })
                : querystring.stringify({ purchase }),
            });
          }}
        >
          {val}
        </a>
      ),
    },
    {
      title: intl.get('sodr.orderMaintenanceEntry.model.common.lineNum').d('行号'),
      dataIndex: 'lineNum',
      width: 120,
    },
    {
      title: intl.get('sodr.orderMaintenanceEntry.model.common.pcName').d('采购协议名称'),
      dataIndex: 'pcName',
      width: 120,
    },

    {
      title: intl.get(`${common}.supplierCompanyNum`).d('供应商编码'),
      dataIndex: 'supplierCompanyNum',
      width: 120,
    },
    {
      title: intl.get(`${common}.supplierCompanyName`).d('供应商名称'),
      dataIndex: 'supplierCompanyName',
      width: 120,
    },
    {
      title: intl.get(`${common}.createdByName`).d('创建人'),
      dataIndex: 'createdByName',
      width: 120,
    },
    {
      title: intl.get(`${common}.creationDate`).d('创建日期'),
      dataIndex: 'creationDate',
      width: 120,
      render: dateRender,
    },
    {
      title: intl.get(`${common}.itemCode`).d('物品编码'),
      dataIndex: 'itemCode',
      width: 120,
    },
    {
      title: intl.get(`${common}.itemName`).d('物品名称'),
      dataIndex: 'itemName',
      width: 120,
    },
    {
      title: intl.get(`${common}.categoryCode`).d('物料分类'),
      dataIndex: 'categoryName',
      width: 120,
    },
    {
      title: intl.get(`${common}.currencyCode`).d('币种'),
      dataIndex: 'currencyCode',
      width: 120,
    },
    {
      title: intl.get(`${common}.uomCode`).d('单位'),
      dataIndex: 'uomName',
      width: 120,
    },
    {
      title: intl.get(`${common}.quantitys`).d('数量'),
      dataIndex: 'quantity',
      width: 120,
      render: (text) => formatAumont(text),
    },
    {
      title: intl.get(`${common}.receiptsOrderQuantity`).d('本次下单数量'),
      dataIndex: 'receiptsOrderQuantity',
      width: 120,
      render: (val, record) => {
        if (!selectedRowKeys.find((i) => record.pcSubjectId === i)) {
          return record.residueOrderQuantity;
        }
        return (
          <FormItem>
            {record.$form.getFieldDecorator('receiptsOrderQuantity', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${common}.receiptsOrderQuantity`).d('本次下单数量'),
                  }),
                },
                {
                  validator: (_, value, callback) => validator(record, value, callback),
                },
              ],
            })(<InputNumber />)}
          </FormItem>
        );
      },
    },
    {
      title: intl.get(`${common}.chanageOrderQuantity`).d('已创建订单数量'),
      dataIndex: 'chanageOrderQuantity',
      width: 120,
    },
    {
      title: intl.get(`${common}.residueOrderQuantity`).d('剩余可下单数量'),
      dataIndex: 'residueOrderQuantity',
      width: 120,
    },
    {
      title: intl.get(`${common}.taxRates`).d('税率(%)'),
      dataIndex: 'taxRate',
      width: 120,
    },
    {
      title: intl.get(`${common}.unitPrice`).d('不含税单价'),
      dataIndex: 'unitPrice',
      width: 120,
    },
    {
      title: intl.get(`${common}.lineAmount`).d('不含税金额'),
      dataIndex: 'lineAmount',
      width: 120,
    },
    {
      title: intl.get(`${common}.enteredTaxIncludedPrice`).d('含税单价'),
      dataIndex: 'enteredTaxIncludedPrice',
      width: 120,
    },
    {
      title: intl.get(`${common}.taxIncludedLineAmount`).d('含税金额'),
      dataIndex: 'taxIncludedLineAmount',
      width: 120,
    },
    {
      title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
      dataIndex: 'unitPriceBatch',
      width: 100,
    },
    {
      title: intl.get(`${common}.deliverDate`).d('交付日期'),
      dataIndex: 'deliverDate',
      width: 120,
      render: dateRender,
    },
    {
      title: intl.get(`${common}.companyName`).d('公司'),
      dataIndex: 'companyName',
      width: 120,
    },
    {
      title: intl.get(`${common}.ouName`).d('业务实体'),
      dataIndex: 'ouName',
      width: 120,
    },
    {
      title: intl.get(`${common}.purchaseOrgName`).d('采购组织'),
      dataIndex: 'purchaseOrgName',
      width: 120,
    },
    {
      title: intl.get(`${common}.agentName`).d('采购员'),
      dataIndex: 'agentName',
      width: 120,
    },
    {
      title: intl.get(`${common}.mainPcNum`).d('主协议编号'),
      dataIndex: 'mainPcNum',
      width: 120,
    },
    {
      title: intl.get(`${common}.remarks`).d('备注'),
      dataIndex: 'remark',
      width: 120,
    },
  ];

  const x = useMemo(() => sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))), []);
  const filterRef = useRef();
  return (
    <Fragment>
      <Header
        title={intl.get('sodr.orderMaintenanceEntry.view.message.purchase').d('引用采购协议')}
        backPath="/sodr/purchase-order-maintain/list"
      >
        <Button
          disabled={!selectedRowKeys.length}
          icon="plus"
          type="primary"
          onClick={creation}
          loading={creationLoading}
        >
          {intl.get('hzero.common.button.creation').d('创建')}
        </Button>
      </Header>
      <Content>
        <Spin spinning={fetchLineLoading || creationLoading}>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} ref={filterRef} />
          </div>
          <EditTable
            bordered
            rowKey="pcSubjectId"
            columns={columns}
            rowSelection={{
              selectedRowKeys,
              onChange: (list) => setState({ selectedRowKeys: list }),
            }}
            dataSource={dataSource}
            onChange={(page) => {
              onSearch(page, filterRef.current.getFieldsValue());
            }}
            pagination={pagination}
            scroll={{ x }}
          />
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sodr.orderMaintain',
      'spcm.orderMaintenanceEntry',
      'sodr.orderMaintenanceEntry',
      'entity.company',
      'entity.roles',
      'sodr.order',
      'sodr.common',
    ],
  }),
  connect(({ orderMaintenanceEntry, loading }) => ({
    orderMaintenanceEntry,
    fetchLineLoading: loading.effects['orderMaintenanceEntry/fetchLine'],
    creationLoading: loading.effects['orderMaintenanceEntry/creation'],
  }))
)(InfoChangeApproval);
