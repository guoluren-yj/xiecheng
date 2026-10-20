import { setCard } from 'hzero-front/lib/customize/cards';

// 服务领域资产地图
setCard({
  code: 'RadialAssetCard',
  component: () => import('./Cards/RadialAssetCard'),
});

// 已上线服务接口总数
setCard({
  code: 'HITF_InterfaceServerCard',
  component: () => import('./Cards/InterfaceServerCard'),
});

// 今日透传总量
setCard({
  code: 'HITF_InterfaceServerInvokeCard',
  component: () => import('./Cards/InterfaceServerInvokeCard'),
});

// 接口调用次数
setCard({
  code: 'HITF_InterfaceInvokeTimesCard',
  component: () => import('./Cards/InterfaceInvokeTimesCard'),
});

// 透传业务错误排行
setCard({
  code: 'HITF_TraceLogsBusinessFailRanking',
  component: () => import('./Cards/TraceLogs/BusinessFailRanking'),
});

// 透传调用错误排行
setCard({
  code: 'HITF_TraceLogsResponseFailRanking',
  component: () => import('./Cards/TraceLogs/ResponseFailRanking'),
});

// 服务透传QPS
setCard({
  code: 'HITF_QpsCard',
  component: () => import('./Cards/HITF_QpsCard'),
});

// 失败次数统计
setCard({
  code: 'HITF_FailureTimesCard',
  component: () => import('./Cards/HITF_FailureTimesCard'),
});

// 响应时间统计
setCard({
  code: 'HITF_ResponseTimeCard',
  component: () => import('./Cards/HITF_ResponseTimeCard'),
});

// 业务失败统计
setCard({
  code: 'HITF_BusinessFailureTimeCard',
  component: () => import('./Cards/HITF_BusinessFailureTimeCard'),
});

// 透传接口流量
setCard({
  code: 'HITF_InterfaceTrafficCard',
  component: () => import('./Cards/InterfaceTrafficCard'),
});
