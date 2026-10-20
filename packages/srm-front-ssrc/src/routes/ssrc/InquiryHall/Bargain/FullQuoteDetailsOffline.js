import React, { Component, Fragment } from 'react';
import { Popover, Form, Input, Checkbox, DatePicker, Badge } from 'hzero-ui';
import moment from 'moment';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import { getDateFormat } from 'utils/utils';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { PRIVATE_BUCKET } from '_utils/config';
import { roundEliminate } from '@/utils/renderer';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import LadderLevelModal from '../FeedbackBargain/LadderLevelModal';

const FormItem = Form.Item;

export default class FullQuoteDetailsOffline extends Component {
  /**
   * 改变税率-获取税率显示值
   */
  @Bind()
  handleChangeTaxId(_, dataList, record = {}) {
    const { bargainHeader } = this.props;
    const form = record.$form;
    const taxRate = dataList.taxRate || 0;
    const isUnTaxPriceFlag = bargainHeader && bargainHeader.priceTypeCode === 'NET_PRICE';

    if (isUnTaxPriceFlag) {
      const netPrice = form.getFieldValue('netPrice');
      const isExit = netPrice !== '' && netPrice !== undefined && netPrice !== null;
      const currentQuotationPrice = form.getFieldValue('taxIncludedFlag')
        ? math.toFixed(
            math.multipliedBy(form.getFieldValue('netPrice'), math.plus(1, math.div(taxRate, 100))),
            10
          )
        : form.getFieldValue('netPrice');
      form.setFieldsValue({
        taxRate: dataList.taxRate,
        taxId: dataList.taxId,
        currentQuotationPrice: isExit ? currentQuotationPrice : null,
      });
    } else {
      const currentQuotationPrice = form.getFieldValue('currentQuotationPrice');
      const isExit =
        currentQuotationPrice !== '' &&
        currentQuotationPrice !== undefined &&
        currentQuotationPrice !== null;
      const netPrice = form.getFieldValue('taxIncludedFlag')
        ? math.toFixed(
            math.div(
              form.getFieldValue('currentQuotationPrice'),
              math.plus(1, math.div(taxRate, 100))
            ),
            10
          )
        : form.getFieldValue('currentQuotationPrice');
      form.setFieldsValue({
        taxRate: dataList.taxRate,
        taxId: dataList.taxId,
        netPrice: isExit ? netPrice : null,
      });
    }
  }

  /**
   * 监听单价改变 - 增加防抖
   * @param: {number} value - 输入框输入值
   * @param: {Object} record - 行记录
   */
  @Bind()
  handleChangeUnitPrice(value, record) {
    const form = record.$form;
    const isExit = value !== '' && value !== undefined && value !== null;
    if (form) {
      // table
      const taxRate =
        record.taxChangeFlag && form.getFieldValue('taxIncludedFlag')
          ? form.getFieldValue('taxRate') || 0
          : record.taxRate || 0;
      const netPrice = form.getFieldValue('taxIncludedFlag')
        ? math.toFixed(math.div(value, math.plus(1, math.div(taxRate, 100))), 10)
        : value; // 优先根据是否含税, 否: =》单价; 是: =》公式
      form.setFieldsValue({
        netPrice: isExit ? netPrice : null,
      });
    } else {
      // form
      const taxRate = this.props.form.getFieldValue('taxRate') || 0;
      const netPrice = this.props.form.getFieldValue('taxIncludedFlag')
        ? math.toFixed(math.div(value, math.plus(1, math.div(taxRate, 100))), 10)
        : value; // 优先根据是否含税, 否: =》单价; 是: =》公式
      this.props.form.setFieldsValue({
        netPrice: isExit ? netPrice : null,
      });
    }
  }

  /**
   * 监听未税单价改变 - 增加防抖
   * @param: {number} value - 输入框输入值
   * @param: {Object} record - 行记录
   */
  @Bind()
  handleChangeNetPrice(value, record) {
    const form = record.$form;
    const isExit = value !== '' && value !== undefined && value !== null;
    if (form) {
      // table
      const taxRate =
        record.taxChangeFlag && form.getFieldValue('taxIncludedFlag')
          ? form.getFieldValue('taxRate') || 0
          : record.taxRate || 0;
      const currentQuotationPrice = form.getFieldValue('taxIncludedFlag')
        ? math.toFixed(math.multipliedBy(value, math.plus(1, math.div(taxRate, 100))), 10)
        : value; // 优先根据是否含税, 否: =》单价; 是: =》公式
      form.setFieldsValue({
        currentQuotationPrice: isExit ? currentQuotationPrice : null,
      });
    } else {
      const taxRate = this.props.form.getFieldValue('taxRate') || 0;
      const currentQuotationPrice = this.props.form.getFieldValue('taxIncludedFlag')
        ? math.toFixed(math.multipliedBy(value, math.plus(1, math.div(taxRate, 100))), 10)
        : value; // 优先根据是否含税, 否: =》单价; 是: =》公式
      this.props.form.setFieldsValue({
        currentQuotationPrice: isExit ? currentQuotationPrice : null,
      });
    }
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

  render() {
    const {
      fullDetailsLoading,
      onSearch,
      dataSource,
      pagination,
      organizationId,
      viewLadderLevel,
      viewLadderLevelVisible,
      hideModal,
      barginLadderLevelData,
      onSaveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading,
      fetchLoading,
      bargainHeader = {},
      sourceKey = INQUIRY,
      customizeTable,
      newQuotationFlag = false,
    } = this.props;
    const { priceTypeCode = null } = bargainHeader || {};
    const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';

    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      header: bargainHeader,
      barginLadderLevelData,
      onSaveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading,
      fetchLoading,
      sourcePage: 'bargainOffline',
    };

    const columns = [
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemNum`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        sorter: true,
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.categoryName`).d('物料分类'),
        dataIndex: 'itemCategoryName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 100,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        sorter: true,
        width: 250,
        render: (val, record) => roundEliminate(val, record),
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
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
                      record.quotationLineStatus !== 'ABANDONED',
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
                  currency={record.currencyCode}
                  onChange={(value) => this.handleChangeUnitPrice(value, record)}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={isUnTaxPriceFlag || record.quotationLineStatus === 'ABANDONED'}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
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
                    required: isUnTaxPriceFlag && record.quotationLineStatus !== 'ABANDONED',
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
                  currency={record.currencyCode}
                  onChange={(val) => this.handleChangeNetPrice(val, record)}
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={!isUnTaxPriceFlag || record.quotationLineStatus === 'ABANDONED'}
                />
              )}
            </Form.Item>
          ) : (
            value
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        dataIndex: 'preQuotationPrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
        align: 'right',
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
        width: 120,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`taxId`, {
                  initialValue: record.taxId || null,
                })(
                  <Lov
                    disabled={
                      record.quotationLineStatus === 'ABANDONED' ||
                      !getFieldValue('taxIncludedFlag')
                    }
                    code="SMDM.TAX"
                    textField="taxRate"
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
            return record.taxRate;
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
            <QuotationDetail rowData={record} sourceFrom="RFX" allowBuyerViewFlag />
            {/* {record.quotationDetailRequire === 1 && (
              <Badge style={{ marginLeft: '2px' }} status="error" />
            )} */}
          </>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('currentQuotationQuantity', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={record.quotationLineStatus === 'ABANDONED'}
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.companyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
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
          ['update', 'create'].includes(record._status)
            ? record.$form.getFieldDecorator('currentDeliveryCycle', {
                initialValue: val,
              })(<Input trim disabled={record.quotationLineStatus === 'ABANDONED'} />)
            : val,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('minPurchaseQuantity', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
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
                  type="hzero"
                  uom={record.uomId}
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
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        dataIndex: 'freightAmount',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('freightAmount', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={record.currencyCode}
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationTime`, { quotationName: getQuotationName(sourceKey === BID), }).d('{quotationName}时间'),
        dataIndex: 'quotedDate',
        width: 150,
      },
      {
        width: 120,
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
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
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 510; // 固定10行
    return (
      <Fragment>
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL_BARGAIN.ALLQUOTATION_OFFLINE`, // 单元编码，必传
          },
          <EditTable
            bordered
            loading={fullDetailsLoading}
            columns={columns}
            rowKey="quotationLineId"
            dataSource={dataSource}
            scroll={{ x: scrollX, y: scrollY }}
            pagination={pagination}
            onChange={(page, _, sorter) => onSearch(page, _, sorter)}
          />
        )}
        {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />}
      </Fragment>
    );
  }
}
