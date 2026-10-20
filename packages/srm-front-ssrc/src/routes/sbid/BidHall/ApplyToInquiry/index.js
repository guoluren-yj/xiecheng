/**
 * ApplyToInquiry - 申请转招标
 * @date: 2019-9-12
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Table, Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import { noop } from 'lodash';

import { numberSeparatorRender } from '@/utils/renderer';
import FilterForm from './FilterForm';
import CreateModal from './CreateModal';
import PriceModal from './PriceModal';

@withCustomize({
  unitCode: ['SSRC.BID_HALL_APPLY_TO_BID.LIST', 'SSRC.BID_HALL_APPLY_TO_BID.FILTER'],
})
@formatterCollections({
  code: ['ssrc.bidHall', 'ssrc.common', 'ssrc.inquiryHall'],
})
@connect(({ bidHall, loading }) => ({
  bidHall,
  applyToInquiryLine: bidHall.applyToInquiryLine,
  applyToInquiryPagination: bidHall.applyToInquiryPagination,
  loading: loading.effects['bidHall/fetchApplyToInquiry'],
  createLoading: loading.effects['bidHall/createApplyToInquiry'],
  organizationId: getCurrentOrganizationId(),
}))
export default class ApplyToInquiry extends Component {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
    visible: false,
    priceModalVisible: false, // 参考价格是否可见
    priceModal: {}, // 需要带入到参考价格里的参数
  };

  filterForm = null;

  componentDidMount() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bidHall/fetchApplyToInquiry',
      payload: {
        organizationId,
        customizeUnitCode:
          'SSRC.BID_HALL_APPLY_TO_BID.LIST,SSRC.INQUIRY_HALL.APPLY_TO_INQUIRY.FILTER',
        sourceDocumentType: 'BID',
        erpControlFlag: 1,
        // sourceFrom: 'bid',
      },
    });
  }

  @Bind()
  onSearchData(params = {}) {
    const {
      dispatch,
      organizationId,
      applyToInquiryPagination: { pageSize },
    } = this.props;
    dispatch({
      type: 'bidHall/fetchApplyToInquiry',
      payload: {
        organizationId,
        page: { pageSize },
        ...params,
        customizeUnitCode:
          'SSRC.BID_HALL_APPLY_TO_BID.LIST,SSRC.INQUIRY_HALL.APPLY_TO_INQUIRY.FILTER',
        sourceDocumentType: 'BID',
        erpControlFlag: 1,
      },
    });
  }

  /**
   * 绑定form的ref
   * @param {!Object} ref - filterForm指向
   */
  @Bind()
  handleRef(ref = {}) {
    this.filterForm = ref?.props.form;
  }

  @Bind()
  onHandlePagination(page = {}) {
    const { dispatch, organizationId } = this.props;
    const values = this.filterForm ? filterNullValueObject(this.filterForm.getFieldsValue()) : {};
    dispatch({
      type: 'bidHall/fetchApplyToInquiry',
      payload: {
        organizationId,
        page,
        ...values,
        sourceDocumentType: 'BID',
        customizeUnitCode: 'SSRC.BID_HALL_APPLY_TO_BID.LIST',
        erpControlFlag: 1,
      },
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind()
  checkBeforeCreateInquiry() {
    const { dispatch, organizationId } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      Modal.error({
        content: intl
          .get('ssrc.bidHall.view.message.notification.oneRowSelect')
          .d('请选择至少一行数据'),
      });
      return;
    }
    dispatch({
      type: 'bidHall/checkApplyToInquiry',
      payload: {
        organizationId,
        prLineIdList: selectedRowKeys,
        sourceFrom: 'BID',
        configCenterCode: 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
        sourceDocumentType: 'BID',
        customizeUnitCode:
          'SSRC.BID_HALL_APPLY_TO_BID.LIST,SSRC.INQUIRY_HALL.APPLY_TO_INQUIRY.FILTER',
      },
    }).then((res) => {
      if (res) {
        // if (res.companyInconsistentFlag === 1 && res.currencyInconsistentFlag === 1) {
        //   modal.error({
        //     content: intl
        //       .get('ssrc.bidHall.view.message.notCreate.companyCurrency')
        //       .d('公司和币种不一致，不能并单创建'),
        //   });
        //   return;
        // }
        // if (res.companyInconsistentFlag === 1 && res.currencyInconsistentFlag === 0) {
        //   modal.error({
        //     content: intl
        //       .get('ssrc.bidHall.view.message.notCreate.company')
        //       .d('公司不一致，不能并单创建'),
        //   });
        //   return;
        // }
        // if (res.currencyInconsistentFlag === 1) {
        //   Modal.error({
        //     content: intl
        //       .get('ssrc.bidHall.view.message.notCreate.currency')
        //       .d('币种不一致，不能并单创建'),
        //   });
        //   return;
        // }
        if (
          res.companyInconsistentFlag === 1
          // && res.currencyInconsistentFlag === 0
        ) {
          Modal.confirm({
            title: intl
              .get(`ssrc.inquiryHall.view.message.diffCompany`)
              .d('并单公司不一致,是否继续?'),
            onOk: () => {
              this.setState({ visible: true });
            },
          });
        } else {
          this.setState({ visible: true });
        }
      }
    });
  }

  @Bind()
  createInquiry(params = {}) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bidHall/createApplyToInquiry',
      payload: {
        organizationId,
        prLineIdList: this.state.selectedRowKeys,
        ...params,
        sourceFrom: 'BID',
        configCenterCode: 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ visible: false, selectedRows: [], selectedRowKeys: [] });
        const { bidHeader } = res;
        const { bidHeaderId, bidRuleType, subjectMatterRule } = bidHeader;
        const search = querystring.stringify({
          bidRuleType,
          subjectMatterRule,
        });
        dispatch(
          routerRedux.push({
            pathname: `/ssrc/bid-hall/bid-update/${bidHeaderId}`,
            search,
          })
        );
      }
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  @Bind()
  handlePrice(record) {
    const priceModal = {
      supplierCompanyId: record.supplierCompanyId,
      itemId: record.itemId,
      purchaseOrgId: record.purchaseOrgId,
      companyId: record.companyId,
      ouId: record.ouId,
      invOrganizationId: record.invOrganizationId,
      uomId: record.uomId,
      prLineId: record.prLineId,
    };
    this.setState({ priceModalVisible: true, priceModal });
  }

  /**
   * 查询条件提示
   * @param {string} tip - 提示组件
   * @param {boolean} visible - 是否可见
   */
  @Bind()
  hideModal() {
    this.setState({
      priceModalVisible: false,
    });
  }

  render() {
    const {
      organizationId,
      loading,
      applyToInquiryLine,
      applyToInquiryPagination,
      createLoading,
      customizeTable,
      customizeFilterForm = noop,
    } = this.props;
    const { selectedRows, visible, selectedRowKeys, priceModalVisible, priceModal } = this.state;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.applicationNumber`).d('申请编号'),
        dataIndex: 'displayPrNum',
        fixed: 'left',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineNo`).d('行号'),
        dataIndex: 'displayLineNum',
        fixed: 'left',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.referencePr').d('参考价格'),
        dataIndex: 'referencePrice',
        width: 90,
        render: (_, record) => {
          const { itemCode, referencePriceDisplayFlag } = record;
          if (itemCode && referencePriceDisplayFlag) {
            return (
              <a onClick={() => this.handlePrice(record)}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.referencePr').d('参考价格')}
              </a>
            );
          }
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 130,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.amount`).d('数量'),
        dataIndex: 'quantity',
        width: 80,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.occupiedQuantity`).d('剩余可占用数量'),
        dataIndex: 'occupiedQuantity',
        width: 140,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.currencyType`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 170,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.applicant`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 130,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandExecutor`).d('需求执行人'),
        dataIndex: 'executorName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.buyer`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unitName`).d('需求部门'),
        dataIndex: 'unitName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.dateOfApplication`).d('申请日期'),
        dataIndex: 'requestDate',
        width: 170,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.dataSources`).d('数据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 130,
      },
      // {
      //   title: intl.get(`ssrc.bidHall.model.bidHall.distributivePerson`).d('分配人'),
      //   dataIndex: 'executorName',
      //   width: 150,
      // },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.distributivePerson`).d('最后分配时间'),
        dataIndex: 'assignedDate',
        width: 170,
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    const createModalProps = {
      visible,
      createLoading,
      createInquiry: this.createInquiry,
      onCancel: () => this.setState({ visible: false }),
    };
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const filterFormProps = {
      loading,
      organizationId,
      customizeFilterForm,
      onSearch: this.onSearchData,
      onRef: this.handleRef,
    };
    const priceModalProps = {
      visible: priceModalVisible,
      priceModal,
      hideModal: this.hideModal,
    };
    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/bid-hall/list"
          title={intl.get(`ssrc.bidHall.view.message.title.applyToInquiry`).d('申请转招标')}
        >
          <Button icon="plus" type="primary" onClick={() => this.checkBeforeCreateInquiry()}>
            {intl.get(`hzero.common.create`).d('创建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} />
          </div>
          {customizeTable(
            {
              code: 'SSRC.BID_HALL_APPLY_TO_BID.LIST',
            },
            <Table
              scroll={{ x: scrollWidth }}
              dataSource={applyToInquiryLine}
              rowSelection={rowSelection}
              pagination={applyToInquiryPagination}
              onChange={this.onHandlePagination}
              loading={loading}
              columns={columns}
              bordered
              rowKey="prLineId"
            />
          )}
        </Content>
        <CreateModal {...createModalProps} />
        {priceModalVisible && <PriceModal {...priceModalProps} />}
      </React.Fragment>
    );
  }
}
