import React, { PureComponent, Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

export default class ParticipatoryContainer extends PureComponent {
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
      getColumns,
      onGoingDS,
      custLoading,
      customizeTable,
      attentionDS,
      resetState,
    } = this.props;
    return (
      <Fragment>
        <SearchBar
          cacheState
          searchCode={`SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PARTAKE_FILTER_BAR`}
          dataSet={[onGoingDS, attentionDS]}
          left={{ render: (_, ds) => this.leftRender(ds) }}
          onFieldChange={() => {
            resetState('RF', 'participatory', 'participatoryAttention');
          }}
          onRefresh={() => {
            resetState('RF', 'participatory', 'participatoryAttention');
          }}
        />
        <div className="status-header">
          <div className="yellow-block" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.needDeal').d('需要处理')}
        </div>
        {customizeTable(
          {
            code: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PARTAKE`,
            custLoading,
          },
          <Table
            dataSet={onGoingDS}
            columns={getColumns()}
            queryBar="none"
            style={{ maxHeight: 450 }}
          />
        )}
        <div className="status-header">
          <div className="green-block" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.needAttention').d('需要关注')}
        </div>
        {customizeTable(
          {
            code: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.ATTENTION`,
            custLoading,
          },
          <Table
            dataSet={attentionDS}
            columns={getColumns()}
            queryBar="none"
            style={{ maxHeight: 450 }}
          />
        )}
      </Fragment>
    );
  }
}
