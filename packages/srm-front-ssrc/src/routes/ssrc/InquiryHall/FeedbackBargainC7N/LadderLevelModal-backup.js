/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2024-04-22 14:13:46
 * @LastEditors: yiping.liu
 */
/**
 * LadderLevelModal - 寻源服务/询价大厅-还比价-阶梯还价
 * @date: 2019-3-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Col, Row, Input, Button, Tooltip, Popover } from 'hzero-ui';
import { Modal, ModalProvider } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';

import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import { numberSeparatorRender } from '@/utils/renderer';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { yesOrNoRender } from 'utils/renderer';
import {
  getLadderFrom,
  getLadderTo,
  getPriceName,
  getNetPriceName,
  TooltipTitle,
} from '@/utils/utils';

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};
@Form.create({ fieldNameProp: null })
export default class LadderLevelModal extends React.Component {
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 保存
   */
  @Debounce(800)
  @Bind()
  haeSaveData() {
    const { onSaveBarginLadderLine } = this.props;
    onSaveBarginLadderLine();
  }

  /**
   * 监听单价改变
   */
  @Bind()
  handleChangeUnitPrice(value, record, name) {
    const { LadderLevelHeaderData = {} } = this.props;
    const { taxIncludedFlag = null, taxRate = null } = LadderLevelHeaderData;

    const currentNetLadderPrice = this.calculatePirce({
      taxIncludedFlag,
      taxRate,
      value,
      priceType: 'price',
    });
    if (record.$form) {
      if (name === 'currentLadderSecPrice') {
        record.$form.setFieldsValue({
          currentNetLadderSecPrice: currentNetLadderPrice,
        });
      } else {
        record.$form.setFieldsValue({
          currentNetLadderPrice,
        });
      }
    }
  }

  /**
   * 监听未税单价改变
   */
  @Bind()
  handleChangeNetPrice(value = null, record = {}, name) {
    const { LadderLevelHeaderData = {} } = this.props;
    const { taxIncludedFlag = null, taxRate = null } = LadderLevelHeaderData;

    const currentLadderPrice = this.calculatePirce({
      taxIncludedFlag,
      taxRate,
      value,
    });

    if (record?.$form) {
      if (name === 'currentNetLadderSecPrice') {
        record.$form.setFieldsValue({
          currentLadderSecPrice: currentLadderPrice,
        });
      } else {
        record.$form.setFieldsValue({
          currentLadderPrice,
        });
      }
    }
  }

  // 计算单价
  calculatePirce = (data = {}) => {
    const { taxIncludedFlag = null, taxRate = null, value = null, priceType = 'netPrice' } = data;
    let currentValue = null;

    if (priceType === 'netPrice') {
      currentValue = taxIncludedFlag
        ? math.toFixed(math.multipliedBy(value, math.plus(1, math.div(taxRate, 100))), 10)
        : value;
    }

    if (priceType === 'price') {
      currentValue = taxIncludedFlag
        ? math.toFixed(math.div(value, math.plus(1, math.div(taxRate, 100))), 10)
        : value;
    }

    return currentValue;
  };

  /**
   * 阶梯报价头信息查询
   */
  @Debounce(800)
  @Bind()
  fetchLadderLevelyHeader() {
    const { supplierCompanyName, itemCode, itemName } = this.props.LadderLevelHeaderData;
    return (
      <Form>
        <Row gutter={48} className="read-row ssrc-ladder-level-header">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称')}
              value={
                <Tooltip placement="top" title={supplierCompanyName}>
                  {supplierCompanyName.length > 8
                    ? `${supplierCompanyName.substr(0, 8)}...`
                    : supplierCompanyName}
                </Tooltip>
              }
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
              value={itemCode}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
              value={itemName}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  getCurrentColumns = () => {
    const {
      sourcePage = null,
      header = {},
      LadderLevelHeaderData: { quotationLineStatus, quotationCurrencyCode = null },
      doubleUnitFlag,
    } = this.props;

    let columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLadderLineNum',
        width: 80,
      },
      doubleUnitFlag
        ? {
            title: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从')}(>=)`,
            dataIndex: 'secondaryLadderFrom',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            title: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}(<)`,
            dataIndex: 'secondaryLadderTo',
            width: 100,
          }
        : null,
      {
        title: (
          <span>
            {getLadderFrom(doubleUnitFlag)}
            {`(>=)`}
          </span>
        ),
        dataIndex: 'ladderFrom',
        width: 120,
      },
      {
        title: (
          <span>
            {getLadderTo(doubleUnitFlag)}
            {`(<)`}
          </span>
        ),
        dataIndex: 'ladderTo',
        width: 120,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxPrice`).d('单价(含税)'),
            dataIndex: 'validLadderSecPrice',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetLadderSecPrice',
            width: 100,
          }
        : null,
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validLadderPrice',
        width: 120,
      },
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetLadderPrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.isCumulativeFlag`).d('是否累计阶梯'),
        dataIndex: 'cumulativeFlag',
        width: 80,
        render: yesOrNoRender,
      },
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价')}
            tipValue={intl
              .get('ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary')
              .d('辅助单位对应的还价单价')}
          />
        ),
        textForTitle: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`)
          .d('还价单价'),
        dataIndex: 'currentBargainPrice',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentBargainPrice', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  currency={quotationCurrencyCode}
                  disabled={
                    quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED'
                  }
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
        dataIndex: 'currentBargainRemark',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentBargainRemark', {
                initialValue: val,
                rules: [
                  {
                    max: 500,
                    message: intl.get('hzero.common.validation.max', {
                      max: 500,
                    }),
                  },
                ],
              })(
                <Input
                  disabled={
                    quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED'
                  }
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价')}
            tipValue={intl
              .get('ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary')
              .d('辅助单位对应的有效还价单价')}
          />
        ),
        dataIndex: 'validBargainPrice',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={numberSeparatorRender(value)}>
              {numberSeparatorRender(value)}
            </Popover>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
        dataIndex: 'validBargainRemark',
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
    ].filter(Boolean);

    // 线下议价
    if (sourcePage === 'bargainOffline') {
      const isUnTaxPriceFlag = header?.priceTypeCode === 'NET_PRICE';

      columns = [
        {
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
          dataIndex: 'rfxLadderLineNum',
          width: 80,
        },
        doubleUnitFlag
          ? {
              title: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从')}`,
              dataIndex: 'secondaryLadderFrom',
              width: 100,
            }
          : null,
        doubleUnitFlag
          ? {
              title: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}(<)`,
              dataIndex: 'secondaryLadderTo',
              width: 100,
            }
          : null,
        {
          title: (
            <span>
              {getLadderFrom(doubleUnitFlag)}
              {`(>=)`}
            </span>
          ),
          dataIndex: 'ladderFrom',
          width: 100,
        },
        {
          title: (
            <span>
              {getLadderTo(doubleUnitFlag)}
              {`(<)`}
            </span>
          ),
          dataIndex: 'ladderTo',
          width: 100,
        },
        doubleUnitFlag
          ? {
              title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxPrice`).d('单价(含税)'),
              dataIndex: 'currentLadderSecPrice',
              width: 100,
              render: (val, record) =>
                ['update', 'create'].includes(record._status) ? (
                  <Form.Item>
                    {record.$form.getFieldDecorator('currentLadderSecPrice', {
                      initialValue: val,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        currency={quotationCurrencyCode}
                        disabled={isUnTaxPriceFlag || quotationLineStatus === 'ABANDONED'}
                        min="0"
                        max="99999999999999999999"
                        style={{ width: '100%' }}
                        onChange={(value) =>
                          this.handleChangeUnitPrice(value, record, 'currentLadderSecPrice')
                        }
                      />
                    )}
                  </Form.Item>
                ) : (
                  val
                ),
            }
          : null,
        doubleUnitFlag
          ? {
              title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
              dataIndex: 'currentNetLadderSecPrice',
              width: 100,
              render: (val, record) =>
                ['update', 'create'].includes(record._status) ? (
                  <Form.Item>
                    {record.$form.getFieldDecorator('currentNetLadderSecPrice', {
                      initialValue: val,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        currency={quotationCurrencyCode}
                        disabled={!isUnTaxPriceFlag || quotationLineStatus === 'ABANDONED'}
                        min="0"
                        max="99999999999999999999"
                        style={{ width: '100%' }}
                        onChange={(value) =>
                          this.handleChangeNetPrice(value, record, 'currentNetLadderSecPrice')
                        }
                      />
                    )}
                  </Form.Item>
                ) : (
                  val
                ),
            }
          : null,
        {
          title: getPriceName(doubleUnitFlag),
          dataIndex: 'currentLadderPrice',
          width: 100,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('currentLadderPrice', {
                  initialValue: val,
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    currency={quotationCurrencyCode}
                    disabled={
                      doubleUnitFlag || isUnTaxPriceFlag || quotationLineStatus === 'ABANDONED'
                    }
                    min="0"
                    max="99999999999999999999"
                    style={{ width: '100%' }}
                    onChange={(value) => this.handleChangeUnitPrice(value, record)}
                  />
                )}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: getNetPriceName(doubleUnitFlag),
          dataIndex: 'currentNetLadderPrice',
          width: 100,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('currentNetLadderPrice', {
                  initialValue: val,
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    currency={quotationCurrencyCode}
                    disabled={
                      doubleUnitFlag || !isUnTaxPriceFlag || quotationLineStatus === 'ABANDONED'
                    }
                    min="0"
                    max="99999999999999999999"
                    style={{ width: '100%' }}
                    onChange={(value) => this.handleChangeNetPrice(value, record)}
                  />
                )}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.isCumulativeFlag`).d('是否累计阶梯'),
          dataIndex: 'cumulativeFlag',
          width: 80,
          render: yesOrNoRender,
        },
      ].filter(Boolean);
    }

    return columns.filter(Boolean);
  };

  // 当前供应商分类表格
  feedLadderLevelyTable() {
    const { fetchLoading, barginLadderLevelData = [] } = this.props;
    const columns = this.getCurrentColumns();
    const scrollWidth = this.scrollWidth(columns, 0);

    return (
      <React.Fragment>
        <EditTable
          bordered
          scroll={{ x: scrollWidth }}
          rowKey="rfxLadderLineNum"
          columns={columns}
          pagination={false}
          loading={fetchLoading}
          dataSource={barginLadderLevelData}
        />
      </React.Fragment>
    );
  }

  render() {
    const { hideModal, visible, saveLoading } = this.props;
    return (
      <ModalProvider>
        <Modal
          visible={visible}
          style={{
            width: 900,
            zIndex: 200,
          }}
          closable
          title={intl
            .get(`ssrc.inquiryHall.view.message.title.ladderQuotationDetails`)
            .d('阶梯报价明细')}
          footer={
            <Button type="primary" loading={saveLoading} onClick={() => this.haeSaveData()}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          }
          drawer
          onCancel={hideModal}
        >
          {this.fetchLadderLevelyHeader()}
          {this.feedLadderLevelyTable()}
        </Modal>
      </ModalProvider>
    );
  }
}
