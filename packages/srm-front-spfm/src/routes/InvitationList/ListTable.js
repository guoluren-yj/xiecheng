/*
 * ListTable - 企业邀约汇总数据列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal } from 'hzero-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'utils/utils';
import { sum, isNumber } from 'lodash';

import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import { queryRiskMonitorType } from '@/services/supplierService';

/**
 * 企业邀约汇总数据列表信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
export default class ListTable extends PureComponent {
  /**
   * 显示编辑模态框
   * @param {obj} record 当前行数据
   */
  @Bind()
  showEditModal(record) {
    this.props.editLine(record);
  }

  /**
   * 邀约明细跳转
   * @param {number} inviteId - 邀请Id
   */
  @Bind()
  handleToDetail(inviteId, record) {
    if (this.props.handleToDetail) {
      this.props.handleToDetail(inviteId, record);
    }
  }

  /**
   * 风险扫描
   */
  @Bind()
  handleRiskScan(record) {
    const { handleEmbedPage, emit } = this.props;
    const params = {
      enterpriseName: emit ? record.inviteCompanyName : record.companyName,
      supplierCompanyId: emit ? record.inviteCompanyId : record.companyId,
    };

    queryRiskMonitorType().then(res => {
      const riskMonitorTypeResult = getResponse(res);
      if (riskMonitorTypeResult) {
        const { partnerCode: riskMonitorType } = riskMonitorTypeResult;
        if (['SRD', 'ZHENYUN_PARTNER'].includes(riskMonitorType)) {
          handleEmbedPage(params);
        }
      }
    });
  }

  /**
   * 查看注册链接
   */
  @Bind()
  checkRegisterLink(record) {
    C7nModal.open({
      footer: null,
      closable: true,
      movable: false,
      title: intl.get(`spfm.invitationList.model.invitationList.registerLink`).d('注册链接'),
      children: <div>{record.registerUrl}</div>,
    });
  }

  render() {
    const {
      emit,
      loading,
      dataSource,
      searchPaging,
      pagination,
      rowSelection,
      // riskFlag,
      customizeTable,
      code,
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfm.invitationList.model.invitationList.inviteId`).d('邀请编号'),
        dataIndex: 'inviteId',
        width: 90,
        fixed: 'left',
        render: (value, record) => (
          <a onClick={() => this.handleToDetail(value, record)}>{record.displayInviteId}</a>
        ),
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.processStatus`).d('邀约状态'),
        dataIndex: 'processStatusMeaning',
        fixed: 'left',
        width: 90,
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.inviteTypeMeaning`).d('邀请类型'),
        dataIndex: 'inviteTypeMeaning',
        width: 100,
        render: value =>
          emit
            ? intl
                .get(`spfm.invitationList.model.invitationList.invitation`, { name: value })
                .d(`邀请${value}`)
            : intl
                .get(`spfm.invitationList.model.invitationList.toBe`, { name: value })
                .d(`成为${value}`),
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.companyName`).d('发起邀请的公司'),
        dataIndex: 'companyName',
        width: 250,
      },
      {
        title: intl
          .get(`spfm.invitationList.model.invitationList.inviteCompanyNum`)
          .d('被邀请企业编码'),
        dataIndex: 'inviteCompanyNum',
        width: 150,
      },
      {
        title: intl
          .get(`spfm.invitationList.model.invitationList.inviteCompanyName`)
          .d('被邀请企业名称'),
        width: 200,
        dataIndex: 'inviteCompanyName',
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.creationDate`).d('发出邀请时间'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.levelTypeFlag`).d('是否集团级'),
        dataIndex: 'levelTypeFlag',
        width: 150,
        render: val => yesOrNoRender(val ? 0 : 1),
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.privateFlag`).d('是否私有化'),
        dataIndex: 'privateFlag',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl
          .get(`spfm.invitationList.model.invitationList.investigateFalg`)
          .d('是否发出调查表'),
        dataIndex: 'investigateFlag',
        width: 130,
        render: yesOrNoRender,
      },
      emit
        ? {
            title: intl
              .get(`spfm.invitationList.model.invitationList.sendUserName`)
              .d('发起邀请人'),
            dataIndex: 'sendUserName',
            width: 150,
          }
        : {
            title: intl
              .get(`spfm.invitationList.model.invitationList.handleUserName`)
              .d('邀约处理人'),
            dataIndex: 'handleUserName',
            width: 150,
          },
      {
        title: intl.get(`spfm.invitationRegister.model.invitation.purchaseAgentId`).d('采购员'),
        dataIndex: 'purchaseAgentNameJoint',
        width: 150,
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.processMsg`).d('处理消息'),
        dataIndex: 'processMsg',
        width: 120,
      },
      {
        title: intl.get('spfm.invitationList.view.message.riskScan').d('风险扫描'),
        width: 100,
        dataIndex: 'isShowScan',
        render: (_, record) => (
          <a onClick={() => this.handleRiskScan(record)}>
            {intl.get('spfm.invitationList.view.message.riskScan').d('风险扫描')}
          </a>
        ),
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.processDate`).d('最后处理时间'),
        dataIndex: 'processDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    if (emit) {
      columns.splice(10, 0, {
        title: intl.get(`spfm.invitationList.model.invitationList.registerLink`).d('注册链接'),
        dataIndex: 'registerUrl',
        width: 100,
        render: (_, record) => {
          const { inviteType, processStatus } = record;
          return inviteType === 'REGISTER' ? (
            <a
              onClick={() => this.checkRegisterLink(record)}
              disabled={processStatus !== 'REGISTERED'}
            >
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          ) : null;
        },
      });
    }
    if (!emit) {
      columns.splice(11, 0, {
        title: intl.get(`spfm.disposeInvite.model.purchaserCooperation.inviteRemark`).d('邀请备注'),
        dataIndex: 'inviteRemark',
        width: 150,
      });
    }
    // const riskobj = {
    //   title: intl.get('spfm.invitationList.view.message.riskScan').d('风险扫描'),
    //   width: 100,
    //   dataIndex: 'isShowScan',
    //   render: (_, record) => (
    //     <a onClick={() => this.handleRiskScan(record)}>
    //       {intl.get('spfm.invitationList.view.message.riskScan').d('风险扫描')}
    //     </a>
    //   ),
    // };
    // if (!riskFlag) {
    //   columns.splice(-1, 0, riskobj);
    // }
    const scrollX = sum(columns.map(item => (isNumber(item.width) ? item.width : 0))) + 180;
    return customizeTable(
      {
        code,
      },
      <Table
        bordered
        rowKey="inviteId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={searchPaging}
        rowSelection={emit ? null : rowSelection}
        scroll={{ x: scrollX, y: 'calc(100vh - 386px)' }}
      />
    );
  }
}
