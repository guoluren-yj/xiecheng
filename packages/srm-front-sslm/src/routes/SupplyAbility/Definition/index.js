/**
 * supplyAbility - 供货能力评审
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { Tabs, DataSet, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import queryString from 'querystring';
import { openTab } from 'utils/menuTab';
import { SRM_SSLM } from '_utils/config';
import { dateRender } from 'utils/renderer';
import CommonImport from 'components/Import';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Button as PerButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getResponse,
  getCurrentUserId,
  getCurrentOrganizationId,
  getUserOrganizationId,
} from 'utils/utils';
import withProps from 'utils/withProps';
import SearchBarTable from '_components/SearchBarTable';

import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { submitExpand, abandonExpand } from '@/services/supplyAbilityService';
import { getAbilityListDS, getExpandAbilityDS } from './stores/getIndexDS';

const { TabPane } = Tabs;
const userId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();
const expandCustomizeUnitCode = [
  'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_LIST',
  'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_BASE_INFO',
  'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_CATEGORY_LIST',
];
let expandSearchBarRef; // 拓展中筛选器ref

@formatterCollections({ code: ['sslm.supplyAbility', 'sslm.common'] })
@WithCustomize({
  unitCode: [
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST_TAB',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST.BTN_GROUP',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST_SEARCH_BAR',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_LIST',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_LIST_SEARCH_BAR',
  ],
})
@withProps(
  () => {
    const abilityListDs = new DataSet(getAbilityListDS());
    const expandAbilityDs = new DataSet(getExpandAbilityDS());
    const combinationObj = { activeKey: 'supplyAbility' };
    return { abilityListDs, expandAbilityDs, combinationObj };
  },
  { cacheState: true }
)
@observer
export default class DefinitionList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      optionLoading: false,
      activeKey: this.props.combinationObj.activeKey,
      pageChacheFlag: true, // 拓展供货能清单缓存查询条件
    };
  }

  // 跳转到详情页
  @Bind()
  handleGoDetail(record) {
    const { activeKey } = this.state;
    const { data: { supplyAbilityId, supplyAbilityExpandId } = {} } = record;
    if (activeKey === 'supplyAbility') {
      if (supplyAbilityId) {
        this.props.history.push(`/sslm/supplier-ablility-definition/detail/${supplyAbilityId}`);
      } else {
        this.props.history.push('/sslm/supplier-ablility-definition/create');
      }
    } else {
      this.props.history.push(
        `/sslm/supplier-ablility-definition/expand-detail/${supplyAbilityExpandId}`
      );
    }
  }

  // 供货能力清单定义导入
  @Bind()
  handleImport() {
    openTab({
      key: `/sslm/supplier-ablility-definition/import-component/SSLM_SUPPLY_ABILITY`,
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
      }),
    });
  }

  // tab改变时的回调
  @Bind()
  handleTabChange(key) {
    this.setState({ activeKey: key });
    const { abilityListDs, expandAbilityDs } = this.props;
    this.props.combinationObj.activeKey = key;
    if (key === 'supplyAbility') {
      abilityListDs.query(abilityListDs.currentPage);
    } else {
      expandAbilityDs.query(expandAbilityDs.currentPage);
    }
  }

  // 刷新拓展中数据
  @Bind()
  onRefresh() {
    const { expandAbilityDs } = this.props;
    expandAbilityDs.unSelectAll();
    expandAbilityDs.clearCachedSelected();
    expandAbilityDs.query();
  }

  // 提交审批
  @Bind
  handleSubmit() {
    const { expandAbilityDs } = this.props;
    this.setState({ optionLoading: true });
    const payload = {
      submitList: expandAbilityDs.toJSONData(),
      customizeUnitCode: expandCustomizeUnitCode.join(','),
    };
    submitExpand(payload)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          this.onRefresh();
        }
      })
      .finally(() => {
        this.setState({ optionLoading: false });
      });
  }

  // 废弃回调
  @Bind()
  handldAbandon() {
    const { expandAbilityDs } = this.props;
    this.setState({ optionLoading: true });
    const payload = {
      abandonList: expandAbilityDs.toJSONData(),
      customizeUnitCode: expandCustomizeUnitCode.join(','),
    };
    abandonExpand(payload)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          this.onRefresh();
        }
      })
      .finally(() => {
        this.setState({ optionLoading: false });
      });
  }

  // 拓展中供货能力筛选器左侧渲染
  @Bind()
  renderExpandLeftSearchBar(_, queryDataSet) {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="expandNums"
        placeholder={intl
          .get('sslm.common.modal.sample.multiSelectReqNums')
          .d('请输入申请单号查询')}
      />
    );
  }

  // 拓展中列表查询
  @Bind()
  handleExpandQuery({ params }) {
    const { expandAbilityDs } = this.props;
    const { pageChacheFlag } = this.state;
    if (expandAbilityDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = expandAbilityDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['expandNums'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.expandNums;
      clearParams.expandNums = isEmpty(reqList) ? null : reqList.join(',');
      expandAbilityDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        expandAbilityDs.query(expandAbilityDs.currentPage);
      } else {
        expandAbilityDs.query();
      }
    } else {
      expandSearchBarRef.handleQuery(true);
    }
  }

  // 拓展中筛选器清空、重置回调
  @Bind()
  clearValues() {
    const { expandAbilityDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    expandAbilityDs.queryDataSet?.current.reset();
  }

  // 设置筛选器查询条件参数
  @Bind()
  setSearchBarConfig(activeKey = '') {
    return {
      fieldProps: {
        supplierCompanyId: {
          lovPara: { userId, tenantId: organizationId, asyncCountFlag: 'Y' },
        },
        companyId: {
          lovPara: { organizationId: userOrganizationId },
        },
        itemCategoryIds: {
          lovPara: { enabledFlag: 1, tenantId: organizationId },
          optionsProps: {
            paging: 'server',
          },
        },
      },
      editorProps: {
        itemCategoryIds: {
          tableProps: {
            treeAsync: true,
            onRow: ({ record }) => {
              const nodeProps = {};
              if (record.get('hasChild') === '0') {
                nodeProps.isLeaf = true;
              }
              return nodeProps;
            },
          },
        },
      },
      onFieldChange: props => this.handleFieldChange({ ...props, activeKey }),
    };
  }

  @Bind()
  handleFieldChange({ record, name, value, activeKey }) {
    if (name === 'supplierCompanyId' && value) {
      const { supplierCompanyId, supplierCompanyName } = value;
      record.set('supplierCompanyId', {
        supplierCompanyId,
        supplierCompanyName,
        uniqueKey: supplierCompanyId,
      });
    }
    if (activeKey === 'expandSupplyAbility') {
      this.setState({
        pageChacheFlag: false,
      });
    }
  }

  @Bind()
  renderBtn() {
    const { abilityListDs, expandAbilityDs } = this.props;
    const { activeKey, optionLoading } = this.state;
    const expandSelectedRows = expandAbilityDs.toJSONData();
    switch (activeKey) {
      case 'supplyAbility':
        return [
          <Button icon="add" color="primary" onClick={this.handleGoDetail} data-name="create">
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>,
          <CommonImport
            data-name="batchCreateImport"
            businessObjectTemplateCode="SSLM_SUPPLY_ABILITY"
            prefixPatch={SRM_SSLM}
            refreshButton
            buttonText={intl.get('sslm.common.button.batchCreateImport').d('批量新增导入')}
            buttonTooltip={intl
              .get('sslm.supplyAbility.button.batchCreateImportTip')
              .d('本模板仅支持批量新增供货能力行，不支持更新已有供货能力行')}
            successCallBack={() => {
              abilityListDs.query();
            }}
            buttonProps={{
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.partner.suplier-ability.supply-ability-define.ps.import.model',
                  type: 'button',
                  meaning: '供货能力清单定义-批量导入',
                },
              ],
            }}
          />,
          <CommonImport
            data-name="batchUpdateImport"
            businessObjectTemplateCode="SRM_C_SRM_SSLM_SUPPLY_ABILITY_BATCH_UPDATE"
            prefixPatch={SRM_SSLM}
            refreshButton
            buttonText={intl.get('sslm.common.button.batchUpdateImport').d('批量更新导入')}
            buttonTooltip={intl
              .get('sslm.supplyAbility.definition.button.batchUpdateImportTip')
              .d(
                '请先通过导出模板导出待更新供货能力行的行ID，导入模板将通过行ID进行匹配更新。导入模板内未配置的字段，或模板内配置了但维护的值为空的字段，导入后会将供货能力行上对应字段的值更新为空'
              )}
            successCallBack={() => {
              abilityListDs.query();
            }}
            buttonProps={{
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.partner.suplier-ability.supply-ability-define.api.update_import',
                  type: 'button',
                  meaning: '供货能力清单定义-批量更新导入',
                },
              ],
            }}
          />,
          <PerButton
            data-name="batchImport"
            icon="archive"
            type="c7n-pro"
            funcType="flat"
            onClick={this.handleImport}
            permissionList={[
              {
                code: 'srm.partner.suplier-ability.supply-ability-define.ps.import.old',
                type: 'button',
                meaning: '供货能力清单定义-批量导入',
              },
            ]}
          >
            {intl.get('hzero.common.title.batchImport').d('批量导入')}
          </PerButton>,
        ];
      default:
        return [
          <Button
            icon="check"
            color="primary"
            disabled={isEmpty(expandSelectedRows)}
            loading={optionLoading}
            onClick={this.handleSubmit}
            wait={500}
            waitType="throttle"
          >
            {intl.get('sslm.common.button.submitApproval').d('提交审批')}
          </Button>,
          <Button
            icon="cancel"
            funcType="flat"
            disabled={isEmpty(expandSelectedRows)}
            loading={optionLoading}
            onClick={this.handldAbandon}
            wait={500}
            waitType="throttle"
          >
            {intl.get('sslm.common.button.discard').d('废弃')}
          </Button>,
        ];
    }
  }

  render() {
    const {
      custLoading,
      customizeTable,
      customizeBtnGroup,
      customizeTabPane,
      abilityListDs,
      expandAbilityDs,
    } = this.props;
    const { activeKey } = this.state;
    const abilityColumns = [
      {
        name: 'supplierCompanyNum',
        width: 150,
        renderer: ({ value, record }) => <a onClick={() => this.handleGoDetail(record)}>{value}</a>,
      },
      {
        name: 'supplierCompanyName',
        width: 240,
      },
      {
        name: 'stageDescription',
        width: 110,
      },
      {
        name: 'companyName',
        width: 230,
      },
      {
        name: 'createUserName',
        width: 120,
      },
      {
        width: 110,
        name: 'creationDate',
        renderer: ({ value }) => dateRender(value),
      },
      {
        width: 120,
        name: 'lastUpdateUserName',
      },
      {
        width: 110,
        name: 'lastUpdateDate',
        renderer: ({ value }) => dateRender(value),
      },
    ];
    const expandColumns = [
      {
        name: 'supplyAbilityExpandStatus',
        width: 100,
        renderer: renderStatus,
      },
      {
        name: 'expandNum',
        width: 200,
        renderer: ({ value, record }) => <a onClick={() => this.handleGoDetail(record)}>{value}</a>,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'companyName',
        width: 170,
      },
      {
        name: 'createdUserName',
        width: 110,
      },
      {
        name: 'creationDate',
        width: 110,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'lastUpdatedUserName',
        width: 110,
      },
      {
        name: 'lastUpdateDate',
        width: 110,
        renderer: ({ value }) => dateRender(value),
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.supplyAbility.view.message.title.definition').d('供货能力清单定义')}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST.BTN_GROUP',
            },
            this.renderBtn()
          )}
        </Header>
        <Content>
          {customizeTabPane(
            {
              code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST_TAB',
              __force_record_to_update__: true,
            },
            <Tabs animated={false} activeKey={activeKey} onChange={this.handleTabChange}>
              <TabPane
                key="supplyAbility"
                tab={intl.get('sslm.supplyAbility.view.tab.supplyAbility').d('供货能力清单')}
              >
                <div style={{ height: tableHeight.hasTab }}>
                  {customizeTable(
                    {
                      code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST',
                    },
                    <SearchBarTable
                      cacheState
                      dataSet={abilityListDs}
                      columns={abilityColumns}
                      custLoading={custLoading}
                      style={{ maxHeight: tableMaxHeight.hasTab }}
                      searchCode="SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST_SEARCH_BAR"
                      searchBarConfig={{
                        ...this.setSearchBarConfig(),
                      }}
                    />
                  )}
                </div>
              </TabPane>
              <TabPane
                key="expandSupplyAbility"
                tab={intl
                  .get('sslm.supplyAbility.view.tab.expandSupplyAbility')
                  .d('拓展中供货能力')}
              >
                <div style={{ height: tableHeight.hasTab }}>
                  {customizeTable(
                    {
                      code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_LIST',
                      __force_record_to_update__: true,
                    },
                    <SearchBarTable
                      cacheState
                      columns={expandColumns}
                      dataSet={expandAbilityDs}
                      custLoading={custLoading}
                      searchBarRef={ref => {
                        expandSearchBarRef = ref;
                      }}
                      style={{ maxHeight: tableMaxHeight.hasTab }}
                      searchCode="SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_LIST_SEARCH_BAR"
                      searchBarConfig={{
                        ...this.setSearchBarConfig('expandSupplyAbility'),
                        left: {
                          render: this.renderExpandLeftSearchBar,
                        },
                        onQuery: this.handleExpandQuery,
                        onReset: this.clearValues,
                        onClear: this.clearValues,
                      }}
                    />
                  )}
                </div>
              </TabPane>
            </Tabs>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
