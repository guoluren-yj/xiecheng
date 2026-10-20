import React, { Component } from 'react';
import {
  TextField,
  TextArea,
  Select,
  Lov,
  DatePicker,
  DateTimePicker,
  Tooltip,
  Icon,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import FormPro from '../../SagmWorkbench/Comps/FormPro';

const code = 'SAGM.SALE_AGREEMENT.DETAIL.BASE_INFO';

@withCustomize({ unitCode: [code] })
export default class BaseInfo extends Component {
  tips = (
    <Tooltip
      title={
        <div>
          <p>
            {intl
              .get('sagm.common.view.sagmTypeTipOne')
              .d('交易抽佣：面向企业采购场景，生成一张采购订单，销售公司与供应商双方协同')}
          </p>
          <p>
            {intl
              .get('sagm.common.view.sagmTypeTipTwo')
              .d(
                '以销定采：面向企业采购场景，生成两张采购订单，需求公司、销售公司以及供应商三方协同'
              )}
          </p>
          <p>{intl.get('sagm.common.view.sagmTypeTipThree').d('会员协议：面向个人采购场景')}</p>
        </div>
      }
      placement="top"
    >
      <Icon type="help" style={{ fontSize: '14px' }} />
    </Tooltip>
  );

  tips2 = (
    <Tooltip
      title={intl.get('sagm.common.view.showSupplierTypeTip').d('供应商为电商时，只展示原始供应商')}
      placement="top"
    >
      <Icon type="info" style={{ fontSize: '14px' }} />
    </Tooltip>
  );

  // 非领用协议展示
  notReceiveShow = ({ record }) => {
    return (
      record && record.get('agreementHeaderType') && record.get('agreementHeaderType') !== 'RECEIVE'
    );
  };

  // 领用协议展示
  receiveShow = ({ record }) => record && record.get('agreementHeaderType') === 'RECEIVE';

  @Bind
  getFields() {
    const { agreementHeaderId, disabled, onChangeType } = this.props;

    const fields = [
      {
        name: 'agreementHeaderNum', // 1-1
        FormField: TextField,
        disabled: true,
      },
      {
        name: 'agreementHeaderName', // 1-2
        FormField: TextField,
        disabled,
      },
      {
        name: 'agreementHeaderType', // 1-3
        FormField: Select,
        addonAfter: this.tips,
        disabled: agreementHeaderId,
        onChange: onChangeType,
      },
      {
        name: 'proxyCompanyLov',
        label: intl.get('sagm.saleAgreement.view.saleMainBody').d('销售主体'),
        FormField: Lov,
        disabled: agreementHeaderId,
      },
      {
        name: 'showSupplierType',
        label: intl.get('sagm.saleAgreement.model.mallSupplierShow').d('商城供应商展示'),
        FormField: Select,
        disabled: agreementHeaderId,
        // addonAfter: this.tips2,
      },
      {
        name: 'realName',
        label: intl.get('sagm.common.model.createName').d('创建人'),
        FormField: TextField,
        disabled: true,
      },
      {
        name: 'creationDate',
        label: intl.get('sagm.common.model.creationTime').d('创建时间'),
        FormField: DateTimePicker,
        disabled: true,
      },
      {
        name: 'validDateFrom',
        label: intl.get('sagm.common.model.dateFrom').d('有效期从'),
        FormField: DatePicker,
        disabled,
      },
      {
        name: 'validDateTo',
        label: intl.get('sagm.common.model.dateTo').d('有效期至'),
        FormField: DatePicker,
        disabled,
      },
      {
        name: 'inventoryLov',
        FormField: Lov,
        disabled,
        show: this.notReceiveShow,
      },
      {
        name: 'purchaseLov',
        FormField: Lov,
        disabled,
        show: this.notReceiveShow,
      },
      {
        name: 'empty1',
        _type: 'empty',
        show: this.notReceiveShow,
      },
      {
        name: 'saleAgreementInventories',
        show: this.receiveShow,
        maxTagCount: 2,
        _type: 'Lov',
        disabled,
        // maxTagTextLength: 3,
      },
      {
        name: 'autoLabelFlag',
        show: this.receiveShow,
        _type: 'Select',
        disabled,
      },
      {
        name: 'labelLov',
        show: this.receiveShow,
        _type: 'Lov',
        disabled,
      },
      {
        name: 'remark',
        FormField: TextArea,
        resize: 'both',
        row: 4,
        colSpan: 2,
        disabled,
        label: intl.get('sagm.common.model.remark').d('备注'),
      },
    ];

    return fields;
  }

  render() {
    const { formDs, status = 'edit', customizeForm } = this.props;
    const readOnly = status !== 'edit';
    return (
      <FormPro
        dataSet={formDs}
        readOnly={readOnly}
        columns={3}
        style={{ width: '75%' }}
        fields={this.getFields()}
        customizeForm={customizeForm}
        customizeCode={code}
      />
    );
  }
}
