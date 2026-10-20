/**
 * AffiliatedOrgTable - 所属组织
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Table, Tooltip } from 'hzero-ui';
import { isEmpty, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { enableRender } from 'utils/renderer';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';

/**
 * 所属组织
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@connect(({ materielQuery }) => ({
  materielQuery,
}))
@Form.create({ fieldNameProp: null })
// @formatterCollections({ code: 'smdm.materiel' })
export default class AffiliatedOrgTable extends PureComponent {
  state = {
    recordSource: [],
    itemFlag: false,
  };

  componentDidMount() {
    const { onClearRows, itemAllOrgFlag, dataSource } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
    let newRecordSource = {};
    const basicSource = dataSource.content || [];
    if (!isEmpty(basicSource)) {
      newRecordSource = {
        minPackQuantity: basicSource[0].minPackQuantity,
        leadDays: basicSource[0].leadDays,
        forSalesFlag: basicSource[0].forSalesFlag,
        forPurchaseFlag: basicSource[0].forPurchaseFlag,
        consignmentFlag: basicSource[0].consignmentFlag,
        exemptInspectionFlag: basicSource[0].exemptInspectionFlag,
        internalBatchFlag: basicSource[0].internalBatchFlag,
        externalBatchFlag: basicSource[0].externalBatchFlag,
        validPeriodFlag: basicSource[0].validPeriodFlag,
        enabledFlag: basicSource[0].enabledFlag,
        lpnFlag: basicSource[0].lpnFlag,
        minOrderQuantity: basicSource[0].minOrderQuantity,
        minDeliveryRate: basicSource[0].minDeliveryRate,
        maxDeliveryRate: basicSource[0].maxDeliveryRate,
        firstReminderList: basicSource[0].firstReminderList,
        secondReminderList: basicSource[0].secondReminderList,
        thirdReminderList: basicSource[0].thirdReminderList,
      };
    } else {
      newRecordSource = {
        forSalesFlag: 1,
        forPurchaseFlag: 1,
        internalBatchFlag: 1,
        externalBatchFlag: 1,
        validPeriodFlag: 1,
        enabledFlag: 1,
        lpnFlag: 0,
        exemptInspectionFlag: 0,
        consignmentFlag: 0,
      };
    }
    this.setState({
      itemFlag: itemAllOrgFlag === 1,
      recordSource: newRecordSource,
    });
  }

  /**
   * 查询表单数据
   * @param {*} functionName 函数名
   * @param {*} itemId 物料Id
   * @param {*} page 分页参数
   */
  @Bind()
  queryAllOrg(page = {}, pageChange) {
    const {
      dispatch,
      organizationId,
      form,
      onAdd,
      materielQuery: { materielDetail },
    } = this.props;
    const { recordSource } = this.state;
    dispatch({
      type: `materielQuery/querAllOrg`,
      payload: {
        organizationId,
        enabledFlag: 1,
        page,
      },
    }).then((res) => {
      if (res) {
        form.validateFields((err, fieldsValues) => {
          if (!err) {
            const newDataSource = isEmpty(res.content) ? [] : [...res.content];
            let dataList = [];
            if (pageChange) {
              dataList = newDataSource.map((item) => {
                return { ...item, ...recordSource };
              });
              onAdd(dataList, 'affliatedData', true, true);
              dispatch({
                type: 'materielQuery/updateState',
                payload: {
                  materielDetail: { ...materielDetail, itemAllOrgFlag: 1 },
                },
              });
            } else {
              dataList = newDataSource.map((item) => {
                return {
                  ...item,
                  ...recordSource,
                  ...fieldsValues,
                  organizationCode: item.organizationCode,
                };
              });
              onAdd(dataList, 'affliatedData', true, true);
              dispatch({
                type: 'materielQuery/updateState',
                payload: {
                  itemOrgRelAttributeVO: fieldsValues,
                  materielDetail: { ...materielDetail, itemAllOrgFlag: 1 },
                },
              });
              this.setState({ itemFlag: true, recordSource: fieldsValues });
            }
          }
        });
      }
    });
  }

  @Bind()
  handleTableChange(pagination) {
    const { itemFlag } = this.state;
    if (itemFlag) {
      // this.queryAllOrg(pagination, true);
      this.props.onTableChange(pagination, 'queryAffliated');
    } else {
      this.props.onTableChange(pagination, 'queryAffliated');
    }
  }

  render() {
    const { dataSource, customizeTable } = this.props;
    const { content = [] } = dataSource;
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.organizationCode`).d('库存组织代码'),
        width: 150,
        dataIndex: 'organizationCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.organizationName`).d('库存组织描述'),
        width: 150,
        dataIndex: 'organizationName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.inventory`).d('库房'),
        width: 250,
        dataIndex: 'multiInventoryName',
        render: (val) => (
          <Tooltip placement="topLeft" title={val}>
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.company`).d('公司'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.ouName`).d('业务实体'),
        width: 100,
        dataIndex: 'ouName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.minPackQuantity`).d('最小包装数量'),
        width: 150,
        dataIndex: 'minPackQuantity',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.leadDays`).d('前置时间(天)'),
        width: 150,
        dataIndex: 'leadDays',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.allowExcessAmount`).d('允许超收数量/比例'),
        width: 150,
        dataIndex: 'allowExcessAmount',
        render: (text, record) => {
          return !isNil(text) && record.allowExcessType === 'RATIO' ? `${text} %` : text;
        },
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.minOrderQuantity`).d('最小订货数量'),
        width: 150,
        dataIndex: 'minOrderQuantity',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.plannedDelivery`).d('计划交货时间'),
        width: 150,
        dataIndex: 'plannedDelivery',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.checkInterval`).d('检查间隔(天)'),
        width: 150,
        dataIndex: 'checkInterval',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.receiveProcess`).d('收货处理时间(天)'),
        width: 150,
        dataIndex: 'receiveProcess',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.purchaseAgent`).d('采购员'),
        width: 150,
        dataIndex: 'purchaseAgentName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.demandExecutor`).d('需求执行人'),
        width: 150,
        dataIndex: 'demandExecutor',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.orderExecutor`).d('订单执行人'),
        width: 150,
        dataIndex: 'orderExecutor',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.sourceExecutor`).d('寻源执行人'),
        width: 150,
        dataIndex: 'sourceExecutor',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.view.dimensionQc`).d('质检维度'),
        width: 150,
        dataIndex: 'dimensionQcMeaning',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.lpnFlag`).d('物料运输组'),
        dataIndex: 'lpnFlag',
        width: 100,
        align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.forSalesFlag`).d('是否用于销售'),
        dataIndex: 'forSalesFlag',
        width: 120,
        align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.forPurchaseFlag`).d('是否用于采购'),
        dataIndex: 'forPurchaseFlag',
        width: 120,
        align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.exemptInspectionFlag`).d('是否免检'),
        dataIndex: 'exemptInspectionFlag',
        width: 120,
        align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.consignmentFlag`).d('是否寄售'),
        dataIndex: 'consignmentFlag',
        width: 120,
        align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.internalBatchFlag`).d('是否启用内部批次'),
        dataIndex: 'internalBatchFlag',
        width: 150,
        align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.externalBatchFlag`).d('是否启用外部批次'),
        dataIndex: 'externalBatchFlag',
        width: 150,
        align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.validPeriodFlag`).d('是否启用有效期'),
        dataIndex: 'validPeriodFlag',
        width: 150,
        align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.enabledFlag`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
    ];
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SMDM_MATERIELQUERY_ORG.LIST',
          },
          <Table
            rowKey="orgRelationId"
            dataSource={content}
            columns={columns}
            bordered
            scroll={{ x: 1500 }}
            pagination={createPagination(dataSource)}
            onChange={this.handleTableChange}
          />
        )}
      </React.Fragment>
    );
  }
}
