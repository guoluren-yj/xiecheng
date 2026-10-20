/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-08-24 11:36:49
 * @FilePath: /srm-front-sslm/src/routes/Workbench/PlatformSupplier/RelationBills/stores/inquiryDS.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Link } from 'dva/router';
import querystring from 'querystring';
import { isEmpty, isNil } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const inquiryDS = params => ({
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'rfxStatusMeaning',
      label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
    },
    {
      name: 'rfxNum',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.RFXNo.').d('RFX单号'),
    },
    {
      name: 'rfxTitle',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.Title').d('标题'),
    },
    {
      name: 'createdByName',
      label: intl.get(`sslm.common.view.creator.name`).d('创建人'),
    },
    {
      name: 'suggestedFlag',
      label: intl.get('sslm.common.model.common.suggestedFlag').d('是否中标'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SSRC}/v2/${organizationId}/rfx/list/all`,
        method: 'GET',
        data: filterNullValueObject({
          companyIdForSupplierService: companyId,
          supplierCompanyId,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.INQUIRY_SEARCH_BAR,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.INQUIRY_LIST',
          ...data,
        }),
      };
    },
  },
});

const inquiryColumns = ({ supplierCompanyId } = {}) => [
  {
    name: 'rfxStatusMeaning',
    width: 160,
    renderer: ({ value, name, record }) => renderStatus({ value, name, record }),
  },
  {
    name: 'rfxNum',
    width: 160,
    renderer: ({ value, record }) => {
      const { data: { rfxHeaderId, projectLineSectionId } = {} } = record;
      const search = querystring.stringify({
        current: 'newInquiryHall',
        projectLineSectionId,
      });

      return <Link to={`/ssrc/new-inquiry-hall/rfx-detail/${rfxHeaderId}?${search}`}>{value}</Link>;
    },
  },
  {
    name: 'rfxTitle',
  },
  {
    name: 'createdByName',
    width: 160,
  },
  {
    name: 'suggestedFlag',
    width: 120,
    renderer: ({ record }) => {
      const suggestedSuppliers = record.get('suggestedSuppliers');
      if (!isNil(suggestedSuppliers) && !isEmpty(suggestedSuppliers)) {
        const supplierCompanyIds = suggestedSuppliers.map(i => i.supplierCompanyId);
        if (supplierCompanyIds.includes(supplierCompanyId)) {
          return yesOrNoRender(1);
        }
      }
      return yesOrNoRender(0);
    },
  },
];

export { inquiryDS, inquiryColumns };
