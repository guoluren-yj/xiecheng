/*
 * @Date: 2025-09-12 09:53:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import { getResponse } from 'utils/utils';

import { isJSON } from '@/routes/components/utils.js';
import { fetchSupplierFilesUrl } from '@/services/outsideProjectSetupService';

// 查看供应商档案
export const viewSupplierFiles = (params, setLoading) => {
  setLoading(true);
  fetchSupplierFilesUrl(params)
    .then(res => {
      const flag = isJSON(res);
      let resp = res;
      if (flag) {
        // 转json
        resp = JSON.parse(res);
      }
      // 先转json再调用getResponse，是因为如果接口报错报错信息被转化为了字符串（responseType: 'text'），这里在转化回json
      const result = getResponse(resp);
      if (result) {
        window.open(res);
      }
    })
    .finally(() => {
      setLoading(false);
    });
};
