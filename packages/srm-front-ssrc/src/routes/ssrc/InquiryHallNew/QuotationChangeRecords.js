import { DataSet, Table, Spin, Modal, message } from 'choerodon-ui/pro';
import { Popover, Steps, Tag } from 'choerodon-ui';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import {
  createBeforeDirectController,
  validateBeforeDirectController,
} from '@/services/inquiryHallNewService';

import ChangeRecordDS from './QuotationChangeRecordDS';
import style from './index.less';

const { Step } = Steps;
class QuotationChangeRecords extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allLoading: false,
      organizationId: getCurrentOrganizationId(),
    };
    const { sourceHeaderId } = props;
    this.pendingTableDS = new DataSet(ChangeRecordDS({ sourceHeaderId, type: 'pending' }));
    this.approvingTableDS = new DataSet(ChangeRecordDS({ sourceHeaderId, type: 'approving' }));
    this.finishedTableDS = new DataSet(ChangeRecordDS({ sourceHeaderId, type: 'finished' }));
    this.activeTabKey = getActiveTabKey();
  }

  async directControllerDetail(record) {
    const { organizationId } = this.state;
    const { history, documentTypeName } = this.props;
    const rfxHeaderId = record.get('sourceHeaderId');
    this.setState({
      allLoading: true,
    });

    try {
      const result = getResponse(
        await validateBeforeDirectController({
          organizationId,
          sourceHeaderId: rfxHeaderId,
          sourceFrom: 'RFX',
          adjustRecordId: record.get('adjustRecordId'),
        })
      );
      if (result) {
        const onOk = async () => {
          const createRes = await createBeforeDirectController({
            organizationId,
            sourceHeaderId: rfxHeaderId,
            sourceFrom: 'RFX',
          });
          if (createRes && !createRes.failed) {
            const url = `${this.activeTabKey}/new-rfx-detail-controller/${createRes.adjustRecordId}`;
            history.push({
              pathname: url,
            });
          } else {
            message.warning(createRes.message);
          }
        };
        if (result.validateResult === 'createAdjustAgain') {
          Modal.confirm({
            key: Modal.key(),
            title: intl
              .get(`ssrc.inquiryHall.view.message.title.commonCreateAdjustgain`, {
                documentTypeName,
              })
              .d(`{documentTypeName}已变更，是否重新进入寻源过程控制界面？`),
            onOk: () => onOk(),
          });
        } else if (result.validateResult === 'createAdjust') {
          onOk();
        } else if (result.validateResult === 'openAdjust') {
          const url = `${this.activeTabKey}/new-rfx-detail-controller/${result.adjustRecordId}`;
          history.push({
            pathname: url,
          });
        }
      }
    } catch (error) {
      throw error;
    } finally {
      this.setState({
        allLoading: false,
      });
    }
  }

  @Bind()
  directControllerApproval(record) {
    const { history } = this.props;
    const current = record.get('historicTaskInstanceResponseExtList')[0] || {};
    const url = `/hwfp/monitor/detail/${current.processInstanceId}`;
    history.push({ pathname: url });
  }

  directControllerView(record) {
    const { history, sourceKeyLowerCase, backPath } = this.props;
    const url = `/ssrc/new-${sourceKeyLowerCase}-hall/new-rfx-detail-controller-detail/view/${record.get(
      'adjustRecordId'
    )}`;
    const search = querystring.stringify({
      adjustRecordIds: record.get('adjustRecordIds'),
    });

    history.push({ pathname: url, search, state: { backPath } });
  }

  stepRender = (headerWorkFlows) => {
    return (
      headerWorkFlows &&
      headerWorkFlows.length && (
        <Steps size="small" current={0} direction="vertical" className={style.steps}>
          {headerWorkFlows.map((item) => {
            return item.action === 'Rejected' ? (
              <Step
                className={style.refuse}
                title={`${item.assigneeName || ''}${item.actionMeaning || ''}${item.comment || ''}`}
                icon={<img src={require('@/assets/step-refuse.svg')} alt="" />}
              />
            ) : (
              <Step
                title={`${item.assigneeName || ''}${item.actionMeaning || ''}${item.comment || ''}`}
                icon={<img src={require('@/assets/step-pass.svg')} alt="" />}
              />
            );
          })}
        </Steps>
      )
    );
  };

  getTagColor(record) {
    const adjustStatus = record?.get('adjustStatus') || '';
    let color = '';
    switch (adjustStatus) {
      case 'APPROVING':
        color = 'yellow';
        break;
      case 'REJECTED':
        color = 'red';
        break;
      case 'FINISHED':
        color = 'green';
        break;
      case 'NEW':
        color = 'yellow';
        break;
      case 'WITHDRAW':
        color = 'gray';
        break;
      default:
        color = 'yellow';
    }
    return color;
  }

  getColumns(status) {
    const renderOperate = (record) => {
      let renderNode = '';
      switch (status) {
        case 'pending':
          renderNode = (
            <a onClick={() => this.directControllerDetail(record)}>
              {intl.get('ssrc.inquiryHall.view.message.button.maintain').d('维护')}
            </a>
          );
          break;
        case 'approving':
          if (record.get('historicTaskInstanceResponseExtList')?.length) {
            renderNode = (
              <a onClick={() => this.directControllerApproval(record)}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.approveDetail').d('审批详情')}
              </a>
            );
          }
          break;
        case 'finished':
          renderNode = (
            <a onClick={() => this.directControllerView(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          );
          break;
        default:
          break;
      }
      return renderNode;
    };

    const renderApprovalDetail = (record) => {
      const headerWorkFlows = record.get('historicTaskInstanceResponseExtList');
      const { assigneeName = '', actionMeaning = '', comment = '' } =
        (headerWorkFlows?.length && headerWorkFlows[0]) || {};
      return (
        <Popover content={this.stepRender(headerWorkFlows)} placement="bottomLeft">
          <span>{`${(assigneeName || '') + (actionMeaning || '') + (comment || '-')}`} </span>
        </Popover>
      );
    };

    const columns = [
      {
        name: 'adjustStatusMeaning',
        type: 'string',
        width: 100,
        renderer: ({ value, record }) => {
          const color = this.getTagColor(record) || '';
          return (
            <Tag color={color} border={false}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'operate',
        type: 'string',
        width: 80,
        renderer: ({ record }) => renderOperate(record),
      },
      {
        name: 'adjustNum',
        type: 'string',
        width: 120,
      },
      {
        name: 'adjustTypesMeaning',
        width: 100,
      },
      {
        name: 'approveDetail',
        width: 120,
        renderer: ({ record }) => renderApprovalDetail(record),
      },
      {
        name: 'createdByName',
        width: 120,
      },
      {
        name: 'createdUnitName',
        width: 150,
      },
      {
        name: 'creationDate',
        width: 150,
      },
    ];

    return columns;
  }

  render() {
    return (
      <Spin spinning={this.state.allLoading}>
        <div className={style.changeRecordContainer}>
          <div className="title">
            <div className="rfx-card-item-title-line" />
            {intl.get('ssrc.inquiryHall.model.inquiryHall.toDeal').d('待处理')}
          </div>
          <Table
            dataSet={this.pendingTableDS}
            columns={this.getColumns('pending')}
            customizedCode="SSRC.NEW_INQUIRY_HALL.LIST.CHANGE_RECORDS_PENDING"
          />
          <div className="title">
            <div className="rfx-card-item-title-line" />
            {intl.get('ssrc.inquiryHall.model.inquiryHall.approvaling').d('审批中')}
          </div>
          <Table
            dataSet={this.approvingTableDS}
            columns={this.getColumns('approving')}
            customizedCode="SSRC.NEW_INQUIRY_HALL.LIST.CHANGE_RECORDS_APPROVING"
          />
          <div className="title">
            <div className="rfx-card-item-title-line" />
            {intl.get('ssrc.inquiryHall.model.inquiryHall.hadFinished').d('已完成')}
          </div>
          <Table
            dataSet={this.finishedTableDS}
            columns={this.getColumns('finished')}
            customizedCode="SSRC.NEW_INQUIRY_HALL.LIST.CHANGE_RECORDS_FINISHED"
          />
        </div>
      </Spin>
    );
  }
}

const hocComponent = (Com) => {
  return Com;
};

export default hocComponent(QuotationChangeRecords);
export { QuotationChangeRecords, hocComponent };
