import intl from 'utils/intl';

const customizeSearchTagList = () => {
  return [
    {
      value: 'queryLineStatusInProgressFlag',
      meaning: intl.get('ssrc.inquiryHall.button.onGoing').d('进行中'),
    },
    {
      value: 'queryLineStatusSubmittedFlag',
      meaning: intl.get('ssrc.biddingHall.view.title.biddingHallAlreadyPrice').d('已出价'),
    },
    {
      value: 'queryLineStatusFollowedFlag',
      meaning: intl.get('ssrc.biddingHall.view.title.biddingHallAlreadyCollection').d('已关注'),
    },
  ];
};

const dayIntl = {
  today: intl.get('ssrc.common.view.today').d('今天'),
  tomarrow: intl.get('ssrc.common.view.tomarrow').d('明天'),
  month: intl.get('ssrc.common.view.month').d('月'),
  day: intl.get('ssrc.common.view.day').d('日'),
  empty: '',
};

const getIntl = (type = '') => {
  let title = '';

  if (!type || typeof type !== 'string') {
    return title;
  }

  if (type === 'today') {
    title = intl.get('ssrc.common.view.today').d('今天');
  }
  if (type === 'tomarrow') {
    title = intl.get('ssrc.common.view.tomarrow').d('明天');
  }
  if (type === 'month') {
    title = intl.get('ssrc.common.view.month').d('月');
  }
  if (type === 'day') {
    title = intl.get('ssrc.common.view.day').d('日');
  }
  if (type === 'empty') {
    title = '';
  }

  return title;
};

export { customizeSearchTagList, dayIntl, getIntl };
