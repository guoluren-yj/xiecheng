/**
 * index - 事务接收维护页面
 * @date: 2019-1-28
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, Input, InputNumber, DatePicker, Button } from 'hzero-ui';
import { sum, isNumber, isArray, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { getDateFormat } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { showBigNumber } from '@/routes/components/utils';

@Form.create({ fieldNameProp: null })
export default class List extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  @Bind()
  getColumns() {
    const { tenantId, receiveOrderType, handleDelete } = this.props;
    const columns = {
      order: [
        {
          title: intl.get(`sinv.common.model.common.operation`).d('操作'),
          dataIndex: 'delete',
          width: 100,
          fixed: 'left',
          render: (val, record) => {
            return (
              <a onClick={() => handleDelete(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            );
          },
        },
        {
          title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'), // 送货单行展示行号
          dataIndex: 'trxLineNum',
          fixed: 'left',
          width: 100,
          // render: (_value, _record, index) => index + 1,
        },
        {
          title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 180,
          fixed: 'left',
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
          dataIndex: 'lineNum',
          width: 120,
        },
        {
          title: intl.get(`entity.item.code`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 120,
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
          dataIndex: 'itemName',
          width: 120,
        },

        {
          title: intl.get(`sinv.purchaseReception.view.message.`).d('可收货数量'),
          dataIndex: 'canReceiveQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.purchaseReception.message.PackagesNumber`).d('此次收货数量'),
          dataIndex: 'thisTimeReceiveQuantity',
          width: 142,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`thisTimeReceiveQuantity`, {
                    initialValue: record.canReceiveQuantity,
                    rules: [
                      {
                        pattern: /^(([1-9]{1}\d*)|(0{1}))(\.\d{1,5})?$/,
                        message: intl
                          .get(`sinv.purchaseReception.message.noFive`)
                          .d(`小数位不能超过5位`),
                      },
                      {
                        pattern: /^([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])$/,
                        message: intl
                          .get(`sinv.purchaseReception.message.thanZero`)
                          .d(`数量必须大于0`),
                      },
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sinv.purchaseReception.message.thisTimeReceiveQuantity`)
                            .d('此次接收数量'),
                        }),
                      },
                    ],
                  })(
                    record.uomPrecision ? (
                      <InputNumber
                        // min={1}
                        allowThousandth
                        precision={record.uomPrecision}
                        onChange={() => {
                          record.$form.validateFields({ force: true }, () => {
                            // TODO 要解决动画或者行高问题
                            setTimeout(() => this.forceUpdate(), 600);
                          });
                        }}
                      />
                    ) : (
                      <InputNumber
                        // min={1}
                        allowThousandth
                        onChange={() => {
                          record.$form.validateFields({ force: true }, () => {
                            // TODO 要解决动画或者行高问题
                            setTimeout(() => this.forceUpdate(), 600);
                          });
                        }}
                      />
                    )
                  )}
                </Form.Item>
              );
            } else {
              return record.thisTimeReceiveQuantity;
            }
          },
        },
        {
          title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.invOrganization`).d('收货组织'),
          dataIndex: 'invOrganizationName',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.inventoryName`).d('收货库房'),
          dataIndex: 'inventoryId',
          width: 180,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              const organizationIdParams = record.invOrganizationId
                ? {
                    invOrganizationId: record.invOrganizationId,
                  }
                : {};
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`inventoryId`, {
                    initialValue: record.inventoryId,
                  })(
                    <Lov
                      textValue={record.inventoryName}
                      code="SODR.INVENTORY"
                      queryParams={{
                        ...organizationIdParams,
                        tenantId,
                        enabledFlag: 1,
                      }}
                      // onChange={() => {
                      //   record.$form.validateFields({ force: true }, () => {
                      //     // TODO 要解决动画或者行高问题
                      //     setTimeout(() => this.forceUpdate(), 600);
                      //   });
                      // }}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return record.inventoryName;
            }
          },
        },
        {
          title: intl.get(`sinv.purchaseReception.message.locationName`).d('收货库位'),
          dataIndex: 'locationName',
          width: 180,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`locationId`, {
                    initialValue: record.locationId,
                  })(
                    <Lov
                      textValue={record.locationName}
                      code="HPFM.LOCATION"
                      queryParams={{
                        enabledFlag: 1,
                        inventoryId: record.$form.getFieldValue('inventoryId'),
                      }}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return record.locationName;
            }
          },
        },
        {
          title: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
          dataIndex: 'actualReceiverName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
          dataIndex: 'shipToLocationAddress',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.message.contactInfo`).d('联系人信息'),
          dataIndex: 'contactInfo',
          width: 180,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.lineRemark`).d('行备注'),
          dataIndex: 'remark',
          width: 180,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`remark`, {
                    initialValue: val,
                  })(<Input />)}
                </Form.Item>
              );
            } else {
              return record.remark;
            }
          },
        },
        {
          title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
          dataIndex: 'productNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
          dataIndex: 'productName',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          width: 120,
        },
      ],
      delivery: [
        {
          title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'), // 送货单行展示行号
          dataIndex: 'trxLineNum',
          fixed: 'left',
          width: 100,
          // render: (_value, _record, index) => index + 1,
        },
        {
          title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
          dataIndex: 'asnNum',
          width: 100,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.asnLineNum`).d('送货单行号'),
          dataIndex: 'asnLineNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.shipQuantity`).d('发货数量'),
          dataIndex: 'shipQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.canReceiveQuantity`).d('可接收数量'),
          dataIndex: 'canReceiveQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl
            .get(`sinv.purchaseReception.message.thisTimeReceiveQuantity`)
            .d('此次接收数量'),
          dataIndex: 'thisTimeReceiveQuantity',
          width: 142,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`thisTimeReceiveQuantity`, {
                    initialValue: record.canReceiveQuantity,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sinv.purchaseReception.message.thisTimeReceiveQuantity`)
                            .d('此次接收数量'),
                        }),
                      },
                    ],
                  })(
                    record.uomPrecision ? (
                      <InputNumber
                        // min={1}
                        allowThousandth
                        precision={record.uomPrecision}
                        onChange={() => {
                          record.$form.validateFields({ force: true }, () => {
                            // TODO 要解决动画或者行高问题
                            setTimeout(() => this.forceUpdate(), 600);
                          });
                        }}
                      />
                    ) : (
                      <InputNumber
                        // min={1}
                        allowThousandth
                        precision={record.uomPrecision}
                        onChange={() => {
                          record.$form.validateFields({ force: true }, () => {
                            // TODO 要解决动画或者行高问题
                            setTimeout(() => this.forceUpdate(), 600);
                          });
                        }}
                      />
                    )
                  )}
                </Form.Item>
              );
            } else {
              return record.thisTimeReceiveQuantity;
            }
          },
        },
        {
          title: intl.get(`sinv.purchaseReception.message.realityReceiveDate`).d('实际收货日期'),
          dataIndex: 'realityReceiveDate',
          width: 200,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`realityReceiveDate`, {
                    initialValue: record.realityReceiveDate,
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateFormat()}
                      // value={startValue}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return record.realityReceiveDate;
            }
          },
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.invOrganization`).d('收货组织'),
          dataIndex: 'invOrganizationName',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.inventoryName`).d('收货库房'),
          dataIndex: 'inventoryId',
          width: 180,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              const organizationIdParams = record.invOrganizationId
                ? {
                    invOrganizationId: record.invOrganizationId,
                  }
                : {};
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`inventoryId`, {
                    initialValue: record.inventoryId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sinv.purchaseReception.message.inventoryName`)
                            .d('收货库房'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      textValue={record.inventoryName}
                      code="SODR.INVENTORY"
                      queryParams={{
                        ...organizationIdParams,
                        tenantId,
                        enabledFlag: 1,
                      }}
                      // onChange={() => {
                      //   record.$form.validateFields({ force: true }, () => {
                      //     // TODO 要解决动画或者行高问题
                      //     setTimeout(() => this.forceUpdate(), 600);
                      //   });
                      // }}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return record.inventoryName;
            }
          },
        },
        {
          title: intl.get(`sinv.purchaseReception.message.locationName`).d('收货库位'),
          dataIndex: 'locationName',
          width: 180,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`locationId`, {
                    initialValue: record.locationId,
                  })(
                    <Lov
                      textValue={record.locationName}
                      code="HPFM.LOCATION"
                      queryParams={{
                        enabledFlag: 1,
                        inventoryId: record.$form.getFieldValue('inventoryId'),
                      }}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return record.locationName;
            }
          },
        },
        {
          title: intl.get(`entity.item.code`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 120,
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
          dataIndex: 'itemName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
          dataIndex: 'actualReceiverName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
          dataIndex: 'shipToLocationAddress',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.unitPackageQuantity`).d('单包装数'),
          dataIndex: 'unitPackageQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.packageQuantity`).d('件数'),
          dataIndex: 'packageQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.remainderQuantity`).d('尾数'),
          dataIndex: 'remainderQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
          dataIndex: 'lotNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.productionDate`).d('生产日期'),
          dataIndex: 'productionDate',
          width: 180,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.shelfLife`).d('保质期'),
          dataIndex: 'shelfLife',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.lotExpirationDate`).d('批次有效期'),
          dataIndex: 'lotExpirationDate',
          width: 180,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.brand`).d('品牌'),
          dataIndex: 'brand',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.specifications`).d('规格'),
          dataIndex: 'specifications',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.model`).d('型号'),
          dataIndex: 'model',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.invoiceNum`).d('发票号'),
          dataIndex: 'invoiceNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
          dataIndex: 'lineNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
          dataIndex: 'promisedDate',
          width: 180,
          render: dateRender,
        },
        {
          title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
          dataIndex: 'productNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
          dataIndex: 'productName',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.message.contactInfo`).d('联系人信息'),
          dataIndex: 'contactInfo',
          width: 180,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.lineRemark`).d('行备注'),
          dataIndex: 'remark',
          width: 180,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`remark`, {
                    initialValue: val,
                  })(<Input />)}
                </Form.Item>
              );
            } else {
              return record.remark;
            }
          },
        },
      ],
    };
    if (receiveOrderType === 'ASN') {
      return columns.delivery;
    } else {
      return columns.order;
    }
  }

  // @Bind()
  // changeMaintain() {
  //     const {form:{getFieldsValue} handleMaintain } = this.props;
  //     const { }=getFieldsValue()
  // }

  render() {
    const {
      form,
      tenantId,
      customizeTable,
      receiveOrderType,
      dataSource,
      // pagination,
      rowSelection,
      selectedRows,
      handleCreate,
      handleDelete,
      handleMaintain,
      inventChange = (e) => e,
      handSearch = (e) => e,
    } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const columns = this.getColumns(receiveOrderType);
    const tableProps = {
      bordered: true,
      columns,
      dataSource,
      pagination: false,
      rowSelection: receiveOrderType === 'ASN' && rowSelection,
      onChange: handSearch,
      rowKey: receiveOrderType === 'ASN' ? 'asnLineId' : 'poLineLocationId',
    };
    tableProps.scroll = {
      x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 240,
      y: 'calc(100vh - 400px)',
    };
    return (
      <>
        <div className="table-control-group">
          <Form layout="inline">
            <Form.Item
              label={intl.get(`sinv.purchaseReception.message.inventoryName`).d('收货库房')}
            />
            <Form.Item style={{ marginRight: 8 }}>
              {getFieldDecorator(
                'inventoryId',
                {}
              )(
                <Lov
                  code="SODR.INVENTORY_WITH_ORG"
                  queryParams={{
                    tenantId,
                  }}
                  onChange={(a, b, c) => {
                    inventChange(a, b, c);
                    setFieldsValue({
                      invOrganizationName: b.invOrganizationName,
                    });
                  }}
                />
              )}
            </Form.Item>
            <Form.Item style={{ marginRight: 8 }}>
              {getFieldDecorator('invOrganizationName', {})(<Input disabled />)}
            </Form.Item>
            <Form.Item style={{ marginRight: 8 }}>
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
                onClick={handleMaintain}
                disabled={dataSource.length === 0}
              >
                <a
                  title={intl
                    .get(`sinv.purchaseReception.model.quotePurchase.batchMaintainTip`)
                    .d('一键修改收货库房')}
                >
                  {intl
                    .get(`sinv.purchaseReception.model.quotePurchase.batchMaintain`)
                    .d('批量维护')}
                </a>
              </Button>
            </Form.Item>
            {receiveOrderType === 'ASN' && (
              <Form.Item style={{ marginRight: 8 }}>
                <Button
                  disabled={
                    selectedRows.length === 0 || (isArray(dataSource) && dataSource.length <= 1)
                  }
                  onClick={handleDelete}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              </Form.Item>
            )}
            <Form.Item style={{ marginRight: 0 }}>
              <Button type="primary" onClick={handleCreate}>
                {intl.get('hzero.common.button.add').d('新增')}
              </Button>
            </Form.Item>
          </Form>
        </div>
        {customizeTable(
          {
            code: 'SINV.PURCHASE_RECEPTION_REVIEW.GRID',
          },
          <EditTable
            {...tableProps}
            key={receiveOrderType === 'ASN' ? 'asnLineId' : 'poLineLocationId'}
          />
        )}
      </>
    );
  }
}
