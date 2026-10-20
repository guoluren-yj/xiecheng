import { isFunction } from 'lodash';

import webSocketManager from 'utils/webSoket';
import { getCurrentOrganizationId } from 'utils/utils';

function getAiRecognizeSocketUrl(settleNum?: string) {
  if (!settleNum) return '';
  return `/topic/ssta-invoice-ai/${getCurrentOrganizationId()}/${settleNum}`;
}

function parseSocketMessage(messageData: any = {}) {
  try {
    const rawData = messageData?.message || messageData?.data || '{}';
    // 如果已经是对象/数组，直接返回，避免 JSON.parse 报错
    if (typeof rawData === 'object') return rawData;
    return JSON.parse(rawData);
  } catch (e) {
    console.error('Failed to parse socket message:', e);
    return {};
  }
}

// 同步成功
function shouldRefreshByAiRecognizeSocket(data: Record<string, any> = {}) {
  return data.syncStatus === 'success';
}

export function registerAiInvoiceRecognizeSocket(
  settleNum: string | undefined,
  onRefresh: (data?: any) => void
) {
  if (!isFunction(onRefresh)) return () => {};
  const socketUrl = getAiRecognizeSocketUrl(settleNum);
  if (!socketUrl) return () => {};
  const socketEventListener = (messageData: any) => {
    const dataList = parseSocketMessage(messageData);
    const refreshData = (Array.isArray(dataList) ? dataList : [dataList]).find((item) =>
      shouldRefreshByAiRecognizeSocket(item)
    );
    if (!refreshData) return;
    onRefresh(refreshData);
  };

  if (webSocketManager) {
    // 不是初始化状态，就进行初始化
    if (webSocketManager.socketStatus !== 32) {
      webSocketManager.initWebSocket();
    }
    webSocketManager.addListener(socketUrl, socketEventListener);
    return () => {
      webSocketManager.removeListener(socketUrl, socketEventListener);
    };
  }
}
