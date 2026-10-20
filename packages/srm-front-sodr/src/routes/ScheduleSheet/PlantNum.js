/**
 * plantNum - 新建分配
 * @date: 2019 1/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Form, Button } from 'hzero-ui';
import { isNumber, sum, isArray, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import Table from 'srm-front-boot/lib/components/Table';
import { formatAumont } from '../components/utils';

import PlanFilterForm from './PlanFilterForm';

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SODR.PLAN_SHEET.CREATE_LIST', 'SODR.PLAN_SHEET.CREATE_FILTER_FORM'],
})
export default class PlantNum extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
  }
  // componentDidMount() {
  //   // this.handleSearch();
  // }

  /**
   * 查询计划分配数量
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(page) {
    const { handleCreateQuery } = this.props;
    handleCreateQuery(true, page);
  }

  /**
   * 查询计划分配数量
   * @param {Object} fields 查询字段
   */
  @Bind()
  handlePage(page) {
    const { handleCreateQuery } = this.props;
    handleCreateQuery(true, page, 0);
  }

  render() {
    const {
      visible,
      handleChangeVisible,
      pagination,
      dataSource,
      handleChangeSure,
      rowSelection,
      loading,
      customizeTable,
      customizeFilterForm,
      selectedCreateQueryRowKeys,
      createSurePlanLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 110,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.readyPlanQuantity`).d('可计划数量'),
        dataIndex: 'availableQuantity',
        width: 80,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.netReceivedQuantitys`).d('净接收数量'),
        dataIndex: 'netReceivedQuantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.sendingQuantity`).d('送货中数量'),
        dataIndex: 'sendingQuantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
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
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        width: 80,
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
        width: 140,
      },
      {
        title: intl.get(`sodr.common.model.common.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
    ];
    const planFilterProps = {
      onSearch: this.handleSearch,
      customizeFilterForm,
      onRef: (node) => {
        this.planNumForm = node;
      },
    };
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const modalProps = {
      visible,
      width: '1100px',
      onOk: () => handleChangeSure(),
      onCancel: () => handleChangeVisible(false),
      bodyStyle: { overflow: 'auto' },
      title: intl.get(`sodr.schedule.view.message.title.num`).d('新建计划单'),
      footer: (
        <div>
          <Button
            type="primary"
            onClick={() => handleChangeSure()}
            loading={createSurePlanLoading}
            disabled={isArray(selectedCreateQueryRowKeys) && isEmpty(selectedCreateQueryRowKeys)}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button onClick={() => handleChangeVisible(false)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      ),
    };
    const tableProps = {
      rowKey: 'poLineLocationId',
      columns,
      dataSource,
      pagination,
      rowSelection,
      loading,
      onChange: (page) => this.handlePage(page),
    };
    //  SODR.PLAN_SHEET.CREATE_LIST  SODR.PLAN_SHEET.CREATE_FILTER_FORM
    return (
      <Modal {...modalProps}>
        <div className="table-list-search">
          <PlanFilterForm {...planFilterProps} />
          {customizeTable(
            { code: 'SODR.PLAN_SHEET.CREATE_LIST' },
            <Table {...tableProps} scroll={{ x: scrollX, y: '500px' }} bordered />
          )}
        </div>
      </Modal>
    );
  }
}
