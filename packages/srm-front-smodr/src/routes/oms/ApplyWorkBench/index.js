/* eslint-disable import/no-cycle */
import React, { useEffect, useState, useRef } from 'react';
import { compose, isArray, flatten } from 'lodash';
import { DataSet, notification, Tabs, Form, TextArea } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import { observable } from 'mobx';
import { Observer } from 'mobx-react';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { handleLineCancel, handleBatchSubmit } from '@/services/oms/applyWorkBenchService';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'hzero-front/lib/utils/utils';
import c7nModal from '@/utils/c7nModal';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { Button as PermissionButton } from 'components/Permission';

import { tabList } from './dataSource';
import { tableDs } from './ds';
import SubTable from './subTable';

const { TabPane, TabGroup } = Tabs;

let init = 'waitSubmit';
let group = 'whole';
const organizationId = getCurrentOrganizationId();

const groupDefaultKey = { whole: 'waitSubmit', detail: 'cancel' };

const permissionText = 'srm.mall.tenant.mall-request.workbench.button';

function ApplyWorkBench(props) {
  const actKey = observable.box(init);
  const [tabsCount, setTabsCount] = useState({});
  const [plainDisplayList, setPlainDisplayList] = useState([]);
  const tabLoaded = useRef({});

  const { DSMap, history, customizeTable, customizeTabPane } = props;
  // let plainDisplayList = [];// 过滤之后的tablist 包括整单+明细

  useEffect(() => {
    queryTabsCount();
  }, []);

  useEffect(() => {
    if (plainDisplayList.length) {
      // 详情页返回停留在原tab
      const _key = plainDisplayList.find(f => f.key === init) ? init : plainDisplayList[0].key;
      handleChange(_key);
    }
  }, [plainDisplayList])

  const queryTabsCount = async () => {
    const findSon = tabList().find((f) => f.key === group);
    if (findSon) {
      const sonList = findSon.panes;
      // 已全部查询过，只查当前tab数量
      if (tabLoaded.current[`${group}Loaded`]) {
        const find = sonList.find((f) => f.key === actKey.get());
        if (find) {
          const { queryCount } = find;
          const res = await queryCount();
          if (getResponse(res)) {
            setTabsCount(pre => ({ ...pre, [actKey.get()]: res.totalElements || 0 }));
          }
        }
        return;
      }
      const apis = [];
      sonList.forEach((f) => {
        const { queryCount = (e) => e } = f;
        apis.push(queryCount);
      });
      // 数量查询完毕统一更新数量
      Promise.all(apis.map((api) => api())).then((res) => {
        const _tabsCount = {};
        // 当前tab组下
        sonList.forEach((s, idx) => {
          _tabsCount[s.key] = res[idx]?.totalElements || 0;
        });
        setTabsCount(pre => ({...pre, ..._tabsCount}));
      });
      tabLoaded.current[`${group}Loaded`] = true;
    }
  };

  const query = (ds) => {
    queryTabsCount();
    ds.query(ds.currentPage, null, false);
  };

  const handleChange = key => {
    init = key;
    // 是否被隐藏
    const isDisplay = plainDisplayList.find(i => i.key === key);
    // 当前key所在聚合组
    const groupkey = tabList().find(i => i.panes.find(f => f.key === key));
    group = groupkey.key;
    // 未被隐藏
    if (isDisplay) {
      groupDefaultKey[groupkey.key] = key;
      actKey.set(key);
      queryTabsCount();
      if (DSMap[key].getState('queryStatus') === 'ready') {
        DSMap[key].query(DSMap[key].currentPage);
      }
    } else {
      // 被隐藏
      const displayGroupkey = plainDisplayList.find(i => i.parentKey === groupkey.key);
      if (displayGroupkey) {
        init = displayGroupkey.key;
        groupDefaultKey[displayGroupkey.parentKey] = displayGroupkey.key;
        actKey.set(displayGroupkey.key);
        queryTabsCount();
        if (DSMap[displayGroupkey.key].getState('queryStatus') === 'ready') {
          DSMap[displayGroupkey.key].query(DSMap[displayGroupkey.key].currentPage);
        }
      }
    }
  };

  // 默认激活
  const custTabRender = (
    key = 'waitSubmit',
    {
      firstRenderHiddenKeys: hiddenKeys = [], // 被隐藏的标签维度
      firstRenderHiddenGroupKeys: groupHiddenKeys = [], // 被隐藏的聚合标签维度
    } = {}
  ) => {
    init = key;
    // 过滤出被隐藏的聚合标签和标签 聚合标签隐藏 则里面的标签全部被隐藏
    const list = tabList().filter((item) => !groupHiddenKeys.includes(item.key));
    const displayList = [];
    list.forEach((item) => {
      displayList.push(item.panes.filter((each) => !hiddenKeys.includes(each.key)));
    });

    setPlainDisplayList(flatten(displayList) || []);
  };

  async function handleBatchCancel() {
    const ds = new DataSet({
      autoCreate: true,
      selection: false,
      fields: [{
        name: 'cancelReason',
        label: intl.get('smodr.apply.view.cancelReason').d('取消原因'),
        type: 'string',
        required: true,
      }],
    });
    // 是否包含执行中数据
    const cancelData = DSMap.cancel.selected.filter(i => i.get('canCloseQuantity') > 0) || [];
    c7nModal({
      title: intl.get('smodr.apply.view.cancelReason').d('取消原因'),
      children: (
        <div>
          {DSMap.cancel.selected.length > 1 &&
            DSMap.cancel.selected.some(i => i.get('canCloseQuantity') > 0) && (
              <>
                <div
                  style={{
                    color: '#F46C0E',
                    padding: '10px 20px',
                    background: 'rgba(242,128,26,0.1)',
                    display: 'flex',
                    marginBottom: '20px',
                  }}
                >
                  <Icon
                    type="error"
                    style={{
                      marginRight: '8px',
                      fontSize: '16px',
                      position: 'relative',
                      top: '1px',
                    }}
                  />
                  {intl.get('smodr.apply.view.cancellTips').d(`
              存在申请行状态为【执行中】的数据，仅支持取消未执行部分的申请，是否确认取消？`)}
                </div>
              </>
            )}
          {DSMap.cancel.selected.length === 1 && cancelData.length === 1 && (
            <div
              style={{
                color: '#F46C0E',
                padding: '10px 20px',
                background: 'rgba(242,128,26,0.1)',
                display: 'flex',
                marginBottom: '20px',
              }}
            >
              <Icon
                type="error"
                style={{ marginRight: '8px', fontSize: '16px', position: 'relative', top: '1px' }}
              />
              {intl.get('smodr.apply.view.cancelTipss', {
                value: cancelData[0].get('canCloseQuantity'),
              }).d(`
              申请行状态为【执行中】，仅支持取消未执行部分的申请，未执行部分数量为【${cancelData[0].get(
                'canCloseQuantity'
              )}】，是否确认取消？`)}
            </div>
          )}
          <Form labelLayout="float" dataSet={ds} style={{ margin: '20px 12px' }}>
            <TextArea name="cancelReason" resize='both' />
          </Form>
        </div>
      ),
      style: { width: 380 },
      bodyStyle: { padding: 0 },
      onOk: async () => {
        const flag = await ds.validate();
        const cancelReason = ds.current?.get('cancelReason');
        if (flag) {
          const data = DSMap.cancel.selected.map(i => ({ ...i.toData(), cancelReason }));
          const res = getResponse(await handleLineCancel({ mallRequestEntryViewDTOList: data }));
          if (res) {
            query(DSMap.cancel);
          }
        } else {
          return false;
        }
      },
    });
  }

  async function handleBatSubmit() {
    const data = DSMap.waitSubmit.selected.map(i => i.toData());
    const res = getResponse(await handleBatchSubmit(data));
    if (res && isArray(res)) {
      const messages = res.map(i => i.errorMessage);
      const msgDom = (
        <React.Fragment>
          {messages.map((n) => (
            <p>{n}</p>
          ))}
        </React.Fragment>
      );
      if (messages.find(ele => !!ele)) {
        notification.error({ message: msgDom });
      }
      if (res.every(ele => !ele?.errorMessage)) {
        notification.success({ message: intl.get('smodr.apply.view.submitSuccess').d('提交成功') });
        query(DSMap.waitSubmit);
      }
    }
  }

  const handleParams = (ds, type, option) => {
    if (ds.selected?.length > 0) {
      const data = ds.selected.map(i => i.toData());
      if (type === 'whole') {
        return { requestIdList: data.map(i => i.requestId) };
      } else {
        return { requestEntryIdList: data.map(i => i.requestEntryId) };
      }
    } else {
      const params =
        (ds.queryDataSet?.current && ds.queryDataSet?.current?.toJSONData()) || {};
      const requestCodes = ds.getQueryParameter('requestCodes');
      const requestCodeLines = ds.getQueryParameter('requestCodeLines');
      delete params.__dirty;
      delete params.__id;
      delete params._status;
      return {
        tenantId: organizationId,
        requestCodes,
        requestCodeLines,
        customizeUnitCode: `${option.customizedTableCode},${option.searchCode}`,
        ...filterNullValueObject(params),
        ...option.params,
      };
    }

  };

  const ExportBtnProWhole = observer(({ ds, options }) => {
    const option = options.find(i => i.key === actKey.get());
    const temCode = 'SRM_C_STANDARD_S2FUL_MALL_REQUEST_HEADER';
    const code = `${permissionText}.export.whole`;
    return (
      <ExcelExportPro
        name="newExport"
        method='POST'
        allBody
        templateCode={temCode}
        buttonText={ds?.selected?.length > 0 ?
          intl.get('smodr.apply.view.checkExportNew').d('(新)勾选导出') :
          intl.get('smodr.apply.view.exportNew').d('(新)导出')}
        exportAsync
        otherButtonProps={{
          funcType: 'flat',
          icon: 'unarchive',
          permissionList: [
            {
              code,
              type: 'button',
              meaning:
                intl.get('smodr.apply.view.title').d('商城申请工作台') -
                intl.get('smodr.apply.view.exPermissionWholeNew').d('整单导出按钮'),
            },
          ],
        }}
        requestUrl={`${option.queryUrl}-export`}
        queryParams={
          () => handleParams(ds, 'whole', option)
        }
      />
    );
  });
  const ExportBtnProDetail = observer(({ ds, options }) => {
    const option = options.find(i => i.key === actKey.get());
    const temCode = 'SRM_C_STANDARD_S2FUL_MALL_REQUEST_DETAIL';
    const code = `${permissionText}.export.detail`;
    return (
      <ExcelExportPro
        name="newExport"
        method='POST'
        allBody
        templateCode={temCode}
        buttonText={ds?.selected?.length > 0 ?
          intl.get('smodr.apply.view.checkExportNew').d('(新)勾选导出') :
          intl.get('smodr.apply.view.exportNew').d('(新)导出')}
        exportAsync
        otherButtonProps={{
          funcType: 'flat',
          icon: 'unarchive',
          permissionList: [
            {
              code,
              type: 'button',
              meaning:
                intl.get('smodr.apply.view.title').d('商城申请工作台') -
                intl.get('smodr.apply.view.exPermissionDetailNew').d('明细导出按钮'),
            },
          ],
        }}
        requestUrl={`${option.queryUrl}-export`}
        queryParams={
          () => handleParams(ds, 'detail', option)
        }
      />
    );
  });

  return (
    <>
      <Header title={intl.get('smodr.apply.view.title').d('商城申请工作台')}>
        <Observer>
          {() => {
            return [
              ['waitSubmit'].includes(actKey.get()) && (
                <PermissionButton
                  type="c7n-pro"
                  icon="check_circle"
                  color="primary"
                  disabled={DSMap.waitSubmit.selected.length === 0}
                  onClick={() => handleBatSubmit()}
                  wait={1000}
                  waitType="throttle"
                  permissionList={[
                    {
                      code: `${permissionText}.submit.whole`,
                      type: 'button',
                      meaning:
                        intl.get('smodr.apply.view.title').d('商城申请工作台') -
                        intl.get('smodr.apply.view.permissionSubmit').d('整单提交按钮'),
                    },
                  ]}
                >
                  {intl.get('smodr.apply.view.submit').d('提交')}
                </PermissionButton>
              ),
              ['cancel'].includes(actKey.get()) && (
                <PermissionButton
                  type="c7n-pro"
                  icon="cancel"
                  funcType="flat"
                  disabled={
                    DSMap.cancel.selected.length === 0 ||
                    // 不可取消的执行中数据
                    DSMap.cancel.selected.find(
                      r =>
                        r.get('lineStatus') === 'CONVERSION_PROCESSING' &&
                        r.get('canCloseQuantity') === 0
                    )
                  }
                  onClick={() => handleBatchCancel()}
                  permissionList={[
                    {
                      code: `${permissionText}.cancel.detail`,
                      type: 'button',
                      meaning:
                        intl.get('smodr.apply.view.title').d('商城申请工作台') -
                        intl.get('smodr.apply.view.permissionLineCancel').d('明细取消按钮'),
                    },
                  ]}
                >
                  {intl.get('smodr.apply.view.cancel').d('取消')}
                </PermissionButton>
              ),
              ['waitSubmit', 'approving', 'waitDone', 'wholeAll'].includes(actKey.get()) ? (
                <ExportBtnProWhole
                  ds={DSMap[actKey.get()]}
                  options={
                    tabList().find(i => i.panes.find(l => l.key === actKey.get())).panes || []
                  }
                />
              ) : (
                <ExportBtnProDetail
                  ds={DSMap[actKey.get()]}
                  options={
                    tabList().find(i => i.panes.find(l => l.key === actKey.get())).panes || []
                  }
                />
              ),
            ];
          }}
        </Observer>
      </Header>
      <Content>
        <Observer>
          {() => {
            return customizeTabPane(
              {
                code: 'SMODR.REQUEST.TABLE.APPLY.WORKBENCH.LABEL',
                cascade: true,
                custDefaultActive: custTabRender,
              },
              <Tabs onChange={key => handleChange(key)} activeKey={actKey.get()}>
                {tabList().map(item => {
                  return (
                    <TabGroup tab={item.tab} key={item.key} defaultActiveKey={groupDefaultKey[item.key]}>
                      {item.panes.map(pane => {
                        return (
                          <TabPane tab={pane.tab} key={pane.key} count={tabsCount[pane.key]}>
                            <SubTable
                              parentKey={item.key}
                              subKey={pane.key}
                              singleConfig={pane}
                              ds={DSMap[pane.key]}
                              history={history}
                              customizeTable={customizeTable}
                            />
                          </TabPane>
                        );
                      })}
                    </TabGroup>
                  );
                })}
              </Tabs>
            );
          }}
        </Observer>
      </Content>
    </>
  );
}

export default compose(
  withRouter,
  withCustomize({
    unitCode: [
      'SMODR.REQUEST.TABLE.REQUEST.WHOLE',
      'SMODR.REQUEST.TABLE.REQUEST.DETAIL',
      'SMODR.REQUEST.TABLE.APPLY.WORKBENCH.LABEL',
      'SMODR.REQUEST.TABLE.CANCEL',
      'SMODR.REQUEST.TABLE.EXECUTE',
    ],
  }),
  formatterCollections({
    code: ['smodr.apply', 'smodr.common', 'smodr.orderLine'],
  }),
  withProps(
    () => {
      const DSMap = {};
      tabList().forEach(tab => {
        const { panes } = tab;
        panes.forEach(pane => {
          DSMap[pane.key] = new DataSet(tableDs(pane.key, tab.key, pane, DSMap));
        });
      });
      return { DSMap };
    },
    {
      cacheState: true,
    }
  )
)(ApplyWorkBench);
