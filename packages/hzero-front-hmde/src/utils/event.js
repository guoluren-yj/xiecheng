/* eslint-disable no-async-promise-executor */
import { handleQuery, queryFunctionById } from '@/services/eventEngineService';
import { getResponse } from 'utils/utils';

export function handleClick(eventId, ...otherParams) {
  const [param, callBack, eventMap] = otherParams;
  return new Promise(async resolve => {
    const { [eventId]: targetEvent } = eventMap; // dataSet
    if (Object.prototype.toString.call(targetEvent).substr(8, 6) === 'Object') {
      switch (targetEvent.functionType) {
        case 'search': {
          const result = await getResponse(handleQuery({ uri: param.uri, param }));
          callBack(result);
          resolve();
          break;
        }
        default:
          break;
      }
    }
  });
}

export function eventEngine(id) {
  let eventMap = {
    onClick(eventId, params, callBack) {
      return handleClick(eventId, params, callBack, eventMap);
    },
  };
  eventEngine.get = () => {
    return eventMap;
  };
  eventEngine.onClick = (eventId, params, callBack) => {
    return handleClick(eventId, params, callBack, eventMap);
  };
  return async () => {
    if (!eventMap[id]) {
      await queryFunctionById(id).then(res => {
        if (getResponse(res)) {
          eventMap = {
            ...eventMap,
            [id]: res,
          };
        }
      });
      // eventMap = {
      //   ...eventMap,
      //   [id]: {
      //     functionCode: 'common_search',
      //     functionId: id,
      //     functionName: '统一查询',
      //     functionType: 'search',
      //     functionUri: '/search',
      //   },
      // };
      return eventMap;
    } else {
      return eventMap;
    }
  };
}
