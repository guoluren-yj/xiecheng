import { filterNullValueObject } from 'utils/utils';

export function getC7NQueryParams(dataSet) {
  const queryRecord = dataSet?.queryDataSet?.current;
  const params = dataSet.queryParameter;
  const query = queryRecord ? queryRecord.toJSONData() : {};
  const queryParams = { ...params, ...query };
  delete queryParams.__id;
  delete queryParams.__dirty;
  delete queryParams._status;
  return filterNullValueObject(queryParams);
}
