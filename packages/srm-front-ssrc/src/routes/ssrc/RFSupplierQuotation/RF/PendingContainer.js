import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';

import intl from 'utils/intl';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

export default class PendingContainer extends PureComponent {
  @Bind()
  leftRender(ds) {
    return (
      <MutlTextFieldSearch
        name="multiRfNumOrTitle"
        searchBarDS={ds}
        placeholder={intl.get('ssrc.common.model.common.multiSearchRF').d('请输入RF单号或标题查询')}
        // className={Style.mutlSearch}
      />
    );
  }

  render() {
    const {
      canParticipateDS,
      notResponseDS,
      getColumns,
      custLoading,
      customizeTable,
      custKey,
      resetState,
    } = this.props;
    return (
      <div>
        <SearchBar
          cacheState
          searchCode={`SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_FILTER_BAR`}
          dataSet={[canParticipateDS, notResponseDS]}
          left={{ render: (_, ds) => this.leftRender(ds) }}
          onFieldChange={() => {
            resetState('RF', 'pending', 'pendingAttention');
          }}
          onRefresh={() => {
            resetState('RF', 'pending', 'pendingAttention');
          }}
        />
        <div className="status-header">
          <div className="yellow-block" />
          {intl.get('ssrc.supplierQuotation.model.supplierQuotation.inviteMe').d('邀请我的')}
        </div>
        {customizeTable(
          {
            code: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_PROCESSING`,
            custLoading,
          },
          <Table
            dataSet={notResponseDS}
            columns={getColumns()}
            queryBar="none"
            style={{ maxHeight: 450 }}
          />
        )}

        <div className="status-header">
          <div className="green-block" />
          {intl.get('ssrc.supplierQuotation.model.supplierQuotation.openInquiry').d('公开征询')}
        </div>
        {customizeTable(
          {
            code: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_UN_RESPONSE`,
            custLoading,
          },
          <Table
            dataSet={canParticipateDS}
            columns={getColumns()}
            queryBar="none"
            style={{ maxHeight: 450 }}
          />
        )}
      </div>
    );
  }
}
