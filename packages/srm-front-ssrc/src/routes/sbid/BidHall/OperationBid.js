/**
 * supplierRecord - 开标弹框
 * @date: 2019 1/2
 * @author: zili.hou@hand-china
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Table, Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { Button as PermissionButton } from 'components/Permission';

import style from './OpeningBid.less';

@Form.create({ fieldNameProp: null })
export default class supplierRecord extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      biddingReasonVisible: false, // 关闭招标理由
    };
  }

  /**
   * 展开 - 招标理由弹框
   */
  @Bind()
  showBiddingReason() {
    this.setState({
      biddingReasonVisible: true,
    });
  }

  /**
   * 关闭 - 招标理由弹框
   */
  @Bind()
  hideBiddingReason() {
    this.setState({
      biddingReasonVisible: false,
    });
  }

  /**
   * 保存 - 招标理由弹框
   */
  @Bind()
  saveBiddingReason() {
    const { form, closeScaling } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        closeScaling(values);
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      settings,
      match,
      visible,
      hideModal,
      dataSource,
      confirmOpeningBid,
      sendExpertScore,
      operateBidDataLoading,
      closeScalingLoading,
      openScalingLoading,
      sendExpertScoreLoading,
      expertScoreType,
      openScaling,
      form: { getFieldDecorator },
    } = this.props;
    const { biddingReasonVisible = false } = this.state;
    const { quotationNumber = 0 } = dataSource[0] ? dataSource[0] : {};
    const columns = [
      {
        title: intl.get(`ssrc.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationStatus`).d('投标状态'),
        dataIndex: 'purchaseStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationNum`).d('投标编号'),
        dataIndex: 'quotationNum',
        width: 120,
        render: (val, record) => (record.quotationNum ? val : '——'),
      },
      +settings['011107']?.settingValue && {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyIp`).d('报价IP'),
        dataIndex: 'supplierCompanyIp',
        width: 120,
      },
      +settings['011107']?.settingValue && {
        title: intl.get(`ssrc.bidHall.model.bidHall.companyIpRate`).d('最高重合率'),
        dataIndex: 'companyIpRate',
        width: 100,
        render: (val) => (val || val === 0 ? `${val}%` : null),
      },
      +settings['011107']?.settingValue && {
        title: intl.get(`ssrc.bidHall.model.bidHall.coincidenceCompanyName`).d('重合公司'),
        dataIndex: 'coincidenceCompanyName',
        width: 150,
      },
      +settings['011107']?.settingValue && {
        title: intl.get(`ssrc.bidHall.model.bidHall.coincidenceSupplierIp`).d('重合IP'),
        dataIndex: 'coincidenceSupplierIp',
        width: 120,
      },
    ].filter(Boolean);
    const modalProps = {
      visible,
      width: 650,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      title: (
        <React.Fragment>
          <div className={style['open-bid']} style={{ marginRight: '6px' }}>
            <Form layout="inline">
              <span style={{ position: 'absolute', left: '24px' }}>
                {intl.get(`ssrc.bidHall.view.message.title.openingBid`).d('开标')}
              </span>
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
            loading={operateBidDataLoading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
          />
          <div className={style['open-bid']} style={{ margin: '24px 6px 0px 0px' }}>
            <Form layout="inline">
              {dataSource.length > 0 && expertScoreType !== 'NONE' && quotationNumber !== 0 && (
                <Button
                  type="primary"
                  style={{ marginRight: 24 }}
                  loading={sendExpertScoreLoading}
                  onClick={sendExpertScore}
                >
                  {intl.get(`ssrc.bidHall.view.button.sendExpertScore`).d('下发专家评分')}
                </Button>
              )}
              {expertScoreType === 'NONE' && quotationNumber !== 0 && (
                <Button
                  type="primary"
                  loading={openScalingLoading}
                  style={{ marginRight: 24 }}
                  onClick={openScaling}
                >
                  {intl.get(`ssrc.bidHall.view.button.start`).d('开始定标')}
                </Button>
              )}
              <PermissionButton
                type={!(expertScoreType === 'NONE' && quotationNumber !== 0) && 'primary'}
                onClick={() => this.showBiddingReason()}
                style={{ marginRight: 8 }}
                permissionList={[
                  {
                    code: `${match.path}.button.closebid`,
                    type: 'button',
                    meaning: `${intl.get(`ssrc.bidHall.view.title.bidHall`).d('招标大厅')} -
                      ${intl.get(`ssrc.bidHall.view.button.confirmCloseBid`).d('关闭招标')}`,
                  },
                ]}
              >
                {intl.get(`ssrc.bidHall.view.button.confirmCloseBid`).d('关闭招标')}
              </PermissionButton>
              <Button style={{ marginRight: 8 }} disabled onClick={confirmOpeningBid}>
                {intl.get(`ssrc.bidHall.view.button.bidScanTable`).d('开标一览表')}
              </Button>
              <Button style={{ marginRight: 8 }} disabled onClick={confirmOpeningBid}>
                {intl.get(`ssrc.bidHall.view.button.newBidTab`).d('下阶段招标')}
              </Button>
            </Form>
          </div>
        </Modal>
        <Modal
          destroyOnClose
          visible={biddingReasonVisible}
          title={intl.get('ssrc.bidHall.view.message.title.closeBidding').d('关闭')}
          onCancel={() => this.hideBiddingReason()}
          onOk={() => this.saveBiddingReason()}
          confirmLoading={closeScalingLoading}
        >
          <Form>
            <Form.Item
              label={intl.get('ssrc.bidHall.view.message.title.closeBidReason').d('关闭原因')}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
            >
              {getFieldDecorator('processRemark', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.bidHall.view.message.title.closeBidReason')
                        .d('关闭原因'),
                    }),
                  },
                ],
              })(<Input.TextArea autosize={{ minRows: 3, maxRows: 6 }} />)}
            </Form.Item>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
