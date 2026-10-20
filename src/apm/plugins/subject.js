import { isFunction, noop } from 'lodash';
import arrayRemove from '../utils/arrayRemove';

const BUFFER_TIME = 3e5;

function applyBufferTimer(disable, run, bufferTime) {
  let timer = 0;
  return bufferTime === -1 ? noop : () => {
    if (disable()) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = 0;
      return undefined;
    }
    if (0 === timer) {
      timer = setTimeout(run, bufferTime);
    }
  };
}

function nextLink(handle, subjects) {
  let t = [];
  try {
    t = subjects.reduce((e, subject) => {
      try {
        const n = subject(handle);
        if (isFunction(n)) {
          e.push(n);
        }
      } catch (e) {
      }
      return e;
    }, []);
  } catch (e) {
  }
  return (e) => nextLink(e, t);
}

function toObservable(bufferTime = BUFFER_TIME) {
  function unsubscribe(e) {
    subjects = arrayRemove(subjects, e);
    if (!stopped) {
      bufferTimerDisposer();
    }
  }

  let attach,
    subjects = [],
    completeHandles = [],
    stopped = false;
  const bufferTimerDisposer = applyBufferTimer(
    () => !!subjects.length,
    () => {
      stopped = true;
      if (attach) {
        attach[0]();
      }
      completeHandles.forEach((e) => e());
      completeHandles.length = 0;
      attach = undefined;
    },
    bufferTime,
  );
  return {
    next(handle) {
      return nextLink(handle, subjects);
    },
    complete(handle) {
      completeHandles.push(handle);
    },
    attach(e, t) {
      attach = [e, t];
    },
    subscribe(subject) {
      if (stopped) {
        throw new Error('Observer is closed');
      }
      subjects.push(subject);
      if (attach && attach[1]) {
        attach[1](subject);
      }
      bufferTimerDisposer();
      return () => unsubscribe(subject);
    },
    unsubscribe,
  };
}

function createSafeObserver(run, callback, bufferTime) {
  const observer = toObservable(bufferTime);
  try {
    run(observer.next, observer.attach);
    if (callback) {
      observer.complete(callback);
    }
  } catch (e) {
  }
  return [observer.subscribe, observer.unsubscribe];
}

export function initPrivateSubject(client, [subjectName, subject], bufferTime) {
  const privateSubject = client.privateSubject || {};
  if (!privateSubject[subjectName]) {
    privateSubject[subjectName] = createSafeObserver(
      subject,
      () => {
        privateSubject[subjectName] = undefined;
      },
      bufferTime,
    );
  }
  return privateSubject[subjectName];
}

export default function SubjectPlugin(client, subject) {
  const observers = subject || {};
  client.provide('initSubject', ([t, e]) => {
    if (!observers[t]) {
      observers[t] = createSafeObserver(e, () => {
        observers[t] = undefined;
      });
    }
    return observers[t];
  });
  client.provide('getSubject', (e) => observers[e]);
  client.provide('privateSubject', {});
}
