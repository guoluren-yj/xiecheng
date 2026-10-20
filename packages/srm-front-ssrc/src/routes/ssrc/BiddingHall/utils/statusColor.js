import { isNil, isEmpty } from 'lodash';

// status color
const getLineStatusColor = (status = null, options = {}) => {
  let colorObj = {};

  if (isNil(status)) {
    return colorObj;
  }

  const { [status]: customizeColorObj = {} } = options || {};

  colorObj = {
    color: '#0161D5',
    bgColor: 'rgba(10,125,245,0.15)',
  };

  if (status === 'IN_PROGRESS' || status === 1) {
    colorObj = {
      color: '#0161D5',
      bgColor: 'rgba(10,125,245,0.15)',
    };
  }

  if (status === 'PAUSED' || status === 2) {
    colorObj = {
      color: '#F06200',
      bgColor: 'rgba(242,128,26,0.10)',
    };
  }

  if (status === 'NOT_START' || status === 3) {
    colorObj = {
      color: '#4E5769',
      bgColor: '#E5E7EC',
    };
  }

  if (status === 'BIDDING_END' || status === 'SUGGESTED' || status === 'FINISHED' || status === 4) {
    colorObj = {
      color: '#179454',
      bgColor: 'rgba(71, 184, 131, 0.15)',
    };
  }

  if (status === 'CLOSED' || status === 'TRIAL_BIDDING' || status === 5) {
    colorObj = {
      color: '#4E5769',
      bgColor: '#F7F8FA',
    };
  }

  if (!isEmpty(customizeColorObj)) {
    return customizeColorObj;
  }

  return colorObj;
};

// purchase status color
const getPurLineStatusColor = (status = null) => {
  if (!status) {
    return {};
  }
  const colorMap = new Map([
    [
      'BIDDING_NOT_START',
      {
        // 未开始
        color: '#FFFFFF',
        'background-color': '#868D9C',
      },
    ],
    [
      'BIDDING_IN_PROGRESS',
      {
        // 进行中
        color: '#FFFFFF',
        'background-color': '#0161D5',
      },
    ],
    [
      'IN_PROCESS', // 日式/荷兰，进行中
      {
        // 进行中
        color: '#FFFFFF',
        'background-color': '#0161D5',
      },
    ],
    [
      'BIDDING_PAUSED',
      {
        // 暂停
        color: '#FFFFFF',
        'background-color': '#F06200',
      },
    ],
    [
      'BIDDING_CLOSED',
      {
        // 关闭
        color: '#FFFFFF',
        'background-color': '#868D9C',
      },
    ],
    [
      'BIDDING_END',
      {
        // 竞价完成
        color: '#FFFFFF',
        'background-color': ' #179454',
      },
    ],
  ]);

  return (
    colorMap.get(status) || {
      color: '#FFF',
      backgroundColor: '#868D9C',
    }
  );
};

// purchase status color
const getPurLineStatusTimerColor = (status = null) => {
  if (!status) return {};
  const colorMap = new Map([
    [
      'BIDDING_NOT_START',
      {
        // 未开始
        color: '#4E5769',
        'background-color': '#E5E7EC',
      },
    ],
    [
      'BIDDING_IN_PROGRESS',
      {
        // 进行中
        color: '#0161D5',
        'background-color': 'rgba(10,125,245,0.15)',
      },
    ],
    [
      'BIDDING_PAUSED',
      {
        // 暂停
        color: '#F06200',
        'background-color': 'rgba(242,128,26,0.15)',
      },
    ],
    [
      'BIDDING_CLOSED',
      {
        // 关闭
        color: '#4E5769',
        'background-color': '#E5E7EC',
      },
    ],
    [
      'BIDDING_END',
      {
        // 竞价完成
        color: '#179454',
        'background-color': ' rgba(71,184,131,0.15)',
      },
    ],
  ]);
  return (
    colorMap.get(status) || {
      color: '#4E5769',
      backgroundColor: '#E5E7EC',
    }
  );
};

const getCommonLineStatusColor = (status = null) => {
  if (!status) {
    return {};
  }

  let color = '#FFFFFF';
  let bgColor = '';
  let tagColor = ''; // 标签颜色

  if (['BIDDING_NOT_START', 'NOT_START', 'SIGN_IN', 1].includes(status)) {
    color = '#FFFFFF';
    bgColor = '#868D9C';
    tagColor = 'gray';
  } else if (['BIDDING_IN_PROGRESS', 'BIDDING', 'IN_PROGRESS', '2', 2].includes(status)) {
    color = '#FFFFFF';
    bgColor = '#0161D5';
    tagColor = 'blue';
  } else if (['BIDDING_PAUSED', 'PAUSED', '3', 3].includes(status)) {
    color = '#FFFFFF';
    bgColor = '#F06200';
    tagColor = 'yellow';
  } else if (['BIDDING_CLOSED', 'CLOSED', '4', 4].includes(status)) {
    color = '#FFFFFF';
    bgColor = '#868D9C';
    tagColor = 'gray';
  } else if (['BIDDING_END', 'BIDDING_END', 'FINISHED', '5', 5].includes(status)) {
    color = '#FFFFFF';
    bgColor = '#179454';
    tagColor = 'green';
  } else {
    color = '#FFFFFF';
    bgColor = '#0161D5';
    tagColor = 'gray';
  }

  return {
    color,
    backgroundColor: bgColor,
    tagColor,
  };
};

const getSupplierStatusTagColor = (data) => {
  const { status } = data || {};

  let color = 'gray';

  if (status === 'ACCEPTED') {
    color = 'green';
  }

  return color;
};

export {
  getLineStatusColor,
  getPurLineStatusColor,
  getPurLineStatusTimerColor,
  getCommonLineStatusColor,
  getSupplierStatusTagColor,
};
