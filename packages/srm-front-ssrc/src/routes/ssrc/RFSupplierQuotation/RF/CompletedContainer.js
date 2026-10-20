import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

import intl from 'utils/intl';

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
      custKey,
      resetState,
      suggestedDS,
      unSuggestedDS,
      abandonedDS,
      getColumns,
      custLoading,
      customizeTable,
    } = this.props;
    return (
      <div>
        <SearchBar
          cacheState
          searchCode={`SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_FILTER_BAR`}
          dataSet={[suggestedDS, unSuggestedDS, abandonedDS]}
          onFieldChange={() => {
            resetState('RF', 'completed');
          }}
          onRefresh={() => {
            resetState('RF', 'completed');
          }}
          left={{ render: (_, ds) => this.leftRender(ds) }}
        />

        <div className="status-header">
          <div className="yellow-block" />
          {intl.get('ssrc.supplierQuotation.model.supplierQuotation.selected').d('已入围')}
        </div>
        {customizeTable(
          {
            code: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_SUGGESTED`,
            custLoading,
          },
          <Table
            dataSet={suggestedDS}
            columns={getColumns()}
            queryBar="none"
            style={{ maxHeight: 450 }}
          />
        )}

        <div className="status-header">
          <div className="green-block" />
          {intl.get('ssrc.supplierQuotation.model.supplierQuotation.noSelected').d('未入围')}
        </div>
        {customizeTable(
          {
            code: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_UN_SUGGESTED`,
            custLoading,
          },
          <Table
            dataSet={unSuggestedDS}
            columns={getColumns()}
            queryBar="none"
            style={{ maxHeight: 450 }}
          />
        )}

        <div className="status-header">
          <div className="green-block" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.others').d('其他')}
        </div>
        {customizeTable(
          {
            code: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_ABANDONED`,
            custLoading,
          },
          <Table
            dataSet={abandonedDS}
            columns={getColumns(false)}
            queryBar="none"
            style={{ maxHeight: 450 }}
          />
        )}
      </div>
    );
  }
}
