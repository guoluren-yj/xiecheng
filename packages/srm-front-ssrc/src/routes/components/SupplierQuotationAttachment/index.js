import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Attachment, Tooltip, Icon } from 'choerodon-ui/pro';
import { Spin, Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { isEmpty, throttle, compose } from 'lodash';

import remote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

import { fetchNewSupplierQuotationFile } from '@/services/inquiryHallService';
import { getAttachmentCount } from '@/services//commonService.js';

import RenderFileTotalCount from './RenderFileTotalCount';

import Style from './index.less';

const { Group } = Attachment;
const { Panel } = Collapse;

/**
 * 供应商报价头/行附件展示
 * @param uiType string 'c7n-pro' h0
 * @parsm record object | Record {}
 * @param fileType string HEADER | LINE 展示头/行附件标识
 * @param int 0 附件是否非法
 */
const FileGroup = (props = {}) => {
  const {
    title = '',
    icon = '',
    uiType = 'c7n-pro',
    record = {},
    readOnly = true,
    fileType = 'HEADER',
    fileButtonText = intl.get(`ssrc.common.model.common.viewAttachment`).d('查看附件'),
    viewMode = 'list',
    isNeedName = true,
    fileProps = {},
    fileCountName = 'totalDisplayFileCount',
    // invalidFlag = 0,
    attachmentHiddenFlag = 0, // 隐藏附件flag
    queryParams = {},
    attachmentRemote,
    hideBusinessAttachment = false, // 隐藏商务附件
  } = props || {};

  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const organizationId = getCurrentOrganizationId();
  const [fileCount, setFileCount] = useState(0);

  const { quotationHeaderId, quotationLineId } =
    uiType !== 'c7n-pro' ? record || {} : record.get(['quotationHeaderId', 'quotationLineId']);

  const { bucketName = PRIVATE_BUCKET, bucketDirectory, businessUuid, techUuid, lineUuid } =
    fileProps || {};

  useEffect(() => {
    attachmentCount();
  }, [attachmentCount, fileProps]);

  const Common = useMemo(
    () => ({
      labelLayout: 'float',
      showHistory: true,
      readOnly,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory || 'ssrc-rfx-rfxheader',
      previewTarget: '_blank',
    }),
    [PRIVATE_BUCKET, quotationHeaderId, quotationLineId, title, uiType, fileType]
  );

  const LineCommon = useMemo(
    () => ({
      labelLayout: 'float',
      showHistory: true,
      readOnly,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory || 'ssrc-rfx-quotationline',
      previewTarget: '_blank',
    }),
    [quotationHeaderId, quotationLineId, title, uiType, fileType]
  );

  const fetchRoundInfoTable = useCallback(async () => {
    if (!quotationHeaderId && !quotationLineId) {
      return;
    }

    const params = {
      organizationId,
      quotationHeaderId,
      quotationLineId: fileType === 'HEADER' ? null : quotationLineId,
      ...(queryParams || {}),
    };

    let result = null;

    setLoading(true);
    try {
      result = await fetchNewSupplierQuotationFile(params);
      result = getResponse(result);
      setLoading(false);
      if (isEmpty(result)) {
        return;
      }

      setFileList(result);
    } catch (e) {
      throw e;
    }
  }, [quotationHeaderId, quotationLineId, title, uiType, fileType, queryParams]);

  // get attachment count number
  const attachmentCount = useCallback(() => {
    if (!businessUuid && !techUuid && !lineUuid) {
      return;
    }

    let transData = null;
    if (fileType === 'LINE' && lineUuid) {
      transData = [
        {
          bucketName,
          uuid: lineUuid,
        },
      ];
    }

    if (fileType === 'HEADER') {
      transData = [
        {
          bucketName,
          uuid: businessUuid,
        },
        {
          bucketName,
          uuid: techUuid,
        },
      ];
    }

    if (!transData) {
      return;
    }

    getAttachmentCount(transData).then((res) => {
      if (isEmpty(res)) {
        return;
      }

      const count = Object.values(res).reduce((prev, cur) => {
        const currentCount = cur || 0;
        return prev + currentCount;
      });
      setFileCount(count);
    });
  }, [fileProps, fileType]);

  // 展示多轮报价信息表
  const changeFilePopover = useCallback(
    throttle((visibled) => {
      if (!visibled) {
        fetchRoundInfoTable();
      }
    }, 1200),
    [fetchRoundInfoTable, quotationHeaderId, quotationLineId]
  );

  // current quotation stage
  const quotationStageRender = useCallback(
    (data = {}) => {
      const {
        quotationNode,
        quotationNodeMeaning,
        quotationCount,
        bargainTimes,
        quotationRoundNumber,
      } = data || {};
      let currentNodeTitle = '';

      switch (quotationNode) {
        case 'QUOTATION_PRICE':
        case 'PRICE_CLARIFICATION':
          currentNodeTitle = quotationNodeMeaning;
          break;
        case 'ROUND_QUOTATION_PRICE':
          currentNodeTitle = intl
            .get(`ssrc.inquiryHall.view.message.commonQuotationRound`, {
              round: quotationRoundNumber,
            })
            .d('第{round}轮报价');
          break;
        case 'BARGAIN_PRICE':
          currentNodeTitle = intl
            .get(`ssrc.common.theRoundBargainNum`, { bargainTimes })
            .d(`第{bargainTimes}次议价`);
          break;
        default:
          currentNodeTitle = quotationNodeMeaning;
          break;
      }

      if (quotationCount) {
        currentNodeTitle = `${currentNodeTitle}-${quotationCount}`;
      }

      return currentNodeTitle;
    },
    [record, quotationHeaderId, quotationLineId, title, uiType, fileType]
  );

  // 附件组
  const renderFileGroup = useCallback(
    (file = {}) => {
      const {
        businessAttachmentUuid = null,
        techAttachmentUuid = null,
        lineAttachmentUuid = null,
      } = file || {};

      if (fileType === 'LINE') {
        return (
          <Group label="" viewMode={viewMode}>
            <Attachment
              name="lineAttachmentUuid"
              {...LineCommon}
              value={lineAttachmentUuid}
              // label={intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件')}
            />
          </Group>
        );
      }

      const headerFields = [
        hideBusinessAttachment ? null : (
          <Attachment
            name="businessAttachmentUuid"
            {...Common}
            value={businessAttachmentUuid}
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件')}
          />
        ),
        <Attachment
          name="techAttachmentUuid"
          {...Common}
          value={techAttachmentUuid}
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件')}
        />,
      ].filter(Boolean);

      const attachments = attachmentRemote
        ? attachmentRemote.process(
            'SSRC_COMPONENTS_SUPPLIERQUOTATIONATTACHMENT_THIRD_ATTACHMENT_HEADER_FIELDS',
            headerFields,
            {
              fileData: file,
              attachmentProps: Common,
            }
          )
        : headerFields;

      return (
        <Group label="" viewMode={viewMode}>
          {attachments}
        </Group>
      );
    },
    [
      fileList,
      Common,
      LineCommon,
      viewMode,
      quotationHeaderId,
      quotationLineId,
      title,
      uiType,
      fileType,
    ]
  );

  // file collapse
  const renderFileCollapse = useCallback(() => {
    if (isEmpty(fileList) && !loading) {
      return (
        <div className={Style['ssrc-file-group-empty-files-text']}>
          {intl.get('hzero.common.message.data.none').d('暂无数据')}
        </div>
      );
    }

    const firstLine = [];
    firstLine.push(fileList[0]?.uniqueKey?.toString());

    return (
      <Spin spinning={loading}>
        <div onClick={tooltipOnClick}>
          <Collapse bordered={false} defaultActiveKey={firstLine}>
            {fileList.map((file = {}) => {
              const { uniqueKey, realName = null, creationDate = null } = file || {};
              const currentLineTitle = quotationStageRender(file);

              return (
                <Panel
                  header={
                    <span>
                      <span style={{ fontWeight: 600 }}>{currentLineTitle ?? ''}</span>
                      <span className={Style['title-common-label-name']}>
                        {intl.get(`ssrc.common.model.common.uploadBy`).d('上传人')} :{' '}
                        <Tooltip title={realName ?? ''}>{realName ?? ''}</Tooltip>
                      </span>
                      <span className={Style['item-line-upload-time']}>
                        {intl.get(`ssrc.common.model.common.creationDate`).d('上传时间')} :{' '}
                        {creationDate ? dateTimeRender(creationDate) : ''}
                      </span>
                    </span>
                  }
                  key={uniqueKey?.toString()}
                  style={{ border: 'none' }}
                >
                  <div style={{ paddingLeft: '16px', margin: '-10px 0' }}>
                    {renderFileGroup(file)}
                  </div>
                </Panel>
              );
            })}
          </Collapse>
        </div>
      </Spin>
    );
  }, [
    loading,
    fileList,
    quotationHeaderId,
    quotationLineId,
    title,
    uiType,
    fileType,
    renderFileGroup,
    quotationStageRender,
    changeFilePopover,
  ]);

  // icon
  const renderIcon = useCallback(() => {
    return (
      icon || (
        <Icon
          type="attach_file"
          style={{ fontWeight: '400', fontSize: '12px', marginRight: '4px' }}
          className={isNeedName ? Style['link-color'] : Style['link-color-new-check']}
        />
      )
    );
  }, [icon, isNeedName]);

  // file count
  const renderFileCount = useCallback(() => {
    return <RenderFileTotalCount uiType={uiType} record={record} fileCountName={fileCountName} />;
  }, [uiType, record]);

  // file button render
  const innerContent = useCallback(() => {
    if (fileType === 'HEADER') {
      return (
        <a>
          {renderIcon()}
          {isNeedName ? (
            <span>
              {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
              {renderFileCount()}
            </span>
          ) : (
            renderFileCount()
          )}
        </a>
      );
    }

    if (fileType === 'LINE') {
      return (
        <a>
          {renderIcon()}
          <span>
            {fileButtonText}
            {renderFileCount()}
          </span>
        </a>
      );
    }
  }, [fileType, fileButtonText, fileCount, renderIcon, record]);

  const tooltipOnClick = (e) => {
    if (!e) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
  };

  return !(attachmentHiddenFlag === 1 || attachmentHiddenFlag === true) ? (
    <Tooltip
      // popupStyle={{ width: '500px', maxHeight: '300px', overflowY: 'auto', }}
      popupClassName={Style['file-group-view-component-wrap-ssrc']}
      trigger={['hover', 'click']}
      placement={fileType === 'HEADER' ? 'topLeft' : 'leftBottom'}
      // placement="leftBottom"
      theme="light"
      title={renderFileCollapse()}
      onHiddenChange={changeFilePopover}
      popupStyle={{ zIndex: 0 }}
    >
      <span>{innerContent()}</span>
    </Tooltip>
  ) : (
    ''
  );
};

const hocComponent = (Com) => {
  return compose(
    remote(
      {
        code: 'SSRC_COMPONENTS_SUPPLIERQUOTATIONATTACHMENT',
        name: 'attachmentRemote',
      },
      {
        events: {},
      }
    )
  )(observer(Com));
};

export default hocComponent(FileGroup);
