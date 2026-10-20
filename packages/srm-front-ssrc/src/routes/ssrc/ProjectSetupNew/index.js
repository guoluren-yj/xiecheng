/**
 * 寻源立项工作台
 * @date: 2021-01-26
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component, Fragment } from 'react';
import { Icon, Badge } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import {
  DataSet,
  Button,
  // TextField,
  Tabs,
  Modal as C7nProModal,
  Lov,
  Form,
  Select,
  Tooltip,
} from 'choerodon-ui/pro';
// import { Modal } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isArray, isEmpty, isNil } from 'lodash';
// import classnames from 'classnames';
import querystring from 'querystring';
import DynamicButtons from '_components/DynamicButtons';
import { openApproveModal } from '_components/ApproveModal';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import SVGIcon from '@/routes/components/SvgIcon';
// import formatterCollections from 'utils/intl/formatterCollections';
import {
  filterNullValueObject,
  getResponse,
  getCurrentOrganizationId,
  getCurrentTenant,
} from 'utils/utils';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';
// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import {
  checkPermission,
  queryUserMemory,
  saveUserMemory,
  createProjectToinquiry,
  createProjectToBid,
  searchTabNumber,
  copyProject,
  // checkApplyToInquiry,
  createQuoteApproval,
} from '@/services/projectSetupService';
import {
  getTableFixSelfAdaptStyle,
  getDetailDispatchRouter,
  handleRevokeApproval,
  isText,
  applyToNotification,
} from '@/utils/utils';
import { queryEnableDoubleUnit } from '@/services/commonService';
import {
  projectToRF,
  fetchConfigSheet,
  projectToRFValidate,
} from '@/services/inquiryHallNewService';
import {
  fetchBidConfig,
  newBatchValidatePurchase,
  projectToWholeCreate,
} from '@/services/inquiryHallService';
import { validateModal, getPromptMessage } from '@/routes/components/ConfirmModal';

import styles from './index.less';

import { withStandardCompEnhancer } from './standardCompEnhancerCreator';
import { SourcingTemplateDS } from './LineDS';
import { SectionLineDS } from './SectionLineDS';
// import SearchDrawer from './SearchDrawer';
import ToBeReleasedContainer from './ToBeReleasedContainer';
import AllContainer from './AllContainer';
import FinishedContainer from './FinishedContainer';
import OnGoingContainer from './OnGoingContainer';
import SectionDrawer from './SectionDrawer';
import PurchaseRequestContent from './PurchaseRequestContent';
import PurchaseRequestDS from './PurchaseRequestDS';
import { getApprovedDetailBtn } from './helpers';
import CloseSourceProject from './Components/CloseSourceProject';

const { TabPane } = Tabs;
const promptCode = 'ssrc.projectSetup';
const organizationId = getCurrentOrganizationId();
const wideSelected = require('@/assets/wide.svg');
const wideUnselected = require('@/assets/wide-black.svg');

class ProjectSetup extends Component {
  constructor(props) {
    super(props);
    const queryParams = querystring.parse(props.location.search.substr(1));

    this.onGoingKeys = ['pending', 'approving'];

    this.state = {
      activeTabKey: queryParams.defaultTabIndex,
      tabsNumber: {}, // 各个tab的数量
      layoutType: 'wide', // flat/wide
      changePermissionCode: 0, // 变更权限
      createRfxPermissionCode: 0, // 创建寻源权限
      manageRfxPermissionCode: 0, // 寻源管理权限
      approveDetailPermissionCode: 0, // 审批详情权限
      approvePermissionCode: 0, // 审批权限
      revokePermissionCode: 0, // 撤销权限
      draftPermissionCode: 0, // 草稿权限
      maintainPermissionCode: 0, // 维护权限
      manualProjectPermissionCode: 0, // 手工立项
      quoteApprovalPermissionCode: 0, // 引用申请
      copyPermissionCode: 0, // 复制权限
      projectClosePermissionCode: 0, // 项目关闭权限
      sourceResultPermissionCode: 0, // 寻源结果权限
      viewVersionPermissionCode: 0, // 查看版本按钮权限
      projectHallStage: {}, // 用户记忆 - tab存储
      projectTableDisplay: {}, // 用户记忆 - 布局存储
      showSearchBar: false, // 开始展示搜索框
      isBid: false, // 是否开启新招标
      doubleUnitFlag: false, // 双单位标识
      projectOldUIFlag: true, // 是否寻源立项老ui
      onGoingCollapseKey: this.onGoingKeys,
      onGoingCollapseKeyUserConfigObj: {},
    };
  }

  sectionModalOpener = null; // modal实体

  popoverRefMap = {}; // 利用行`tabKey + id`, 组成

  purchaseRequestDs = new DataSet(PurchaseRequestDS());

  workFlowMenuPermissionMap = getDetailDispatchRouter();

  // 页面跳转时监测id是否变化
  getSnapshotBeforeUpdate(preProps) {
    const prevParams = querystring.parse(preProps?.location?.search?.substr(1));
    const params = querystring.parse(this.props.location.search?.substr(1));
    const { defaultTabIndex: preDefaultTabIndex = null } = prevParams || {};
    const { defaultTabIndex = null } = params || {};
    const updateFlag = !!defaultTabIndex && preDefaultTabIndex !== defaultTabIndex;

    return updateFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initPage();
    }
  }

  initPage = () => {
    this.queryDoubleUnit();
    this.fetchQueryUserMemory();
    this.fetchBidConfig();
    this.fetchCheckPermission();
    this.fetchOldUIConfig();
  };

  // 查询表格数据， 通用入口函数
  fetchCurrentTableData = (changeTabFlag = false, otherProps = {}) => {
    this.handleSearch(changeTabFlag, otherProps);
  };

  componentDidMount() {
    this.initPage();
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.purchaseRequestDs.setState('doubleUnitFlag', !!Number(res));
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  @Bind()
  async fetchBidConfig() {
    const res = getResponse(await fetchBidConfig({ tenant: getCurrentTenant().tenantNum }));
    if (res) {
      this.setState({
        isBid: Number(res[0]?.newBid || 1),
        // isAll: Number(res[0]?.newBid) && Number(res[0]?.oldBid),
      });
    }
  }

  // 查询新老ui配置
  async fetchOldUIConfig() {
    try {
      const data = getResponse(
        await fetchConfigSheet({
          organizationId,
          configCode: 'srm_source_project_old_ui_black_list',
          data: {
            tenantNum: getCurrentTenant().tenantNum,
          },
        })
      );
      if (data && !isEmpty(data)) {
        this.setState({
          projectOldUIFlag: true,
        });
      } else {
        this.setState({
          projectOldUIFlag: false,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  // 查询用户记忆
  async fetchQueryUserMemory() {
    const { layoutType } = this.state;
    const { location } = this.props;
    const queryParams = querystring.parse(location.search.substr(1));
    const params = {
      organizationId,
      configKeys: 'projectHallStage,projectTableDisplay,onGoingCollapseKey',
    };
    const result = getResponse(await queryUserMemory(params));
    if (result) {
      const { projectHallStage, projectTableDisplay, onGoingCollapseKey } = result;
      const { configValue: onGoingConfigValue = null } = onGoingCollapseKey || {};

      const newStateObj = {};
      if (!isNil(onGoingConfigValue)) {
        newStateObj.onGoingCollapseKey = onGoingConfigValue ? onGoingConfigValue.split(',') : [];
        newStateObj.onGoingCollapseKeyUserConfigObj = onGoingCollapseKey;
      }

      this.setState({
        ...newStateObj,
        projectHallStage,
        projectTableDisplay,
        layoutType: projectTableDisplay?.configValue || layoutType,
        activeTabKey: queryParams?.defaultTabIndex || projectHallStage?.configValue || 'onGoing',
        showSearchBar: true,
      });
    } else {
      // 进行中
      this.setState({
        activeTabKey: queryParams?.defaultTabIndex || 'onGoing',
        showSearchBar: true,
      });
    }
  }

  /**
   * 取消选择切换
   */
  @Bind()
  async cancelAggregationChange() {
    if (this.state.projectTableDisplay === 'mid') {
      return;
    }
    // 同时保存用户记忆
    const params = {
      configDesc: 'projectTableDisplay',
      configValue: 'mid',
    };
    this.fetchSaveUserMemory('projectTableDisplay', params);
    this.setState({
      layoutType: 'mid',
    });
  }

  // 保存用户记忆
  /**
   *
   * @param {string} saveType - 保存类型 projectTableDisplay(布局)/projectHallStage(页签)
   * @param {Object} saveData - 保存数据
   */
  async fetchSaveUserMemory(saveType, saveData) {
    const params = Object.assign({ organizationId }, this.state[saveType], saveData);
    const result = getResponse(await saveUserMemory(params));
    if (result) {
      this.setState({
        [saveType]: result,
      });
      this.changeTableToAggregationOrCommon();
    }
  }

  /**
   * 切换表格风格
   * 初进入页面给四个tab标识为1，切换外侧表格风格，则全都置为1，若为0-改变外侧之后第一次进入需要切换，为1再次进入不需要切换
   */
  changeTableToAggregationOrCommon() {
    const { layoutType, activeTabKey, tabChangeVersionObj = {} } = this.state;
    const {
      toBeReleasedVersion,
      onGoingContainerVersion,
      finishedContainerVersion,
      allContainerVersion,
    } = tabChangeVersionObj;
    const aggregation = layoutType === 'wide';
    if (tabChangeVersionObj && !isEmpty(tabChangeVersionObj)) {
      switch (activeTabKey) {
        case 'toBeReleased':
          if (toBeReleasedVersion === 0) {
            this.setState({
              tabChangeVersionObj: { ...tabChangeVersionObj, toBeReleasedVersion: 1 },
            });
            this.toBeReleasedRef.handleAggregationChange(aggregation);
          }
          break;
        case 'onGoing':
          if (onGoingContainerVersion === 0) {
            this.setState({
              tabChangeVersionObj: { ...tabChangeVersionObj, onGoingContainerVersion: 1 },
            });
            this.onGoingContainerRef.handleAllAggregationChange(aggregation);
          }
          break;
        case 'finished':
          if (finishedContainerVersion === 0) {
            this.setState({
              tabChangeVersionObj: { ...tabChangeVersionObj, finishedContainerVersion: 1 },
            });
            this.finishedContainerRef.handleAggregationChange(aggregation);
          }
          break;
        case 'all':
          if (allContainerVersion === 0) {
            this.setState({
              tabChangeVersionObj: { ...tabChangeVersionObj, allContainerVersion: 1 },
            });
            this.allContainerRef.handleAggregationChange(aggregation);
          }
          break;
        default:
          break;
      }
    }
  }

  @Bind()
  getToBeReleasedRef = (ref) => {
    this.toBeReleasedRef = ref || {};
  };

  @Bind()
  getOnGoingContainerRef = (ref) => {
    this.onGoingContainerRef = ref || {};
  };

  @Bind()
  getFinishedContainerRef = (ref) => {
    this.finishedContainerRef = ref || {};
  };

  @Bind()
  getAllContainerRef = (ref) => {
    this.allContainerRef = ref || {};
  };

  @Bind()
  handleRef(record, vnode) {
    const { activeTabKey } = this.state;
    const sourceProjectId = record?.get('sourceProjectId');
    this.popoverRefMap[`${activeTabKey}-${sourceProjectId}`] = vnode;
  }

  // 手工立项
  @Bind()
  handleManualProject() {
    const { history } = this.props;
    const { projectOldUIFlag } = this.state;
    const search = querystring.stringify({
      current: 'newProjectSetup',
    });
    if (projectOldUIFlag) {
      history.push({
        pathname: `/ssrc/new-project-setup/update/null`,
        search,
      });
      return;
    }
    history.push({
      pathname: `/ssrc/new-project-setup/sp-update/create`,
    });
  }

  @Bind()
  async purchaseRequestOk() {
    const { dispatch, location } = this.props;
    const { projectOldUIFlag } = this.state;
    const { selected } = this.purchaseRequestDs;
    const selectedRowKeys = selected.map((ele) => ele.toData().prLineId);
    const { routeFrom } = querystring.parse(location.search.substr(1));
    const search = querystring.stringify({
      current: routeFrom,
    });
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.message.pleaseSelectAtleastOneData')
          .d('请至少选择一条数据'),
      });
      return false;
    }
    const res = await newBatchValidatePurchase({
      organizationId,
      prLineIdList: selectedRowKeys,
      customizeUnitCode: 'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT_NEW.LIST',
      configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
      sourceDocumentType: 'PROJECT',
    });
    if (getResponse(res)) {
      const onOk = () => {
        if (res.secondaryUomInconsistentFlag === 1) {
          applyToNotification(res.secondaryUomInconsistentMes);
        }
        return createQuoteApproval({
          organizationId,
          prLineIdList: selectedRowKeys,
        }).then((response) => {
          if (getResponse(response)) {
            notification.success();
            const { sourceProject = {} } = response;
            const { sourceProjectId = '' } = sourceProject;
            if (!sourceProjectId) {
              return;
            }
            // 老ui
            if (projectOldUIFlag) {
              dispatch(
                routerRedux.replace({
                  pathname: `/ssrc/new-project-setup/update/${sourceProjectId}`,
                  search,
                })
              );
            } else {
              // 新立项c7nui
              dispatch(
                routerRedux.replace({
                  pathname: `/ssrc/new-project-setup/sp-update/${sourceProjectId}`,
                })
              );
            }
          } else {
            return false;
          }
        });
      };
      if (res === true || isEmpty(res)) {
        return onOk();
      }
      if (res && !isNil(res?.highestValidatorType) && res?.highestValidatorType !== 'SUCCESS') {
        switch (res?.highestValidatorType) {
          case 'WARNING':
            C7nProModal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: getPromptMessage({ response: res, validatorArrName: 'validateResults' }),
              onOk: () => onOk(),
              bodyStyle: { maxHeight: 'calc(100vh - 2.5rem)' },
            });
            break;
          case 'ERROR':
            notification.error({
              message: intl.get('hzero.common.message.confirm.title').d('提示'),
              description: getPromptMessage({ response: res, validatorArrName: 'validateResults' }),
            });
            break;
          default:
            C7nProModal.info({
              children: getPromptMessage({ response: res, validatorArrName: 'validateResults' }),
              bodyStyle: { maxHeight: 'calc(100vh - 2.5rem)' },
            });
            break;
        }
      }
      // 代表有错误内容，阻断弹窗关闭
      if (res?.returnDetail) {
        return false;
      }

      if (!res?.returnDetail) {
        // 校验不通过， 后端返回returnDetail对象
        if (res.secondaryUomInconsistentFlag === 1) {
          applyToNotification(res.secondaryUomInconsistentMes);
        }
        const result = await createQuoteApproval({
          organizationId,
          prLineIdList: selectedRowKeys,
        });
        if (getResponse(result)) {
          notification.success();
          const { sourceProject = {} } = result;
          const { sourceProjectId = '' } = sourceProject;
          if (!sourceProjectId) {
            return;
          }
          // 老ui
          if (projectOldUIFlag) {
            dispatch(
              routerRedux.replace({
                pathname: `/ssrc/new-project-setup/update/${sourceProjectId}`,
                search,
              })
            );
          } else {
            // 新立项c7nui
            dispatch(
              routerRedux.replace({
                pathname: `/ssrc/new-project-setup/sp-update/${sourceProjectId}`,
              })
            );
          }
        } else {
          return false;
        }
      }
      // if (res.companyInconsistentFlag === 0 || !res.companyInconsistentFlag) {
      //   if (res.secondaryUomInconsistentFlag === 1) {
      //     applyToNotification(res.secondaryUomInconsistentMes);
      //   }
      //   const response = await createQuoteApproval({
      //     organizationId,
      //     prLineIdList: selectedRowKeys,
      //   });
      //   if (getResponse(response)) {
      //     notification.success();
      //     const { sourceProject = {} } = response;
      //     const { sourceProjectId = '' } = sourceProject;
      //     if (!sourceProjectId) {
      //       return;
      //     }
      //     dispatch(
      //       routerRedux.replace({
      //         pathname: `/ssrc/new-project-setup/update/${sourceProjectId}`,
      //         search,
      //       })
      //     );
      //   } else {
      //     return false;
      //   }
      // }
      // if (res.companyInconsistentFlag === 1) {
      //   Modal.confirm({
      //     title: intl
      //       .get(`ssrc.inquiryHall.view.message.diffCompany`)
      //       .d('并单公司不一致,是否继续?'),
      //     onOk: async () => {
      //       if (res.secondaryUomInconsistentFlag === 1) {
      //         applyToNotification(res.secondaryUomInconsistentMes);
      //       }
      //       const response = await createQuoteApproval({
      //         organizationId,
      //         prLineIdList: selectedRowKeys,
      //       });
      //       if (getResponse(response)) {
      //         notification.success();
      //         const { sourceProject = {} } = response;
      //         const { sourceProjectId = '' } = sourceProject;
      //         if (!sourceProjectId) {
      //           return;
      //         }
      //         dispatch(
      //           routerRedux.replace({
      //             pathname: `/ssrc/new-project-setup/update/${sourceProjectId}`,
      //             search,
      //           })
      //         );
      //       } else {
      //         return false;
      //       }
      //     },
      //   });
      // }
    } else {
      return false;
    }
  }

  // 引用申请立项
  @Bind()
  async handleQuoteApproval() {
    const { history, remote } = this.props;
    const { doubleUnitFlag } = this.state;
    const search = querystring.stringify({
      routeFrom: 'newProjectSetup',
    });
    let data = null;
    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_execution_link_old_tenant',
        organizationId,
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      if (isEmpty(data)) {
        const modalKey = C7nProModal.key();
        const Props = {
          organizationId,
          PurchaseRequestDS: this.purchaseRequestDs,
          doubleUnitFlag,
          executionLinkFlag: 1,
          history,
          remote,
        };
        C7nProModal.open({
          destroyOnClose: true,
          key: modalKey,
          drawer: true,
          title: intl.get('ssrc.projectSetup.view.button.quoteApproval').d('引用申请立项'),
          children: <PurchaseRequestContent {...Props} />,
          style: { width: 1090 },
          onOk: this.purchaseRequestOk,
          onClose: () => {
            this.purchaseRequestDs.clearCachedSelected();
            this.purchaseRequestDs.unSelectAll();
          },
        });
      } else {
        history.push({
          pathname: `/ssrc/new-project-setup/quoteApproval`,
          search,
        });
      }
    } catch (e) {
      throw e;
    }
    // history.push({
    //   pathname: `/ssrc/new-project-setup/quoteApproval`,
    //   search,
    // });
  }

  // 修改布局
  @Bind()
  handleChangeLayoutType(currentType) {
    const { layoutType } = this.state;
    if (layoutType === currentType) return;

    this.setState({
      layoutType: currentType,
      tabChangeVersionObj: {
        toBeReleasedVersion: 0,
        onGoingContainerVersion: 0,
        finishedContainerVersion: 0,
        allContainerVersion: 0,
      },
      changeTypeAggregation: undefined,
    });

    // 同时保存用户记忆
    const params = {
      configDesc: 'projectTableDisplay',
      configValue: currentType,
    };
    this.fetchSaveUserMemory('projectTableDisplay', params);
  }

  /**
   * 切换tab
   * @param {!string} tabKey - 对应tab key
   */
  @Bind()
  handleChangeTab(tabKey) {
    this.setState(
      {
        activeTabKey: tabKey,
      },
      () => this.handleSearch(true)
    );
    // setTimeout(()=>{
    //   this.handleSearch()
    // },10)

    // 同时保存用户记忆
    const params = {
      configDesc: 'projectHallStage',
      configValue: tabKey,
    };
    this.fetchSaveUserMemory('projectHallStage', params);
  }

  @Bind()
  handleSearch(changeTabFlag, otherProps = {}) {
    const { activeTabKey } = this.state;
    const { pendingDS = {}, waitingDS = {} } = this.props;
    const {
      searchBarFlag, // 是否来源于筛选器查询标识
    } = otherProps || {};
    this.setAllDsQueryParameter(changeTabFlag);
    if (activeTabKey === 'onGoing') {
      if (searchBarFlag) {
        waitingDS.query();
        pendingDS.query();
      } else {
        waitingDS.query(waitingDS.currentPage || 0);
        pendingDS.query(pendingDS.currentPage || 0);
      }
    } else if (searchBarFlag) {
      this.props[`${activeTabKey}DS`].query();
    } else {
      this.props[`${activeTabKey}DS`].query(this.props[`${activeTabKey}DS`].currentPage || 0);
    }
  }

  /**
   * 设置最新查询值通过输入框
   * @memberof 由于ds input set value, 当input失焦才会set, 所以在未失焦时查询, 无法获取最新input值
   * @param {*} e - 当前event对象
   */
  @Bind()
  handleSetLatestQueryByInput(e) {
    this.props.advancedSearchDS.current.set('queryParam', e.target.value);
  }

  // 清空查询条件
  @Bind()
  handleResetSearch() {
    this.props.advancedSearchDS.reset();
  }

  // 查询按钮权限
  async fetchCheckPermission() {
    const params = [
      'ssrc.new-project-setup.list.button.change',
      'ssrc.new-project-setup.list.button.create',
      'ssrc.new-project-setup.list.button.manage',
      'ssrc.new-project-setup.list.button.detail',
      'ssrc.new-project-setup.list.button.approve',
      'ssrc.new-project-setup.list.button.revoke-approval',
      'ssrc.new-project-setup.list.button.draft',
      'ssrc.new-project-setup.list.button.maintain',
      'ssrc.new-project-setup.list.button.manual-project', // 手工立项
      'ssrc.new-project-setup.list.button.quote-approval', // 引用申请立项
      'ssrc.new-project-setup.list.button.copy', // 复制
      'ssrc.new-project-setup.list.button.project-close', // 项目关闭
      'ssrc.new-project-setup.list.button.source-result', // 寻源结果
      'ssrc.new-project-setup.list.button.view-version', // 查看版本
    ];
    const result = getResponse(await checkPermission(params));
    if (isArray(result)) {
      const permissions = {};
      result.forEach((r) => {
        const { code = null } = r;
        const type = code?.substr(code?.lastIndexOf('.') + 1);
        if (r?.controllerType === 'hidden' && !r?.approve) {
          // 隐藏
          permissions[type] = 0;
        } else if (r?.controllerType === 'disabled' && !r.approve) {
          // 禁用
          permissions[type] = -1;
        } else {
          permissions[type] = 1;
        }
      });
      this.setState({
        changePermissionCode: permissions?.change,
        createRfxPermissionCode: permissions?.create,
        manageRfxPermissionCode: permissions?.manage,
        approveDetailPermissionCode: permissions?.detail,
        approvePermissionCode: permissions?.approve,
        revokePermissionCode: permissions?.['revoke-approval'],
        draftPermissionCode: permissions?.draft,
        maintainPermissionCode: permissions?.maintain,
        copyPermissionCode: permissions?.copy,
        manualProjectPermissionCode: permissions?.['manual-project'],
        quoteApprovalPermissionCode: permissions?.['quote-approval'],
        projectClosePermissionCode: permissions?.['project-close'],
        sourceResultPermissionCode: permissions?.['source-result'],
        viewVersionPermissionCode: permissions?.['view-version'],
      });
    }
  }

  // 设置查询条件
  setAllDsQueryParameter(changeTabFlag) {
    const commonSearch = filterNullValueObject({
      ...this.SearchComponent?.getQueryParameter(),
      multiProjectNumOrTitle: this.SearchComponent?.customizeDs?.current
        ?.get('multiProjectNumOrTitle')
        ?.join(','),
    });

    if (changeTabFlag !== true) {
      this.handleSearchTabNum();
    }
    this.props.allDS.setQueryParameter('commonSearch', commonSearch);
    this.props.toBeReleasedDS.setQueryParameter('commonSearch', commonSearch);
    this.props.waitingDS.setQueryParameter('commonSearch', commonSearch);
    this.props.pendingDS.setQueryParameter('commonSearch', commonSearch);
    this.props.finishedDS.setQueryParameter('commonSearch', commonSearch);
  }

  @Bind()
  async handleSearchTabNum() {
    const searchParams = this.SearchComponent?.getQueryParameter() || {};
    const res = getResponse(
      await searchTabNumber({
        organizationId,
        ...searchParams,
        multiProjectNumOrTitle: this.SearchComponent?.customizeDs?.current
          ?.get('multiProjectNumOrTitle')
          ?.join(','),
        customizeUnitCode: 'SSRC.PROJECT_SETUP.NEW_LIST.SOURCE_FILTER',
      })
    );
    if (res) {
      this.setState({
        tabsNumber: res,
      });
    }
  }

  SearchComponent = null;

  @Bind()
  getSearch(ref) {
    this.SearchComponent = ref;
  }

  /**
   * 右侧全局平铺聚合
   */
  @Bind()
  rightRender() {
    const { layoutType } = this.state;
    return (
      <div className="search">
        <Tooltip
          title={intl.get('ssrc.inquiryHall.model.inquiryHall.flatTableView').d('平铺表视图')}
          theme="dark"
        >
          <div
            className={layoutType === 'flat' ? 'active' : 'change-table'}
            onClick={() => this.handleChangeLayoutType('flat')}
          >
            <Icon type="reorder" className={layoutType === 'flat' ? 'primaryColor' : 'disabled'} />
          </div>
        </Tooltip>
        <Tooltip
          title={intl.get('ssrc.inquiryHall.model.inquiryHall.aggregateTableView').d('聚合表视图')}
          theme="dark"
        >
          <div
            className={layoutType === 'wide' ? 'active' : 'change-table'}
            onClick={() => this.handleChangeLayoutType('wide')}
          >
            {layoutType !== 'wide' && <img src={wideUnselected} alt="" style={{ fontSize: 16 }} />}
            <SVGIcon
              path={wideSelected}
              style={layoutType !== 'wide' ? { visibility: 'hidden' } : { lineHeight: '32px' }}
            />
          </div>
        </Tooltip>
      </div>
    );
  }

  /**
   * 渲染查询条件
   * @returns ReactNode
   */
  renderFilterWrapper() {
    const { allDS, toBeReleasedDS, waitingDS, pendingDS, finishedDS } = this.props;
    return (
      <Fragment>
        <div className={styles['filter-container']}>
          <SearchBar
            cacheState
            autoQuery={false}
            onRef={this.getSearch}
            searchCode="SSRC.PROJECT_SETUP.NEW_LIST.SOURCE_FILTER"
            dataSet={[allDS, toBeReleasedDS, waitingDS, pendingDS, finishedDS]}
            right={{
              render: this.rightRender,
            }}
            left={{
              render: (_, ds) => this.leftRender(ds),
            }}
            onQuery={() => this.handleSearch(false, { searchBarFlag: true })}
            fieldProps={{
              contactUserId: {
                lovPara: { organizationId },
              },
            }}
            onLoad={this.fetchCurrentTableData} // autoQuery不做查询，确保筛选器处理完毕后，和onQuery 区分开， 解决查询是否带分页参数，searchBarFlag 处理查询和筛选器查询
          />
        </div>
      </Fragment>
    );
  }

  @Bind()
  leftRender(ds) {
    return (
      <MutlTextFieldSearch
        name="multiProjectNumOrTitle"
        searchBarDS={ds}
        placeholder={intl
          .get('ssrc.common.model.common.multiSearchProject')
          .d('请输入项目编号或标题查询')}
      />
    );
  }

  /**
   * 跳转询价工作台列表页面
   */
  @Bind()
  handleSourceResult(record) {
    const {
      sourceProjectId,
      sourceProjectName,
      sourceHeaderId,
      sourceCategory,
      secondarySourceCategory,
    } = record.toData();
    const search = querystring.stringify(
      sourceCategory === 'BID'
        ? {
            sourceHeaderId,
          }
        : {
            tabStatus: 'all',
            sourceProjectId,
            sourceProjectName,
            sourceCategory: 'RFQ',
          }
    );
    this.props.history.push({
      pathname:
        sourceCategory === 'BID'
          ? '/ssrc/bid-hall/list'
          : secondarySourceCategory === 'NEW_BID'
          ? '/ssrc/new-bid-hall/list'
          : '/ssrc/new-inquiry-hall/list',
      search,
    });
  }

  // 跳转维护页面
  @Bind()
  handleMaintain(record) {
    const { projectOldUIFlag } = this.state;
    const { sourceProjectId, sourceFrom = null, sourceProjectStatus } =
      record.get(['sourceProjectId', 'sourceFrom', 'sourceProjectStatus']) || {};
    if (!sourceProjectId) return;

    if (['CHANGE_REFUSE', 'CHANGING'].includes(sourceProjectStatus) && !projectOldUIFlag) {
      // 变更拒绝、变更中 & 开启新立项ui 都跳转到新变更页面
      this.props.history.push({
        pathname: `/ssrc/new-project-setup/sp-change/${sourceProjectId}`,
        search: querystring.stringify({
          sourceFrom,
        }),
      });
    } else if (!projectOldUIFlag) {
      // 新ui跳转维护
      this.props.history.push({
        pathname: `/ssrc/new-project-setup/sp-update/${sourceProjectId}`,
        search: querystring.stringify({
          sourceFrom,
        }),
      });
    } else {
      const search = querystring.stringify({
        sourceFrom,
        current: 'newProjectSetup',
      });
      this.props.history.push({
        pathname: `/ssrc/new-project-setup/update/${sourceProjectId}`,
        search,
      });
    }
  }

  /**
   *
   * @param {*} selectData 立项转勾选数据
   * @returns
   * 立项转整单线下跳转
   */
  @Bind()
  projectToWholeCreate(selectData) {
    const { history } = this.props;
    if (isEmpty(selectData)) {
      return;
    }

    return projectToWholeCreate({
      organizationId,
      ...(selectData || {}),
    }).then((res) => {
      if (getResponse(res) && !res.failed) {
        this.handleSearch();
        notification.success();
        const { rfxHeaderId } = res;
        history.push({
          pathname: `/ssrc/new-inquiry-hall/whole-update/${rfxHeaderId}`,
        });
      }
    });
  }

  // 创建寻源单
  @Bind()
  @Debounce(500)
  handleCreateRFQ(record) {
    const { remote, history } = this.props;
    const { sourceProjectId, subjectMatterRule, sourceCategory } = record.toData();
    if (sourceCategory !== 'BID' && subjectMatterRule === 'PACK') {
      // 分标段
      this.sectionLineDS = new DataSet(
        remote
          ? remote.process(
              'SSRC_PROJECT_SETUP_NEW_PROCESS_SECTION_LINE_DS',
              SectionLineDS(sourceProjectId),
              { sourceProjectId }
            )
          : SectionLineDS(sourceProjectId)
      );
      const drawerProps = {
        sourceProjectId,
        sectionLineDS: this.sectionLineDS,
      };
      this.sectionModalOpener = C7nProModal.open({
        key: C7nProModal.key(),
        title: intl.get(`${promptCode}.view.message.title.chooseSection`).d('选择标段'),
        closable: true,
        drawer: true,
        style: { width: '65%' },
        children: <SectionDrawer {...drawerProps} />,
        onOk: () => this.handleOkCreateRfx(record),
      });
    } else {
      if (record.get('sourceRequest') === 'OFFLINE_ENTER') {
        // 立项转整单
        return this.projectToWholeCreate(record.toData());
      }
      const eventProps = {
        record,
        openRfxTemplateModal: this.openRfxTemplateModal,
        organizationId,
        sourcingTemplateDS: this.sourcingTemplateDS,
        sectionLineDS: this.sectionLineDS,
        history,
        sectionModalOpener: this.sectionModalOpener,
      };
      if (remote?.event) {
        remote.event.fireEvent('handleCreateRFQEvent', eventProps);
      } else {
        this.openRfxTemplateModal(record);
      }
    }
  }

  @Bind()
  @Debounce(500, { leading: true, trailing: false }) // Debounce后面的{ leading: true, trailing: false }请勿去掉
  async handleCreateRF(record, currentType, onlyOnceFlag) {
    const { history, remote } = this.props;
    let type;
    if (onlyOnceFlag) {
      type = record.get('createRFPFlag') ? 'RFP' : record.get('createRFIFlag') ? 'RFI' : null;
    } else {
      type = currentType;
    }
    if (!type) {
      const { sourceProjectId, subjectMatterRule, sourceCategory } = record.toData();
      if (sourceCategory !== 'BID' && subjectMatterRule === 'PACK') {
        // 分标段
        this.sectionLineDS = new DataSet(
          remote
            ? remote.process(
                'SSRC_PROJECT_SETUP_NEW_PROCESS_SECTION_LINE_DS_BID',
                SectionLineDS(sourceProjectId),
                { sourceProjectId, sourceCategory }
              )
            : SectionLineDS(sourceProjectId)
        );
        const drawerProps = {
          sourceProjectId,
          sectionLineDS: this.sectionLineDS,
        };
        this.sectionModalOpener = C7nProModal.open({
          key: C7nProModal.key(),
          title: intl.get(`${promptCode}.view.message.title.chooseSection`).d('选择标段'),
          closable: true,
          drawer: true,
          style: { width: '65%' },
          children: <SectionDrawer {...drawerProps} />,
          onOk: () => this.handleOkCreateRfx(record),
        });
      } else {
        if (record.get('sourceRequest') === 'OFFLINE_ENTER') {
          // 立项转整单
          return this.projectToWholeCreate(record.toData());
        }
        const eventProps = {
          record,
          openRfxTemplateModal: this.openRfxTemplateModal,
          organizationId,
          sourcingTemplateDS: this.sourcingTemplateDS,
          sectionLineDS: this.sectionLineDS,
          history,
          sectionModalOpener: this.sectionModalOpener,
        };
        if (remote?.event) {
          remote.event.fireEvent('handleCreateRFQEvent', eventProps);
        } else {
          this.openRfxTemplateModal(record);
        }
        // this.openRfxTemplateModal(record);
      }
    } else {
      const ds = type === 'RFI' ? this.props.rfiTemplateDs : this.props.rfpTemplateDs;
      const templateId =
        ds.current?.getField('rfTemplateLov')?.options?.current?.get('templateId') ||
        ds.get(0)?.get('templateId');
      const params = { ...record.toData(), rfHeaderSourceCategory: type, templateId };
      // 校验过后转RF方法
      const doSubmit = async () => {
        try {
          const res = getResponse(await projectToRF(params));
          if (res) {
            history.push({
              pathname: `/ssrc/new-inquiry-hall/rf-update/${type}/${res.rfHeaderId}`,
            });
          }
        } catch (error) {
          throw error;
        }
      };
      const result = getResponse(await projectToRFValidate(params));
      if (result) {
        validateModal({
          response: result,
          successCallBack: doSubmit,
          warningOk: doSubmit,
        });
      }
    }
  }

  @Bind()
  async projectFinish(record) {
    let closeSourceProjectRef = null;
    const closeProps = {
      closeSourceProjectRef: (ref) => {
        closeSourceProjectRef = ref;
      },
      record,
    };

    return C7nProModal.open({
      key: C7nProModal.key(),
      destroyOnClose: true,
      closable: true,
      drawer: true,
      style: { width: 380 },
      title: intl.get(`${promptCode}.view.title.closeSourceProject`).d('关闭寻源项目'),
      children: <CloseSourceProject {...closeProps} />,
      onOk: async () => {
        const { closeFormDS } = closeSourceProjectRef || {};
        if (closeFormDS && (await closeFormDS.validate())) {
          return closeFormDS.submit().then(() => {
            this.handleSearch();
          });
        }
        return false;
      },
    });
  }

  /**
   * 创建询价单
   * @param {*} record - 行对象
   */
  @Bind()
  @Debounce(500, { leading: true, trailing: false })
  handleOkCreateRfx(record) {
    // 先判断是否选择标段, 暂时单选标段
    if (!isEmpty(this.sectionLineDS.selected)) {
      if (record.get('sourceRequest') === 'OFFLINE_ENTER') {
        // 立项转整单
        return this.projectToWholeCreate({
          ...record.toData(),
          projectLineSections: this.sectionLineDS.selected.map((r) => {
            const { projectLineItemList } = r.toData();
            return {
              ...r.toData(),
              projectLineItemList: projectLineItemList.filter((item) => item.projectLineItemId),
            };
          }),
        });
      }
      this.openRfxTemplateModal(record);
      return false;
    } else {
      notification.warning({
        message: intl
          .get(`${promptCode}.view.message.validation.selectSections`)
          .d('请选择一条或者多条标段后操作！'),
      });
      return false;
    }
  }

  /**
   * 打开选择寻源模板
   * @param {*} record - 行对象
   * @memberof 此方法被二开重写!!!
   */
  @Bind
  openRfxTemplateModal(record) {
    const { remote } = this.props;
    // 寻源模板
    const subjectMatterRule = record.get('subjectMatterRule');
    const dsConfig = SourcingTemplateDS(
      record,
      subjectMatterRule === 'PACK' && this.sectionLineDS.selected.length
    );
    this.sourcingTemplateDS = new DataSet(
      remote
        ? remote.process('SSRC_PROJECT_SETUP_NEW_PROCESS_SOURCE_TEMPLATE_DS', dsConfig)
        : dsConfig
    );
    this.sourcingTemplateDS.setQueryParameter('subjectMatterRule', subjectMatterRule);
    const lovProps = subjectMatterRule === 'PACK' && { onChange: this.handleChangeTemplate };
    this.C7nProModaler = C7nProModal.open({
      key: C7nProModal.key(),
      title: intl.get(`${promptCode}.view.message.title.chooseRfxTemplate`).d('选择寻源模板'),
      closable: true,
      drawer: true,
      style: { width: '350px' },
      onOk: () => this.handleOkChooseTemplate(record),
      children: (
        <Form dataSet={this.sourcingTemplateDS} columns={1} labelLayout="float">
          <Lov name="templateId" {...lovProps} />
        </Form>
      ),
      onCancel: () => this.sourcingTemplateDS.reset(),
    });
  }

  // 变更模板
  @Bind()
  handleChangeTemplate(lovRecord) {
    const { qualificationType } = lovRecord || {};
    if (qualificationType !== 'PRE' || this.sectionLineDS.selected.length === 1) {
      // 无需资格预审, 清空
      this.sourcingTemplateDS.current.set('mergeType', null);
    }
    this.C7nProModaler.update({
      children: (
        <Form dataSet={this.sourcingTemplateDS} columns={1} labelLayout="float">
          <Lov name="templateId" onChange={this.handleChangeTemplate} />
          {qualificationType === 'PRE' && this.sectionLineDS.selected.length > 1 && (
            <Select name="mergeType" clearButton={false} />
          )}
        </Form>
      ),
    });
  }

  @Bind()
  async handleOkChooseTemplate(record) {
    const {
      subjectMatterRule,
      sourceCategory,
      sourceProjectId,
      secondarySourceCategory,
    } = record.get([
      'subjectMatterRule',
      'sourceCategory',
      'sourceProjectId',
      'secondarySourceCategory',
    ]);
    const validateFlag = await this.sourcingTemplateDS.validate();
    if (validateFlag) {
      // 创建寻源
      const { templateId, bidRuleType, mergeType } =
        this.sourcingTemplateDS?.current.toData() || {};
      const params = Object.assign(
        {},
        {
          organizationId,
          ...record.toData(),
          templateId,
          sourceProjectId,
        },
        sourceCategory !== 'BID' &&
          subjectMatterRule === 'PACK' && {
            mergeType,
            projectLineSections: this.sectionLineDS.selected.map((r) => {
              const { projectLineItemList } = r.toData();
              return {
                ...r.toData(),
                projectLineItemList: projectLineItemList.filter((item) => item.projectLineItemId),
              };
            }),
          }
      );
      const result = getResponse(
        await (sourceCategory === 'BID'
          ? createProjectToBid(params)
          : createProjectToinquiry(params))
      );
      if (result) {
        const { rfxHeaderId, bidHeaderId } = result;
        if (sourceCategory === 'BID') {
          const search = querystring.stringify({
            bidRuleType,
            subjectMatterRule,
          });
          this.props.history.push({
            pathname: `/ssrc/bid-hall/bid-update/${bidHeaderId}`,
            search,
          });
        } else {
          const search = querystring.stringify({
            // noBack: true,
          });
          if (record.get('sourceRequest') === 'OFFLINE_ENTER') {
            // 线下整单录入
            this.props.history.push({
              pathname: `/ssrc/new-inquiry-hall/whole-update/${rfxHeaderId}`,
            });
          } else {
            this.props.history.push({
              pathname:
                secondarySourceCategory === 'NEW_BID'
                  ? `/ssrc/new-bid-hall/bid-update/${rfxHeaderId}`
                  : `/ssrc/new-inquiry-hall/rfx-update-new/${rfxHeaderId}`,
              search,
            });
          }
        }
        this.sourcingTemplateDS.reset();
        // eslint-disable-next-line no-unused-expressions
        this.sectionModalOpener?.close();
        return true;
      }
    }
    return false;
  }

  // 寻源管理
  @Bind()
  handleManage(record) {
    const {
      sourceProjectId,
      sourceProjectName,
      sourceCategory,
      sourceHeaderId,
      secondarySourceCategory,
    } = record.toData();
    const search = querystring.stringify(
      sourceCategory === 'BID'
        ? {
            sourceHeaderId,
          }
        : {
            tabStatus: 'all',
            sourceProjectId,
            sourceProjectName,
            sourceCategory: 'RFQ',
          }
    );
    this.props.history.push({
      pathname:
        sourceCategory === 'BID'
          ? '/ssrc/bid-hall/list'
          : secondarySourceCategory === 'NEW_BID'
          ? '/ssrc/new-bid-hall/list'
          : '/ssrc/new-inquiry-hall/list',
      search,
    });
  }

  // RF寻源管理
  @Bind()
  handleMangeRF(record, type, onlyOnceFlag) {
    const {
      sourceProjectId,
      sourceProjectName,
      sourceCategory,
      sourceHeaderId,
      sourceManagement = [],
    } = record.get([
      'sourceProjectId',
      'sourceProjectName',
      'sourceCategory',
      'sourceHeaderId',
      'sourceManagement',
    ]);
    let pushType;
    if (onlyOnceFlag) {
      pushType = sourceManagement?.includes('RFP')
        ? 'RFP'
        : sourceManagement?.includes('RFI')
        ? 'RFI'
        : 'RFQ';
    }
    const search = querystring.stringify(
      sourceCategory === 'BID'
        ? {
            sourceHeaderId,
          }
        : {
            tabStatus: 'all',
            sourceProjectId,
            sourceProjectName,
            sourceCategory: pushType || type,
          }
    );
    this.props.history.push({
      pathname: sourceCategory === 'BID' ? '/ssrc/bid-hall/list' : '/ssrc/new-inquiry-hall/list',
      search,
    });
  }

  @Bind()
  handleMangeBID(record) {
    const { sourceProjectId, sourceProjectName } = record.get([
      'sourceProjectId',
      'sourceProjectName',
    ]);
    const search = querystring.stringify({
      tabStatus: 'all',
      sourceProjectId,
      sourceProjectName,
    });
    this.props.history.push({
      pathname: '/ssrc/new-bid-hall/list',
      search,
    });
  }

  // 变更
  @Bind()
  handleChange(record) {
    const { projectOldUIFlag } = this.state;
    const handleJumpChange = (props) => {
      const { sourceFrom = '', sourceProjectId = '', history = {} } = props || {};
      const search = querystring.stringify({
        sourceFrom,
        current: 'newProjectSetup',
      });
      if (projectOldUIFlag) {
        // 老ui
        history.push({
          pathname: `/ssrc/new-project-setup/update/${sourceProjectId}`,
          search,
        });
      } else {
        // 新ui
        history.push({
          pathname: `/ssrc/new-project-setup/sp-change/${sourceProjectId}`,
          search: querystring.stringify({
            sourceFrom,
          }),
        });
      }
    };

    const { sourceProjectId, sourceFrom = null } = record.toData();
    if (!sourceProjectId) return;
    const { remote, history } = this.props;

    const eventProps = {
      sourceFrom,
      sourceProjectId,
      history,
      projectOldUIFlag,
    };

    if (remote?.event) {
      return remote.event.fireEvent('remoteHandleChangeEvent', {
        ...(eventProps || {}),
        handleJumpChange,
      });
    } else {
      handleJumpChange(eventProps);
    }
  }

  // 审批详情 - 我参与的流程
  @Bind()
  handleDetail(record) {
    const { _url } = getApprovedDetailBtn({
      record,
      workFlowMenuPermissionMap: this.workFlowMenuPermissionMap,
    });
    this.handleHidePopover(record);
    if (_url) {
      setTimeout(() => {
        this.props.history.push({
          pathname: _url,
        });
      }, 300);
    }
  }

  // 审批
  @Bind()
  handleApprove(record) {
    const { dataSet } = record;
    if (!dataSet) return;
    const approvaFlags = dataSet.getState('approvaFlags');
    const businessKey = record.get('businessKey');
    const approvaFlag = approvaFlags?.[businessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    // modalProps: {
    //   closable: true,
    // },
    openApproveModal({
      taskId,
      processInstanceId,
      closable: true,
      onSuccess: () => {
        this.handleSearch();
      },
    });
  }

  // 撤销审批
  @Bind()
  async handleRevokeApproval(record) {
    const businessKey = record.get('businessKey');
    if (businessKey) {
      const res = await handleRevokeApproval(businessKey);
      if (res) {
        this.handleSearch();
      }
    }
  }

  // 草稿
  @Bind()
  handleDraft(draftRecord, record) {
    const {
      tempSourceHeaderId,
      sourceHeaderId,
      bidRuleType,
      subjectMatterRule,
      sourceCategory,
    } = draftRecord;
    this.handleHidePopover(record);
    setTimeout(() => {
      if (record.secondarySourceCategory === 'NEW_BID') {
        const search = querystring.stringify({
          noBack: true,
        });
        this.props.history.push({
          pathname: `/ssrc/new-bid-hall/bid-update/${tempSourceHeaderId || sourceHeaderId}`,
          search,
        });
      }
      if (record.get('sourceCategory') === 'BID') {
        const search = querystring.stringify({
          bidRuleType,
          subjectMatterRule,
        });
        return this.props.history.push({
          pathname: `/ssrc/bid-hall/bid-update/${tempSourceHeaderId}`,
          search,
        });
      }
      if (sourceCategory === 'RFX') {
        const search = querystring.stringify({
          noBack: true,
        });
        this.props.history.push({
          pathname: `/ssrc/new-inquiry-hall/rfx-update-new/${tempSourceHeaderId || sourceHeaderId}`,
          search,
        });
      } else {
        const search = querystring.stringify({
          noBack: true,
        });
        this.props.history.push({
          pathname: `/ssrc/new-inquiry-hall/rf-update/${sourceCategory}/${
            tempSourceHeaderId || sourceHeaderId
          }`,
          search,
        });
      }
    }, 300);
  }

  // 查看版本
  @Bind
  handleViewVersion(payload = {}) {
    const { versionRecord, sourceProjectId } = payload || {};
    const { sourceProjectHistoryId, dataVersion } = versionRecord || {};
    if (!sourceProjectHistoryId) return;
    this.props.history.push({
      pathname: `/ssrc/new-project-setup/sp-version/${sourceProjectId}/${sourceProjectHistoryId}`,
      search: querystring.stringify({
        dataVersion,
      }),
    });
  }

  // 跳转立项单详情页面
  @Bind()
  handleProjectSetupDetail(record) {
    const { sourceProjectId } = record.toData();
    const search = querystring.stringify({
      current: 'newProjectSetup',
    });
    this.props.history.push({
      pathname: `/ssrc/new-project-setup/detail/${sourceProjectId}`,
      search,
    });
  }

  // 复制单据
  @Bind()
  async handleCopyProject(record) {
    const { projectOldUIFlag } = this.state;
    const { sourceProjectId } = record.get(['sourceProjectId']);
    const customizeUnitCode =
      'SSRC.PROJECT_SETUP_EDIT.BASEINFOS,SSRC.PROJECT_SETUP_EDIT.LINE_ITEM,SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER,SSRC.PROJECT_SETUP_EDIT.LINE_PLAN,SSRC.PROJECT_SETUP_EDIT.LINE_TAB';

    const result = getResponse(
      await copyProject({
        customizeUnitCode,
        sourceProjectId,
      })
    );
    if (result && !result.failed) {
      if (!sourceProjectId) return;
      const search = querystring.stringify({
        current: 'newProjectSetup',
      });
      // 老ui
      if (projectOldUIFlag) {
        this.props.history.push({
          pathname: `/ssrc/new-project-setup/update/${result?.sourceProject?.sourceProjectId}`,
          search,
        });
        return;
      }
      // 新立项c7nui
      this.props.history.push({
        pathname: `/ssrc/new-project-setup/sp-update/${result?.sourceProject?.sourceProjectId}`,
      });
    }
  }

  /**
   * 隐藏popover
   */
  @Bind()
  handleHidePopover(record) {
    const { activeTabKey } = this.state;
    const sourceProjectId = record?.get('sourceProjectId');
    const popoverNode = this.popoverRefMap[`${activeTabKey}-${sourceProjectId}`];
    const tooltipNode = popoverNode?.tooltip;
    if (tooltipNode) {
      tooltipNode.onVisibleChange(false);
    }
  }

  // 导出参数
  getExportNewButtonQueryParam = () => {
    const excelExportQueryParams = filterNullValueObject({
      ...(this.SearchComponent?.getQueryParameter() || {}),
      customizeUnitCode: `SSRC.PROJECT_SETUP.NEW_LIST.SOURCE_FILTER`,
      multiProjectNumOrTitle: this.SearchComponent?.customizeDs?.current
        ?.get('multiProjectNumOrTitle')
        ?.join(','),
    });
    return excelExportQueryParams;
  };

  getButtons = () => {
    const {
      quoteApprovalPermissionCode,
      manualProjectPermissionCode,
      activeTabKey = 'all',
    } = this.state;
    const { remote, history, location } = this.props;
    const routeParams = querystring.parse(location?.search?.substr(1));

    const buttons =
      quoteApprovalPermissionCode === 0 && manualProjectPermissionCode === 0
        ? [
            activeTabKey === 'all' && {
              name: 'exportProject',
              btnComp: ExcelExportPro,
              btnProps: {
                templateCode: 'SRM_C_SRM_SSRC_SOURCE_PROJECT_EXPORT',
                name: 'exportProject',
                requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/source-projects/export-sourceProject`,
                buttonText: intl.get('hzero.common.button.export').d('导出'),
                queryParams: this.getExportNewButtonQueryParam,
                otherButtonProps: {
                  funcType: 'flat',
                  permissionList: [
                    {
                      code:
                        'srm.ssrc.source.manage.plan.project-inquiry-hall.button.export-source-sourceproject',
                      type: 'button',
                      meaning: `${
                        intl
                          .get(`ssrc.projectSetup.view.message.title.rfxProjectWorkbench`)
                          .d('寻源项目工作台') -
                        intl.get(`ssrc.common.button.exportNew`).d('导出(新)')
                      }`,
                    },
                  ],
                },
              },
            },
          ]
        : [
            activeTabKey === 'all' && {
              name: 'exportProject',
              btnComp: ExcelExportPro,
              btnProps: {
                templateCode: 'SRM_C_SRM_SSRC_SOURCE_PROJECT_EXPORT',
                name: 'exportProject',
                requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/source-projects/export-sourceProject`,
                buttonText: intl.get('hzero.common.button.export').d('导出'),
                queryParams: this.getExportNewButtonQueryParam,
                otherButtonProps: {
                  funcType: 'flat',
                  permissionList: [
                    {
                      code:
                        'srm.ssrc.source.manage.plan.project-inquiry-hall.button.export-source-sourceproject',
                      type: 'button',
                      meaning: `${
                        intl
                          .get(`ssrc.projectSetup.view.message.title.rfxProjectWorkbench`)
                          .d('寻源项目工作台') -
                        intl.get(`ssrc.common.button.exportNew`).d('导出(新)')
                      }`,
                    },
                  ],
                },
              },
            },
            {
              name: 'createProject',
              group: true,
              children: [
                quoteApprovalPermissionCode !== 0
                  ? {
                      name: 'quoteApproval',
                      btnType: 'c7n-pro',
                      child: intl
                        .get(`${promptCode}.view.message.button.quoteApproval`)
                        .d('引用申请立项'),
                      btnProps: {
                        onClick: this.handleQuoteApproval,
                        disabled: quoteApprovalPermissionCode === -1,
                      },
                    }
                  : null,
                manualProjectPermissionCode !== 0
                  ? {
                      name: 'manualProject',
                      btnType: 'c7n-pro',
                      child: intl
                        .get(`${promptCode}.view.message.button.manualProject`)
                        .d('手工立项'),
                      btnProps: {
                        onClick: this.handleManualProject,
                        disabled: quoteApprovalPermissionCode === -1,
                      },
                    }
                  : null,
              ].filter(Boolean),
              child: (fieldName = '') => (
                <Button color="primary">
                  + {fieldName || intl.get(`${promptCode}.view.button.project`).d('立项')}
                  <Icon type="expand_more" />
                </Button>
              ),
            },
          ];
    if (!remote) return buttons;
    return remote.process('SSRC_PROJECT_SETUP_NEW_PROCESS_HEADER_BUTTONS', buttons, {
      history,
      routeParams,
    });
  };

  // 关闭状态查看
  @Bind()
  handleProjectClose(record) {
    this.handleProjectSetupDetail(record);
  }

  @Debounce(500)
  changeOnGoingCollapseKey = (key) => {
    this.setState({
      onGoingCollapseKey: key,
    });

    // 同时保存用户记忆
    const params = {
      configKey: 'onGoingCollapseKey',
      configDesc: 'onGoingCollapseKey',
      configValue: key.join() || '',
      onGoingCollapseKey: null,
    };
    this.fetchSaveUserMemory('onGoingCollapseKeyUserConfigObj', params);
  };

  render() {
    const {
      match,
      remote,
      history,
      customizeBtnGroup = () => {},
      customizeTabPane,
      customizeTable,
    } = this.props;

    const {
      isBid,
      tabsNumber,
      layoutType,
      activeTabKey,
      showSearchBar,
      changePermissionCode,
      createRfxPermissionCode,
      manageRfxPermissionCode,
      approveDetailPermissionCode,
      approvePermissionCode,
      revokePermissionCode,
      draftPermissionCode,
      maintainPermissionCode,
      copyPermissionCode,
      projectClosePermissionCode,
      sourceResultPermissionCode,
      viewVersionPermissionCode,
      projectOldUIFlag,
      onGoingCollapseKey = [],
    } = this.state;

    const commonProps = {
      customizeTable,
      isBid,
      match,
      remote,
      history,
      layoutType,
      changePermissionCode,
      createRfxPermissionCode,
      manageRfxPermissionCode,
      approveDetailPermissionCode,
      approvePermissionCode,
      revokePermissionCode,
      draftPermissionCode,
      maintainPermissionCode,
      copyPermissionCode,
      projectClosePermissionCode,
      sourceResultPermissionCode,
      viewVersionPermissionCode,
      projectOldUIFlag,
      handleFuncMap: {
        result: this.handleSourceResult,
        maintain: this.handleMaintain,
        createRFQ: this.handleCreateRFQ,
        createRF: this.handleCreateRF,
        manage: this.handleManage,
        mangeRF: this.handleMangeRF,
        mangeBID: this.handleMangeBID,
        change: this.handleChange,
        detail: this.handleDetail,
        approve: this.handleApprove,
        revokeApproval: this.handleRevokeApproval,
        draft: this.handleDraft,
        projectFinish: this.projectFinish,
        sourceProjectNum: this.handleProjectSetupDetail,
        closed: this.handleProjectClose,
        copy: this.handleCopyProject,
        viewHistoryVersion: this.handleViewVersion,
      },
      rfTemplateDs: {
        rfiTemplateDs: this.props.rfiTemplateDs,
        rfpTemplateDs: this.props.rfpTemplateDs,
      },
      onRef: this.handleRef,
      cancelAggregationChange: this.cancelAggregationChange,
      workFlowMenuPermissionMap: this.workFlowMenuPermissionMap,
      onGoingCollapseKey,
      changeOnGoingCollapseKey: this.changeOnGoingCollapseKey,
    };

    const allProps = {
      ...commonProps,
      tabKey: 'all',
      dataSet: this.props.allDS,
      getRef: this.getAllContainerRef,
    };
    const toBeReleasedProps = {
      ...commonProps,
      tabKey: 'toBeReleased',
      dataSet: this.props.toBeReleasedDS,
      getRef: this.getToBeReleasedRef,
    };
    const onGoingProps = {
      ...commonProps,
      waitingDS: this.props.waitingDS,
      pendingDS: this.props.pendingDS,
      getRef: this.getOnGoingContainerRef,
    };
    const finishedProps = {
      ...commonProps,
      dataSet: this.props.finishedDS,
      getRef: this.getFinishedContainerRef,
    };

    // activeTabKey === 'toBeReleased' || activeTabKey === 'finished' || activeTabKey === 'all' 当前激活的tab是否是待发布或者完成或者全部页签这样的单表页签
    const tableFixSelfAdaptStyle =
      getTableFixSelfAdaptStyle(
        activeTabKey === 'toBeReleased' || activeTabKey === 'finished' || activeTabKey === 'all'
      ) || {};

    return (
      <Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.rfxProjectWorkbench`)
            .d('寻源项目工作台')}
        >
          {customizeBtnGroup(
            {
              code: 'SSRC.PROJECT_SETUP.NEW_LIST.HEADER_BUTTONS',
              pro: true,
            },
            <DynamicButtons buttons={this.getButtons()} />
          )}
        </Header>
        <Content>
          <div className={styles.projectHall} style={tableFixSelfAdaptStyle.wrapperStyle}>
            {showSearchBar && this.renderFilterWrapper()}
            {customizeTabPane(
              {
                code: 'SSRC.PROJECT_SETUP.NEW_LIST.TABS',
                // cascade: true,
              },
              <Tabs
                customizable
                activeKey={activeTabKey}
                customizedCode="SSRC.PROJECT_SETUP.NEW_LIST.TABS"
                onChange={this.handleChangeTab}
                defaultChangeable={false}
                keyboard={false}
                {...tableFixSelfAdaptStyle.tabsProps}
              >
                <TabPane
                  key="toBeReleased"
                  tab={intl.get(`${promptCode}.view.message.tab.toBeReleased`).d('待发布')}
                  count={tabsNumber?.release}
                >
                  <ToBeReleasedContainer {...toBeReleasedProps} />
                </TabPane>
                <TabPane
                  key="onGoing"
                  tab={
                    <span className={styles.bargeContainer}>
                      {`${intl.get(`${promptCode}.view.message.tab.onGoing`).d('进行中')}`}
                      {tabsNumber.processed ? (
                        <Badge
                          count={tabsNumber.processed > 99 ? '99+' : tabsNumber.processed}
                          className="onGoing-badge"
                        />
                      ) : null}
                    </span>
                  }
                  count={tabsNumber?.processing}
                >
                  <OnGoingContainer {...onGoingProps} />
                </TabPane>
                <TabPane
                  key="finished"
                  tab={intl.get(`${promptCode}.view.message.tab.finished`).d('完成')}
                  count={tabsNumber?.finish}
                >
                  <FinishedContainer {...finishedProps} />
                </TabPane>
                <TabPane
                  key="all"
                  tab={intl.get(`${promptCode}.view.message.tab.all`).d('全部')}
                  count={tabsNumber?.all}
                  // showCount={false}
                >
                  <AllContainer {...allProps} />
                </TabPane>
              </Tabs>
            )}
          </div>
        </Content>
      </Fragment>
    );
  }
}

// const HOCComponent = WithCustomizeC7N({
//   unitCode: ['SSRC.PROJECT_SETUP.NEW_LIST.HEADER_BUTTONS'],
// })(formatterCollections({ code: ['ssrc.projectSetup'] })(ProjectSetup));

const HOCComponent = withStandardCompEnhancer(ProjectSetup);

export default HOCComponent;
export { ProjectSetup };
