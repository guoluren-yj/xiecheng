import React from 'react';
import { Tooltip } from 'choerodon-ui';
import {
  DataSet,
  TextField,
  Select,
  CheckBox,
  Password,
  Icon,
  TextArea,
  NumberField,
  Lov,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import FakePassword from '@/components/FakePassword';

import { fromDS } from './ds';
import styles from './modal.less';

export default class AddressModal extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    const { recordData } = props;
    this.state = {
      recordData,
      currentPayType: undefined,
    };
  }

  formDs = new DataSet(fromDS());

  componentDidMount() {
    const { recordData } = this.state;
    if (recordData) {
      this.formDs.setQueryParameter('queryParam', {
        configId: recordData?.get('configId'),
        channelCode: recordData?.get('channelCode'),
      });
      this.formDs.query();
    } else {
      this.formDs.create({ enabledFlag: 1 });
    }
  }

  render() {
    const { currentPayType, recordData } = this.state;
    return (
      <div className={styles['modal-container']}>
        <Tooltip
          theme="dark"
          placement="leftBottom"
          title={
            <div>
              <div>
                {intl
                  .get('spct.paymentConfig.view.hoverMessage1')
                  .d('支付流程中共有四方参与，分别是：')}
              </div>
              <div>
                {intl
                  .get('spct.paymentConfig.view.hoverMessage2')
                  .d('付款人：采买人员。实际进行采买并付款的一方')}
              </div>
              <div>
                {intl
                  .get('spct.paymentConfig.view.hoverMessage3')
                  .d('服务商：甄云科技公司。打通各支付渠道能力的一方')}
              </div>
              <div>
                {intl
                  .get('spct.paymentConfig.view.hoverMessage4')
                  .d('支付渠道：支付宝、微信等。提供支付能力的一方')}
              </div>
              <div>
                {intl
                  .get('spct.paymentConfig.view.hoverMessage5')
                  .d('收款方：销售主体的核企。收款账户归属的一方')}
              </div>
              <br />
              <div>
                {intl
                  .get('spct.paymentConfig.view.hoverMessage6')
                  .d(
                    '其中，甄云作为服务商只提供支付能力，不收取任何费用。支付渠道根据签约费率收取服务费。服务费本身不计入商城和支付渠道的交易内容，仅为收款方和支付渠道之间的交易行为。'
                  )}
              </div>
              <br />
              <div>
                {intl.get('spct.paymentConfig.view.hoverMessage7').d('各方收付金额构成为：')}
              </div>
              <div>
                {intl
                  .get('spct.paymentConfig.view.hoverMessage8')
                  .d('付款人：订单金额=付款人实际支付金额')}
              </div>
              <div>
                {intl.get('spct.paymentConfig.view.hoverMessage9').d('服务商：不收取任何费用')}
              </div>
              <div>
                {intl
                  .get('spct.paymentConfig.view.hoverMessage10')
                  .d('支付渠道：手续费=订单金额*签约费率，在交易完成后扣除')}
              </div>
              <div>
                {intl.get('spct.paymentConfig.view.hoverMessage11').d('收款方：实收金额=订单金额')}
              </div>
              <br />
              <div>
                {intl
                  .get('spct.paymentConfig.view.hoverMessage13')
                  .d(
                    '每一笔支付金额支付渠道会收取服务费，但退款时仍以付款人实际付款的金额退款，需要收款方自行承担与支付渠道签订的协议中约定的服务费。'
                  )}
              </div>
            </div>
          }
        >
          <div className="modal-title">
            <Icon type="error" />
            {intl
              .get('spct.paymentConfig.view.explain')
              .d('说明：支付流出中共有四方参与，分别是：付款人...')}
          </div>
        </Tooltip>
        <div className="modal-content">
          <div className="modal-header" style={{ marginTop: '20px' }}>
            {intl.get('spct.paymentConfig.model.payConfigName').d('支付配置名称')}
          </div>
          <div className="modal-description">
            {intl.get('spct.paymentConfig.model.payConfigNameDes').d('输入配置名称以便区分配置')}
          </div>
          <TextField
            dataSet={this.formDs}
            name="configName"
            labelLayout="float"
            style={{ width: 340 }}
          />
          <div className="modal-header">
            {intl.get('spct.paymentConfig.model.payChannel').d('支付渠道')}
          </div>
          <div className="modal-description">
            {intl
              .get('spct.paymentConfig.model.payChannelDes')
              .d('每种支付渠道只能创建一个配置，若需要变更，请删除或更新已有配置。')}
          </div>
          <Select
            dataSet={this.formDs}
            name="channelCode"
            labelLayout="float"
            style={{ width: 340, marginBottom: '24px' }}
            onChange={(val) => this.setState({ currentPayType: val })}
          />
          <NumberField
            style={{ width: 340 }}
            dataSet={this.formDs}
            labelLayout="float"
            name="configNumber"
          />
          <div className="modal-header">
            {currentPayType === 'wxpay' || recordData?.get('channelCode') === 'wxpay'
              ? intl.get('spct.paymentConfig.model.authWx').d('授权商户号')
              : intl.get('spct.paymentConfig.model.authToken').d('授权Token')}
          </div>
          <div className="modal-description">
            {currentPayType === 'wxpay' || recordData?.get('channelCode') === 'wxpay'
              ? intl
                  .get('spct.paymentConfig.model.authWxDes')
                  .d('授权给甄云服务商的商户号，打通支付链路的唯一信息。')
              : intl
                  .get('spct.paymentConfig.model.authTokenDes')
                  .d('授权给甄云服务商的token，打通支付链路的唯一信息。')}
          </div>
          <Lov
            name="companyList"
            style={{ width: 340, marginBottom: '24px' }}
            dataSet={this.formDs}
            maxTagCount={4}
            labelLayout="float"
            viewMode="drawer"
          />
          {currentPayType === 'wxpay' || recordData?.get('channelCode') === 'wxpay' ? (
            <>
              <FakePassword name="mchId" />
              <Password
                dataSet={this.formDs}
                name="mchId"
                labelLayout="float"
                style={{ width: 340 }}
              />
            </>
          ) : (
            <>
              <FakePassword name="appAuthToken" />
              <Password
                dataSet={this.formDs}
                name="appAuthToken"
                labelLayout="float"
                style={{ width: 340 }}
              />
            </>
          )}
          <div className="modal-header" style={{ marginBottom: '16px' }}>
            {intl.get('spct.paymentConfig.model.other').d('其他')}
          </div>
          <TextArea
            dataSet={this.formDs}
            name="remark"
            labelLayout="float"
            style={{ width: 340 }}
          />
          <CheckBox
            dataSet={this.formDs}
            name="enabledFlag"
            labelLayout="float"
            style={{ marginTop: '32px' }}
          />
        </div>
      </div>
    );
  }
}
