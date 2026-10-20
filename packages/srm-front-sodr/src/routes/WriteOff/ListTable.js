import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';
import { showBigNumber } from '../components/utils';

const modelPrompt = 'sodr.writeOff.model.common';
export default class ListTable extends PureComponent {
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
    const { receiveOrderType } = this.props;
    const columns = {
      order: [
        {
          title: intl.get(`${modelPrompt}.orderNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 150,
          // fixed: true,
        },
        {
          title: intl.get(`${modelPrompt}.orderLineNum`).d('订单行号'),
          dataIndex: 'displayLineNum',
          width: 150,
          // fixed: true,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
          // fixed: true,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
          // fixed: true,
        },
        {
          title: intl.get(`${modelPrompt}.permitReverseQuantity`).d('可冲销数量'),
          dataIndex: 'permitReverseQuantity',
          width: 150,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`${modelPrompt}.unit`).d('单位'),
          dataIndex: 'uomName',
          width: 80,
          render: (_val, record) => this.showUomText(record),
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
          title: intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货地点'),
          dataIndex: 'shipToThirdPartyAddress',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.concatPerson`).d('联系人'),
          dataIndex: 'contactInfo',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.purchaseAgent`).d('采购员'),
          dataIndex: 'purchaseAgentName',
          width: 150,
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
          dataIndex: 'catalogName',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.releaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          width: 150,
        },
        {
          title: intl.get(`sodr.common.model.common.versionNum`).d('版本号'),
          dataIndex: 'versionNum',
          width: 150,
        },
        {
          title: intl.get(`entity.supplier.tag`).d('供应商'),
          dataIndex: 'supplierCompanyName',
          width: 150,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 150,
        },
      ],
      delivery: [
        {
          title: intl.get(`${modelPrompt}.asnNum`).d('送货单号'),
          dataIndex: 'asnNum',
          width: 150,
          fixed: true,
        },
        {
          title: intl.get(`${modelPrompt}.lineNum`).d('行号'),
          dataIndex: 'displayAsnLineNum',
          width: 80,
          fixed: true,
        },
        {
          title: intl.get(`${modelPrompt}.asnType`).d('送货单类型'),
          dataIndex: 'asnTypeCodeMeaning',
          width: 150,
          fixed: true,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
          fixed: true,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
          fixed: true,
        },
        {
          title: intl.get(`${modelPrompt}.unit`).d('单位'),
          dataIndex: 'uomName',
          width: 80,
          render: (val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`${modelPrompt}.shipQuantity`).d('发货数量'),
          dataIndex: 'shipQuantity',
          width: 150,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`${modelPrompt}.permitReverseQuantity`).d('可冲销数量'),
          dataIndex: 'permitReverseQuantity',
          width: 150,
          render: (value) => showBigNumber(value),
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
          title: intl.get(`${modelPrompt}.orderLineNum`).d('订单行号'),
          dataIndex: 'displayLineNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 150,
        },
        {
          title: intl.get(`sodr.common.model.common.versionNum`).d('版本号'),
          dataIndex: 'versionNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.expectedArriveTime`).d('预计到货时间'),
          dataIndex: 'expectedArriveDate',
          width: 150,
          render: (text) => (text ? moment(text).format(DEFAULT_DATETIME_FORMAT) : null),
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
          title: intl.get(`${modelPrompt}.locationNames`).d('收货库位'),
          dataIndex: 'locationName',
          width: 120,
        },
        {
          title: intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货地点'),
          dataIndex: 'shipToThirdPartyAddress',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.purchaseAgent`).d('采购员'),
          dataIndex: 'purchaseAgentName',
          width: 150,
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
          dataIndex: 'catalogName',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.concatPerson`).d('联系人'),
          dataIndex: 'contactInfo',
          width: 150,
        },
        {
          title: intl.get(`entity.supplier.tag`).d('供应商'),
          dataIndex: 'supplierCompanyName',
          width: 150,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 150,
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
      selectedRowKeys,
      onSelectRow,
      onChange,
      dataSource,
      pagination,
      loading,
      customizeTable,
      receiveOrderType,
    } = this.props;
    const columns = this.getColumns();
    const scrollX = columns.map((item) => item.width).reduce((sum, val) => sum + val);

    return (
      <Fragment>
        {receiveOrderType === 'ASN' &&
          customizeTable(
            {
              code: 'SODR.WRITE_OFF.LIST',
            },
            <Table
              loading={loading}
              bordered
              scroll={{ x: scrollX }}
              rowKey="asnLineId"
              columns={columns}
              dataSource={dataSource}
              pagination={pagination}
              rowSelection={{
                selectedRowKeys,
                onChange: onSelectRow,
              }}
              onChange={(page) => onChange(page)}
            />
          )}
        {receiveOrderType === 'ORDER' && (
          <Table
            loading={loading}
            bordered
            scroll={{ x: scrollX }}
            rowKey="poLineLocationId"
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectRow,
            }}
            onChange={(page) => onChange(page)}
          />
        )}
      </Fragment>
    );
  }
}
