/**
 * OtherInfoList - 订单签署 - 明细页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { sum, isNumber, isFunction, isNil } from 'lodash';
import { Table, Tabs, Form, Input, Tooltip, Select } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import EditTable from 'components/EditTable';
import UploadModal from 'components/Upload';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import { numberRender } from 'utils/renderer';
import BigNumber from 'bignumber.js';
import BasicInfoListEditableCell from './BasicInfoListEditableCell';
import { math } from 'choerodon-ui/dataset';

import { BUCKET_NAME, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import { formatAumont, formatNumber } from '@/routes/components/utils';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';

const FormItem = Form.Item;
const { TabPane } = Tabs;
const { TextArea } = Input;
// const FormItem = Form.Item;
// EditableContext组件初始化
const EditableContext = React.createContext();
// EditableRow组件初始化
const EditableRow = ({ form, index, ...props }) => {
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  );
};

// EditableRow组件form高阶化处理,传入form
const EditableFormRow = Form.create({ fieldNameProp: null })(EditableRow);

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
 * List - 业务组件 - 我收到的订单
 * @extends {Component} - React.Component
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @reactProps {Array<Object>} [dataSource=[]] - 数据源
 * @reactProps {object} [pagination={}]
 * @reactProps {function} [assignDataSource= (e => e)] - 合并数据
 * @reactProps {function} [openBOMModal= (e => e)] 打开BOM
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @return React.element
 */
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
   * saveRowData - 合并行数据
   * @param {object} rowData - 行数据
   */
  saveRowData(rowData) {
    const { dataSource = {}, assignDataSource = (e) => e } = this.props;
    assignDataSource(dataSource.common.map((n) => (n.key === rowData.key ? rowData : n)));
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

  // priceUomRender(text, record) {
  //   return text ? `${record.priceUomCode}/${text}` : '';
  // }

  getColumns(actionKey) {
    const {
      openBOMModal = (e) => e,
      poSourcePlatform,
      amountFinancialPrecision,
      headerInfo,
      form: { getFieldDecorator },
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
        title: intl.get(`sodr.common.model.common.displayLineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 60,
      },
      {
        title: intl.get(`sodr.common.model.common.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        dataIndex: 'projectCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 90,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val) => <Tooltip title={val}>{val}</Tooltip>,
      },
    ].map((n) => (actionKey !== 'invoice' ? { ...n, fixed: 'left' } : n));

    const dynamicColumns = new Map([
      [
        'basic',
        [
          {
            title: intl.get(`sodr.common.model.common.quantity`).d('数量'),
            dataIndex: 'quantity',
            width: 100,
            render: (text) => formatAumont(text),
          },
          {
            title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
            dataIndex: 'uomCodeAndName',
            width: 100,
            onCell,
          },
          {
            title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
            dataIndex: 'needByDate',
            width: 120,
            render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : null),
          },
          {
            title: intl.get(`sodr.common.model.common.promiseDeliveryDate`).d('承诺交货日期'),
            dataIndex: 'promiseDeliveryDate',
            width: 120,
            render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : null),
          },
          {
            title: intl.get(`sodr.common.model.common.currentPurchasePrice`).d('最近一次采购价'),
            width: 130,
            align: 'right',
            dataIndex: 'lastPurchasePrice',
            render: (val) => formatNumber(val),
          },
          {
            title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
            dataIndex: 'unitPrice',
            width: 130,
            align: 'right',
            render: (text, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : poSourcePlatform === 'ERP'
                ? formatAumont(text)
                : formatAumont(text, record.defaultPrecision),
          },
          {
            title: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
            dataIndex: 'enteredTaxIncludedPrice',
            width: 130,
            align: 'right',
            render: (text, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : poSourcePlatform === 'ERP'
                ? formatAumont(text)
                : formatAumont(text, record.defaultPrecision),
          },
          {
            title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
            dataIndex: 'unitPriceBatch',
            width: 90,
            render: (val) => formatAumont(val),
          },
          {
            title: intl.get(`sodr.common.model.common.lineAmount`).d('不含税行金额'),
            dataIndex: 'lineAmount',
            width: 130,
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                poSourcePlatform
              );
            },
          },
          {
            title: intl.get(`sodr.common.model.common.taxIncludedLineAmount`).d('含税行金额'),
            dataIndex: 'taxIncludedLineAmount',
            width: 130,
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                poSourcePlatform
              );
            },
          },
          {
            title: `${intl.get(`sodr.common.model.common.taxRate`).d('税率')}(%)`,
            dataIndex: 'taxRate',
            width: 80,
            render: (text) =>
              isNumber(Number(text)) || math.isBigNumber(text) ? new BigNumber(text) : 0,
          },
          {
            title: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
            dataIndex: 'currencyCode',
            width: 80,
          },
          {
            title: intl.get('sodr.common.model.common.department').d('部门'),
            dataIndex: 'departmentName',
            width: 130,
          },
          {
            title: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
            dataIndex: 'invOrganizationName',
            width: 150,
          },
          {
            title: intl.get(`sodr.common.model.common.inventoryName`).d('收货库房'),
            dataIndex: 'inventoryName',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.locationName`).d('收货库位'),
            dataIndex: 'locationName',
            width: 120,
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
            title: intl.get(`sodr.common.model.common.specifications`).d('规格'),
            dataIndex: 'specifications',
            width: 100,
          },
          {
            title: intl.get(`sodr.common.model.common.model`).d('型号'),
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
            render: (val) => (
              <TextArea disabled value={val} style={{ resize: 'vertical' }} rows={1} />
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.brand`).d('品牌'),
            dataIndex: 'brand',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`sodr.common.model.common.purchaserRemark`).d('采购方行备注'),
            dataIndex: 'remark',
            width: 260,
            render: (text, record) => {
              const basicInfoListEditableCellProps = {
                record,
                text,
                dataIndex: 'remark',
                saveRowData: this.saveRowData.bind(this),
              };
              return (
                <EditableContext.Consumer>
                  {(form) => (
                    <BasicInfoListEditableCell form={form} {...basicInfoListEditableCellProps} />
                  )}
                </EditableContext.Consumer>
              );
            },
          },
          {
            title: intl.get(`sodr.common.model.common.feedback`).d('反馈信息'),
            dataIndex: 'feedback',
            // width: 180,
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
            title: intl.get(`sodr.common.model.common.domesticUnitPrice`).d('本币不含税单价'),
            width: 120,
            dataIndex: 'domesticUnitPrice',
            render: (val, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : poSourcePlatform === 'ERP'
                ? formatAumont(val)
                : formatAumont(val, headerInfo.domesticDefaultPrecision),
          },
          {
            title: intl.get(`sodr.common.model.common.domesticTaxIncludedPrice`).d('本币含税单价'),
            width: 120,
            dataIndex: 'domesticTaxIncludedPrice',
            render: (val, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : poSourcePlatform === 'ERP'
                ? formatAumont(val)
                : formatAumont(val, headerInfo.domesticDefaultPrecision),
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
                headerInfo.domesticFinancialPrecision,
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
                headerInfo.domesticFinancialPrecision,
                poSourcePlatform
              ),
          },
          {
            title: intl.get(`sodr.common.model.common.purchaseLineTypes`).d('采购行类型'),
            width: 150,
            dataIndex: 'purchaseLineTypeId',
            render: (val) => {
              return (
                <FormItem>
                  {getFieldDecorator(`purchaseLineTypeId`, {
                    initialValue: !isNil(val) ? val.toString() : null,
                  })(
                    <Select allowClear style={{ width: '100%' }}>
                      {purchaseLineType.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
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
            title: intl.get(`sodr.common.model.common.itemType`).d('物品类型'),
            dataIndex: 'categoryName',
            width: 120,
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`sodr.common.model.common.rate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 90,
          },
          {
            title: intl.get(`sodr.common.model.common.consignedFlag`).d('是否寄售'),
            dataIndex: 'consignedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`sodr.common.model.common.returnedFlag`).d('是否退回'),
            dataIndex: 'returnedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`sodr.common.model.common.freeFlag`).d('是否免费'),
            dataIndex: 'freeFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`sodr.common.model.common.immedShippedFlag`).d('是否直发'),
            dataIndex: 'immedShippedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          // TODO 后端没字段
          {
            title: intl.get(`sodr.common.model.common.bom`).d('外协BOM'),
            width: 90,
            dataIndex: 'bom',
            render: (text, record) => (
              <a onClick={() => openBOMModal(record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.purReqLineNum`).d('采购申请号|行号'),
            dataIndex: 'displayPrNumAndDisplayPrLineNum',
            width: 180,
          },
          {
            title: intl.get(`sodr.common.model.quotePurchase.number`).d('采购协议号|行号'),
            dataIndex: 'contractNum',
            width: 180,
          },
          {
            title: intl.get(`sodr.common.model.common.sourceLineNum`).d('寻源单号|行号'),
            dataIndex: 'sourceNumAndLine',
            width: 180,
            render: (val, record) => val || record.sourceCodeNum,
          },
          {
            title: intl.get(`sodr.common.model.common.purReqAppliedName`).d('申请人'),
            dataIndex: 'prRequestedName',
            width: 90,
            render: (_, record) => record.purReqAppliedName,
          },
          {
            title: intl.get(`sodr.common.model.common.shipToThirdPartyName`).d('送达方'),
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
            title: intl.get(`sodr.common.model.common.shipToThirdPartyContact`).d('联系人信息'),
            dataIndex: 'shipToThirdPartyContact',
            width: 150,
          },
          {
            title: intl.get(`sodr.common.model.common.receiveTelNum`).d('联系人电话'),
            dataIndex: 'receiveTelNum',
            width: 150,
            render: (val, record) => (
              <span>{val ? `${record.internationalTelCode || ''} ${val}` : ''}</span>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.priceUomName`).d('订单价格单位'),
            dataIndex: 'priceUomCodeName',
            width: 110,
          },
          {
            title: intl.get(`sodr.common.model.common.priceUomConversion`).d('单位转换关系'),
            dataIndex: 'priceUomConversion',
            width: 150,
            onCell,
          },
          // {
          //   title: intl.get(`sodr.common.model.common.frozenFlag`).d('冻结状态'),
          //   dataIndex: 'frozenFlag',
          //
          //   width: 90,
          //   render: text =>
          //     intl
          //       .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
          //       .d(text === 1 ? '是' : '否'),
          // },
        ],
      ],
      ['invoice', []],
      [
        'partners',
        [
          {
            title: intl.get(`sodr.common.model.common.partnerType`).d('合作类型'),
            dataIndex: 'partnerType',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`sodr.common.model.common.partnerNum`).d('合作方编码'),
            dataIndex: 'partnerNum',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.partnerName`).d('合作方名称'),
            dataIndex: 'partnerName',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.dataSourceCode`).d('来源系统'),
            dataIndex: 'externalSystemCode',
            width: 120,
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

  handleOnChange(page) {
    const { onChange = (e) => e, radioGroupValue } = this.props;
    onChange(radioGroupValue !== 'partners' ? 'common' : 'partners', page);
  }

  onTableRow(record) {
    const {
      setActionListCommonRow = (e) => e,
      actionListCommonRow = {},
      radioGroupValue,
    } = this.props;
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
      dataSource = [],
      pagination,
      processing,
      radioGroupValue,
      customizeTable,
      customizeTabPane,
    } = this.props;

    const { customVisable, customData, specsJsonType } = this.state;

    const columns = this.getColumns(radioGroupValue);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const components = {
      body: {
        row: EditableFormRow,
      },
    };
    const actionTableKey = ['basic', 'others', 'invoice'].includes(radioGroupValue)
      ? 'common'
      : radioGroupValue;
    const tableProps = {
      // rowKey: this.defaultTableRowKey,
      components,
      columns,
      dataSource: dataSource[actionTableKey] || [],
      pagination: pagination[actionTableKey],
      loading:
        processing.queryDetailListLoading ||
        (processing.queryPartnersLoading && radioGroupValue === 'partners') ||
        processing.detailPublishLoading,
      bordered: true,
      onChange: this.handleOnChange.bind(this),
      scroll: { x: scrollX >= 1200 && radioGroupValue !== 'invoice' ? scrollX : false },
    };

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

    // const associatedDocProps = {
    //   associatedDoc,
    //   visible: radioGroupValue === 'invoice',
    // };
    return (
      <Fragment>
        {customizeTabPane(
          {
            code: 'SODR.ORDER_SIGN_DETAIL.TAB',
          },
          <Tabs onChange={this.handleOnRadioGroupChange} className="detail-list" animated={false}>
            <TabPane
              key="basic"
              tab={intl.get(`sodr.common.view.message.title.basicInfo`).d('基础信息')}
            >
              {radioGroupValue === 'basic' &&
                customizeTable(
                  {
                    code: 'SODR.ORDER_SIGN_DETAIL.BASIC',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>
            <TabPane
              key="others"
              tab={intl.get(`sodr.common.view.message.title.otherInfo`).d('其他信息')}
            >
              {radioGroupValue === 'others' &&
                customizeTable(
                  {
                    code: 'SODR.ORDER_SIGN_DETAIL.OTHER',
                  },
                  <Table {...tableProps} />
                )}
            </TabPane>
            <TabPane
              disabled={processing.queryDetailListLoading}
              key="invoice"
              tab={intl.get(`sodr.common.view.message`).d('关联单据')}
            >
              {radioGroupValue === 'invoice' && <Table {...tableProps} />}
            </TabPane>
            <TabPane
              key="partners"
              tab={intl.get(`sodr.common.view.message.title.partners`).d('合作方')}
            >
              {radioGroupValue === 'partners' && <Table {...tableProps} />}
            </TabPane>
          </Tabs>
        )}
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
      </Fragment>
    );
  }
}
