import React, { Component } from 'react';
import {
  Collapse,
  Row,
  Col,
  Popover,
  Tag,
  Button,
  Form,
  Input,
  Pagination,
  Checkbox,
  DatePicker,
  Spin,
  Icon,
  Badge,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber, sum, isEmpty, noop } from 'lodash';
import moment from 'moment';
// import { math } from 'choerodon-ui/dataset';
import { Tooltip } from 'choerodon-ui/pro';
import classnames from 'classnames';

import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import Lov from 'components/Lov';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import { numberSeparatorRender, phoneRender, roundEliminate } from '@/utils/renderer';
import { getDateFormat } from 'utils/utils';
import EditTable from 'components/EditTable';
import supplierIcon from '@/assets/supplierIcon.svg';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { PRIVATE_BUCKET } from '_utils/config';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import {
  calculateBasicQty,
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  TooltipTitle,
} from '@/utils/utils';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import LadderLevelModal from '../FeedbackBargain/LadderLevelModal';
import styles from './index.less';

const { Panel } = Collapse;
const FormItem = Form.Item;
const eliminateIcon = require('@/assets/eliminate.svg');

export default class SupplierListOffline extends Component {
  quotationName = getQuotationName(this.props.sourceKey === BID);

  @Bind()
  openFillCounter(event, supplierId, data) {
    const { fillCounterSupplier } = this.props;
    fillCounterSupplier(event, supplierId, data);
  }

  @Bind()
  changePage(page, supplierId, otherPayload = {}) {
    const { onSearch } = this.props;
    onSearch(page, supplierId, 1, otherPayload);
  }

  /**
   * 渲染折叠面板头信息
   */
  @Bind()
  renderCollapseHeader(data) {
    const { collapseSupplierActiveKeys } = this.props;
    return (
      <Row>
        <Col span={1}>
          {data.allEliminate ? (
            <img src={eliminateIcon} alt="icon" />
          ) : (
            <img src={supplierIcon} alt="icon" />
          )}
        </Col>
        <Col span={11}>
          <h3>
            <Popover content={data.supplierCompanyName}>{data.supplierCompanyName}</Popover>
            <Icon
              className={styles.arrowIcon}
              type={collapseSupplierActiveKeys.includes(data.rfxLineSupplierId) ? 'up' : 'down'}
            />
          </h3>
          <div>
            <span>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人')}：
              {data.contactName}
            </span>
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话')}：
              {phoneRender(data.internationalTelCodeMeaning, data.contactMobilephone)}
            </span>
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件')}：
              {data.contactMail}
            </span>
          </div>
        </Col>
        <Col span={9} style={{ marginTop: '14px' }}>
          <Tooltip placement="topLeft" title={data.feedbackStatusMeaning}>
            <Tag
              style={{ backgroundColor: 'rgba(6,135,255,0.1)', color: 'rgb(6,135,255)' }}
              className={classnames(styles['bargin-tag'])}
            >
              {data.feedbackStatusMeaning}
              {/* {intl.get(`ssrc.inquiryHall.model.inquiryHall.alreadyInvolved`).d('已参与')} */}
            </Tag>
          </Tooltip>
          <Tooltip
            placement="topLeft"
            title={
              <span>
                {intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.commonAlreadyQuotationAmn`, {
                    quotationName: this.quotationName,
                  })
                  .d('{quotationName}金额')}
                ：{data.supplierTotalAmount}
              </span>
            }
          >
            <Tag
              style={{ backgroundColor: 'rgba(243,49,103,0.1)', color: 'rgb(243,49,103)' }}
              className={classnames(styles['bargin-tag'])}
            >
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonAlreadyQuotationAmn`, {
                  quotationName: this.quotationName,
                })
                .d('{quotationName}金额')}
              ：{data.supplierTotalAmount}
            </Tag>
          </Tooltip>
        </Col>
        <Col span={3} style={{ marginTop: '14px' }}>
          <Button
            type="primary"
            onClick={(event) =>
              this.openFillCounter(event, data.rfxLineSupplierId || data.supplierCompanyId, data)
            }
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.priceInBulk`).d('批量填写价格')}
          </Button>
        </Col>
      </Row>
    );
  }

  // 金额计算
  calcLineAmount = (record) => {
    const { dynamicChangePrice = noop } = this.props;
    if (typeof dynamicChangePrice === 'function') {
      dynamicChangePrice({ record, uiType: 'h0' });
    }
  };

  // taxIncludedFlag change
  @Bind()
  changeTaxIncludedFlag(e, record) {
    const currentLineForm = record?.$form;
    const { checked } = e.target || {};
    if (!currentLineForm) {
      return;
    }

    currentLineForm.setFieldsValue({
      taxIncludedFlag: checked,
      taxRate: null,
      taxId: null,
    });

    this.calcLineAmount(record);
  }

  /**
   * 改变税率-获取税率显示值
   */
  @Bind()
  handleChangeTaxId(_, dataList, record = {}) {
    // const { bargainHeader } = this.props;
    const form = record.$form;

    form.setFieldsValue({
      taxRate: dataList.taxRate,
      taxId: dataList.taxId,
    });

    this.calcLineAmount(record);
  }

  /**
   * 监听单价改变 - 增加防抖
   * @param: {number} value - 输入框输入值
   * @param: {Object} record - 行记录
   */
  @Bind()
  handleChangeUnitPrice(value, record) {
    // const { doubleUnitFlag } = this.props;
    const form = record.$form;

    // const name = doubleUnitFlag ? 'currentQuotationSecPrice' : 'currentQuotationPrice';

    form.setFieldsValue({
      currentQuotationSecPrice: value, // 保存校验需要这个字段
      currentQuotationPrice: value,
    });

    this.calcLineAmount(record);
  }

  /**
   * 监听未税单价改变 - 增加防抖
   * @param: {number} value - 输入框输入值
   * @param: {Object} record - 行记录
   */
  @Bind()
  handleChangeNetPrice(value, record) {
    // const { doubleUnitFlag } = this.props;
    const form = record.$form;

    // const name = doubleUnitFlag ? 'netSecondaryPrice' : 'netPrice';

    form.setFieldsValue({
      netSecondaryPrice: value,
      netPrice: value,
    });

    this.calcLineAmount(record);
  }

  @Bind()
  priceValidator(_, value, callback) {
    const arr = String(value).split('.');
    if (arr[0] && arr[1]) {
      if (arr[1].length > 10) {
        callback(
          intl.get(`ssrc.supplierQuotation.model.supQuo.priceNumLimit`).d('单价不能超过十位小数')
        );
      } else {
        callback();
      }
    } else {
      callback();
    }
  }

  // 改变基本数量
  handleChangeQuantity = (value, record) => {
    record.$form.setFieldsValue({ currentQuotationQuantity: value });

    this.calcLineAmount(record);
  };

  changeCurrentQuotationSecondaryQuantity(val, record) {
    const { doubleUnitFlag } = this.props;
    const { value } = val?.target;
    if (value) {
      const { itemId, quotationLineId, uomId, secondaryUomId } = record;
      if (doubleUnitFlag && itemId) {
        calculateBasicQty({
          secondaryQuantity: value,
          itemId,
          businessKey: quotationLineId,
          doublePrimaryUomId: uomId,
          secondaryUomId,
        }).then((res) => {
          record.$form.setFieldsValue({ currentQuotationQuantity: res });
        });
      } else {
        record.$form.setFieldsValue({ currentQuotationQuantity: value });
      }
    } else if (value === 0) {
      record.$form.setFieldsValue({ currentQuotationQuantity: value });
    }

    this.calcLineAmount(record);
  }

  onChangeFreightIncludedFlag(e, record) {
    if (e.target.value === 0) {
      record.$form.setFieldsValue({
        freightAmount: '',
      });
    }
  }

  /**
   * 渲染供应商表格
   */
  @Bind()
  renderSupplierTable(supplierId, data, pagination, otherPayload = {}) {
    const { rfxLineSupplierId } = otherPayload || {};
    const {
      loadingFlag,
      viewLadderLevel,
      pageSize,
      organizationId,
      bargainHeader = {},
      sourceKey = INQUIRY,
      customizeTable,
      doubleUnitFlag,
      newQuotationFlag = 0,
      // bargainFlag = false,
      remote,
    } = this.props;
    const {
      priceTypeCode = null,
      systemVersion, // systemVersion === 2 新模板
    } = bargainHeader || {};
    // 过滤出当前供应商对应的数据
    const proSupplierData =
      data && data.filter((item) => item.rfxLineSupplierId === rfxLineSupplierId);
    const proSupplierPagination = pagination[rfxLineSupplierId];
    const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';
    const colorRemote = remote
      ? remote?.process('SSRC_BARGAIN_PROCESS_BARGAIN_SUPPLIER_OFFLINE_TABLE_COLOR', 'red')
      : 'red';
    const _columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 250,
        render: (val, record) => roundEliminate(val, record),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        dataIndex: 'specs',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineStatus`).d('行状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      doubleUnitFlag
        ? {
            title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
            dataIndex: 'currentQuotationSecPrice',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('currentQuotationSecPrice', {
                    initialValue: val,
                    rules: [
                      {
                        required:
                          priceTypeCode === 'currentQuotationPrice' &&
                          record.quotationLineStatus !== 'ABANDONED' &&
                          !record.eliminateFlag &&
                          record.supplierStatus !== 'QUOTATION_INVALID' &&
                          record.supplierStatus !== 'REVIEW_SCORE_NO_APPROVED',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax')
                            .d('单价(含税)'),
                        }),
                      },
                      {
                        validator: this.priceValidator,
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      currency={record.quotationCurrencyCode}
                      max="99999999999999999999"
                      style={{
                        width: '100%',
                        color:
                          record.highlightField !== 'currentQuotationSecPrice' ? '' : colorRemote,
                      }}
                      disabled={
                        isUnTaxPriceFlag ||
                        record.quotationLineStatus === 'ABANDONED' ||
                        !!record.eliminateFlag ||
                        record.supplierStatus === 'QUOTATION_INVALID' ||
                        record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED'
                      }
                      omitZeroFlag
                      onChange={(priceValue) => this.handleChangeUnitPrice(priceValue, record)}
                    />
                  )}
                </Form.Item>
              ) : val ? (
                <Popover placement="topLeft" content={val}>
                  {val}
                </Popover>
              ) : (
                ''
              ),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
            dataIndex: 'netSecondaryPrice',
            align: 'right',
            width: 150,
            render: (value, record) => {
              return ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('netSecondaryPrice', {
                    initialValue: value,
                    rules: [
                      {
                        required:
                          isUnTaxPriceFlag &&
                          record.quotationLineStatus !== 'ABANDONED' &&
                          !record.eliminateFlag &&
                          record.supplierStatus !== 'QUOTATION_INVALID' &&
                          record.supplierStatus !== 'REVIEW_SCORE_NO_APPROVED',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.supplierQuotation.model.supQuo.netPrice`)
                            .d('单价(不含税)'),
                        }),
                      },
                      {
                        validator: this.priceValidator,
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      currency={record.quotationCurrencyCode}
                      max="99999999999999999999"
                      min="0"
                      style={{
                        width: '100%',
                        color: record.highlightField !== 'netSecondaryPrice' ? '' : colorRemote,
                      }}
                      disabled={
                        !isUnTaxPriceFlag ||
                        record.quotationLineStatus === 'ABANDONED' ||
                        !!record.eliminateFlag ||
                        record.supplierStatus === 'QUOTATION_INVALID' ||
                        record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED'
                      }
                      omitZeroFlag
                      onChange={(priceValue) => this.handleChangeNetPrice(priceValue, record)}
                    />
                  )}
                </Form.Item>
              ) : (
                value
              );
            },
          }
        : null,
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'currentQuotationPrice',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentQuotationPrice', {
                initialValue: val,
                rules: [
                  {
                    required:
                      priceTypeCode === 'currentQuotationPrice' &&
                      record.quotationLineStatus !== 'ABANDONED' &&
                      !record.eliminateFlag &&
                      record.supplierStatus !== 'QUOTATION_INVALID' &&
                      record.supplierStatus !== 'REVIEW_SCORE_NO_APPROVED',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax')
                        .d('单价(含税)'),
                    }),
                  },
                  {
                    validator: this.priceValidator,
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  currency={record.quotationCurrencyCode}
                  max="99999999999999999999"
                  style={{
                    width: '100%',
                    color: record.highlightField !== 'currentQuotationPrice' ? '' : colorRemote,
                  }}
                  min="0"
                  disabled={
                    doubleUnitFlag ||
                    isUnTaxPriceFlag ||
                    record.quotationLineStatus === 'ABANDONED' ||
                    !!record.eliminateFlag ||
                    record.supplierStatus === 'QUOTATION_INVALID' ||
                    record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED'
                  }
                  omitZeroFlag
                  onChange={(priceValue) => this.handleChangeUnitPrice(priceValue, record)}
                />
              )}
            </Form.Item>
          ) : val ? (
            <Popover placement="topLeft" content={val}>
              {val}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'netPrice',
        align: 'right',
        width: 150,
        render: (value, record) => {
          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('netPrice', {
                initialValue: value,
                rules: [
                  {
                    required:
                      isUnTaxPriceFlag &&
                      record.quotationLineStatus !== 'ABANDONED' &&
                      !record.eliminateFlag &&
                      record.supplierStatus !== 'QUOTATION_INVALID' &&
                      record.supplierStatus !== 'REVIEW_SCORE_NO_APPROVED',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.netPrice`)
                        .d('单价(不含税)'),
                    }),
                  },
                  {
                    validator: this.priceValidator,
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  currency={record.quotationCurrencyCode}
                  max="99999999999999999999"
                  min="0"
                  style={{
                    width: '100%',
                    color: record.highlightField !== 'netPrice' ? '' : colorRemote,
                  }}
                  disabled={
                    doubleUnitFlag ||
                    !isUnTaxPriceFlag ||
                    record.quotationLineStatus === 'ABANDONED' ||
                    !!record.eliminateFlag ||
                    record.supplierStatus === 'QUOTATION_INVALID' ||
                    record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED'
                  }
                  omitZeroFlag
                  onChange={(priceValue) => this.handleChangeNetPrice(priceValue, record)}
                />
              )}
            </Form.Item>
          ) : (
            value
          );
        },
      },
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价')}
            tipValue={intl
              .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
              .d('辅助单位对应的上次报价')}
          />
        ),
        dataIndex: 'preQuotationPrice',
        width: 100,
        align: 'right',
        render: (val, record) => numberSeparatorRender(val, record.quotationCurrencyCode),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={record.quotationLineStatus === 'ABANDONED'}
                  onChange={(e) => this.changeTaxIncludedFlag(e, record)}
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        dataIndex: 'taxId',
        width: 100,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`taxId`, {
                  initialValue: record.taxId || null,
                  rules: [
                    {
                      required:
                        Number(systemVersion) === 2 &&
                        getFieldValue('taxIncludedFlag') &&
                        record.quotationLineStatus !== 'ABANDONED',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    disabled={
                      record.quotationLineStatus === 'ABANDONED' ||
                      !getFieldValue('taxIncludedFlag')
                    }
                    code="SMDM.TAX"
                    style={{ width: '98%' }}
                    textValue={record.taxRate}
                    onChange={(value, lovRecord) =>
                      this.handleChangeTaxId(value, lovRecord, record)
                    }
                  />
                )}
                {getFieldDecorator('taxRate', { initialValue: record.taxRate })}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 ? (
            <>
              <a onClick={() => viewLadderLevel(record)}>
                {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
              {record.ladderInquiryRequire === 1 && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )}
            </>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (_, record) => (
          <>
            <QuotationDetail
              rowData={record}
              sourceFrom="RFX"
              allowBuyerViewFlag
              bidFlag={sourceKey === BID}
            />
            {/* {record.quotationDetailRequire === 1 && (
              <Badge style={{ marginLeft: '2px' }} status="error" />
            )} */}
          </>
        ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonCurrentQuotationDescription`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('当前{quotationName}说明'),
        dataIndex: 'currentQuotationRemark',
        width: 120,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }
          if (['update', 'create'].includes(record._status)) {
            return (
              <Form.Item>
                {$form.getFieldDecorator('currentQuotationRemark', {
                  initialValue: value,
                })(<Input disabled={record.quotationLineStatus === 'ABANDONED'} />)}
              </Form.Item>
            );
          } else if (value) {
            return (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            );
          }
          return '';
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationReason`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('{quotationName}理由'),
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
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: (value) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
            dataIndex: 'currentQuotationSecQuantity',
            width: 100,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator('currentQuotationSecQuantity', {
                    initialValue: val,
                    rules: [
                      {
                        required:
                          (Number(systemVersion) === 2 && !doubleUnitFlag) ||
                          record.quotationLineStatus !== 'ABANDONED',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity')
                            .d('可供数量'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      uom={record.secondaryUomId}
                      type="hzero"
                      max="99999999999999999999"
                      style={{ width: '100%' }}
                      disabled={doubleUnitFlag && record.quotationLineStatus === 'ABANDONED'}
                      onBlur={(value) =>
                        this.changeCurrentQuotationSecondaryQuantity(value, record)
                      }
                    />
                  )}
                </FormItem>
              ) : val !== null ? (
                val
              ) : (
                '-'
              ),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: (value) => numberSeparatorRender(value),
      },
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'currentQuotationQuantity',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('currentQuotationQuantity', {
                initialValue: val,
                rules: [
                  {
                    required:
                      Number(systemVersion) === 2 &&
                      !doubleUnitFlag &&
                      record.quotationLineStatus !== 'ABANDONED',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getAvailableQtyName(doubleUnitFlag),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  uom={record.uomId}
                  type="hzero"
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={doubleUnitFlag || record.quotationLineStatus === 'ABANDONED'}
                  onChange={(quantity) => this.handleChangeQuantity(quantity, record)}
                />
              )}
            </FormItem>
          ) : val !== null ? (
            val
          ) : (
            '-'
          ),
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'currentExpiryDateFrom',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const form = record.$form;
            const { getFieldValue } = form;
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('currentExpiryDateFrom', {
                  initialValue:
                    (val && moment(val)) ||
                    (record.currentExpiryDateFrom && moment(record.currentExpiryDateFrom)),
                })(
                  <DatePicker
                    disabled={record.quotationLineStatus === 'ABANDONED'}
                    style={{ width: '100%' }}
                    placeholder=""
                    format={getDateFormat()}
                    disabledDate={(currentDate) =>
                      getFieldValue('currentExpiryDateTo') &&
                      moment(getFieldValue('currentExpiryDateTo')).isBefore(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return val && moment(val).format(DEFAULT_DATE_FORMAT);
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'currentExpiryDateTo',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const form = record.$form;
            const { getFieldValue } = form;
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('currentExpiryDateTo', {
                  initialValue:
                    (val && moment(val)) ||
                    (record.currentExpiryDateTo && moment(record.currentExpiryDateTo)),
                })(
                  <DatePicker
                    disabled={record.quotationLineStatus === 'ABANDONED'}
                    style={{ width: '100%' }}
                    placeholder=""
                    format={getDateFormat()}
                    disabledDate={(currentDate) =>
                      getFieldValue('currentExpiryDateFrom') &&
                      moment(getFieldValue('currentExpiryDateFrom')).isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return val && moment(val).format(DEFAULT_DATE_FORMAT);
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'currentPromisedDate',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentPromisedDate', {
                initialValue: val && moment(val, getDateFormat()),
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder={null}
                  disabled={record.quotationLineStatus === 'ABANDONED'}
                />
              )}
            </Form.Item>
          ) : (
            dateRender
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.deliveryPeriod`).d('供货周期'),
        dataIndex: 'currentDeliveryCycle',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentDeliveryCycle', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={record.quotationLineStatus === 'ABANDONED'}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minPurchaseQuantity', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  uom={record.uomId}
                  type="hzero"
                  style={{ width: '100%' }}
                  min="0"
                  max="99999999999999999999"
                  disabled={record.quotationLineStatus === 'ABANDONED'}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('minPackageQuantity', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  uom={record.uomId}
                  type="hzero"
                  style={{ width: '100%' }}
                  min="0"
                  max="99999999999999999999"
                  disabled={record.quotationLineStatus === 'ABANDONED'}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('freightIncludedFlag', {
                initialValue: val || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={record.quotationLineStatus === 'ABANDONED'}
                  onChange={(e) => this.onChangeFreightIncludedFlag(e, record)}
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender
          ),
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.freightAmount').d('运费'),
        dataIndex: 'freightAmount',
        width: '',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('freightAmount', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={record.quotationCurrencyCode}
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={
                    record.quotationLineStatus === 'ABANDONED' ||
                    record.$form.getFieldValue('freightIncludedFlag')
                  }
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        width: 120,
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
        dataIndex: 'minPrice',
      },
      {
        width: 120,
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationTime`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('{quotationName}时间'),
        dataIndex: 'quotedDate',
        width: 150,
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 180,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Upload
              filePreview
              viewOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
              icon="download"
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },
    ].filter(Boolean);

    const columns = remote
      ? remote?.process('SSRC_BARGAIN_PROCESS_BARGAIN_SUPPLIER_OFFLINE_TABLE_COLUMNS', _columns, {})
      : _columns;

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 510; // 固定10行
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`, // 单元编码，必传
        namespace: supplierId,
      },
      <EditTable
        bordered
        columns={columns}
        scroll={{ x: scrollX, y: scrollY }}
        dataSource={proSupplierData}
        rowKey="quotationLineId"
        loading={loadingFlag[supplierId] && loadingFlag[supplierId].supplierLineBargainLoading}
        pagination={
          (pageSize && pageSize[supplierId] && pageSize[supplierId]) > 10
            ? proSupplierPagination
            : false
        }
        onChange={(page) => this.changePage(page, supplierId, otherPayload)}
      />
    );
  }

  render() {
    const {
      headerInfo,
      headerPagination,
      handleCollBack,
      dataSource,
      pagination,
      onChangePagination,
      collapseSupplierActiveKeys,
      fetchSupplierLineBargainLoading,
      viewLadderLevelVisible,
      hideModal,
      barginLadderLevelData,
      onSaveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading,
      fetchLoading,
      doubleUnitFlag,
      bargainHeader,
    } = this.props;
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      barginLadderLevelData,
      onSaveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading,
      fetchLoading,
      sourcePage: 'bargainOffline',
      backPath: 'bargain',
      doubleUnitFlag,
      header: bargainHeader,
    };
    return (
      <div className="ssrc-customer-component">
        {headerInfo &&
          headerInfo.map((data) => (
            <Spin spinning={fetchSupplierLineBargainLoading}>
              <Collapse
                className={styles.collapseAll}
                activeKey={collapseSupplierActiveKeys}
                onChange={(key) =>
                  handleCollBack(data.supplierCompanyId, key, {
                    rfxLineSupplierId: data.rfxLineSupplierId,
                  })
                }
              >
                <Panel
                  header={this.renderCollapseHeader(data)}
                  showArrow={false}
                  key={String(data.rfxLineSupplierId)}
                >
                  {this.renderSupplierTable(data.supplierCompanyId, dataSource, pagination, {
                    rfxLineSupplierId: data.rfxLineSupplierId,
                  })}
                </Panel>
              </Collapse>
            </Spin>
          ))}
        {headerPagination && headerPagination.total > 10 ? (
          <Pagination
            className={styles.pagination}
            {...headerPagination}
            onChange={(page, pageSize) => onChangePagination(page, pageSize)}
            onShowSizeChange={(current, size) => onChangePagination(current, size)}
          />
        ) : (
          ''
        )}
        {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />}
      </div>
    );
  }
}
