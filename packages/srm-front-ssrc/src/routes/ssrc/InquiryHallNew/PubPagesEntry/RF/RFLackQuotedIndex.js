import React, { useCallback } from 'react';
import intl from 'utils/intl';
import { compose, noop } from 'lodash';
import querystring from 'querystring';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { message, Button, Modal, DataSet } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';

import { getJumpRoutePrefixUrl } from '@/utils/utils';
import { getQuotationName, BID, INQUIRY } from '@/utils/globalVariable';
import CloseInquiry from '@/routes/ssrc/InquiryHallNew/RFClose';
import CombineComponent from '@/routes/components/CombineComponent';
import { closeRfDS } from '@/routes/ssrc/InquiryHallNew/RFClose/indexDS';
import {
  toScoreRF,
  validateBeforeDirectControllerRF,
  createBeforeDirectControllerRF,
} from '@/services/inquiryHallNewService';
import RFLackQuotedModal from '@/routes/ssrc/InquiryHallNew/RFLackQuotedModal';

/**
 * 适配角色工作台改造
 * rf报价响应不足路有入口文件
 * 路有参数：rfHeaderId, sourceCategory（RFI、RFP）, quotedSupplierCount, expertScoreType（从record中取）
 */
const Index = (props) => {
  const rFLackQuotedModalRef = React.createRef();
  const {
    location: { pathname, search } = {},
    match: { params: { rfHeaderId } = {} } = {},
    history,
    sourceKey,
  } = props;
  const quotationName = getQuotationName(sourceKey === BID);
  const searchParams = querystring.parse(search?.substr(1)) || {};
  const { sourceCategory } = searchParams;
  const activeTabKey = getJumpRoutePrefixUrl(pathname);
  /**
   * 报价响应不足弹框-确定回调
   */
  const handleLackQuotedModalOk = useCallback(() => {
    const { result } = rFLackQuotedModalRef.current || {};
    if (result === 'closeRF') {
      handleClose();
    } else if (result === 'checkSupplier') {
      closeRoleWorkBenchModal();
      history.push({
        pathname: `${activeTabKey}/rf-check/${sourceCategory}/${rfHeaderId}`,
      });
    } else if (result === 'timeAdjust') {
      directSourcingProcessControl();
    } else if (result === 'expertScore') {
      return toScoreRF({ rfHeaderId }).then((res) => {
        const value = getResponse(res);
        if (value && !value.failed) {
          closeRoleWorkBenchModal();
          notification.success();
        } else {
          return false;
        }
      });
    }
  }, [rfHeaderId, sourceCategory, activeTabKey]);

  // 关闭征询书
  const handleClose = useCallback(() => {
    const closeRfDs = new DataSet(closeRfDS({ rfHeaderId }));

    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssrc.inquiryHall.model.close.rf').d('关闭征询书'),
      children: <CloseInquiry closeRfDs={closeRfDs} />,
      onOk: () => handleCloseOk(closeRfDs),
    });
  }, [rfHeaderId]);

  // 关闭弹框确定
  const handleCloseOk = useCallback(async (closeRfDs) => {
    const validateValue = await closeRfDs.validate();
    if (!validateValue) {
      return false;
    }
    const res = getResponse(await closeRfDs.submit());
    if (res) {
      closeRoleWorkBenchModal(); // 将角色工作台侧弹框关闭
      return true;
    }
    notification.error({
      message: res.message || '',
    });
    return false;
  }, []);

  // 关闭角色工作台弹框
  const closeRoleWorkBenchModal = useCallback(() => {
    const { modal = noop } = props;
    modal.close();
  }, []);
  /**
   * @description: 寻源过程控制链接
   * @param {*}
   */
  const directSourcingProcessControl = useCallback(async () => {
    const params = {
      rfHeaderId,
      sourceCategory,
    };
    try {
      // 校验逻辑
      const res = await validateBeforeDirectControllerRF(params);
      if (res) {
        // 创建时间副本
        const onOk = async () => {
          const result = await createBeforeDirectControllerRF(params);
          if (result && !result.failed) {
            closeRoleWorkBenchModal();
            history.push({
              pathname: `${activeTabKey}/rf-detail-controller/${rfHeaderId}/${sourceCategory}/${result.adjustRecordId}`,
            });
          } else {
            message.warning(result.message);
          }
        };
        if (res.validateResult === 'createAdjustAgain') {
          Modal.confirm({
            key: Modal.key(),
            title: intl
              .get(`ssrc.inquiryHall.view.message.title.adjustAgain`)
              .d(`征询单中的部分信息已变更，是否重新发起寻源过程控制？`),
            onOk: () => onOk(),
          });
        } else if (res.validateResult === 'createAdjust') {
          onOk();
        } else if (res.validateResult === 'openAdjust') {
          closeRoleWorkBenchModal();
          history.push({
            pathname: `${activeTabKey}/rf-detail-controller/${rfHeaderId}/${sourceCategory}/${res.adjustRecordId}`,
          });
        }
      }
    } catch (e) {
      throw e;
    }
  }, [rfHeaderId, sourceCategory]);

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
        <Button color="primary" onClick={() => handleLackQuotedModalOk()}>
          {intl.get('hzero.common.button.ok').d('确定')}
        </Button>
      </Header>
      <Content>
        <RFLackQuotedModal {...{ ...searchParams, rFLackQuotedModalRef }} />
      </Content>
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
