import React, { memo, useState, useEffect, useMemo } from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getAttachmentUrl } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import TagPro from '@/components/TagPro';
import Image from '@/components/Image';
import OverflowTip from '@/components/OverflowTip';
import { getIntentLetterDsProps } from '../IntentLetter/ds';
import IntentContent from '../IntentLetter/IntentContent';

import styles from './index.less';

function CompanyInfo({ intentInfo }) {
  const { sender, senderEmail, senderPhone, sendCompanyInfosVO } = intentInfo || {};
  const multStr = (list, field) => list?.map((m) => m[field]).join('、');
  const natureMap = {
    manufacturerFlag: intl.get('smkt.supplierManage.view.manufacturerFlag').d('制造商'),
    traderFlag: intl.get('smkt.supplierManage.view.traderFlag').d('贸易商'),
    servicerFlag: intl.get('smkt.supplierManage.view.servicerFlag').d('服务商'),
    agentFlag: intl.get('smkt.supplierManage.view.agentFlag').d('代理商'),
    integrationFlag: intl.get('smkt.supplierManage.view.integrationFlag').d('集成商'),
    contractorFlag: intl.get('smkt.supplierManage.view.contractorFlag').d('承包商'),
  };
  const natureList = [];
  Object.keys(natureMap).forEach((f) => {
    if (sendCompanyInfosVO?.[f]) {
      natureList.push(natureMap[f]);
    }
  });
  return (
    <div className="intent-company-wrapper">
      <div className="company-base-info">
        <Image
          value={getAttachmentUrl(sendCompanyInfosVO?.logoUrl, PRIVATE_BUCKET)}
          width={84}
          height={84}
        />
        <div className="company-content">
          <div className="company-name">
            {sendCompanyInfosVO?.companyName}（{intl.get('smkt.busiOpport.view.code').d('编码')}：
            {sendCompanyInfosVO?.companyNum}）
          </div>
          <div className="company-desc">{sendCompanyInfosVO?.description || '-'}</div>
        </div>
      </div>
      <div className="company-other-info">
        {[
          {
            label: intl.get('smkt.selection.view.website').d('公司官网'),
            value: sendCompanyInfosVO?.website,
          },
          {
            label: intl.get('smkt.supplierManage.view.contacts').d('联系人'),
            value: sender,
          },
          {
            label: intl.get('smkt.supplierManage.view.contactTel').d('联系电话'),
            value: senderPhone,
          },
          {
            label: intl.get('smkt.supplierManage.view.contactEmail').d('联系邮箱'),
            value: senderEmail,
          },
          {
            label: intl.get('smkt.supplierManage.modal.managementList').d('经营性质'),
            value: natureList.join('、'),
          },
          {
            label: intl.get('smkt.selection.view.industryType').d('行业类型'),
            value: multStr(sendCompanyInfosVO?.industryList, 'industryName'),
          },
          {
            label: intl.get('smkt.supplierManage.modal.industryCategoryList').d('主营品类'),
            value: multStr(sendCompanyInfosVO?.industryCategoryList, 'categoryName'),
          },
          {
            label: intl.get('smkt.supplierManage.modal.serviceAreaList').d('送货范围'),
            value: multStr(sendCompanyInfosVO?.serviceAreaList, 'serviceAreaMeaning'),
          },
        ].map((m) => {
          const { label, value } = m;
          return (
            <div className="info-item">
              <OverflowTip className="info-item-label">{label}</OverflowTip>
              <OverflowTip className="info-item-value">{value || '-'}</OverflowTip>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(function IntentDetail(props) {
  const { letter, refresh } = props;
  const { letterId, letterCode, letterStatus, letterStatusMeaning } = letter || {};
  const [intentInfo, setIntentInfo] = useState({});

  const dataSet = useMemo(() => new DataSet(getIntentLetterDsProps(letterId)), [letterId]);

  useEffect(() => {
    if (letterId) {
      initData();
    }
  }, [letterId, refresh]);

  async function initData() {
    await dataSet.query();
    const baseInfo = dataSet.current.get([
      'sender',
      'senderPhone',
      'senderEmail',
      'sendCompanyInfosVO',
    ]);
    setIntentInfo({ ...baseInfo });
  }

  const letterStatusColor =
    letterStatus === 'APPROVE' ? 'success' : letterStatus === 'REJECT' ? 'invalid' : 'default';

  return (
    <div className={styles['intent-detail-wrapper']}>
      {letterId ? (
        <Spin dataSet={dataSet}>
          <div className="intent-detail-header">
            <span className="intent-detail-title">
              {intl.get('smkt.busiOpport.view.intentDetail').d('意向单详情')}-{letterCode}
            </span>
            <TagPro color={letterStatusColor} fontWeight={600}>
              {letterStatusMeaning}
            </TagPro>
          </div>

          <div className="intent-detail-body">
            <CompanyInfo intentInfo={intentInfo} />
            <IntentContent dataSet={dataSet} letterId={letterId} />
          </div>
        </Spin>
      ) : (
        <div className="no-data">{intl.get(`smpc.product.model.noData`).d('暂无数据')}</div>
      )}
    </div>
  );
});
