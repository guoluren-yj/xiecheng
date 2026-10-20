import React, { PureComponent } from 'react';
import { Input, Form, Button, InputNumber } from 'hzero-ui';
import { isArray, isNil } from 'lodash';

import EditTable from 'components/EditTable';
import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
import { showBigNumber } from '@/routes/components/utils';

const modelPrompt = 'sodr.writeOff.model.common';
export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
    this.props.onRef(this);
  }

  @Bind()
  handleDelete(record) {
    const { onRemove } = this.props;
    onRemove(record);
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
  getColumns(receiveOrderType) {
    const columns = {
      order: [
        {
          title: intl.get(`sinv.common.model.common.operation`).d('操作'),
          dataIndex: 'delete',
          width: 100,
          fixed: 'left',
          render: (val, record) => {
            return (
              <a onClick={() => this.handleDelete(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            );
          },
        },
        {
          title: intl.get(`${modelPrompt}.lineNum`).d('行号'),
          dataIndex: 'lineNum',
          width: 80,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.ReceiveNum`).d('接收事务编号'),
          dataIndex: 'displayTrxNum',
          width: 150,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.ReceiveLineNum`).d('接收事务行号'),
          dataIndex: 'displayTrxLineNum',
          width: 150,
          fixed: 'left',
        },
        {
          title: intl.get(`entity.item.code`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 100,
          fixed: 'left',
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.unit`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`${modelPrompt}.writeOffQuantity`).d('冲销数量'),
          dataIndex: 'quantity',
          width: 150,
          render: (val, record) => {
            return ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator(`quantity`, {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${modelPrompt}.writeOffQuantity`).d('冲销数量'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    allowThousandth
                    max={MAX_QUAN_NUMBER}
                    precision={!isNil(record.uomPrecision) ? record.uomPrecision : null}
                    onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                  />
                )}
              </Form.Item>
            ) : (
              val
            );
          },
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 150,
        },
        {
          title: intl.get(`entity.organization.class.receiving`).d('收货组织'),
          dataIndex: 'organizationName',
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
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.shipToThirdPartyName`).d('送达方'),
          dataIndex: 'shipToThirdPartyName',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货地点'),
          dataIndex: 'shipToThirdPartyAddress',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.packageQuantity`).d('件数'),
          dataIndex: 'packageQuantity',
          width: 150,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`${modelPrompt}.remainderQuantity`).d('尾数'),
          dataIndex: 'remainderQuantity',
          width: 150,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`${modelPrompt}.lotNum`).d('批次号'),
          dataIndex: 'lotNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.productionDate`).d('生产日期'),
          dataIndex: 'productionDate',
          width: 150,
          render: dateRender,
        },
        {
          title: intl.get(`${modelPrompt}.shelfLife`).d('保质期'),
          dataIndex: 'shelfLife',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.lotExpirationDate`).d('批次有效期'),
          dataIndex: 'lotExpirationDate',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.brand`).d('品牌'),
          dataIndex: 'brand',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.specifications`).d('规格'),
          dataIndex: 'specifications',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.modelNum`).d('型号'),
          dataIndex: 'model',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.invoiceNum`).d('发票号'),
          dataIndex: 'invoiceNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.orderNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.releaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.displayLineNum`).d('订单行号'),
          dataIndex: 'displayLineNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.promisedDate`).d('承诺日期'),
          dataIndex: 'promisedDate',
          width: 150,
          render: dateRender,
        },
        {
          title: intl.get(`${modelPrompt}.productNum`).d('商品编码'),
          dataIndex: 'productNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.productName`).d('商品名称'),
          dataIndex: 'productName',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.commodityDirectory`).d('商品目录'),
          dataIndex: 'commodityDir',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.contactPersonInfo`).d('联系人信息'),
          dataIndex: 'contactInfo',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.lineRemark`).d('行备注'),
          dataIndex: 'remark',
          width: 150,
          render: (val, record) => {
            return ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator(`remark`, {
                  initialValue: val,
                })(<Input />)}
              </Form.Item>
            ) : (
              val
            );
          },
        },
      ],
      delivery: [
        {
          title: intl.get(`${modelPrompt}.lineNum`).d('行号'),
          dataIndex: 'lineNum',
          width: 80,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.ReceiveNum`).d('接收事务编号'),
          dataIndex: 'displayTrxNum',
          width: 150,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.ReceiveLineNum`).d('接收事务行号'),
          dataIndex: 'displayTrxLineNum',
          width: 150,
          fixed: 'left',
        },
        {
          title: intl.get(`entity.item.code`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 100,
          fixed: 'left',
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.asnLineNum`).d('送货单行号'),
          dataIndex: 'displayAsnLineNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.unit`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`${modelPrompt}.shipQuantity`).d('发货数量'),
          dataIndex: 'shipQuantity',
          width: 150,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`${modelPrompt}.writeOffQuantity`).d('冲销数量'),
          dataIndex: 'quantity',
          width: 150,
          render: (val, record) => {
            return ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator(`quantity`, {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${modelPrompt}.writeOffQuantity`).d('冲销数量'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    allowThousandth
                    max={MAX_QUAN_NUMBER}
                    precision={!isNil(record.uomPrecision) ? record.uomPrecision : null}
                    onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                  />
                )}
              </Form.Item>
            ) : (
              val
            );
          },
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 150,
        },
        {
          title: intl.get(`entity.organization.class.receiving`).d('收货组织'),
          dataIndex: 'organizationName',
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
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.shipToThirdPartyName`).d('送达方'),
          dataIndex: 'shipToThirdPartyName',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货地点'),
          dataIndex: 'shipToThirdPartyAddress',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.unitPackageQuantity`).d('单包装数'),
          dataIndex: 'unitPackageQuantity',
          width: 150,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`${modelPrompt}.packageQuantity`).d('件数'),
          dataIndex: 'packageQuantity',
          width: 150,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`${modelPrompt}.remainderQuantity`).d('尾数'),
          dataIndex: 'remainderQuantity',
          width: 150,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`${modelPrompt}.lotNum`).d('批次号'),
          dataIndex: 'lotNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.productionDate`).d('生产日期'),
          dataIndex: 'productionDate',
          width: 150,
          render: dateRender,
        },
        {
          title: intl.get(`${modelPrompt}.shelfLife`).d('保质期'),
          dataIndex: 'shelfLife',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.lotExpirationDate`).d('批次有效期'),
          dataIndex: 'lotExpirationDate',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.brand`).d('品牌'),
          dataIndex: 'brand',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.specifications`).d('规格'),
          dataIndex: 'specifications',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.modelNum`).d('型号'),
          dataIndex: 'model',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.invoiceNum`).d('发票号'),
          dataIndex: 'invoiceNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.orderNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.releaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.displayLineNum`).d('订单行号'),
          dataIndex: 'displayLineNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.promisedDate`).d('承诺日期'),
          dataIndex: 'promisedDate',
          width: 150,
          render: dateRender,
        },
        {
          title: intl.get(`${modelPrompt}.productNum`).d('商品编码'),
          dataIndex: 'productNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.productName`).d('商品名称'),
          dataIndex: 'productName',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.commodityDirectory`).d('商品目录'),
          dataIndex: 'commodityDir',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.contactPersonInfo`).d('联系人信息'),
          dataIndex: 'contactInfo',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.lineRemark`).d('行备注'),
          dataIndex: 'remark',
          width: 150,
          render: (val, record) => {
            return ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator(`remark`, {
                  initialValue: val,
                })(<Input />)}
              </Form.Item>
            ) : (
              val
            );
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

  render() {
    const {
      onAdd,
      onRemove,
      dataSource,
      // pagination,
      // onChange,
      selectedRowKeys,
      onSelectRow,
      customizeTable,
      receiveOrderType,
    } = this.props;
    const columns = this.getColumns(receiveOrderType);
    const scrollX = columns.map((item) => item.width).reduce((sum, val) => sum + val);
    return (
      <React.Fragment>
        <div className="table-control-group">
          {receiveOrderType === 'ASN' && (
            <Button
              onClick={onRemove}
              disabled={
                selectedRowKeys.length === 0 ||
                (isArray(dataSource) && dataSource.length <= 1) ||
                selectedRowKeys.length === dataSource.length
              }
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          )}

          <Button onClick={() => onAdd(true)} style={{ marginLeft: 8 }} type="primary">
            {intl.get(`hzero.common.button.add`).d('新增')}
          </Button>
        </div>
        {receiveOrderType === 'ASN'
          ? customizeTable(
              {
                code: 'SODR.WRITE_OFF_DETAIL.GRID',
              },
            <EditTable
              bordered
              dataSource={dataSource}
              columns={columns}
              scroll={{ x: scrollX }}
              pagination={false}
                // onChange={page => onChange(page)}
              rowKey="rcvTrxLineId"
              rowSelection={{
                  selectedRowKeys,
                  onChange: onSelectRow,
                }}
            />
            )
          : customizeTable(
              {
                code: 'SODR.WRITE_OFF_DETAIL.GRID_BY_ORDER',
              },
            <EditTable
              bordered
              dataSource={dataSource}
              columns={columns}
              scroll={{ x: scrollX }}
              pagination={false}
                // onChange={page => onChange(page)}
              rowKey="rcvTrxLineId"
              rowSelection={{
                  selectedRowKeys,
                  onChange: onSelectRow,
                }}
            />
            )}
      </React.Fragment>
    );
  }
}
