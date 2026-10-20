import React from 'react';

import intl from 'utils/intl';
import { getAttachmentUrl } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import Image from '@/components/Image';
import Card from '@/components/Card';
import { getmanagementData, statusRenderer } from '../list/renderUtlils';
import style from './index.less';

export default function Detail({ record, isPlatform = false }) {
  const {
    companyName,
    companyNum,
    logoUrl,
    initiationFlag,
    description,
    website,
    industryList = [],
    industryCategoryList = [],
    serviceAreaList = [],
  } = record.toData();

  const getStr = (list, itemName) => {
    return list.length === 0
      ? '-'
      : list.reduce((pre, item) => pre.concat(`、${item[itemName]}`), '').slice(1);
  };

  const manageStr = getStr(getmanagementData(record, 'manageName'), 'manageName');
  return (
    <>
      <div className={style['supplier-detail-header']}>
        <Image
          className="sku-img"
          width={118}
          height={118}
          value={getAttachmentUrl(logoUrl, PRIVATE_BUCKET)}
        />
        <div className={style['right-wapper']}>
          <div className={style['first-line']}>
            <h2 className={style['company-name']}>{companyName}</h2>
            {!isPlatform && statusRenderer({ value: initiationFlag, record })}
          </div>
          <div className={style['second-line']}>
            <span>
              {intl.get('smkt.supplierManage.modal.companyCode').d('编码：')} {companyNum || '-'}
            </span>
            <span>
              {intl.get('smkt.supplierManage.modal.website').d('官网：')} {website || '-'}
            </span>
          </div>
          <p className={style['third-line']}>
            {intl.get('smkt.supplierManage.modal.companyDescription').d('公司简介：')}
            {description || '-'}
          </p>
        </div>
      </div>
      <div className={style['supplier-detail-content']}>
        <Card title={intl.get('smkt.supplierManage.modal.businessInfo').d('业务信息')}>
          <table border="1" width="100%">
            <tr>
              <td>{intl.get('smkt.supplierManage.modal.managementList').d('经营性质')}</td>
              <td className={style['td-item']} title={manageStr}>
                {manageStr}
              </td>
            </tr>
            <tr>
              <td>{intl.get('smkt.supplierManage.modal.industryList').d('行业性质')}</td>
              <td className={style['td-item']}>{getStr(industryList, 'industryName')}</td>
            </tr>
            <tr>
              <td>{intl.get('smkt.supplierManage.modal.industryCategoryList').d('主营品类')}</td>
              <td className={style['td-item']}>{getStr(industryCategoryList, 'categoryName')}</td>
            </tr>
            <tr>
              <td>{intl.get('smkt.supplierManage.modal.serviceAreaList').d('送货范围')}</td>
              <td className={style['td-item']}>{getStr(serviceAreaList, 'serviceAreaMeaning')}</td>
            </tr>
          </table>
        </Card>
      </div>
    </>
  );
}
