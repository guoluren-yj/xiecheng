import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet } from 'choerodon-ui/pro'; // Tooltip
import { SupplierInvoicListDS } from '@/stores/supplier/supplierInvoicDS';
import { getUrlParam } from '@/utils/utils';

import SupplierRecord from './SupplierRecord';

import './index.less';

const organizationId = getCurrentOrganizationId();

@connect(({ supplierInvoicing }) => ({
  supplierInvoicing,
}))
@formatterCollections({ code: ['spfm.supplierInvoic'] })
@observer
class index extends Component {
  constructor(props) {
    super(props);
    const urlParam = getUrlParam();
    const { targetId = '' } = urlParam;

    this.listDS = new DataSet({ ...SupplierInvoicListDS() });
    this.state = {
      isPartial: false,
      targetId,
    };
  }

  componentDidMount() {
    this.listDS.addEventListener('select', this.handleSelect);
    this.listDS.addEventListener('unSelect', this.handleSelect);
    this.listDS.addEventListener('selectAll', this.handleSelect);
    this.listDS.addEventListener('unSelectAll', this.handleSelect);
  }

  componentWillUnmount() {
    this.listDS.removeEventListener('select', this.handleSelect);
    this.listDS.removeEventListener('unSelect', this.handleSelect);
    this.listDS.removeEventListener('selectAll', this.handleSelect);
    this.listDS.removeEventListener('unSelectAll', this.handleSelect);
  }

  @Bind()
  handleSelect() {
    if (this.listDS.selected.length) {
      this.setState({ isPartial: true });
    } else {
      this.setState({ isPartial: false });
    }
  }

  @Bind()
  queryParams() {
    const { isPartial } = this.state;
    const params = this.listDS.queryDataSet.toData();

    let supplierPaymentIdList = '';
    if (isPartial) {
      supplierPaymentIdList = this.listDS.selected.map(record => record.get('supplierPaymentId'));
    }

    const param = filterNullValueObject({ ...params[0] });

    return {
      supplierPaymentIdList,
      ...param,
      allPaymentFlag: true,
    };
  }

  render() {
    const { isPartial, targetId } = this.state;
    let buttonText = intl.get('hzero.common.button.confirm.export').d('导出');
    if (isPartial) {
      buttonText = intl.get('hzero.common.button.exportSelect').d('勾选导出');
    }

    return (
      <>
        <Header title={intl.get('spfm.supplierInvoic.title.paymentRecord').d('缴费记录')}>
          <div className="payment-record-header-button">
            <ExcelExportPro
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
              }}
              requestUrl={`${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/payment-list-export`}
              queryParams={this.queryParams}
              buttonText={buttonText}
            />
          </div>
        </Header>
        <Content>
          <SupplierRecord listDS={this.listDS} targetId={targetId} history={this.props.history} />
        </Content>
      </>
    );
  }
}

export default index;
