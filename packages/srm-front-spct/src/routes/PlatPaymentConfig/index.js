import React from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_SPCT } from '@/utils/config';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';

import { tableDS } from './ds';
import ConfigModal from './ConfigModal';
import { saveData } from '@/services/paymentConfigService';

const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['spct.paymentConfig'],
})
export default class PaymentConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  initDs = new DataSet(tableDS());

  configForm;

  @Bind()
  async handleSave() {
    const flag = await this.configForm?.formDs.validate();
    const payNotifyUrl = `${window.$$env?.API_HOST}${SRM_SPCT}/v1/${organizationId}/basepay/pay-new-back`;
    const wxNotifyUrl = `${window.$$env?.API_HOST}${SRM_SPCT}/v1/${organizationId}/basepay/wechat-pay-new-back`;
    const param = this.configForm?.formDs?.current?.toData();
    if (flag) {
      if (this.configForm?.state?.currentPayType === 'wxpay') {
        delete param.appAuthToken;
        param.payNotifyUrl = wxNotifyUrl;
      } else if (this.configForm?.state?.currentPayType === 'alipay') {
        delete param.mchId;
        param.payNotifyUrl = payNotifyUrl;
      }
      const res = getResponse(await saveData({ ...param, enabledFlag: param.enabledFlag ? 1 : 0 }));
      if (res) {
        notification.success();
        this.initDs.query();
      }
    } else {
      return false;
    }
  }

  @Bind()
  editModal(record) {
    c7nModal({
      title: intl.get('spct.paymentConfig.view.editPaymentConfig').d('编辑支付配置'),
      style: { width: '380px' },
      bodyStyle: { padding: 0 },
      onOk: () => this.handleSave(),
      children: <ConfigModal onRef={this.handleRef} recordData={record} />,
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.configForm = ref || {};
  }

  @Bind()
  handleNewData() {
    c7nModal({
      title: intl.get('spct.paymentConfig.view.newPaymentConfig').d('新建支付配置'),
      style: { width: '380px' },
      bodyStyle: { padding: 0 },
      onOk: () => this.handleSave(),
      children: <ConfigModal onRef={this.handleRef} />,
    });
  }

  render() {
    const colorStyle = (value) => {
      if (value) {
        return {
          color: '#47B881',
          backgroundColor: 'rgba(71,184,129,0.10)',
          padding: '2px 4px',
          fontWeight: 600,
          borderRadius: '2px',
        };
      } else {
        return {
          color: '#F56349',
          backgroundColor: 'rgba(245,99,73,0.10)',
          padding: '2px 4px',
          fontWeight: 600,
          borderRadius: '2px',
        }; // 红
      }
    };
    const columns = [
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => {
          return (
            <span style={colorStyle(value)}>
              {value
                ? intl.get('spct.paymentConfig.model.using').d('启用')
                : intl.get('spct.paymentConfig.model.disabled').d('禁用')}
            </span>
          );
        },
      },
      {
        name: 'configCode',
        width: 200,
        renderer: ({ record, value }) => <a onClick={() => this.editModal(record)}>{value}</a>,
      },
      { name: 'configName' },
      { name: 'channelMeaning', width: 100 },
      { name: 'remark', width: 300 },
    ];
    return (
      <>
        <Header title={intl.get('spct.paymentConfig.view.paymentConfig').d('支付配置')}>
          <Button icon="add" color="primary" primary onClick={this.handleNewData}>
            {intl.get('spct.paymentConfig.view.new').d('新建')}
          </Button>
        </Header>
        <Content>
          <SearchBarTable
            dataSet={this.initDs}
            columns={columns}
            searchCode="SPCT.PAYMENT.CONFIG.QUERY"
            customizedCode="SPCT.PAYMENT.CONFIG.SELECT"
            // searchBarConfig={{ closeFilterSelector: true }}
          />
        </Content>
      </>
    );
  }
}
