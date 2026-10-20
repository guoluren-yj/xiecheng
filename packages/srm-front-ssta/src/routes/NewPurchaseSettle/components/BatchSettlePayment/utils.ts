import { stringify } from 'querystring';

import { openEmbedPage } from '../../../../utils/utils';

export function handleViewDetail(settleHeaderId: string) {
  if (!settleHeaderId) return;
  const documentType = 'payment';
  openEmbedPage({
    href: `/ssta/new-purchase-settle/${documentType}/${settleHeaderId}`,
    search: stringify({
      source: 'batchModal',
      type: 'all',
      docLinkFlag: 1,
    }),
    params: { settleHeaderId, documentType },
    onConfirm: null,
  });
};

