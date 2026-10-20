/**
 * OperationBid - 开标弹框
 * @date: 2019 8/8
 * @author: zili.hou@hand-china
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Table, Form, Button } from 'hzero-ui';
import { Button as PermissionButton } from 'components/Permission';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import style from './OpeningBid.less';

@Form.create({ fieldNameProp: null })
export default class supplierRecord extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      visible,
      record,
      hideModal,
      dataSource,
      closeRfx,
      startPretrial,
      startCheckPrice,
      sendExpertScore,
      fetchQuotationFeedBackLoading,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherRead`).d('是否已读'),
        dataIndex: 'readFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.participateStatus`).d('参与状态'),
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
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherPost`).d('是否资格后审'),
        dataIndex: 'postqualStatusMeaning',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.whetherHeaderUploaded`)
          .d('是否上传头附件'),
        dataIndex: 'attachmentFlagMeaning',
        width: 130,
      },
    ];
    const { quotationLineNumber = '' } = dataSource[0] ? dataSource[0] : {};
    const modalProps = {
      visible,
      width: 850,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '850px', overflow: 'auto' },
      title: (
        <React.Fragment>
          <div className={style['open-bid']}>
            <Form layout="inline">
              <span style={{ position: 'absolute', left: '24px' }}>
                {intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标')}
              </span>
              {record.expertScoreType === 'ONLINE' && Number(quotationLineNumber) !== 0 && (
                <Button type="primary" style={{ marginRight: 24 }} onClick={sendExpertScore}>
                  {intl
                    .get(`ssrc.inquiryHall.view.message.button.sendExpertScore`)
                    .d('下发专家评分')}
                </Button>
              )}
              {record.expertScoreType !== 'ONLINE' && record.pretrialFlag === 1 && (
                <Button type="primary" style={{ marginRight: 8 }} onClick={startPretrial}>
                  {intl.get(`ssrc.inquiryHall.view.message.button.startPretrial`).d('开始初审')}
                </Button>
              )}
              {record.expertScoreType !== 'ONLINE' &&
                record.pretrialFlag !== 1 &&
                Number(quotationLineNumber) !== 0 && (
                  <Button type="primary" style={{ marginRight: 8 }} onClick={startCheckPrice}>
                    {intl.get(`ssrc.inquiryHall.view.message.button.startCheckPrice`).d('开始核价')}
                  </Button>
                )}
              <PermissionButton
                style={{ marginRight: 8 }}
                onClick={closeRfx}
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
        </React.Fragment>
      ),
    };
    return (
      <React.Fragment>
        <Modal {...modalProps}>
          <Table
            bordered
            rowKey="bidMemberId"
            loading={fetchQuotationFeedBackLoading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
