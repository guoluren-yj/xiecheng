import React, { useCallback, useMemo } from 'react';
import { Attachment } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { isNil } from 'lodash';
import { observer } from 'mobx-react-lite';

import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';

const { Group } = Attachment;

const FileGroupAppy = (props = {}) => {
  const {
    basicFormDS,
    // name,
    label = null,
    readOnly = true,
    text = intl.get(`ssrc.common.model.common.viewAttachment`).d('查看附件'),
    fileGroupProps = {},
  } = props || {};
  const {
    tenderFeeFlag,
    bidFileExpense,
    // bidFileDownloadNode,
    techAttachmentFileCount = 0,
    businessAttachmentFileCount = 0,
    tenderFeePayButtonFlag = 0,
  } = basicFormDS.current
    ? basicFormDS.current.get([
        'tenderFeeFlag',
        'bidFileExpense',
        'bidFileDownloadNode',
        'techAttachmentFileCount',
        'businessAttachmentFileCount',
        'tenderFeePayButtonFlag',
      ])
    : {};
  const totalAttachmentCoount = techAttachmentFileCount + businessAttachmentFileCount;

  const Common = useMemo(
    () => ({
      // record: basicFormDS.current,
      labelLayout: 'float',
      showHistory: true,
      readOnly,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      ...(fileGroupProps || {}),
    }),
    [PRIVATE_BUCKET, fileGroupProps]
  );

  const fileGroup = useCallback(() => {
    return (
      <Group label={label} text={text}>
        <Attachment
          name="rfxBusinessAttachmentUuid"
          {...Common}
          // value={rfxBusinessAttachmentUuid}
          dataSet={basicFormDS}
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件')}
        />
        <Attachment
          name="rfxTechAttachmentUuid"
          {...Common}
          // value={rfxTechAttachmentUuid}
          dataSet={basicFormDS}
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件')}
        />
      </Group>
    );
  }, [
    basicFormDS,
    // rfxBusinessAttachmentUuid,
    // rfxTechAttachmentUuid,
  ]);

  /*
  1.招标文件管控 tenderFeeFlag
  2.标书文件下载节点【SDEP.TENDER_FEES_DOWNLOAD_NODE】 NO_CONTROL | PAY_SUCCESS | INVOICE_SUCCESS
  3.支付规则 payRule  线上支付 | OFFLINE_CONFIRM (暂定)
  允许查阅权限：
    A 不管控
    B 管控：标书文件下载节点 = 支付成功 & 缴纳状态 = 已缴纳 & 支付规则 = 线上支付
    C 管控：标书文件下载节点 = 开票成功 & 缴纳状态 = 已缴纳 & 支付规则 = 线上支付
  */

  return tenderFeeFlag === 1 && !isNil(bidFileExpense) ? (
    <Tooltip
      title={
        tenderFeePayButtonFlag === 1
          ? intl
              .get('ssrc.supplierQuotation.view.message.tenderFeePayControllerWarning')
              .d('需缴纳招标文件费后才能查看')
          : intl
              .get('ssrc.supplierQuotation.view.message.bidFileExpensiveControllerWarning')
              .d('需缴纳招标文件费后联系采购方修改缴纳状态才能查看')
      }
    >
      <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
        {text}
        {totalAttachmentCoount > 0 ? ` ${totalAttachmentCoount}` : ''}
      </span>
    </Tooltip>
  ) : (
    fileGroup()
  );
};

export default observer(FileGroupAppy);
