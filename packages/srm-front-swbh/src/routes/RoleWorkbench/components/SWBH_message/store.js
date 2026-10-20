import intl from 'utils/intl';

export function getMessageType() {
  return [
    {
      code: 'all',
      name: intl.get('spfm.dashboard.view.title.all').d('全部'),
    },
    {
      code: 'S',
      name: intl.get('spfm.dashboard.view.title.systemMessage').d('系统消息'),
    },
    {
      code: 'C',
      name: intl.get('spfm.dashboard.view.title.companyNotices').d('企业公告'),
    },
    {
      code: 'P',
      name: intl.get('spfm.dashboard.view.title.platformNotices').d('平台公告'),
    },
  ];
}
