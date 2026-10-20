/**
 * QuoFeedBackLackModal - 报价响应不足modal
 * @date: 2020-04-14
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Modal, Button, Table, Form } from 'hzero-ui';

import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import style from './OpeningBid.less';

/**
 * 展示型组件
 * @extends {Component} - React.Component
 * @reactProps {boolean} [visible=false] - modal显隐
 * @reactProps {boolean} [loading=false] - table数据加载loading
 * @reactProps {Object} [record={}] - 当前行记录
 * @reactProps {Array} [dataSource=[]] - table数据源
 * @reactProps {Function} [onSendExpertScore= e=>e] - 下发专家评分
 * @reactProps {Function} [onStartPretrial= e=>e] - 开始初审
 * @reactProps {Function} [onStartCheckPrice= e=>e] - 开始核价
 * @reactProps {Function} [onAdjustTime= e=>e] - 时间调整
 * @reactProps {Function} [onCancel= e=>e] - 隐藏modal
 * @return React.element
 */

export default class QuoFeedBackLackModal extends Component {
  render() {
    const {
      path = {},
      visible,
      onCancel,
      onSendExpertScore,
      onStartNextRfxStatus,
      onAdjustTime,
      onCloseRfx,
      loading = false,
      closeRfxLoading = false,
      sendExpertScoreLoading = false,
      startNextRfxStatusLoading = false,
      record = {},
      dataSource = [],
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherParticipate`).d('是否参与'),
        dataIndex: 'feedbackStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationLineNumber`).d('报价行数'),
        dataIndex: 'quotationNumber',
        width: 100,
        render: (val, records) => (
          <React.Fragment>
            {val ? (
              <span>{records.quotationNumber}</span>
            ) : (
              intl.get(`ssrc.inquiryHall.model.inquiryHall.noQuotation`).d('未报价')
            )}
          </React.Fragment>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherPrequal`).d('是否资格预审'),
        dataIndex: 'prequalStatusMeaning',
        width: 130,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.whetherHeaderUploaded`)
          .d('是否上传头附件'),
        dataIndex: 'attachmentFlag',
        align: 'center',
        width: 130,
        render: yesOrNoRender,
      },
    ];
    const modalProps = {
      visible,
      width: 850,
      onCancel,
      bodyStyle: { maxHeight: '850px', overflow: 'auto' },
      title: intl.get(`ssrc.inquiryHall.view.message.title.quoFeedBackLack`).d('报价响应不足'),
      footer: (
        <Button type="primary" onClick={onCancel}>
          {intl.get('hzero.common.button.ok').d('确定')}
        </Button>
      ),
    };
    const qutationFlag = dataSource.every((item) => item.quotationStatus === 'NEW');
    return (
      <React.Fragment>
        <Modal {...modalProps}>
          <div className={style['open-bid']}>
            <Form layout="inline">
              {record.nextRfxStatus === 'SCORING' && (
                <Button
                  loading={sendExpertScoreLoading}
                  type="primary"
                  style={{ marginRight: 24 }}
                  onClick={onSendExpertScore}
                  disabled={qutationFlag}
                >
                  {intl
                    .get(`ssrc.inquiryHall.view.message.button.sendExpertScore`)
                    .d('下发专家评分')}
                </Button>
              )}
              {record.nextRfxStatus === 'PRETRIAL_PENDING' && (
                <Button
                  loading={startNextRfxStatusLoading}
                  type="primary"
                  style={{ marginRight: 8 }}
                  onClick={onStartNextRfxStatus}
                >
                  {intl.get(`ssrc.inquiryHall.view.message.button.startPretrial`).d('开始初审')}
                </Button>
              )}
              {record.nextRfxStatus === 'CHECK_PENDING' && (
                <Button
                  loading={startNextRfxStatusLoading}
                  type="primary"
                  style={{ marginRight: 8 }}
                  onClick={onStartNextRfxStatus}
                  disabled={qutationFlag}
                >
                  {intl.get(`ssrc.inquiryHall.view.message.button.startCheckPrice`).d('开始核价')}
                </Button>
              )}
              {record.nextRfxStatus === 'OPEN_BID_PENDING' && (
                <Button
                  loading={startNextRfxStatusLoading}
                  type="primary"
                  style={{ marginRight: 8 }}
                  onClick={onStartNextRfxStatus}
                  disabled={qutationFlag}
                >
                  {intl.get(`ssrc.inquiryHall.view.message.button.openingBid`).d('开标')}
                </Button>
              )}
              {record.sourceCategory === 'RFQ' && (
                <PermissionButton
                  icon="clock-circle-o"
                  style={{ marginRight: 8 }}
                  onClick={onAdjustTime}
                  permissionList={[
                    {
                      code: `${path}.button.timeadjustment`,
                      type: 'button',
                      meaning:
                        intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('寻源大厅') -
                        intl
                          .get(`ssrc.inquiryHall.view.message.button.timeAdjustment`)
                          .d('时间调整'),
                    },
                  ]}
                >
                  {intl.get(`ssrc.inquiryHall.view.message.button.timeAdjustment`).d('时间调整')}
                </PermissionButton>
              )}
              <PermissionButton
                loading={closeRfxLoading}
                style={{ marginRight: 8 }}
                onClick={onCloseRfx}
                permissionList={[
                  {
                    code: `ssrc.inquiry-hall.list.button.closed`,
                    type: 'button',
                    meaning:
                      intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('寻源大厅') -
                      intl.get(`ssrc.inquiryHall.view.message.button.closeRfx`).d('关闭询价单'),
                  },
                ]}
              >
                {intl.get(`ssrc.inquiryHall.view.message.button.closeRfx`).d('关闭询价单')}
              </PermissionButton>
            </Form>
          </div>
          <Table
            bordered
            rowKey="bidMemberId"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
