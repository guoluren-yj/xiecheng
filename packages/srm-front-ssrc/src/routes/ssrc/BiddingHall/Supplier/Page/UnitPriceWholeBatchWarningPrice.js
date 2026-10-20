import React, { Component } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import { warningDataSet } from '../Stores/formDS';
import WarningPrice from './WarningPrice';

@observer
class UnitPriceWholeBatchWarningPrice extends Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }

    this.warningDS = new DataSet(warningDataSet()); // 警戒价ds
    this.detailLoading = false;

    this.state = {
      detailLoading: false,
    };
  }

  toggleContentLoading = (detailLoading = false) => {
    this.detailLoading = detailLoading;
    this.setState({
      detailLoading,
    });
  };

  render() {
    const {
      headerInfo,
      refreshContent,
      organizationId,
      biddingSupLineCurId,
      rfxLineSupplierId,
      pageReadOnlyFlag,
      totalPriceFlag,
      unitPriceFlag,
      submitQuotationPrice = noop,
      initPage = noop,
      pageLoading,
      pageOperationLoading,
      unitWholeBatchPriceFlag,
      headerDS,
      quotationLineDS,
      getBiddingRemainingQuotationCount,
      remote,
    } = this.props;
    const { detailLoading } = this.state;
    const { displayBiddingSupHeaderStatus } = headerInfo || {};

    let warningPriceShowFlag = false;
    if (unitPriceFlag) {
      warningPriceShowFlag = !pageReadOnlyFlag;
    }

    const comProps = {
      headerDS,
      toggleContentLoading: this.toggleContentLoading,
      totalCount: quotationLineDS?.totalCount,
      detailLoading,
      headerInfo,
      pageReadOnlyFlag,
      warningDS: this.warningDS,
      refreshContent,
      organizationId,
      biddingSupLineCurId,
      rfxLineSupplierId,
      unitPriceFlag,
      totalPriceFlag,
      initPage,
      submitQuotationPrice,
      pageLoading,
      pageOperationLoading,
      warningPriceShowFlag,
      displayBiddingSupHeaderStatus,
      unitWholeBatchPriceFlag,
      getBiddingRemainingQuotationCount,
      remote,
    };

    return <WarningPrice {...comProps} />;
  }
}

export default UnitPriceWholeBatchWarningPrice;
