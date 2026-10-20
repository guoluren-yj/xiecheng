/**
 * LadderLevelModal - 线下询价结果-阶梯报价
 * @date: 2019-3-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Button, Popover } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import {
  showPrecisionValue,
  calculateBasicQty,
  getLadderFrom,
  getLadderTo,
  getPriceName,
  getNetPriceName,
  getValidPriceName,
  getValidNetPriceName,
} from '@/utils/utils';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
// import uuidv4 from 'uuid/v4';
import styles from './LadderLevelModal.less';

const promptCode = 'ssrc.offlineResultEntry';
@Form.create({ fieldNameProp: null })
export default class LadderLevelModal extends React.Component {
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
    const { doubleUnitFlag } = this.props;
    const {
      $form: { setFieldsValue },
    } = record;
    const { taxIncludedFlag, taxRate } = this.props.biddingQuotationLine;

    if (!val && val !== 0) {
      if (doubleUnitFlag) {
        setFieldsValue({
          currentNetLadderSecPrice: null,
        });
      } else {
        setFieldsValue({
          currentNetLadderPrice: null,
        });
      }
      return;
    }
    let currentNetLadderSecPrice = null;

    if (taxIncludedFlag && taxRate && taxRate !== 0) {
      currentNetLadderSecPrice = showPrecisionValue(
        math.div(val, math.plus(math.div(taxRate, 100), 1)),
        10
      );
    } else {
      currentNetLadderSecPrice = val;
    }
    if (doubleUnitFlag) {
      setFieldsValue({
        currentNetLadderSecPrice,
      });
    } else {
      setFieldsValue({
        currentNetLadderPrice: currentNetLadderSecPrice,
      });
    }
  }

  @Bind()
  onChangeNetPrice(val = null, record = {}) {
    const { doubleUnitFlag } = this.props;
    const {
      $form: { setFieldsValue },
    } = record;
    const { taxIncludedFlag, taxRate } = this.props.biddingQuotationLine;

    if (!val && val !== 0 && isNaN(val)) {
      setFieldsValue({
        netPrice: null,
      });
      return;
    }

    let currentLadderPrice = null;

    if (taxIncludedFlag && taxRate && taxRate !== 0) {
      currentLadderPrice = showPrecisionValue(
        math.multipliedBy(val, math.plus(math.div(taxRate, 100), 1)),
        10
      );
    } else {
      currentLadderPrice = val;
    }

    if (doubleUnitFlag) {
      setFieldsValue({
        currentLadderSecPrice: currentLadderPrice,
      });
    } else {
      setFieldsValue({
        currentLadderPrice,
      });
    }
  }

  /**
   * 阶梯报价头信息查询
   */
  @Bind()
  fetchLadderLevelyHeader() {
    const { itemCode, itemName } = this.props.biddingQuotationLine;
    return (
      <Form className={styles['ssrc-ladder-level-header']}>
        <Row className="items-row">
          <Col span={12}>
            <Row>
              <Col span={8} className="item-label">
                {intl.get(`${promptCode}.model.offlineEntry.itemsCode`).d('物料编码')}
              </Col>
              <Col span={16}>{itemCode}</Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row>
              <Col span={8} className="item-label">
                {intl.get(`${promptCode}.model.offlineEntry.itemsName`).d('物料名称')}
              </Col>
              <Col span={16}>{itemName}</Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 单价禁用-disabledLadderLevel
   */
  @Bind()
  disabledLadderLevel(continuousQuotationFlag, quotationLineStatus) {
    // 供应商非连续报价
    if (continuousQuotationFlag === 0 && quotationLineStatus === 'SUBMITTED') {
      return true;
    } else {
      return false;
    }
  }

  // 数量
  @Bind()
  changeSecondaryQuantity(e, record, type) {
    const { doubleUnitFlag, biddingQuotationLine = {} } = this.props;
    const { itemId = '', secondaryUomId = '', uomId = '' } = biddingQuotationLine;
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    if (e.target.value) {
      if (doubleUnitFlag && itemId) {
        if (getFieldValue(type) && secondaryUomId) {
          calculateBasicQty({
            secondaryQuantity: getFieldValue(type),
            itemId,
            businessKey: -1,
            doublePrimaryUomId: uomId,
            secondaryUomId,
          }).then((res) => {
            setFieldsValue({
              [type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo']: res ?? undefined,
            });
          });
        } else if (getFieldValue(type) === 0) {
          setFieldsValue({
            [type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo']: 0,
          });
        }
      } else {
        setFieldsValue({
          [type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo']: getFieldValue(type),
        });
      }
    } else if (e.target.value === 0) {
      setFieldsValue({
        [type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo']: 0,
      });
    }
  }

  // 当前供应商分类表格
  feedLadderLevelyTable() {
    const {
      ladderLevelData = [],
      configTaxIncludeFlag,
      selectRowKeys,
      selectRows,
      handleRowSelectChange,
      quotationHeader = {},
      doubleUnitFlag = false,
      header,
      header: { diyLadderQuotationFlag, continuousQuotationFlag, quotationLineStatus },
      remote,
      remoteCode,
      biddingQuotationLine,
    } = this.props;
    // const diyLadderQuotationFlag = 1;
    const { existBargainedFlag = null } = quotationHeader || {};

    const preColumns = [
      {
        title: intl.get(`${promptCode}.model.offlineEntry.lineNo.`).d('行号'),
        dataIndex: 'rfxLadderLineNum',
        width: 80,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.offlineEntry.ladderFrom`).d('数量从(>=)'),
            dataIndex: 'secondaryLadderFrom',
            width: 100,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && diyLadderQuotationFlag === 1 ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryLadderFrom', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`)
                            .d('数量从'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      min="0"
                      uom={record.secondaryUomId}
                      type="hzero"
                      max="99999999999999999999"
                      style={{ width: '100%' }}
                      disabled={this.disabledLadderLevel(
                        continuousQuotationFlag,
                        quotationLineStatus
                      )}
                      onBlur={(e) => this.changeSecondaryQuantity(e, record, 'secondaryLadderFrom')}
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
            title: intl.get(`${promptCode}.model.offlineEntry.ladderTo`).d('数量至(<)'),
            dataIndex: 'secondaryLadderTo',
            width: 100,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && diyLadderQuotationFlag === 1 ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryLadderTo', {
                    initialValue: val,
                    rules: [
                      {
                        required:
                          record.ladderQuotationId !==
                          ladderLevelData[ladderLevelData.length - 1].ladderQuotationId,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      min="0"
                      uom={record.secondaryUomId}
                      type="hzero"
                      max="99999999999999999999"
                      style={{ width: '100%' }}
                      disabled={this.disabledLadderLevel(
                        continuousQuotationFlag,
                        quotationLineStatus
                      )}
                      onBlur={(e) => this.changeSecondaryQuantity(e, record, 'secondaryLadderTo')}
                    />
                  )}
                  {!doubleUnitFlag
                    ? record.$form.getFieldDecorator('ladderTo', {
                        initialValue: record.ladderTo,
                      })
                    : null}
                </Form.Item>
              ) : (
                val
              ),
          }
        : null,
      {
        title: (
          <span>
            {getLadderFrom(doubleUnitFlag)} {`(>=)`}
          </span>
        ),
        dataIndex: 'ladderFrom',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && diyLadderQuotationFlag === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderFrom', {
                initialValue: val,
                rules: [
                  {
                    required: !doubleUnitFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getLadderFrom(doubleUnitFlag),
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
                  disabled={
                    doubleUnitFlag ||
                    this.disabledLadderLevel(continuousQuotationFlag, quotationLineStatus)
                  }
                />
              )}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryLadderFrom', {
                    initialValue: record.secondaryLadderFrom,
                  })
                : null}
            </Form.Item>
          ) : (
            val
          ),
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
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && diyLadderQuotationFlag === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderTo', {
                initialValue: val,
                rules: [
                  {
                    required:
                      !doubleUnitFlag &&
                      record.ladderQuotationId !==
                        ladderLevelData[ladderLevelData.length - 1]?.ladderQuotationId,
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
                  disabled={
                    doubleUnitFlag ||
                    this.disabledLadderLevel(continuousQuotationFlag, quotationLineStatus)
                  }
                />
              )}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryLadderTo', {
                    initialValue: record.secondaryLadderTo,
                  })
                : null}
            </Form.Item>
          ) : (
            val
          ),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.offlineEntry.taxPrice`).d('单价(含税)'),
            dataIndex: 'currentLadderSecPrice',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('currentLadderSecPrice', {
                    initialValue: val,
                    rules: [
                      {
                        required: configTaxIncludeFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.offlineEntry.taxPrice`)
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
                      disabled={!configTaxIncludeFlag}
                      onChange={(value) => this.onChangeUnitPrice(value, record)}
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
            title: intl.get(`${promptCode}.model.offlineEntry.netPrice`).d('单价(不含税)'),
            dataIndex: 'currentNetLadderSecPrice',
            align: 'right',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('currentNetLadderSecPrice', {
                    initialValue: val,
                    rules: [
                      {
                        required: !configTaxIncludeFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.offlineEntry.netPrice`)
                            .d('单价(不含税)'),
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
                      disabled={configTaxIncludeFlag}
                      onChange={(value) => this.onChangeNetPrice(value, record)}
                    />
                  )}
                </Form.Item>
              ) : (
                record.netPrice
              ),
          }
        : null,
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'currentLadderPrice',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentLadderPrice', {
                initialValue: val,
                rules: [
                  {
                    required: !doubleUnitFlag && configTaxIncludeFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.offlineEntry.taxPrice`).d('单价(含税)'),
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
                  disabled={doubleUnitFlag || !configTaxIncludeFlag}
                  onChange={(value) => this.onChangeUnitPrice(value, record)}
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
        align: 'right',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentNetLadderPrice', {
                initialValue: val,
                rules: [
                  {
                    required: !doubleUnitFlag && !configTaxIncludeFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.offlineEntry.netPrice`).d('单价(不含税)'),
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
                  disabled={doubleUnitFlag || configTaxIncludeFlag}
                  onChange={(value) => this.onChangeNetPrice(value, record)}
                />
              )}
            </Form.Item>
          ) : (
            record.netPrice
          ),
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.isCumulativeFlag`).d('是否累计阶梯'),
        dataIndex: 'cumulativeFlag',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('cumulativeFlag', {
                initialValue: val || 0,
              })(
                <Checkbox
                  disabled={this.disabledLadderLevel(continuousQuotationFlag, quotationLineStatus)}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      doubleUnitFlag
        ? configTaxIncludeFlag
          ? {
              title: intl
                .get(`${promptCode}.model.offlineEntry.valLadTaxPrice`)
                .d('有效报价(含税)'),
              dataIndex: 'validLadderSecPrice',
              width: 120,
            }
          : {
              title: intl
                .get(`${promptCode}.model.offlineEntry.validLadNetPrice`)
                .d('有效报价(不含税)'),
              dataIndex: 'validNetLadderSecPrice',
              width: 120,
            }
        : null,
      configTaxIncludeFlag
        ? {
            title: getValidPriceName(doubleUnitFlag),
            dataIndex: 'validLadderPrice',
            width: 140,
          }
        : {
            title: getValidNetPriceName(doubleUnitFlag),
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

    const columns = remote
      ? remote.process(`${remoteCode}_PROCESS_LADDER_COLUMNS`, preColumns, {
          header,
          doubleUnitFlag,
          configTaxIncludeFlag,
          biddingQuotationLine,
          priceValidator: this.priceValidator,
          onChangeNetPrice: this.onChangeNetPrice,
        })
      : preColumns;
    const scrollWidth = this.scrollWidth(columns, 0);
    const rowSelection = {
      selectRowKeys,
      selectRows,
      onChange: handleRowSelectChange,
    };
    return (
      <React.Fragment>
        <EditTable
          bordered
          pagination={false}
          scroll={{ x: scrollWidth }}
          rowKey="ladderQuotationId"
          columns={columns}
          dataSource={ladderLevelData}
          rowSelection={!diyLadderQuotationFlag ? null : rowSelection}
        />
      </React.Fragment>
    );
  }

  render() {
    const {
      hideModal,
      visible,
      saveData,
      onlySaveData,
      ladderLoading,
      deleteData,
      addData,
      header,
      selectRowKeys,
    } = this.props;
    const { diyLadderQuotationFlag, continuousQuotationFlag, quotationLineStatus } = header;

    return (
      <Modal
        visible={visible}
        width={800}
        footer={null}
        onCancel={hideModal}
        title={intl.get(`${promptCode}.view.message.title.ladderLevel`).d('阶梯报价')}
      >
        <div style={{ textAlign: 'right', marginBottom: '12px', marginTop: '4px' }}>
          {diyLadderQuotationFlag ? (
            <Button
              style={{ margin: '0 8px 0' }}
              loading={ladderLoading}
              onClick={deleteData}
              disabled={
                this.disabledLadderLevel(continuousQuotationFlag, quotationLineStatus) ||
                selectRowKeys.length === 0
              }
            >
              {intl.get('hzero.common.button.toDelete').d('删除')}
            </Button>
          ) : null}
          {diyLadderQuotationFlag ? (
            <Button
              icon="save"
              style={{ margin: '0 8px 0' }}
              onClick={saveData}
              loading={ladderLoading}
              disabled={this.disabledLadderLevel(continuousQuotationFlag, quotationLineStatus)}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ) : (
            <Button
              icon="save"
              type="primary"
              style={{ margin: '0px 24px 0px 8px' }}
              onClick={onlySaveData}
              loading={ladderLoading}
              disabled={this.disabledLadderLevel(continuousQuotationFlag, quotationLineStatus)}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
          {diyLadderQuotationFlag ? (
            <Button
              type="primary"
              style={{ margin: '0 8px 0' }}
              loading={ladderLoading}
              onClick={addData}
              disabled={this.disabledLadderLevel(continuousQuotationFlag, quotationLineStatus)}
            >
              {intl.get('hzero.common.button.creat').d('新建')}
            </Button>
          ) : null}
        </div>
        {this.fetchLadderLevelyHeader()}
        {this.feedLadderLevelyTable()}
      </Modal>
    );
  }
}
