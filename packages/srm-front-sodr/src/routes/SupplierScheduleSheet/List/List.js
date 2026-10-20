import React, { Component } from 'react';
import moment from 'moment';
import { Form, Input, DatePicker, InputNumber, Button } from 'hzero-ui';
import { isNumber, sum, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { dateRender, dateTimeRender } from 'utils/renderer';
// import { getDateTimeFormat } from 'utils/utils';
import EditTable from 'srm-front-boot/lib/components/EditTable';
import intl from 'utils/intl';
import { formatAumont } from '../../components/utils';

import styles from './index.less';

const FormItem = Form.Item;
@withCustomize({
  unitCode: ['SODR.PLAN_SHEET_CREATE.FEEDBACK.LIST_NEW'],
})
export default class List extends Component {
  /**
   * 操作记录
   */
  @Bind()
  handleOperating(record) {
    const { handleOperating } = this.props;
    handleOperating(true, record);
  }

  /**
   * 批量变更本次计划到货日期
   */
  @Bind()
  handleMaintain() {
    const {
      rowSelection: { selectedRowKeys: selectedCreateRowKeys },
      form: { getFieldsValue },
      dataSource,
    } = this.props;
    const { planDate } = getFieldsValue();

    dataSource.map((item) => {
      if (!isEmpty(selectedCreateRowKeys) && selectedCreateRowKeys.includes(item.planId)) {
        item.$form.setFieldsValue({ planDate });
      } else if (isEmpty(selectedCreateRowKeys)) {
        item.$form.setFieldsValue({ planDate });
      }
      return item;
    });
  }

  // 自定义表单校验
  @Bind()
  validator(record, value, callback) {
    if (value <= 0) {
      callback(
        intl.get(`sodr.quotePurchaseRequisition.view.message.quantity.toSmall`).d('数量必须大于0')
      );
    }
    callback();
  }

  render() {
    const {
      loading,
      dataSource = [],
      onSearch,
      pagination = {},
      rowSelection,
      // handleTranslate,
      customizeTable,
      handleToAsnNums,
      form: { getFieldDecorator },
    } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'serialNum',
        width: 60,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.status`).d('状态'),
        dataIndex: 'planStatus',
        width: 60,
        fixed: 'left',
        render: (_, record) => record.planStatusMeaning,
      },
      {
        title: intl.get(`sodr.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.categoryName`).d('物料类别'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 140,
      },
      {
        title: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
        dataIndex: 'planQuantity',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('planQuantity', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
                    }),
                  },
                  {
                    validator: (_, value, callback) => this.validator(record, value, callback),
                  },
                ],
                initialValue: val,
              })(
                <InputNumber
                  max={record.availableQuantity}
                  min={0}
                  onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                  precision={2}
                  style={{ width: '100%' }}
                  allowThousandth="true"
                />
              )}
            </FormItem>
          ) : (
            formatAumont(val)
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.planDate`).d('本次计划到货日期'),
        dataIndex: 'planDate',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('planDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.planDate`).d('本次计划到货日期'),
                    }),
                  },
                ],
                initialValue: val && moment(val),
              })(<DatePicker style={{ width: '100%' }} showTime={false} format="YYYY-MM-DD" />)}
            </FormItem>
          ) : (
            moment(val).format('YYYY-MM-DD')
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.supplierRemark`).d('供应商备注'),
        dataIndex: 'supplierRemark',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('supplierRemark', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.purchaserRemark1`).d('采购方备注'),
        dataIndex: 'purchaserRemark',
        width: 200,
      },
      {
        title: intl.get(`sodr.common.model.common.poLineId`).d('订单行号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.orderDisplayLineLocationNum`).d('订单发运号'),
        dataIndex: 'lineLocationNum',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.netReceivedQuantitys`).d('净接收数量'),
        dataIndex: 'netReceivedQuantity',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.sendingQuantity`).d('送货中数量'),
        dataIndex: 'sendingQuantity',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.uomNamse`).d('单位'),
        dataIndex: 'uomName',
        width: 60,
      },
      {
        title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.promiseDeliveryDate`).d('承诺交货日期'),
        dataIndex: 'promiseDeliveryDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.agentId`).d('采购员'),
        dataIndex: 'agentId',
        width: 100,
        render: (_, record) => record.purchaseAgentName,
      },
      {
        title: intl.get(`entity.item.customCompanyName`).d('客户'),
        dataIndex: 'companyName',
        width: 180,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`entity.organization.class.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.shipAndToThirdPartyAddress`).d('交货地址'),
        dataIndex: 'shipToThirdPartyAddress',
        width: 200,
      },
      {
        title: intl.get(`sodr.common.model.common.asnNums`).d('关联送货单'),
        dataIndex: 'asnNums',
        width: 120,
        render: (val, record) => <a onClick={() => handleToAsnNums(record)}>{val || ''}</a>,
      },
      {
        title: intl.get(`sodr.common.model.common.createDate`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'operating',
        width: 130,
        render: (__, record) => (
          <a onClick={() => this.handleOperating(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <div className={styles['purchase-application']}>
        <Form layout="inline">
          <FormItem>
            <Button
              data-code="search"
              htmlType="submit"
              type="primary"
              onClick={this.handleMaintain}
              disabled={dataSource.length === 0}
            >
              <a
                title={intl
                  .get(`sodr.quotePurchase.model.quotePurchase.batchMaintainTip`)
                  .d('一键修改需求日期')}
              >
                {intl.get(`sodr.quotePurchase.model.quotePurchase.batchMaintain`).d('批量维护')}
              </a>
            </Button>
          </FormItem>
          <FormItem label={intl.get(`sodr.common.model.common.planDate`).d('本次计划到货日期')}>
            {getFieldDecorator(`planDate`)(<DatePicker placeholder={null} format="YYYY-MM-DD" />)}
          </FormItem>
        </Form>
        {customizeTable(
          { code: 'SODR.PLAN_SHEET_CREATE.FEEDBACK.LIST_NEW' },
          <EditTable
            rowSelection={rowSelection}
            loading={loading}
            rowKey="planId"
            bordered
            scroll={{ x: scrollX, y: 'calc(100vh - 390px)' }}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => onSearch(page, 0, true)}
          />
        )}
      </div>
    );
  }
}
