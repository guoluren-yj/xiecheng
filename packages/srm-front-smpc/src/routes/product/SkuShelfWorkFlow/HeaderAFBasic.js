import React from 'react';
import intl from 'utils/intl';
import { AFBasic } from '_components/AFCards';

export default function HeaderAFBasic({ dataSet }) {
  const lineCount = dataSet?.current?.get('lineCount');
  return (
    <AFBasic
      dataSet={dataSet}
      titleField="batchNum"
      tagFields={['sourceFrom']}
      normalFields={['realName', 'lastUpdateDate', 'approveRemark']}
      fieldsConfig={{
        sourceFrom: {
          render({ value }) {
            return value === 'CATA'
              ? intl.get('smpc.product.view.cataSku').d('目录化商品')
              : intl.get('smpc.product.view.ecSku').d('电商商品');
          },
        },
      }}
      contentRemainWidth="25%"
      contentRemainRender={() => (
        <>
          <div className="header-right">
            <div className="label">
              {intl.get('smpc.product.view.workFlow.lineCount').d('商品总数')}
            </div>
            <div className="amount">{lineCount || '-'}</div>
          </div>
        </>
      )}
    />
  );
}
