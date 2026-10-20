/*
 * ListTable - 计划单维护
 * @date: 2019/12/11 15:04:50
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import moment from 'moment';

import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer';
import EditTable from 'srm-front-boot/lib/components/EditTable';
import { formatAumont } from '../../components/utils';

const FormItem = Form.Item;

/**
 * 计划单维护列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@withCustomize({
  unitCode: ['SODR.PLAN_SHEET_CONFIRM.LIST'],
})
@Form.create({ fieldNameProp: null })
export default class ListTable extends PureComponent {
  /**
   * 跳转详情
   */
  @Bind()
  onJumpDetail(record) {
    const { onJumpDetail } = this.props;
    onJumpDetail(record);
  }

  /**
   * 操作记录
   */
  @Bind()
  handleOperating(record) {
    const { handleOperating } = this.props;
    handleOperating(true, record);
  }

  @Bind()
  callbackPlanQuantity(_, value, callback, record) {
    if (value > record.planQuantity) {
      callback(
        intl.get('ssrc.inquiryHall.view.message.cannotTimeIsZero').d('数量不可大于本次计划数量')
      );
    } else {
      callback();
    }
  }

  render() {
    const {
      loading,
      dataSource = [],
      onSearch,
      pagination = {},
      rowSelection,
      customizeTable,
      handleToAsnNums,
    } = this.props;

    const columns = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'serialNum',
        width: 60,
        fixed: 'left',
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'planStatus',
        width: 70,
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
        title: intl.get(`sodr.orderMaintain.sourceFrom.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.averPalnQuantity`).d('本次计划数量'),
        dataIndex: 'planQuantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.planDate`).d('本次计划到货日期'),
        dataIndex: 'planDate',
        width: 150,
        render: (val) => moment(val).format('YYYY-MM-DD'),
      },
      {
        title: intl.get(`sodr.common.model.common.supplierRemark`).d('供应商备注'),
        dataIndex: 'supplierRemark',
        width: 200,
      },
      {
        title: intl.get(`sodr.common.model.common.purchaserRemark1`).d('采购方备注'),
        dataIndex: 'purchaserRemark',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('purchaserRemark', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 100,
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
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.quantityInDelivery`).d('送货中数量'),
        dataIndex: 'sendingQuantity',
        width: 80,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
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
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.agentId`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 70,
      },
      {
        title: intl.get(`entity.item.companyId`).d('公司'),
        dataIndex: 'companyName',
        width: 160,
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
        title: intl.get(`sodr.common.model.common.createdByName`).d('创建人'),
        dataIndex: 'createdBy',
        render: (_, record) => record.createdByName,
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
    return customizeTable(
      { code: 'SODR.PLAN_SHEET_CONFIRM.LIST' },
      <EditTable
        loading={loading}
        rowSelection={rowSelection}
        rowKey="planId"
        bordered
        scroll={{ x: scrollX, y: 'calc(100vh - 390px)' }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onSearch(page, 0, undefined, true)}
      />
    );
  }
}
