import React, { Component, Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

export default class RFXOnGoingContainer extends Component {
  @Bind()
  leftRender(ds) {
    const { getCategoryCode, bidFlag } = this.props;
    return (
      <MutlTextFieldSearch
        name="multiRfxNumOrTitle"
        searchBarDS={ds}
        placeholder={intl
          .get('ssrc.common.model.common.commonMultiSearchRFX', {
            categoryCode: getCategoryCode(bidFlag),
          })
          .d('请输入{categoryCode}单号或标题查询')}
        // className={Style.mutlSearch}
      />
    );
  }

  render() {
    const {
      customizeTable,
      getColumns,
      needDealDS,
      needAttentionDS,
      resetState,
      custKey = '',
      // biddingHallFlag = 0,
      getFilterCreateDataRangeDefaultValue = () => {},
      rfxSearchOnRef = () => {},
    } = this.props;

    return (
      <Fragment>
        <SearchBar
          cacheState
          searchCode={`SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_FILTER`}
          dataSet={[needDealDS, needAttentionDS]}
          left={{ render: (_, ds) => this.leftRender(ds) }}
          onFieldChange={() => {
            resetState('RFQ', 'onGoing', 'onGoingAttention');
          }}
          onRefresh={() => {
            resetState('RFQ', 'onGoing', 'onGoingAttention');
          }}
          fieldProps={{
            approvedDate: {
              defaultValue: getFilterCreateDataRangeDefaultValue(),
            },
          }}
          onRef={(ref) => {
            if (typeof rfxSearchOnRef === 'function') {
              rfxSearchOnRef(ref);
            }
          }}
          // fieldProps={{
          //   displayQuotationStatus: {
          //     lovCode: biddingHallFlag ? 'SSRC.BIDDING_DISPLAY_QUOTATION_STATUS' : '',
          //     // lovPara: { tenantId: organizationId },
          //   },
          // }}
          fieldDefaultValueType="custom"
        />
        <div className="status-header">
          <div className="yellow-block" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.needDeal').d('需要处理')}
        </div>
        {customizeTable(
          { code: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDDEAL` },
          <Table
            queryBar="none"
            dataSet={needDealDS}
            columns={getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}

        <div className="status-header">
          <div className="green-block" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.needAttention').d('需要关注')}
        </div>
        {customizeTable(
          { code: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDATTENTION` },
          <Table
            queryBar="none"
            dataSet={needAttentionDS}
            columns={getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}
      </Fragment>
    );
  }
}
