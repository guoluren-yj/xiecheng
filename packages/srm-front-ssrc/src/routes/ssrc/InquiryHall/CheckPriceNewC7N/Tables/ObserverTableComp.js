import React, { memo } from 'react';
import { CheckBox, Tooltip, Icon, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import SVGIcon from '@/routes/components/SvgIcon';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';
import OldAttachment from '@/routes/ssrc/components/Attachment';

import { computedCheckBoxIsChecked } from './helpers';

import styles from '../index.less';

const imgUr = require('@/assets/d-attachment.svg');

const promptCode = 'ssrc.inquiryHall';

/**
 * 分组头勾选框
 */
const ObserverGroupHeaderCheckBox = memo(
  observer((props) => {
    const { groups, dimensionCode, handleChangeGroupHeaderCheckBox = noop } = props;
    let indeterminate;
    let checked;
    const totalRecords = [];
    const validGroup = groups.filter((g) => !(g.totalRecords || [])[0]?.get('rankTeam'));
    if (dimensionCode === 'ALL') {
      // 整单维度 - 根据主分组直接计算
      const groupsLength = validGroup.length;
      const selectedLength = validGroup.filter((g) => g.getState('colAllSelected')).length;
      indeterminate = selectedLength > 0 && selectedLength < groupsLength;
      checked = selectedLength > 0 && groupsLength === selectedLength;
    } else {
      // 物料维度 - 根据所有子分组来判断
      // const subGroups = groups.reduce((prevGroups, currentGroup) => {
      //   return prevGroups.concat(currentGroup.subGroup);
      // }, []);
      let selectedLength = 0;
      validGroup.forEach((group) => {
        // eslint-disable-next-line no-unused-expressions
        group.totalRecords &&
          group.totalRecords.forEach((record) => {
            totalRecords.push(record);
            if (record.getState('cellSelected')) selectedLength++;
          });
      });
      indeterminate = selectedLength > 0 && selectedLength < totalRecords.length;
      checked = selectedLength > 0 && totalRecords.length === selectedLength;
    }
    return (
      <CheckBox
        indeterminate={indeterminate}
        checked={checked}
        disabled={!validGroup.length}
        onChange={(value) =>
          handleChangeGroupHeaderCheckBox({
            totalRecords,
            groups: validGroup,
            value,
            dimensionCode,
          })
        }
      />
    );
  })
);

// 老附件展示
const showUploadModal = (record) => {
  const {
    businessAttachmentUuid,
    techAttachmentUuid,
    bargainBusinessAttachmentUuid,
    bargainTechAttachmentUuid,
    roundBusinessAttachmentUuid,
    roundTechAttachmentUuid,
  } = record.get([
    'businessAttachmentUuid',
    'techAttachmentUuid',
    'bargainBusinessAttachmentUuid',
    'bargainTechAttachmentUuid',
    'roundBusinessAttachmentUuid',
    'roundTechAttachmentUuid',
  ]);
  const AttachmentsProps = {
    bucketName: PRIVATE_BUCKET,
    bucketDirectory: 'ssrc-rfx-quotationheader',
    viewOnly: true,
    checkPriceFlag: 1,
    businessUuid: businessAttachmentUuid,
    techUuid: techAttachmentUuid,
    bargainBusUuid: bargainBusinessAttachmentUuid,
    bargainTechUuid: bargainTechAttachmentUuid,
    roundBusUuid: roundBusinessAttachmentUuid,
    roundTechUuid: roundTechAttachmentUuid,
  };
  Modal.open({
    title: intl.get(`${promptCode}.model.library.attachmentUuid`).d('附件'),
    closable: true,
    footer: null,
    style: {
      width: 800,
    },
    key: 'check-price-header-attachment-cell',
    children: <OldAttachment {...AttachmentsProps} />,
  });
};

// 供应商分组单元格render
const ObserverSupplierGroupRendererCell = memo(
  observer((props) => {
    const {
      text,
      record,
      dataSet,
      detailFlag,
      headerGroup,
      dimensionCode,
      handleClickColumnHeader,
      handleMouseEnterColumnHeader,
      handleMouseLeaveColumnHeader,
      handleChangeColumnHeaderCheckBox,
      handleClickRiskScan,
      RISK_SCAN,
      newQuotationFlag,
    } = props;
    const {
      rank,
      allSelectFlag,
      supplierCheckSelectFlag,
      supplierCompanyName,
      supplierCompanyId,
      rankTeam,
      supplierStatusMeaning,
      quotationHeaderId,
    } = record.get([
      'invalidFlag',
      'reviewFlag',
      'rank',
      'allSelectFlag',
      'supplierCheckSelectFlag',
      'supplierCompanyName',
      'supplierCompanyId',
      'rankTeam',
      'supplierStatusMeaning',
      'quotationHeaderId',
    ]);
    // const editEnabled = computedColumnHeaderEditable(record);
    const showSealIcon = dimensionCode === 'ALL' ? !!allSelectFlag : !!supplierCheckSelectFlag; // 签章显示逻辑，头部显示签章
    const language = getCurrentLanguage();
    if (headerGroup) {
      const { totalRecords, index } = headerGroup;
      const tagStyle = {
        border: 0,
        marginRight: '4px',
        backgroundColor: rank === 1 ? 'rgba(252,160,0,0.10)' : 'rgba(0,0,0,0.06)',
        color: rank === 1 ? '#F88D10' : 'rgba(0,0,0,0.65)',
        marginBottom: '8px',
      };
      const { indeterminate, checked } = computedCheckBoxIsChecked({
        record,
        headerGroup,
        totalRecords,
        dimensionCode,
        type: 'colHeader',
      });
      return (
        <div
          className={styles['table-cell-inner-content-wrap']}
          onClick={(e) => handleClickColumnHeader({ index: index + 1, record, dataSet }, e)}
          onMouseEnter={() => handleMouseEnterColumnHeader(record)}
          onMouseLeave={() => handleMouseLeaveColumnHeader(record)}
        >
          <div
            className={
              showSealIcon
                ? language === 'zh_CN'
                  ? styles['table-cell-inner-seal-icon-ch']
                  : styles['table-cell-inner-seal-icon-en']
                : styles['table-cell-inner-cell']
            }
          >
            <div style={{ paddingTop: '8px' }}>
              {!detailFlag && (
                <CheckBox
                  // value
                  indeterminate={indeterminate}
                  checked={checked}
                  disabled={!!rankTeam}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onChange={(value) =>
                    handleChangeColumnHeaderCheckBox({
                      totalRecords,
                      headerGroup,
                      value,
                      record,
                      dimensionCode,
                    })
                  }
                  style={{
                    marginTop: '-10px',
                  }}
                />
              )}
              {/* 整单 && 可以编辑 */}
              {/* {text}  */}
              <span
                style={{
                  marginLeft: !detailFlag ? '8px' : '',
                }}
              >
                <span className={styles['table-cell-supplier-name']}>
                  <Tooltip title={supplierCompanyName}>{supplierCompanyName}</Tooltip>
                </span>
                {quotationHeaderId ? (
                  <span
                    style={{
                      marginLeft: '8px',
                      display: 'inline-block',
                      position: 'relative',
                      top: '-5px',
                    }}
                  >
                    {!newQuotationFlag ? (
                      <a onClick={() => showUploadModal(record)}>
                        <SVGIcon path={imgUr} />
                        <span style={{ marginLeft: '7px' }}>
                          <RenderFileTotalCount record={record} uiType="c7n-pro" />
                        </span>
                      </a>
                    ) : (
                      <FileGroup
                        record={record}
                        fileType="HEADER"
                        uiType="c7n-pro"
                        isNeedName={false}
                      />
                    )}
                  </span>
                ) : null}
                {!!RISK_SCAN && (
                  <Icon
                    onClick={() => handleClickRiskScan(supplierCompanyId)}
                    style={{ fontSize: 14, cursor: 'pointer' }}
                    type="add_moderator-o"
                    className={styles['table-cell-supplier-risk-icon']}
                  />
                )}
              </span>
            </div>
            <div
              style={{
                marginLeft: !detailFlag ? '23px' : '',
              }}
            >
              {/* {!!rank && (
                <Tag style={tagStyle}>
                  {intl.get(`${promptCode}.model.inquiryHall.supplierRank`).d('排名')}
                  {rank}
                </Tag>
              )} */}
              {!!rankTeam && (
                <Tag className={styles['disabled-tagStyle']} style={tagStyle}>
                  {supplierStatusMeaning}
                </Tag>
              )}
            </div>
          </div>
        </div>
      );
    }
    return text;
  })
);

export { ObserverGroupHeaderCheckBox, ObserverSupplierGroupRendererCell };
