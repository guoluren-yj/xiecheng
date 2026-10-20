/**
 * WriteOff SRM冲销 - 新增行弹窗
 * @date: 2019-01-26
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { Modal, Button, Form, Input, Row, Spin } from 'hzero-ui';
import intl from 'utils/intl';
import { isNil } from 'lodash';
// import { getCurrentOrganizationId } from 'utils/utils';
// import { dateRender } from 'utils/renderer';

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { showBigNumber } from '@/routes/components/utils';

const modelPrompt = `sodr.writeOff.model.common`;

@Form.create({ fieldNameProp: null })
export default class AddRecordModal extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  @Bind()
  handleSearch() {
    const { handleSearch, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        handleSearch(values);
      }
    });
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
          title: intl.get(`${modelPrompt}.displayPoNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.displayLineNum`).d('订单行号'),
          dataIndex: 'displayLineNum',
          width: 150,
        },
        {
          title: intl.get(`entity.item.code`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
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
          render: (val, record) => this.showUomText(record),
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
          title: intl.get(`entity.item.code`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
          fixed: true,
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
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
      form,
      tenantId,
      dataSource,
      visible,
      onOk,
      onCancel,
      spinning,
      pagination,
      onSelectRow,
      onChange,
      // handleSave,
      selectedRowKeys = [],
      receiveOrderType,
    } = this.props;
    const { getFieldDecorator, setFieldsValue, registerField } = form;
    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 14 },
    };

    const columns = this.getColumns(receiveOrderType);
    const scrollX = columns.map((item) => item.width).reduce((sum, val) => sum + val);
    return (
      <Modal
        destroyOnClose
        visible={visible}
        onCancel={() => onCancel(false)}
        width={1200}
        footer={[
          <Button key="cancel" onClick={() => onCancel(false)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          <Button key="ok" onClick={onOk} disabled={selectedRowKeys.length < 1} type="primary">
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>,
        ]}
      >
        <Row className="table-list-search">
          <Form layout="inline">
            {receiveOrderType === 'ASN' && (
              <Form.Item label={intl.get(`${modelPrompt}.orderNum`).d('订单号')} {...formLayout}>
                {getFieldDecorator(
                  'displayPoNum',
                  {}
                )(<Input trim inputChinese={false} typeCase="upper" />)}
              </Form.Item>
            )}

            <Form.Item label={intl.get(`entity.item.tag`).d('物料')} {...formLayout}>
              {getFieldDecorator(
                'item',
                {}
              )(
                <Lov
                  code="SODR.PO_ITEM"
                  queryParams={{ tenantId }}
                  onChange={(_, record) => {
                    registerField('itemId');
                    setFieldsValue({ itemId: record.itemId });
                  }}
                />
              )}
            </Form.Item>
            {receiveOrderType === 'ASN' && (
              <Form.Item label={intl.get(`${modelPrompt}.acceptor`).d('验收人')} {...formLayout}>
                {getFieldDecorator('receivedBy', {})(<Input trim />)}
              </Form.Item>
            )}

            <Form.Item>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
                style={{ marginLeft: 8 }}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Form>
        </Row>
        <Spin spinning={spinning}>
          {/* <ListTable
            dataSource={dataSource}
            pagination={pagination}
            selectedRowKeys={selectedRowKeys}
            onSelectRow={onSelectRow}
            onChange={page => onChange(page)}
            handleSave={handleSave}
          /> */}
          <EditTable
            bordered
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: scrollX }}
            pagination={pagination}
            onChange={(page) => onChange(page)}
            rowKey={receiveOrderType === 'ASN' ? 'asnLineId' : 'poLineLocationId'}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectRow,
            }}
          />
        </Spin>
      </Modal>
    );
  }
}
