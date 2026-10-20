/**
 * LadderLevelModal - 供应商报价-阶梯报价
 * @date: 2019-3-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Button, Popover } from 'hzero-ui';
import { observer } from 'mobx-react';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import Checkbox from 'components/Checkbox';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import common from '@/routes/ssrc/common.less';
import { showPrecisionValue } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import styles from '../InquiryPrice/LadderLevelModal.less';

@Form.create({ fieldNameProp: null })
@observer
export default class LadderLevelModal extends React.Component {
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
    // const { form } = this.props;
    const { taxRate } = this.getQuotationLineData() || {};

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
    // const { form } = this.props;
    // const { taxRate } =
    //   (this.props.ladderListHeaderInfo &&
    //     this.props.ladderListHeaderInfo.$form &&
    //     this.props.ladderListHeaderInfo.$form.getFieldsValue()) ||
    //   form.getFieldsValue();
    const { taxRate } = this.getQuotationLineData() || {};
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
   * 行字段禁用
   */
  disabledLadderLevel() {
    const { form, ladderListHeaderInfo } = this.props;
    const { $form, lineStatus = null } = ladderListHeaderInfo || {};
    const { abandonedFlag = 0 } =
      (ladderListHeaderInfo && $form && $form.getFieldsValue()) || form.getFieldsValue();
    const TableFieldDisabledCommonFlag = abandonedFlag || lineStatus !== 'IN_QUOTATION';

    return TableFieldDisabledCommonFlag;
  }

  getQuotationLineData = () => {
    const { ladderListHeaderInfo } = this.props;
    const { $form } = ladderListHeaderInfo || {};

    const currentQuotationLineData = $form ? $form.getFieldsValue() : ladderListHeaderInfo;

    return {
      ...(ladderListHeaderInfo || {}),
      ...(currentQuotationLineData || {}),
    };
  };

  /**
   * 阶梯报价头信息查询
   */
  @Bind()
  fetchLadderLevelyHeader() {
    const {
      form,
      // ladderListHeaderInfo: { itemCode, itemName },
      // ladderListHeaderInfo,
    } = this.props;
    // const quotationLineData = ladderListHeaderInfo.$form ? ladderListHeaderInfo.$form.getFieldsValue() : ladderListHeaderInfo;
    // const { taxRate } = quotationLineData || {};
    const { itemCode, itemName, taxRate } = this.getQuotationLineData() || {};
    const { currencyCode } = form.getFieldsValue();

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
      ladderListHeaderInfo: { diyLadderQuotationFlag },
    } = this.props;
    // const { taxRate } =
    //   (this.props.ladderListHeaderInfo &&
    //     this.props.ladderListHeaderInfo.$form &&
    //     this.props.ladderListHeaderInfo.$form.getFieldsValue()) ||
    //   form.getFieldsValue();
    const { existBargainedFlag = null, tenantId } = quotationHeader;
    const TableFieldDisabledCommonFlag = this.disabledLadderLevel();

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
        width: 80,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && diyLadderQuotationFlag === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderFrom', {
                initialValue: val,
                rules: [
                  {
                    required: !TableFieldDisabledCommonFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderFrom`).d('数量从'),
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
            {intl.get(`ssrc.supplierQuotation.model.supQuo.ladderTo`).d('数量至')}
            {`(<)`}
          </span>
        ),
        dataIndex: 'ladderTo',
        width: 80,
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
                      name: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderTo`).d('数量至'),
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
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentLadderPrice', {
                initialValue: val,
                // !isUnTaxPriceFlag
                //   ? val
                //   : taxRate
                //   ? showPrecisionValue(
                //       Number(record.$form.getFieldValue('currentNetLadderPrice')) *
                //         (taxRate / 100 + 1),
                //       10
                //     )
                //   : record.$form.getFieldValue('currentNetLadderPrice'),
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
                  max="99999999999999999999"
                  type="hzero"
                  currency={record.currencyCode}
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
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        dataIndex: 'currentNetLadderPrice',
        align: 'right',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentNetLadderPrice', {
                initialValue: val,
                // !isUnTaxPriceFlag
                //   ? taxRate
                //     ? showPrecisionValue(
                //         Number(record.$form.getFieldValue('currentLadderPrice')) /
                //           (taxRate / 100 + 1),
                //         10
                //       )
                //     : record.$form.getFieldValue('currentLadderPrice')
                //   : val,
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
            record.netPrice
          ),
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
            render: numberSeparatorRender,
          }
        : {
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validLadderNetPrice`)
              .d('有效阶梯报价(不含税)'),
            dataIndex: 'validNetLadderPrice',
            width: 120,
            render: numberSeparatorRender,
          },
      existBargainedFlag
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.validBargainPrice`).d('还价-单价'),
            dataIndex: 'validBargainPrice',
            width: 100,
            render: numberSeparatorRender,
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
    ].filter(Boolean);
    const scrollWidth = this.scrollWidth(columns, 0);

    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }

  render() {
    const {
      hideModal,
      visible,
      onCreateLadder,
      onDeleteLadder,
      onSaveLadder,
      saveLadderListLoading,
      deleteLadderQuotLoading,
      ladderLevelSelectedRowKeys,
      validateLadderLoading, // 校验loading
      ladderListHeaderInfo: { diyLadderQuotationFlag, quotationLineId, lineStatus },
    } = this.props;
    return (
      <Modal
        visible={visible}
        width={700}
        className={styles['ladder-footer']}
        zIndex={100}
        footer={
          <div>
            {intl
              .get(`ssrc.priceLibrary.view.message.warning.noticePriceInterval`)
              .d('注意：阶梯价格区间包含最小采购量和需求数量！')}
          </div>
        }
        onCancel={hideModal}
        title={intl.get(`ssrc.supplierQuotation.view.message.title.ladderQuo`).d('阶梯报价')}
      >
        {this.fetchLadderLevelyHeader()}
        <div className={styles['ladder-lever']}>
          <Form layout="inline">
            {diyLadderQuotationFlag === 1 && (
              <Button
                type="primary"
                style={{ marginRight: '24px' }}
                onClick={() => onCreateLadder(quotationLineId)}
                disabled={lineStatus !== 'IN_QUOTATION'}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
            )}
            <Button
              icon="save"
              style={{ margin: diyLadderQuotationFlag === 1 ? '' : '0px 24px 0px 8px' }}
              onClick={() => onSaveLadder(quotationLineId)}
              loading={
                saveLadderListLoading || deleteLadderQuotLoading || validateLadderLoading
                // (diyLadderQuotationFlag === 1 ? deleteLadderQuotLoading : validateLadderLoading)
              }
              disabled={lineStatus !== 'IN_QUOTATION'}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            {diyLadderQuotationFlag === 1 && (
              <Button
                loading={saveLadderListLoading || deleteLadderQuotLoading}
                onClick={() => onDeleteLadder(quotationLineId)}
                disabled={lineStatus !== 'IN_QUOTATION' || ladderLevelSelectedRowKeys.length === 0}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            )}
          </Form>
        </div>
        {this.feedLadderLevelyTable()}
      </Modal>
    );
  }
}
