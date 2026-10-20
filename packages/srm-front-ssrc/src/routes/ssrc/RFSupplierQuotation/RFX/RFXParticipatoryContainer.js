import React, { Component, Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

export default class RFXParticipatoryContainer extends Component {
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
      />
    );
  }

  render() {
    const {
      customizeTable,
      getColumns,
      invitationDS,
      openInquiryDS,
      resetState,
      custKey,
      sourceCategoryName,
      getFilterCreateDataRangeDefaultValue = () => {},
      rfxSearchOnRef = () => {},
    } = this.props;
    return (
      <Fragment>
        <SearchBar
          cacheState
          searchCode={`SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_FILTER`}
          dataSet={[invitationDS, openInquiryDS]}
          left={{ render: (_, ds) => this.leftRender(ds) }}
          onFieldChange={() => {
            resetState('RFQ', 'notParticipate', 'notParticipateAttention');
          }}
          onRefresh={() => {
            resetState('RFQ', 'notParticipate', 'notParticipateAttention');
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
          {intl.get('ssrc.supplierQuotation.model.supplierQuotation.inviteMe').d('邀请我的')}
        </div>
        {customizeTable(
          { code: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_INVITEME` },
          <Table
            queryBar="none"
            dataSet={invitationDS}
            columns={getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}

        <div className="status-header">
          <div className="green-block" />
          {intl
            .get('ssrc.supplierQuotation.model.supplierQuotation.commonOpenInquiry', {
              sourceCategoryName,
            })
            .d('公开{sourceCategoryName}')}
        </div>
        {customizeTable(
          { code: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_OPENINQUIRY` },
          <Table
            queryBar="none"
            dataSet={openInquiryDS}
            columns={getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}
      </Fragment>
    );
  }
}
