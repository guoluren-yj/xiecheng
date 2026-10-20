import React, { Component, lazy } from 'react';
import { Button as CButton, Tooltip } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import queryString from 'querystring';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import ImportButton from 'components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PermissionButton } from 'components/Permission';

import PriceLib from '@/routes/sagm/PriceLib';
import { protManageBtns } from '@/routes/small/const/uniCode';
import ProtocolSearch from './ProtocolSearch';

const DetailSearch = lazy(() => import('./DetailSearch'));
const ProductSearch = lazy(() => import('./ProductSearch'));
const HistorySearch = lazy(() => import('./HistorySearch'));

const { TabPane } = Tabs;

@formatterCollections({
  code: ['small.mallProtocolManagement', 'small.common', 'sagm.common'],
})
@withCustomize({
  unitCode: [
    protManageBtns.top,
    protManageBtns.detail,
    protManageBtns.product,
    protManageBtns.history,
  ],
})
@connect()
export default class MallProtocolManagement extends Component {
  constructor(props) {
    super(props);
    const { tabKey = 'a' } = queryString.parse(props.location.search.substr(1));
    this.state = {
      activeKey: tabKey,
      defaultActiveKey: tabKey,
    };
  }

  searchForm;

  componentDidMount() {
    this.props.dispatch({ type: 'mallProtocolManagement/fetchBatchCodes' });
  }

  @Bind()
  handleTabChange(key) {
    this.setState(
      {
        activeKey: key,
      },
      () => {
        if (key === 'a' && this.protocolSearch) {
          this.protocolSearch.fetcthProtocolData();
        } else if (key === 'b' && this.detailSearch) {
          this.detailSearch.fetcthProtocolLineData();
        } else if (key === 'c' && this.historySearch) {
          this.historySearch.fetcthProtocolData();
        } else if (key === 'd' && this.productSearch) {
          this.productSearch.fetcthProtocolData();
        }
      }
    );
    // this.props.history.push(`/small/mall-protocol-management/list?tabKey=${key}`);
  }

  @Bind()
  handleHandWorkNew() {
    const {
      history: { push },
    } = this.props;
    push('/small/mall-protocol-management/handwork');
  }

  @Bind()
  handlePricePoor() {
    const {
      history: { push },
    } = this.props;
    PriceLib.create({
      afterSuccess: (data) => {
        push({
          pathname: '/small/mall-protocol-management/handwork',
          search: `?quoteType=price`,
          state: {
            quoteData: data,
          },
        });
      },
    });
  }

  handleImportAgm = () => {
    openTab({
      key: `/sagm/data-import/SMAL.AGREEMENT_ALL`,
      title: 'srm.common.view.agreementImport',
      // title: intl.get('srm.common.view.attributeImport').d('属性导入'),
      search: queryString.stringify({
        action: 'srm.common.view.agreementImport',
        backPath: '/small/mall-protocol-management/list',
      }),
    });
  };

  render() {
    const {
      match: { path = '' },
      customizeBtnGroup,
    } = this.props;
    const { activeKey, defaultActiveKey } = this.state;
    const customizeButtons = [
      {
        name: 'oldImport',
        btnType: 'c7n-pro',
        child: intl.get('srm.common.view.agreementImport').d('导入协议'),
        btnProps: {
          onClick: this.handleImportAgm,
          icon: 'archive',
        },
      },
      {
        name: 'priceLibExport',
        btnComp: () => (
          <Tooltip
            placement="bottom"
            title={intl
              .get('sagm.common.view.message.priceLibExport')
              .d('价格库数据仅包含商城引用的部分')}
          >
            <CButton
              icon="unarchive"
              onClick={() => {
                PriceLib.export(path);
              }}
            >
              {intl.get('sagm.common.view.button.priceLibExport').d('价格库导出')}
            </CButton>
          </Tooltip>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('small.mallProtocolManagement.view.title').d('商城协议管理')}>
          {/* <Button onClick={() => this.handlePricePoor('purchase')}>引用采购协议</Button> */}
          <PermissionButton
            type="c7n-pro"
            icon="plus"
            color="primary"
            permissionList={[
              {
                code: `${path}.button.create`,
                type: 'button',
                meaning: '商城协议-新建',
              },
            ]}
            onClick={this.handleHandWorkNew}
          >
            {intl.get('small.common.model.manualCreateAgm').d('手工创建协议')}
          </PermissionButton>
          <PermissionButton
            type="button"
            icon="plus"
            permissionList={[
              {
                code: `${path}.button.quote-price-library`,
                type: 'button',
                meaning: '商城协议-引用价格库',
              },
            ]}
            onClick={() => this.handlePricePoor()}
          >
            {intl.get('small.common.model.quotePriceLibrary').d('引用价格库')}
          </PermissionButton>
          <ImportButton
            businessObjectTemplateCode="SMAL.AGREEMENT_ALL"
            refreshButton
            buttonText={intl.get('sagm.common.button.agreementImportNew').d('(新)导入协议')}
            prefixPatch="/sagm"
            changeServicePrefix
            buttonProps={{
              icon: 'archive',
              permissionList: [
                {
                  code: `${path}.button.import-new`,
                  type: 'button',
                  meaning: '商城协议-（新）导入',
                },
              ],
            }}
            successCallBack={() => {
              if (activeKey === 'a' && this.protocolSearch) {
                this.protocolSearch.fetcthProtocolData();
              }
            }}
          />
          {customizeBtnGroup(
            {
              code: protManageBtns.top,
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} />
          )}
        </Header>
        <Content>
          <Tabs
            animated={false}
            // activeKey={activeKey}
            defaultActiveKey={defaultActiveKey}
            onChange={(key) => this.handleTabChange(key)}
          >
            <TabPane
              tab={intl.get('small.mallProtocolManagement.model.agreementQuery').d('商城协议查询')}
              key="a"
            >
              <ProtocolSearch
                activeKey={activeKey}
                onRef={(n) => {
                  this.protocolSearch = n;
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.get('small.mallProtocolManagement.model.detailsQuery').d('按明细查询')}
              key="b"
            >
              <DetailSearch
                activeKey={activeKey}
                customizeBtnGroup={customizeBtnGroup}
                path={path}
                onRef={(n) => {
                  this.detailSearch = n;
                }}
              />
            </TabPane>
            <TabPane tab={intl.get('small.common.view.productList').d('商品列表')} key="d">
              <ProductSearch
                activeKey={activeKey}
                customizeBtnGroup={customizeBtnGroup}
                path={path}
                onRef={(n) => {
                  this.productSearch = n;
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.get('small.mallProtocolManagement.model.historyQuery').d('历史版本查询')}
              key="c"
            >
              <HistorySearch
                activeKey={activeKey}
                path={path}
                customizeBtnGroup={customizeBtnGroup}
                onRef={(n) => {
                  this.historySearch = n;
                }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
