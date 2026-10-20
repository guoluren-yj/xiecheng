// 使用 web work 启动轮询操作

function getWorker(worker, param) {
  if (!worker) {
    return;
  }

  const code = worker.toString();
  const blob = new Blob([`(${code})(${JSON.stringify(param)})`]);

  return new Worker(URL.createObjectURL(blob));
}

// start count down
function getCountDown(param) {
  let _timer = null;
  const { leftTime } = param || {};
  let workCount = 0;

  this.onmessage = (e) => {
    const { data: { type, interval } = {} } = e || {};

    const startNewInterval = () => {
      _timer = setInterval(() => {
        workCount += 1;
        this.postMessage({ type: 'NEXT', workCount });
      }, interval || leftTime);
    };

    if (type === 'START') {
      startNewInterval();
    }

    if (type === 'RESTART') {
      workCount = 0;
      clearInterval(_timer);
      startNewInterval();
    }

    if (type === 'END') {
      this.postMessage({ type: 'END' });
      clearInterval(_timer);
      this.close();
    }
  };
}

// example
// const monitorWork = getWorker(getCountDown, { name: 'BIDDING_HALL_MONITOR_WORKER', });

export { getWorker, getCountDown };
