import React, { Fragment, Component } from 'react';
import { noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Icon } from 'choerodon-ui';
import { Menu, Dropdown, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import moment from 'moment';

import intl from 'utils/intl';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';

import SVGIcon from '@/routes/components/SvgIcon';
import Style from './index.less';

const wideSelected = require('@/assets/wide.svg');
const wideUnselected = require('@/assets/wide-black.svg');

@observer
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.SearchBarRef = {};
    this.state = {
      mountFlag: true,
    };
  }

  statusMap = {
    RFI: intl.get('ssrc.inquiryHall.model.inquiryHall.RFI').d('信息征询书(RFI)'),
    RFP: intl.get('ssrc.inquiryHall.model.inquiryHall.RFP').d('方案邀请书(RFP)'),
    RFQ: intl.get('ssrc.inquiryHall.model.inquiryHall.RFQ').d('报价邀请书(RFQ)'),
  };

  @Bind()
  leftRender(ds) {
    const {
      sourceKey,
      currentType,
      changeInquiryType = noop,
      useRF,
      getCategoryCode,
      useRFContent = 'ALL',
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
            <span>{intl.get('ssrc.inquiryHall.model.inquiryHall.RFP').d('方案邀请书(RFP)')}</span>
          </Menu.Item>
        ) : null}
        <Menu.Item onClick={() => changeInquiryType('RFQ')}>
          <span>{intl.get('ssrc.inquiryHall.model.inquiryHall.RFQ').d('报价邀请书(RFQ)')}</span>
        </Menu.Item>
      </Menu>
    );
    return (
      <Fragment>
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
          name="multiRfxNumOrTitle"
          placeholder={intl
            .get('ssrc.common.model.common.commonMultiSearchRFX', {
              categoryCode: getCategoryCode(sourceKey === 'BID'),
            })
            .d('请输入{categoryCode}单号或标题查询')}
          className={useRF ? Style.mutlSearch : Style.noRefMutlSearch}
        />
      </Fragment>
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
        <Tooltip
          title={intl.get('ssrc.inquiryHall.model.inquiryHall.flatTableView').d('平铺表视图')}
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
        </Tooltip>
        <Tooltip
          title={intl.get('ssrc.inquiryHall.model.inquiryHall.aggregateTableView').d('聚合表视图')}
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
        </Tooltip>
      </div>
    );
  }

  @Bind()
  onQuery(props) {
    const { mountFlag } = this.state;
    const { advancedSearch = noop } = this.props;
    advancedSearch(props, mountFlag);
    this.setState({ mountFlag: false });
  }

  render() {
    const {
      organizationId,
      onRef,
      sourceKey,
      onGoingDealDS,
      approvalDS,
      toBeReleasedDS,
      attentionDS,
      allDS,
      finishInquirySuccessDS,
      finishOthersDS,
      detailAllDS,
      tabStatus,
      bidFlag = false,
      remote,
    } = this.props;

    let searchCode = `SSRC.${sourceKey}_HALL.NEW_LIST.FILTER_BAR`;
    if (tabStatus === 'detailAll') {
      searchCode = `SSRC.${sourceKey}_HALL.NEW_LIST.DETAIL_ALL_FILTER`;
    }

    const preSearchProps = {
      cacheState: true,
      clearButton: true,
      onRef: (ref) => {
        this.SearchBarRef = ref;
        onRef(ref);
      },
      searchCode,
      key: searchCode, // 触发code变化后组件更新
      dataSet: [
        onGoingDealDS,
        approvalDS,
        toBeReleasedDS,
        attentionDS,
        allDS,
        finishInquirySuccessDS,
        finishOthersDS,
        detailAllDS,
      ],
      onQuery: this.onQuery,
      fieldProps: {
        purOrganizationId: {
          lovPara: { organizationId },
        },
        sourceProjectId: {
          lovPara: {
            organizationId,
            sourceFrom: 'RFX',
            secondarySourceCategory: sourceKey === 'BID' ? 'NEW_BID' : null,
          },
        },
        currencyCode: {
          lovPara: { organizationId },
        },
        createdBy: {
          lovPara: { organizationId },
        },
        purchaserId: {
          lovPara: { organizationId },
        },
        itemCategoryid: {
          tenantId: organizationId,
        },
        templateId: {
          lovPara: { sourceCategory: 'RFX', secondarySourceCategory: bidFlag ? 'NEW_BID' : null },
        },
        creationDate: {
          defaultValue: [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')],
        },
      },
      left: {
        render: (_, ds) => this.leftRender(ds),
      },
      right: {
        render: this.rightRender,
      },
      showLoading: false,
      fieldDefaultValueType: 'custom',
    };

    let searchProps = {};
    searchProps = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_ALL_COMMON_SEARCH_PROPS',
          preSearchProps,
          {
            that: this,
          }
        )
      : preSearchProps;
    searchProps = searchProps || {};

    return (
      <SearchBar
        // cacheState
        // clearButton
        // onRef={(ref) => {
        //   this.SearchBarRef = ref;
        //   onRef(ref);
        // }}
        // searchCode={searchCode}
        // key={searchCode} // 触发code变化后组件更新
        // dataSet={[
        //   onGoingDealDS,
        //   approvalDS,
        //   toBeReleasedDS,
        //   attentionDS,
        //   allDS,
        //   finishInquirySuccessDS,
        //   finishOthersDS,
        //   detailAllDS,
        // ]}
        // onQuery={this.onQuery}
        // fieldProps={{
        //   purOrganizationId: {
        //     lovPara: { organizationId },
        //   },
        //   sourceProjectId: {
        //     lovPara: {
        //       organizationId,
        //       sourceFrom: 'RFX',
        //       secondarySourceCategory: sourceKey === 'BID' ? 'NEW_BID' : null,
        //     },
        //   },
        //   currencyCode: {
        //     lovPara: { organizationId },
        //   },
        //   createdBy: {
        //     lovPara: { organizationId },
        //   },
        //   purchaserId: {
        //     lovPara: { organizationId },
        //   },
        //   itemCategoryid: {
        //     tenantId: organizationId,
        //   },
        //   templateId: {
        //     lovPara: { sourceCategory: 'RFX', secondarySourceCategory: bidFlag ? 'NEW_BID' : null },
        //   },
        //   creationDate: {
        //     defaultValue: [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')],
        //   },
        // }}
        // left={{
        //   render: (_, ds) => this.leftRender(ds),
        // }}
        // right={{
        //   render: this.rightRender,
        // }}
        // showLoading={false}
        // fieldDefaultValueType="custom"
        {...searchProps}
      />
    );
  }
}
