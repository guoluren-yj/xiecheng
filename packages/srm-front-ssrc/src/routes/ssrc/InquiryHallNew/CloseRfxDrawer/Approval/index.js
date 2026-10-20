/*
 * @Descripttion: 关闭询价单--审批
 * @version: 1.0
 * @Author: yujie.shao@going-link.com;
 * @Date: 2021-09-01 10:42
 */
import React, { useMemo, useEffect, useCallback } from 'react';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Form, Output, Attachment } from 'choerodon-ui/pro';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { compose, noop } from 'lodash';
import { observer } from 'mobx-react';

import formatterCollections from 'utils/intl/formatterCollections';
import { BID, getDocumentTypeName, INQUIRY_LOWERCASE } from '@/utils/globalVariable';

import { closeApprovalFormDS } from './closeApprovalFormDS';

const Index = (props) => {
  const {
    match: {
      params: { rfxId },
    },
    onFormLoaded,
    sourceKey,
    customizeForm = noop,
    // sourceKeyLowercase = INQUIRY_LOWERCASE,
  } = props;

  const bidFlag = sourceKey === BID;

  const documentTypeName = getDocumentTypeName(bidFlag);

  const formDS = useMemo(
    () => new DataSet(closeApprovalFormDS({ rfxId, documentTypeName, bidFlag })),
    []
  );

  useEffect(() => {
    if (formDS && formDS.query) {
      formDS.setQueryParameter('customizeUnitCode', getCustomizeUnitCode('baseForm'));
      formDS.query().finally(() => {
        if (onFormLoaded && typeof onFormLoaded === 'function') {
          onFormLoaded(true);
        }
      });
    }
  }, [bidFlag, rfxId]);

  /**
   * 获取对应的个性化编码
   *  */
  const getCustomizeUnitCode = useCallback(
    (type = 'baseForm') => {
      const RfxCode = {
        baseForm: 'SSRC.CLOSE_RFX_APPROVAL.BASE_FORM',
      };
      const BidCode = {
        baseForm: 'SSRC.CLOSE_RFX_APPROVAL_BID.BASE_FORM',
      };

      return !bidFlag ? RfxCode[type] : BidCode[type];
    },
    [rfxId, bidFlag]
  );

  /**
   * 询价单单号重渲染
   */
  const rfxToDetail = (value) => {
    return <a onClick={inquiryDetail}>{value}</a>;
  };

  /**
   * 跳转rfx明细页
   */
  const inquiryDetail = () => {
    const {
      history,
      location: { pathname },
    } = props;
    const { rfxHeaderId } = formDS.toData()?.[0];
    history.push({
      pathname: bidFlag
        ? `/pub/ssrc/${INQUIRY_LOWERCASE}-hall/rfx-detail-approval/${rfxHeaderId}/NEW_BID`
        : `/pub/ssrc/${INQUIRY_LOWERCASE}-hall/rfx-detail-approval/${rfxHeaderId}`,
      search: querystring.stringify({
        backPath: pathname,
      }),
    });
  };

  return (
    <div>
      <Header
        // backPath="/ssrc/new-inquiry-hall/list"
        title={intl
          .get(`ssrc.inquiryHall.view.message.button.commonCloseInquiryList`, { documentTypeName })
          .d('关闭{documentTypeName}')}
      />
      <Content>
        {customizeForm(
          {
            code: getCustomizeUnitCode('baseForm'),
            dataSet: formDS,
          },
          <Form
            dataSet={formDS}
            labelLayout="vertical"
            columns={3}
            className="c7n-pro-vertical-form-display"
          >
            <Output name="rfxNum" renderer={({ value }) => rfxToDetail(value)} />
            <Output name="rfxTitle" />
            <Output name="templateName" />
            <Output name="terminatedRemark" />
            <Attachment name="closeAttachmentUuid" readOnly viewMode="popup" funcType="link" />
          </Form>
        )}
      </Content>
    </div>
  );
};

const hocComponent = (NewComponent, options = {}) => {
  const { bidFlag = false } = options || {};
  const RfxUnitCode = ['SSRC.CLOSE_RFX_APPROVAL.BASE_FORM'];

  const BidUnitCode = ['SSRC.CLOSE_RFX_APPROVAL_BID.BASE_FORM'];

  const CurrentUnitCode = !bidFlag ? RfxUnitCode : BidUnitCode;

  return compose(
    formatterCollections({
      code: ['ssrc.common', 'ssrc.inquiryHall', 'sscux.ssrc'],
    }),
    withCustomize({
      unitCode: CurrentUnitCode,
    })
  )(observer(NewComponent));
};

export default hocComponent(Index);
export { Index, hocComponent };
