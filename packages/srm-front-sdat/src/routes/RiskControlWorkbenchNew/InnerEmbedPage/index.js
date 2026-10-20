import React from 'react';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { getRealUrlParam } from '@/utils/utils';

import style from './index.less';

function getFormatParam(obj = {}) {
  const flag = String(obj?.flag ?? '');
  switch (flag) {
    case '0':
      return {
        supplierCompanyId: obj?.supplierCompanyId,
        supplierCompanyNum: obj?.supplierCompanyNum,
        supplierCompanyName: obj?.supplierCompanyName,
        supplierTenantId: obj?.supplierTenantId,
      };
    case '1':
      return {
        supplierCompanyId: obj?.supplierCompanyId,
        supplierCompanyNum: obj?.supplierCompanyNum,
        supplierCompanyName: obj?.supplierCompanyName,
        supplierId: obj?.supplierId,
        supplierNum: obj?.supplierNum,
        supplierName: obj?.supplierName,
        supplierTenantId: obj?.supplierTenantId,
      };
    case '2':
      return {};
    default:
      return {};
  }
}

export default function InnerEmber({
  path,
  modal,
  qualityParam,
  selectedType,
  eventNumber,
  globalUuid,
  problemHeaderId,
}) {
  const urls = path && path.includes('?') ? path.split('?') : [path];
  const url = urls.length ? urls[0] : '';
  const searchStr = urls.length > 1 ? urls[1] : '';

  const params = searchStr ? getRealUrlParam(`?${searchStr}`) : {};
  const param = selectedType === 'QUALITY' ? getFormatParam(qualityParam) : {};

  const embedProps = {
    path: url,
    pageData: {},
    location: {
      path,
      pathname: path,
      search: `?${searchStr}`,
    },
    match: {
      path,
      params: {
        ...params,
        problemHeaderId,
        onlyReadOperation: problemHeaderId ? 1 : '',
      },
    },
    history: {
      ...window.dvaApp._history,
    },
    modal,
    sourceDefaultData: {
      sourceCode: 'RISK',
      sourceNum: eventNumber,
      riskEventNum: eventNumber,
      riskProcessUuid: globalUuid,
      ...param,
      hiddenBtnNameList: ['save'],
      disabledFieldList: ['supplier'],
    },
    sourceLovPara: {
      supplierCompanyId: qualityParam?.supplierCompanyId,
    },
    hiddenBtnNameList: ['save'],
    disabledFieldList: ['supplier'],
    problemHeaderId,
  };

  return (
    <div className={style['model-inner-page-risk']}>
      <EmbedPage href={url} {...embedProps} />
    </div>
  );
}
