import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import intl from 'utils/intl';
import classnames from 'classnames';
import querystring from 'querystring';
import { compose, isEmpty } from 'lodash';
import notification from 'utils/notification';
import { Modal, DataSet, Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { BID, INQUIRY } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';
import SectionBidding from '@/routes/ssrc/InquiryHallNew/SectionBidding';
import { openingDS } from '@/routes/ssrc/InquiryHallNew/OpeningBidDS';
import { fetchSctionList } from '@/services/inquiryHallNewService';
import { ReactComponent as OpenBidSvg } from '@/assets/openBid.svg';
import OpeningBid from './components/PasswordBidding';

import TransferButton from './components/TransferButton';
import ResendPassButton from './components/ResendPassButton';
import { openBidValidateTips, renderNoPassTipContent, getOpenBidData } from './utils';

import Style from './index.less';

/**
 * 适配角色工作台改造
 * RFQ开标路有入口文件
 * 路有参数：（从record中取）传下面定义的record里面的字段
 */
const Index = ({
  location: { search } = {},
  match: { params: { rfxHeaderId } = {} } = {},
  sourceKey,
}) => {
  const searchParams = querystring.parse(search?.substr(1)) || {};
  const transferPermissionCodePrefix = `ssrc.new-${
    sourceKey === BID ? 'bid' : 'inquiry'
  }-hall.list`;

  const openingBidDS = useMemo(() => new DataSet(openingDS()), [rfxHeaderId]);

  const {
    openedFlag = 0,
    passwordFlag = 0,
    sectionName = null,
    projectLineSectionId = null,
  } = searchParams; // searchParams 是从路径上传来的取自行上数据字段的参数 相当于record

  const bidFlag = useMemo(() => sourceKey === BID, [sourceKey, rfxHeaderId]);

  const record = useMemo(() => {
    return {
      openedFlag: Number(openedFlag || 0),
      passwordFlag: Number(passwordFlag || 0),
      rfxHeaderId,
      sectionName,
      projectLineSectionId,
    };
  }, [openedFlag, passwordFlag, rfxHeaderId, sectionName, projectLineSectionId]);

  const organizationId = getCurrentOrganizationId();

  const sectionBiddingRef = useRef({});
  const [noPassContentVisible, setNoPassContentVisible] = useState(false); // 无密码渲染内容标识
  const [passContentVisible, setPassContentVisible] = useState(false); // 有密码渲染内容标识
  const [sectionContentVisible, setSectionContentVisible] = useState(false); // 多标段渲染内容标识
  const [batchSectionFlag, setBatchSectionFlag] = useState(false); // 是否是多标段
  const [multipleLotList, setMultipleLotList] = useState([]); // 多标段列表

  // 转交props
  const transferButtonProps = {
    sectionBiddingRef,
    transferPermissionCodePrefix,
    record,
    organizationId,
    bidFlag,
    sourceKey,
  };

  // 重发密码props
  const resendPassButtonProps = {
    rfxHeaderId,
    organizationId,
    sectionBiddingRef,
  };

  useEffect(() => {
    initPage();
  }, []);

  // 初始化内容
  const initPage = async () => {
    if (!rfxHeaderId) {
      return;
    }
    // 点击开标校验前提示 openedFlag为1 已开标；passwordFlag null 不在开标人列表
    const isNextStepFlag = openBidValidateTips(record);
    if (isNextStepFlag) return;

    let res = {};
    if (projectLineSectionId) {
      res = getResponse(
        await fetchSctionList({
          rfxStatus: 'OPEN_BID_PENDING',
          organizationId,
          rfxHeaderId,
        })
      );
    }
    if (!res || res.failed || isEmpty(searchParams)) {
      return;
    }
    const sectionList = res.projectLineSectionList;
    setMultipleLotList(sectionList);
    nextStepOperation(sectionList);
  };

  // 下一步操作
  const nextStepOperation = (sectionList) => {
    if (sectionList && sectionList.length) {
      setSectionContentVisible(true);
    } else if (record.passwordFlag === 0) {
      openNoPasswordBidding();
    } else {
      openPasswordBidding();
    }
  };

  // 多标段开标点击事件
  const handleSectionOpen = ({ hasPasswordFlag }) => {
    setBatchSectionFlag(true);
    return !hasPasswordFlag ? openNoPasswordBidding(true) : openPasswordBidding(true);
  };

  /**
   * 打开无密码弹框
   * @param {*} isBatchSection 是否是多标段点击开标渲染
   */
  const openNoPasswordBidding = useCallback(
    (isBatchSection) => {
      const { state: { checkedList = [], switchValue = false } = {} } =
        sectionBiddingRef.current || {};
      // 判断如果有其他开标可选，则加入本身
      if (checkedList.length && switchValue) {
        checkedList.push(record);
      }
      renderNoPassContent({ checkedList, switchValue, isBatchSection });
    },
    [sectionBiddingRef]
  );

  // 渲染无密码内容
  const renderNoPassContent = useCallback(({ checkedList, switchValue, isBatchSection }) => {
    if (!isBatchSection) {
      setNoPassContentVisible(true);
      return;
    }
    Modal.confirm({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
      children: <div>{renderNoPassTipContent({ checkedList, switchValue })}</div>,
      footer: (okBtn, cancelBtn) => (
        <div>
          <TransferButton {...transferButtonProps} />
          {cancelBtn}
          {okBtn}
        </div>
      ),
      onOk: () => handleConfirmOpeningBid(false),
      onCancel: () => {
        clearBatchOpenBiddingModalData();
      },
    });
  }, []);

  /**
   * 打开密码弹框
   * @param { Boolean } isBatchSection - 是否是多标段点击开标渲染
   */
  const openPasswordBidding = useCallback((isBatchSection) => {
    if (!isBatchSection) {
      setPassContentVisible(true);
      return;
    }

    const OpeningBidProps = {
      openingBidDS,
    };
    Modal.confirm({
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.title.openingBidInter`).d('开标界面'),
      children: <OpeningBid {...OpeningBidProps} />,
      style: { width: '500px' },
      onCancel: () => {
        clearBatchOpenBiddingModalData();
      },
      destroyOnClose: true,
      onOk: () => handleConfirmOpeningBid(true),
      okText: intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          <TransferButton {...transferButtonProps} />
          <ResendPassButton {...resendPassButtonProps} />
          {okBtn}
        </div>
      ),
    });
  }, []);

  // 批量开标，关闭弹窗时候清楚数据
  const clearBatchOpenBiddingModalData = () => {
    const { clearSectionBiddingModalState = () => {} } = sectionBiddingRef.current || {};
    clearSectionBiddingModalState();
  };

  /**
   * 开标确认
   * @param {*} isPassFlag - 是否是密码确认 true 是 false 否
   */
  const handleConfirmOpeningBid = async (isPassFlag = false) => {
    const { state: { checkedList = [], switchValue = false } = {} } =
      sectionBiddingRef.current || {};

    if (isPassFlag) {
      const validate = await openingBidDS.validate();
      if (validate) {
        const openPassword = openingBidDS.current?.get('openPassword');
        const confirmResult = await getConfirmOpenBidData({
          judgeFlag: checkedList && checkedList.length,
          openPassword,
          rfxHeaderId,
          projectLineSectionList: checkedList,
          organizationId,
        });
        return confirmResult;
      } else {
        return false;
      }
    } else {
      const confirmResult = await getConfirmOpenBidData({
        judgeFlag: batchSectionFlag && switchValue,
        projectLineSectionList: checkedList,
        rfxHeaderId,
        organizationId,
      });
      return confirmResult;
    }
  };

  const getConfirmOpenBidData = async (confirmParams) => {
    const result = await getOpenBidData(confirmParams);

    clearBatchOpenBiddingModalData();
    if (result === 1) {
      notification.success();
      Modal.destroyAll();
      setNoPassContentVisible(false);
      setSectionContentVisible(false);
    } else if (result === 0) {
      notification.warning({
        message: `${intl
          .get('ssrc.inquiryHall.view.batchOpenButNotLastOne')
          .d('您已完成开标,请等候其他开标员开标')}!`,
      });
      Modal.destroyAll();
      setNoPassContentVisible(false);
      setSectionContentVisible(false);
    } else {
      return false;
    }
  };

  // 无密码渲染内容
  const noPassContentRender = () => {
    const { state: { checkedList = [], switchValue = false } = {} } =
      sectionBiddingRef.current || {};

    return (
      <>
        <Header
          backPath={null}
          title={intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标')}
        >
          <TransferButton {...transferButtonProps} />
        </Header>
        <Content>
          <div className={classnames(Style['level-vertical-center-container'])}>
            <SvgIcon />
            <div className={classnames(Style['tip-content-text'], Style['tip-txt-style'])}>
              {renderNoPassTipContent({ checkedList, switchValue })}?
            </div>
            <Button onClick={() => handleConfirmOpeningBid(false)} color="primary">
              {intl.get('ssrc.inquiryHall.view.message.title.openingBid').d('开标')}
            </Button>
          </div>
        </Content>
      </>
    );
  };

  // 有密码渲染内容
  const passContentRender = () => {
    const OpeningBidProps = {
      openingBidDS,
    };
    return (
      <>
        <Header
          backPath={null}
          title={intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标')}
        >
          <TransferButton {...transferButtonProps} />
          <ResendPassButton {...resendPassButtonProps} />
        </Header>
        <Content>
          <div className={classnames(Style['level-vertical-center-container'])}>
            <SvgIcon />
            <div className={classnames(Style['tip-content-text'], Style['tip-txt-style'])}>
              {intl.get(`ssrc.inquiryHall.view.message.confirm.sureOpeningBid`).d('是否确认开标')}
            </div>
            <div className={classnames(Style['password-form-button'])}>
              <OpeningBid {...OpeningBidProps} />
              <Button onClick={() => handleConfirmOpeningBid(true)} color="primary">
                {intl.get('ssrc.inquiryHall.view.message.title.openingBid').d('开标')}
              </Button>
            </div>
          </div>
        </Content>
      </>
    );
  };

  // 多标段
  const sectionContentRender = () => {
    const hasPasswordFlag =
      multipleLotList.some((item) => item.passwordFlag) || record.passwordFlag;
    const sectionBiddingProps = {
      onRef: (ref) => {
        sectionBiddingRef.current = ref;
      },
      sectionList: multipleLotList,
      rfxHeaderId,
      sectionName,
    };
    return (
      <>
        <Header
          backPath={null}
          title={intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标')}
        >
          <Button onClick={() => handleSectionOpen({ hasPasswordFlag })} color="primary">
            {intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标')}
          </Button>
        </Header>
        <Content>
          <SectionBidding {...sectionBiddingProps} />
        </Content>
      </>
    );
  };

  return (
    <div className={classnames(Style['ssrc-pub-pages-entry-open-bid-wrapper'])}>
      {noPassContentVisible && noPassContentRender()}
      {passContentVisible && passContentRender()}
      {sectionContentVisible && sectionContentRender()}
    </div>
  );
};

// 图标
const SvgIcon = () => {
  return (
    <span className={classnames(Style['open-bid-svg'])}>
      <OpenBidSvg style={{ width: '268px' }} />
    </span>
  );
};

const HocComponent = (Comp, type = INQUIRY) => {
  return compose(
    formatterCollections({ code: ['hzero.common', 'ssrc.common', 'ssrc.inquiryHall'] }),
    CombineComponent({
      sourceKey: type,
    })
  )(Comp);
};

export default HocComponent(Index);
export { HocComponent, Index };
