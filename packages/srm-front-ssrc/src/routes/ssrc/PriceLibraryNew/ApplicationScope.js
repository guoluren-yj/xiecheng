import React, { PureComponent } from 'react';
import { DataSet, Table, Switch } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { Button } from 'components/Permission';
// import PermissionProvider from 'components/Permission/PermissionProvider';
// import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { handleEnable } from '@/services/priceLibraryNewService';
import FilterBarTable from '_components/FilterBarTable';
import { renderValidStatu } from './util';
import { operationDS } from './operationDS';
import OprationRecordTimeLIne from './OprationRecordTimeLIne';
import style from './index.less';

const { TabPane } = Tabs;
const { Column } = Table;

export default class ApplicationScope extends PureComponent {
  state = {
    enabledLoading: false, // 启用/禁用loading
  };

  operationDs = new DataSet(operationDS());

  /**
   * 启用/禁用
   */
  @Bind()
  async handleEnable(item, record, enabledFlag) {
    const { viewCode = '' } = this.props;
    let data = [];
    if (item.dimensionCode === 'companyId_ouId_invOrganizationId') {
      // 启用往上
      if (enabledFlag) {
        data = [...this.getParentData(record), { ...record.toData(), enabledFlag }];
      } else {
        // 禁用往下
        data = [...this.getChildrenData(record), { ...record.toData(), enabledFlag }];
      }
    } else {
      data = [{ ...record.toData(), enabledFlag }];
    }
    if (!this.state.enabledLoading) {
      handleEnable({ data, viewCode })
        .then((res) => {
          this.setState({ enabledLoading: true });
          const result = getResponse(res);
          if (result && !result.failed) {
            notification.success();
            this.props.tableDs.query();
          }
        })
        .finally(() =>
          this.setState({
            enabledLoading: false,
          })
        );
    }
  }

  /**
   * 获取parent数据
   */
  @Bind()
  getParentData(record) {
    const params = [];
    const cascadeData = record.parent;
    if (cascadeData) {
      params.push({ ...cascadeData.toData(), enabledFlag: 1 });
      if (!isEmpty(this.getParentData(cascadeData))) {
        params.push(...this.getParentData(cascadeData));
      }
    }
    return params;
  }

  /**
   * 获取children数据
   */
  @Bind()
  getChildrenData(record) {
    const params = [];
    const cascadeData = record.children;
    if (cascadeData && cascadeData.length > 0) {
      cascadeData.forEach((item) => {
        params.push({ ...item.toData(), enabledFlag: 0 });
        if (!isEmpty(this.getChildrenData(item))) {
          params.push(...this.getChildrenData(item));
        }
      });
    }
    return params;
  }

  /**
   * tab 被点击的回调
   */
  @Bind()
  clickTab(newActiveKey) {
    const { priceLibId, tableDs, viewCode = '' } = this.props;
    // 清空上一次查询条件数据
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet.current?.reset();
    // 查询右侧table数据
    tableDs.setQueryParameter('params', { priceLibId, dimensionCode: newActiveKey, viewCode });
    tableDs.query();
  }

  /**
   * 操作记录
   */
  @Bind()
  showOperation(record) {
    this.operationDs.setQueryParameter('queryParams', {
      docType: 'APPLICATION_SCOPE',
      docId: record.toData().scopeLineId,
    });

    this.operationDs.query().then((r) => {
      OprationRecordTimeLIne(
        r.content,
        intl.get('ssrc.priceLibraryNew.model.library.viewScope').d('适用范围')
      );
    });

    // const operateColumns = [
    //   {
    //     name: 'actionName',
    //     width: 120,
    //   },
    //   {
    //     name: 'realName',
    //     width: 150,
    //   },
    //   {
    //     name: 'creationDate',
    //     width: 150,
    //   },
    // ];
  }

  /**
   * 渲染按钮
   */
  @Bind()
  renderButtons(item) {
    return [
      <span>
        {intl.get('ssrc.priceLibraryNew.model.library.joinAll').d('加入全部：')}
        <Switch defaultChecked={item.includeAllFlag} checkedValue={1} unCheckedValue={0} disabled />
      </span>,
    ];
  }

  render() {
    const { tabsData = [], tableDs, templateCode } = this.props;

    return (
      <div className={style['tabs-tab']}>
        <Tabs
          defaultActiveKey={tabsData[0] && tabsData[0].dimensionCode}
          onTabClick={this.clickTab}
          tabPosition="left"
          tabBarStyle={{ padding: '20px 0px' }}
          style={{ height: '100%', overflow: 'auto' }}
        >
          {tabsData.map((item) => {
            return (
              <TabPane tab={item.dimensionName} key={item.dimensionCode}>
                <div className={style['table-wrapper']}>
                  <FilterBarTable
                    mode="tree"
                    dataSet={tableDs}
                    queryFieldsLimit={2}
                    buttons={this.renderButtons(item)}
                    style={{ maxHeight: 'calc(100vh - 200px)' }}
                    filterBarConfig={{
                      collpaseble: true,
                    }}
                  >
                    <Column
                      name="enabledFlag"
                      renderer={({ value }) =>
                        renderValidStatu(
                          value,
                          value === 1
                            ? intl.get('hzero.common.status.enable').d('启用')
                            : intl.get('hzero.common.button.disable').d('禁用')
                        )
                      }
                    />
                    <Column name="dataName" header={item.dimensionName} align="left" />
                    <Column name="dataCode" />
                    <Column
                      header={intl.get('hzero.common.action').d('操作')}
                      renderer={({ record }) => {
                        const btnProps = record.get('enabledFlag')
                          ? {
                            enabledFlag: 0,
                            title: intl.get('hzero.common.button.disable').d('禁用'),
                          }
                          : {
                            enabledFlag: 1,
                            title: intl.get('hzero.common.status.enable').d('启用'),
                          };
                        const { enabledFlag, title } = btnProps;
                        return (
                          <>
                            <Button
                              funcType="link"
                              color="primary"
                              onClick={() => this.handleEnable(item, record, enabledFlag)}
                              wait={500}
                              waitType="debounce"
                              type="c7n-pro"
                              permissionList={[
                                {
                                  code: `${templateCode?.toLocaleLowerCase()}.button.enable`,
                                  type: 'button',
                                  meaning:
                                    intl
                                      .get('ssrc.priceLibraryNew.view.title.priceLibrary')
                                      .d('价格库') - title,
                                },
                              ]}
                            >
                              {title}
                            </Button>
                            <Button
                              style={{ marginLeft: '16px' }}
                              funcType="link"
                              color="primary"
                              type="c7n-pro"
                              onClick={() => this.showOperation(record)}
                            >
                              {intl.get('hzero.common.view.message.operateHistory').d('操作记录')}
                            </Button>
                          </>
                        );
                      }}
                    />
                    {/* <Column
                      header={intl.get('hzero.common.view.message.operateHistory').d('操作记录')}
                      renderer={({ record }) => (
                      )}
                    /> */}
                  </FilterBarTable>
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }
}
