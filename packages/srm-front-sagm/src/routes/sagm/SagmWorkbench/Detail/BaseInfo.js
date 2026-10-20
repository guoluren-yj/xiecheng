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
  Spin,
  CheckBox,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import intl from 'utils/intl';
import { agmStatusRenderer, flagRenderer } from '../renderers';
import FormPro from '../Comps/FormPro';

const unitCode = [
  'SAGM.SALE_WORKBENCH.DETAIL.BASE_INFO.READ', // 勿改动顺序
  'SAGM.SALE_WORKBENCH.DETAIL.BASE_INFO.EDIT',
];

@withCustomize({ unitCode })
export default class BaseInfo extends Component {
  componentDidMount() {
    this.initBaseInfo();
  }

  shouldComponentUpdate(nextProps) {
    const { agreementHeaderId } = nextProps;
    const { agreementHeaderId: preAgreementHeaderId, dataSet } = this.props;
    if (
      (preAgreementHeaderId && agreementHeaderId !== preAgreementHeaderId) || // 商品工作台采-领用规则跳转过来
      (!preAgreementHeaderId && agreementHeaderId) // 新建
    ) {
      dataSet.query();
      return true;
    }
    return true;
  }

  initBaseInfo = async () => {
    const { dataSet, agreementHeaderId, readOnly, onFormLoaded } = this.props;
    dataSet.setQueryParameter('customizeUnitCode', readOnly ? unitCode[0] : unitCode[1]);
    if (agreementHeaderId) {
      await dataSet.query();
    } else {
      dataSet.create({});
    }
    if (onFormLoaded) {
      onFormLoaded(true);
    }
  };

  tips = (
    <div>
      <p>
        {intl
          .get('sagm.common.view.sagmTypeTipOne')
          .d('交易抽佣：面向企业采购场景，生成一张采购订单，销售公司与供应商双方协同')}
      </p>
      <p>
        {intl
          .get('sagm.common.view.sagmTypeTipTwo')
          .d('以销定采：面向企业采购场景，生成两张采购订单，需求公司、销售公司以及供应商三方协同')}
      </p>
      <p>{intl.get('sagm.common.view.sagmTypeTipThree').d('会员协议：面向个人采购场景')}</p>
    </div>
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
    const { agreementHeaderId, readOnly: disabled } = this.props;

    const readFields = [
      { name: 'agreementHeaderNum' }, // 1-1
      { name: 'agreementHeaderName' }, // 1-2
      { name: 'agreementHeaderType' }, // 1-3
      { name: 'showSupplierType' }, // 2-1
      { name: 'proxyCompanyLov' }, // 2-2
      {
        name: 'inventoryLov',
        show: this.notReceiveShow, // 2-3
      },
      // {
      //   name: 'saleAgreementInventories', // 2-3
      //   show: this.receiveShow,
      //   maxTagCount: 2,
      //   // maxTagTextLength: 3,
      // },
      { name: 'realName' }, // 3-1
      {
        name: 'purchaseLov', // 3-2
        show: this.notReceiveShow,
      },
      {
        name: 'autoLabelFlag', // 3-2
        renderer: flagRenderer,
        show: this.receiveShow,
      },
      {
        name: 'statusCodeMeaning', // 3-3
        _type: 'Output',
        renderer: p => agmStatusRenderer(p, false),
        show: disabled,
      },
      {
        name: 'creationDate', // 4-1
      },
      {
        name: 'validDate', // 4-2
      },
      {
        name: 'empty1', // 4-3
        _type: 'empty',
        show: this.notReceiveShow,
      },
      {
        name: 'labelLov', // 4-3
        show: this.receiveShow,
      },
      {
        name: 'remark', // 5-1|2
        FormField: TextArea,
        resize: 'both',
        row: 4,
        colSpan: 2,
        disabled,
      },
    ];

    const editFields = [
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
        help: this.tips,
        showHelp: 'tooltip',
        disabled: agreementHeaderId,
      },
      {
        name: 'showSupplierType', // 2-1
        FormField: Select,
        disabled: agreementHeaderId,
        // addonAfter: this.tips2,
      },
      {
        name: 'proxyCompanyLov', // 2-2
        FormField: Lov,
        disabled: agreementHeaderId,
      },
      {
        name: 'inventoryLov', // 2-3
        FormField: Lov,
        disabled,
        show: this.notReceiveShow,
      },
      // {
      //   name: 'saleAgreementInventories', // 2-3
      //   _type: 'Lov',
      //   show: this.receiveShow,
      //   maxTagCount: 2,
      //   // maxTagTextLength: 3,
      // },
      {
        name: 'realName', // 3-1
        FormField: TextField,
        disabled: true,
      },
      {
        name: 'purchaseLov', // 3-2
        FormField: Lov,
        disabled,
        show: this.notReceiveShow,
      },
      {
        name: 'autoLabelFlag', // 3-2
        FormField: CheckBox,
        show: this.receiveShow,
      },
      {
        name: 'empty2', // 3-3
        _type: 'empty',
        show: this.notReceiveShow,
      },
      {
        name: 'labelLov', // 3-3
        _type: 'Lov',
        show: this.receiveShow,
      },
      {
        name: 'creationDate', // 4-1
        FormField: DateTimePicker,
        disabled: true,
      },
      {
        name: 'validDate', // 4-2
        FormField: DatePicker,
        disabled,
      },
      {
        _type: 'empty', // 4-3
        name: 'empty1',
      },
      {
        _type: 'empty', // 5-1
        name: 'empty3',
        show: this.receiveShow,
      },
      {
        name: 'remark', // 5-1|2
        FormField: TextArea,
        resize: 'both',
        row: 4,
        colSpan: 2,
        disabled,
      },
    ];

    return disabled ? readFields : editFields;
  }

  render() {
    const { dataSet, _dataSet, readOnly, customizeForm } = this.props;
    return (
      <Spin dataSet={dataSet}>
        <FormPro
          dataSet={readOnly ? _dataSet : dataSet}
          readOnly={readOnly}
          columns={3}
          fields={this.getFields()}
          customizeForm={customizeForm}
          customizeCode={unitCode[readOnly ? 0 : 1]}
        />
      </Spin>
    );
  }
}
