import React, { Component } from 'react';
import moment from 'moment';
import { Form, Popover, Checkbox } from 'hzero-ui';
import { isEmpty, isNumber, sum, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { enableRender, dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

const FormItem = Form.Item;
@Form.create()
export default class ItemDimension extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {};
  }

  // 检查表格内容值发生变化，更新redux
  hasChangeData = (record, changeValues) => {
    const { dispatch, itemContentChange } = this.props;
    if (!isEmpty(changeValues) && record.bidLineItemId) {
      dispatch({
        type: 'bidHall/updateState',
        payload: {
          itemLineChange: true,
          itemContentChange: {
            ...itemContentChange,
            [record.bidLineItemId]: true,
          },
        },
      });
    }
  };

  /**
   * 改变tabs
   */
  @Bind()
  onChangesuggestedFlag(e, record) {
    const { bidLineItemId, quotationLineId } = record;
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
    const testData = dataSource[`${bidLineItemId}`] && dataSource[`${bidLineItemId}`].list;
    const newDataSource = testData.filter(
      // eslint-disable-next-line
      (r) => r.bidLineItemId == bidLineItemId && r.quotationLineId !== quotationLineId
    );
    if (
      newDataSource.every(
        (item) => item.$form && item.$form.getFieldValue('suggestedFlag') === 1
      ) &&
      !e.target.value
    ) {
      onSetWholePackageFlag(bidLineItemId);
    } else {
      onSetWholePackageFlagFalse(bidLineItemId);
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      // loading,
      header,
      match,
      setPath,
      dataSource = [],
      onSearch,
      bidLineItemId,
      loadingObj,
      onScoreDetails,
      customizeTable,
    } = this.props;
    const testData = dataSource[`${bidLineItemId}`] && dataSource[`${bidLineItemId}`].list;
    const pagination = dataSource[`${bidLineItemId}`] && dataSource[`${bidLineItemId}`].pagination;
    const editAble = setPath(match.path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
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
        title: intl.get(`ssrc.bidHall.model.bidHall.candidateSuggestion`).d('推荐意见'),
        dataIndex: 'candidateSuggestion',
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
        title: intl.get(`ssrc.bidHall.model.bidHall.sumScore`).d('总分'),
        dataIndex: 'sumScore',
        width: 80,
        render: (_, record) =>
          record.sumScore ? <a onClick={() => onScoreDetails(record)}>{record.sumScore}</a> : '',
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
        title: intl.get(`ssrc.bidHall.model.bidHall.validQuotationQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {numberSeparatorRender(value)}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.counterOfferPrice`).d('是否中标'),
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
                    disabled={editAble}
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={(e) => this.onChangesuggestedFlag(e, record)}
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
                  disabled={editAble}
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
        title: intl.get(`ssrc.bidHall.model.bidHall.validCounterOfferPrice`).d('中标金额'),
        dataIndex: 'allottedPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.allottedRatio`).d('中标比例'),
        dataIndex: 'allottedRatioMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationValidityFrom`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.promisedDeliveryDate`).d('承诺交货日期'),
        dataIndex: 'validPromisedDate',
        width: 150,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'validQuotationRemark',
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
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 100)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: editAble
              ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ'
              : 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM',
            cacheKey: bidLineItemId,
          },
          <EditTable
            bordered
            onDataChange={this.hasChangeData}
            rowKey="quotationLineId"
            // loading={loading}
            columns={columns}
            scroll={{ x: scrollX }}
            loading={
              loadingObj[bidLineItemId] && loadingObj[bidLineItemId].fetchAloneItemLineLoading
            }
            dataSource={testData}
            pagination={pagination}
            onChange={(page) => onSearch(page, bidLineItemId)}
          />
        )}
      </React.Fragment>
    );
  }
}
