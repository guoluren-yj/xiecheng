/**
 * LadderLevelModal - 供应商报价-阶梯报价
 * @date: 2019-3-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Button, Popover } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import Checkbox from 'components/Checkbox';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { showPrecisionValue } from '@/utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { noop } from 'lodash';

import common from '@/routes/ssrc/common.less';
import styles from './LadderLevelModal.less';

class LadderLevelModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 行字段禁用
   */
  disabledLadderLevel() {
    const { form, ladderListHeaderInfo } = this.props;
    const {
      $form,
      continuousQuotationFlag,
      quotationLineStatus,
      eliminateRoundNumber = null,
      bargainFlag = 0,
      bargainStatus = null,
    } = ladderListHeaderInfo || {};
    const { abandonedFlag = 0 } =
      (ladderListHeaderInfo && $form && $form.getFieldsValue()) || form.getFieldsValue();
    const TableFieldDisabledCommonFlag =
      abandonedFlag ||
      (continuousQuotationFlag === 0 && quotationLineStatus === 'SUBMITTED') ||
      (bargainFlag === 0 && bargainStatus === 'BARGAINING_ONLINE') ||
      !!eliminateRoundNumber;

    return TableFieldDisabledCommonFlag;
  }

  /**
   * 数值校验
   * @param {*} _
   * @param {*} value 值
   * @param {*} callback 回调
   */
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

  @Bind()
  onChangeUnitPrice(val = null, record = {}) {
    const {
      $form: { setFieldsValue },
    } = record;
    const { form, ladderForm, ladderListHeaderInfo } = this.props;
    // const { taxRate } =
    //   (this.props.ladderListHeaderInfo.$form &&
    //     this.props.ladderListHeaderInfo.$form.getFieldsValue()) ||
    //   ladderForm
    //     ? ladderForm.getFieldsValue()
    //     : form.getFieldsValue();
    const { taxRate } = ladderListHeaderInfo?.$form
      ? ladderListHeaderInfo.$form.getFieldsValue()
      : (ladderForm ? ladderForm?.getFieldsValue() : form?.getFieldsValue()) || {};

    if (!val && val !== 0) {
      setFieldsValue({
        currentNetLadderPrice: null,
      });
      return;
    }
    let currentNetLadderPrice = null;

    if (taxRate && taxRate !== 0) {
      currentNetLadderPrice = showPrecisionValue(
        math.div(val, math.plus(math.div(taxRate, 100), 1)),
        10
      );
    } else {
      currentNetLadderPrice = val;
    }

    setFieldsValue({
      currentNetLadderPrice,
    });
  }

  @Bind()
  onChangeNetPrice(val = null, record = {}) {
    const {
      $form: { setFieldsValue },
    } = record;
    const { form, ladderForm, ladderListHeaderInfo } = this.props;
    // const { taxRate } =
    //   (this.props.ladderListHeaderInfo.$form &&
    //     this.props.ladderListHeaderInfo.$form.getFieldsValue()) ||
    //   ladderForm
    //     ? ladderForm.getFieldsValue()
    //     : form.getFieldsValue();

    const { taxRate } = ladderListHeaderInfo?.$form
      ? ladderListHeaderInfo.$form.getFieldsValue()
      : (ladderForm ? ladderForm?.getFieldsValue() : form?.getFieldsValue()) || {};

    if (val === '' || (!val && val !== 0 && isNaN(val))) {
      setFieldsValue({
        netPrice: null,
      });
      return;
    }

    let currentLadderPrice = null;

    if (taxRate && taxRate !== 0) {
      currentLadderPrice = showPrecisionValue(
        math.multipliedBy(val, math.plus(math.div(taxRate, 100), 1)),
        10
      );
    } else {
      currentLadderPrice = val;
    }

    setFieldsValue({
      currentLadderPrice,
    });
  }

  /**
   * 阶梯报价头信息查询
   */
  @Bind()
  fetchLadderLevelyHeader() {
    const {
      form,
      ladderForm = null,
      ladderListHeaderInfo: { itemCode, itemName },
      ladderListHeaderInfo,
    } = this.props;
    // const { taxRate } =
    //   (ladderListHeaderInfo.$form && ladderListHeaderInfo.$form.getFieldsValue()) || ladderForm
    //     ? ladderForm.getFieldsValue()
    //     : form.getFieldsValue();
    const { taxRate } = ladderListHeaderInfo?.$form
      ? ladderListHeaderInfo.$form.getFieldsValue()
      : (ladderForm ? ladderForm?.getFieldsValue() : form?.getFieldsValue()) || {};
    const { currencyCode } = form.getFieldsValue() || {};

    return (
      <Form>
        <Row gutter={48} className={common['fixed-form-row']}>
          <Col span={12}>
            <Row className="read-row">
              <Col span={8} className="item-label">
                {intl.get(`ssrc.supplierQuotation.model.supQuo.itemCode`).d('物料编码')}
              </Col>
              <Col span={16}>{itemCode}</Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row className="read-row">
              <Col span={8}>
                {intl.get(`ssrc.supplierQuotation.model.supQuo.itemName`).d('物料名称')}
              </Col>
              <Col span={16}>{itemName}</Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={48} className={common['fixed-form-row']}>
          <Col span={12}>
            <Row className="read-row">
              <Col span={8} className="item-label">
                {intl.get(`ssrc.supplierQuotation.model.supQuo.curryCode`).d('币种')}
              </Col>
              <Col span={16}>{currencyCode}</Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row className="read-row">
              <Col span={8}>
                {intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率')}
              </Col>
              <Col span={16}>{taxRate ? `${taxRate}%` : taxRate}</Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }

  // 当前供应商分类表格
  feedLadderLevelyTable() {
    const {
      // form,
      isUnTaxPriceFlag,
      quotationHeader = {},
      ladderLevelData = [],
      fetchLadderListLoading,
      ladderLevelRowSelection,
      ladderListHeaderInfo,
      customizeTable = noop,
      sourceKey = '',
    } = this.props;
    const { existBargainedFlag = null, tenantId } = quotationHeader;
    const { diyLadderQuotationFlag } = ladderListHeaderInfo || {};
    // const { taxRate } =
    //   (ladderListHeaderInfo && $form && $form.getFieldsValue()) || form.getFieldsValue();
    const TableFieldDisabledCommonFlag = this.disabledLadderLevel(); // 表格字段禁用逻辑

    const columns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxLadderLineNum`).d('行号'),
        dataIndex: 'rfxLadderLineNum',
        width: 60,
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.supplierQuotation.model.supQuo.ladderFrom`).d('数量从')}
            {`(>=)`}
          </span>
        ),
        dataIndex: 'ladderFrom',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && diyLadderQuotationFlag === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderFrom', {
                initialValue: val,
                rules: [
                  {
                    required: !TableFieldDisabledCommonFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  min="0"
                  uom={record.uomId}
                  type="hzero"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={TableFieldDisabledCommonFlag}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.supplierQuotation.model.supQuo.ladderTo`).d('数量至')} {`(<)`}
          </span>
        ),
        dataIndex: 'ladderTo',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && diyLadderQuotationFlag === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderTo', {
                initialValue: val,
                rules: [
                  {
                    required:
                      record.ladderQuotationId !==
                        ladderLevelData[ladderLevelData.length - 1].ladderQuotationId &&
                      !TableFieldDisabledCommonFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  min="0"
                  uom={record.uomId}
                  type="hzero"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={TableFieldDisabledCommonFlag}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.taxPrice`).d('单价(含税)'),
        dataIndex: 'currentLadderPrice',
        width: 120,
        render: (val, record) => {
          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentLadderPrice', {
                // initialValue: !isUnTaxPriceFlag
                //   ? val
                //   : taxRate && record.$form.getFieldValue('currentNetLadderPrice') !== null
                //   ? showPrecisionValue(
                //       Number(record.$form.getFieldValue('currentNetLadderPrice')) *
                //         (taxRate / 100 + 1),
                //       10
                //     )
                //   : record.$form.getFieldValue('currentNetLadderPrice'),
                initialValue: val,
                rules: [
                  {
                    required: !isUnTaxPriceFlag && !TableFieldDisabledCommonFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.taxPrice`)
                        .d('单价(含税)'),
                    }),
                  },
                  { validator: this.priceValidator },
                ],
              })(
                <PrecisionInputNumber
                  min="0"
                  type="hzero"
                  currency={record.currencyCode}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={isUnTaxPriceFlag || TableFieldDisabledCommonFlag}
                  onChange={(value) => this.onChangeUnitPrice(value, record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        dataIndex: 'currentNetLadderPrice',
        align: 'right',
        width: 120,
        render: (val, record) => {
          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentNetLadderPrice', {
                // initialValue: !isUnTaxPriceFlag
                //   ? taxRate && record.$form.getFieldValue('currentLadderPrice') !== null
                //     ? showPrecisionValue(
                //         Number(record.$form.getFieldValue('currentLadderPrice')) /
                //           (taxRate / 100 + 1),
                //         10
                //       )
                //     : record.$form.getFieldValue('currentLadderPrice')
                //   : val,
                initialValue: val,
                rules: [
                  {
                    required: isUnTaxPriceFlag && !TableFieldDisabledCommonFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.netPrice`)
                        .d('单价(不含税)'),
                    }),
                  },
                  { validator: this.priceValidator },
                ],
              })(
                <PrecisionInputNumber
                  min="0"
                  max="99999999999999999999"
                  type="hzero"
                  currency={record.currencyCode}
                  style={{ width: '100%' }}
                  disabled={!isUnTaxPriceFlag || TableFieldDisabledCommonFlag}
                  onChange={(value) => this.onChangeNetPrice(value, record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            record.currentNetLadderPrice
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.isCumulativeFlag`).d('是否累计阶梯'),
        dataIndex: 'cumulativeFlag',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('cumulativeFlag', {
                initialValue: val || 0,
              })(<Checkbox disabled={TableFieldDisabledCommonFlag} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      !isUnTaxPriceFlag
        ? {
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validLadderTaxPrice`)
              .d('有效阶梯报价（含税）'),
            dataIndex: 'validLadderPrice',
            width: 120,
          }
        : {
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validLadderNetPrice`)
              .d('有效阶梯报价(不含税)'),
            dataIndex: 'validNetLadderPrice',
            width: 120,
          },
      existBargainedFlag
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.validBargainPrice`).d('还价-单价'),
            dataIndex: 'validBargainPrice',
            width: 100,
          }
        : null,
      existBargainedFlag
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.counterOfferReason`).d('还价理由'),
            dataIndex: 'validBargainRemark',
            width: 200,
            render: (value) => (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ),
          }
        : null,
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 80,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ].filter(Boolean);

    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: `SSRC.${
              sourceKey === '' ? '' : `${sourceKey}_`
            }SUPPLIER_QUOTATION.LADDER_INQUIRY_TABLE`,
          },
          <EditTable
            bordered
            scroll={{ x: scrollWidth }}
            rowKey="ladderQuotationId"
            loading={fetchLadderListLoading}
            rowSelection={!quotationHeader.diyLadderQuotationFlag ? null : ladderLevelRowSelection}
            columns={columns}
            pagination={false}
            dataSource={ladderLevelData}
          />
        )}
      </React.Fragment>
    );
  }

  render() {
    const {
      hideModal,
      visible,
      // saveData,
      onCreateLadder,
      onDeleteLadder,
      onSaveLadder,
      saveLadderListLoading,
      deleteLadderQuotLoading,
      validateLadderLoading,
      ladderLevelSelectedRowKeys,
      ladderListHeaderInfo: { diyLadderQuotationFlag, quotationLineId },
    } = this.props;
    const TableFieldDisabledCommonFlag = this.disabledLadderLevel();

    return (
      <Modal
        visible={visible}
        width="70%"
        className={styles['ladder-footer']}
        zIndex={100}
        footer={
          <div className={styles['ladder-lever']}>
            <div className="info">
              {intl
                .get(`ssrc.priceLibrary.view.message.warning.noticePriceInterval`)
                .d('注意：阶梯价格区间包含最小采购量和需求数量！')}
            </div>
            <Form layout="inline">
              {diyLadderQuotationFlag === 1 && (
                <Button
                  type="primary"
                  style={{ marginRight: '24px' }}
                  onClick={() => onCreateLadder(quotationLineId)}
                  disabled={TableFieldDisabledCommonFlag}
                >
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>
              )}
              <Button
                icon="save"
                style={{ margin: diyLadderQuotationFlag === 1 ? '' : '0px 24px 0px 8px' }}
                onClick={() => onSaveLadder(quotationLineId)}
                loading={
                  saveLadderListLoading || validateLadderLoading || deleteLadderQuotLoading
                  // (diyLadderQuotationFlag === 1 ? deleteLadderQuotLoading : validateLadderLoading)
                }
                disabled={TableFieldDisabledCommonFlag}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              {diyLadderQuotationFlag === 1 && (
                <Button
                  loading={saveLadderListLoading || deleteLadderQuotLoading}
                  onClick={() => onDeleteLadder(quotationLineId)}
                  disabled={TableFieldDisabledCommonFlag || ladderLevelSelectedRowKeys.length === 0}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              )}
            </Form>
          </div>
        }
        onCancel={hideModal}
        destroyOnClose
        title={intl.get(`ssrc.priceLibrary.view.message.title.ladQuotate`).d('阶梯报价')}
      >
        {this.fetchLadderLevelyHeader()}
        {this.feedLadderLevelyTable()}
      </Modal>
    );
  }
}

// 引用类型函数
const hocComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [`SSRC.SUPPLIER_QUOTATION.LADDER_INQUIRY_TABLE`],
    })(Com)
  );
};

export default hocComponent(LadderLevelModal);

export { LadderLevelModal, hocComponent };
