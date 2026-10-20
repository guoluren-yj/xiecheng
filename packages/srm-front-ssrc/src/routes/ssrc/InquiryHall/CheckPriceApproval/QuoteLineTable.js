import React, { Component } from 'react';
import { Form, Popover } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { sum, isNumber, isEmpty, isFunction, compose, isNil } from 'lodash';
import { connect } from 'dva';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { roundEliminate, numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { INQUIRY, getQuotationName } from '@/utils/globalVariable';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import hocRemote from 'hzero-front/lib/utils/remote';
import LadderLevel from '../../components/LadderLevel';

// const { Option } = Select;

class QuoteLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      suggestedFlagValue: {}, // 根据选用状态，设置对应行的必填项
      selectionStrategyValue: {}, // 根据选择策略状态（推荐供应商），设置选用的禁用状态
    };
  }

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate(preProps) {
    const {
      inquiryHall: { quoteLine },
    } = this.props;
    const {
      inquiryHall: { quoteLine: preLine },
    } = preProps;
    if (quoteLine !== preLine) {
      return true;
    }
    return null;
  }

  // 渲染完成，行内组件等
  componentDidUpdate(preProps, preState, snap) {
    const {
      inquiryHall: { quoteLine },
    } = this.props;
    if (snap !== null) {
      let suggestedFlagValueList = {};
      let selectionStrategyValueList = {};
      quoteLine.forEach((item) => {
        suggestedFlagValueList = {
          ...suggestedFlagValueList,
          [item.quotationLineId]: item?.$form?.getFieldValue('suggestedFlag'),
        };
        selectionStrategyValueList = {
          ...selectionStrategyValueList,
          [item.quotationLineId]:
            item?.$form?.getFieldValue('selectionStrategy') === 'RECOMMENDATION' ? 1 : 0,
        };
      });
      this.setSuggestedFlagValue(suggestedFlagValueList, selectionStrategyValueList);
    }
  }

  /**
   * 设置必填项
   */
  @Bind()
  setSuggestedFlagValue(suggestedFlagValueList, selectionStrategyValueList) {
    this.setState({
      suggestedFlagValue: {
        ...this.state.suggestedFlagValue,
        ...suggestedFlagValueList,
      },
      selectionStrategyValue: {
        ...this.state.selectionStrategyValue,
        ...selectionStrategyValueList,
      },
    });
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const {
      dispatch,
      inquiryHall: { allLineChange = false },
    } = this.props;
    if (!isEmpty(changeValues) && !allLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          allLineChange: true,
        },
      });
    }
  }

  // 查看适用范围
  viewApplicationOrgModal = (record = {}) => {
    const { organizationId } = this.props;
    const { rfxHeaderId = null, applicationScopeFlag = null, rfxLineItemId = null } = record;
    if (applicationScopeFlag === 0) {
      return;
    }

    const Props = {
      queryParams: {
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
        applicationScopeFlag,
        sourceLineItemId: rfxLineItemId,
      },
      sourceHeaderId: rfxHeaderId,
      organizationId,
    };

    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      bodyStyle: {
        padding: 0,
      },
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScopeDetail {...Props} />,
      style: { width: '1000px' },
      footer: null,
    });
  };

  /**
   * 渲染单价样式
   * 竞价方向为正向时，行号相同的物料，单价最高的标红
   * 否则，单价最小的标红
   */
  renderValidQuotationPrice(val, record, name = '') {
    const { header = {} } = this.props;
    // const rfxLineItemNumList =
    //   dataSource &&
    //   dataSource
    //     .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
    //     .map((r) => r.validQuotationPrice);
    // const validQuotationPriceMax = Math.max(...rfxLineItemNumList);
    // const validQuotationPriceMin = Math.min(...rfxLineItemNumList);
    let mean = '';
    const formatValue = numberSeparatorRender(val);
    const { itemLineFloorPrice, itemLineHighestPrice, redField } = record;

    if (header.auctionDirection === 'FORWARD') {
      mean =
        itemLineHighestPrice === val || redField === name ? (
          <span style={{ color: 'red' }}>{formatValue}</span>
        ) : (
          formatValue
        );
    } else {
      mean =
        itemLineFloorPrice === val || redField === name ? (
          <span style={{ color: 'red' }}>{formatValue}</span>
        ) : (
          formatValue
        );
    }
    return mean;
  }

  /**
   * 渲染行金额样式
   * 竞价方向为正向时，行号相同的物料，行金额最高的标红
   * 否则，行金额最小的标红
   */
  renderTotalPrice(val, record) {
    // const { header = {} } = this.props;
    // const totalPriceList =
    //   dataSource &&
    //   dataSource
    //     .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
    //     .map((r) => r.totalPrice);
    // const totalPriceMax = Math.max(...totalPriceList);
    // const totalPriceMin = Math.min(...totalPriceList);
    // let mean = '';

    // const { itemLineFloorPrice, itemLineHighestPrice } = record;

    // if (header.auctionDirection === 'FORWARD') {
    //   mean =
    //     itemLineHighestPrice === val ? (
    //       <span style={{ color: 'red' }}>
    //         <PrecisionInputNumber
    //           financial={record.currencyCode}
    //           type="hzero"
    //           readOnly
    //           value={val}
    //         />
    //       </span>
    //     ) : (
    //       <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
    //     );
    // } else {
    //   mean =
    //     itemLineFloorPrice === val ? (
    //       <span style={{ color: 'red' }}>
    //         <PrecisionInputNumber
    //           financial={record.currencyCode}
    //           type="hzero"
    //           readOnly
    //           value={val}
    //         />
    //       </span>
    //     ) : (
    //       <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
    //     );
    // }
    return (
      <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
    );
  }

  /**
   * @override 三生制药
   */
  renderForm() {
    // 标准去掉此内容，需求整改审批页不需要但防止此方法被继承式二开，所以保留空方法
    // const { form } = this.props;
    // return (
    //   <Form>
    //     <Form.Item
    //       label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quickSelection`).d('快速选用')}
    //       labelCol={{ span: 2 }}
    //       wrapperCol={{ span: 4 }}
    //       style={{
    //         marginBottom: '10px',
    //         marginTop: '10px',
    //         display: 'inline-flex',
    //         justifyContent: 'flex-end',
    //         width: '100%',
    //       }}
    //     >
    //       {form.getFieldDecorator(
    //         'selectedPolicyValue',
    //         {}
    //       )(
    //         <Select disabled allowClear style={{ width: '100%' }}>
    //           <Option value="lowest">
    //             {intl.get(`ssrc.inquiryHall.model.inquiryHall.lowest`).d('最低价策略')}
    //           </Option>
    //           <Option value="complete">
    //             {intl.get(`ssrc.inquiryHall.model.inquiryHall.complete`).d('全部选用')}
    //           </Option>
    //         </Select>
    //       )}
    //     </Form.Item>
    //   </Form>
    // );
  }

  /**
   * 表格行事件
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  getTableProps(tableProps) {
    return tableProps;
  }

  /**
   * 表格行事件
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  @Bind()
  renderOnRow() {}

  /**
   * 表格列
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  renderColumns() {
    const {
      organizationId,
      onComparePriceHistory = () => {},
      header,
      viewLadderLevel,
      sourceKey = INQUIRY,
      remote,
    } = this.props;
    const { newQuotationFlag } = header || {};
    const cloumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.strategy`).d('选择策略'),
        dataIndex: 'selectionStrategyMeaning',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        dataIndex: 'suggestedFlag',
        width: 60,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'companyName',
        width: 380,
        render: (value, record) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {roundEliminate(value, record)}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName: getQuotationName(sourceKey === 'NEW_BID'),
          })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        dataIndex: 'candidateSuggestion',
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`).d('推荐意见'),
        width: 100,
      },
      {
        dataIndex: 'stageDescription',
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
        render: (value, record) => {
          if (record?.redField === 'validQuotationPrice') {
            return <span style={{ color: 'red' }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      },
      {
        title: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        dataIndex: 'validNetPrice',
        width: 100,
        render: (value, record) => {
          if (record?.redField === 'validNetPrice') {
            return <span style={{ color: 'red' }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
        dataIndex: 'perNetPrice',
        width: 120,
      },
      {
        title: intl
          .get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice')
          .d('每一单价(含税)'),
        dataIndex: 'perTaxIncludedPrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePrice`).d('参考价'),
        dataIndex: 'referencePrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        dataIndex: 'differentPrice',
        width: 100,
        render: (val, record) =>
          (header.priceTypeCode === 'NET_PRICE'
            ? record.validNetPrice
            : record.validQuotationPrice) !== null && record.referencePrice !== null
            ? numberSeparatorRender(
                math.minus(
                  header.priceTypeCode === 'NET_PRICE'
                    ? record.validNetPrice
                    : record.validQuotationPrice,
                  record.referencePrice
                )
              )
            : '',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (val, record) => (
          <QuotationDetail rowData={record} sourceFrom="RFX" allowBuyerViewFlag modalType="h0" />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        dataIndex: 'allottedQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        dataIndex: 'allottedRatio',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        dataIndex: 'suggestedRemark',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        dataIndex: 'preQuotationPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.initialFluctuation`).d('初始价涨跌幅'),
        dataIndex: 'initialFluctuation',
        width: 130,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.priceCompareToFirst`)
          .d('与首次报价差额'),
        dataIndex: 'priceCompareToFirst',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 100,
        align: 'right',
        render: (val, record) => val && this.renderTotalPrice(val, record),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 140,
        render: (val, record) => (
          <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
        ),
      },
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`)
              .d('预估单价(含税)'),
            dataIndex: 'estimatedPrice',
            width: 100,
          }
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
              .d('预估单价(不含税)'),
            dataIndex: 'netEstimatedPrice',
            width: 100,
          },
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`)
              .d('预估行金额(含税)'),
            dataIndex: 'estimatedAmount',
            width: 100,
            render: (val, record) => (
              <PrecisionInputNumber
                financial={record.currencyCode}
                type="hzero"
                readOnly
                value={val}
              />
            ),
          }
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
              .d('预估行金额(不含税)'),
            dataIndex: 'netEstimatedAmount',
            width: 100,
            render: (val, record) => (
              <PrecisionInputNumber
                financial={record.currencyCode}
                type="hzero"
                readOnly
                value={val}
              />
            ),
          },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
            quotationName: getQuotationName(sourceKey === 'NEW_BID'),
          })
          .d('{quotationName}说明'),
        dataIndex: 'validQuotationRemark',
        width: 120,
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
        title: intl.get('ssrc.common.productionPlace').d('产地'),
        dataIndex: 'origin',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        dataIndex: 'paymentTypeName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        dataIndex: 'paymentTermName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'validExpiryDateFrom',
        width: 150,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 150,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.deliveryPeriod`).d('供货周期'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        dataIndex: 'freightAmount',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.changePercent`).d('涨跌幅(%)'),
        dataIndex: 'changePercent',
        width: 100,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingAmount`)
          .d('节支金额(供应商)'),
        dataIndex: 'supplierSavingAmount',
        width: 130,
        render: (value, record) => (
          <PrecisionInputNumber
            value={value}
            financial={record.currencyCode}
            type="hzero"
            readOnly
          />
        ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingRatio`)
          .d('节支率(供应商)'),
        dataIndex: 'supplierSavingRatio',
        width: 130,
        render: (value) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        title:
          header.auctionDirection === 'FORWARD'
            ? intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplierMaxSuggestedRatio`)
                .d('最高价中标率(供应商)')
            : intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplierMinMaxSuggestedRatio`)
                .d('最低价中标率(供应商)'),
        dataIndex: 'supplierMinMaxSuggestedRatio',
        width: 130,
        render: (value) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingAmount`).d('节支金额(物料)'),
        dataIndex: 'itemSavingAmount',
        width: 130,
        render: (value, record) => (
          <PrecisionInputNumber
            value={value}
            financial={record.currencyCode}
            type="hzero"
            readOnly
          />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingRatio`).d('节支率(物料)'),
        dataIndex: 'itemSavingRatio',
        width: 130,
        render: (value) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.minMaxSuggestedFlag`)
          .d('是否最低价中标'),
        dataIndex: 'itemMinMaxSuggestedFlag',
        width: 130,
        render: (value) => yesOrNoRender(value),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationLineSavingAmount`)
          .d('节支金额'),
        dataIndex: 'quotationLineSavingAmount',
        width: 130,
        render: (value, record) => (
          <PrecisionInputNumber
            value={value}
            financial={record.currencyCode}
            type="hzero"
            readOnly
          />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationLineSavingRatio`).d('节支率'),
        dataIndex: 'quotationLineSavingRatio',
        width: 130,
        render: (value) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.itemSignPostPrice').d('标杆价'),
        dataIndex: 'itemSignPostPrice',
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ) : (
            <FileGroup
              record={record}
              uiType="h0"
              fileType="LINE"
              fileProps={{ lineUuid: val, bucketDirectory: 'ssrc-rfx-quotationline' }}
            />
          );
        },
      },
      {
        dataIndex: 'applicationScopeFlag',
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        width: 100,
        render: (_, record) => {
          const { rfxLineItemId = null, applicationScopeFlag = 0 } = record;

          return (
            <a
              disabled={!applicationScopeFlag || !rfxLineItemId}
              onClick={() => this.viewApplicationOrgModal(record)}
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        },
      },
      {
        dataIndex: 'comparePriceHistory',
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.comparePriceHistory`).d('还比价历史'),
        width: 120,
        render: (_, record) =>
          record.quotationLineId !== null ? (
            <a onClick={() => onComparePriceHistory(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : (
            ''
          ),
      },
    ];
    return remote
      ? remote.process('SSRC_CHECK_APPROVE_QUOTELINE_TABLE_COLUMNS', cloumns, { that: this })
      : cloumns;
  }

  render() {
    const {
      loading,
      onChange,
      dataSource,
      pagination,
      hideModal,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      customizeTable,
      sourceKey = INQUIRY,
      remote,
      rfxHeaderId,
    } = this.props;
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
    };
    const columns = this.renderColumns();
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const preTableProps = {
      bordered: true,
      rowKey: 'quotationLineId',
      loading,
      columns,
      scroll: { x: scrollX },
      dataSource,
      pagination: { ...pagination, pageSizeOptions: ['10', '50', '100', '200'] },
      onDataChange: this.hasChangeData,
      onChange: (page) => onChange(page),
      onRow: this.renderOnRow,
    };
    const tableProps = remote
      ? remote.process('SSRC_CHECK_APPROVE_QUOTELINE_TABLE_PROPS', preTableProps, {
          onChange,
          dataSource,
          rfxHeaderId,
          sourceKey,
        })
      : preTableProps;
    return (
      <React.Fragment>
        {this.renderForm()}
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`,
            readOnly: remote
              ? remote.process('SSRC_CHECK_APPROVE_QUOTELINE_TABLE_READ_ONLY', true)
              : true,
          },
          <EditTable {...this.getTableProps(tableProps)} />
        )}
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
      </React.Fragment>
    );
  }
}
const hocFunc = (com) =>
  compose(
    connect(({ inquiryHall }) => ({
      inquiryHall,
    })),
    Form.create({ fieldNameProp: null }),
    hocRemote({
      code: 'SSRC_CHECK_APPROVE_QUOTELINE',
    })
  )(com);

export { hocFunc, QuoteLineTable };
export default hocFunc(QuoteLineTable);
