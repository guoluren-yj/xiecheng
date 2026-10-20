/*
 * @author: biao.zhu@going-link.com
 * @Date: 2024-12-05 16:19:04
 * @LastEditTime: 2025-02-17 09:30:00
 * @Description:新版开标弹框
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { useImperativeHandle, forwardRef, useEffect, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Tag } from 'choerodon-ui';
import { noop, compose, isEmpty } from 'lodash';
import querystring from 'querystring';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { PRIVATE_BUCKET } from '_utils/config';
import EmbedPage from '_components/EmbedPage';
import { getActiveTabKey } from 'utils/menuTab';
import DynamicButtons from '_components/DynamicButtons';
import OpeningBid from '@/routes/ssrc/InquiryHallNew/OpeningBid';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
// import formatterCollections from 'utils/intl/formatterCollections';
import { Modal, useDataSet, Table, Button, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

// import quotationDetail from '@/routes/ssrc/RFSupplierQuotation/QueryDetail';
import closeRfxDrawer from '@/routes/ssrc/InquiryHallNew/CloseRfxDrawer';
import useBidAnnouncementModal from '@/routes/ssrc/components/BidAnnouncement';

import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

import { beginOpenedRoundQuotation } from '@/services/expertScoringService';
import {
  // closeRfx,
  openingBid,
  openingSecBid,
  startNextRfxStatus,
  sendOpenedExpertScore,
} from '@/services/inquiryHallService';
import {
  fetchSctionList,
  fetchScExecutionList,
  fetchBidOpenExecution,
} from '@/services/inquiryHallNewService';

import { executionTableDS, listDS } from './store';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
// 开标执行情况

const Execution = compose()(
  // formatterCollections({
  //   code: ['ssrc.expert'],
  // })
  forwardRef((props, ref) => {
    const { data, sourceKey, customizeTable = noop, customizeTableCode = '', modal } = props || {};
    const { rfxHeaderId, rfxStatus } = data || {};
    if (!rfxHeaderId) return null;
    const ds = useDataSet(() => executionTableDS({ rfxHeaderId }), [rfxHeaderId]);
    const [firstAllOpened, setFirstAllOpend] = useState(false);

    useImperativeHandle(ref, () => ({
      ds,
    }));

    const renderOpenTag = useCallback((value, meaning) => {
      return <Tag color={value === 1 ? 'green' : 'red'}>{meaning}</Tag>;
    }, []);

    // 查询新专家评分开标状态状态
    const fetchBidOpenExecutionStatus = async () => {
      if (!rfxHeaderId) return;
      try {
        const ras = await fetchBidOpenExecution({ rfxHeaderId, organizationId });
        if (getResponse(ras)) {
          setFirstAllOpend(ras?.firstAllOpened);
        }
      } catch (e) {
        throw e;
      }
    };

    useEffect(() => {
      ds.query();
      fetchBidOpenExecutionStatus();
    }, [modal]);

    const columns = [
      {
        name: 'realName',
      },
      {
        name: 'loginName',
      },
      {
        name: 'viewItemDetail',
        renderer: ({ record }) => {
          const secondFlag = firstAllOpened === 1 && rfxStatus === 'OPEN_BID_PENDING';
          const meaning = secondFlag
            ? record.get('secondOpenedFlagMeaning')
            : record.get('openedFlagMeaning');
          const code = secondFlag ? record.get('secondOpenedFlag') : record.get('openedFlag');
          return renderOpenTag(code, meaning);
        },
      },
    ];

    const tableProps = {
      columns,
      dataSet: ds,
      pagination: false,
      style: { maxHeight: `clac(100vh - 450px)` },
    };
    // if (ds?.totalCount === 1) {
    //   return null;
    // }
    return customizeTable(
      {
        code:
          customizeTableCode || `SSRC.${sourceKey}_HALL.NEW_LIST.NEW_BID_OPEN_MODAL_EXECUTION_LIST`,
      },
      <Table {...tableProps} />
    );
  })
);

// 开标一览表
const List = compose(
  withCustomize({
    unitCode: [
      'SSRC.INQUIRY_HALL_DETAIL.NEW_OPEN_BID_LIST.TABLE',
      'SSRC.INQUIRY_BID_DETAIL.NEW_OPEN_BID_LIST.TABLE',
    ],
  })
)(
  forwardRef((props, ref) => {
    const {
      data,
      modal,
      bidExcutionStatusMap,
      // sourceKey,
      customizeTable = null,
      custLoading,
      bidFlag,
    } = props || {};
    const { rfxHeaderId, quotationScope, openBidOrder } = data || {};
    const { firstAllOpened, secondAllOpened } = bidExcutionStatusMap || {};
    if (!rfxHeaderId) return null;
    const allQuotationFlag = quotationScope === 'ALL_QUOTATION';

    const customizeTableCode = bidFlag
      ? 'SSRC.INQUIRY_BID_DETAIL.NEW_OPEN_BID_LIST.TABLE'
      : 'SSRC.INQUIRY_HALL_DETAIL.NEW_OPEN_BID_LIST.TABLE';

    useEffect(() => {
      ds.query();
    }, [modal, customizeTableCode]);

    const ds = useDataSet(() => listDS({ rfxHeaderId, customizeTableCode }), [
      rfxHeaderId,
      customizeTableCode,
    ]);

    useImperativeHandle(ref, () => ({ ds }));

    const columns = [
      {
        name: 'supplierCompanyNum',
        renderer: ({ record }) => record?.get('supplierCompanyNum') || record?.get('supplierNum'),
      },
      {
        name: 'supplierCompanyName',
        renderer: ({ record }) => record?.get('supplierCompanyName') || record?.get('supplierName'),
      },
      !allQuotationFlag && {
        name: 'assignItemCountConcatQuotedCount',
        // 全部报价不显示该字段
      },
      {
        name: 'techAttachmentUuid',
        renderer: ({ record }) => {
          if (record.get('hideTechAttachmentFlag')) return '***';
          return (
            <Attachment
              readOnly
              record={record}
              funcType="link"
              name="techAttachmentUuid"
              fileSize={FIlESIZE}
              bucketName={PRIVATE_BUCKET}
              // bucketDirectory="ssrc-rfx-prequal"
              viewMode="popup"
              {...ChunkUploadProps}
            />
          );
        },
      },
      {
        name: 'businessAttachmentUuid',
        renderer: ({ record }) => {
          if (record.get('hideBusinessAttachmentFlag')) return '***';
          return (
            <Attachment
              readOnly
              record={record}
              funcType="link"
              name="businessAttachmentUuid"
              fileSize={FIlESIZE}
              bucketName={PRIVATE_BUCKET}
              // bucketDirectory="ssrc-rfx-prequal"
              viewMode="popup"
              {...ChunkUploadProps}
            />
          );
        },
      },
      {
        name: 'currencyCode',
      },
      {
        name: 'supplierTotalAmount',
      },
      // 全部报价才显示该字段
      allQuotationFlag && {
        name: 'quotationRank',
      },
      {
        name: 'quotationDetail',
        renderer: ({ record }) => {
          // <quotationDetail />;
          const {
            hideQuotationDetailFlag,
            rfxHeaderId: _rfxHeaderId = '',
            quotationHeaderId = '',
            supplierId = '',
            supplierCompanyId = '',
          } = record.get([
            'rfxHeaderId',
            'quotationHeaderId',
            'supplierId',
            'supplierCompanyId',
            'hideQuotationDetailFlag',
          ]);
          if (hideQuotationDetailFlag) return '***';
          // 先商务后技术 && 存在二阶段 && 并且一阶段已开标 && 二阶段未开标
          const hideTechFileFlag =
            openBidOrder === 'BUSINESS_FIRST' && firstAllOpened && !secondAllOpened ? 1 : 0;
          const pathname = `/pub/ssrc/supplier-reply/query/null?rfxHeaderId=${_rfxHeaderId}&pageType=SUPPLIER_DETAIL_QUERY&quotationHeaderId=${quotationHeaderId}&supplierCompanyId=${supplierCompanyId}&supplierId=${supplierId}&externalModalFlag=1&historyDestroyAllFlag=0&hideTechFileFlag=${hideTechFileFlag}`;
          const handleClick = () =>
            Modal.open({
              key: Modal.key(),
              style: { width: '80%' },
              drawer: true,
              closable: true,
              children: (
                <div>
                  <EmbedPage
                    href={pathname}
                    match={{ params: { rfxId: rfxHeaderId, path: null } }}
                    // location={{
                    //   search: `?${search}`,
                    // }}
                  />
                </div>
              ),
              footer: null,
            });
          return (
            <Button funcType="link" onClick={handleClick} disabled={!quotationHeaderId}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细')}
            </Button>
          );
        },
      },
    ];
    const tableProps = {
      columns,
      dataSet: ds,
      custLoading,
      // style: {maxHeight: `clac(100vh - 450px)`},
    };

    return customizeTable ? (
      customizeTable(
        {
          code: customizeTableCode,
        },
        <Table {...tableProps} />
      )
    ) : (
      <Table {...tableProps} />
    );
  })
);

const cardRender = (cardList) => {
  return (cardList || []).map(({ title, compnent }) => (
    <div className={styles['bid-card']}>
      <div className="bid-card-title">
        <div className="line" />
        <div>{title}</div>
      </div>
      <div>{compnent}</div>
    </div>
  ));
};

const BidOpen = observer((props) => {
  const {
    data,
    modal,
    bidFlag,
    remote,
    // callback,
    sourceKey,
    documentTypeName,
    serviceChargeFlag,
    openingBidDS,
    bidListRef,
    bidExcutionRef,
    allQuery = noop,
    customizeBtnGroup = noop,
    showExpertModal = noop,
    resendPasswordFuc = noop,
  } = props || {};

  const [loading, setLoading] = useState(true); // loading
  const [hasPasswordFlag, setPasswordFlag] = useState(false);
  const [bidExcutionStatusMap, setBidStatus] = useState(null); // 查询新开标状态
  const [showwExecutionListFlag, setExecutionFlag] = useState(false); // 查询新开标状态

  const {
    pretrialFlag,
    openBidOrder,
    expertScoreType,
    rfxStatus = '',
    passwordFlag = 0,
    checkUserFlag = null,
    rfxHeaderId = null,
    roundQuotationRule,
    currentUserIsOpenFlag,
    currentUserIsRfxFlag,
    projectLineSectionId = null,
  } = data || {};

  // 查询新专家评分开标状态状态
  const fetchBidOpenExecutionStatus = async () => {
    setLoading(true);
    if (!rfxHeaderId) return;
    try {
      const ras = await fetchBidOpenExecution({ rfxHeaderId, organizationId });
      if (getResponse(ras)) {
        setBidStatus(ras);
        setLoading(false);
      }
    } catch (e) {
      throw e;
    }
  };

  // 初始化查询
  useEffect(() => {
    getPasswordFlag();
    fetchScExecutionList({ rfxHeaderId, organizationId }).then((res) => {
      if (getResponse(res)) {
        setExecutionFlag(!(res && res.length === 1));
      }
    });
    fetchBidOpenExecutionStatus();
  }, []);

  const getPasswordFlag = useCallback(async () => {
    let sectionList = [];
    let res = {};
    if (projectLineSectionId) {
      res = getResponse(
        await fetchSctionList({
          rfxStatus: 'OPEN_BID_PENDING',
          organizationId,
          rfxHeaderId,
        })
      );
      if (!res || res.failed || isEmpty(data)) {
        return false;
      }
      sectionList = res.projectLineSectionList;
    }
    // 是否加密标识
    const flag = sectionList?.length
      ? sectionList.some((item) => item.passwordFlag)
      : passwordFlag !== 0;
    setPasswordFlag(flag);
  }, [projectLineSectionId]);

  const { openBidAnnouncementModal } = useBidAnnouncementModal();

  const OpeningBidProps = {
    openingBidDS,
    bidFlag,
  };

  // // 侧弹框页面刷新
  // const refreshBidModal = () => {
  //   if (bidListRef?.current?.ds && bidExcutionRef?.current?.ds) {
  //     bidListRef.current.ds.query();
  //     bidExcutionRef.current.ds.query();
  //     fetchBidOpenExecutionStatus();
  //   }
  //   if (allQuery) {
  //     allQuery();
  //   }
  // };

  // 关闭所有弹框，页面刷新
  const refreshPage = () => {
    if (allQuery) {
      allQuery();
    }
    Modal.destroyAll();
  };

  const handleOpenBid = async ({ bidOrder }) => {
    if (hasPasswordFlag) {
      const validate = await openingBidDS.validate();
      if (!validate) return false;
    }
    const openBid = bidOrder === 'first' ? openingBid : openingSecBid;
    const openPassword = openingBidDS?.current?.get('openPassword');
    const response = getResponse(
      await openBid({
        rfxHeaderId,
        openPassword: hasPasswordFlag ? openPassword : undefined,
      })
    );
    if (response === 0) {
      notification.warning({
        message: `${intl
          .get('ssrc.inquiryHall.view.batchOpenButNotLastOne')
          .d('您已完成开标,请等候其他开标员开标')}!`,
      });
      // refreshBidModal();
      refreshPage();
      return true;
    }
    if (response === 1) {
      refreshPage();
      return true;
    }
    return false;
  };

  // 打开开标弹框：【确认】【重发密码】【转交】【取消】
  const handleOpenBidModal = ({ bidOrder }) => {
    return Modal.confirm({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
      children: hasPasswordFlag ? (
        <OpeningBid {...OpeningBidProps} />
      ) : (
        intl.get(`ssrc.inquiryHall.view.message.confirm.openingBid`).d('是否确认开标')
      ),
      onOk: () => handleOpenBid({ bidOrder }),
      footer: (okBtn, cancelBtn) => [
        <Button onClick={showExpertModal} type="c7n-pro" icon="call_missed_outgoing">
          {intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交')}
        </Button>,
        hasPasswordFlag && (
          <Button onClick={() => resendPasswordFuc(data)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.resendPassword`).d('重发密码')}
          </Button>
        ),
        cancelBtn,
        okBtn,
      ],
    });
  };

  // 关闭询价单
  const handleCloseRfx = async () => {
    // return closeInquiryListDrawer(data);
    // const { rfxHeaderId } = data;
    return closeRfxDrawer(
      rfxHeaderId,
      () => {
        // this.afterCloseConditionQuery(onGoingStatus);
        refreshPage();
      },
      documentTypeName,
      sourceKey,
      serviceChargeFlag,
      remote
    );
  };

  // 开始评分
  const handleStartScore = () => {
    Modal.confirm({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.expertScoring.view.modal.button.startScore`).d('开始评分'),
      children: intl
        .get(`ssrc.expertScoring.view.message.confirm.startScore`)
        .d('是否确认开始评分'),
      onOk: async () => {
        const startScoreRes = await sendOpenedExpertScore({
          rfxHeaderId,
          organizationId,
        });
        const ras = getResponse(startScoreRes);
        if (ras) {
          refreshPage();
        }
        return false;
      },
    });
  };

  // 发起多轮报价
  const handleRoundQuotation = () => {
    Modal.confirm({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.common.model.common.roundQuotation`).d('多轮报价'),
      // Multi-Round Quotation
      children: intl
        .get(`ssrc.expertScoring.view.message.confirm.roundQuotation`)
        .d('是否确认多轮报价'),
      onOk: async () => {
        const startRoundRes = await beginOpenedRoundQuotation({
          sourceHeaderId: rfxHeaderId,
        });
        const ras = getResponse(startRoundRes);
        if (ras) {
          refreshPage();
          handleGoRoundQuotation();
        }
        return false;
      },
    });
    // opened/begin-round-quotation
  };

  // 进入多轮报价
  const handleGoRoundQuotation = () => {
    const { history } = props;
    const {
      // rfxHeaderId,
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      sourceHeaderId,
      // currentUserIsOpenFlag,
      // projectLineSectionId,
    } = data;
    const search = querystring.stringify({
      showArrFlag: 'hidden',
      evaluateLeaderFlag,
      cachTabKey: 'scoreing',
      sourceFrom: 'RFX',
      sourceHeaderId: sourceHeaderId || rfxHeaderId,
      sourceStatus: 'ROUND_QUOTATION',
      sourcePage: 'RFXList',
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
      currentUserIsOpenFlag,
      menuTitle: intl.get(`ssrc.common.model.common.roundQuotation`).d('多轮报价'),
    });
    history.push({
      pathname: `${getActiveTabKey()}/rfx-evaluation-proc-manage/${sourceHeaderId || rfxHeaderId}`,
      search,
    });
  };

  // 唱标
  const handleBidAnnouncement = () => {
    openBidAnnouncementModal({
      rfxHeaderId,
    });
  };

  // 开始评审
  const handlePretrial = async () => {
    const result = getResponse(
      await startNextRfxStatus({
        organizationId,
        rfxHeaderId,
        rfxStatus: 'PRETRIAL_PENDING',
      })
    );
    if (result && !result.failed) {
      notification.success();
      Modal.destroyAll();
      allQuery();
    }
  };

  // 开始核价
  const handleCheck = async () => {
    const result = getResponse(
      await startNextRfxStatus({
        organizationId,
        rfxHeaderId,
        rfxStatus: 'CHECK_PENDING',
      })
    );
    if (result && !result.failed) {
      notification.success();
      Modal.destroyAll();
      allQuery();
      // 跳转核价
      const search = querystring.stringify({
        projectLineSectionId,
      });
      if (Number(checkUserFlag) === 1) {
        history.push({
          pathname: `${getActiveTabKey()}/check-price/${rfxHeaderId}`,
          search,
        });
      }
    }
  };

  // const {
  //   firstAllOpened,
  //   secondAllOpened,
  //   currentOpenerFirstOpened,
  //   currentOpenerSecondOpened,
  //   enableBidAnnouncementFlag,
  // } = bidExcutionStatusMap || {};

  const getFooter = () => {
    const {
      firstAllOpened,
      secondAllOpened,
      currentOpenerFirstOpened,
      currentOpenerSecondOpened,
      enableBidAnnouncementFlag,
    } = bidExcutionStatusMap || {};
    // 所有开标员一阶段均已执行开标确认: (不区分) | (先商务后技术 && firstAllOpened = 1) | (先技术后商务 && firstAllOpened = 1)
    //
    const allOpenBiderExecutionFlag =
      openBidOrder === 'SYNC' ||
      (openBidOrder === 'TECH_FIRST' && firstAllOpened === 1) ||
      (openBidOrder === 'BUSINESS_FIRST' && firstAllOpened === 1);
    // 开标: 询价单状态=待开标 && 当前开标员未执行开标
    // const showOpenBidFlag = rfxStatus === 'OPEN_BID_PENDING' && currentExpertExecutionFlag;
    // 一阶段开标: 询价单状态=待开标 && 当前开标员第一阶段未开标
    const showFirstOpenBidFlag = rfxStatus === 'OPEN_BID_PENDING' && currentOpenerFirstOpened === 0;
    // 二阶段开标: 询价单状态=待开标 && 所有开标员第一阶段完成开标 && 当前开标员第二阶段未开标
    const showSecOpenBidFlag =
      rfxStatus === 'OPEN_BID_PENDING' && firstAllOpened === 1 && currentOpenerSecondOpened === 0;
    const showOpenBidFlag = showFirstOpenBidFlag || showSecOpenBidFlag;
    // 关闭询价单：默认展示
    const showCloseRfxFlag = true;
    // 专家评分: 询价单状态=已开标 && 单据包含专家评分节点 && 所有开标员均已执行开标确认
    const showStartScoreFlag =
      rfxStatus === 'OPENED' && expertScoreType === 'ONLINE' && allOpenBiderExecutionFlag;
    // 报价多轮: 前置条件: 单据状态 = 已开标 & 线上专家评分 & 多轮报价规则为评分或自动评分 & 当前为询价员
    const expertScoreFlag =
      rfxStatus === 'OPENED' &&
      expertScoreType === 'ONLINE' &&
      (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') &&
      currentUserIsRfxFlag === 1;

    /**
     * 不区分：前置条件
     * 先商务后技术：前置条件 && 一阶段已开标 && 二阶段未开标
     * 先技术后技商务：前置条件 && 二阶段已开标
     */
    const showRoundQuotationFlag =
      (expertScoreFlag && openBidOrder === 'SYNC') ||
      (expertScoreFlag &&
        openBidOrder === 'BUSINESS_FIRST' &&
        firstAllOpened === 1 &&
        secondAllOpened !== 1) ||
      (expertScoreFlag && openBidOrder === 'TECH_FIRST' && secondAllOpened === 1);
    /**
     * 唱标按钮显示逻辑: 模板中唱标启用 &&
     * (无专家评分：展示 && rfxStatus === 已开标) ||
     * (有专家评分：不区分时开完标展示 ||
     * 有专家评分：区分时在商务开标后展示)
     */
    const showBidAnnouncementFlag =
      enableBidAnnouncementFlag &&
      ((expertScoreType === 'NONE' && rfxStatus === 'OPENED') ||
        (expertScoreType === 'ONLINE' && openBidOrder === 'SYNC' && firstAllOpened === 1) ||
        (expertScoreType === 'ONLINE' && openBidOrder === 'TECH_FIRST' && secondAllOpened === 1) ||
        (expertScoreType === 'ONLINE' &&
          openBidOrder === 'BUSINESS_FIRST' &&
          firstAllOpened === 1));
    // 核价
    // const quotationLineNumber = bidExcutionRef?.current?.ds?.totalCount;
    const showCheckFlag =
      expertScoreType !== 'ONLINE' && pretrialFlag !== 1 && rfxStatus === 'OPENED';
    // 初审
    const showPretrialFlag =
      expertScoreType !== 'ONLINE' && pretrialFlag === 1 && rfxStatus === 'OPENED';
    // 高亮按钮：
    const mainOpts = [
      'openBid',
      'startScore',
      'roundQuotation',
      'bidAnnouncement',
      'pretrial',
      'check',
    ];
    const buttons = [
      showOpenBidFlag && {
        name: 'openBid',
        onClick: handleOpenBidModal,
        btnProps: {
          onClick: () =>
            handleOpenBidModal({ bidOrder: showFirstOpenBidFlag ? 'first' : 'second' }),
        },
        child: intl.get(`ssrc.inquiryHall.view.message.button.openingBid`).d('开标'),
      },
      showStartScoreFlag && {
        name: 'startScore',
        btnProps: { onClick: handleStartScore },
        child: intl.get(`ssrc.expertScoring.view.modal.button.startScore`).d('开始评分'),
      },
      showRoundQuotationFlag && {
        name: 'roundQuotation',
        btnProps: { onClick: handleRoundQuotation },
        child: intl.get(`ssrc.inquiryHall.view.message.button.roundQuotation`).d('多轮报价'),
      },
      showPretrialFlag
        ? {
            name: 'pretrial',
            btnProps: { onClick: handlePretrial },
            child: intl.get(`ssrc.inquiryHall.view.message.button.startPretrial`).d('开始初审'),
          }
        : showCheckFlag
        ? {
            name: 'check',
            btnProps: { onClick: handleCheck },
            child: bidFlag
              ? intl.get(`ssrc.bidHall.view.button.start`).d('开始定标')
              : intl.get(`ssrc.inquiryHall.view.message.button.startCheckPrice`).d('开始核价'),
          }
        : false,
      showBidAnnouncementFlag && {
        name: 'bidAnnouncement',
        btnProps: { onClick: handleBidAnnouncement },
        child: intl.get('ssrc.common.model.common.bidAnnouncement').d('唱标'),
      },
      showCloseRfxFlag && {
        name: 'close',
        btnProps: { onClick: handleCloseRfx },
        child: bidFlag
          ? intl.get('ssrc.inquiryHall.view.message.button.closeBid').d('关闭招标书')
          : intl.get('ssrc.inquiryHall.view.message.button.closeRfx').d('关闭询价单'),
      },
      {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: { onClick: () => modal.close(true) },
      },
      // {
      //   name: 'name',
      //   child: intl.get('hzero.common.button.refresh').d('刷新'),
      //   btnProps: { onClick: refreshBidModal },
      // },
    ]
      .filter((i) => Boolean(i))
      .map((i, idx, arr) => {
        // 如果同时有 开始评分和多轮报价，且没有开标，都不显示高亮 TODO
        const keys = arr.map((j) => j.name);
        const ScoreRoundQuotationFlag =
          !keys.includes('openBid') &&
          keys.includes('startScore') &&
          keys.includes('roundQuotation');
        const highlightColor = ScoreRoundQuotationFlag
          ? 'default'
          : mainOpts.includes(i.name) && idx === 0
          ? 'primary'
          : 'default';
        return {
          ...i,
          btnProps: { ...(i?.btnProps || {}), color: highlightColor },
        };
      });

    return customizeBtnGroup(
      {
        // code: `SSRC.${sourceKey}_HALL.NEW_LIST.NEW_BID_OPEN_MODAL_BUTTONS`,
        code: '',
        pro: true,
      },
      <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
    );
  };

  useEffect(() => {
    if (modal && modal.update && !loading && bidExcutionStatusMap) {
      // fetchBidOpenExecutionStatus();
      modal.update({
        footer: getFooter(),
      });
    }
  }, [
    modal,
    loading,
    hasPasswordFlag,
    bidExcutionStatusMap,
    // sourceKey,
    // modal,
    // openBidOrder,
    // rfxStatus,
    // expertScoreType,
    // roundQuotationRule,
  ]);

  if (!rfxHeaderId) return null;

  return (
    <div>
      {cardRender(
        [
          showwExecutionListFlag && {
            title: intl
              .get('ssrc.inquiryHall.view.message.modal.openingBid.execution')
              .d('开标执行情况'),
            compnent: <Execution ref={bidExcutionRef} modal={modal} {...props} />,
          },
          {
            title: intl.get('ssrc.inquiryHall.view.message.modal.openingBid.list').d('开标一览表'),
            compnent: (
              <List
                ref={bidListRef}
                modal={modal}
                {...props}
                bidExcutionStatusMap={bidExcutionStatusMap}
              />
            ),
          },
        ].filter((i) => Boolean(i))
      )}
    </div>
  );
});

// 开标情况：开标前 ｜ 自己执行开标后，但有其他开标员未开标 ｜ 自己执行开标后，且全部开标员均已开标
const openNewBidModal = async (props) => {
  const modal = Modal.open({
    title: intl.get(`ssrc.inquiryHall.view.message.button.openingBid`).d('开标'),
    closable: true,
    style: { width: 749 },
    drawer: true,
    children: <BidOpen modal={modal} {...props} />,
    footer: null,
  });
  return modal;
};

export { openNewBidModal, Execution, List };
