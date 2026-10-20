import React, { useState, useEffect, useCallback, Fragment, useMemo, useRef } from 'react';
import { Button, Spin, Modal, Form, InputNumber, Tooltip } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { connect } from 'dva';
import moment from 'moment';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { compose, isNumber, sum, isEmpty, uniqBy, throttle } from 'lodash';
import querystring from 'querystring';
import EditTable from 'components/EditTable';
import DocFlow from '_components/DocFlow';
import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  createPagination,
  getEditTableData,
  filterNullValueObject,
} from 'utils/utils';
import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { math } from 'choerodon-ui/dataset';
import { BigNumber } from 'bignumber.js';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { openModal } from '@/routes/components/AgreementLadderPrice';
import { FilterForm } from './FilterForm';
import {
  parseAumont,
  formatAumont,
  queryCommonDoubleUomConfig,
  getDynamicLabel,
} from '@/routes/components/utils';

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

const InfoChangeApproval = (props) => {
  const {
    customizeFilterForm,
    customizeTable,
    history: { push = () => {} },
    dispatch = () => {},
    fetchLineLoading = false,
    creationLoading = false,
    checkLoading = false,
    createCombineLoading = false,
    orderMaintenanceEntry = {},
    custLoading = true,
    pendingFlagLoading = false,
  } = props;

  const [state, setState] = useSetState({
    selectedRowKeys: [],
    selectedRows: [],
    dataSource: [],
    pagination: {},
    doubleUnitEnabled: 0,
  });

  const filterRef = useRef();
  const {
    visible,
    orderMaintenanceEntryQuery = {},
    orderMaintenanceEntryPage = {},
  } = orderMaintenanceEntry;
  const { selectedRowKeys, selectedRows, dataSource, pagination, doubleUnitEnabled } = state;
  const [peddingSelectedRows, setPeddingSelectedRows] = useState([]);

  const search = filterRef?.current;
  // 初始化表单查询
  useEffect(() => {
    if (search?.setFieldsValue && !custLoading) {
      initForm({
        ...orderMaintenanceEntryQuery,
        ...filterNullValueObject(search.getFieldsValue()),
      });
    }
    if (search?.setFieldsValue && !custLoading) {
      // 修复Lov注册textField字段失效问题
      const registerFields = Object.keys(filterNullValueObject(orderMaintenanceEntryQuery)); // 需要注册的表单字段
      const registeredFields = Object.keys(search?.fieldsStore?.fieldsMeta); // 已注册的表单字段
      registerFields.forEach((fieldName) => {
        if (search?.registerField && !registeredFields.includes(fieldName)) {
          search.registerField(fieldName);
        }
      });
      search.setFieldsValue({
        ...filterNullValueObject(orderMaintenanceEntryQuery),
      });
    }
  }, [Boolean(search?.setFieldsValue), custLoading]);

  useEffect(() => {
    fetchDoubleUom();
  }, []);

  const fetchDoubleUom = async () => {
    const result = await queryCommonDoubleUomConfig();
    setState({ doubleUnitEnabled: result });
  };

  // useEffect(() => {
  // console.log('orderMaintenanceEntryQuery', orderMaintenanceEntryQuery);
  //   if (filterRef.current?.setFieldsValue && !custLoading) {
  //     filterRef.current.setFieldsValue({ ...orderMaintenanceEntryQuery });
  //   }
  // }, [Boolean(filterRef.current), custLoading]);

  const initForm = (data) => {
    const _creationDateTo = data.creationDateTo;
    const _creationDateFrom = data.creationDateFrom;
    const creationDateTo = _creationDateTo
      ? moment(_creationDateTo).format(DATETIME_MAX)
      : undefined;
    const creationDateFrom = _creationDateFrom
      ? moment(_creationDateFrom).format(DATETIME_MIN)
      : undefined;
    const { pageSize } = orderMaintenanceEntryPage;
    onSearch({ pageSize }, { ...data, creationDateTo, creationDateFrom });
  };

  // 修改数据
  const updateState = (payload) => {
    dispatch({
      type: 'orderMaintenanceEntry/updateState',
      payload,
    });
  };

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
    const dataSourceSelectedRows = dataSource.filter((n) =>
      selectedRowKeys.includes(n.pcSubjectId)
    );
    // if (
    //   dataSourceSelectedRows.filter((n) => !n.receiptsOrderQuantity || n.receiptsOrderQuantity < 0)
    //     .length > 0
    // ) {
    //   notification.error({
    //     message: intl
    //       .get(`sodr.orderMaintain.model.quotePurchase.thisOrderQuantityNotNullAndZero`)
    //       .d('本次下单数量必须大于零，请检查'),
    //   });
    //   return;
    // }

    Modal.confirm({
      title: intl.get('sodr.orderMaintenanceEntry.view.confirmMsg.creation').d('确认创建？'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: throttle(
        () => {
          const newSelectedRows = [];
          // dataSourceSelectedRows.map((n) => newSelectedRows.push(n));
          const _editTableData = (getEditTableData(dataSourceSelectedRows) || []).map((i) => ({
            ...i,
            uomCodeTemp: doubleUnitEnabled ? i.secondaryUomCode : i.uomCode,
          }));
          newSelectedRows.push(..._editTableData);
          const newSelectedKeys = newSelectedRows.map((n) => n.pcSubjectId);
          selectedRows.map((n) => {
            if (
              !newSelectedKeys.includes(n.pcSubjectId) &&
              selectedRowKeys.includes(n.pcSubjectId)
            ) {
              newSelectedRows.push(n);
            }
            return n;
          });
          const newSelectedRowsForNew = newSelectedRows.map((item) => {
            const newUniPrice =
              item.unitPrice && !math.isZero(item.unitPrice)
                ? new BigNumber(parseAumont(item.unitPrice, item.defaultPrecision))
                : item.unitPrice;
            const newEnteredTaxIncludedPrice =
              item.enteredTaxIncludedPrice && !math.isZero(item.enteredTaxIncludedPrice)
                ? new BigNumber(parseAumont(item.enteredTaxIncludedPrice, item.defaultPrecision))
                : item.enteredTaxIncludedPrice;
            return {
              ...item,
              unitPrice: newUniPrice,
              enteredTaxIncludedPrice: newEnteredTaxIncludedPrice,
            };
          });
          dispatch({
            type: 'orderMaintenanceEntry/check',
            payload: {
              sourceCode: 'CONTRACT_ORDER',
            },
          }).then((rec) => {
            if (rec === 1) {
              if (newSelectedRowsForNew.length > 0) {
                dispatch({
                  type: 'orderMaintenanceEntry/createCombineProtocol',
                  payload: newSelectedRowsForNew,
                }).then((res) => {
                  if (res && !res.failed && res.length > 1) {
                    push({
                      pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/tab-purchase-agreement`,
                      search: `?poHeaderId=${res.map((n) => n.poHeaderId)}&cacheKey=${
                        res[0].cacheKey
                      }&source=contract`,
                    });
                    notification.success();
                  } else if (res && !res.failed && res.length === 1) {
                    notification.success();
                    setState({ selectedRowKeys: [] });
                    setPeddingSelectedRows([]);
                    push({
                      pathname:
                        '/sodr/purchase-order-maintain/quote-purchase-requisition/purchase-agreement',
                      search: `?poHeaderId=${res.map((n) => n.poHeaderId)}&source=contract`,
                    });
                  }
                });
              }
            } else if (rec === 0) {
              if (newSelectedRowsForNew.length > 0) {
                dispatch({
                  type: 'orderMaintenanceEntry/creation',
                  payload: newSelectedRowsForNew,
                }).then((res) => {
                  if (res && !res.failed) {
                    notification.success();
                    setState({ selectedRowKeys: [] });
                    setPeddingSelectedRows([]);
                    push({
                      pathname:
                        '/sodr/purchase-order-maintain/quote-purchase-requisition/purchase-agreement',
                      search: `?poHeaderId=${res.poHeaderId}&source=contract`,
                    });
                  }
                });
              }
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }, [selectedRowKeys, dataSource]);

  // 暂挂按钮
  const handleHold = throttle(
    () => {
      const one = peddingSelectedRows.every((item) => item.pendingFlag === 1);
      const zero = peddingSelectedRows.every((item) => item.pendingFlag === 0);
      if (!one && !zero) {
        return notification.warning({
          message: intl
            .get('sodr.sourceFrom.view.message.checkMark')
            .d('勾选行暂挂标识不一致,请检查!'),
        });
      }
      const resultList = peddingSelectedRows.map((n) => {
        return {
          tenantId: n.tenantId,
          pendingFlag: n.pendingFlag === 1 ? 0 : 1,
          type: 'CONTRACT',
          pcSubjectId: n.pcSubjectId,
          sourceContractConfigId: n.sourceContractConfigId,
          poSourceContractConfigObjectVersionNumber: n.poSourceContractConfigObjectVersionNumber,
        };
      });
      dispatch({
        type: 'orderMaintenanceEntry/pendingFlag',
        payload: resultList,
      }).then((res) => {
        if (res) {
          onSearch({}, filterRef.current.getFieldsValue(), 1);
        }
      });
    },
    THROTTLE_TIME,
    { trailing: false }
  );

  const onSearch = (page = {}, payload = {}, buttonFlag) => {
    const { total } = orderMaintenanceEntryPage || {};
    const dataSourceSelectedRows = dataSource.filter((n) =>
      selectedRowKeys.includes(n.pcSubjectId)
    );
    if (buttonFlag) {
      setState({ selectedRowKeys: [] });
      setPeddingSelectedRows([]);
    }
    // 翻页数据校验
    if (validateFieldsWhenPaging(dataSourceSelectedRows, buttonFlag)) {
      return;
    }
    // 翻页时获得当前页选中行数据
    const newSelectedRows = [];
    if (selectedRowKeys.length > 0) {
      // dataSourceSelectedRows.map((n) => newSelectedRows.push(n));
      newSelectedRows.push(...getEditTableData(dataSourceSelectedRows));
      const newSelectedKeys = newSelectedRows.map((n) => n.pcSubjectId);
      selectedRows.map((n) => {
        if (!newSelectedKeys.includes(n.pcSubjectId) && selectedRowKeys.includes(n.pcSubjectId)) {
          newSelectedRows.push(n);
        }
        return n;
      });
    }
    setState({ selectedRows: newSelectedRows });
    const _creationDateTo = payload.creationDateTo;
    const _creationDateFrom = payload.creationDateFrom;
    const _pendingFlag = payload.pendingFlag === undefined ? '0' : payload.pendingFlag;
    dispatch({
      type: 'orderMaintenanceEntry/fetchLine',
      payload: {
        page,
        ...payload,
        asyncCountFlag: 'DEFAULT',
        pendingFlag: _pendingFlag,
        creationDateTo: _creationDateTo ? moment(_creationDateTo).format(DATETIME_MAX) : undefined,
        creationDateFrom: _creationDateFrom
          ? moment(_creationDateFrom).format(DATETIME_MIN)
          : undefined,
        oldTotalElements: buttonFlag ? undefined : total,
        customizeUnitCode:
          'SODR.REFERENCE_PURCHASE_AGREEMENT.LINE,SODR.REFERENCE_PURCHASE_AGREEMENT.FILTER',
      },
    }).then((res = {}) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'orderMaintenanceEntry/fetchLinePage',
          payload: {
            page,
            ...payload,
            asyncCountFlag: 'DEFAULT',
            pendingFlag: _pendingFlag,
            creationDateTo: _creationDateTo
              ? moment(_creationDateTo).format(DATETIME_MAX)
              : undefined,
            creationDateFrom: _creationDateFrom
              ? moment(_creationDateFrom).format(DATETIME_MIN)
              : undefined,
            customizeUnitCode:
              'SODR.REFERENCE_PURCHASE_AGREEMENT.LINE,SODR.REFERENCE_PURCHASE_AGREEMENT.FILTER',
          },
        }).then((result) => {
          if (result && !result.failed) {
            setState({
              pagination: createPagination(result),
            });
          }
        });
      } else {
        setState({
          pagination: createPagination(res),
        });
      }
      dispatch({
        type: 'orderMaintenanceEntry/updateState',
        payload: {
          orderMaintenanceEntryQuery: filterRef?.current?.getFieldsValue() || {},
        },
      });
      const selectedRowsKeys = selectedRows.map((n) => n.pcSubjectId);
      const newDataSource =
        res?.content?.map((n) => {
          if (selectedRowsKeys.includes(n.pcSubjectId)) {
            const _selectedRows = selectedRows.filter((m) => m.pcSubjectId === n.pcSubjectId);
            // 此处selectedRows的信息为缓存，需要最新的数据从结果中取
            const _obj = res?.content?.find((t) => t.pcSubjectId === _selectedRows[0].pcSubjectId);
            const {
              poSourceContractConfigObjectVersionNumber,
              pendingFlag,
              sourceContractConfigId,
            } = _obj;
            return {
              ..._selectedRows[0],
              poSourceContractConfigObjectVersionNumber,
              sourceContractConfigId,
              pendingFlag,
              _status: 'update',
            };
          } else {
            return { ...n, receiptsOrderQuantity: n.residueOrderQuantity, _status: 'update' };
          }
        }) || [];

      setState({
        dataSource: (newDataSource || []).map((n) => ({ ...n, _status: 'update' })),
        // pagination: createPagination(res),
      });
    });
  };

  const validateFieldsWhenPaging = useCallback((dataSourceSelectedRows, buttonFlag) => {
    let errorFlag = false;
    if (buttonFlag) return errorFlag;
    dataSourceSelectedRows.map((record) => {
      record.$form.validateFields((err, values) => {
        if (err && 'receiptsOrderQuantity' in err) {
          if (!values.receiptsOrderQuantity) {
            notification.error({
              message: intl
                .get(`sodr.orderMaintain.model.quotePurchase.notNullError`)
                .d('当前页勾选数据信息有必输信息未维护，请检查'),
            });
            errorFlag = true;
          } else if (values.receiptsOrderQuantity <= 0) {
            notification.error({
              message: intl
                .get(`sodr.orderMaintain.model.quotePurchase.notZeroError`)
                .d('勾选行创建订单数量必须大于零，请检查'),
            });
            errorFlag = true;
          } else if (
            record.orderQuantityFlag === 1 &&
            values.receiptsOrderQuantity > record.residueOrderQuantity
          ) {
            notification.error({
              message: intl
                .get(`sodr.orderMaintain.model.quotePurchase.notGreaterError`)
                .d('勾选行创建订单数量不可大于可创建订单数量，请检查'),
            });
            errorFlag = true;
          }
        }
      });
      return record;
    });
    return errorFlag;
  }, []);

  // const receiptsOrderQuantityChange = useCallback((item, record) => {
  //   const dataSourceRows = dataSource?.map((n) => {
  //     if (n.pcSubjectId && n.pcSubjectId === record.pcSubjectId) {
  //       return {
  //         ...n,
  //         receiptsOrderQuantity: parseFloat(item.target.value.replace(',', '')),
  //       };
  //     } else {
  //       return n;
  //     }
  //   });
  //   setState({ dataSource: dataSourceRows });
  // });

  const filterFormProps = {
    onSearch,
    loading: fetchLineLoading,
    getFilterData,
    customizeFilterForm,
    customizeTable,
    dispatch,
    initForm,
    dataSource: { ...orderMaintenanceEntryQuery },
    visible,
    updateState,
    orderMaintenanceEntry,
    // pagination,
  };

  const rendererLadderPrice = (_, record) => {
    const { pcSubjectId, ladderQuotationFlag } = record;
    const title = intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格');
    return (
      ladderQuotationFlag === 1 &&
      pcSubjectId && <a onClick={() => openModal({ pcSubjectId }, { title })}>{title}</a>
    );
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
      render: (_, { supplierCompanyNum, supplierNum }) => supplierCompanyNum || supplierNum,
    },
    {
      title: intl.get(`${common}.supplierCompanyName`).d('供应商名称'),
      dataIndex: 'supplierCompanyName',
      width: 120,
      render: (_, { supplierCompanyName, supplierName }) => supplierCompanyName || supplierName,
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
    doubleUnitEnabled && {
      title: intl.get(`${common}.uomCode`).d('单位'),
      width: 120,
      dataIndex: 'secondaryUomName',
      render: (_, { secondaryUomCodeAndName }) => secondaryUomCodeAndName,
    },
    doubleUnitEnabled && {
      title: intl.get(`${common}.quantitys`).d('数量'),
      width: 120,
      dataIndex: 'secondaryQuantity',
      render: (text, { secondaryUomPrecision }) => formatAumont(text, secondaryUomPrecision),
    },
    {
      title: getDynamicLabel(doubleUnitEnabled, 'uom'),
      dataIndex: 'uomName',
      width: 120,
      render: (_, { uomCodeAndName }) => uomCodeAndName,
    },
    {
      title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
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
          return formatAumont(record.residueOrderQuantity);
        }
        return (
          <FormItem>
            {record.$form.getFieldDecorator('receiptsOrderQuantity', {
              initialValue: val || record.residueOrderQuantity,
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
            })(
              <InputNumber
                parser={(value) =>
                  parseAumont(
                    value,
                    doubleUnitEnabled ? record.secondaryUomPrecision : record.uomPrecision
                  )
                }
                allowThousandth="true"
                // onBlur={(item) => {
                //   receiptsOrderQuantityChange(item, record);
                // }}
              />
            )}
          </FormItem>
        );
      },
    },
    {
      title: intl.get(`${common}.chanageOrderQuantity`).d('已创建订单数量'),
      dataIndex: 'chanageOrderQuantity',
      width: 120,
      render: (val) => formatAumont(val),
    },
    {
      title: intl.get(`${common}.residueOrderQuantity`).d('剩余可下单数量'),
      dataIndex: 'residueOrderQuantity',
      width: 120,
      render: (val) => formatAumont(val),
    },
    {
      title: intl.get(`${common}.taxRates`).d('税率(%)'),
      dataIndex: 'taxRate',
      width: 120,
    },
    {
      title: intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格'),
      width: 120,
      dataIndex: 'ladderPrice',
      render: rendererLadderPrice,
    },
    {
      title: intl.get(`${common}.unitPrice`).d('不含税单价'),
      dataIndex: 'unitPrice',
      width: 120,
      render: (value, record) => formatAumont(value, record.defaultPrecision),
    },
    {
      title: intl.get(`${common}.lineAmount`).d('不含税金额'),
      dataIndex: 'lineAmount',
      width: 120,
      render: (value, record) => formatAumont(value, record.financialPrecision, true),
    },
    {
      title: intl.get(`${common}.enteredTaxIncludedPrice`).d('含税单价'),
      dataIndex: 'enteredTaxIncludedPrice',
      width: 120,
      render: (value, record) => formatAumont(value, record.defaultPrecision),
    },
    {
      title: intl.get(`${common}.taxIncludedLineAmount`).d('含税金额'),
      dataIndex: 'taxIncludedLineAmount',
      width: 120,
      render: (value, record) => formatAumont(value, record.financialPrecision, true),
    },
    {
      title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
      dataIndex: 'unitPriceBatch',
      width: 100,
      render: (val) => formatAumont(val),
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
      render: (val) => (
        <Tooltip title={val}>
          <span
            style={{
              width: '100%',
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {val}
          </span>
        </Tooltip>
      ),
    },
    {
      width: 100,
      dataIndex: 'docFlow',
      title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
      render: (_, record) => <DocFlow tableName="spcm_pc_subject" tablePk={record.pcSubjectId} />,
    },
  ].filter((i) => i);

  const x = useMemo(() => sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))), []);
  // const filterRef = useRef();
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
          loading={creationLoading || checkLoading || createCombineLoading || pendingFlagLoading}
        >
          {intl.get('hzero.common.button.creation').d('创建')}
        </Button>
        {peddingSelectedRows.every((item) => item.pendingFlag === 1) &&
        !isEmpty(peddingSelectedRows) ? (
          <Button
            loading={pendingFlagLoading || creationLoading || checkLoading || createCombineLoading}
            disabled={selectedRowKeys.length === 0}
            onClick={handleHold}
            icon="unlock"
          >
            {intl.get(`hzero.common.button.cancelHold`).d('取消暂挂')}
          </Button>
        ) : (
          <Button
            loading={pendingFlagLoading || creationLoading || checkLoading || createCombineLoading}
            disabled={selectedRowKeys.length === 0}
            onClick={handleHold}
            icon="lock"
          >
            {intl.get(`hzero.common.button.hold`).d('暂挂')}
          </Button>
        )}
      </Header>
      <Content>
        <Spin spinning={fetchLineLoading || creationLoading}>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} ref={filterRef} />
          </div>
          {customizeTable(
            {
              code: 'SODR.REFERENCE_PURCHASE_AGREEMENT.LINE',
            },
            <EditTable
              bordered
              rowKey="pcSubjectId"
              columns={columns}
              rowSelection={{
                selectedRowKeys,
                // selectedRows: peddingSelectedRows,
                onChange: (list, row) => {
                  const selctRow = uniqBy(row, 'pcSubjectId');
                  setPeddingSelectedRows(selctRow);
                  setState({ selectedRowKeys: list });
                },
              }}
              dataSource={dataSource}
              onChange={(page) => {
                onSearch(page, filterRef.current.getFieldsValue());
              }}
              pagination={{ ...pagination, showQuickJumper: true }}
              scroll={{ x, y: 'calc(100vh - 390px)' }}
            />
          )}
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
  withCustomize({
    unitCode: [
      'SODR.REFERENCE_PURCHASE_AGREEMENT.FILTER',
      'SODR.REFERENCE_PURCHASE_AGREEMENT.LINE',
    ],
  }),
  connect(({ orderMaintenanceEntry, loading }) => ({
    orderMaintenanceEntry,
    fetchLineLoading: loading.effects['orderMaintenanceEntry/fetchLine'],
    creationLoading: loading.effects['orderMaintenanceEntry/creation'],
    checkLoading: loading.effects['orderMaintenanceEntry/check'],
    createCombineLoading: loading.effects['orderMaintenanceEntry/createCombineProtocol'],
    pendingFlagLoading: loading.effects['orderMaintenanceEntry/pendingFlag'],
  }))
)(InfoChangeApproval);
