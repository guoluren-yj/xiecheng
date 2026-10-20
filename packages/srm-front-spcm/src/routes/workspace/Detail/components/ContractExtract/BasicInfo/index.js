/*
 * @Description: 分屏模式-基础信息
 * @Date: 2025-01-21 19:19:44
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useImperativeHandle, useState, useCallback } from 'react';
import { Button, Modal, useDataSet } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import intl from 'utils/intl';

import {
  purchaserAttachmentDS,
  archiveAttachmentDS,
  esignAttachmentDS,
  offlineMutualSignDS,
  customAttachmentDS,
} from '../../ContractAttachments/AttachmentDS';

import ContractHeader from '../..//ContractHeader';
import ContractAttachments from '../../ContractAttachments';
// import HeaderInfo from './HeaderInfo';
import PartnerInfo from './PartnerInfo';
import ContractPartner from '../../ContractPartner';
import SignNodeCard from './SignNodeInfo';
import ContractSignNode from '../../ContractSignNode';

import styles from '../index.less';

const { Panel } = Collapse;

const defaultActiveKey = [
  'headerInfo',
  'partnerInfo',
  'purchaserAttachment',
  'esignAttachment',
  'attachmentGroup',
  'signNodeInfo',
];

const BasicInfo = (props) => {
  const {
    editable,
    headerFormDs,
    partnerListProps,
    signNodeProps,
    customizeForm,
    contractAttachmentsProps = {},
    contractSubjectListProps,
    rebateDs,
    showTextMode,
  } = props;
  const {
    attachmentRef,
    showSignAttachement,
    ...otherContractAttachmentsProps
  } = contractAttachmentsProps;
  const { pcSubjectDs } = contractSubjectListProps;
  const { partnerDs } = partnerListProps;
  const { signNodeDs } = signNodeProps || {};
  const headerInfo = headerFormDs?.current?.toJSONData() || {};
  const { rebateFlag, electricSignFlag: originElectricSignFlag, electronicOrderType } = headerInfo;
  const electricSignFlag = Number(originElectricSignFlag);
  const showSignNodeCrad = electricSignFlag === 1 && electronicOrderType === 'DOCUSIGN';

  /**
   * 附件要有自己的源数据，不要直接用headerFormDs，如果协议头个性化单元和附件个性化单元中同时配置了同一字段，
   * 协议头上个性化字段配置的显示/编辑/必输，会影响到附件的个性化字段显示/编辑/必输。
   * 所以将下面五类附件各自拆分出自己独立的源。
   *
   */
  const purchaserAttachmentDs = useDataSet(
    () => purchaserAttachmentDS(headerInfo, headerFormDs),
    []
  );
  const archiveAttachmentDs = useDataSet(() => archiveAttachmentDS(headerInfo, headerFormDs), []);
  const esignAttachmentDs = useDataSet(() => esignAttachmentDS(headerInfo, headerFormDs), []);
  const offlineMutualSignDs = useDataSet(() => offlineMutualSignDS(headerInfo, headerFormDs), []);
  const customAttachmentDs = useDataSet(() => customAttachmentDS(headerInfo, headerFormDs), []);

  const [signNodeCheckFlag, setSignNodeCheckFlag] = useState(false);

  if (attachmentRef) {
    useImperativeHandle(
      attachmentRef,
      () => ({
        purchaserAttachmentDs,
        archiveAttachmentDs,
        esignAttachmentDs,
        offlineMutualSignDs,
        customAttachmentDs,
      }),
      [
        purchaserAttachmentDs,
        archiveAttachmentDs,
        esignAttachmentDs,
        offlineMutualSignDs,
        customAttachmentDs,
      ]
    );
  }

  const handlePartner = () => {
    const viewProps = editable
      ? {
          onOk: async () => {
            const validate = await partnerDs.validate();
            if (validate) {
              const res = await partnerDs.submit();
              return !!res;
            }
            return false;
          },
        }
      : {
          cancelProps: {
            color: 'primary',
          },
          cancelText: intl.get('hzero.common.button.close').d('关闭'),
          footer: (okBtn, cancelBtn) => cancelBtn,
        };
    Modal.open({
      drawer: true,
      closable: true,
      movable: false,
      key: Modal.key(),
      title: intl.get(`spcm.common.view.message.title.partnerInformation`).d('伙伴信息'),
      style: {
        width: 1080,
      },
      children: (
        <ContractPartner
          custCode={
            editable ? 'SPCM.WORKSPACE_DETAIL.PARTNER' : 'SPCM.WORKSPACE_DETAIL.PARTNER.READONLY'
          }
          {...partnerListProps}
        />
      ),
      // onCancel: () => partnerDs.reset(),
      ...viewProps,
    });
  };

  /**
   * 查看全部签署节点信息
   */
  const handleViewAllSignNode = useCallback(() => {
    const modalProps = editable
      ? {
          onOk: async () => {
            const validate = await signNodeDs.validate();
            if (validate) {
              const res = await signNodeDs.submit();
              return !!res;
            }
            return false;
          },
          afterClose: async () => {
            if (signNodeDs.dirty) {
              const validate = await signNodeDs.validate();
              if (!validate) {
                setSignNodeCheckFlag(!signNodeCheckFlag);
              }
            }
          },
        }
      : {
          okButton: false,
          cancelProps: {
            color: 'primary',
          },
          cancelText: intl.get('hzero.common.button.close').d('关闭'),
        };
    Modal.open({
      drawer: true,
      closable: true,
      movable: false,
      key: Modal.key(),
      title: intl.get('spcm.common.view.message.title.signNodeInfo').d('签署节点信息'),
      style: {
        width: 1080,
      },
      children: <ContractSignNode {...signNodeProps} />,
      ...modalProps,
    });
  }, [signNodeDs, signNodeCheckFlag]);

  return (
    <div className={styles['spcm-workSpace-contract-extract']} id="spcm-workSpace-contract-extract">
      <Collapse
        trigger="text-icon"
        ghost
        expandIconPosition="text-right"
        defaultActiveKey={defaultActiveKey}
      >
        <Panel
          key="headerInfo"
          id="spcm-workSpace-contract-extract-baseInfo"
          header={intl.get('spcm.workspace.view.title.baseInfo').d('基础信息')}
        >
          {/* <HeaderInfo {...props} /> */}
          <ContractHeader
            {...props}
            isSplitMode
            isEdit={editable}
            partnerDs={partnerDs}
            pcSubjectDs={pcSubjectDs}
            rebateDs={rebateFlag && rebateDs}
            headerFormDs={headerFormDs}
            headerInfo={headerInfo}
          />
        </Panel>
        <Panel
          key="partnerInfo"
          id="spcm-workSpace-contract-extract-partnerInfo"
          header={intl.get(`spcm.common.view.message.title.partnerInformation`).d('伙伴信息')}
          extra={
            <Button onClick={handlePartner} size="small" funcType="link" color="primary">
              {intl.get('spcm.common.view.msg.viewAll').d('查看全部')}
            </Button>
          }
        >
          <PartnerInfo
            {...partnerListProps}
            customizeForm={customizeForm}
            handlePartner={handlePartner}
          />
        </Panel>
        {showSignNodeCrad && (
          <Panel
            key="signNodeInfo"
            id="spcm-workSpace-contract-extract-signNodeInfo"
            header={intl.get('spcm.common.view.message.title.signNodeInfo').d('签署节点信息')}
            extra={
              <Button
                onClick={() => handleViewAllSignNode()}
                size="small"
                funcType="link"
                color="primary"
              >
                {intl.get('spcm.common.view.msg.viewAll').d('查看全部')}
              </Button>
            }
          >
            <SignNodeCard
              signNodeDs={signNodeDs}
              customizeForm={customizeForm}
              handleViewAllSignNode={handleViewAllSignNode}
              headerInfo={headerInfo}
            />
          </Panel>
        )}
        <Panel
          key="purchaserAttachment"
          id="spcm-workSpace-contract-extract-purchaserAttachment"
          header={intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件')}
        >
          <ContractAttachments
            key="PURCHASER_ATTACHMENT"
            intelligentBlock="PURCHASER_ATTACHMENT"
            parentDs={purchaserAttachmentDs}
            {...otherContractAttachmentsProps}
          />
        </Panel>
        {showSignAttachement && (
          <Panel
            key="esignAttachment"
            id="spcm-workSpace-contract-extract-esignAttachment"
            header={intl
              .get(`spcm.common.view.btn.electronicSignatureAttachment`)
              .d('电子签章附件')}
          >
            <ContractAttachments
              key="ESIGN_ATTACHMENT"
              intelligentBlock="ESIGN_ATTACHMENT"
              parentDs={esignAttachmentDs}
              {...otherContractAttachmentsProps}
            />
          </Panel>
        )}
        <Panel
          key="attachmentGroup"
          id="spcm-workSpace-contract-extract-attachmentGroup"
          header={intl.get(`entity.attachment.tag.spcm`).d('附件')}
        >
          <ContractAttachments
            key="CUSTOM_ATTACHMENT"
            intelligentBlock="CUSTOM_ATTACHMENT"
            parentDs={customAttachmentDs}
            {...otherContractAttachmentsProps}
            showTextMode={showTextMode}
          />
        </Panel>
      </Collapse>
    </div>
  );
};

export default BasicInfo;
