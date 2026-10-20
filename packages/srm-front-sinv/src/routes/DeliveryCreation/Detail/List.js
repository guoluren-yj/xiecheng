/**
 * List - 送货单创建 - 明细页面表格
 * @date: 2018-10-24
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { sum, isNumber, isEmpty, isFunction, cloneDeep, isNil } from 'lodash';
import { Button, Tabs, Modal, Input, Form, InputNumber, DatePicker, Tag } from 'hzero-ui';
import { math } from 'choerodon-ui/dataset';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { PRIVATE_BUCKET } from '_utils/config';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import UploadModal from '_components/Upload';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { dateRender } from 'hzero-front/lib/utils/renderer';
import LogisticsForm from './LogisticsForm';
import ItemInfo from './ItemInfo';
import { showRecordModal } from '@/routes/components/CustomSpecsModal';
import ImageList from '@/routes/components/ImageList';

import styles from './list.less';
import { showBigNumber } from '@/routes/components/utils';

// TabPane组件初始化
const { TabPane } = Tabs;

// Form.Item 组件
const FormItem = Form.Item;

// 文本域
const { TextArea } = Input;

/**
 * List - 业务组件 - 送货单创建
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
  logisticsForm;

  constructor(props) {
    super(props);
    this.state = {
      tabsActiveKey: 'itemInfo',
      visible: false,
    };
    const { onRef = (e) => e } = props;
    // this指向List
    onRef(this);
  }

  /**
   * componentWillUnmount 生命周期函数
   * 组件卸载时销毁物料信息弹窗
   */
  componentWillUnmount() {
    if (this.itemInfoModal && isFunction(this.itemInfoModal.destroy)) {
      this.itemInfoModal.destroy();
    }
  }

  // /**
  //  * saveRowData - 合并行数据
  //  * @param {object} rowData - 行数据
  //  */
  // @Bind()
  // saveRowData(rowData) {
  //   const { dataSource = {}, assignDataSource = e => e } = this.props;
  //   assignDataSource(dataSource.common.map(n => (n.asnLineId === rowData.asnLineId ? rowData : n)));
  // }

  @Bind()
  attachmentUuidList(val, record) {
    const { attachmentUuidList } = this.props;
    attachmentUuidList(val, record);
  }

  // 处理浮点数乘法
  // @Bind()
  // floatMultiply(arg1, arg2) {
  //   if (arg1 == null || arg2 == null) {
  //     return null;
  //   }
  //   let r1;
  //   let r2; // 小数位数
  //   try {
  //     r1 = arg1.toString().split('.')[1].length;
  //   } catch (e) {
  //     r1 = 0;
  //   }
  //   try {
  //     r2 = arg2.toString().split('.')[1].length;
  //   } catch (e) {
  //     r2 = 0;
  //   }
  //   const n1 = Number(arg1.toString().replace('.', ''));
  //   const n2 = Number(arg2.toString().replace('.', ''));
  //   return (n1 * n2) / 10 ** (r1 + r2);
  // }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   * @param {string} uomType -单位类型
   */
  @Bind()
  showUomText(record, uomType) {
    let _code;
    let _name;
    let text;
    const { unitCodeIsShow } = record;
    if (uomType === 'weightUom') {
      _code = record.weightUomCode;
      _name = record.weightUomName;
    } else if (uomType === 'uom') {
      _code = record.uomCode;
      _name = record.uomName;
    }
    text = _name && _code ? <span>{`${_code}/${_name}`}</span> : null;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && _code && _name ? `${_code}/${_name}` : _name;
    }
    return text;
  }

  /**
   * getColumns - 组装columns
   * @param {!string} actionKey - tab 切换key
   */
  @Bind()
  getColumns() {
    const { openBOMModal = (e) => e, afterOpenLineUploadModal = (e) => e } = this.props;
    const dynamicColumns = new Map([
      [
        'itemInfo',
        [
          {
            title: intl.get(`hzero.common.button.action`).d('操作'),
            dataIndex: 'action',
            width: 60,
            fixed: 'left',
            render: this.splitActionRender,
          },
          {
            title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
            dataIndex: 'displayAsnLineNum',
            width: 100,
            fixed: 'left',
            sorter: true,
          },
          {
            title: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
            dataIndex: 'itemCode',
            width: 150,
            fixed: 'left',
            sorter: true,
          },
          {
            title: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
            dataIndex: 'itemName',
            width: 150,
            fixed: 'left',
          },
          {
            title: intl.get(`sinv.common.model.common.supplierItemNum`).d('供应商料号'),
            dataIndex: 'supplierItemNum',
            width: 110,
          },
          {
            title: intl.get(`sinv.common.model.common.suppliesNumDescription`).d('供应商料号描述'),
            dataIndex: 'supplierItemDesc',
            width: 130,
          },
          {
            title: intl.get(`sinv.common.model.common.quantity`).d('订单数量'),
            dataIndex: 'quantity',
            width: 150,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.anyShipQuantity`).d('剩余可发货数量'),
            dataIndex: 'canShipQuantity',
            width: 150,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
            dataIndex: 'uomName',
            width: 150,
            render: (_val, record) => this.showUomText(record, 'uom'),
          },
          {
            title: intl.get(`sinv.common.model.common.theShipQuantity`).d('本次发货'),
            dataIndex: 'shipQuantity',
            width: 150,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator(`shipQuantity`, {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sinv.common.model.common.theShipQuantity`).d('本次发货'),
                        }),
                      },
                    ],
                    initialValue: record.shipQuantity,
                  })(
                    <InputNumber
                      min={Number(
                        `0.${Array(
                          Number(!isNil(record.uomPrecision) ? record.uomPrecision : 10)
                        ).join(0)}1`
                      )}
                      allowThousandth
                      precision={!isNil(record.uomPrecision) ? record.uomPrecision : null}
                      onBlur={() => {
                        const financialPrecision =
                          record.financialPrecision > -1 ? record.financialPrecision : null;
                        const uomPrecision = !isNil(record.uomPrecision)
                          ? record.uomPrecision
                          : null;
                        // 行金额=本次发货数量*订单行原币含税单价/订单行的每
                        const { unitPriceBatch } = record;
                        const _shipQuantity = record.$form.getFieldValue('shipQuantity');
                        let taxIncludedLineAmount = math.multipliedBy(
                          record.enteredTaxIncludedPrice,
                          _shipQuantity
                        );
                        if (unitPriceBatch) {
                          taxIncludedLineAmount = math.div(taxIncludedLineAmount, unitPriceBatch);
                        }
                        taxIncludedLineAmount = math.toFixed(
                          taxIncludedLineAmount,
                          financialPrecision || math.dp(taxIncludedLineAmount)
                        );
                        if (
                          _shipQuantity &&
                          !isNil(record.enteredTaxIncludedPrice) &&
                          !isNil(taxIncludedLineAmount)
                        ) {
                          record.$form.setFieldsValue({
                            taxIncludedLineAmount,
                          });
                        }
                        // 件数=本次发货数量/单包装数     尾数=本次数量-单包装数*件数
                        const _theShipQuantity = record.$form.getFieldValue('shipQuantity');
                        const _unitPackageQuantity = record.$form.getFieldValue(
                          'unitPackageQuantity'
                        );
                        if (!isNil(_theShipQuantity) && _unitPackageQuantity) {
                          const packageQuantity = math.floor(
                            math.div(_theShipQuantity, _unitPackageQuantity)
                          );
                          const _remainderQuantity = math.minus(
                            _theShipQuantity,
                            math.multipliedBy(
                              _unitPackageQuantity,
                              math.floor(math.div(_theShipQuantity, _unitPackageQuantity))
                            )
                          );
                          record.$form.setFieldsValue({
                            packageQuantity: math.toFixed(
                              packageQuantity,
                              uomPrecision || math.dp(packageQuantity)
                            ),
                            remainderQuantity: math.toFixed(
                              _remainderQuantity,
                              uomPrecision || math.dp(_remainderQuantity)
                            ),
                          });
                        }
                      }}
                    />
                  )}
                </FormItem>
              ) : (
                val
              ),
          },
          {
            title: intl.get(`sinv.common.model.common.taxIncludedLineAmount`).d('含税金额'),
            dataIndex: 'taxIncludedLineAmount',
            width: 150,
            render: (_, record) => {
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(`taxIncludedLineAmount`, {
                    initialValue: record.taxIncludedLineAmount,
                  })(
                    !isNil(record.financialPrecision) ? (
                      <InputNumber
                        disabled
                        min={0}
                        allowThousandth
                        precision={record.financialPrecision}
                      />
                    ) : (
                      <InputNumber disabled min={0} allowThousandth />
                    )
                  )}
                </FormItem>
              );
            },
          },
          {
            title: intl.get(`sinv.common.model.common.grossWeight`).d('毛重'),
            dataIndex: 'grossWeightStandard',
            width: 150,
            render: (_, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`grossWeightStandard`, {
                  initialValue: record.grossWeightStandard,
                })(<InputNumber min={0} allowThousandth />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.netWeight`).d('净重'),
            dataIndex: 'netWeightStandard',
            width: 150,
            render: (_, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`netWeightStandard`, {
                  initialValue: record.netWeightStandard,
                })(<InputNumber min={0} allowThousandth />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.weightUomId`).d('重量单位'),
            dataIndex: 'weightUomId',
            width: 150,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator('weightUomId', {
                    initialValue: record.weightUomId,
                  })(
                    <Lov
                      code="SMDM.ITEM.UOM.ORG"
                      textValue={this.showUomText(record, 'weightUom')}
                    />
                  )}
                </FormItem>
              ) : (
                val
              ),
          },
          {
            title: intl.get(`sinv.common.model.common.unitPackageQuantity`).d('单包装数'),
            dataIndex: 'unitPackageQuantity',
            width: 150,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator(`unitPackageQuantity`, {
                    rules: [
                      {
                        validator: (rule, value, cb) => {
                          const max = record.$form.getFieldValue('shipQuantity');
                          if (max < value) {
                            cb(true);
                          }
                          cb();
                        },
                        message: intl
                          .get(`sinv.common.model.common.unitPackageQuantityMax`)
                          .d('不能大于本次发货数量'),
                      },
                    ],
                    initialValue: record.unitPackageQuantity,
                  })(
                    <InputNumber
                      // min={Number(
                      //   `0.${Array(
                      //     Number(!isNil(record.uomPrecision) ? record.uomPrecision : 10)
                      //   ).join(0)}1`
                      // )}
                      min={0}
                      allowThousandth
                      precision={!isNil(record.uomPrecision) ? record.uomPrecision : null}
                      onBlur={(event) => {
                        const uomPrecision = !isNil(record.uomPrecision)
                          ? record.uomPrecision
                          : null;
                        const max = record.$form.getFieldValue('shipQuantity');
                        if (math.gt(event.target.value, max)) {
                          record.$form.setFieldsValue({ unitPackageQuantity: '' });
                        }
                        // 件数=本次发货数量/单包装数     尾数=本次数量-单包装数*件数
                        const _theShipQuantity = record.$form.getFieldValue('shipQuantity');
                        const _unitPackageQuantity = record.$form.getFieldValue(
                          'unitPackageQuantity'
                        );
                        if (!isNil(_theShipQuantity) && _unitPackageQuantity) {
                          const packageQuantity = math.floor(
                            math.div(_theShipQuantity, _unitPackageQuantity)
                          );
                          const _remainderQuantity = math.minus(
                            _theShipQuantity,
                            math.multipliedBy(
                              _unitPackageQuantity,
                              math.floor(math.div(_theShipQuantity, _unitPackageQuantity))
                            )
                          );
                          record.$form.setFieldsValue({
                            packageQuantity: math.toFixed(
                              packageQuantity,
                              uomPrecision || math.dp(packageQuantity)
                            ),
                            remainderQuantity: math.toFixed(
                              _remainderQuantity,
                              uomPrecision || math.dp(_remainderQuantity)
                            ),
                          });
                        }
                      }}
                    />
                  )}
                </FormItem>
              ) : (
                val
              ),
          },
          {
            title: intl.get(`sinv.common.model.common.packageQuantity`).d('件数'),
            dataIndex: 'packageQuantity',
            width: 150,
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`packageQuantity`, {
                  initialValue: record.packageQuantity,
                })(
                  <InputNumber
                    // min={Number(
                    //   `0.${Array(
                    //     Number(!isNil(record.uomPrecision) ? record.uomPrecision : 10)
                    //   ).join(0)}1`
                    // )}
                    min={0}
                    allowThousandth
                    precision={!isNil(record.uomPrecision) ? record.uomPrecision : null}
                  />
                )}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.remainderQuantity`).d('尾数'),
            dataIndex: 'remainderQuantity',
            width: 150,
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`remainderQuantity`, {
                  initialValue: record.remainderQuantity,
                })(
                  <InputNumber
                    min={0}
                    allowThousandth
                    precision={!isNil(record.uomPrecision) ? record.uomPrecision : null}
                  />
                )}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
            dataIndex: 'lotNum',
            width: 150,
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`lotNum`, {
                  initialValue: record.lotNum,
                })(<Input inputChinese={false} />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.productionDate`).d('生产日期'),
            dataIndex: 'productionDate',
            width: 150,
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`productionDate`, {
                  getValueProps: (date) => ({
                    value: date ? moment(date, DEFAULT_DATE_FORMAT) : date,
                  }),
                  getValueFormEvent: (e) => {
                    if (!e || !e.target) return e.format(DEFAULT_DATE_FORMAT);
                    return e.target.value;
                  },
                  initialValue: record.productionDate
                    ? moment(record.productionDate, DEFAULT_DATE_FORMAT)
                    : null,
                })(<DatePicker format={DEFAULT_DATE_FORMAT} placeholder={null} />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.shelfLife`).d('保质期'),
            dataIndex: 'shelfLife',
            width: 150,
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`shelfLife`, {
                  initialValue: record.shelfLife,
                })(<Input />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.lotExpirationDate`).d('批次有效期'),
            dataIndex: 'lotExpirationDate',
            width: 150,
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`lotExpirationDate`, {
                  initialValue: record.lotExpirationDate
                    ? moment(record.lotExpirationDate, DEFAULT_DATE_FORMAT)
                    : null,
                })(<DatePicker format={DEFAULT_DATE_FORMAT} placeholder={null} />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
            dataIndex: 'serialNum',
            width: 150,
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`serialNum`, {
                  initialValue: record.serialNum,
                })(<Input inputChinese={false} />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.invoiceNum`).d('发票号'),
            dataIndex: 'invoiceNum',
            width: 150,
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`invoiceNum`, {
                  initialValue: record.invoiceNum,
                })(<Input inputChinese={false} />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.supplierRemark`).d('供应商行备注'),
            dataIndex: 'supplierRemark',
            width: 240,
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`supplierRemark`, {
                  initialValue: record.supplierRemark,
                })(<TextArea rows={1} style={{ resize: 'vertical' }} />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
            dataIndex: 'displayPoNum',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
            dataIndex: 'displayReleaseNum',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
            dataIndex: 'displayLineNum',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
            dataIndex: 'displayLineLocationNum',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
            dataIndex: 'versionNum',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.batchNo`).d('采购批次'),
            dataIndex: 'batchNo',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
            dataIndex: 'neededDate',
            width: 150,
            // render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : null),
            render: (text) => {
              const val = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
              return <span>{dateRender(val)}</span>;
            },
          },
          {
            title: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
            dataIndex: 'promisedDate',
            width: 150,
            // render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : null),
            render: (text) => {
              const val = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
              return <span>{dateRender(val)}</span>;
            },
          },
          {
            title: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
            dataIndex: 'inventoryName',
            width: 100,
          },
          {
            title: intl.get(`sinv.common.model.common.locationName`).d('库位'),
            dataIndex: 'locationName',
            width: 100,
          },
          {
            title: intl.get(`sinv.common.model.common.productionOrderNum`).d('生产工单号'),
            dataIndex: 'productionOrderNum',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
            dataIndex: 'contactInfo',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
            dataIndex: 'productNum',
            width: 180,
          },
          {
            title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
            dataIndex: 'productName',
            width: 180,
          },
          {
            title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
            dataIndex: 'catalogueName',
            width: 180,
          },
          {
            title: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
            dataIndex: 'purchaseRemark',
            width: 240,
          },
          {
            title: intl.get(`sinv.common.model.common.otherLineAttachmentUuid`).d('采购方行附件'),
            dataIndex: 'asnAttachmentUuid',
            width: 130,
            render: (val, record) => (
              <a onClick={() => this.attachmentUuidList(val, record)}>
                {intl.get(`sinv.common.model.common.attachmentUuid`).d('附件查看')}
                <Tag
                  // color="#108ee9"
                  style={{
                    height: 'auto',
                    lineHeight: '15px',
                    marginLeft: '4px',
                  }}
                >
                  {record?.picNums ?? 0}
                </Tag>
              </a>
            ),
          },
          {
            title: intl.get(`entity.item.code`).d('物料编码'),
            dataIndex: 'supplierItemCode',
            width: 150,
          },
          {
            title: intl.get(`entity.item.name`).d('物料名称'),
            dataIndex: 'supplierItemName',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.lineAttachmentUuid`).d('行附件'),
            dataIndex: 'attachmentUuid',
            width: 120,
            // render: this.attachmentRender,
            render: (val, record) => {
              if (record._status !== 'create') {
                return (
                  <Form.Item>
                    {record.$form.getFieldDecorator(`attachmentUuid`, {
                      initialValue: record.attachmentUuid,
                    })(
                      <UploadModal
                        icon={false}
                        attachmentUUID={record.attachmentUuid}
                        bucketName={PRIVATE_BUCKET}
                        bucketDirectory="sodr-order"
                        afterOpenUploadModal={(uuid) => afterOpenLineUploadModal(uuid, record)}
                        onCloseUploadModal={() => this.props.sortChange()}
                      />
                    )}
                  </Form.Item>
                );
              }
            },
          },
          {
            title: intl.get(`sinv.common.model.common.agentId`).d('采购员'),
            dataIndex: 'purchaseAgentName',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.commonName`).d('通用名'),
            dataIndex: 'commonName',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.bom`).d('外协BOM'),
            dataIndex: 'bom',
            width: 120,
            render: (val, record) => (
              <a onClick={() => openBOMModal(val, record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            ),
          },
          {
            title: intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性'),
            dataIndex: 'customSpecsJson',
            width: 120,
            render: (v) => {
              return (
                <a onClick={() => showRecordModal(v ? JSON.parse(v) : [])}>
                  {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
                </a>
              );
            },
          },
          {
            title: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
            dataIndex: 'attachmentUrlList',
            width: 100,
            render: (v) => {
              return <ImageList imageDTO={v} />;
            },
          },
        ],
      ],
    ]);
    return dynamicColumns.get('itemInfo');
  }

  @Bind()
  onRadioGroupChange(activeKey) {
    this.setState({
      tabsActiveKey: activeKey,
    });
  }

  /**
   * add - 新增物料信息事件
   */
  @Bind()
  add() {
    this.setState({
      visible: true,
    });
  }

  /**
   * onItemInfoModalOk - 新增物料信息弹窗确定按钮事件
   */
  @Bind()
  onItemInfoModalOk() {
    if (this.itemInfo && !isEmpty((this.itemInfo.state || {}).selectedRows)) {
      const { addDetailLines = (e) => e } = this.props;
      addDetailLines(this.itemInfo.state.selectedRows, (res) => {
        if (res) {
          this.closeItemInfoModal();
        }
      });
    } else {
      this.closeItemInfoModal();
    }
  }

  /**
   * closeItemInfoModal - 关闭物料信息弹窗
   */
  @Bind()
  closeItemInfoModal() {
    this.setState({
      visible: false,
    });
  }

  /**
   * onRowSelectedChange - 表格选中事件
   * @param {!Array<object>} [selectedRows=[]] - 选中的行数据
   */
  @Bind()
  onRowSelectedChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * splitActionRender - 拆分按钮单元格render函数
   * @param {object} record - 行数据
   * @param {object} index - 行序号
   */
  @Bind()
  splitActionRender(text, record) {
    return (
      <a onClick={() => this.splitLine(record)}>
        {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
      </a>
    );
  }

  @Bind()
  splitLine(record) {
    const { setDataSource = (e) => e, dataSource = [] } = this.props;
    const newDataSource = cloneDeep(dataSource);
    const { attachmentUuid, asnLineId, ...otherProps } = record;
    const rowIndex = newDataSource.findIndex((item) => item.asnLineId === asnLineId);
    newDataSource.splice(rowIndex + 1, 0, {
      ...otherProps,
      asnLineId: uuidv4(),
      shipQuantity: record.shipQuantity,
      displayAsnLineNum: null,
      _status: 'create',
      _token: null,
    });
    setDataSource(newDataSource);
  }

  @Bind()
  handleDeleteLines() {
    const { selectedRows = [] } = this.state;
    const { deleteLines = (e) => e, setDataSource, dataSource = [] } = this.props;
    const omitData = dataSource.filter(
      (d) => !selectedRows.find((o) => o.asnLineId === d.asnLineId)
    );
    const filteredArr = selectedRows.filter((record) => record._status === 'update');
    if (filteredArr.length === 0) {
      setDataSource(omitData);
      this.setState({
        selectedRows: [],
      });
    } else {
      deleteLines(filteredArr, () => {
        this.setState({
          selectedRows: [],
        });
      });
    }
  }

  /**
   * attachmentRender - 附件上传render函数
   * @param {object} record - 行数据
   */
  @Bind()
  attachmentRender(text, record) {
    const { afterOpenLineUploadModal = (e) => e } = this.props;
    const uploadModalProps = {
      // showFilesNumber: false,
      icon: false,
      attachmentUUID: record.attachmentUuid,
      bucketName: 'private-bucket',
      bucketDirectory: 'sodr-order',
      afterOpenUploadModal: (uuid) => afterOpenLineUploadModal(uuid, record),
    };
    return record._status !== 'create' && <UploadModal {...uploadModalProps} />;
  }

  render() {
    const {
      phone = [],
      dataSourceLoading,
      dataSource = [],
      processing = {},
      fetchDetailCreateList,
      logisticsInfo,
      configSheetFlag = false,
      sortChange = (e) => e,
      customizeForm = () => {},
      customizeTable = () => {},
      customizeBtnGroup = () => {},
    } = this.props;
    const { tabsActiveKey, selectedRows = [], visible } = this.state;
    // const selectedRowKeys = selectedRows.map(item => item.asnLineId);
    // const dataSourceLength = dataSource.length;
    const columns = this.getColumns(tabsActiveKey) || [];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      columns,
      dataSource,
      rowKey: 'asnLineId',
      pagination: false,
      loading:
        processing.queryDetailListLoading ||
        processing.deleteDetailLinesLoading ||
        processing.saveDetailLoading ||
        processing.submitDeliveryLoading,
      onChange: (page, _, sorter) => sortChange(page, _, sorter),
      bordered: true,
      scroll: {
        x: scrollX >= 1200 ? scrollX : false,
        y: 'calc(100vh - 400px)',
      },
      rowSelection: {
        selectedRowKeys: selectedRows.map((n) => n.asnLineId),
        onChange: this.onRowSelectedChange,
      },
    };

    const logisticsFormProps = {
      phone,
      customizeForm,
      configSheetFlag,
      dataSourceLoading,
      onRef: (node) => {
        this.logisticsForm = node;
      },
      processing: processing.queryDetailHeaderLoading,
      dataSource: logisticsInfo,
    };

    const itemInfoProps = {
      onRef: (node) => {
        this.itemInfo = node;
      },
      fetchList: fetchDetailCreateList,
    };
    return (
      <Fragment>
        <Tabs defaultActiveKey="itemInfo" animated={false} onChange={this.onRadioGroupChange}>
          <TabPane
            forceRender
            tab={intl.get(`sinv.common.view.message.title.itemInfo`).d('基础信息')}
            key="itemInfo"
          >
            <div className={styles['action-btns']}>
              {customizeBtnGroup({ code: `SINV.DELIVERY_CREATION_DETAIL.BBUTTONS.BASIC_BTN` }, [
                <Button
                  data-name="add"
                  className="action-btn"
                  type="primary"
                  onClick={this.add}
                  style={{ marginLeft: 8 }}
                >
                  {intl.get('hzero.common.button.add').d('新增')}
                </Button>,
                <Button
                  data-name="delete"
                  className="action-btn"
                  onClick={this.handleDeleteLines}
                  disabled={isEmpty(selectedRows)}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>,
              ])}
            </div>
            <div className={styles.tabPane}>
              {customizeTable(
                {
                  code: 'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC',
                },
                <EditTable {...tableProps} />
              )}
            </div>
          </TabPane>
          <TabPane
            forceRender
            tab={intl.get(`sinv.common.view.message.title.logistics`).d('物流信息')}
            key="logisticsInfo"
          >
            <LogisticsForm {...logisticsFormProps} />
          </TabPane>
        </Tabs>
        <Modal
          title={intl.get('sinv.common.view.message.title.addItemInfo').d('新增物料信息')}
          visible={visible}
          onCancel={this.closeItemInfoModal}
          destroyOnClose
          width={900}
          footer={
            <Button
              type="primary"
              loading={processing.addDetailLinesLoading}
              onClick={this.onItemInfoModalOk}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          }
        >
          {visible && <ItemInfo {...itemInfoProps} />}
        </Modal>
      </Fragment>
    );
  }
}
