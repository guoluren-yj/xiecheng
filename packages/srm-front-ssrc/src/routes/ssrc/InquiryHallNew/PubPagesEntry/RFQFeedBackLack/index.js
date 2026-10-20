import React, { useState, useCallback, useRef } from 'react';
import intl from 'utils/intl';
import querystring from 'querystring';
import { getResponse, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { throttle, isFunction, compose, isNil } from 'lodash';
import { Modal, message, Button } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';

import { getJumpRoutePrefixUrl } from '@/utils/utils';
import CombineComponent from '@/routes/components/CombineComponent';
import SourcingResultDrawer from '@/routes/components/SourcingResultDrawer';
import {
  getQuotationName,
  getDocumentTypeName,
  getSourceName,
  BID,
  INQUIRY,
} from '@/utils/globalVariable';
import BidSourcingResultDrawer from '@/routes/components/SourcingResultDrawer/BidIndex';
import { fetchOldControllerConfig } from '@/services/inquiryHallService';
import {
  createBeforeDirectController,
  validateBeforeDirectController,
} from '@/services/inquiryHallNewService';

import QuoFeedBackLackModal from '../../QuoFeedBackLackModal';
import QuoFeedBackLackModalBid from '../../QuoFeedBackLackModalBid';

/**
 * 适配角色工作台改造
 * RFQ报价响应不足路有入口文件
 * 路有参数：（从record中取）rfxHeaderId、projectLineSectionId、nextRfxStatus、closeRecordFlag
 */
const Index = (props) => {
  const {
    location: { pathname, search } = {},
    match: { params = {} } = {},
    history,
    sourceKey,
  } = props;

  const bidFlag = sourceKey === BID;
  const activeTabKey = getJumpRoutePrefixUrl(pathname);
  const searchParams = querystring.parse(search?.substr(1)) || {};
  const { projectLineSectionId, nextRfxStatus, closeRecordFlag, rfxStatus } = searchParams;

  const organizationId = getCurrentOrganizationId();
  const quotationName = getQuotationName(bidFlag);
  const documentTypeName = getDocumentTypeName(bidFlag);
  const sourceName = getSourceName(bidFlag);

  const sourcingResultDrawerRef = useRef({});

  const [submitLoading, setSubmitLoading] = useState(false);
  const [controlApiSyncFlag, setControlApiSyncFlag] = useState(0);

  // 多标段内容参数
  const sourcingResultDrawerProps = {
    rfxHeaderId: params.rfxHeaderId,
    projectLineSectionId,
    rfxStatus,
    organizationId,
    onRef: (ref) => {
      sourcingResultDrawerRef.current = ref;
    },
  };

  // 单标段内容参数
  const quoLackModalProps = {
    record: {
      rfxHeaderId: params.rfxHeaderId,
      nextRfxStatus,
      closeRecordFlag: Number(closeRecordFlag || 0),
    },
    history,
    organizationId,
    bidFlag,
    projectLineSectionId, // 多轮报价响应不足标识
    sourceName,
    documentTypeName,
    onRef: (ref) => {
      sourcingResultDrawerRef.current = ref;
    },
  };

  // 确定按钮逻辑
  const handleOk = useCallback(async () => {
    const handleSubmit = sourcingResultDrawerRef.current?.handleSubmit;
    if (isFunction(handleSubmit)) {
      setSubmitLoading(true);
      try {
        const adjustTimeMappingRfxHeaderId = await handleSubmit();
        if (!isNil(adjustTimeMappingRfxHeaderId)) {
          // 时间调整
          // 跳转页面 ---- 当存在“时间调整”优先跳转
          directControllerDetail({
            rfxHeaderId: adjustTimeMappingRfxHeaderId,
            projectLineSectionId,
          });
        } else {
          // 关闭弹窗刷新页面
          notification.success();
          // modal.close();
        }
      } catch {
        return false;
      } finally {
        setSubmitLoading(false);
      }
    }
  }, []);

  // 寻源过程控制
  // TODO 过程控制会跳用用三个接口，其中最后一个时间最长(几秒到几十秒)，且存在交互，防抖等手段页无法处理多次掉用，故采用同步判断
  const directControllerDetail = useCallback(
    throttle(async ({ rfxHeaderId }) => {
      const searchObj = {};
      if (projectLineSectionId) {
        searchObj.projectLineSectionId = projectLineSectionId;
      }
      const searchArgs = querystring.stringify(searchObj);

      try {
        const res = getResponse(
          await fetchOldControllerConfig({
            organizationId,
            tenant: getCurrentTenant().tenantNum,
          })
        );
        if (!res) {
          return;
        }
        if (!res.length) {
          const result = getResponse(
            await validateBeforeDirectController({
              organizationId,
              sourceHeaderId: rfxHeaderId,
              sourceFrom: 'RFX',
            })
          );
          if (result) {
            const onOk = async () => {
              if (controlApiSyncFlag === 1) {
                return;
              }
              setControlApiSyncFlag(1);
              const createRes = await createBeforeDirectController({
                organizationId,
                sourceHeaderId: rfxHeaderId,
                sourceFrom: 'RFX',
              });
              setControlApiSyncFlag(0);

              if (createRes) {
                if (!createRes.failed) {
                  const url = `${activeTabKey}/new-rfx-detail-controller/${createRes.adjustRecordId}`;
                  history.push({
                    pathname: url,
                    searchArgs,
                  });
                } else {
                  message.warning(createRes.message);
                }
              }
            };
            if (result.validateResult === 'createAdjustAgain') {
              Modal.confirm({
                key: Modal.key(),
                title: intl
                  .get(`ssrc.inquiryHall.view.message.title.commonAdjustagain`, {
                    documentTypeName,
                    sourceName,
                  })
                  .d(`{documentTypeName}中的部分信息已变更，是否重新发起{sourceName}过程控制？`),
                onOk: () => onOk(),
              });
            } else if (result.validateResult === 'createAdjust') {
              onOk();
            } else if (result.validateResult === 'openAdjust') {
              const url = `${activeTabKey}/new-rfx-detail-controller/${result.adjustRecordId}`;
              history.push({
                pathname: url,
                searchArgs,
              });
            }
          }
        } else {
          history.push({
            pathname: `${activeTabKey}/rfx-detail-controller/${rfxHeaderId}`,
          });
        }
      } catch (error) {
        throw error;
      } finally {
        setControlApiSyncFlag(0);
      }
    }, 1200),
    [projectLineSectionId]
  );

  // 渲染内容区域节点
  const RenderContent = () => {
    if (projectLineSectionId) {
      return bidFlag ? (
        <BidSourcingResultDrawer {...sourcingResultDrawerProps} />
      ) : (
        <SourcingResultDrawer {...sourcingResultDrawerProps} />
      );
    }
    return bidFlag ? (
      <QuoFeedBackLackModalBid {...quoLackModalProps} />
    ) : (
      <QuoFeedBackLackModal {...quoLackModalProps} />
    );
  };

  return (
    <React.Fragment>
      <Header
        backPath={null}
        title={intl
          .get(`ssrc.inquiryHall.view.message.title.commonQuoFeedBackLack`, {
            quotationName,
          })
          .d('{quotationName}响应不足')}
      >
        {submitLoading && (
          <Button color="primary" loading>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        )}
        {!submitLoading && (
          <Button color="primary" onClick={() => handleOk()}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        )}
      </Header>
      <Content>{RenderContent()}</Content>
    </React.Fragment>
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
