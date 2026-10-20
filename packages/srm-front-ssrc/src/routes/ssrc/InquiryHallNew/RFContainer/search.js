import moment from 'moment';
import React, { Component } from 'react';
import { Menu, Dropdown } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import { Popover, Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import SVGIcon from '@/routes/components/SvgIcon';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';
import intl from 'utils/intl';
import querystring from 'querystring';
import { filterNullValueObject } from 'utils/utils';

import Style from '../index.less';

const wideSelected = require('@/assets/wide.svg');
const wideUnselected = require('@/assets/wide-black.svg');

@formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.queryRfq', 'ssrc.qualiExam'],
})
export default class Search extends Component {
  constructor(props) {
    super(props);
    const { onRFRef } = props;
    if (isFunction(onRFRef)) {
      onRFRef(this);
    }
  }

  state = {
    mountFlag: true,
  };

  statusMap = {
    RFI: intl.get('ssrc.inquiryHall.model.inquiryHall.RFI').d('信息征询书(RFI)'),
    RFP: intl.get('ssrc.inquiryHall.model.inquiryHall.rfp').d('方案征询书(RFP)'),
    RFQ: intl.get('ssrc.inquiryHall.model.inquiryHall.RFQ').d('报价邀请书(RFQ)'),
  };

  @Bind()
  leftRender(ds) {
    const {
      currentType,
      changeInquiryType = () => {},
      useRFContent = 'ALL',
      useRF = false,
    } = this.props;
    const menu = (
      <Menu>
        {['ALL', 'RFI'].includes(useRFContent) ? (
          <Menu.Item onClick={() => changeInquiryType('RFI')}>
            <span>{intl.get('ssrc.inquiryHall.model.inquiryHall.RFI').d('信息征询书(RFI)')}</span>
          </Menu.Item>
        ) : null}
        {['ALL', 'RFP'].includes(useRFContent) ? (
          <Menu.Item onClick={() => changeInquiryType('RFP')}>
            <span>{intl.get('ssrc.inquiryHall.model.inquiryHall.rfp').d('方案征询书(RFP)')}</span>
          </Menu.Item>
        ) : null}
        <Menu.Item onClick={() => changeInquiryType('RFQ')}>
          <span>{intl.get('ssrc.inquiryHall.model.inquiryHall.RFQ').d('报价邀请书(RFQ)')}</span>
        </Menu.Item>
      </Menu>
    );
    return (
      <React.Fragment>
        {useRF && (
          <Dropdown overlay={menu} placement="bottomCenter" trigger={['click']}>
            <span className={Style.leftSearchBar}>
              {this.statusMap[currentType]}
              <Icon type="expand_more" style={{ marginTop: '-2px' }} />
            </span>
          </Dropdown>
        )}
        <MutlTextFieldSearch
          searchBarDS={ds}
          name="multiRfNumOrTitle"
          placeholder={intl
            .get('ssrc.common.model.common.multiSearchRFI', { currentType })
            .d('请输入{currentType}单号或标题查询')}
          className={useRF ? Style.mutlSearch : Style.noRefMutlSearch}
        />
      </React.Fragment>
    );
  }

  /**
   * 右侧全局平铺聚合
   */
  @Bind()
  rightRender() {
    const { tableDisplay, changeTableDisplay } = this.props;
    return (
      <div className="search">
        <Popover
          content={intl.get('ssrc.inquiryHall.model.inquiryHall.flatTableView').d('平铺表视图')}
        >
          <div
            className={tableDisplay === 'flat' ? 'active' : 'change-table'}
            onClick={() => changeTableDisplay('flat')}
          >
            <Icon
              type="reorder"
              className={tableDisplay === 'flat' ? 'primaryColor' : 'disabled'}
            />
          </div>
        </Popover>
        <Popover
          content={intl
            .get('ssrc.inquiryHall.model.inquiryHall.aggregateTableView')
            .d('聚合表视图')}
        >
          <div
            className={tableDisplay === 'wide' ? 'active' : 'change-table'}
            onClick={() => changeTableDisplay('wide')}
          >
            {tableDisplay !== 'wide' && (
              <img src={wideUnselected} alt="" style={{ fontSize: 16 }} />
            )}
            <SVGIcon
              path={wideSelected}
              style={tableDisplay !== 'wide' ? { visibility: 'hidden' } : { lineHeight: '32px' }}
            />
          </div>
        </Popover>
      </div>
    );
  }

  @Bind()
  getSearch(ref) {
    this.SearchComponent = ref;
  }

  @Bind()
  onQuery({ params }) {
    const { mountFlag } = this.state;
    const {
      allDS,
      finishDS,
      onGoingDS,
      waitPublishDS,
      location,
      changeRFParams,
      getTabsNum,
    } = this.props;
    const { multiRfNumOrTitle, ...others } = params;
    if (mountFlag) {
      const queryParams = querystring.parse(location.search.substr(1));
      if (queryParams.sourceProjectId) {
        this.SearchComponent.setField('sourceProjectId', {
          sourceProjectId: queryParams.sourceProjectId,
          sourceProjectName: queryParams.sourceProjectName,
        });
        this.allSetQueryParameter(
          'advancedData',
          filterNullValueObject({
            ...this.SearchComponent?.getQueryParameter(),
            multiRfNumOrTitle: multiRfNumOrTitle?.length ? multiRfNumOrTitle.join(',') : null,
          })
        );
      } else {
        this.allSetQueryParameter(
          'advancedData',
          filterNullValueObject({
            ...this.SearchComponent?.getQueryParameter(),
            multiRfNumOrTitle: multiRfNumOrTitle?.length ? multiRfNumOrTitle.join(',') : null,
          })
        );
      }
    } else {
      this.allSetQueryParameter(
        'advancedData',
        filterNullValueObject({
          ...others,
          multiRfNumOrTitle: multiRfNumOrTitle?.length ? multiRfNumOrTitle.join(',') : null,
        })
      );
    }
    changeRFParams(
      filterNullValueObject({
        ...others,
        multiRfNumOrTitle: multiRfNumOrTitle?.length ? multiRfNumOrTitle.join(',') : null,
      })
    );
    this.queryCount({ allDS, finishDS, onGoingDS, waitPublishDS, getTabsNum, mountFlag });
    this.setState({ mountFlag: false });
  }

  @Bind()
  queryCount({ allDS, finishDS, onGoingDS, waitPublishDS, getTabsNum, mountFlag }) {
    const getPage = (ds) => (mountFlag ? ds.currentPage || 0 : undefined);
    Promise.all([
      allDS.query(getPage(allDS)),
      finishDS.query(getPage(finishDS)),
      onGoingDS.query(getPage(onGoingDS)),
      waitPublishDS.query(getPage(waitPublishDS)),
    ]).then((props = []) => {
      const tabsNum = {
        toBeReleased: props[3]?.totalElements,
        onGoing: props[2]?.totalElements,
        finished: props[1]?.totalElements,
        all: props[0]?.totalElements,
      };
      getTabsNum(tabsNum);
    });
  }

  @Bind()
  allSetQueryParameter(key, value) {
    const { allDS, finishDS, onGoingDS, waitPublishDS } = this.props;
    allDS.setQueryParameter(key, value);
    finishDS.setQueryParameter(key, value);
    onGoingDS.setQueryParameter(key, value);
    waitPublishDS.setQueryParameter(key, value);
  }

  render() {
    const { currentType, allDS, finishDS, onGoingDS, waitPublishDS, onRef } = this.props;
    return (
      <SearchBar
        onRef={(ref) => {
          this.getSearch(ref);
          onRef(ref);
        }}
        searchCode={`SSRC.INQUIRY_HALL.RF_LIST.${currentType}_FILTER_BAR`}
        dataSet={[allDS, finishDS, onGoingDS, waitPublishDS]}
        onQuery={this.onQuery}
        cacheState
        fieldProps={{
          creationDate: {
            defaultValue: [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')],
          },
        }}
        left={{ render: (_, ds) => this.leftRender(ds) }}
        right={{ render: this.rightRender }}
        fieldDefaultValueType="custom"
      />
    );
  }
}
