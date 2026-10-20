/*
 * @Date: 2024-09-24 11:49:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';

import noData from '@/assets/memberExpansion/no-data.svg';
// import { openAiApproveModal } from '@/routes/components/AiApprove';

const NoDataRender = ({ style = {} }) => {
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <img src={noData} alt="" style={{ marginBottom: 12 }} />
      <div>{intl.get('sslm.common.view.message.noData').d('暂无数据')}</div>
    </div>
  );
};

// 调查表configName映射
// const surveyMap = {
//   sslmInvestgBasic: { configName: 'INVESTG_BASIC', rowKey: 'investgBasicId' },
//   sslmInvestgBusiness: { configName: 'INVESTG_BUSINESS', rowKey: 'investgBusinessId' },
//   sslmInvestgProservice: { configName: 'INVESTG_PROSERVICE', rowKey: 'investgProserviceId' },
//   sslmInvestgSupplierCate: { configName: 'INVESTG_CATE', rowKey: 'investgSupplierCateId' },
//   sslmInvestgFin: { configName: 'INVESTG_FINANCE', rowKey: 'investgFinId' },
//   sslmInvestgFinBranch: { configName: 'INVESTG_FINANCE_BRANCH', rowKey: 'investgFinBranchId' },
//   sslmInvestgAuth: { configName: 'INVESTG_AUTH', rowKey: 'investgAuthId' },
//   sslmInvestgContact: { configName: 'INVESTG_CONTACT', rowKey: 'investgContactId' },
//   sslmInvestgAddress: { configName: 'INVESTG_ADDRESS', rowKey: 'investgAddressId' },
//   sslmInvestgBankAccount: { configName: 'INVESTG_BANK_ACCOUNT', rowKey: 'investgBankAccountId' },
//   sslmInvestgCustomer: { configName: 'INVESTG_CUSTOMER', rowKey: 'investgCustomerId' },
//   sslmInvestgSubSupplier: { configName: 'INVESTG_SUB_SUPPLIER', rowKey: 'investgSubSupplierId' },
//   sslmInvestgEquipment: { configName: 'INVESTG_EQUIPMENT', rowKey: 'investgEquipmentId' },
//   sslmInvestgRd: { configName: 'INVESTG_RD', rowKey: 'investgRdId' },
//   sslmInvestgProduce: { configName: 'INVESTG_PRODUCE', rowKey: 'investgProduceId' },
//   sslmInvestgQa: { configName: 'INVESTG_QA', rowKey: 'investgQaId' },
//   sslmInvestgCustservice: { configName: 'INVESTG_CUSTSERVICE', rowKey: 'investgCustserviceId' },
//   sslmInvestgAttachment: { configName: 'INVESTG_ATTACHMENT', rowKey: 'investgAttachmentId' },
//   sslmInvestgReserve1: { configName: 'INVESTG_RESERVE1', rowKey: 'investgReserve1Id' },
//   sslmInvestgReserve2: { configName: 'INVESTG_RESERVE2', rowKey: 'investgReserve2Id' },
//   sslmInvestgReserve3: { configName: 'INVESTG_RESERVE3', rowKey: 'investgReserve3Id' },
//   sslmInvestgReserve4: { configName: 'INVESTG_RESERVE4', rowKey: 'investgReserve4Id' },
//   sslmInvestgReserve5: { configName: 'INVESTG_RESERVE5', rowKey: 'investgReserve5Id' },
//   sslmInvestgReserve6: { configName: 'INVESTG_RESERVE6', rowKey: 'investgReserve6Id' },
//   sslmInvestgReserve7: { configName: 'INVESTG_RESERVE7', rowKey: 'investgReserve7Id' },
//   sslmInvestgReserve8: { configName: 'INVESTG_RESERVE8', rowKey: 'investgReserve8Id' },
//   sslmInvestgReserve9: { configName: 'INVESTG_RESERVE9', rowKey: 'investgReserve9Id' },
//   sslmInvestgReserve10: { configName: 'INVESTG_RESERVE10', rowKey: 'investgReserve10Id' },
//   sslmInvestgReserve11: { configName: 'INVESTG_RESERVE11', rowKey: 'investgReserve11Id' },
//   sslmInvestgReserve12: { configName: 'INVESTG_RESERVE12', rowKey: 'investgReserve12Id' },
//   sslmInvestgReserve13: { configName: 'INVESTG_RESERVE13', rowKey: 'investgReserve13Id' },
//   sslmInvestgReserve14: { configName: 'INVESTG_RESERVE14', rowKey: 'investgReserve14Id' },
// };

// AI审批结果渲染
// const aiApproveResultRender = ({ value, name, record, configName, documentCode }) => {
//   const meaning = record?.get(`${name}Meaning`) || value;
//   const bindObjFieldValue = record?.get(surveyMap[configName].rowKey);
//   const color = value === 'APPROVED' ? '#3ab344' : value === 'REJECTED' ? '#f05434' : '#1d2129';
//   return (
//     <a
//       style={{ color }}
//       onClick={() =>
//         openAiApproveModal({
//           documentCode,
//           bindObjFieldValue,
//           categoryCode: surveyMap[configName].configName,
//         })
//       }
//     >
//       {meaning || '-'}
//     </a>
//   );
// };

export { NoDataRender };
