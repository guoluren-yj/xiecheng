import queryString from 'querystring';
import { DataSet, Tabs, Modal, Tooltip } from 'choerodon-ui/pro'; //
// import { Divider, Radio } from 'choerodon-ui';
import React, { Fragment, useCallback, useState, useEffect, useRef } from 'react'; // useEffect
import { isEmpty, isArray, compose, isFunction } from 'lodash';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
// import { menuTabEventManager } from 'utils/menuTab';
import { listenAfterFreeHandler } from 'hzero-front/lib/utils/menuTab';
import {
  cancelPurchaseByWhole,
  fetchConfig,
  fetchPurchaseLinesClose,
  fetchChangeConfig,
} from '@/services/purchaseRequisitionCancelService';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPRM } from '_utils/config';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
// import PermissionTabs from '@/routes/components/Permission/PermissionDoubleTabs';
import cuxRemote from 'hzero-front/lib/utils/remote';
import CommonImport from 'hzero-front/lib/components/Import';
import { BudgetCheckTable } from '@/routes/components/BudgetCheckTable';
import {
  submit,
  listUrgent,
  listCancelUrgent,
  detailUrgent,
  detailCancelUrgent,
  fetchCounts,
} from '@/services/purchasePlatformService';
import { budgetCheck } from '@/services/purchaseRequisitionCreationService';
import { getPostParams, THROTTLE_TIME } from '@/routes/utils';
import BeforeSubmit from './BeforeSubmit/index';
import UnderApproval from './UnderApproval/index';
import Approved from './Approved/index';
// import styles from './index.less';
import Remark from './../NewPurchaseDetail/components/Remark';
import AllByWhole from './AllByWhole/index';
import AllByExecutionStatus from './AllByExecutionStatus/index';
import ControlByLine from './ControlByLine';

import { listLineDS } from './BeforeSubmit/indexDS';
import { underApprovalDs } from './UnderApproval/indexDS';
import { approvedDs } from './Approved/indexDS';
import { wholeDs } from './AllByWhole/indexDS';
import { controlLineDs } from './ControlByLine/indexDs';
import { byExcutionDs } from './AllByExecutionStatus/indexDS';
import { fetchExecutionLink } from '@/services/purchaseRequisitionAssignmentService';
import { ssrcDirectionSymbolDefaultTab, clearSsrcDirectionSymbol } from './utils';

const { TabPane, TabGroup } = Tabs;

const organizationId = getCurrentOrganizationId();
const messagePrompt = 'sprm.purchaseRequisitionCancel.view.message';
const commonPrompt = 'sprm.common.model.common';

const Index = ({
  dispatch,
  // customizeTabPane,
  lineDs,
  underApprovalLineDs,
  approvedLineDs,
  wholeLineDs,
  byExcutionLineDs,
  controlByLineDs,
  customizeTabPane,
  customizeBtnGroup,
  customizeForm,
  purchaseplatform = {},
  customizeTable,
  location,
  remote,
  getHocInstance,
  custConfig,
}) => {
  const {
    handleDsSetParams,
    handleCreatePr,
    handleLinkOtherUrl,
    handleBeforeSubmit,
    handleCuxSubmit,
    handleCuxClose,
  } = remote?.props?.process || {};
  const DefaultTab = ssrcDirectionSymbolDefaultTab();
  const params = queryString.parse(location.search.substr(1)) || {};
  const { currentType: currentTypeKey } = params;
  const remarkRef = useRef({});
  const [tableDisplay, setTableDisplay] = useState('flat');
  const [isDetailTab, setDetailTab] = useState(purchaseplatform.isDetailTab); // 先展示整单页面tab
  const [wholeType, setWholeType] = useState(
    DefaultTab || currentTypeKey || purchaseplatform.wholeType
  ); // 先展示带分配页签
  const [itemCount, setItemCount] = useState({});
  const [isNewTeant, setIsNewTeant] = useState(false);
  const [isOldUser, setIsOldUser] = useState(false); // 新老执行链路，用于关闭弹窗展示
  const [changeFlags, setChangeFlags] = useState({});
  const [loadings, setLoading] = useState({});

  useEffect(() => {
    const menuTabCloseListener = ({ tabKey }) => {
      if (String(tabKey).includes('/sprm/purchase-platform')) {
        dispatch({
          type: 'purchaseplatform/updateState',
          payload: { initPrFlag: false },
        });
        // menuTabEventManager.off('close', menuTabCloseListener);
      }
    };
    const cuxParams = isFunction(handleDsSetParams)
      ? handleDsSetParams({
        location,
        allDsList: [
          lineDs,
          underApprovalLineDs,
          approvedLineDs,
          wholeLineDs,
          byExcutionLineDs,
          controlByLineDs,
        ],
      })
      : {};
    // eslint-disable-next-line no-console
    console.log(cuxParams);
    // menuTabEventManager.on('close', menuTabCloseListener);
    listenAfterFreeHandler('searchBar', 'close', menuTabCloseListener);
    fetchCounts({ ...(cuxParams || {}), onlyCountLimit: 100 }).then(res => {
      if (res) {
        const itemCountDate = {
          lineDsCount: res?.beforeSubmit,
          underApprovalCount: res?.underApproval,
          approvedDsCount: res?.approved,
          wholeDsCount: res?.allByWhole,
          byExcutionDsCount: res?.allByExecutionStatus,
          cancelLineCount: res?.controlByLine,
        };
        setItemCount(itemCountDate);
      }
      clearSsrcDirectionSymbol();
    });
    // 配置表
    fetchConfig({
      organizationId,
      tenant: getCurrentTenant().tenantNum,
      tenantNum: getCurrentTenant().tenantNum,
    }).then(res => {
      const result = getResponse(res);
      if (result) {
        if (isEmpty(result.content)) {
          setIsNewTeant(true);
        }
      }
    });
    // 业务规则定义
    fetchChangeConfig().then(res => {
      const result = getResponse(res);
      if (result) {
        setChangeFlags(result);
      }
    });
    getExecutionLink();
  }, []);

  const getExecutionLink = () => {
    fetchExecutionLink({ tenantNum: getCurrentTenant().tenantNum }).then(res => {
      const result = getResponse(res);
      if (result && !isEmpty(result.content)) {
        setIsOldUser(true);
      }
    });
  };

  useEffect(() => {
    if (currentTypeKey) {
      setWholeType(currentTypeKey);
    }
  }, [currentTypeKey]);

  // tab切换的回调;
  const handleTabChange = useCallback(key => {
    const tagGroup = ['allByExecutionStatus', 'controlByLine'].includes(key)
      ? 'executeTab'
      : 'wholeTab';
    dispatch({
      type: 'purchaseplatform/updateState',
      payload: { wholeType: key, isDetailTab: tagGroup, initPrFlag: true },
    });
    setDetailTab(tagGroup);
    const currentDs = getCurrentDs(key) || {};
    if (currentDs.getState('initFlag')) {
      currentDs.query(currentDs.currentPage, {}, true);
    }
    return setWholeType(key);
  }, []);

  // 新建页面跳转
  const handleJumpDetail = useCallback(() => {
    // const otherPRSearch=isFunction(handleCreatePr)?handleCreatePr():
    if (isFunction(handleCreatePr)) {
      handleCreatePr({ dispatch, location });
    } else {
      const search = {
        prSourcePlatform: 'SRM',
        newFlag: true,
      };
      dispatch(
        routerRedux.push({
          pathname: '/sprm/purchase-platform/creation-detail',
          search: queryString.stringify(search),
        })
      );
    }
  }, []);

  /**
   * 手动处理提交接口返回数据
   * @param {Object} res
   */
  const handleSubmitResponse = res => {
    const { errorDataVOList, message } = res;
    if (message) {
      notification.error({ message });
      return;
    }
    const errorMsgArray = [];
    if (isArray(errorDataVOList) && !isEmpty(errorDataVOList)) {
      errorDataVOList.forEach(n => {
        errorMsgArray.push(n.message);
      });
      const msgDom = <Fragment>{errorMsgArray?.map(n => <p>{n}</p>)}</Fragment>;
      notification.error({ message: msgDom });
    }
  };

  const handleSubmit = useCallback(async () => {
    const { selected = [] } = lineDs;
    if (isEmpty(selected)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
    } else {
      const prHeaderList = selected?.map(ele => ele.toJSONData());
      const haveFreight =
        prHeaderList
          ?.filter(item => item.freight && item.freight > 0)
          ?.map(item => item.displayPrNum) || [];

      const srmList = prHeaderList?.filter(item => item.prSourcePlatform === 'SRM');
      // 提示信息
      let tipMessage = '';
      if (isFunction(handleCuxSubmit)) {
        const response = await handleCuxSubmit({ prHeaderList });
        if (!response) return false;
      }
      if (haveFreight.length > 0) {
        const prArray = haveFreight.join(',');
        tipMessage = intl
          .get(`sprm.purchaseReqCreation.view.message.preSubmit`, {
            displayPrNum: prArray,
          })
          .d(`采购申请${prArray}的行单价将受运费影响产生变动，确定提交吗？`);
      }

      tipMessage = (
        <div>
          {tipMessage}
          {intl.get(`sprm.common.model.common.confirmSubmit`).d('请确认是否继续提交')}
          {/* <div>
            {intl
              .get(`sprm.common.model.common.budgetCheckSubmit`)
              .d('以下申请行已超预警线或超量占用，请确认是否继续提交？')}
          </div> */}
        </div>
      );

      if (!isEmpty(srmList)) {
        const checkMsg = await budgetCheck(srmList);
        if (checkMsg && !checkMsg.failed) {
          // 预算不足的行
          const failedList = [];

          // 需要检查提示的行
          const checkList = [];

          checkMsg.forEach(header => {
            const lineList = header.prLineList;
            if (!isEmpty(lineList)) {
              lineList.forEach(line => {
                if (line?.failed === '1') {
                  failedList.push({
                    ...line,
                    displayPrNum: header.displayPrNum,
                  });
                } else if (['02', '03'].includes(line.errorStatusCode)) {
                  checkList.push({
                    ...line,
                    displayPrNum: header.displayPrNum,
                  });
                }
              });
            }
          });

          if (!isEmpty(failedList)) {
            const prListStr = failedList
              ?.filter(i => i?.failed === '1')
              ?.map(e => `${e.displayPrNum}|${e.lineNum}`)
              .join(', ');
            const prLineErrors = failedList
              ?.filter(i => i?.failed === '1')
              ?.map(e => e.errorMessage)
              .join(', ');
            notification.error({
              message:
                intl.get(`${commonPrompt}.prNum`).d('采购申请编号') + prListStr + prLineErrors,
            });
            return;
          } else if (!isEmpty(checkList)) {
            // 余额已超过预警线 或者  余额不足，未超过预算允差范围
            Modal.open({
              bodyStyle: { padding: '20px' },
              drawer: true,
              style: { width: '742px' },
              closable: true,
              title: intl.get(`sprm.common.model.common.budgetCheckTip`).d('预算校验提示'),
              border: true,
              children: <BudgetCheckTable data={checkList} tipMessage={tipMessage} />,
              okText: intl.get(`sprm.purchaseReqCreation.view.message.confirmOk`).d('确定'),
              cancelText: intl
                .get(`sprm.purchaseReqCreation.view.message.confirmCancelText`)
                .d('取消'),
              onOk: () => {
                setLoading({ ...loadings, submitLoading: true });
                submit(prHeaderList)
                  .then(res => {
                    if (isArray(res)) {
                      let submitMsg = '';
                      res.forEach(ele => {
                        submitMsg =
                          ele.messageFlag === 1 ? (submitMsg += `${ele.responseMsg}`) : '';
                      });
                      if (submitMsg) {
                        notification.warning({ message: submitMsg });
                      } else {
                        lineDs.unSelectAll();
                        lineDs.clearCachedSelected();
                        notification.success();
                      }
                      lineDs.query();
                    } else if (res?.failed) {
                      handleSubmitResponse(res);
                    } else {
                      lineDs.unSelectAll();
                      lineDs.clearCachedSelected();
                      notification.success();
                    }
                  })
                  .finally(() => {
                    setLoading({ ...loadings, submitLoading: false });
                  });
              },
            });
            return;
          }
        } else {
          notification.error({ message: checkMsg?.message });
          return;
        }
      }

      Modal.confirm({
        bodyStyle: { padding: '20px' },
        children: <p>{tipMessage}</p>,
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        okText: intl.get(`sprm.purchaseReqCreation.view.message.confirmOk`).d('确定'),
        cancelText: intl.get(`sprm.purchaseReqCreation.view.message.confirmCancelText`).d('取消'),
        onOk: async () => {
          setLoading({ ...loadings, submitLoading: true });
          if (typeof handleBeforeSubmit === 'function') {
            const res = await handleBeforeSubmit({ prHeaderList, isBatch: true });
            if (!res) {
              setLoading({ ...loadings, submitLoading: false });
              return false;
            }
          }
          submit(prHeaderList)
            .then(res => {
              if (isArray(res)) {
                let submitMsg = '';
                res.forEach(ele => {
                  submitMsg = ele.messageFlag === 1 ? (submitMsg += `${ele.responseMsg}`) : '';
                });
                if (submitMsg) {
                  notification.warning({ message: submitMsg });
                } else {
                  lineDs.unSelectAll();
                  lineDs.clearCachedSelected();
                  notification.success();
                }
                lineDs.query();
              } else if (res?.failed) {
                handleSubmitResponse(res);
              } else {
                lineDs.unSelectAll();
                lineDs.clearCachedSelected();
                lineDs.query();
              }
            })
            .finally(() => {
              setLoading({ ...loadings, submitLoading: false });
            });
        },
      });
    }
  }, []);

  // 渲染 tabs
  const BtnTab = () => {
    const { cuxDisplayNumStyle, handleRenderMoreAction } = remote?.props?.process || {};
    return (
      <div key="advanced-query-slot">
        {customizeTabPane(
          {
            code: 'SPRM.PURCHASE_PLAFORM.ALL_TAB',
            custLoading: false,
            cascade: true,
            pro: true,
            custDefaultActive: (activeKey, { firstRenderHiddenKeys = [] }) => {
              if (!purchaseplatform.initPrFlag) {
                const otherAcitve = custConfig['SPRM.PURCHASE_PLAFORM.ALL_TAB']?.fields || [];
                const activeCup = otherAcitve
                  ?.filter(e => !firstRenderHiddenKeys.includes(e?.fieldCode))
                  .map(i => i?.fieldCode);
                handleTabChange(
                  activeKey ||
                  (activeCup.includes(purchaseplatform?.wholeType)
                    ? purchaseplatform?.wholeType
                    : activeCup[0])
                );
              } else {
                const setCustTab = getHocInstance?.().cache['SPRM.PURCHASE_PLAFORM.ALL_TAB'];
                const { key } = setCustTab?.activeKey || {};
                if (setCustTab && key && wholeType) {
                  setCustTab.activeKey.key.__default__ = wholeType;
                }
              }
            },
          },
          <Tabs
            keyboard={false}
            activeKey={wholeType}
            getHocInstance={getHocInstance}
            onChange={value => handleTabChange(value)}
            tabPosition="top"
          >
            <TabGroup tab={intl.get('sprm.common.modal.wholeTab').d('整单')} key="wholeTab">
              <TabPane
                tab={
                  <span>
                    {intl.get('sprm.purchasePlatform.title.beforeSubmit').d('待提交')}
                    {/* <strong className="tab-number">{itemCount.lineDsCount}</strong> */}
                  </span>
                }
                count={itemCount.lineDsCount}
                key="beforeSubmit"
              >
                <BeforeSubmit
                  lineDs={lineDs}
                  dispatch={dispatch}
                  location={location}
                  handleDsSetParams={handleDsSetParams}
                  customizeTable={customizeTable}
                  handleLinkOtherUrl={handleLinkOtherUrl}
                  remote={remote}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    {intl.get('sprm.purchasePlatform.title.inApprove').d('审批中')}
                    {/* <strong className="tab-number">{itemCount.underApprovalCount}</strong> */}
                  </span>
                }
                count={itemCount.underApprovalCount}
                key="underApproval"
              >
                <UnderApproval
                  lineDs={underApprovalLineDs}
                  dispatch={dispatch}
                  location={location}
                  customizeTable={customizeTable}
                  handleLinkOtherUrl={handleLinkOtherUrl}
                  remote={remote}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    {intl.get('sprm.purchasePlatform.title.approved').d('已审批')}
                    {/* <strong className="tab-number">{itemCount.approvedDsCount}</strong> */}
                  </span>
                }
                count={itemCount.approvedDsCount}
                key="approved"
              >
                <Approved
                  lineDs={approvedLineDs}
                  dispatch={dispatch}
                  cuxDisplayNumStyle={cuxDisplayNumStyle}
                  isNewTeant={isNewTeant}
                  customizeTable={customizeTable}
                  changeFlags={changeFlags}
                  location={location}
                  handleLinkOtherUrl={handleLinkOtherUrl}
                  remote={remote}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    {intl.get('sprm.purchasePlatform.title.allByWhole').d('整单')}
                    {/* <strong className="tab-number">{itemCount.wholeDsCount}</strong> */}
                  </span>
                }
                count={itemCount.wholeDsCount}
                key="allByWhole"
              >
                <AllByWhole
                  handleRenderMoreAction={handleRenderMoreAction}
                  lineDs={wholeLineDs}
                  dispatch={dispatch}
                  cuxDisplayNumStyle={cuxDisplayNumStyle}
                  location={location}
                  customizeTable={customizeTable}
                  handleLinkOtherUrl={handleLinkOtherUrl}
                  remote={remote}
                />
              </TabPane>
            </TabGroup>
            <TabGroup tab={intl.get('sprm.common.modal.detailTab').d('明细')} key="executeTab">
              <TabPane
                tab={
                  <span>
                    {intl.get('sprm.purchasePlatform.title.AllByExecutionStatus').d('执行状态跟踪')}
                    {/* <strong className="tab-number">{itemCount.byExcutionDsCount}</strong> */}
                  </span>
                }
                count={itemCount.byExcutionDsCount}
                key="allByExecutionStatus"
              >
                <AllByExecutionStatus
                  lineDs={byExcutionLineDs}
                  tableDisplay={tableDisplay}
                  setTableDisplay={setTableDisplay}
                  customizeTable={customizeTable}
                  cuxDisplayNumStyle={cuxDisplayNumStyle}
                  customizeTabPane={customizeTabPane}
                  location={location}
                  handleLinkOtherUrl={handleLinkOtherUrl}
                  remote={remote}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    {intl.get('sprm.purchasePlatform.title.controlByLine').d(`可关闭 / 取消`)}
                    {/* <strong className="tab-number">{itemCount.cancelLineCount}</strong> */}
                  </span>
                }
                count={itemCount.cancelLineCount}
                key="controlByLine"
              >
                <ControlByLine
                  isOldUser={isOldUser}
                  lineDs={controlByLineDs}
                  isNewTeant={isNewTeant}
                  dispatch={dispatch}
                  cuxDisplayNumStyle={cuxDisplayNumStyle}
                  customizeTable={customizeTable}
                  location={location}
                  handleLinkOtherUrl={handleLinkOtherUrl}
                  remote={remote}
                />
              </TabPane>
            </TabGroup>
          </Tabs>
        )}
      </div>
    );
  };

  const handleUrgent = cb => {
    let currentDs = {};
    switch (wholeType) {
      case 'beforeSubmit':
        currentDs = lineDs;
        break;
      case 'underApproval':
        currentDs = underApprovalLineDs;
        break;
      case 'approved':
        currentDs = approvedLineDs;
        break;
      case 'allByWhole':
        currentDs = wholeLineDs;
        break;
      default:
        currentDs = byExcutionLineDs;
    }
    const { selected = [] } = currentDs;
    if (selected.length > 0) {
      const prHeaders = selected?.map(ele => ele.toJSONData());
      return new Promise(resolve => {
        Modal.confirm({
          bodyStyle: { padding: '20px' },
          children: (
            <p>{intl.get(`sodr.sendOrder.view.message.confirmUrgent`).d('是否确认整单加急')}</p>
          ),
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          onOk: () => {
            // setUrgentLoading(true);
            // setLoading({ ...loadings, urgentLoading: true });
            listUrgent(prHeaders)
              .then(res => {
                if (res && !res.failed) {
                  notification.success();
                  currentDs.unSelectAll();
                  currentDs.clearCachedSelected();
                  currentDs.query();
                } else if (res && res.failed) {
                  notification.error({ message: res ? res.message : '' });
                }
              })
              .finally(() => {
                resolve();
                // setLoading({ ...loadings, urgentLoading: false });
                if (isFunction(cb)) {
                  cb();
                }
              });
          },
          onCancel: () => {
            resolve();
            if (isFunction(cb)) {
              cb();
            }
          },
        });
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
      if (isFunction(cb)) {
        cb();
      }
    }
  };

  /**
   *  明细加急
   */
  const handleDetailUrgent = () => {
    let currentDs = {};
    switch (wholeType) {
      case 'allByExecutionStatus':
        currentDs = byExcutionLineDs;
        break;
      //  case 'controlByLine':
      //    currentDs = controlByLineDs;
      //    break;
      default:
        currentDs = byExcutionLineDs;
    }
    const { selected = [] } = currentDs;
    if (selected.length > 0) {
      const prLines = selected?.map(ele => ele.toJSONData());
      Modal.confirm({
        bodyStyle: { padding: '20px' },
        children: (
          <p>{intl.get(`sodr.sendOrder.view.message.confirmDetailUrgent`).d('是否确认加急')}</p>
        ),
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        onOk: () => {
          detailUrgent(prLines).then(res => {
            if (res) {
              notification.success();
              currentDs.unSelectAll();
              currentDs.clearCachedSelected();
              currentDs.query();
            }
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  };

  /**
   * 明细取消加急
   * */
  const handleCancelDetailUrgent = () => {
    let currentDs = {};
    switch (wholeType) {
      case 'allByExecutionStatus':
        currentDs = byExcutionLineDs;
        break;
      // case 'controlByLine':
      //   currentDs = controlByLineDs;
      //   break;
      default:
        currentDs = byExcutionLineDs;
    }
    const { selected = [] } = currentDs;
    if (selected.length > 0) {
      const prLines = selected?.map(ele => ele.toJSONData());
      Modal.confirm({
        bodyStyle: { padding: '20px' },
        children: (
          <p>
            {intl
              .get(`sodr.sendOrder.view.message.confirmCancelDetailUrgent`)
              .d('是否确认取消加急')}
          </p>
        ),
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        onOk: () => {
          detailCancelUrgent(prLines).then(res => {
            if (res) {
              notification.success();
              currentDs.unSelectAll();
              currentDs.clearCachedSelected();
              currentDs.query();
            }
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  };

  const getCurrentDs = currentType => {
    let currentDs = lineDs || {};
    switch (currentType || wholeType) {
      case 'beforeSubmit':
        currentDs = lineDs;
        break;
      case 'underApproval':
        currentDs = underApprovalLineDs;
        break;
      case 'approved':
        currentDs = approvedLineDs;
        break;
      case 'allByWhole':
        currentDs = wholeLineDs;
        break;
      case 'controlByLine':
        currentDs = controlByLineDs;
        break;
      default:
        currentDs = byExcutionLineDs;
        break;
    }
    return currentDs;
  };

  const HeaderBtn = observer(({ currentDs }) => {
    const { selected = [] } = currentDs || {};
    const { handleCuxBtnDom } = remote?.props?.process || {};
    const cuxBtnDom = isFunction(handleCuxBtnDom)
      ? handleCuxBtnDom({ location, currentDs, wholeType })
      : [];
    const headerButtons = [
      {
        name: 'add',
        btnComp: PermissionButton,
        btnProps: {
          icon: 'add',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: handleJumpDetail,
          permissionList: [
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.new`,
              type: 'button',
              meaning: '新建按钮权限',
            },
          ],
        },
        child: intl.get(`sprm.purchasePlatform.view.button.create`).d('新建'),
      },
      {
        name: 'headerImport',
        btnComp: CommonImport,
        btnProps: {
          prefixPatch: '/sprm',
          businessObjectTemplateCode: 'SPRM_PR_WHOLE_ORDER_IMPORT',
          buttonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: `hzero.srm.requirement.prm.pr-platform.button.headerImport`,
                type: 'button',
                meaning: '批量导入-新',
              },
            ],
          },
          buttonText: intl.get(`sprm.purchasePlatform.view.button.headerImport`).d('整单导入'),
        },
        child: intl.get(`sprm.purchasePlatform.view.button.headerImport`).d('整单导入'),
      },
    ];

    // 提交按钮 --- 待提交 tab页
    if (['beforeSubmit'].includes(wholeType) && isDetailTab !== 'executeTab') {
      headerButtons.push({
        name: 'submit',
        btnComp: PermissionButton,
        btnProps: {
          icon: 'check',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleSubmit,
          wait: THROTTLE_TIME,
          loading: loadings.colseLoading || loadings.cancelLoading || loadings.submitLoading,
          disabled: lineDs.selected?.length <= 0,
          permissionList: [
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.submit`,
              type: 'button',
              meaning: '提交按钮权限',
            },
          ],
        },
        child: intl.get(`hzero.common.button.submit`).d('提交'),
      });
    }

    // 导出按钮 --- 已审批和全部页签或者平铺视图的全部页签

    if (
      ['approved', 'allByWhole'].includes(wholeType) ||
      (tableDisplay === 'flat' && isDetailTab === 'executeTab' && wholeType !== 'controlByLine')
    ) {
      let exportCode = '';
      let newExportCode = '';
      let url = '';
      let templateCode = '';
      switch (wholeType) {
        case 'allByWhole':
          url = `${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench-all/export`;
          templateCode = 'SPUC_SPRM_PLATFORM_ALL_EXPORT';
          exportCode = 'hzero.srm.requirement.prm.pr-platform.ps.whole.all.list.export';
          newExportCode = 'hzero.srm.requirement.prm.pr-platform.ps.new.whole.all.list.export';
          break;
        case 'approved':
          url = `${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench-approved/export`;
          templateCode = 'SPUC_SPRM_PLATFORM_APPROVED_EXPORT';
          exportCode = 'hzero.srm.requirement.prm.pr-platform.ps.whole.approved.list.export';
          newExportCode = 'hzero.srm.requirement.prm.pr-platform.ps.new.whole.approved.list.export';
          break;
        default:
          url = `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/execution-status-tracking-tiled/export`;
          templateCode = 'SPUC_SPRM_PLATFORM_LINE_EXPORT';
          exportCode = 'hzero.srm.requirement.prm.pr-platform.ps.detail.all.list.export';
          newExportCode = 'hzero.srm.requirement.prm.pr-platform.ps.new.detail.all.list.export';
          break;
      }

      if (isDetailTab === 'executeTab') {
        url = `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/execution-status-tracking-tiled/export`;
      }

      headerButtons.push({
        name: 'export',
        noNest: true,
        child: text => (
          <ExcelExport
            data-name="export"
            {...{
              requestUrl: url,
              buttonText:
                text ||
                (selected.length > 0
                  ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
                  : intl.get('hzero.common.button.export').d('导出')),
              queryParams: () => getQueryFrom(),
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                permissionList: [
                  {
                    code: exportCode,
                    type: 'button',
                  },
                ],
              },
            }}
          />
        ),
      });

      headerButtons.push({
        name: 'newExport',
        noNest: true,
        child: text => (
          <ExcelExportPro
            data-name="newExport"
            {...{
              templateCode,
              buttonText:
                text ||
                (selected.length > 0
                  ? intl.get('sprm.common.button.exportSelect').d('勾选导出-新')
                  : intl.get('hzero.common.export.new').d('导出-新')),
              requestUrl: `${url}-modeler`,
              method: 'POST',
              allBody: true,
              queryParams: () => getQueryFrom(true),
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                permissionList: [
                  {
                    code: newExportCode,
                    type: 'button',
                  },
                ],
              },
            }}
          />
        ),
      });
    }

    // 加急按钮 --- 整单tab/明细tab
    if (isDetailTab !== 'executeTab') {
      const urgentRender = !isEmpty(selected)
        ? selected.every(ele => Number(ele.get('urgentFlag')) === 1)
        : false;
      const disabledFlag =
        !selected.length ||
        !(
          selected.every(ele => Number(ele.get('urgentFlag')) === 1) ^
          selected.every(ele => Number(ele.get('urgentFlag')) !== 1)
        );
      headerButtons.push({
        name: 'urgent',
        noNest: true,
        btnProps: { onClick: urgentRender ? handleCancelUrgent : handleUrgent },
        child: text => (
          <Tooltip
            title={
              selected.find(ele => Number(ele.get('urgentFlag')) === 1) &&
                selected.find(ele => Number(ele.get('urgentFlag')) !== 1)
                ? intl
                  .get(`sprm.common.message.urgentFlagChoose`)
                  .d('勾选的行既存在有加急标识和未加急标识，请重新勾选数据！')
                : ''
            }
          >
            <PermissionButton
              type="c7n-pro"
              funcType="flat"
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-platform.ps.urgent`,
                  type: 'button',
                  meaning: '整单加急按钮权限',
                },
              ]}
              // loading={loadings.urgentLoading}
              wait={THROTTLE_TIME}
              disabled={disabledFlag}
              onClick={urgentRender ? handleCancelUrgent : handleUrgent}
              icon={urgentRender ? 'flash_off' : 'priority'}
            >
              {text ||
                (urgentRender
                  ? intl.get('sprm.common.view.button.cancelWholeUrgent').d('取消整单加急')
                  : intl.get('sprm.common.view.button.wholeUrgent').d('整单加急'))}
            </PermissionButton>
          </Tooltip>
        ),
      });
    }
    if (isDetailTab === 'executeTab' && wholeType === 'allByExecutionStatus') {
      const urgentRender = !isEmpty(selected)
        ? selected.every(ele => Number(ele.get('urgentFlag')) === 1)
        : false;
      const disabledFlag =
        !selected.length ||
        !(
          selected.every(ele => Number(ele.get('urgentFlag')) === 1) ^
          selected.every(ele => Number(ele.get('urgentFlag')) !== 1)
        );
      headerButtons.push({
        name: 'urgent',
        noNest: true,
        btnProps: { onClick: urgentRender ? handleCancelDetailUrgent : handleDetailUrgent },
        child: text => (
          <Tooltip
            title={
              currentDs.selected.find(ele => Number(ele.get('urgentFlag')) === 1) &&
                currentDs.selected.find(ele => Number(ele.get('urgentFlag')) !== 1)
                ? intl
                  .get(`sprm.common.message.urgentFlagChoose`)
                  .d('勾选的行既存在有加急标识和未加急标识，请重新勾选数据！')
                : ''
            }
          >
            <PermissionButton
              type="c7n-pro"
              funcType="flat"
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-platform.ps.detail.urgent`,
                  type: 'button',
                  meaning: '明细加急按钮权限',
                },
              ]}
              wait={THROTTLE_TIME}
              loading={loadings.urgentLoading}
              disabled={disabledFlag}
              onClick={() => (urgentRender ? handleCancelDetailUrgent() : handleDetailUrgent())}
              icon={urgentRender ? 'flash_off' : 'priority'}
            >
              {text ||
                (urgentRender
                  ? intl.get('sodr.sendOrder.view.button.cancelDetailUrgent').d('取消加急')
                  : intl.get('sodr.sendOrder.view.button.detailUrgent').d('加急'))}
            </PermissionButton>
          </Tooltip>
        ),
      });
    }

    // 取消按钮 --- 按行控制页签
    if (isDetailTab === 'executeTab' && wholeType === 'controlByLine') {
      const cancelDisableFlag = isNewTeant
        ? !selected.every(e => e.get('prLineCancelledFlag') === 1)
        : false;

      headerButtons.push({
        name: 'cancel',
        noNest: true,
        btnProps: { onClick: handleCancelLine },
        child: text => (
          <PermissionButton
            type="c7n-pro"
            funcType="flat"
            icon="cancel"
            permissionList={[
              {
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-line-cancel`,
                type: 'button',
                meaning: '取消',
              },
            ]}
            wait={THROTTLE_TIME}
            loading={loadings.colseLoading || loadings.cancelLoading || loadings.submitLoading}
            disabled={cancelDisableFlag || selected.length === 0}
            onClick={() => {
              handleCancelLine();
            }}
          >
            {text || intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消')}
          </PermissionButton>
        ),
      });
    }

    // 关闭按钮 --- 是新租户并且在按行控制页签
    if (isNewTeant && isDetailTab === 'executeTab' && wholeType === 'controlByLine') {
      const closeDisableFlag = !selected.every(e => e.get('prLineClosedFlag') === 1);
      headerButtons.push({
        name: 'close',
        noNest: true,
        btnProps: { onClick: handleCloseLine },
        child: text => (
          <PermissionButton
            type="c7n-pro"
            funcType="flat"
            icon="not_interested"
            permissionList={[
              {
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-line-close`,
                type: 'button',
                meaning: '关闭',
              },
            ]}
            disabled={closeDisableFlag || selected?.length === 0}
            onClick={() => {
              handleCloseLine();
            }}
            wait={THROTTLE_TIME}
            loading={loadings.colseLoading || loadings.cancelLoading || loadings.submitLoading}
          >
            {text || intl.get(`sprm.purchasePlatform.view.button.close`).d('关闭')}
          </PermissionButton>
        ),
      });
    }
    if (cuxBtnDom.length > 0) {
      headerButtons.push(...cuxBtnDom);
    }

    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SPRM.PURCHASE_PLAFORM.BTNS',
            pro: true,
          },
          <DynamicButtons buttons={headerButtons} />
        )}
      </>
    );
  });

  const handleCancelUrgent = cb => {
    let currentDs = {};
    switch (wholeType) {
      case 'beforeSubmit':
        currentDs = lineDs;
        break;
      case 'underApproval':
        currentDs = underApprovalLineDs;
        break;
      case 'approved':
        currentDs = approvedLineDs;
        break;
      case 'allByWhole':
        currentDs = wholeLineDs;
        break;
      default:
        currentDs = byExcutionLineDs;
    }
    const { selected = [] } = currentDs;
    if (selected.length > 0) {
      const prHeaders = selected?.map(ele => ele.toJSONData());
      return new Promise(resolve => {
        Modal.confirm({
          bodyStyle: { padding: '20px' },
          children: (
            <p>
              {intl
                .get(`sodr.sendOrder.view.message.confirmCancelUrgent`)
                .d('是否确认取消整单加急')}
            </p>
          ),
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          onOk: () => {
            listCancelUrgent(prHeaders)
              .then(res => {
                if (res) {
                  currentDs.unSelectAll();
                  currentDs.clearCachedSelected();
                  notification.success();
                  currentDs.query();
                }
              })
              .finally(() => {
                resolve();
                if (isFunction(cb)) {
                  cb();
                }
              });
          },
          onCancel: () => {
            resolve();
            if (isFunction(cb)) {
              cb();
            }
          },
        });
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
      if (isFunction(cb)) {
        cb();
      }
      return false;
    }
  };

  const handleCancelLine = () => {
    const { selected } = controlByLineDs;
    if (selected.length === 0) {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
      return;
    }
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因'),
      children: (
        <Remark
          required
          ref={remarkRef}
          customizeForm={customizeForm}
          cusCode="SPRM.PURCHASE_PLAFORM.CANCELMODAL"
          remarkLabel={intl
            .get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`)
            .d('取消原因')}
        />
      ),
      drawer: true,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onCancel: () => { },
      onOk: async () => {
        const remarkCurrent = remarkRef.current.saveCurrentData();
        const remarkData = remarkCurrent.toJSONData();
        const [{ cancelledRemark }] = remarkCurrent.toJSONData();
        const validateFlag = await remarkCurrent.validate();
        if (validateFlag) {
          setLoading({ ...loadings, cancelLoading: true });
          cancelPurchaseByWhole(
            selected?.map(ele => {
              return filterNullValueObject({
                ...ele.toJSONData(),
                cancelledRemark,
                ...remarkData[0],
              });
            })
          )
            .then(result => {
              const res = getResponse(result);
              if (res && isArray(res)) {
                let cancelMsg = '';
                res.forEach(ele => {
                  cancelMsg += `${ele.message}\n`;
                });
                if (cancelMsg) {
                  notification.warning({
                    message: cancelMsg,
                    duration: null,
                    style: {
                      'white-space': 'pre-wrap',
                    },
                  });
                } else {
                  controlByLineDs.unSelectAll();
                  controlByLineDs.clearCachedSelected();
                  notification.success();
                }
                controlByLineDs.query();
              } else {
                controlByLineDs.unSelectAll();
                controlByLineDs.clearCachedSelected();
                controlByLineDs.query();
              }
            })
            .finally(() => {
              setLoading({ ...loadings, cancelLoading: false });
            });
        } else {
          return false;
        }
      },

      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {cancelBtn}
        </div>
      ),
      style: { width: 380 },
    });
    // selected.toJSONData();
    // const { selectedRows = [] } = this.state;
    // const { dispatch, form } = this.props;
    // const { cancelledRemark } = form.getFieldsValue();
    // return dispatch({
    //   type: 'purchaseRequisitionCancel/cancelPurchase',
    //   payload: { selectedRows: selectedRows.map((item) => ({ ...item, cancelledRemark })) },
    // }).then((res) => {
    //   if (res) {
    //     this.setState({
    //       selectedRows: [],
    //     });
    //     this.handleSearch();
    //     notification.success();
    //   }
    // });
  };
  const handleCloseLine = () => {
    const { selected } = controlByLineDs;
    if (selected.length === 0) {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
      return;
    }
    const closeModelFunc = () => {
      Modal.open({
        key: Modal.key(),
        title: intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因'),
        children: (
          <Remark
            ref={remarkRef}
            isOldUser={isOldUser}
            customizeForm={customizeForm}
            cusCode="SPRM.PURCHASE_PLAFORM.CLOSEMODAL"
            params={{ prLineIds: selected?.map(e => e.get('prLineId')) }}
            btnType="closedRemark"
            remarkLabel={intl
              .get(`sprm.purchaseRequisitionCancel.view.message.closeReason`)
              .d('关闭原因')}
          />
        ),
        drawer: true,
        closable: true,
        movable: false,
        destroyOnClose: true,
        onCancel: () => { },
        onOk: () => {
          const remarkCurrent = remarkRef.current.saveCurrentData();
          const remarkData = remarkCurrent.toJSONData();
          const [{ cancelledRemark }] = remarkCurrent.toJSONData();
          setLoading({ ...loadings, colseLoading: true });
          fetchPurchaseLinesClose(
            selected?.map(ele => {
              return filterNullValueObject({
                ...ele.toJSONData(),
                closedRemark: cancelledRemark,
                ...remarkData[0],
              });
            })
          )
            .then(result => {
              const res = getResponse(result);
              if (res && !res.failed) {
                const { successCounts, failedCounts } = res;
                notification.success({
                  message: intl
                    .get(`${messagePrompt}.successAndfailed`, { successCounts, failedCounts })
                    .d(`成功了${successCounts}条，失败了${failedCounts}条`),
                });
                controlByLineDs.unSelectAll();
                controlByLineDs.clearCachedSelected();
                controlByLineDs.query();
              }
            })
            .finally(() => {
              setLoading({ ...loadings, colseLoading: false });
            });
        },
        footer: (okBtn, cancelBtn) => (
          <div>
            {okBtn}
            {cancelBtn}
          </div>
        ),
        style: { width: 742 },
      });
    };
    if (isFunction(handleCuxClose)) {
      handleCuxClose(selected, closeModelFunc);
    } else {
      closeModelFunc();
    }
  };

  const getQueryFrom = (flag = false) => {
    let exportDs =
      wholeType === 'allByWhole'
        ? wholeLineDs
        : wholeType === 'approved'
          ? approvedLineDs
          : byExcutionLineDs;
    if (isDetailTab === 'executeTab') {
      exportDs = byExcutionLineDs;
    }
    const { selected = [] } = exportDs || {};
    // const selectedDate = exportDs.selected ? exportDs.selected.map(ele => ele.toJSONData()) : [];
    if (selected.length > 0) {
      const prHeaderIds = selected?.map(ele => ele.get('prHeaderId'));
      if (isDetailTab === 'executeTab') {
        return {
          prLineIds: selected?.map(ele => ele.get('prLineId')),
          ...(exportDs.getState('cuxQueryParams') || {}),
        };
      }
      return { prHeaderIds, ...(exportDs.getState('cuxQueryParams') || {}) };
    } else {
      const queryData =
        exportDs.queryDataSet && exportDs.queryDataSet.current?.toJSONData
          ? exportDs.queryDataSet.current?.toJSONData()
          : {};
      if (isDetailTab === 'executeTab') {
        const currentQueryDate = queryData;
        const newParams = {
          ...queryData,
          tempkey: undefined,
          supplierQueryParamStr: queryData.tempkey,
        };
        // 判断是不是老供应商的默认值查询
        if (
          newParams.supplierQueryParamStr &&
          !newParams.supplierId &&
          !newParams.supplierCompanyId
        ) {
          if (
            !newParams.supplierQueryParamStr.includes(':') &&
            newParams.supplierQueryParamStr.includes('-')
          ) {
            // eslint-disable-next-line prefer-destructuring
            newParams.supplierCompanyId = newParams.supplierQueryParamStr.split('-')[1];
            // eslint-disable-next-line prefer-destructuring
            newParams.supplierId = newParams.supplierQueryParamStr.split('-')[0];
          }
        }
        return getPostParams(
          {
            ...(exportDs.getState('cuxQueryParams') || {}),
            ...(currentQueryDate || {}),
            customizeUnitCode:
              'SPRM.PURCHASE_PLAFORM_EXECUTION.FLATSEARCHBAR,SPRM.PURCHASE_PLAFORM_EXECUTION.LIST',
          },
          'line',
          flag
        );
      } else if (wholeType === 'allByWhole') {
        const currentQueryDate = queryData;
        return getPostParams(
          {
            ...(currentQueryDate || {}),
            ...(exportDs.getState('cuxQueryParams') || {}),
            customizeUnitCode:
              'SPRM.PURCHASE_PLAFORM_ALLBYWHOLE.SEARCHBAR,SPRM.PURCHASE_PLAFORM_ALLBYWHOLE.LIST',
          },
          'header',
          flag
        );
      } else {
        const currentQueryDate = queryData;
        return getPostParams(
          {
            ...(currentQueryDate || {}),
            ...(exportDs.getState('cuxQueryParams') || {}),
            customizeUnitCode:
              'SPRM.PURCHASE_PLAFORM_APPROVED.SEARCHBAR,SPRM.PURCHASE_PLAFORM_APPROVED.LIST',
          },
          'header',
          flag
        );
      }
    }
  };

  useEffect(() => {
    window.purchasePlatformGetCurrentDs = getCurrentDs;
    window.purchasePlatformHandleUrgent = handleUrgent;
    window.purchasePlatformHandleCancelUrgent = handleCancelUrgent;
    return () => {
      window.purchasePlatformGetCurrentDs = undefined;
      window.purchasePlatformHandleUrgent = undefined;
      window.purchasePlatformHandleCancelUrgent = undefined;
    };
  }, [wholeType]);

  return (
    <Fragment>
      <Header title={intl.get('sprm.common.title.purchasePlatform').d('采购申请工作台')}>
        <HeaderBtn currentDs={getCurrentDs() || {}} />
      </Header>
      <Content>{BtnTab()}</Content>
    </Fragment>
  );
};

const hocFuc = com =>
  compose(
    connect(({ purchaseplatform }) => ({
      purchaseplatform,
    })),
    formatterCollections({
      code: [
        'sprm.common',
        'sprm.purchasePlatform',
        'hzero.common',
        'hzero.c7nProUI',
        'entity.company',
        'entity.business',
        'entity.organization',
        'entity.roles',
        'entity.item',
        'entity.supplier',
        'sprm.purchaseRequisitionInquiry',
        'sprm.purchaseReqCreation',
        'sprm.purchaseRequisitionAssign',
        'sprm.purchaseRequisitionCancel',
        'sodr.sendOrder',
      ],
    }),
    withCustomize({
      unitCode: [
        'SPRM.PURCHASE_PLAFORM.ALL_TAB',
        'SPRM.PURCHASE_PLAFORM.BTNS',
        'SPRM.PURCHASE_PLAFORM.CLOSEMODAL',
        'SPRM.PURCHASE_PLAFORM.CANCELMODAL',
        'SPRM.PURCHASE_PLAFORM_EXECUTION.LIST',
        'SPRM.PURCHASE_PLAFORM_BEFORESUBMIT.LIST',
        'SPRM.PURCHASE_PLAFORM_ALLBYWHOLE.LIST',
        'SPRM.PURCHASE_PLAFORM_UNDERAPPROVAL.LIST',
        'SPRM.PURCHASE_PLAFORM_CONTROLBYLINE.LIST',
        'SPRM.PURCHASE_PLAFORM_APPROVED.LIST',
      ],
    }),
    cuxRemote(
      {
        code: 'SPRM_PRPLAT_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
        name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
      },
      {
        process: {
          handleDsSetParams: undefined,
          handleCreatePr: undefined,
          handleLinkOtherUrl: undefined,
          handleBeforeSubmit: undefined,
          handleCuxBtnDom: undefined,
          handleCuxSubmit: undefined,
          handleCuxClose: undefined,
          handleRenderMoreAction: undefined,
          cuxDisplayNumStyle: {},
        },
      }
    ),
    withProps(
      () => {
        const lineDs = new DataSet(listLineDS());
        const underApprovalLineDs = new DataSet(underApprovalDs());
        const approvedLineDs = new DataSet(approvedDs());
        const wholeLineDs = new DataSet(wholeDs());
        const byExcutionLineDs = new DataSet(byExcutionDs());
        const controlByLineDs = new DataSet(controlLineDs());
        return {
          lineDs,
          underApprovalLineDs,
          approvedLineDs,
          wholeLineDs,
          byExcutionLineDs,
          controlByLineDs,
        };
      },
      { cacheState: true }
    )
  )(com);

export default hocFuc(Index);
export { Index, hocFuc };
