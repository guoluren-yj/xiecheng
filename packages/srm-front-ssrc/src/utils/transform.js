// 将天，小时，分钟转为分钟值
const transformDayHourMinute = (data) => {
  const { days = 0, hours = 0, minutes = 0 } = data || {};

  let time = null;

  if (!days && !hours && !minutes) {
    return time;
  }

  // if (type === 'day') {
  //   time = days * 1440 + hours * 60 + minutes;
  // } else if (type === 'hour') {
  //   time = days * 1440 + hours * 60 + minutes;
  // } else {
  //   time = days * 1440 + hours * 60 + minutes;
  // }

  time = (days || 0) * 1440 + (hours || 0) * 60 + minutes || 0;

  return time;
};

export { transformDayHourMinute };
