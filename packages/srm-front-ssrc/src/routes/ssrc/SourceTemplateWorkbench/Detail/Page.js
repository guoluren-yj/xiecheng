/* eslint-disable no-unused-expressions */
import React, { useContext, useCallback, useState, useMemo, useEffect } from 'react';
import { Header } from 'components/Page';
import { Spin, Icon, Tabs } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { isEmpty, isArray, isNil } from 'lodash';
import { observer } from 'mobx-react';
import querystring from 'querystring';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';

import {
  queryNodes,
  queryDetail,
  queryHistory,
  definitionQuery,
} from '@/services/sourceTemplateWorkbechService';
import { fetchConfigSheet } from '@/services/inquiryHallService';
import { queryCheckPriceUiDisplayConfig, queryH0OrC7N } from '@/services/commonService';

import Store from './store/index';
import styles from '../index.less';
import BaseInfo from './components/BaseInfo';
import ApproveRuleTab from './components/ApproveRuleTab';
import ReleaseRule from './components/ReleaseRule';
import QuotationRule from './components/QuotationRule';
import AuctionBidRule from './components/AuctionBidRule';
import OpenBidRule from './components/OpenBidRule';
import ScoreRule from './components/ScoreRule';
import BargainRule from './components/BargainRule';
import RoundQuotationRule from './components/RoundQuotationRule';
import CheckPriceRule from './components/CheckPriceRule';
import CheckPriceTab from './components/CheckPriceTab';

// RF组件
import RFApproveRule from './components/RFApproveRule';
import RFReleaseRule from './components/RFReleaseRule';
import RFQuotationRule from './components/RFQuotationRule';
import RFScoreRule from './components/RFScoreRule';

const { TabPane } = Tabs;

const Page = () => {
  const {
    history,
    commonDs: {
      baseInfoDs,
      approveRuleDs,
      attachRequirementDs, // 询价全局规则-附件要求DS
      releaseRuleDs,
      quotationRuleDs,
      auctionBidDs,
      openBidDs,
      scoreRuleDs,
      roundQuotationRuleDs,
      bargainRuleDs,
      checkPriceRuleDs,
      winBidRuleDs, // 中标规则DS
      bidAnnouncementRuleDs, // 唱标规则

      // RF
      rfApproveRuleDs,
      rfReleaseDs,
      rfQuotationDs,
      rfExpertScoreDs,
      sourceType, // 判断进历史版本的入口
    },
    match: { params },
    routerParams: { isHisFlag },
    getCustomizeUnitCode = () => {},
  } = useContext(Store);

  const [nodes, setNodes] = useState([]);
  const [serviceChargeFlag, setServiceChargeFlag] = useState(false); // 是否开启费用工作台
  const [checkPriceUiIsNew, setCheckPriceUiIsNew] = useState(false); // 是否启用新核价
  const [activeKey, setActiveKey] = useState('baseInfo');
  const [loading, setLoading] = useState(false); // spin的loading
  const [version, setVersion] = useState([]); // 历史版本
  const [targetField, setTargetField] = useState([]); // 渲染fx
  const [currentTemplateId, setCurrentTemplateId] = useState(''); // 存储当前版本id，为了从历史版本返回

  useEffect(() => {
    querySheet();
    fetchApproveConfig();
    queryFileTemplateManageSheetConfig();
    // queryDefinition();
    initNode({}).then(() => {
      initQuery().then(() => {
        queryDefinition();
      });
    });
  }, [params.templateId]);

  // 查询
  const initQuery = async () => {
    setLoading(true);
    const res = await queryDetail({
      templateId: params.templateId,
      requestFrom: 'DETAIL', // 值：EDIT/编辑页｜DETAIL/明细页
      query: {
        customizeUnitCode: getCustomizeUnitCode([
          'baseInfo',
          'quotationRule',
          'checkPriceRule',
          'delayedPriceBiddingRule',
          'scoreRule',
          'rfScoreRule',
          'releaseRule',
          'rfApproveRule',
        ]),
      },
    });
    if (getResponse(res)) {
      baseInfoDs.loadData([res]);
      // 询价招标和征询区分开
      if (['RFI', 'RFP'].includes(res.secondarySourceCategory || res.sourceCategory)) {
        rfApproveRuleDs.loadData([res?.rfApproveRuleNode]);
        rfReleaseDs.loadData([res?.rfReleaseNode]);
        rfQuotationDs.loadData([res?.rfQuotationNode]);
        if (!isEmpty(res?.rfExpertScoreNode)) {
          rfExpertScoreDs.loadData([res?.rfExpertScoreNode]);
        }
      } else {
        approveRuleDs.loadData([res?.approveRuleNode]);
        attachRequirementDs.query();
        releaseRuleDs.loadData([res?.releaseNode]);
        quotationRuleDs.loadData([
          res.sourceCategory === 'RFA' ? res?.biddingNode : res?.quotationNode,
        ]);
        checkPriceRuleDs.loadData([res?.checkPriceNode]);
        winBidRuleDs.loadData([res?.checkPriceNode]); // 中标规则
        bidAnnouncementRuleDs.loadData([res?.checkPriceNode]); // 唱标规则
        if (!isEmpty(res?.delayBiddingNode)) {
          auctionBidDs.loadData([res?.delayBiddingNode]);
        }
        if (!isEmpty(res?.openBidNode)) {
          openBidDs.loadData([res?.openBidNode]);
        }
        if (!isEmpty(res?.expertScoreNode)) {
          scoreRuleDs.loadData([res?.expertScoreNode]);
        }
        if (!isEmpty(res?.roundQuotationNode)) {
          roundQuotationRuleDs.loadData([res?.roundQuotationNode]);
        }
        if (!isEmpty(res?.bargainNode)) {
          bargainRuleDs.loadData([res?.bargainNode]);
        }
      }
      queryHistoryVersion(res?.templateNum);
    }
    setLoading(false);
  };

  // 查询配置表
  const fetchApproveConfig = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      const resultApproveObj =
        res.find(
          (item) => item.function === 'NEW_TEMPLATE_RESULT_APPROVE' && item.whiteFlag === '0'
        ) || {}; // 结果审批标识
      approveRuleDs.setState('resultApproveFlag', !isEmpty(resultApproveObj));
    }
  };

  // 查询招标文件模板管理配置
  const queryFileTemplateManageSheetConfig = async () => {
    let data = null;
    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_file_template_cnf',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!isEmpty(data)) {
        // 黑名单
        attachRequirementDs?.setState('fileTemplateManageFlag', 0);
      } else {
        attachRequirementDs?.setState('fileTemplateManageFlag', 1);
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询业务规则定义
  const queryDefinition = async () => {
    const sourceCategory =
      baseInfoDs?.current?.get('secondarySourceCategory') ||
      baseInfoDs?.current?.get('sourceCategory');
    const res = await definitionQuery({
      fullPathCode: ['RFI', 'RFP'].includes(sourceCategory)
        ? 'SSRC.RF_TEMPLSTE_DEFINE_V2'
        : 'SSRC.SOURCE_TEMPLATE_DEFINE_V2',
      metaBusinessKey: sourceCategory,
    });
    if (getResponse(res)) {
      setTargetField(res);
    }
  };

  // sourceCategory
  const getBiddingFlag = useCallback(() => {
    return baseInfoDs?.current?.get('sourceCategory') === 'RFA';
  }, [
    baseInfoDs,
  ]);

  // biddingMode
  const getBiddingMode = useCallback(() => {
    const { current } = baseInfoDs || {};

    const { biddingMode } = current ? current.get([
      'biddingMode',
    ]) : {};

    return biddingMode;
  }, [
    baseInfoDs,
  ]);

  const japanBiddingFlag = () => {
    const biddingMode = getBiddingMode();

    const flag = biddingMode === "JAPANESE_BIDDING" && getBiddingFlag();
    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  const japOrDutchBidding = () => {
    const biddingMode = getBiddingMode();

    const flag = (biddingMode === "JAPANESE_BIDDING" || biddingMode === 'DUTCH_BIDDING') && getBiddingFlag();
    return flag;
  };

  // BRITISH_BIDDING
  const britishBidding = () => {
    const biddingMode = getBiddingMode();

    const flag = biddingMode === "BRITISH_BIDDING" && getBiddingFlag();
    return flag;
  };

  // 查询历史版本
  const queryHistoryVersion = async (templateNum = '') => {
    const res = await queryHistory({
      templateId: params.templateId,
      templateNum,
      query: {
        customizeUnitCode: getCustomizeUnitCode([
          'baseInfo',
          'quotationRule',
          'checkPriceRule',
          'delayedPriceBiddingRule',
          'scoreRule',
          'rfScoreRule',
          'releaseRule',
          'rfApproveRule',
        ]),
      },
    });
    if (getResponse(res)) {
      setCurrentTemplateId(res?.templateId);
      setVersion(res?.historyDTO);
    }
  };

  // 查询配置表是否开启费用工作台
  const querySheet = async () => {
    const res = getResponse(
      await fetchConfigSheet({
        organizationId: getCurrentOrganizationId(),
        configCode: 'ssrc_expenses_online_payment_blacklist',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      })
    );
    const result = getResponse(await queryCheckPriceUiDisplayConfig());
    if (result) {
      checkPriceRuleDs.setState('checkPriceUiIsNew', !isEmpty(result));
      setCheckPriceUiIsNew(!isEmpty(result));
    }
    if (!(!isEmpty(res) && isArray(res) && res[0].id)) {
      quotationRuleDs.setState('serviceChargeFlag', true);
      setServiceChargeFlag(true);
    }
  };

  // 初始化节点
  const initNode = async ({ sourceCategory = 'RFA' }) => {
    setLoading(true);
    const res = await queryNodes({
      sourceCategory,
      templateId: params.templateId,
    });
    if (getResponse(res)) {
      setNodes(res);
    }
    setLoading(false);
  };

  // 编辑跳转
  const handleEdit = () => {
    history.push({
      pathname: `/ssrc/source-template-workbench/update/edit/${params.templateId}`,
    });
  };

  // 查看历史版本
  const handleViewHis = (item) => {
    setActiveKey('baseInfo');
    history.push({
      pathname: `/ssrc/source-template-workbench/details/${item.templateId}/history`,
      search: querystring.stringify({
        sourceType: isHisFlag ? sourceType : 'detailPage', // 此参数在列表页加为了区分是明细页进历史版本还是明细进入
      }),
    });
  };

  const getButtons = useCallback(() => {
    return [
      {
        name: 'edit',
        btnType: 'c7n-pro',
        hidden: isHisFlag || baseInfoDs?.current?.get('templateStatus') === 'DISABLED',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          icon: 'mode_edit',
          funcType: 'flat',
          onClick: handleEdit,
        },
      },
      {
        name: 'historyVersion',
        group: true,
        hidden: isEmpty(version),
        child: () => (
          <Button icon="schedule" funcType="flat">
            {intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
            <Icon
              type="expand_more"
              style={{ marginTop: '-2px', marginLeft: '4px', fontSize: '16px' }}
            />
          </Button>
        ),
        children: isEmpty(version)
          ? []
          : version.map((item) => ({
              name: `version${item.versionNumber}`,
              btnProps: {
                funcType: 'flat',
                onClick: () => handleViewHis(item),
              },
              child: `${intl.get('ssrc.sourceTemplate.model.sourceTemplate.version').d('版本')}${
                item.versionNumber
              }  ${item.releaseDate}`,
            })),
      },
    ];
  }, [version]);

  // 判断是否展示卡片
  const isShowNodeCard = (value) => {
    const showNode = nodes.filter((item) => item.checkFlag);
    return !!showNode.find((item) => item.value === value);
  };

  // 展示选中的节点
  const showNodes = useMemo(() => {
    if (nodes.find((item) => item.value === 'EXPERT_SCORE' && item.checkFlag)) {
      checkPriceRuleDs.setState('scoreFlag', true);
      approveRuleDs.setState('scoreFlag', true);
    } else {
      checkPriceRuleDs.setState('scoreFlag', false);
      approveRuleDs.setState('scoreFlag', false);
    }
    if (nodes.find((item) => item.value === 'BARGAIN' && item.checkFlag)) {
      approveRuleDs.setState('bargainFlag', true);
    } else {
      approveRuleDs.setState('bargainFlag', false);
    }
    return nodes.filter((item) => item.checkFlag);
  }, [nodes, checkPriceRuleDs, approveRuleDs]);

  // 渲染标题
  const getTitle = useCallback(() => {
    const { current = {} } = baseInfoDs || {};

    if (!current) return '';

    const { templateNum, versionNumber } = current.get(['templateNum', 'versionNumber']);

    return !isHisFlag ? (
      intl.get('ssrc.sourceTemplate.view.message.title.sourceTmpView').d('查看寻源模板')
    ) : (
      <>
        {!isNil(templateNum)
          ? intl
              .get(`ssrc.sourceTemplate.view.message.title.sourcingTemplateNum`, {
                templateNum,
              })
              .d(`寻源模板（templateNum）`)
          : ''}
        {!isNil(versionNumber)
          ? intl
              .get(`ssrc.sourceTemplate.model.template.versionNumberAndVar`, {
                versionNumber,
              })
              .d(`版本{versionNumber}`)
          : ''}
      </>
    );
  }, [isHisFlag, baseInfoDs]);

  // 全局规则属性
  const approveProps = useMemo(() => {
    return {
      targetField,
      scoreFlag: isShowNodeCard('EXPERT_SCORE'),
      bargainFlag: isShowNodeCard('BARGAIN'),
    };
  }, [targetField, nodes]);

  // rf全局规则属性
  const rfApproveProps = useMemo(() => {
    return {
      targetField,
    };
  }, [targetField, nodes]);

  // 渲染面板的规则
  const getTabRuleConfig = useCallback(() => {
    const data = [];
    const rfFlag = ['RFI', 'RFP'].includes(
      baseInfoDs?.current?.get('secondarySourceCategory') ||
        baseInfoDs?.current?.get('sourceCategory')
    );

    const commonProps = {
      getBiddingFlag,
      getBiddingMode,
      japOrDutchBidding,
      japanBiddingFlag,
      britishBidding,
    };

    data.push({
      value: 'BASEINFO',
      key: 'baseInfo',
      title: intl.get('ssrc.sourceTemplate.view.message.panel.baseInfos').d('基本信息'),
      component: <BaseInfo nodes={showNodes} {...commonProps} />,
      disabled: false,
    });
    if (rfFlag) {
      data.push({
        value: 'RF_APPROVE',
        key: 'approveRule',
        title: intl.get('ssrc.sourceTemplate.view.message.title.approveRule').d('全局规则'),
        component: <RFApproveRule {...rfApproveProps} />,
        disabled: false,
      });
      nodes.forEach((node) => {
        switch (node.value) {
          case 'RF_RELEASE':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'rfReleaseRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <RFReleaseRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'RF_QUOTATION':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'rfQuotationRule',
                title: intl.get('ssrc.sourceTemplate.view.message.title.replyRule').d('回复规则'),
                component: <RFQuotationRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'RF_EXPERT_SCORE':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'rfScoreRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <RFScoreRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'RF_CONFIRM_SUPPLIERS':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'rfCheckPriceRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          default:
            break;
        }
      });
    } else {
      data.push({
        value: 'APPROVE',
        key: 'approveRule',
        title: intl.get('ssrc.sourceTemplate.view.message.title.approveRule').d('全局规则'),
        component: <ApproveRuleTab {...approveProps} />,
        disabled: false,
      });
      nodes.forEach((node) => {
        switch (node.value) {
          case 'RELEASE':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'releaseRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <ReleaseRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'PREQUALIFICATION':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'prequalificationRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'SIGN_IN':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'signRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'TRIAL_BIDDING':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'trialBiddingRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'BIDDING':
          case 'QUOTATION':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'quotationRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType:
                      (baseInfoDs?.current?.get('secondarySourceCategory') ||
                        baseInfoDs?.current?.get('sourceCategory')) === 'NEW_BID'
                        ? intl.get('ssrc.common.model.common.tender').d('投标')
                        : node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: (
                  <QuotationRule serviceChargeFlag={serviceChargeFlag} nodeValue={node.value} {...commonProps} />
                ),
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'DELAY_BIDDING':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'auctionBidRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <AuctionBidRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'OPEN_BID':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'openBidRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <OpenBidRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'EXPERT_SCORE':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'scoreRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <ScoreRule openBidFlag={isShowNodeCard('OPEN_BID')} />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'PRE_TRIAL':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'scoreRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'ROUND_QUOTATION':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'roundQuotationRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <RoundQuotationRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'BARGAIN':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'bargainRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <BargainRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'CHECK_PRICE':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'checkPriceRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType:
                      baseInfoDs?.current?.get('secondarySourceCategory') === 'NEW_BID'
                        ? intl.get('ssrc.common.view.message.target').d('定标')
                        : node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: (
                  <CheckPriceRule
                    targetField={targetField}
                    checkPriceUiIsNew={checkPriceUiIsNew}
                    scoreFlag={isShowNodeCard('EXPERT_SCORE')}
                  />
                ),
                disabled: !node.clickableFlag,
              });
            }
            break;
          default:
            break;
        }
      });
    }
    return data;
  }, [
    nodes,
    approveProps,
    checkPriceUiIsNew,
    isShowNodeCard,
    serviceChargeFlag,
    baseInfoDs?.current,
  ]);

  // 点击面板
  const handleSetActiveKey = useCallback((value) => setActiveKey(value), [setActiveKey]);

  const getBackPath = useCallback(() => {
    if (!sourceType) {
      return '/ssrc/source-template-workbench/list';
    }
    return `/ssrc/source-template-workbench/details/${currentTemplateId}/detail`;
  }, [currentTemplateId, sourceType]);

  // 对tab组件进行渲染
  const renderTabPane = useCallback(
    (config) => {
      if (config.value === 'CHECK_PRICE') {
        return <CheckPriceTab config={config} scoreFlag={isShowNodeCard('EXPERT_SCORE')} />;
      }
      return (
        <>
          <div style={{ display: 'flex', margin: '20px 0 16px 0' }} />
          <div>{config.component}</div>
        </>
      );
    },
    [isShowNodeCard]
  );

  return (
    <React.Fragment>
      <Header title={getTitle()} backPath={getBackPath()}>
        <DynamicButtons buttons={getButtons()} />
      </Header>
      <div className={styles['source-template-spin']}>
        <div className={styles['source-template-spin-wrapper']}>
          <Spin spinning={loading}>
            <div className={styles['source-template-update-content']}>
              {/* <div className={styles['source-template-update-content-nodes']}>
              <h3 style={{ fontWeight: '600', marginBottom: '22px', fontSize: '16px' }}>
                {intl.get('ssrc.sourceTemplate.view.message.title.sourceNode').d('寻源节点')}
              </h3>
              <ShowSourceNode nodes={showNodes} />
            </div> */}
              <div className={styles['source-template-update-content-forms']}>
                <Tabs tabPosition="left" activeKey={activeKey} onChange={handleSetActiveKey}>
                  {(getTabRuleConfig() || [])?.map((config) => {
                    return (
                      <TabPane
                        key={config.key}
                        disabled={config.disabled}
                        tab={
                          <div className={styles['source-template-update-content-forms-title']}>
                            {config.title}
                          </div>
                        }
                      >
                        {renderTabPane(config)}
                      </TabPane>
                    );
                  })}
                </Tabs>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    </React.Fragment>
  );
};

export default observer(Page);
