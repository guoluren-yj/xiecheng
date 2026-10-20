/**
 * 地区定义
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-10-31
 * @copyright HAND ® 2019
 */

import React from 'react';
import { connect } from 'dva';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import queryString from 'query-string';
import { openTab } from 'utils/menuTab';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { Content, Header } from 'components/Page';
// import CommonImport from 'hzero-front/lib/components/Import';
// import { Button as PermissionButton } from 'components/Permission';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import LineData from './components/LineData';
import LazyTree from './components/LazyTree';
import { getIsOldTenant } from '@/services/regionalMappingService';

const TABENUM = {
  lazyTree: 'lazy-tree',
  lineData: 'line-data',
};

@connect(mapStateToProps, mapDispatchToProps)
@formatterCollections({ code: ['hpfm.region', 'smdm.regionalMapping'] })
export default class regional extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curTab: TABENUM.lazyTree,
      isOldTenant: true,
    };
  }

  componentDidMount() {
    getIsOldTenant().then((res) => {
      if (getResponse(res)) {
        if (!isEmpty(res)) {
          this.setState({ isOldTenant: true });
        } else {
          this.setState({ isOldTenant: false });
        }
      }
    });
  }

  @Bind()
  handleTabChange(nextActiveTabKey) {
    this.setState({
      curTab: nextActiveTabKey,
    });
  }

  @Bind()
  regionUpdate(payload) {
    const { regionUpdate } = this.props;
    return regionUpdate({
      ...payload,
    });
  }

  @Bind()
  regionImport() {
    const { regionImport } = this.props;
    regionImport().then(() => {
      this.regionQueryLazyTree();
      this.regionQueryLine();
    });
  }

  @Bind()
  regionQueryLine(payload) {
    const {
      regionQueryLine,
      match: {
        params: { id },
      },
    } = this.props;
    return regionQueryLine({
      ...payload,
      countryId: id,
    });
  }

  @Bind()
  regionQueryLazyTree(payload) {
    const {
      regionQueryLazyTree,
      match: {
        params: { id },
      },
    } = this.props;
    return regionQueryLazyTree({
      ...payload,
      countryId: id,
    });
  }

  /**
   * 批量导入
   */
  @Bind()
  handleImport(code) {
    const retitle = intl.get('smdm.regionalMapping.view.option.regionImport').d('映射地区导入');
    openTab({
      key: `/smdm/regional-mapping/import/${code}`,
      search: queryString.stringify({
        key: `/smdm/regional-mapping/import/${code}`,
        title: retitle,
        action: retitle,
      }),
    });
  }

  @Bind()
  regionQueryDetail(payload) {
    const { regionQueryDetail } = this.props;
    return regionQueryDetail(payload);
  }

  // wrap with countryId

  render() {
    const {
      match,
      // location: { search },
      treeDataSource,
      expandKeys,
      loadingExpandKeys,
      lineDataSource,
      linePagination,
      // regionImportLoading,
      regionUpdateLoading,
      regionQueryLineLoading,
      regionQueryLazyTreeLoading,
      updateModelState,
      searchEsStatus,
    } = this.props;
    // const { access_token: accessToken } = queryString.parse(search.substring(1));
    const { regionUpdate, regionQueryLine, regionQueryLazyTree, regionQueryDetail } = this;
    const { curTab, isOldTenant } = this.state;
    return (
      <>
        <Header
          title={intl.get('smdm.regionalMapping.view.message.title').d('地区映射')}
          backPath="/smdm/regional-mapping/list"
        >
          {/* <Button
            icon="fork"
            type="primary"
            loading={regionImportLoading}
            onClick={this.regionImport}
          >
            {intl.get('smdm.regionalMapping.view.option.refSite').d('引入云级数据')}
          </Button>
          <CommonImport
            prefixPatch="/smdm"
            buttonProps={{
              permissionList: [
                {
                  code: `srm.mdm.region.ps.new.region.import`,
                  type: 'button',
                  meaning: '批量导入-新',
                },
              ],
            }}
            businessObjectTemplateCode="SMDM.REGION_ES"
            buttonText={intl.get('smdm.regionalMapping.view.option.uomImport.new').d('批量导入-新')}
          /> */}
          {/* <PermissionButton
            type="c7n-pro"
            icon="archive"
            onClick={() => this.handleImport('SMDM.REGION_ES')}
            permissionList={[
              {
                code: `srm.mdm.region.ps.region.import`,
                type: 'button',
                meaning: '批量导入',
              },
            ]}
          >
            {intl.get('smdm.regionalMapping.view.option.uomImport').d('批量导入')}
          </PermissionButton> */}
        </Header>
        <Content>
          <Tabs animated={false} activeKey={curTab} onChange={this.handleTabChange}>
            <Tabs.TabPane
              key={TABENUM.lazyTree}
              tab={intl.get('smdm.regionalMapping.view.title.lazyTree').d('树形结构')}
            >
              <LazyTree
                loadData={regionQueryLazyTree}
                queryDetail={regionQueryDetail}
                dataSource={treeDataSource}
                expandKeys={expandKeys}
                loadingExpandKeys={loadingExpandKeys}
                match={match}
                updateRecord={regionUpdate}
                isOldTenant={isOldTenant}
                queryLoading={regionQueryLazyTreeLoading}
                updateLoading={regionUpdateLoading}
                updateModelState={updateModelState}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              key={TABENUM.lineData}
              tab={intl.get('smdm.regionalMapping.view.title.lienData').d('分页结构')}
            >
              <LineData
                searchEsStatus={searchEsStatus}
                match={match}
                dataSource={lineDataSource}
                pagination={linePagination}
                query={regionQueryLine}
                updateRecord={regionUpdate}
                isOldTenant={isOldTenant}
                queryLoading={regionQueryLineLoading}
                updateLoading={regionUpdateLoading}
              />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}

function mapStateToProps({ loading, regionalMapping }) {
  const {
    lineDataSource,
    linePagination,
    treeDataSource,
    expandKeys,
    loadingExpandKeys,
  } = regionalMapping;
  return {
    regionUpdateLoading: loading.effects['regionalMapping/regionUpdate'],
    regionQueryLineLoading: loading.effects['regionalMapping/regionQueryLine'],
    regionImportLoading: loading.effects['regionalMapping/regionImport'],
    // lazyTreeLoading 由组件的state 存储, 应该是可以同时更新多个子组织的
    regionQueryLazyTreeLoading: loading.effects['regionalMapping/regionQueryLazyTree'],
    treeDataSource,
    expandKeys,
    loadingExpandKeys,
    lineDataSource,
    linePagination,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    regionQueryLine(payload) {
      return dispatch({
        type: 'regionalMapping/regionQueryLine',
        payload,
      });
    },

    regionQueryLazyTree(payload) {
      return dispatch({
        type: 'regionalMapping/regionQueryLazyTree',
        payload,
      });
    },

    regionUpdate(payload) {
      return dispatch({
        type: 'regionalMapping/regionUpdate',
        payload,
      });
    },

    regionImport(payload) {
      return dispatch({
        type: 'regionalMapping/regionImport',
        payload,
      });
    },

    searchEsStatus(payload) {
      return dispatch({
        type: 'regionalMapping/searchEsStatus',
        payload,
      });
    },

    updateModelState(payload) {
      return dispatch({
        type: 'regionalMapping/updateState',
        payload,
      });
    },
  };
}
