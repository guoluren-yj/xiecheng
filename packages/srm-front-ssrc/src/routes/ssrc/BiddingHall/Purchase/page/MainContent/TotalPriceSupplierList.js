import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { getResponse } from 'utils/utils';
import { noop, isNil } from 'lodash';
import { Tooltip, DataSet, useModal, Table, Modal } from 'choerodon-ui/pro';
import { Icon, Dropdown, Menu, Popover } from 'choerodon-ui';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
// import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { numberSeparatorRender } from '@/utils/renderer';
// import { getTableFixSelfAdaptStyle } from '@/utils/utils';

import { TrafficLight } from "@/routes/ssrc/BiddingHall/components";
import { PurBiddingHistoryChart } from '../../../components';
import { getBenchmarkPriceTypeField } from '../../../utils/utils';
import { PurStatusTag } from '../../../utils/renders';
import { deleteTotalPriceSupplierNewPrice } from '../../api';

import { BanQuotation, banQuotationDS } from './TotalPriceBanQuotation';

import style from './index.less';

const signInSvg = require('@/assets/biddingHall/sign-in.svg');
const lineSignInSvg = require('@/assets/biddingHall/line-sign-in.svg');
const lineNoSignInSvg = require('@/assets/biddingHall/line-no-sign-in.svg');
const forbidQuotationSvg = require('@/assets/biddingHall/forbid-quotation.svg');
const abnormalIp = require('@/assets/biddingHall/abnormal-ip.svg');
const greenIp = require('@/assets/biddingHall/ipgreen.svg');

const RankSvgComponent = (props) => {
  const { record, remote, header } = props || {};
  const {
    isBritishBidTrafficLight,
  } = header || {};

  // 红绿灯-排名
  if (isBritishBidTrafficLight === 1) {
    return (
      <TrafficLight record={record} />
    );
  }

  let cuxHiddenRank = false;
  cuxHiddenRank = remote
    ? remote.process(
        'SSRC_PURCHASE_BIDDING_HALL_PROCESS_TOTAL_PRICE_SUPPLIER_LIST_RANK_HIDDEN',
        cuxHiddenRank,
        props
      )
    : cuxHiddenRank;

  const { biddingQuotationRank } = record?.get(['biddingQuotationRank']) || {};

  if (isNil(biddingQuotationRank) || cuxHiddenRank) {
    return <div className={style[`total-price-table-row-rank-other`]} />;
  }

  if ([1, 2, 3].includes(biddingQuotationRank)) {
    return (
      <div className={style[`total-price-table-row-rank-${biddingQuotationRank}`]}>
        <span>{biddingQuotationRank}</span>
      </div>
    );
  }
  if (biddingQuotationRank < 10) {
    return (
      <div className={style[`total-price-table-row-rank-other`]}>
        <span>{biddingQuotationRank}</span>
      </div>
    );
  } else if (biddingQuotationRank < 100) {
    return (
      <div className={style[`total-price-table-row-rank-other`]}>
        <span className={style['total-price-table-row-rank-text-10-99']}>
          {biddingQuotationRank}
        </span>
      </div>
    );
  } else if (biddingQuotationRank < 1000) {
    return (
      <div className={style[`total-price-table-row-rank-other`]}>
        <span className={style['total-price-table-row-rank-text-100-999']}>
          {biddingQuotationRank}
        </span>
      </div>
    );
  } else {
    return (
      <div className={style[`total-price-table-row-rank-${biddingQuotationRank}`]}>
        <span>{biddingQuotationRank}</span>
      </div>
    );
  }
};

// 总价竞价供应商列表
const TotalPriceSupplierList = observer((props = {}) => {
  const {
    header,
    totalPriceSupplierListDataSet,
    bidCountDataSet,
    toggleLoading = noop,
    biddingRuleDataSet,
    remote,
    useNewRateFlag = 0,
    beforeBiddingOnGoingFlag = noop,
  } = props || {};
  const {
    biddingStatus,
    benchmarkPriceType,
    sealedQuotationFlag, // 密封报价
    originalStatus, // 单据暂停\关闭时的真正状态
    // biddingAnonymousQuotesFlag, // 是否匿名报价
    biddingType, // 竞价类型
    trialBiddingFlag, // 是否是试竞价
    biddingTotalPricePrinciple, // 总价竞价原则
    sourceMethod, // 寻源方式
    allowProhibitQuotation, // 允许操作禁止报价
    allowDeleteLatestQuotation, // 允许操作删除最新报价
  } = header || {};
  // numberOfBids - 出价次数
  const { numberOfBids } = bidCountDataSet?.current?.get?.(['numberOfBids']) || {};

  const biddingRules = totalPriceSupplierListDataSet.getQueryParameter('biddingRules');
  const { rankRule } = biddingRules || {};

  const ModalPro = useModal();

  // 供应商列表倒计时
  const supplierListTimerRef = useRef(null);

  // 手动控制列表查询是否出现loading 防止轮循期间不停的出现loading数据的圈圈
  // const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    openSupplierListTimer();
    return () => {
      clearSupplierListTimer();
    };
  }, [openSupplierListTimer, clearSupplierListTimer]);

  // 启动供应商列表刷新倒计时
  const openSupplierListTimer = () => {
    // 如果是完成、关闭的单子，不开启轮询
    if (['BIDDING_CLOSED', 'BIDDING_END'].includes(biddingStatus)) {
      clearSupplierListTimer();
      return;
    }
    // 没有开启供应商列表轮询 & 单据状态非【关闭、完成】，则开启轮循
    if (!supplierListTimerRef.current) {
      supplierListTimerRef.current = setInterval(() => {
        totalPriceSupplierListDataSet.query();
      }, 15000);
    }
  };

  // 密封报价时价格字段的显示
  const showSealedQuotationFieldValue = useCallback(
    (payload) => {
      const { value } = payload || {};
      // 如果是密封报价，则显示 ***
      if (sealedQuotationFlag) {
        return '***';
      }
      return numberSeparatorRender(value);
    },
    [sealedQuotationFlag]
  );

  // 最新报价显示
  const showNewPriceFieldValue = useCallback(
    (payload) => {
      const { value } = payload || {};
      if (sealedQuotationFlag) {
        return '***';
      }
      // 如果是补充单价并且值为空
      if (isNil(value)) {
        return (
          <span style={{ color: '#C9CDD4' }}>
            {intl.get('ssrc.biddingHall.view.message.toBeSupplementPrice').d('待补充')}
          </span>
        );
      }
      return numberSeparatorRender(value);
    },
    [sealedQuotationFlag]
  );

  //  补充单价节点-差额字段显示
  const showDifferenceAmountFieldValue = useCallback(
    (payload) => {
      const { value } = payload || {};
      // 密封报价
      if (sealedQuotationFlag) {
        return '***';
      }
      if (!isNil(value) && value !== 0) {
        return <span style={{ color: 'red' }}>{numberSeparatorRender(value)}</span>;
      }
      return value;
    },
    [sealedQuotationFlag]
  );

  // 清空供应商列表刷新倒计时
  const clearSupplierListTimer = useCallback(() => {
    if (supplierListTimerRef?.current) {
      clearInterval(supplierListTimerRef.current);
      supplierListTimerRef.current = null;
    }
  }, [supplierListTimerRef?.current]);

  const columns = useMemo(() => {
    // 关闭、完成单子
    const finishFlag = ['BIDDING_END', 'BIDDING_CLOSED'].includes(biddingStatus);
    // 是否显示供应商相关信息 只有签到未开始、签到中显示
    const signFieldFlag =
      ['SIGN_NOT_START', 'SIGNING'].includes(biddingStatus) ||
      ['SIGN_NOT_START', 'SIGNING'].includes(originalStatus);
    // 不显示价格相关字段flag
    const unShowPriceFlag = signFieldFlag || sealedQuotationFlag;
    // 权重报价显示：排名规则为按权重单价排名 & 寻源方式为邀请
    const coefficientPriceFlag =
      rankRule === 'WEIGHT_PRICE' && sourceMethod === 'INVITE' && !unShowPriceFlag;
    // 显示补充单价字段flag 【补充单价未开始、补充单价中】
    const supplementPriceFlag =
      ['SUPPLEMENT_PRICE_NOT_START', 'SUPPLEMENT_PRICE_BIDDING'].includes(biddingStatus) ||
      ['SUPPLEMENT_PRICE_NOT_START', 'SUPPLEMENT_PRICE_BIDDING'].includes(originalStatus);

    // 签到阶段显示的字段
    const signStageFields = signFieldFlag
      ? [
          {
            name: 'contactName',
            width: 150,
          },
          {
            name: 'contactMobilephone',
            width: 150,
          },
          {
            name: 'contactMail',
            width: 150,
          },
          {
            name: 'signInFlag',
            width: 100,
            className: style['total-price-table-row-field-signInFlag-wrapper'],
            renderer: ({ value }) => {
              if (value) {
                return (
                  <PurStatusTag backgroundColor="rgba(71,184,131,0.15)" color="#179454">
                    <img alt="" src={lineSignInSvg} />
                    <span style={{ fontWeight: 500 }}>
                      {intl.get('ssrc.biddingHall.view.message.signedIn').d('签到')}
                    </span>
                  </PurStatusTag>
                );
              }
              return (
                <PurStatusTag backgroundColor="#E5E7EC" color="#868D9C">
                  <img alt="" src={lineNoSignInSvg} />
                  <span style={{ fontWeight: 500 }}>
                    {intl.get('ssrc.biddingHall.view.message.noSignedIn').d('未签到')}
                  </span>
                </PurStatusTag>
              );
            },
          },
        ]
      : [];

    // 试竞价、正式竞价阶段显示的价格字段
    const showBiddingNodePriceFields =
      !signFieldFlag && !supplementPriceFlag
        ? [
            !sealedQuotationFlag
              ? {
                  name: getBenchmarkPriceTypeField({
                    benchmarkPriceType,
                    includePriceField: 'qtnTotalAmount',
                    netPriceField: 'qtnNetAmount',
                  }),
                  width: 120,
                  align: 'right',
                  renderer: ({ value }) => numberSeparatorRender(value),
                }
              : null,
            !sealedQuotationFlag
              ? {
                  name: getBenchmarkPriceTypeField({
                    benchmarkPriceType,
                    includePriceField: 'firstQtnTotalAmount',
                    netPriceField: 'firstQtnNetAmount',
                  }),
                  width: 120,
                  align: 'right',
                  renderer: ({ value }) => numberSeparatorRender(value),
                }
              : null,
            {
              name: 'quotationCount',
              width: 80,
              align: 'right',
            },
          ].filter(Boolean)
        : [];

    // 补充单价阶段显示字段
    const showSupplementNodePriceFields = supplementPriceFlag
      ? [
          {
            name: getBenchmarkPriceTypeField({
              benchmarkPriceType,
              includePriceField: 'lastHistoryQtnTotalAmount',
              netPriceField: 'lastHistoryQtnNetAmount',
            }),
            width: 120,
            align: 'right',
            renderer: showSealedQuotationFieldValue,
          },
          {
            name: getBenchmarkPriceTypeField({
              benchmarkPriceType,
              includePriceField: 'qtnTotalAmount',
              netPriceField: 'qtnNetAmount',
            }),
            width: 120,
            align: 'right',
            renderer: showNewPriceFieldValue,
          },
          {
            name: getBenchmarkPriceTypeField({
              benchmarkPriceType,
              includePriceField: 'differenceAmount',
              netPriceField: 'differenceNetAmount',
            }),
            width: 120,
            align: 'right',
            renderer: showDifferenceAmountFieldValue,
          },
        ].filter(Boolean)
      : [];

    let totalFields =  [
      {
        header: intl.get('ssrc.biddingHall.model.supplierCompanyName').d('供应商名称'),
        name: 'supplierInfoWrapper',
        align: 'left',
        aggregation: true,
        aggregationLimit: 2,
        minWidth: 200,
        tooltip: 'none',
        renderer: ({ record }) => {
          const {
            onlineFlag,
            signInFlag,
            prohibitQuotationFlag,
            repeatIpFlag,
            displaySupplierName,
          } = record.get([
            'onlineFlag',
            'signInFlag',
            'prohibitQuotationFlag',
            'repeatIpFlag',
            'displaySupplierName',
          ]);

          const rankProps = {
            remote,
            biddingRuleDataSet,
            record,
            header,
          };

          return (
            <div className={style['total-price-table-row-field-supplierInfoDetail-wrapper']}>
              {!signFieldFlag && <RankSvgComponent {...rankProps} />}
              <div className={style['total-price-table-row-supplier-title']}>
                <Popover content={displaySupplierName}>
                  <span className={style['total-price-table-row-supplier-name']}>
                    {displaySupplierName}
                  </span>
                </Popover>
                <br />
                <div className={style['total-price-table-row-supplier-status']}>
                  {/* 在线 ｜ 离线 */}
                  {onlineFlag ? (
                    <PurStatusTag backgroundColor="rgba(71,184,131,0.15)" color="#179454">
                      {intl.get('ssrc.biddingHall.view.tag.online').d('在线')}
                    </PurStatusTag>
                  ) : (
                    <PurStatusTag backgroundColor="#E5E7EC" color="#4E5769">
                      {intl.get('ssrc.biddingHall.view.tag.offline').d('离线')}
                    </PurStatusTag>
                  )}
                  {!signFieldFlag && (
                    <>
                      {/* 签到  */}
                      {!!signInFlag && (
                        <Tooltip
                          title={intl.get('ssrc.biddingHall.view.message.signedIn').d('已签到')}
                        >
                          <img alt="" src={signInSvg} />
                        </Tooltip>
                      )}
                      {/* 禁止报价 */}
                      {!!prohibitQuotationFlag && (
                        <Tooltip
                          title={intl
                            .get('ssrc.biddingHall.view.button.banQuotation')
                            .d('禁止报价')}
                        >
                          <img alt="" src={forbidQuotationSvg} />
                        </Tooltip>
                      )}
                      {useNewRateFlag ? (
                        repeatIpFlag ? (
                          <Tooltip
                            title={intl
                              .get('ssrc.biddingHall.view.button.abnormalIp')
                              .d('报价IP异常')}
                          >
                            <img alt="" src={abnormalIp} />
                          </Tooltip>
                        ) : (
                          <img alt="" src={greenIp} />
                        )
                      ) : repeatIpFlag ? (
                        <Tooltip
                          title={intl
                            .get('ssrc.biddingHall.view.button.abnormalIp')
                            .d('报价IP异常')}
                        >
                          <img alt="" src={abnormalIp} />
                        </Tooltip>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      ...signStageFields,
      coefficientPriceFlag
        ? {
            name: getBenchmarkPriceTypeField({
              benchmarkPriceType,
              includePriceField: 'priceCoefficientAmount',
              netPriceField: 'priceCoefficientNetAmount',
            }),
            width: 120,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      ...showBiddingNodePriceFields,
      ...showSupplementNodePriceFields,
      !signFieldFlag
        ? {
            name: 'quotedDate',
            width: 150,
            align: 'left',
          }
        : null,
      // 只有试竞价、正式竞价才显示操作按钮
      ['TRIAL_BIDDING', 'BIDDING'].includes(biddingStatus) &&
      !finishFlag &&
      ((allowProhibitQuotation && ['BIDDING'].includes(biddingStatus)) ||
        allowDeleteLatestQuotation)
        ? {
            name: 'operate',
            lock: 'right',
            renderer: ({ record }) => {
              const { quotationCount, prohibitQuotationFlag } = record.get([
                'quotationCount',
                'prohibitQuotationFlag',
              ]);
              // 显示删除最新报价标识
              const showDelNewPriceFlag =
                ['TRIAL_BIDDING', 'BIDDING'].includes(biddingStatus) && quotationCount > 0;
              // 显示禁止报价标识
              const showBanQuotationFlag =
                ['BIDDING'].includes(biddingStatus) && !prohibitQuotationFlag;
              // 不显示禁止报价和最新报价操作标识
              const showDropdownFlag = showDelNewPriceFlag || showBanQuotationFlag;

              return showDropdownFlag ? (
                <Dropdown overlay={getMenu(record)} trigger="click">
                  <Icon type="more_horiz" style={{ cursor: 'pointer' }} />
                </Dropdown>
              ) : null;
            },
          }
        : null,
    ];

    totalFields = remote ? remote.process(
      'SSRC_PURCHASE_BIDDING_HALL_PROCESS_TOTAL_PRICE_COLUMNS',
      totalFields,
      {
        pageProps: props,
      }
    ) : totalFields;
    totalFields = totalFields || [];

    return totalFields.filter(Boolean);
  }, [
    biddingStatus,
    originalStatus,
    sourceMethod,
    benchmarkPriceType,
    totalPriceSupplierListDataSet,
    rankRule,
    showNewPriceFieldValue,
    showSealedQuotationFieldValue,
    showDifferenceAmountFieldValue,
    allowProhibitQuotation,
    allowDeleteLatestQuotation,
  ]);

  // 菜单
  const getMenu = useCallback(
    (record) => {
      const { prohibitQuotationFlag, quotationCount } = record.get([
        'prohibitQuotationFlag',
        'quotationCount',
      ]);
      // 单子关闭、暂停 按钮置灰
      const disabledFlag =
        ['BIDDING_CLOSED', 'BIDDING_PAUSED'].includes(biddingStatus) ||
        ['BIDDING_CLOSED', 'BIDDING_PAUSED'].includes(originalStatus) ||
        prohibitQuotationFlag;
      // 显示删除最新报价标识
      const showDelNewPriceFlag =
        ['TRIAL_BIDDING', 'BIDDING'].includes(biddingStatus) && quotationCount > 0;
      return (
        <Menu onClick={(e) => handleMenuClick(e, record)}>
          {/* 禁止报价显示逻辑 单据状态为报价中&该供应商的报价单头-禁止报价标识为0 */}
          {['BIDDING'].includes(biddingStatus) && allowProhibitQuotation && (
            <Menu.Item key="banQuotation" disabled={prohibitQuotationFlag}>
              {intl.get('ssrc.biddingHall.view.button.banQuotation').d('禁止报价')}
            </Menu.Item>
          )}
          {/* 删除最新报价显示逻辑 单据状态为报价中&供应商对目前行状态为进行中的物料有过报价记录时展示按钮(单价竞价时) */}
          {showDelNewPriceFlag && allowDeleteLatestQuotation && (
            <Menu.Item key="deleteNewQuotation" disabled={disabledFlag}>
              {intl.get('ssrc.biddingHall.view.button.deleteNewQuotation').d('删除最新报价')}
            </Menu.Item>
          )}
        </Menu>
      );
    },
    [
      biddingStatus,
      originalStatus,
      handleMenuClick,
      allowDeleteLatestQuotation,
      allowProhibitQuotation,
    ]
  );

  // 菜单点击
  const handleMenuClick = useCallback(
    (e, record) => {
      const { rfxLineSupplierId, biddingSupHeaderCurId, biddingSupHeaderId, displaySupplierName } =
        record?.get([
          'rfxLineSupplierId',
          'biddingSupHeaderCurId',
          'biddingSupHeaderId',
          'displaySupplierName',
        ]) || {};
      const commonProps = totalPriceSupplierListDataSet.getQueryParameter('commonProps');
      // 禁止报价
      if (e.key === 'banQuotation') {
        const content = intl
          .get('ssrc.biddingHall.view.title.confirmProhibition', {
            supplierCompanyName: displaySupplierName,
          })
          .d('是否确认禁止{supplierCompanyName}报价？');
        Modal.confirm({
          key: rfxLineSupplierId,
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: content,
          destroyOnClose: true,
          onOk() {
            const formDS = new DataSet(banQuotationDS({ ...commonProps, rfxLineSupplierId }));
            return ModalPro.open({
              drawer: true,
              destroyOnClose: true,
              closable: true,
              title: intl.get('ssrc.biddingHall.view.button.banQuotation').d('禁止报价'),
              children: <BanQuotation formDS={formDS} />,
              style: { width: '380px' },
              okProps: {
                wait: 2000,
                waitType: 'throttle',
              },
              onOk: async () => {
                toggleLoading(true);
                const validate = await formDS.validate();
                if (!validate) {
                  toggleLoading(false);
                  return false;
                }
                try {
                  const res = await formDS.submit();
                  toggleLoading(false);
                  if (getResponse(res)) {
                    totalPriceSupplierListDataSet.query();
                  }
                } catch (err) {
                  toggleLoading(false);
                  throw err;
                }
              },
            });
          },
        });
      }
      if (e.key === 'deleteNewQuotation') {
        // 删除最新报价
        return Modal.confirm({
          key: rfxLineSupplierId,
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('ssrc.biddingHall.view.title.isDeleteNewPrice', {
              supplierCompanyName: displaySupplierName,
            })
            .d('是否确认删除{supplierCompanyName}的最新报价？'),
          destroyOnClose: true,
          okProps: {
            wait: 2000,
            waitType: 'throttle',
          },
          onOk() {
            toggleLoading(true);
            return deleteTotalPriceSupplierNewPrice({
              ...commonProps,
              biddingSupHeaderCurId,
              biddingSupHeaderId,
              rfxLineSupplierId,
              trialBiddingFlag,
              biddingType,
              biddingTotalPricePrinciple,
            })
              .then((res) => {
                if (getResponse(res)) {
                  bidCountDataSet.query();
                  totalPriceSupplierListDataSet.query();
                }
                toggleLoading(false);
              })
              .catch((err) => {
                toggleLoading(false);
                throw err;
              });
          },
          onCancel() {
            toggleLoading(false);
          },
          onClose() {
            toggleLoading(false);
          },
        });
      }
    },
    [
      toggleLoading,
      totalPriceSupplierListDataSet,
      trialBiddingFlag,
      biddingType,
      biddingTotalPricePrinciple,
    ]
  );

  // 筛选器查询
  // const tableSearchQuery = useCallback(
  //   (params = {}) => {
  //     if (!totalPriceSupplierListDataSet) {
  //       return;
  //     }

  //     totalPriceSupplierListDataSet.setQueryParameter('advanced', params || {});
  //     setListLoading(true);
  //     totalPriceSupplierListDataSet
  //       .query()
  //       .then(() => {
  //         setListLoading(false);
  //       })
  //       .catch(() => {
  //         setListLoading(false);
  //       });
  //   },
  //   [totalPriceSupplierListDataSet]
  // );

  // 竞价历史图表分析参数
  const historyChartProps = {
    // commonProps,
    header,
    type: 'PURCHASE',
    biddingRuleDataSet,
    itemLineListDS: totalPriceSupplierListDataSet,
    beforeBiddingOnGoingFlag,
  };

  return (
    <div className={style['pur-main-content-bidding-list-supplier-wrapper']}>
      {numberOfBids ? (
        <div className={style['pur-main-content-bidding-list-supplier-header-wraps']}>
          <PurBiddingHistoryChart {...historyChartProps} />
        </div>
      ) : (
        ''
      )}
      <div className={style['pur-main-content-bidding-list-supplier-table-wrapper']}>
        <Table
          rowKey="rfxLineSupplierId"
          dataSet={totalPriceSupplierListDataSet}
          columns={columns}
          spin={{
            spinning: false,
          }}
          aggregation
          bordered={false}
          customizable
          customizedCode="SSRC.BIDDING_HALL.TOTAL_PRICE_SUPPLIER_LIST"
          // style={getTableFixSelfAdaptStyle()?.searchBarTableMaxHeight}
        />
      </div>
      {/* <SearchBarTable
        clearButton
        searchCode={getPurCustomizeUnitCode('TotalPriceSupplierTableSearch')}
        onQuery={tableSearchQuery}
        fieldProps={{}}
        showLoading={false}
        spin={{
          spinning: listLoading,
        }}
        queryBar="none"
        searchBarConfig={{
          autoQuery: false,
          closeFilterSelector: true, // 不能切换筛选 和新建筛选了
          // defaultExpand: false,
          onQuery: tableSearchQuery,
          // left: {
          //   render: (_, ds) => leftRender(ds, tableSearchQuery),
          // },
          expandable: false,
        }}
        bordered={false}
        aggregation
        // custLoading={custLoading}
        rowKey="rfxLineSupplierId"
        // style={{ maxHeight: 'calc(100vh - 200px)' }}
        // rowHeight={62}
        dataSet={totalPriceSupplierListDataSet}
        columns={columns}
        style={getTableFixSelfAdaptStyle()?.searchBarTableMaxHeight}
      /> */}
    </div>
  );
});

export default TotalPriceSupplierList;
