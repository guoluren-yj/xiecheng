import React from 'react';
import { TreeSelect } from 'choerodon-ui';
// import { Content } from 'components/Page';
// import { Select } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import classnames from 'classnames';
import { transfromTreeSelectKey } from '@/utils/util';

import ContractHeader from '../ContractHeader';
import ContractSubject from '../ContractSubject';
import ContractStage from '../ContractStage';
import ContractRebate from '../ContractRebate';
import ContractPartner from '../ContractPartner';
import ContractBusinessTerms from '../ContractBusinessTerms';
// import ContractReplenish from '../components/ContractReplenish';
import styles from '../../index.less';

const commonViewPrompt = 'spcm.common.view.message.title';

// const { Option } = Select;

const List = (props) => {
  const {
    headerFormDs,
    editable,
    customizeCollapseForm,
    pcSubjectDs,
    partnerDs,
    pcStageDs,
    rebateDs,
    rebateFlag,
    pcHeaderId,
    headerInfo,
    customizeForm,
    customizeTable,
    custConfig,
    businessTermsDs,
    wrapContentClassName,
    currentMode,
    changeCount,
    fieldComparison,
    contractList,
    setPcHeaderId,
    setMainContractId,
    remoteWorkDetail,
  } = props;
  const partnerListProps = {
    editable,
    pcHeaderId,
    partnerDs,
    currentMode,
    customizeTable,
    remoteWorkDetail,
  };
  const contractSubjectListProps = {
    customizeTable,
    customizeForm,
    editable,
    pcHeaderId,
    headerInfo,
    pcSubjectDs,
    currentMode,
  };

  const contractStageListProps = {
    customizeTable,
    customizeForm,
    custConfig,
    editable,
    pcStageDs,
    currentMode,
  };
  const contractRebateProps = {
    editable,
    rebateDs,
    currentMode,
    customizeTable,
  };

  const contractBusinessTermsListProps = {
    customizeTable,
    editable,
    businessTermsDs,
    currentMode,
  };

  const contractSelect = () => {
    return (
      <TreeSelect
        style={{ width: '100%', flexShrink: 0, marginTop: '16px' }}
        disabled={!fieldComparison}
        defaultValue={headerInfo.pcHeaderId}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        treeData={transfromTreeSelectKey({
          dataList: contractList,
          childrenField: 'compareHeaderDtos',
        })}
        placeholder="Please select"
        treeDefaultExpandAll
        onChange={(val) => {
          if (val) {
            if (currentMode === 'current') {
              setPcHeaderId(val);
            } else {
              setMainContractId(val);
            }
          }
        }}
      />
    );
    // return (
    //   <Select
    //     disabled={!fieldComparison}
    //     defaultValue={headerInfo.pcHeaderId}
    //     className={styles.selectContract}
    //     onChange={(val) => {
    //       if (val) {
    //         if (currentMode === 'current') {
    //           setPcHeaderId(val);
    //         } else {
    //           setMainContractId(val);
    //         }
    //       }
    //     }}
    //   >
    //     {contractList.map((option) => (
    //       <Option value={option.pcHeaderId}>
    //         {`${option.pcNum} ${option.pcTag} ${option.pcStatusCodeMeaning}`}
    //       </Option>
    //     ))}
    //   </Select>
    // );
  };

  return (
    <div className={classnames(wrapContentClassName, [styles['current-wrap']])}>
      <div>
        <div>
          {currentMode === 'current' && (
            <div className={styles.currentContainer}>
              <div className={styles.currentMode}>
                <span>{intl.get('spcm.common.view.title.currentMode').d('当前打开版本')}</span>
              </div>
              <div>
                <span>
                  <span className={styles.green}>{changeCount}</span>
                  {intl.get('ssrc.inquiryHall.view.message.changeInformation').d('处信息更改')}
                </span>
              </div>
              {contractSelect()}
            </div>
          )}
          {currentMode === 'history' && (
            <div className={styles.historyContainer}>
              <div className={styles.historyMode}>
                <span>{intl.get('spcm.common.view.title.referenceVersion').d('参照版本')}</span>
              </div>
              {contractSelect()}
            </div>
          )}
        </div>
        <h3 id="spcm-detail-information" className={styles['rfx-card-item-title']}>
          {intl.get(`${commonViewPrompt}.basicInformation`).d('基本信息')}
        </h3>
        <ContractHeader
          customizeCollapseForm={customizeCollapseForm}
          headerFormDs={headerFormDs}
          {...props}
        />
      </div>
      <div>
        <h3 id="spcm-detail-partner" className={styles['rfx-card-item-title']}>
          {intl
            .get('spcm.common.view.message.title.contractPartnerInformation')
            .d('采购协议伙伴信息')}
        </h3>
        {partnerDs && <ContractPartner key="partner" {...partnerListProps} />}
      </div>
      <div>
        <h3 id="spcm-detail-subject" className={styles['rfx-card-item-title']}>
          {intl.get(`spcm.common.view.message.title.contractSubject`).d('协议标的')}
        </h3>
        {pcSubjectDs && <ContractSubject key="subject" {...contractSubjectListProps} />}
      </div>
      <div>
        <h3 id="spcm-detail-stage" className={styles['rfx-card-item-title']}>
          {intl.get(`spcm.common.view.message.title.contractStage`).d('协议阶段')}
        </h3>
        {pcStageDs && <ContractStage key="stage" {...contractStageListProps} />}
      </div>
      {rebateFlag && rebateDs ? (
        <div>
          <h3 id="spcm-detail-rebate" className={styles['rfx-card-item-title']}>
            {intl.get('spcm.common.view.message.title.ContractRebate').d('返利信息')}
          </h3>
          <ContractRebate key="rebate" {...contractRebateProps} />
        </div>
      ) : (
        ''
      )}
      <div>
        <h3 id="spcm-detail-business-terms" className={styles['rfx-card-item-title']}>
          {intl
            .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
            .d('采购协议业务条款')}
        </h3>
        <ContractBusinessTerms key="terms" {...contractBusinessTermsListProps} />
      </div>
      {/* {!editable && (
            <Content >
              <h3 id="spcm-detail-replenish" className={styles['rfx-card-item-title']}>
                {intl.get(`spcm.common.view.message.title.contractReplenishList`).d('补充协议列表')}
              </h3>
              {replenishDs && <ContractReplenish {...contractReplenishProps} />}
            </Content>
          )} */}
      {/* <Content  style={{ marginBottom: '16px' }}>
            <h3 id="spcm-detail-attachments" className={styles['rfx-card-item-title']}>
              {intl.get(`entity.attachment.tag`).d('附件')}
            </h3>
            <Row>
              <Col span={8}>
                <Button className={styles.purchaseHeaderNumber}>
                  <Upload
                    {...uploadProps}
                    afterOpenUploadModal={purchaserUuid => this.handleSaveUuid(purchaserUuid)}
                  />
                </Button>
              </Col>
              {templateListFlag && (
                <Col span={8}>
                  <Attachment {...attachmentProps} />
                </Col>
              )}
              {(isAttachmentSignUpload || isAttachmentSignAndText) && (
                <Col span={8}>
                  <Popover
                    content={intl.get('spcm.common.view.button.uploadNum').d('文件最多上传4个')}
                    placement="bottomLeft"
                    trigger="hover"
                  >
                    <Button className={styles.purchaseHeaderNumber}>
                      <ComUpload {...electricSignAttachmentProps} />
                    </Button>
                  </Popover>
                </Col>
              )}
            </Row>
          </Content> */}
    </div>
  );
};

export default List;
