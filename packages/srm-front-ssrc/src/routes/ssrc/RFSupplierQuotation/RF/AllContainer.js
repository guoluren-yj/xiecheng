import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';

export default class ParticipatoryContainer extends PureComponent {
  searchComponent;

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

  onLoad = () => {
    const { clarifyAnswer, tab } = this.props;
    if (tab === 'all' && this.searchComponent && clarifyAnswer) {
      if (
        this.searchComponent?.state?.displayFields.filter((ele) => ele.name === 'clarifyAnswer')
          .length === 0
      ) {
        notification.warning({
          message: intl
            .get(`ssrc.common.view.message.filterMsg`)
            .d('需联系采购方将澄清未读配置为筛选条件后才能进行正常筛选'),
        });
      }
      this.searchComponent.setField('clarifyAnswer', clarifyAnswer);
    }
  };

  // 根据路由设置初始化值
  setMultiTextFieldSearchParams = (ref) => {
    const { routeParamRfNum } = this.props;

    if (!ref || !ref.customizeDs || !routeParamRfNum) return;

    if (ref.customizeDs.current) {
      ref.customizeDs.current.set('multiRfNumOrTitle', [routeParamRfNum]);
      return;
    }
    ref.customizeDs.create();
    ref.customizeDs.current.set('multiRfNumOrTitle', [routeParamRfNum]);
  };

  render() {
    const {
      getColumns,
      allDS,
      customizeTable,
      custLoading,
      custKey,
      resetState,
      onRef,
    } = this.props;
    return customizeTable(
      {
        code: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.ALL`,
        custLoading,
      },
      <SearchBarTable
        cacheState
        searchBarRef={(ref) => {
          onRef(ref);
          this.searchComponent = ref;
          this.setMultiTextFieldSearchParams(ref);
        }}
        searchCode={`SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.ALL_FILTER_BAR`}
        dataSet={allDS}
        searchBarConfig={{
          left: { render: (_, ds) => this.leftRender(ds) },
          onLoad: this.onLoad,
        }}
        // style={{ maxHeight: `calc(100vh - 400px)` }}
        columns={getColumns()}
        onFieldChange={() => {
          resetState('RF', 'all');
        }}
        onRefresh={() => {
          resetState('RF', 'all');
        }}
        style={getTableFixSelfAdaptStyle()?.searchBarTableMaxHeight}
      />
    );
  }
}
