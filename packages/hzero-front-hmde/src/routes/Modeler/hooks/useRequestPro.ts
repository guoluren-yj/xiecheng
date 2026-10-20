import { useState, useMemo } from 'react';
import notification from 'utils/notification';

// 处理请求数据的hooks
type IRun = (param: any) => Promise<any>; // fixme
export default (promise) => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const run: IRun = useMemo(
    () => async (param) => {
      const _clone = (_data) => {
        setLoading(false);
        return _data;
      };
      setLoading(true);
      const res = await promise(param);
      if (res && res.failed) {
        // 错误
        notification.error({
          message: '警告',
          description: res.message,
        });
        setErr(res);
        return _clone('');
      }
      // 执行完
      setData(res);
      return _clone(res);
    },
    []
  );
  return [data, loading, run, err];
};
