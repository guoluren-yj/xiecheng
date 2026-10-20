/**
 * List - 交期审核 - 明细页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { sum, isNumber, isFunction, isNil, isEqual } from 'lodash';
import { Form, Input, Tabs, Tooltip, Select } from 'hzero-ui';
import moment from 'moment';
import { dateRender } from 'utils/renderer';

import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import { numberRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import UploadModal from 'components/Upload';
import Switch from 'components/Switch';
import { math } from 'choerodon-ui/dataset';
// import Switch from 'components/Switch';

import { BUCKET_NAME, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import {
  formatAumont,
  redirectToOther,
  formatNumber,
  getDynamicLabel,
} from '@/routes/components/utils';
import BigNumber from 'bignumber.js';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';
import { TooltipTextArea } from '@/routes/components/TooltipFormItem';
import styles from './index.less';

const { TextArea } = Input;
const { TabPane } = Tabs;
const FormItem = Form.Item;

// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.deliveryDateReview.model.common';
// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.deliveryDateReview.view.message';
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';
// 设置entityItem国际化前缀
const entityItem = 'entity.item';

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
 * List - 业务组件 - 交期审核
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
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      // radioGroupValue: 'basic',
      selectedRows: [],
      customVisable: false,
      customData: [],
      specsJsonType: 'custom',
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
  // componentDidMount() {
  //   const { onRef } = this.props;
  //   if (isFunction(onRef)) {
  //     onRef(this);
  //   }
  // }

  /**
   * saveRowData - 合并行数据
   * @param {object} rowData - 行数据
   */
  saveRowData(rowData) {
    const { dataSource = [], assignDataSource = (e) => e } = this.props;
    assignDataSource(dataSource.common.map((n) => (n.key === rowData.key ? rowData : n)));
  }

  /**
   * onRadioGroupChange - RadioGroup change事件
   * @param {!object} e - 事件对象
   */
  onRowSelectedChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * setRowBackground - 根据deliveryDateRejectFlag设置行背景
   * @param {object} record - 行数据
   */
  setRowBackground(record) {
    return record.cancelledFlag === 1 || record.cancelledFlag === 3 || record.frozenFlag === 1
      ? { background: '#eee' }
      : null;
  }

  /**
   * getColumns - 组装columns
   * @param {!string} actionKey - tab 切换key
   */
  getColumns(actionKey) {
    const {
      openBOMModal = (e) => e,
      poSourcePlatform,
      doubleUnitEnabled,
      amountFinancialPrecision,
      unitPriceDefaultPrecision,
      orderHeaderFormDataSource,
      enumMap: { purchaseLineType = [] },
    } = this.props;
    const isECOMMERCE = poSourcePlatform === 'E-COMMERCE'; // 电商订单
    const defaultColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'displayStatusMeaning',
        width: 100,
        className: 'status',
      },
      {
        title: intl.get(`${modelPrompt}.displayLineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 60,
      },
      {
        title: intl.get(`${modelPrompt}.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        width: 100,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`${entityItem}.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 90,
      },
      {
        title: intl.get(`${entityItem}.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val) => <Tooltip title={val}>{val}</Tooltip>,
      },
    ].map((n) => (actionKey !== 'invoice' ? { ...n, fixed: 'left' } : n));

    const dynamicColumns = new Map([
      [
        'basic',
        [
          doubleUnitEnabled && {
            title: intl.get(`${modelPrompt}.quantity`).d('数量'),
            dataIndex: 'secondaryQuantity',
            width: 80,
            render: (val, record) => {
              if (
                !isEqual(
                  new BigNumber(record.secondaryQuantity),
                  new BigNumber(record.originalQuantity)
                )
              ) {
                return (
                  <span
                    style={{
                      backgroundColor: '#F563491A',
                      color: '#F56349',
                      height: '20px',
                      display: 'block',
                      margin: '-10px -8px',
                      textAlign: 'center',
                    }}
                  >
                    {formatAumont(val, record.secondaryUomPrecision)}
                  </span>
                );
              }
              return formatAumont(val, record.secondaryUomPrecision);
            },
          },
          {
            title: intl.get(`${modelPrompt}.originalQuantity`).d('原需求数量'),
            dataIndex: 'originalQuantity',
            width: 150,
            render: (text) => formatAumont(text),
          },
          doubleUnitEnabled && {
            title: intl.get(`${modelPrompt}.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
            onCell,
            render: (_, { secondaryUomCodeAndName }) => secondaryUomCodeAndName,
          },
          {
            title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
            dataIndex: 'quantity',
            width: 80,
            render: (val, record) => {
              if (
                !doubleUnitEnabled &&
                !isEqual(new BigNumber(record.quantity), new BigNumber(record.originalQuantity))
              ) {
                return (
                  <span
                    style={{
                      backgroundColor: '#F563491A',
                      color: '#F56349',
                      height: '20px',
                      display: 'block',
                      margin: '-10px -8px',
                      textAlign: 'center',
                    }}
                  >
                    {formatAumont(val)}
                  </span>
                );
              }
              return formatAumont(val);
            },
          },
          {
            title: getDynamicLabel(doubleUnitEnabled, 'uom'),
            dataIndex: 'uomName',
            width: 100,
            onCell,
            render: (_, { uomCodeAndName }) => uomCodeAndName,
          },
          {
            title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
            dataIndex: 'needByDate',
            width: 100,
            onCell: (record) => (record.dateEquallyFlag === 0 ? { className: 'active' } : {}),
            render: (text) => {
              const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : text;
              const formatDom = dateRender(dom) || null;
              return <>{formatDom}</>;
            },
          },
          {
            title: intl.get(`${modelPrompt}.promiseDeliveryDate`).d('承诺交货日期'),
            dataIndex: 'promiseDeliveryDate',
            width: 120,
            onCell: (record) => (record.dateEquallyFlag === 0 ? { className: 'active' } : {}),
            render: (text, record) => {
              const val = text ? moment(text).format(DEFAULT_DATE_FORMAT) : text;
              const formatDom = dateRender(val) || null;
              if (text !== record.needByDate) {
                return (
                  <span
                    style={{
                      backgroundColor: '#F563491A',
                      color: '#F56349',
                      height: '20px',
                      display: 'block',
                      margin: '-10px -8px',
                      textAlign: 'center',
                    }}
                  >
                    {formatDom}
                  </span>
                );
              }
              return formatDom;
            },
          },
          {
            title: intl.get(`${modelPrompt}.unitPrice`).d('不含税单价'),
            dataIndex: 'unitPrice',
            width: 130,
            align: 'right',
            render: (text, record) => {
              return unitPriceDefaultPrecision(
                record.priceShieldFlag,
                text,
                record.defaultPrecision,
                poSourcePlatform
              );
            },
          },
          {
            title: intl.get(`${modelPrompt}.taxedEnteredUnitPrice`).d('原币含税单价'),
            dataIndex: 'enteredTaxIncludedPrice',
            width: 130,
            align: 'right',
            render: (text, record) => {
              return unitPriceDefaultPrecision(
                record.priceShieldFlag,
                text,
                record.defaultPrecision,
                poSourcePlatform
              );
            },
          },
          {
            title: intl.get(`${modelPrompt}.unitPriceBatch`).d('每'),
            dataIndex: 'unitPriceBatch',
            width: 90,
            render: (val) => formatAumont(val),
          },
          {
            title: intl.get(`${modelPrompt}.lineAmount`).d('不含税行金额'),
            dataIndex: 'lineAmount',
            width: 130,
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                poSourcePlatform,
                orderHeaderFormDataSource.sourceOfTransferOrder
              );
            },
          },
          {
            title: intl.get(`${modelPrompt}.taxIncludedLineAmount`).d('含税行金额'),
            dataIndex: 'taxIncludedLineAmount',
            width: 130,
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                poSourcePlatform,
                orderHeaderFormDataSource.sourceOfTransferOrder
              );
            },
          },
          {
            title: `${intl.get(`${modelPrompt}.taxRate`).d('税率')}(%)`,
            dataIndex: 'taxRate',
            width: 80,
            render: (text) =>
              isNumber(Number(text)) || math.isBigNumber(text) ? new BigNumber(text) : 0,
          },
          {
            title: intl.get(`${modelPrompt}.currencyName`).d('币种'),
            dataIndex: 'currencyCode',
            width: 80,
          },
          {
            title: intl.get('sodr.common.model.common.department').d('部门'),
            dataIndex: 'departmentName',
            width: 130,
          },
          {
            title: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
            dataIndex: 'costName',
            width: 180,
          },
          {
            title: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
            dataIndex: 'accountSubjectName',
            width: 180,
          },
          {
            title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
            dataIndex: 'wbs',
            width: 180,
          },
          {
            title: intl.get(`${modelPrompt}.organizationName`).d('收货组织'),
            dataIndex: 'invOrganizationName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.inventoryName`).d('收货库房'),
            dataIndex: 'inventoryName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.locationName`).d('收货库位'),
            dataIndex: 'locationName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.specifications`).d('规格'),
            dataIndex: 'specifications',
            width: 80,
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
            dataIndex: 'model',
            width: 100,
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
            title: intl.get(`sodr.common.model.common.productBrand`).d('商品品牌'),
            dataIndex: 'productBrand',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.productModel`).d('商品规格'),
            dataIndex: 'productModel',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.packingList`).d('商品型号'),
            dataIndex: 'packingList',
            width: 120,
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
            title: intl.get(`${modelPrompt}.brand`).d('品牌'),
            dataIndex: 'brand',
            width: 150,
          },
          {
            title: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方行备注'),
            dataIndex: 'remark',
            width: 240,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
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
                <Tooltip title={val}>{val}</Tooltip>
              ),
          },
          {
            title: intl.get(`${modelPrompt}.feedback`).d('反馈信息'),
            dataIndex: 'feedback',
            width: 100,
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
            render: (text, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : poSourcePlatform === 'ERP'
                ? formatAumont(text)
                : formatAumont(text, orderHeaderFormDataSource.domesticDefaultPrecision),
          },
          {
            title: intl.get(`sodr.common.model.common.domesticUnitPrice`).d('本币不含税单价'),
            width: 120,
            dataIndex: 'domesticUnitPrice',
            render: (text, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : poSourcePlatform === 'ERP'
                ? formatAumont(text)
                : formatAumont(text, orderHeaderFormDataSource.domesticDefaultPrecision),
          },
          {
            title: intl
              .get(`sodr.common.model.common.domesticTaxIncludedLineAmount`)
              .d('本币含税金额'),
            width: 120,
            dataIndex: 'domesticTaxIncludedLineAmount',
            render: (val, record) =>
              amountFinancialPrecision(
                record.priceShieldFlag,
                val,
                orderHeaderFormDataSource.domesticFinancialPrecision,
                poSourcePlatform
              ),
          },
          {
            title: intl.get(`sodr.common.model.common.domesticLineAmount`).d('本币不含税金额'),
            width: 120,
            dataIndex: 'domesticLineAmount',
            render: (val, record) =>
              amountFinancialPrecision(
                record.priceShieldFlag,
                val,
                orderHeaderFormDataSource.domesticFinancialPrecision,
                poSourcePlatform
              ),
          },
          {
            title: intl.get(`sodr.common.model.common.budgetAccount`).d('预算科目'),
            width: 120,
            dataIndex: 'budgetAccountId',
            render: (_, record) => record.budgetAccountName,
          },
          {
            title: intl.get(`sodr.common.model.common.receiveToleranceQuantityType`).d('允差类型'),
            width: 150,
            dataIndex: 'receiveToleranceQuantityType',
          },
          {
            title: intl.get(`sodr.common.model.common.purchaseLineTypes`).d('采购行类型'),
            width: 150,
            dataIndex: 'purchaseLineTypeId',
            render: (val, record) => {
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(`purchaseLineTypeId`, {
                    initialValue: !isNil(val) ? val.toString() : null,
                  })(
                    <Select allowClear style={{ width: '100%' }}>
                      {purchaseLineType.map((item) => {
                        return <Select.Option key={item.value}>{item.meaning}</Select.Option>;
                      })}
                    </Select>
                  )}
                </FormItem>
              );
            },
          },
          {
            width: 100,
            dataIndex: 'docFlow',
            title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
            render: (_, record) => (
              <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
            ),
          },
        ],
      ],

      [
        'others',
        [
          {
            title: intl.get(`${modelPrompt}.itemTypeDesc`).d('物品类型'),
            dataIndex: 'categoryName',
            width: 120,
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`${modelPrompt}.rate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 90,
          },
          {
            title: intl.get(`${modelPrompt}.consignedFlag`).d('是否寄售'),
            dataIndex: 'consignedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.returnedFlag`).d('是否退回'),
            dataIndex: 'returnedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.freeFlag`).d('是否免费'),
            dataIndex: 'freeFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.immedShippedFlag`).d('是否直发'),
            dataIndex: 'immedShippedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          // TODO 后端没字段
          {
            title: intl.get(`${modelPrompt}.bom`).d('外协BOM'),
            width: 90,
            dataIndex: 'bom',
            render: (text, record) => (
              <a onClick={() => openBOMModal(record)}>
                {intl.get(`${commonPrompt}.button.view`).d('查看')}
              </a>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.purReqLineNum`).d('采购申请号|行号'),
            dataIndex: 'displayPrNumAndDisplayPrLineNum',
            width: 180,
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
            dataIndex: 'purReqAppliedName',
            width: 90,
          },
          {
            title: intl.get(`${modelPrompt}.shipToThirdPartyName`).d('送达方'),
            dataIndex: 'shipToThirdPartyName',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
            dataIndex: 'shipToThirdPartyAddress',
            width: 150,
            onCell,
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`${modelPrompt}.shipToThirdPartyContact`).d('联系人信息'),
            dataIndex: 'shipToThirdPartyContact',
            width: 150,
          },
          {
            title: intl.get(`${modelPrompt}.receiveTelNum`).d('联系人电话'),
            dataIndex: 'receiveTelNum',
            width: 150,
            render: (val, record) => (
              <span>{val ? `${record.internationalTelCode || ''} ${val}` : ''}</span>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.priceUomName`).d('订单价格单位'),
            dataIndex: 'priceUomName',
            width: 110,
            render: (_, { uomCodeAndName }) => uomCodeAndName,
          },
          {
            title: intl.get(`${modelPrompt}.priceUomConversion`).d('单位转换关系'),
            dataIndex: 'priceUomConversion',
            width: 150,
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
            dataIndex: 'partnerType',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.partnerNum`).d('合作方编码'),
            dataIndex: 'partnerNum',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.partnerName`).d('合作方名称'),
            dataIndex: 'partnerName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.dataSourceCode`).d('来源系统'),
            dataIndex: 'externalSystemCode',
            width: 120,
          },
        ],
      ],
    ]);

    if (isECOMMERCE) {
      dynamicColumns.forEach((item, key) => {
        if (key === 'basic') {
          item.splice(18, 0, {
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

  // 反馈审核中的行可勾选
  getEditLine(record) {
    return ['DELIVERY_DATE_REVIEW'].includes(record.displayStatusCode);
  }

  render() {
    const {
      form,
      dataSource = [],
      pagination,
      processing,
      radioGroupValue,
      customizeTable,
      customizeTabPane,
      fetchDetailList = (e) => e,
      orderHeaderFormDataSource = {},
    } = this.props;
    const { selectedRows, customVisable, customData, specsJsonType } = this.state;
    const columns = this.getColumns(radioGroupValue).filter((i) => i);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
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
        (processing.queryPartnersLoading && radioGroupValue === 'partners'),
      bordered: true,
      onChange: this.handleOnChange.bind(this),
      scroll: {
        x: scrollX >= 1200 && radioGroupValue !== 'invoice' ? scrollX : false,
      },
    };

    if (radioGroupValue !== 'partners') {
      tableProps.rowSelection = orderHeaderFormDataSource.collByLineFlag
        ? {
            getCheckboxProps: (record) => ({
              disabled: !this.getEditLine(record),
            }),
            selectedRowKeys: selectedRows.map((n) => n.key),
            onChange: this.onRowSelectedChange.bind(this),
          }
        : undefined;
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

    // const associatedDocProps = {
    //   associatedDoc,
    //   visible: radioGroupValue === 'invoice',
    // };
    return (
      <Fragment>
        {customizeTabPane(
          {
            code: 'SODR.ORDER_DELIVERY_LINE_LIST.TAB',
          },
          <Tabs onChange={this.handleOnRadioGroupChange} className="detail-list" animated={false}>
            <TabPane
              key="basic"
              tab={intl.get(`${viewMessagePrompt}.title.basicInfo`).d('基础信息')}
            >
              {!!orderHeaderFormDataSource.collByLineFlag && (
                <div className={styles['purchase-application']}>
                  <Form layout="inline">
                    <FormItem
                      label={intl.get(`${modelPrompt}.newLineDisplay`).d('隐藏不可审核订单行')}
                    >
                      {form.getFieldDecorator('lineDisplay', {
                        initialValue: 1,
                      })(
                        <Switch
                          onChange={(e) => fetchDetailList({ lineDisplay: e === 1 ? 0 : 1 })}
                        />
                      )}
                    </FormItem>
                  </Form>
                </div>
              )}
              {radioGroupValue === 'basic' &&
                customizeTable(
                  {
                    code: 'SODR.ORDER_DELIVERY_LINE_LIST.DELIVERY_LINE',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>
            <TabPane
              key="others"
              tab={intl.get(`${viewMessagePrompt}.title.otherInfo`).d('其他信息')}
            >
              {radioGroupValue === 'others' &&
                customizeTable(
                  {
                    code: 'SODR.ORDER_DELIVERY_LINE_LIST.OTHER',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>
            <TabPane
              disabled={processing.queryDetailListLoading}
              key="invoice"
              tab={intl.get(`${viewMessagePrompt}`).d('关联单据')}
            >
              {radioGroupValue === 'invoice' && <EditTable {...tableProps} />}
            </TabPane>
            <TabPane
              key="partners"
              tab={intl.get(`${viewMessagePrompt}.title.partners`).d('合作方')}
            >
              {radioGroupValue === 'partners' && <EditTable {...tableProps} />}
            </TabPane>
          </Tabs>
        )}
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
      </Fragment>
    );
  }
}
