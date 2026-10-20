/**
 * 需求取消Erp/整单取消
 * @date: 2019-2-22
 * @author: lixiaolong <xiaolong.li02@hand-china>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Row, Col, Collapse, Icon, Table } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';

import { dateRender } from 'utils/renderer'; // 日期时间格式化
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';

// 设置sprm国际化前缀 - message
const messagePrompt = 'sprm.purchaseRequisitionCancel.view.message';
const titlePrompt = 'sprm.purchaseReqCancel.view.title';
const commonPrompt = 'sprm.common.model.common';

const { Panel } = Collapse;

@connect(({ purchaseRequisitionCancel = {}, loading = {} }) => ({
  purchaseRequisitionCancel,
  fetchDataLoading: loading.effects['purchaseRequisitionCancel/fetchData'],
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionCancel',
    'sprm.purchaseReqCancel',
    'sprm.purchasePlatform',
    'sprm.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'sprm.purchaseReqCreation',
  ],
})
export default class ERP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: 'purchaseRequisitionCancel/fetchData',
      payload: params,
    });
  }

  @Bind()
  handleCollapse() {
    this.setState((state) => ({
      collapsed: !state.collapsed,
    }));
  }

  /**
   * 取消erp采购申请
   */
  @Bind()
  handleCancel() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: 'purchaseRequisitionCancel/cancelERP',
      payload: params,
    }).then((res) => {
      if (res) {
        dispatch(
          routerRedux.push({
            pathname: `/sprm/purchase-requisition-cancel/list`,
          })
        );
      }
    });
  }

  render() {
    const { collapsed } = this.state;
    const {
      purchaseRequisitionCancel: { erpHeaderInfo = {}, erpDataSource },
      fetchDataLoading,
      match: { path = '' },
    } = this.props;
    const columns = [
      {
        title: intl.get(`${messagePrompt}.status`).d('状态'),
        dataIndex: 'status',
        fixed: 'left',
        align: 'center',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        dataIndex: 'lineNum',
        fixed: 'left',
        align: 'center',
        width: 100,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'itemCatalog',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 120,
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.suggestPrice`).d('建议单价'),
        dataIndex: 'suggestPrice',
        width: 120,
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        dataIndex: 'needDate',
        width: 120,
        render: dateRender,
        align: 'center',
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'company',
        width: 120,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'company',
        width: 120,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'company',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'company',
        width: 120,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'company',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'company',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'company',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.ERPstatus`).d('ERP状态'),
        dataIndex: 'company',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`${commonPrompt}.handleStatus`).d('执行状态'),
        dataIndex: 'company',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`${commonPrompt}.handlePerson`).d('需求执行人'),
        dataIndex: 'company',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`${commonPrompt}.assignedDate`).d('分配日期'),
        dataIndex: 'company',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`${messagePrompt}.infoRecord`).d('信息记录'),
        dataIndex: 'company',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`${messagePrompt}.hisInquirySheet`).d('历史询价单'),
        dataIndex: 'company',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`${messagePrompt}.suspendReason`).d('暂挂原因'),
        dataIndex: 'company',
        width: 120,
      },
      {
        title: intl.get(`${messagePrompt}.closedReason`).d('关闭原因'),
        dataIndex: 'company',
        width: 120,
      },
      {
        title: intl.get(`entity.attachment.tag`).d('附件'),
        dataIndex: 'attachment',
        width: 120,
        align: 'center',
        render: (val, record) => (
          <a onClick={() => this.handleViewAttachment(record)}>
            {intl.get(`${messagePrompt}.attachment`).d('查看附件')}
          </a>
        ),
      },
      {
        title: intl.get(`${messagePrompt}.history`).d('操作记录'),
        dataIndex: 'history',
        width: 120,
        align: 'center',
        render: (val, record) => (
          <a onClick={() => this.handleViewHistory(record)}>
            {intl.get(`${messagePrompt}.history`).d('操作记录')}
          </a>
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 120;
    return (
      <div className={styles['purchase-cancel-erp']}>
        <Header
          title={intl.get(`${messagePrompt}.erpTitle`).d('需求明细')}
          backPath={
            path.includes('sprm/purchase-platform/cancelerp-detail')
              ? '/sprm/purchase-platform/list'
              : '/sprm/purchase-requisition-cancel/list'
          }
        >
          <Button type="primary" onClick={this.handleCancel}>
            {intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消')}
          </Button>
        </Header>
        <Content>
          <Collapse
            className="form-collapse"
            defaultActiveKey={['erpCancel']}
            onChange={this.handleCollapse}
          >
            <Panel
              key="erpCancel"
              showArrow={false}
              header={
                <Fragment>
                  <Icon type={!collapsed ? 'minus' : 'plus'} />
                  <h3>{intl.get(`${titlePrompt}.purchaseHeadInfo`).d('采购申请头信息')}</h3>
                </Fragment>
              }
            >
              <Row>
                <Col span={8}>
                  <Col span={10}>{intl.get(`${messagePrompt}.applyCode`).d('申请编号')}:</Col>
                  <Col span={14}>{erpHeaderInfo.applyCode}</Col>
                </Col>
                <Col span={8}>
                  <Col span={10}>{intl.get(`${messagePrompt}.applyPerson`).d('申请人')}:</Col>
                  <Col span={14}>{erpHeaderInfo.applyPerson}</Col>
                </Col>
                <Col span={8}>
                  <Col span={10}>{intl.get(`${messagePrompt}.applyDate`).d('申请日期')}:</Col>
                  <Col span={14}>{erpHeaderInfo.applyDate}</Col>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <Col span={10}>{intl.get(`${messagePrompt}.dataSource`).d('数据来源')}:</Col>
                  <Col span={14}>{erpHeaderInfo.dataSource}</Col>
                </Col>
              </Row>
              <Row>
                <Col span={3}>{intl.get(`${commonPrompt}.applyExplain`).d('申请说明')}</Col>
                <Col span={18}>{erpHeaderInfo.applyDes}</Col>
              </Row>
            </Panel>
          </Collapse>
          <br />
          <Table
            bordered
            loading={fetchDataLoading}
            columns={columns}
            dataSource={erpDataSource}
            scroll={{ x: scrollX }}
            rowKey=""
          />
        </Content>
      </div>
    );
  }
}
