

/**
 *  这个文件的代码,复制这里的,只是它太复杂,简化了很多
 * https://github.com/alibaba/hooks/blob/master/packages/use-request/src/useAsync.ts
 */


//  import debounce from 'lodash.debounce';
//  import throttle from 'lodash.throttle';
import { useCallback, useEffect, useRef, useState } from 'react';
// import usePersistFn from './usePersistFn';
import { getResponse } from 'utils/utils';
import useUpdateEffect from './useUpdateEffect';

// import request from 'utils/request';


 function useAsync(
   service,
   options,
 ){
   const _options = options || {};
   const {
     refreshDeps = [],
     manual = false,
     defaultLoading = false,
     defaultParams = [],
     initialData,
   } = _options;

   const [loading, setLoading] = useState(defaultLoading);
   const [data, setData] = useState(initialData);
  //  const fetchesRef = useRef(fetches);
  //  fetchesRef.current = fetches;

   const run = useCallback(
     (...args) => {
      setLoading(true);
      return service(...args).then(res=>{
        setLoading(false);
        setData(res);
        return getResponse(res);
      }).catch(err=>{
        setLoading(false);
        return '';
      });
     },
     [],
   );
   const runRef = useRef(run);
   runRef.current = run;

   // 第一次默认执行
   useEffect(() => {
     if (!manual) {
        runRef.current(...defaultParams);
       }
   }, []);


   //  refreshDeps 变化，重新执行所有请求
   useUpdateEffect(() => {
     if (!manual) {
       /* 全部重新执行 */
       runRef.current(...defaultParams);
     }
   }, [...refreshDeps]);
   return {
     loading,
     data,
    //  error: undefined,
     params: [],
     run,
   };
 }

 export default useAsync;
