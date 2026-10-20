/**
 * OtherInfoList - 订单审批 - 明细页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { sum, isNumber, isFunction, isNil } from 'lodash';
import moment from 'moment';
import { Table, Tabs, Form, Input, Tooltip, Select, Switch } from 'hzero-ui';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import { numberRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import UploadModal from 'components/Upload';
import { math } from 'choerodon-ui/dataset';

// import AssociatedDoc from './AssociatedDoc';
// import urgentImg from '@/assets/icon-expedited.svg';
import { BUCKET_NAME, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import { formatAumont, redirectToOther, formatNumber } from '@/routes/components/utils';
import rise from '@/assets/rise.svg';
import decline from '@/assets/decline.svg';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';
import { TooltipTextArea } from '@/routes/components/TooltipFormItem';
import BigNumber from 'bignumber.js';
import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { TabPane } = Tabs;
// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.orderApproval.model.common';
// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.orderApproval.view.message';
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';

// function numberFormat(val) {
//   if (val) {
//     const count = countDecimals(val);
//     return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
//   }
// }

// function countDecimals(val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

/**
 * 业务组件 - 我发送的订单
 * @extends {Component} - React.Component
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @reactProps {Array<Object>} [dataSource=[]] - 数据源
 * @reactProps {object} [pagination={}]
 * @reactProps {function} [assignDataSource= (e => e)] - 合并数据
 * @reactProps {function} [openBOMModal= (e => e)] 打开BOM
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class List extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // radioGroupValue: 'basic',
      customVisable: false,
      specsJsonType: 'custom',
      customData: [],
    };

    // 方法注册
    ['getColumns', 'handleOnRadioGroupChange', 'onTableRow'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * componentDidMount 生命周期函数
   * 暴露this
   */
  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  /**
   * setRowBackground - 根据deliveryDateRejectFlag设置行背景
   * @param {object} record - 行数据
   */
  setRowBackground(record) {
    return record.cancelledFlag === 1 ||
      record.cancelledFlag === 3 ||
      record.frozenFlag === 1 ||
      record.deliveryDateRejectFlag === 1
      ? { background: '#eee' }
      : null;
  }

  /**
   * saveRowData - 合并行数据
   * @param {object} rowData - 行数据
   */
  saveRowData(rowData) {
    const { dataSource = [], assignDataSource = (e) => e } = this.props;
    // const { radioGroupValue } = this.state;
    // const actionTableKey = !isEmpty(['basic', 'others'].filter(o => o === radioGroupValue)) ? 'common': radioGroupValue;
    assignDataSource(dataSource.common.map((n) => (n.key === rowData.key ? rowData : n)));
  }

  priceUomRender(text, record) {
    return text ? `${record.priceUomCode}/${text}` : '';
  }

  changeTip = (record, dom, fieldName) => {
    const { changeMap = {} } = record || {};
    const fieldMeaning = changeMap[fieldName];
    const fieldValue = record[fieldName];
    const tipTitle = `${intl
      .get('sodr.common.model.common.beforeUpdate')
      .d('变更前')}: ${fieldMeaning}`;
    // const _dom = math.isBigNumber(dom) ? dom.toString() : dom;
    if (fieldValue && fieldMeaning) {
      return <Tooltip title={tipTitle}>{dom}</Tooltip>;
    }
    return dom;
  };

  /**
   * getColumns - 组装columns
   * @param {!string} actionKey - tab 切换key
   */
  getColumns(actionKey) {
    const {
      openBOMModal = (e) => e,
      path,
      poSourcePlatform,
      amountFinancialPrecision,
      headerInfo,
      enumMap: { purchaseLineType = [] },
    } = this.props;
    const purchaseLineTypes = purchaseLineType.map((item) => {
      return {
        meaning: item.meaning,
        value: item.value,
      };
    });
    const isECOMMERCE = poSourcePlatform === 'E-COMMERCE'; // 电商订单
    const defaultColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'displayStatusMeaning',
        className: 'status',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.displayLineNum`).d('行号'),
        width: 60,
        dataIndex: 'displayLineNum',
      },
      {
        title: intl.get(`${modelPrompt}.displayLineLocationNum`).d('发运号'),
        width: 90,
        dataIndex: 'displayLineLocationNum',
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        width: 100,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`${modelPrompt}.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 90,
        render: (text, record) => {
          const dom = formatAumont(text);
          return this.changeTip(record, dom, 'itemCode');
        },
      },
      {
        title: intl.get(`${modelPrompt}.itemDescription`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        // render: (val) => <Tooltip title={val}>{val}</Tooltip>,
        render: (text, record) => {
          const dom = (
            <Tooltip title={text} placement="rightTop">
              {text}
            </Tooltip>
          );
          return this.changeTip(record, dom, 'itemName');
        },
      },
    ].map((n) => (actionKey !== 'invoice' ? { ...n, fixed: 'left' } : n));

    const dynamicColumns = new Map([
      [
        'basic',
        [
          {
            title: intl.get(`${modelPrompt}.quantity`).d('数量'),
            width: 80,
            dataIndex: 'quantity',
            render: (text, record) => {
              const dom = formatAumont(text);
              return this.changeTip(record, dom, 'quantity');
            },
          },
          {
            title: intl.get(`${modelPrompt}.uomName`).d('单位'),
            width: 100,
            dataIndex: 'uomName',
            render: (_, record) => {
              const dom = record.uomCodeAndName;
              return this.changeTip(record, dom, 'uomName');
            },
          },
          {
            title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
            width: 100,
            dataIndex: 'needByDate',
            render: (text, record) => {
              const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
              return this.changeTip(record, dom, 'needByDate');
            },
          },
          {
            title: intl.get(`${modelPrompt}.promiseDeliveryDate`).d('承诺交货日期'),
            width: 100,
            dataIndex: 'promiseDeliveryDate',
            render: (text, record) => {
              const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
              return this.changeTip(record, dom, 'promiseDeliveryDate');
            },
          },
          {
            title: intl.get(`sodr.common.model.common.currentPurchasePrice`).d('最近一次采购价'),
            width: 130,
            align: 'right',
            dataIndex: 'lastPurchasePrice',
            render: (text, record) => {
              const dom = formatNumber(text);
              return this.changeTip(record, dom, 'lastPurchasePrice');
            },
          },
          {
            title: intl.get(`${modelPrompt}.unitPrice`).d('不含税单价'),
            width: 130,
            dataIndex: 'unitPrice',
            align: 'right',
            render: (text, record) => {
              const dom =
                record.priceShieldFlag === 1 ? (
                  '******'
                ) : (
                  <Fragment>
                    {poSourcePlatform === 'ERP'
                      ? formatAumont(text)
                      : formatAumont(text, record.defaultPrecision)}
                    {[-1, 1].includes(record.modifyPriceFlag) &&
                      record.benchmarkPriceType === 'NET_PRICE' && (
                        <img src={record.modifyPriceFlag === 1 ? rise : decline} alt="img" />
                      )}
                  </Fragment>
                );
              return this.changeTip(record, dom, 'unitPrice');
            },
          },
          {
            title: intl.get(`${modelPrompt}.taxedEnteredUnitPrice`).d('原币含税单价'),
            width: 130,
            dataIndex: 'enteredTaxIncludedPrice',
            align: 'right',
            render: (text, record) => {
              const dom =
                record.priceShieldFlag === 1 ? (
                  '******'
                ) : (
                  <Fragment>
                    <span>
                      {poSourcePlatform === 'ERP'
                        ? formatAumont(text)
                        : formatAumont(text, record.defaultPrecision)}
                    </span>
                    {[-1, 1].includes(record.modifyPriceFlag) &&
                      record.benchmarkPriceType !== 'NET_PRICE' && (
                        <img src={record.modifyPriceFlag === 1 ? rise : decline} alt="img" />
                      )}
                  </Fragment>
                );
              return this.changeTip(record, dom, 'enteredTaxIncludedPrice');
            },
          },
          {
            title: intl.get(`${modelPrompt}.unitPriceBatch`).d('每'),
            width: 80,
            dataIndex: 'unitPriceBatch',
            render: (val, record) => {
              const dom = formatAumont(val);
              return this.changeTip(record, dom, 'unitPriceBatch');
            },
          },
          {
            title: intl.get(`${modelPrompt}.lineAmount`).d('不含税行金额'),
            width: 150,
            dataIndex: 'lineAmount',
            align: 'right',
            render: (text, record) => {
              const dom = amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                poSourcePlatform
              );
              return this.changeTip(record, dom, 'lineAmount');
            },
          },
          {
            title: intl.get(`${modelPrompt}.taxIncludedLineAmount`).d('含税行金额'),
            width: 130,
            dataIndex: 'taxIncludedLineAmount',
            align: 'right',
            render: (text, record) => {
              const dom = amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                poSourcePlatform
              );
              return this.changeTip(record, dom, 'taxIncludedLineAmount');
            },
          },
          {
            title: `${intl.get(`${modelPrompt}.taxRate`).d('税率')}(%)`,
            width: 80,
            dataIndex: 'taxRate',
            render: (text, record) => {
              const dom =
                isNumber(Number(text)) || math.isBigNumber(text) ? new BigNumber(text) : 0;
              return this.changeTip(record, dom, 'taxRate');
            },
          },
          {
            title: intl.get(`${modelPrompt}.currencyName`).d('币种'),
            width: 80,
            dataIndex: 'currencyCode',
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'currencyCode');
            },
          },
          {
            title: intl.get('sodr.common.model.common.department').d('部门'),
            dataIndex: 'departmentName',
            width: 130,
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'departmentName');
            },
          },
          // {
          //   title: intl.get('sodr.common.model.common.financialOrganization').d('结算财务组织'),
          //   dataIndex: 'clearOrganizationName',
          //   width: 130,
          // },
          // {
          //   title: intl.get('sodr.common.model.common.payableOrganization').d('应付组织'),
          //   dataIndex: 'copeOrganizationName',
          //   width: 130,
          // },
          {
            title: intl.get(`${modelPrompt}.organizationName`).d('收货组织'),
            width: 120,
            dataIndex: 'invOrganizationName',
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'invOrganizationName');
            },
          },
          {
            title: intl.get(`${modelPrompt}.inventoryName`).d('收货库房'),
            width: 120,
            dataIndex: 'inventoryName',
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'inventoryName');
            },
          },
          {
            title: intl.get(`${modelPrompt}.locationName`).d('收货库位'),
            width: 120,
            dataIndex: 'locationName',
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'locationName');
            },
          },
          {
            title: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
            dataIndex: 'costName',
            width: 180,
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'costName');
            },
          },
          {
            title: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
            dataIndex: 'accountSubjectName',
            width: 180,
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'accountSubjectName');
            },
          },
          {
            title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
            dataIndex: 'wbs',
            width: 180,
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'wbs');
            },
          },
          {
            title: intl.get(`${modelPrompt}.specifications`).d('规格'),
            width: 100,
            dataIndex: 'specifications',
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
            title: intl.get(`${modelPrompt}.model`).d('型号'),
            width: 100,
            dataIndex: 'model',
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'model');
            },
          },
          {
            title: intl
              .get(`sprm.purchaseReqCreation.model.common.customSpecsJson`)
              .d('定制品属性'),
            width: 150,
            dataIndex: 'customSpecsJson',
            render: (val) => (
              <a
                onClick={() => {
                  this.setState({
                    customData: val ? JSON.parse(val) : [],
                    customVisable: true,
                    specsJsonType: 'custom',
                  });
                }}
              >
                {intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性')}
              </a>
            ),
          },
          {
            title: intl.get(`sprm.purchaseReqCreation.model.common.customSpecs`).d('定制品属性'),
            width: 150,
            dataIndex: 'customSpecs',
            render: (val) => (
              <TextArea disabled value={val} style={{ resize: 'vertical' }} rows={1} />
            ),
          },
          {
            title: intl.get(`sprm.purchaseReqCreation.model.common.productSpecsJson`).d('商品属性'),
            width: 150,
            dataIndex: 'productSpecsJson',
            render: (val) => {
              return (
                <a
                  onClick={() => {
                    this.setState({
                      customData: val ? JSON.parse(val) : [],
                      specsJsonType: 'product',
                      customVisable: true,
                    });
                  }}
                >
                  {intl.get(`sprm.purchaseReqCreation.model.common.productSpecsJson`).d('商品属性')}
                </a>
              );
            },
          },
          {
            title: intl.get(`sprm.purchaseReqCreation.model.common.productSpecs`).d('商品属性'),
            width: 150,
            dataIndex: 'productSpecs',
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`productSpecs`, {
                  initialValue: val,
                })(<TextArea disabled style={{ resize: 'vertical' }} rows={1} />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.productBrand`).d('商品品牌'),
            dataIndex: 'productBrand',
            width: 120,
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'productBrand');
            },
          },
          {
            title: intl.get(`sodr.common.model.common.productModel`).d('商品规格'),
            dataIndex: 'productModel',
            width: 120,
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'productModel');
            },
          },
          {
            title: intl.get(`sodr.common.model.common.packingList`).d('商品型号'),
            dataIndex: 'packingList',
            width: 120,
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'packingList');
            },
          },
          // {
          //   title: intl.get('sodr.common.model.common.chartNumber').d('图号'),
          //   dataIndex: 'chartCode',
          //   width: 130,
          // },
          // {
          //   title: intl.get('sodr.common.model.common.drawingVersion').d('图纸版本'),
          //   dataIndex: 'chartVersion',
          //   width: 100,
          // },
          // {
          //   title: intl.get('sodr.common.model.common.surfaceManage').d('表面处理'),
          //   dataIndex: 'surfaceTreatFlag',
          //   width: 100,
          //   render: (val) => (val === '1' ? '是' : '否'),
          // },
          // {
          //   title: intl.get('sodr.common.model.common.mallContractNum').d('商城协议编号'),
          //   dataIndex: 'pcNum',
          //   width: 160,
          // },
          // {
          //   title: intl.get(`${modelPrompt}.manufacturerName`).d('制造商'),
          //   width: 150,
          //   dataIndex: 'manufacturerName',
          //   onCell,
          // },
          {
            title: intl.get(`${modelPrompt}.brand`).d('品牌'),
            width: 150,
            dataIndex: 'brand',
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'brand');
            },
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方行备注'),
            width: 240,
            dataIndex: 'remark',
            render: (val, record) => {
              return ['create', 'update'].includes(record._status) &&
                path === '/sodr/order-approval/detail/:poHeaderId' ? (
                  <FormItem>
                    {record.$form.getFieldDecorator(`remark`, {
                    initialValue: val,
                  })(
                    <TooltipTextArea
                      tipValue={record.$form.getFieldValue('remark')}
                      style={{ resize: 'vertical' }}
                      rows={1}
                    />
                  )}
                  </FormItem>
              ) : (
                this.changeTip(
                  record,
                  <Tooltip title={val} placement="left">
                    {val}
                  </Tooltip>,
                  'remark'
                )
              );
            },
          },
          {
            title: intl.get(`${modelPrompt}.feedback`).d('反馈信息'),
            dataIndex: 'feedback',
            width: 150,
            render: (text, record) => {
              const dom = text;
              return this.changeTip(record, dom, 'feedback');
            },
          },
          {
            title: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
            dataIndex: 'attachmentUuid',
            width: 100,
            render: (value, record) => (
              <UploadModal
                bucketName={BUCKET_NAME}
                bucketDirectory={LINE_DIRECTORY}
                attachmentUUID={record.attachmentUuid}
                viewOnly
                icon={false}
              />
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.domesticTaxIncludedPrice`).d('本币含税单价'),
            width: 120,
            dataIndex: 'domesticTaxIncludedPrice',
            render: (val, record) => {
              const dom =
                record.priceShieldFlag === 1
                  ? '******'
                  : poSourcePlatform === 'ERP'
                  ? formatAumont(val)
                  : formatAumont(val, headerInfo.domesticDefaultPrecision);
              return this.changeTip(record, dom, 'domesticTaxIncludedPrice');
            },
          },
          {
            title: intl.get(`sodr.common.model.common.domesticUnitPrice`).d('本币不含税单价'),
            width: 120,
            dataIndex: 'domesticUnitPrice',
            render: (val, record) => {
              const dom =
                record.priceShieldFlag === 1
                  ? '******'
                  : poSourcePlatform === 'ERP'
                  ? formatAumont(val)
                  : formatAumont(val, headerInfo.domesticDefaultPrecision);
              return this.changeTip(record, dom, 'domesticUnitPrice');
            },
          },
          {
            title: intl
              .get(`sodr.common.model.common.domesticTaxIncludedLineAmount`)
              .d('本币含税金额'),
            width: 120,
            dataIndex: 'domesticTaxIncludedLineAmount',
            render: (val, record) => {
              const dom = amountFinancialPrecision(
                record.priceShieldFlag,
                val,
                headerInfo.domesticFinancialPrecision,
                poSourcePlatform
              );
              return this.changeTip(record, dom, 'domesticTaxIncludedLineAmount');
            },
          },
          {
            title: intl.get(`sodr.common.model.common.domesticLineAmount`).d('本币不含税金额'),
            width: 120,
            dataIndex: 'domesticLineAmount',
            render: (val, record) => {
              const dom = amountFinancialPrecision(
                record.priceShieldFlag,
                val,
                headerInfo.domesticFinancialPrecision,
                poSourcePlatform
              );
              return this.changeTip(record, dom, 'domesticLineAmount');
            },
          },
          {
            title: intl.get(`sodr.common.model.common.budgetAccount`).d('预算科目'),
            width: 120,
            dataIndex: 'budgetAccountId',
            render: (_, record) => {
              const dom = record.budgetAccountName;
              return this.changeTip(record, dom, 'budgetAccountId');
            },
          },
          {
            title: intl.get(`sodr.common.model.common.receiveToleranceQuantityType`).d('允差类型'),
            width: 150,
            dataIndex: 'receiveToleranceQuantityType',
            render: (val, record) => {
              const dom = val;
              return this.changeTip(record, dom, 'receiveToleranceQuantityType');
            },
          },
          {
            title: intl.get(`sodr.common.model.common.purchaseLineTypes`).d('采购行类型'),
            width: 150,
            dataIndex: 'purchaseLineTypeId',
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`purchaseLineTypeId`, {
                  initialValue: !isNil(val) ? val.toString() : null,
                })(
                  <Select allowClear style={{ width: '100%' }}>
                    {purchaseLineTypes.map((item) => (
                      <Select.Option key={item.value}>{item.meaning}</Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            ),
          },
        ],
      ],
      [
        'others',
        [
          // {
          //   title: intl.get(`${modelPrompt}.oldItemCode`).d('旧物料号'),
          //   width: 150,
          //   dataIndex: 'oldItemCode',
          //   onCell,
          // },
          {
            title: intl.get(`${modelPrompt}.itemTypeDesc`).d('物品类型'),
            width: 120,
            dataIndex: 'categoryName',
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`${modelPrompt}.rate`).d('汇率'),
            width: 90,
            dataIndex: 'exchangeRate',
          },
          {
            title: intl.get(`${modelPrompt}.consignedFlag`).d('是否寄售'),
            width: 90,
            dataIndex: 'consignedFlag',
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.returnedFlag`).d('是否退回'),
            width: 90,
            dataIndex: 'returnedFlag',
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.freeFlag`).d('是否免费'),
            width: 90,
            dataIndex: 'freeFlag',
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.immedShippedFlag`).d('是否直发'),
            width: 90,
            dataIndex: 'immedShippedFlag',
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          // TODO 后端没字段
          {
            title: intl.get(`${modelPrompt}.bom`).d('外协BOM'),
            width: 120,
            dataIndex: 'bom',
            render: (text, record) => (
              <a onClick={() => openBOMModal(record)}>
                {intl.get(`${commonPrompt}.button.view`).d('查看')}
              </a>
            ),
          },
          // {
          //   title: intl.get(`sodr.common.model.common.accountAssignment`).d('科目分配'),
          //   width: 120,
          //   dataIndex: 'accountAssignment',
          // },
          {
            title: intl.get(`sodr.common.model.common.purReqLineNum`).d('采购申请号|行号'),
            width: 180,
            dataIndex: 'displayPrNumAndDisplayPrLineNum',
            render: (val, record) => (
              <a onClick={() => redirectToOther('purchase', record)}>{val}</a>
            ),
          },
          {
            title: intl.get(`sodr.common.model.quotePurchase.number`).d('采购协议号|行号'),
            dataIndex: 'contractNum',
            width: 180,
            render: (val, record) => (
              <a onClick={() => redirectToOther('contract', record)}>{val}</a>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.sourceLineNum`).d('寻源单号|行号'),
            dataIndex: 'sourceNumAndLine',
            width: 180,
            render: (val, record) => (
              <a onClick={() => redirectToOther('source', record)}>{val || record.sourceCodeNum}</a>
            ),
          },
          {
            title: intl.get(`${modelPrompt}.purReqAppliedName`).d('申请人'),
            width: 90,
            dataIndex: 'prRequestedName',
            render: (_, record) => record.purReqAppliedName,
          },
          {
            title: intl.get(`${modelPrompt}.shipToThirdPartyName`).d('送达方'),
            width: 120,
            dataIndex: 'shipToThirdPartyName',
          },
          {
            title: intl.get(`${modelPrompt}.shipToThirdPartyAddress`).d('送货地址'),
            width: 150,
            dataIndex: 'shipToThirdPartyAddress',
            onCell,
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`${modelPrompt}.shipToThirdPartyContact`).d('联系人信息'),
            width: 150,
            dataIndex: 'shipToThirdPartyContact',
          },
          {
            title: intl.get(`${modelPrompt}.receiveTelNum`).d('联系人电话'),
            width: 150,
            dataIndex: 'receiveTelNum',
            render: (val, record) => (
              <span>{val ? `${record.internationalTelCode || ''} ${val}` : ''}</span>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.priceUomName`).d('订单价格单位'),
            width: 150,
            dataIndex: 'priceUomName',
            render: (_, { priceUomCodeName }) => priceUomCodeName,
          },
          {
            title: intl.get(`${modelPrompt}.priceUomConversion`).d('单位转换关系'),
            width: 150,
            dataIndex: 'priceUomConversion',
            onCell,
          },
          // {
          //   title: intl.get(`${modelPrompt}.frozenFlag`).d('冻结状态'),
          //   dataIndex: 'frozenFlag',
          //   align: 'center',
          //   width: 90,
          //   render: text =>
          //     intl
          //       .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
          //       .d(text === 1 ? '是' : '否'),
          // },
        ],
      ],
      ['invoice', []],
      [
        'partners',
        [
          {
            title: intl.get(`${modelPrompt}.partnerType`).d('合作类型'),
            width: 150,
            dataIndex: 'partnerType',
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.partnerNum`).d('合作方编码'),
            width: 120,
            dataIndex: 'partnerNum',
          },
          {
            title: intl.get(`${modelPrompt}.partnerName`).d('合作方名称'),
            width: 120,
            dataIndex: 'partnerName',
          },
          {
            title: intl.get(`${modelPrompt}.dataSourceCode`).d('来源系统'),
            width: 120,
            dataIndex: 'externalSystemCode',
          },
        ],
      ],
    ]);

    if (isECOMMERCE) {
      dynamicColumns.forEach((item, key) => {
        if (key === 'basic') {
          item.splice(24, 0, {
            title: intl.get('sodr.common.model.common.jdPrice').d('划线价'),
            dataIndex: 'jdPrice',
            align: 'right',
            width: 120,
            render: (val) => formatNumber(val),
          });
        }
      });
    }

    function onCell() {
      return {
        style: {
          overflow: 'hidden',
          maxWidth: 180,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        onClick: (e) => {
          const { target } = e;
          if (target.style.whiteSpace === 'normal') {
            target.style.whiteSpace = 'nowrap';
          } else {
            target.style.whiteSpace = 'normal';
          }
        },
      };
    }
    // return actionKey !== 'partners'
    //   ? actionKey === 'basic'
    //     ? dynamicColumns.get(actionKey)
    //     : defaultColumns.concat(dynamicColumns.get(actionKey))
    //   : dynamicColumns.get(actionKey);
    return actionKey !== 'partners'
      ? defaultColumns.concat(dynamicColumns.get(actionKey))
      : dynamicColumns.get(actionKey);
  }

  /**
   * handleOnRadioGroupChange - RadioGroup change事件
   * @param {!object} e - 事件对象
   */
  handleOnRadioGroupChange(event) {
    const { onRadioGroupChange = (e) => e } = this.props;
    onRadioGroupChange(event);
  }

  /**
   * handleOnChange - 表格切换事件
   * @param {!object} e - 事件对象
   */
  handleOnChange(page) {
    const { onChange = (e) => e, radioGroupValue } = this.props;
    onChange(radioGroupValue !== 'partners' ? 'common' : 'partners', page);
  }

  onTableRow(record) {
    const { setActionListCommonRow = (e) => e, actionListCommonRow, radioGroupValue } = this.props;
    return {
      style:
        radioGroupValue !== 'invoice'
          ? this.setRowBackground(record)
          : {
              background: actionListCommonRow.key === record.key ? '#f0fffe' : '#fff',
            },
      onClick: () => {
        setActionListCommonRow(record);
      },
    };
  }

  render() {
    const {
      form,
      headerInfo,
      dataSource = [],
      pagination,
      processing,
      radioGroupValue,
      customizeTable,
      customizeTabPane,
      fetchDetailList = (e) => e,
    } = this.props;
    const { changeFlag } = headerInfo;
    const { customVisable, customData, specsJsonType } = this.state;
    const columns = this.getColumns(radioGroupValue);
    let scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    if (radioGroupValue === 'basic') scrollX += 300;
    const actionTableKey = ['basic', 'others', 'invoice'].includes(radioGroupValue)
      ? 'common'
      : radioGroupValue;
    const tableProps = {
      // rowKey: this.defaultTableRowKey,
      columns,
      dataSource: dataSource[actionTableKey] || [],
      pagination: pagination[actionTableKey],
      loading:
        processing.queryDetailListLoading ||
        (radioGroupValue === 'partners' && processing.queryPartnersLoading),
      bordered: true,
      onChange: this.handleOnChange.bind(this),
      scroll: {
        x: scrollX >= 1200 && radioGroupValue !== 'invoice' ? scrollX : false,
        y: 'calc(100vh - 350px)',
      },
    };
    // const associatedDocProps = {
    //   associatedDoc,
    //   visible: radioGroupValue === 'invoice',
    // };
    if (radioGroupValue !== 'partners') {
      tableProps.onRow = this.onTableRow;
    }
    const CustomSpecProps = {
      specsJsonType,
      visible: customVisable,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisable: false });
      },
    };

    return (
      <Fragment>
        {customizeTabPane(
          {
            code: 'SODR.ORDER_APPROVE_LINE_LIST.TAB',
          },
          <Tabs onChange={this.handleOnRadioGroupChange} className="detail-list" animated={false}>
            <TabPane key="basic" tab={intl.get(`${viewMessagePrompt}.basicInfo`).d('基础信息')}>
              {changeFlag === 1 && (
                <div className={styles['purchase-application']}>
                  <Form layout="inline">
                    <FormItem
                      label={intl
                        .get(`sodr.common.model.common.changeLineDisplay`)
                        .d('仅展示变更行')}
                    >
                      {form.getFieldDecorator('changeEditFlag', {
                        initialValue: true,
                      })(
                        <Switch
                          onChange={(e) => {
                            fetchDetailList({
                              changeEditFlag: e ? 1 : 0,
                              poEntryPoint: 'PURCHASE_APPROVAL_DETAIL',
                            });
                          }}
                        />
                      )}
                    </FormItem>
                  </Form>
                </div>
              )}
              {radioGroupValue === 'basic' &&
                customizeTable(
                  {
                    code: 'SODR.ORDER_APPROVE_LINE_LIST.APPROVE',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>
            <TabPane key="others" tab={intl.get(`${viewMessagePrompt}.otherInfo`).d('其他信息')}>
              {radioGroupValue === 'others' &&
                customizeTable(
                  {
                    code: 'SODR.ORDER_APPROVE_LINE_LIST.OTHER',
                  },
                  <Table {...tableProps} />
                )}
            </TabPane>
            <TabPane
              disabled={processing.queryDetailListLoading}
              key="invoice"
              tab={intl.get(`${viewMessagePrompt}`).d('关联单据')}
            >
              <Table {...tableProps} />
            </TabPane>
            <TabPane key="partners" tab={intl.get(`${viewMessagePrompt}.partners`).d('合作方')}>
              <Table {...tableProps} />
            </TabPane>
          </Tabs>
        )}
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
      </Fragment>
    );
  }
}
