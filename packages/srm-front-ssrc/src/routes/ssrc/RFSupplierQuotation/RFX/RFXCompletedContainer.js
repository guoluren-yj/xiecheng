import React, { Component, Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

export default class RFXCompletedContainer extends Component {
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
      notParDS,
      wonBidDS,
      notWonBidDS,
      resetState,
      custKey,
      getFilterCreateDataRangeDefaultValue = () => {},
      rfxSearchOnRef = () => {},
    } = this.props;
    return (
      <Fragment>
        <SearchBar
          cacheState
          searchCode={`SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_FILTER`}
          dataSet={[notParDS, wonBidDS, notWonBidDS]}
          left={{ render: (_, ds) => this.leftRender(ds) }}
          onFieldChange={() => {
            resetState('RFQ', 'finished');
          }}
          onRefresh={() => {
            resetState('RFQ', 'finished');
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
          fieldDefaultValueType="custom"
        />
        <div className="status-header">
          <div className="yellow-block" />
          {intl.get('ssrc.supplierQuotation.model.supplierQuotation.wonBid').d('已中标')}
        </div>
        {customizeTable(
          { code: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_WONBID` },
          <Table
            queryBar="none"
            dataSet={wonBidDS}
            columns={getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}

        <div className="status-header">
          <div className="green-block" />
          {intl.get('ssrc.supplierQuotation.model.supplierQuotation.notWonBid').d('未中标')}
        </div>
        {customizeTable(
          { code: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_NOTWONBID` },
          <Table
            queryBar="none"
            dataSet={notWonBidDS}
            columns={getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}

        <div className="status-header">
          <div className="green-block" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.others').d('其他')}
        </div>
        {customizeTable(
          { code: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_NOTPAR` },
          <Table
            queryBar="none"
            dataSet={notParDS}
            columns={getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}
      </Fragment>
    );
  }
}
