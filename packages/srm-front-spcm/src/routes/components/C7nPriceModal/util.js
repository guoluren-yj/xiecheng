import FlexLinkModal from '@/routes/components/FlexLinkModal';
import querystring from 'querystring';

/**
 *参考价格弹框内链接打开其他页面
 * @param {{value: string,record:object, type:string}}
 * @returns {{ReactNode}}
 */
export function getFlexLink(val, record, type) {
  let path = '';
  let search = {};
  let params = {};
  const { priceSource, sourceFromId } = record;
  switch (priceSource) {
    // PO / CON / RFX / BID
    case 'PO':
      path =
        type === 'h0'
          ? `/sodr/send-order/detail/:id`
          : `/sodr/order-workspace/detail/all-orders/:id`;
      params = { id: sourceFromId };
      search = querystring.stringify({
        openFrom: 'modal',
      });
      break;
    case 'CONTRACT':
      path = '/sodr/purchase-order-maintain/purchase/detail';
      search = querystring.stringify({ pcHeaderId: sourceFromId, openFrom: 'modal' });
      break;
    case 'RFX':
      path = '/sodr/purchase-order-maintain/source-from-requisition/query-rfq/:rfxId';
      params = { rfxId: sourceFromId };
      search = querystring.stringify({
        libFlag: `order`,
        sourcePage: 'order',
        rfxStatus: 'FINISHED',
        inComingStatus: 'CHECK_PENDING',
      });
      break;
    case 'BID':
      path = '/sodr/purchase-order-maintain/source-from-requisition/bid-event-query/:bidId';
      params = { bidId: sourceFromId };
      search = querystring.stringify({
        // libFlag: `order`,
        // sourcePage: 'order',
        openFrom: 'modal',
        source: 'NONE',
      });
      break;
    default:
      path = '';
      break;
  }
  const _search = `?${search}`;
  const _location = {
    hash: '',
    pathname: path,
    search: _search,
  };
  const flexLinkProps = {
    path,
    type,
    text: val,
    location: _location,
    match: {
      params,
      path,
    },
    history: {
      ...window.dvaApp._history,
      location: _location,
    },
  };
  // eslint-disable-next-line react/react-in-jsx-scope
  return <FlexLinkModal {...flexLinkProps} />;
}

/**
 * 获取头上固定参数
 */
export function getHeaderParams(headerInfo) {
  const { ouId, supplierCompanyId, supplierId, purchaseOrgId, companyId, pcHeaderId } = headerInfo;
  return {
    ouId,
    supplierCompanyId,
    supplierId,
    purchaseOrgId,
    companyId,
    pcHeaderId,
  };
}
