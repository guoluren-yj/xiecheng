import React, { Component, Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
// import DoubleTabs from '_components/DoubleTabs/index';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';

import { getTableFixSelfAdaptStyle } from '@/utils/utils';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

// import { searchTypes } from '../util';
// import style from '../index.less';

const initActive = {
  active: 'order',
};

export default class RFXContainer extends Component {
  // state = {
  //   active: initActive.active,
  // };

  @Bind()
  handleChange(active) {
    // this.setState({
    //   active,
    // });
    initActive.active = active;
  }

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

  onLoad = () => {
    const { clarifyAnswer, tab, searchParams = {} } = this.props;

    if (tab === 'rfxAll' && this.searchComponent && clarifyAnswer) {
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

    if (tab === 'rfxAll' && this.searchComponent && !isEmpty(searchParams)) {
      Object.keys(searchParams).forEach((key) => {
        const value = searchParams[key];
        const { current: customizeDSCurrent } = this.searchComponent?.customizeDs || {};

        if (key === 'multiRfxNumOrTitle' && value) {
          if (!customizeDSCurrent) {
            this.searchComponent.customizeDs.create({
              [key]: [value],
            });
          }
        }
      });
    }
  };

  // 根据路由设置初始化值
  setMultiTextFieldSearchParams = (ref) => {
    const { routeParamRfxNum } = this.props;

    if (!ref || !ref.customizeDs || !routeParamRfxNum) return;

    if (ref.customizeDs.current) {
      ref.customizeDs.current.set('multiRfxNumOrTitle', [routeParamRfxNum]);
      return;
    }
    ref.customizeDs.create();
    ref.customizeDs.current.set('multiRfxNumOrTitle', [routeParamRfxNum]);
  };

  render() {
    // const { active } = this.state;
    const {
      customizeTable,
      getColumns,
      rfxAllDS,
      resetState,
      custKey,
      onRef,
      rfxSearchOnRef = () => {},
      getFilterCreateDataRangeDefaultValue = () => {},
    } = this.props;
    return (
      <Fragment>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <SearchBar
            cacheState
            searchCode={`SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ALL_FILTER`}
            dataSet={[rfxAllDS]}
            onFieldChange={() => {
              resetState('RFQ', 'rfxAll');
            }}
            onRefresh={() => {
              resetState('RFQ', 'rfxAll');
            }}
            onRef={(ref) => {
              onRef(ref);
              if (typeof rfxSearchOnRef === 'function') {
                rfxSearchOnRef(ref);
              }
              this.searchComponent = ref;
              this.setMultiTextFieldSearchParams(ref);
            }}
            onLoad={this.onLoad}
            left={{ render: (_, ds) => this.leftRender(ds) }}
            fieldProps={{
              approvedDate: {
                defaultValue: getFilterCreateDataRangeDefaultValue(),
              },
            }}
            fieldDefaultValueType="custom"
          />
          <div style={{ flex: 1, overflow: 'auto' }}>
            {customizeTable(
              { code: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.RFXALL_ALL` },
              <Table
                queryBar="none"
                dataSet={rfxAllDS}
                columns={getColumns()}
                // style={{ maxHeight: `calc(100vh - 400px)` }}
                style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
              />
            )}
          </div>
        </div>

        {/* {active === 'detail' &&
          customizeTable(
            { code: 'SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.RFXALL_DETAIL' },
            <Table queryBar="none" dataSet={rfxDetailLineDS} columns={getColumns(false, true)} />
          )} */}
      </Fragment>
    );
  }
}
