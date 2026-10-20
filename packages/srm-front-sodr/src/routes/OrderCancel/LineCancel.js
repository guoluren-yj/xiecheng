/**
 * 整单取消
 * @date: 2019-2-20
 * @author: lixiaolong <xiaolong.li02@hand-china>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Table, Row, Col, Input, Button, Tooltip, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber } from 'lodash';
import moment from 'moment';
import DocFlow from '_components/DocFlow';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { dateTimeRender, dateRender } from 'utils/renderer';
import ValueList from 'hzero-front/lib/components/ValueList';
import urgentImg from '@/assets/icon-expedited.svg';
import yanqiImg from '@/assets/yanqi.svg';
import Lov from 'components/Lov';
import { math } from 'choerodon-ui/dataset';
import LovModal from '../components/MultipleLov';
import styles from './index.less';
import { formatAumont, redirectToOther, formatNumber, getDynamicLabel } from '../components/utils';
// import SearchDrawer from './SearchDrawer';
// sodr 国际化
const commonPrefix = 'sodr.orderCancel.view.message';

const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const modelPrompt = 'sodr.sendOrder.model.common';

// function countDecimals(val) {
//   const strArray = `${val}`.split('.') || [];
//   return !isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? isEmpty((strArray[1] || '').match(/[^0]/g))
//       ? 2
//       : `${val}`.split('.')[1].length || 0
//     : 0;
// }

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/single-order-cancel' })
export default class LineCancel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
    const { onRef } = this.props;
    onRef(this);
  }

  componentDidMount() {
    const { pagination } = this.props;
    this.handleSearch(pagination);
  }

  /**
   * 查询
   * @param {object} page - 分页对象
   */
  @Bind()
  handleSearch(page = {}) {
    const { onSearch } = this.props;
    onSearch(page);
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查看订单详情
   * @param {object} record - 行数据
   */
  @Bind()
  viewDetail(record = {}) {
    const { onViewDetail } = this.props;
    if (onViewDetail) {
      onViewDetail(record);
    }
  }

  /**
   * 隐藏更多查询条件的drawer
   */
  @Bind()
  handleHideDrawer() {
    this.setState({
      showMore: false,
    });
  }

  /**
   * 更多查询条件
   */
  @Bind()
  moreButtons() {
    this.setState({
      showMore: true,
    });
  }

  /**
   * 供应商Lov改变时清空供应商地点
   * @param {String} value
   */
  @Bind()
  onChangeSupplierId(value, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    // const { supplierId } = record;
    const supplierCompanyIds = [];
    const supplierIds = [];
    for (let i = 0; i < record.length; i++) {
      if (record[i]) {
        const { supplierCompanyId, supplierId } = record[i];
        if (supplierCompanyId) {
          supplierCompanyIds.push(supplierCompanyId);
        }
        if (supplierId) {
          supplierIds.push(supplierId);
        }
      }
    }
    if (!value || getFieldValue('displaySupplierName') !== value) {
      resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
    registerField('supplierIds');
    registerField('supplierCompanyIds');
    setFieldsValue({
      supplierIds: supplierIds.join(','),
      supplierCompanyIds: supplierCompanyIds.join(','),
    });
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleToolTipVisible(field, value) {
    this.setState({
      [field]: !!value,
    });
  }

  /**
   * 公司Lov改变清空供应商和地点
   * @param {*} value
   */
  @Bind()
  handleChangeCompanyLov(value) {
    const {
      form: { getFieldValue, resetFields },
    } = this.props;
    if (!value || getFieldValue('companyId') !== value) {
      resetFields(['displaySupplierName', 'supplierId', 'supplierSiteCode', 'supplierSiteName']);
    }
  }

  /**
   * 打开滑窗搜索
   */
  @Bind()
  handleSearchMore() {
    this.setState({ showMore: false }, this.handleSearch());
  }

  /**
   * 绑定查询组件
   * @param {*} node -  查询组件
   */
  @Bind()
  bindSearchDrawer(node) {
    this.searchDrawer = node.props.form;
  }

  /**
   * 可操作类型圆点颜色
   * @param {*} record
   */
  @Bind()
  opreateTypeColor(record = {}) {
    if (record.opreateType === 'CANCEL' || record.opreateType === 'CLOSED') {
      return <span className="ant-badge-status-dot ant-badge-status-success" />;
    } else if (record.opreateType === 'NOT_CANCEL_OR_CLOSED') {
      return <span className="ant-badge-status-dot ant-badge-status-error" />;
    }
  }

  render() {
    // const { form, enumMap = {} } = this.props;
    const { showMore, tenantId, organizationId } = this.state;
    // const searchDrawerProps = {
    //   form,
    //   enumMap,
    //   visible: showMore,
    //   onHideDrawer: this.handleHideDrawer,
    //   onSearch: this.handleSearchMore,
    //   onRef: this.bindSearchDrawer,
    //   onReset: this.handleReset,
    // };
    const {
      loading,
      dataSource,
      pagination,
      // orderSource = [],
      rowSelection,
      enumMap = {},
      customizeTable,
      customizeFilterForm,
      form,
      doubleUnitEnabled,
      amountFinancialPrecision,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const { operateType = [] } = enumMap;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'displayStatusMeaning',
        fixed: 'left',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.orderNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        fixed: 'left',
        width: 180,
        render: (value, record) => (
          <div className={styles['row-agent-column']}>
            <span>
              {/* {record.deliveryDateRejectFlag === 1
                ? intl.get(`${modelPrompt}.deliveryDateReject`).d('交期审核退回')
                : value} */}
              {value}
            </span>
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${modelPrompt}.orderUrgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
            {record.beyondQuantity > 0 ? (
              <Tooltip
                title={intl
                  .get(`${modelPrompt}.yanqiImg`)
                  .d(`订单超期${this.Time(record.promiseDeliveryDate)}天`)}
              >
                <img src={yanqiImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`${commonPrefix}.operateType`).d('可操作类型'),
        dataIndex: 'opreateType',
        width: 150,
        render: (value, record) => (
          <span className="ant-badge ant-badge-status ant-badge-not-a-wrapper">
            {this.opreateTypeColor(record)}
            <span className="ant-badge-status-text">{record.opreateTypeMeaning}</span>
          </span>
        ),
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        fixed: 'left',
        width: 120,
        render: (value, record) => record.supplierCode || record.supplierCompanyCode,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        fixed: 'left',
        width: 120,
        render: (value, record) => record.supplierName || record.supplierCompanyName,
      },
      {
        title: intl.get(`${modelPrompt}.version`).d('版本'),
        dataIndex: 'versionNum',
        width: 60,
      },
      {
        title: intl.get(`${modelPrompt}.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 90,
      },
      {
        title: intl.get(`${modelPrompt}.lineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 60,
      },
      {
        title: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        width: 100,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get('sodr.quotePurchase.model.quotePurchase.accountType').d('账户分配类别'),
        width: 120,
        dataIndex: 'accountAssignTypeCode',
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 90,
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.oldItemCodeNum`).d('旧物料号'),
        dataIndex: 'oldItemCode',
        width: 90,
      },
      doubleUnitEnabled && {
        title: intl.get(`${modelPrompt}.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 80,
        render: (text, { secondaryUomPrecision }) => formatAumont(text, secondaryUomPrecision),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 80,
        render: (text) => formatAumont(text),
      },
      doubleUnitEnabled && {
        title: intl.get(`${modelPrompt}.uomName`).d('单位'),
        dataIndex: 'secondaryUomName',
        width: 60,
        render: (_, { secondaryUomCodeAndName }) => secondaryUomCodeAndName,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'uom'),
        dataIndex: 'uomName',
        width: 60,
        render: (_, { uomCodeAndName }) => uomCodeAndName,
      },
      {
        title: intl.get(`${modelPrompt}.netReceivedQuantity`).d('净接收'),
        dataIndex: 'netReceivedQuantity',
        width: 80,
        render: (text) => formatAumont(text),
      },
      {
        title: intl.get(`${modelPrompt}.netDeliverQuantity`).d('净入库'),
        dataIndex: 'netDeliverQuantity',
        width: 80,
        render: (text) => formatAumont(text),
      },
      {
        title: intl.get(`${modelPrompt}.invoicedQuantity`).d('已开票'),
        dataIndex: 'invoicedQuantity',
        width: 80,
        render: (text) => formatAumont(text),
      },
      {
        title: intl.get(`${modelPrompt}.afterTaxunitPrice`).d('不含税单价'),
        dataIndex: 'unitPrice',
        align: 'right',
        width: 100,
        render: (val, record) => {
          // const count = countDecimals(val);
          return record.priceSensitiveFlag
            ? '****'
            : (math.isBigNumber(val) || isNumber(val)) && !math.isNaN(val)
            ? formatNumber(val)
            : '';
        },
      },
      {
        title: intl.get(`${modelPrompt}.enteredTaxIncludedPrice`).d('原币含税单价'),
        dataIndex: 'enteredTaxIncludedPrice',
        align: 'right',
        width: 100,
        render: (val, record) => {
          // const count = countDecimals(val);
          return record.priceSensitiveFlag
            ? '****'
            : (isNumber(val) || math.isBigNumber(val)) && !isNaN(val)
            ? formatNumber(val)
            : '';
        },
        // render: (text, record) => (record.priceSensitiveFlag ? '****' : numberFormat(text)),
        // render: (val, record) => {
        //   if (val) {
        //     const value = `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        //     return record.priceSensitiveFlag ? '****' : value;
        //   }
        //   return record.priceSensitiveFlag ? '****' : '';
        // },
      },
      {
        title: intl.get(`${modelPrompt}.afterTaxlineAmount`).d('不含税行金额'),
        dataIndex: 'lineAmount',
        align: 'right',
        width: 100,
        render: (val, record) => {
          return amountFinancialPrecision(record, val);
        },
      },
      {
        title: intl.get(`${modelPrompt}.taxIncludedLineAmount`).d('含税行金额'),
        dataIndex: 'taxIncludedLineAmount',
        align: 'right',
        width: 100,
        render: (val, record) => {
          return amountFinancialPrecision(record, val);
        },
        // render: (text, record) => (record.priceSensitiveFlag ? '****' : numberFormat(text)),
        // render: (val, record) => {
        //   if (val) {
        //     const value = `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        //     return record.priceSensitiveFlag ? '****' : value;
        //   }
        //   return record.priceSensitiveFlag ? '****' : '';
        // },
      },
      {
        title: intl.get(`${modelPrompt}.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
        width: 40,
        render: (text) => formatAumont(text),
      },
      {
        title: intl.get(`${modelPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 60,
      },
      {
        title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${modelPrompt}.promisedDate`).d('承诺日期'),
        dataIndex: 'promiseDeliveryDate',
        width: 150,
        render: dateRender,
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
        title: intl.get(`${modelPrompt}.modelNum`).d('型号'),
        dataIndex: 'model',
        width: 80,
      },
      {
        title: intl.get(`${modelPrompt}.manufacturerName`).d('制造商'),
        dataIndex: 'manufacturerName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.brand`).d('品牌'),
        dataIndex: 'brand',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.erpStatus`).d('ERP状态'),
        dataIndex: 'erpStatusMeaning',
        width: 90,
      },
      {
        title: intl.get(`${modelPrompt}.frozenStatus`).d('是否冻结'),
        dataIndex: 'frozenFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.closedFlag`).d('是否关闭'),
        dataIndex: 'closedFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.cancelledFlag`).d('是否取消'),
        dataIndex: 'cancelledFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.consignedFlag`).d('是否寄售'),
        dataIndex: 'consignedFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.returnedFlag`).d('是否退回'),
        dataIndex: 'returnedFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.freeFlag`).d('是否免费'),
        dataIndex: 'freeMeaning',
        width: 90,
      },
      {
        title: intl.get(`${modelPrompt}.immedShippedFlag`).d('是否直发'),
        dataIndex: 'isImmedShippedFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方行备注'),
        dataIndex: 'remark',
        width: 150,
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
              {val}12345667788900
            </span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${modelPrompt}.feedbackInfo`).d('反馈信息'),
        dataIndex: 'feedback',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.shipToThirdPartyName`).d('送达方'),
        dataIndex: 'shipToThirdPartyName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
        dataIndex: 'shipToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.contactPersonInfo`).d('联系人信息'),
        dataIndex: 'shipToContactInfo',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.supplierSites`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.purchaseAgent`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get(`entity.organization.class.receiving`).d('收货组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.inventoryName`).d('收货库房'),
        dataIndex: 'inventoryName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.locationName`).d('收货库位'),
        dataIndex: 'locationName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.billToLocationName`).d('收单方'),
        dataIndex: 'billToLocationName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.priceUomName`).d('价格单位'),
        dataIndex: 'priceUomName',
        width: 90,
        render: (_, { priceUomCodeName }) => priceUomCodeName,
      },
      {
        title: intl.get(`${modelPrompt}.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.orderCancel.view.message.createdName`).d('创建人'),
        dataIndex: 'erpCreatedName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.releaseTime`).d('发布时间'),
        dataIndex: 'releasedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.confirmedDate`).d('确认日期'),
        dataIndex: 'confirmedDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${modelPrompt}.urgentOrNot`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.urgentTime`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.contractNum`).d('合同编号'),
        dataIndex: 'erpContractNum',
        width: 160,
      },
      {
        title: intl.get(`${modelPrompt}.purchaseReqNum`).d('采购申请号'),
        dataIndex: 'displayPrNum',
        width: 100,
        render: (val, record) => <a onClick={() => redirectToOther('purchase', record)}>{val}</a>,
      },
      {
        title: intl.get(`${modelPrompt}.purchaseReqLineNum`).d('采购申请行号'),
        dataIndex: 'displayPrLineNum',
        width: 120,
        render: (val, record) => <a onClick={() => redirectToOther('purchase', record)}>{val}</a>,
      },
      {
        title: intl.get(`${modelPrompt}.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.commodityDirectory`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.sourceSystem`).d('来源系统'),
        dataIndex: 'poSourcePlatformMeaning',
        width: 100,
      },
      {
        width: 100,
        dataIndex: 'docFlow',
        title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
        render: (_, record) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
        ),
      },
    ].filter((i) => i);
    return (
      <Fragment>
        {customizeFilterForm(
          {
            form,
            expand: showMore,
            code: 'SODR.ORDER_CANCEL_LIST.FILTER_BY_LINE',
          },
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.orderCode`).d('订单号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('displayPoNum')(
                        <Input
                          inputChinese={false}
                          onChange={(e) => {
                            if (!e.target.value) {
                              setFieldsValue({ displayLineNum: null });
                            }
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`${commonPrefix}.lineNum`).d('行号')}
                    >
                      {getFieldDecorator('displayLineNum')(
                        <Input disabled={!getFieldValue('displayPoNum')} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${commonPrefix}.operateType`).d('可操作类型')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('operateType')(
                        <Select allowClear>
                          {operateType.map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ display: showMore ? 'block' : 'none' }}>
                  <Col span={8}>
                    <FormItem {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                      {getFieldDecorator('companyId')(
                        <Lov
                          code="SPFM.USER_AUTH.COMPANY"
                          queryParams={{ organizationId: tenantId }}
                          textField="companyName"
                          onChange={this.handleChangeCompanyLov}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`entity.business.tag`).d('业务实体')}
                    >
                      {getFieldDecorator('ouId')(
                        <Lov
                          code="HPFM.OU"
                          queryParams={{ tenantId, enabledFlag: 1 }}
                          textField="orgName"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`${modelPrompt}.shipmentNum`).d('发运号')}
                    >
                      {getFieldDecorator('displayLineLocationNum')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`entity.item.code`).d('物料编码')}
                    >
                      {getFieldDecorator('itemCodes')(
                        <LovModal code="SODR.PO_ITEM" queryParams={{ tenantId }} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${modelPrompt}.itemCategory`).d('物料分类')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('categoryIds')(
                        <LovModal
                          code="SPRM.ITEM_CATEGOR"
                          textField="categoryName"
                          lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                          queryParams={{
                            tenantId,
                            // enabledFlag: 1,
                            // itemId: getFieldValue('itemId'),
                          }}
                          isCascade // 是否级联勾选
                          parentRowKey="parentCategoryId" // 父级id
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`${modelPrompt}.needDateStart`).d('需求日期从')}
                    >
                      {getFieldDecorator('needByDateStart')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('needByDateEnd') &&
                            moment(getFieldValue('needByDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`${modelPrompt}.needDateEnd`).d('需求日期至')}
                    >
                      {getFieldDecorator('needByDateEnd')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('needByDateStart') &&
                            moment(getFieldValue('needByDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${modelPrompt}.sourcePlatform`).d('来源平台')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('poSourcePlatform')(
                        <ValueList lovCode="SPRM.SRC_PLATFORM" allowClear />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
                    >
                      {getFieldDecorator('purchaseOrgId')(
                        <Lov
                          code="SPFM.USER_AUTH.PURORG"
                          queryParams={{ organizationId: tenantId }}
                          textField="purOrganizationName"
                          lovOptions={{ displayField: 'organizationName' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`entity.organization.class.receipt`).d('收货组织')}
                    >
                      {getFieldDecorator('invOrganizationIds')(
                        <LovModal
                          code="SPUC.SMDM.INV_ORG"
                          // textField="organizationName"
                          queryParams={{
                            organizationId,
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
                    >
                      {getFieldDecorator('tempKeys')(
                        <LovModal
                          code="SODR.AUTH_SUPPLIER"
                          // lovOptions={{ displayField: 'displaySupplierName' }}
                          // textField="displaySupplierName"
                          onChange={this.onChangeSupplierId}
                          queryParams={{
                            tenantId,
                            companyId: getFieldValue('companyId'),
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <FormItem>
                  {!showMore ? (
                    <Button onClick={this.moreButtons}>
                      {intl.get('hzero.common.button.viewMore').d('更多查询')}
                    </Button>
                  ) : (
                    <Button onClick={this.handleHideDrawer}>
                      {intl.get('hzero.common.button.collected').d('收起查询')}
                    </Button>
                  )}
                  <Button onClick={this.handleReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        <br />
        {customizeTable(
          {
            code: 'SODR.ORDER_CANCEL_LIST.GRID_BY_LINE',
          },
          <Table
            loading={loading}
            bordered
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            pagination={{ ...pagination, showQuickJumper: true }}
            scroll={{
              x: columns.map((item) => item.width).reduce((sum, val) => sum + val),
              y: 'calc(100vh - 350px)',
            }}
            onChange={(page) => this.handleSearch(page, true)}
            rowKey="poLineLocationId"
          />
        )}
        {/* <SearchDrawer {...searchDrawerProps} /> */}
      </Fragment>
    );
  }
}
