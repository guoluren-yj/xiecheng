import moment from 'moment';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNumber, sum, isFunction } from 'lodash';
import { Form, Checkbox, Popover } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender, enableRender, dateRender } from 'utils/renderer';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

const FormItem = Form.Item;
@Form.create()
export default class SupplierLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {};
  }

  @Bind()
  hasChangeData = (record, changeValues) => {
    const { dispatch, supplierContentChange } = this.props;
    if (!isEmpty(changeValues) && record.supplierCompanyId) {
      dispatch({
        type: 'bidHall/updateState',
        payload: {
          supplierLineChange: true,
          supplierContentChange: {
            ...supplierContentChange,
            [record.supplierCompanyId]: true,
          },
        },
      });
    }
  };

  /**
   * 选用状态->整包中标-todo,e.target.value
   * 当是否中标，全部勾选时，整包推荐也勾选上
   */
  @Bind()
  changeSuggestedFlag(e, quotationLineId, supplierCompanyId, record) {
    if (e.target.value === 1) {
      record.$form.setFieldsValue({
        allottedQuantity: null,
      });
    } else {
      record.$form.setFieldsValue({
        allottedQuantity: record.validQuotationQuantity,
      });
    }
    const { dataSource, onSetWholePackageFlag, onSetWholePackageFlagFalse } = this.props;
    const testData = dataSource[`${supplierCompanyId}`] && dataSource[`${supplierCompanyId}`].list;
    // 从dataSource中过滤出供应商行相同的未操作的明细数据
    const newDataSource = testData.filter(
      // eslint-disable-next-line
      (r) => r.supplierCompanyId == supplierCompanyId && r.quotationLineId !== quotationLineId
    );
    // 未操作的明细数据和正在操作的数据，都勾选时，设置整包推荐为1，否则为0
    if (
      newDataSource.every(
        (item) => item.$form && item.$form.getFieldValue('suggestedFlag') === 1
      ) &&
      !e.target.value
    ) {
      onSetWholePackageFlag(supplierCompanyId);
    } else {
      onSetWholePackageFlagFalse(supplierCompanyId);
    }
  }

  render() {
    const {
      header = {},
      loadingObj,
      dataSource = [],
      onSearch,
      supplierCompanyId,
      match,
      setPath,
      itemHeaderData = {},
      customizeTable,
    } = this.props;
    const testData = dataSource[`${supplierCompanyId}`] && dataSource[`${supplierCompanyId}`].list;
    const pagination =
      dataSource[`${supplierCompanyId}`] && dataSource[`${supplierCompanyId}`].pagination;
    // 审批页面
    const approvedPage =
      setPath(match.path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineNo`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineAmount`).d('行金额'),
        dataIndex: 'totalAmount',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.netAmount`).d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },

      header.multiCurrencyFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.quotationCurCode`).d('报价币种'),
            dataIndex: 'currencyCode',
            width: 100,
          }
        : '',
      header.multiCurrencyFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.exchangeRate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 100,
          }
        : '',

      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxIncludedPrice`).d('单价(含税)'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 100,
        render: numberSeparatorRender,
      },
      header.multiCurrencyFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.unitPriceIncludedTax`).d('本币含税单价'),
            dataIndex: 'baseQuotationPrice',
            width: 100,
            render: numberSeparatorRender,
          }
        : '',
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (_, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowBuyerViewFlag />
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        dataIndex: 'paymentTypeName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        dataIndex: 'paymentTerm',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.availableQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.wetherWinbid`).d('是否中标'),
        dataIndex: 'suggestedFlag',
        width: 100,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('suggestedFlag', {
                  initialValue: record.suggestedFlag,
                })(
                  <Checkbox
                    disabled={approvedPage || itemHeaderData.invalidFlag}
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={(e) =>
                      this.changeSuggestedFlag(
                        e,
                        record.quotationLineId,
                        record.supplierCompanyId,
                        record
                      )
                    }
                  />
                )}
              </FormItem>
            );
          } else {
            return <span>{enableRender(val)}</span>;
          }
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.allottedQuantity`).d('中标数量'),
        dataIndex: 'allottedQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.$form.getFieldValue('suggestedFlag') === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('allottedQuantity', {
                initialValue: record.allottedQuantity || record.validQuotationQuantity,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.allottedQuantity`).d('中标数量'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={approvedPage}
                />
              )}
            </Form.Item>
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('allottedQuantity', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
                  disabled
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.allottedPrice`).d('中标金额'),
        dataIndex: 'allottedPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.allottedRatio`).d('中标比例'),
        dataIndex: 'allottedRatio',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 110,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.inquiryHall.validPromisedDate`).d('承诺交货日期'),
        dataIndex: 'validPromisedDate',
        width: 110,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      header.explorationFlag
        ? {
            title: intl.get(`ssrc.common.supplierExplorationStatus`).d('是否踏勘'),
            dataIndex: 'supplierExplorationStatusMeaning',
            width: 100,
          }
        : '',
      header.explorationFlag
        ? {
            title: intl.get(`ssrc.common.supplierExplorationDate`).d('踏勘日期'),
            dataIndex: 'supplierExplorationDate',
            width: 100,
            render: dateRender,
          }
        : '',
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'validQuotationRemark',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.minPrice`).d('最低价'),
        dataIndex: 'minPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.bidHall.model.supplierBid.quotationStartValidTime`)
          .d('报价有效日期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.supplierBid.quotationEndValidTime`).d('报价有效日期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 100)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: approvedPage
              ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ'
              : 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
            cacheKey: supplierCompanyId,
          },
          <EditTable
            bordered
            rowKey="quotationLineId"
            onDataChange={this.hasChangeData}
            loading={
              loadingObj[supplierCompanyId] &&
              loadingObj[supplierCompanyId].fetchAloneSupplierItemLineLoading
            }
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={testData}
            pagination={pagination}
            onChange={(page) => onSearch(page, supplierCompanyId)}
          />
        )}
      </React.Fragment>
    );
  }
}
