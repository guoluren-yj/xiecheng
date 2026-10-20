/**
 * qualityRectification - 质量整改
 * @date: 2020-05-08
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { isEmpty, isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import { Spin, Drawer } from 'hzero-ui';

import intl from 'utils/intl';
import Table from 'srm-front-boot/lib/components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination, getResponse } from 'utils/utils';
import {
  queryPurchaserQualityRectify,
  querySupplierQualityRectify,
} from '@/services/siteInvestigateReportService';

@formatterCollections({
  code: ['sslm.siteInvestigateReport', 'sslm.supplierDocManage'],
})
@withRouter
export default class QualityRectification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
      queryLoading: false,
    };
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
    this.queryQuality();
  }

  /**
   * 跳转详情页
   */
  @Bind()
  handleJumpDetail(record) {
    const { history, purchaserFlag = true, drawer = false, onClose = () => {} } = this.props;
    if (drawer) {
      onClose(false);
    }
    const { problemHeaderId } = record;
    if (purchaserFlag) {
      history.push(`/sqam/initiated8D/detail/${problemHeaderId}`);
    } else {
      history.push(`/sqam/received8D/detail/${problemHeaderId}`);
    }
  }

  /**
   * 查询质量整改列表
   */
  @Bind()
  queryQuality(page = {}) {
    const {
      evalHeaderId,
      setQualityVisible = () => {},
      orderSource = 'siteEval',
      purchaserFlag = true,
      customizeTableCode = '',
    } = this.props;
    const payload = {
      evalHeaderId,
      page,
      orderSource,
      customizeUnitCode: customizeTableCode,
    };
    this.setState({
      queryLoading: true,
    });
    // 区分供应商和采购方菜单，掉得接口不一样
    if (purchaserFlag) {
      queryPurchaserQualityRectify(payload)
        .then(res => {
          if (getResponse(res)) {
            this.setState({
              dataSource: res.content || [],
              pagination: createPagination(res),
            });
            if (isEmpty(res.content)) {
              // 隐藏页签
              setQualityVisible(false);
            }
          }
        })
        .finally(() => {
          this.setState({
            queryLoading: false,
          });
        });
    } else {
      querySupplierQualityRectify(payload)
        .then(res => {
          if (getResponse(res)) {
            this.setState({
              dataSource: res.content || [],
              pagination: createPagination(res),
            });
            if (isEmpty(res.content)) {
              // 隐藏页签
              setQualityVisible(false);
            }
          }
        })
        .finally(() => {
          this.setState({
            queryLoading: false,
          });
        });
    }
  }

  render() {
    const { dataSource, pagination, queryLoading } = this.state;
    const {
      drawer = false,
      visible = false,
      onClose = () => {},
      custLoading,
      customizeTable,
      customizeTableCode = '',
    } = this.props;

    const columns = [
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.orderNum').d('单据编号'),
        dataIndex: 'problemNum',
        width: 150,
        render: (value, record) => <a onClick={() => this.handleJumpDetail(record)}>{value}</a>,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.orderStatus').d('单据状态'),
        dataIndex: 'problemStatusMeaning',
        width: 150,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.problemTitle').d('整改报告标题'),
        dataIndex: 'problemTitle',
        width: 150,
      },
    ];

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Spin spinning={queryLoading}>
        {drawer ? (
          <Drawer
            title={intl.get('sslm.supplierDocManage.view.title.qualityRectifyReport').d('整改报告')}
            width={700}
            onClose={() => onClose(false)}
            visible={visible}
          >
            <Table
              bordered
              rowKey="evalExternalOrderId"
              columns={columns}
              dataSource={dataSource}
              scroll={{ x: scrollX, y: 350 }}
              pagination={pagination}
              onChange={this.queryQuality}
            />
          </Drawer>
        ) : customizeTable ? (
          customizeTable(
            {
              code: customizeTableCode,
            },
            <Table
              bordered
              rowKey="evalExternalOrderId"
              columns={columns}
              dataSource={dataSource}
              pagination={pagination}
              scroll={{ x: scrollX, y: 350 }}
              onChange={this.queryQuality}
              custLoading={custLoading}
            />
          )
        ) : (
          <Table
            bordered
            rowKey="evalExternalOrderId"
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            scroll={{ x: scrollX, y: 350 }}
            onChange={this.queryQuality}
            custLoading={custLoading}
          />
        )}
      </Spin>
    );
  }
}
