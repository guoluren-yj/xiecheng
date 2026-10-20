import React, { Component } from 'react';
import { Form, CheckBox, NumberField } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

@observer
class WarningForm extends Component {
  render() {
    const { warningDS, totalPriceFlag } = this.props;
    if (!warningDS) {
      return '';
    }

    return (
      <div>
        <Alert
          message={intl
            .get('ssrc.biddingHall.view.message.warningPriceTips')
            .d('您维护的警戒值仅自己可见，其他人均不可见，请放心维护。')}
          banner
          showIcon
          iconType="help"
          type="info"
          style={{
            color: '#0161D5',
            background: 'rgba(25, 132, 247, 0.10)',
            marginBottom: '16px',
          }}
        />
        <div style={{ padding: '0 20px 20px' }}>
          <Form labelLayout="float" columns={1} dataSet={warningDS}>
            <NumberField name="warnPriceReductionRatio" suffix="%" />
            <NumberField name="warnPriceReductionRange" />
            {!totalPriceFlag ? <CheckBox name="collectionApplyToAllFlag" /> : ''}
          </Form>
        </div>
      </div>
    );
  }
}

export default WarningForm;
