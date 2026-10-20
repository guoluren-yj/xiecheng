/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { TextField, Select, Button, CodeArea, DataSet } from 'choerodon-ui/pro';
import { DatePicker, Tooltip } from 'choerodon-ui';
import ImgIcon from '@/utils/ImgIcon';
import { getCurrentOrganizationId } from 'utils/utils';
import { isObject } from 'lodash';
import { API_HOST } from 'utils/config';
import notification from 'utils/notification';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';

import { searchMatcher } from '@/utils/common';
import { QueryTypeList } from '@/routes/Modeler/ModelDesigner/utils/selectType';
import { getFieldValueType } from '@/routes/Modeler/ModelDesigner/utils/utils';

import APIConfigMap, { generateComment, getDemoDmlJsonText } from './getAPIConfig';
import RequestComDS from './RequestComDS';
import styles from '../index.less';
// 引入格式化器
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
if (typeof window !== 'undefined') {
  // 提供对应语言的语法高亮
  // eslint-disable-next-line global-require
  require('codemirror/mode/javascript/javascript');
}
const codeAreaOptions = { mode: { name: 'javascript', json: true }, lineNumbers: false };
const { Option } = Select;
interface IIndexProps {
  requestType: string;
  fields?: model.data.BaseDataObjectField[];
  dataObjectDetail?: any;
  tryItOutDisableStatus: boolean;
  [propsName: string]: any;
}
export default observer((props: IIndexProps) => {
  const organizationId = getCurrentOrganizationId();
  const { requestType, fields = [], dataObjectDetail } = props;
  const [queryExecuted, setQueryExecuted] = useState<boolean>(false);
  const [codeAreaReady, setCodeAreaReady] = useState<boolean>(true);
  const [queryDate, setQueryDate] = useState({ page: '0', size: '10' });
  const [params, setParams] = useState<any>(); // fixme 这个文件都没改
  const [currentDataType, setCurrentDataType] = useState<string>('example'); // model
  const apiConfig = useMemo(() => APIConfigMap.get(requestType), [requestType]);
  const requestComDs: any = useMemo(
    () => new DataSet(RequestComDS(apiConfig, dataObjectDetail, requestType)),
    [apiConfig, fields]
  );

  // 控件ds
  const typeValueDs = useMemo(
    () =>
      new DataSet({
        fields: fields?.map?.((field) => ({
          name: field.aliasName,
        })),
      }),
    [fields]
  );

  useEffect(() => {
    typeValueDs.removeAll(); // 重置控件
    setQueryDate({ page: '0', size: '10' }); // 初始化查询参数
  }, [dataObjectDetail.dataObjectCode]);

  /**
   * 点击Example Value后, 给请求体赋值
   */
  const setJsonData = (): void => {
    setCodeAreaReady(false);
    if (requestComDs.current) {
      if (requestType === 'update' || requestType === 'delete') {
        requestComDs.current.set('jsonData', getDemoDmlJsonText(fields, requestType));
      }
    }
    setTimeout(() => {
      setCodeAreaReady(true);
    }, 0);
  };

  useEffect(() => {
    setJsonData(); // 监听DS 给请求体赋默认值
  }, [requestComDs]);

  useEffect(() => {
    requestComDs.current.set('jsonData', null); // 监听数据对象 请求体
    setQueryExecuted(false); // 监听数据对象 清空返回体
    requestComDs.current.set('exampleData', getDemoDmlJsonText(fields, requestType)); // 监听数据对象 重置默认参数
  }, [fields]);

  /**
   * 执行Http请求 async
   */
  interface IDoRequestParams {
    (): void;
  }
  const doRequest: IDoRequestParams = async () => {
    handleInputChange('', '');
    if (requestType === 'update' || requestType === 'delete') {
      // 为空时
      const jsonData = requestComDs.current.get('jsonData');
      if (!jsonData) {
        notification.error({
          message: '警告',
          description: '请填写requestBody字段',
        });
        return;
      }
      // jsonData校验
      let validJson = await requestComDs.validate();
      // 无法转换JSON
      try {
        JSON.parse(jsonData);
      } catch (e) {
        validJson = false;
        notification.error({
          message: '警告',
          description: 'requestBody解析错误，请填写正确的JSON数据',
        });
      }
      if (validJson) {
        setQueryExecuted(true);
        requestComDs.submit();
      } else {
        setQueryExecuted(false);
      }
    } else if (
      requestType === 'query' ||
      requestType === 'page' ||
      requestType === 'list' ||
      requestType === 'aggregation'
    ) {
      setQueryExecuted(true);
      requestComDs.submit();
    }
  };

  /**
   * 根据数据源字段列表生成模型说明jsx
   * @param {Array<Object>} fieldList 数据源字段列表
   * @returns JSX.Element
   */
  const getModelInfoJsx = (fieldList: Array<any> = []): React.ReactElement => (
    <div className={styles['request-switch-model-text']}>
      <p>{`{`}</p>
      {fieldList.map((field) => (
        <p style={{ marginLeft: '10px' }}>
          {field.aliasName}
          <span style={{ fontWeight: 'lighter' }}>
            (<span style={{ color: '#5555AA' }}>{field.dataType}</span>,
            {field.requiredFlag === 1 ? (
              <span style={{ color: 'red' }}>必输</span>
            ) : (
              <i style={{ color: '#B6BBC6' }}>非必输</i>
            )}
            ){`${field.displayName}${generateComment(field)}`}
          </span>
        </p>
      ))}
      <p>{`}`}</p>
    </div>
  );

  /**
   * 处理非受控输入框的值
   * @param {String} fieldName 字段名
   * @param {String | Object} value 输入框的值
   * @param {Array} extValue 额外属性
   */
  const handleInputChange = (fieldName: string, value: any, ...extValue: any): void => {
    // 合并当前日期类型的查询条件类型
    const [field] = extValue;
    const _type = getFieldValueType(field?.dataType);
    if (_type === 'DATE') {
      Object.assign(field, { conditionType: value });
    }

    let realValue: any = null;
    // const {_d} = value;
    // 某些C7N输入框的回调函数的值是一个对象, 需要特殊处理
    let d: any = null;
    if (value) {
      const { _d } = value;
      d = _d;
    }
    if (isObject(value) && d) {
      // 日期输入框的value是Moment对象
      // 需要取onchange的第二个参数--dateString
      const [dataString] = extValue;
      realValue = dataString;
    } else {
      // 默认处理
      realValue = value;
    }
    const obj = fieldName ? { ...queryDate, [fieldName]: realValue } : queryDate;
    let str = '';
    if (requestType !== 'page') {
      delete obj.page;
      delete obj.size;
    }
    // 清除空值对象
    for (const item in obj) {
      if (obj[item] === null || obj[item] === '' || obj[item] === undefined) {
        delete obj[item];
      }
    }
    const keys = Object.keys(obj);
    const maxLength = keys.length - 1;
    // 拼接有值参数
    keys.forEach((key, i) => {
      if (i !== maxLength) {
        str += `${key}=${obj[key]}&`;
      } else if (obj[key] !== null && obj[key] !== '') {
        str += `${key}=${obj[key]}`;
      }
    });
    setQueryDate(obj);
    requestComDs.setQueryParameter('queryDate', obj);
    setParams(str);
  };

  /**
   * 根据数据源字段获取其专属输入框
   * @param {Object} 数据源字段
   * 输入框JSX
   */
  interface argsType {
    aliasName: string;
    dataType: any;
    conditionType: string;
  }
  interface IGetValueInputJsxParams {
    (arg1: argsType): React.ReactElement;
  }
  const getValueInputJsx: IGetValueInputJsxParams = (field) => {
    const { aliasName, dataType, conditionType } = field;
    switch (dataType) {
      case 'Boolean': {
        return (
          <Select
            name={aliasName}
            dataSet={typeValueDs}
            style={{ width: '100%' }}
            onChange={(val) => handleInputChange(aliasName, val)}
          >
            <Option value="1">是</Option>
            <Option value="0">否</Option>
          </Select>
        );
      }
      case 'Byte':
      case 'Short':
      case 'Integer':
      case 'Long':
      case 'Float':
      case 'Double':
      case 'BigDecimal': {
        return (
          <TextField
            name={aliasName}
            dataSet={typeValueDs}
            style={{ width: '100%', backgroundColor: 'white' }}
            // step={1}
            onChange={(val) => handleInputChange(aliasName, val)}
          />
        );
      }
      case 'LocalDate': {
        return ['IN', 'NOT_IN'].includes(conditionType) ? (
          <TextField
            name={aliasName}
            dataSet={typeValueDs}
            style={{ width: '100%', backgroundColor: 'white' }}
            // step={1}
            onChange={(val) => handleInputChange(aliasName, val)}
          />
        ) : (
          <DatePicker
            style={{ width: '100%', backgroundColor: 'white' }}
            format="YYYY-MM-DD"
            placeholder=""
            onChange={(val, extValue) => handleInputChange(aliasName, val, extValue)}
          />
        );
      }
      case 'ZonedDateTime': {
        return ['IN', 'NOT_IN'].includes(conditionType) ? (
          <TextField
            name={aliasName}
            dataSet={typeValueDs}
            style={{ width: '100%', backgroundColor: 'white' }}
            // step={1}
            onChange={(val) => handleInputChange(aliasName, val)}
          />
        ) : (
          <DatePicker
            style={{ width: '100%', backgroundColor: 'white' }}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder=""
            onChange={(val, extValue) => handleInputChange(aliasName, val, extValue)}
          />
        );
      }
      case 'String':
      default:
        return (
          <TextField
            name={aliasName}
            dataSet={typeValueDs}
            className={styles['text-input']}
            onChange={(val) => handleInputChange(aliasName, val)}
          />
        );
    }
  };

  /**
   * 过滤条件下拉过滤
   */
  const handleOptionFilter = (option: any, type: string): boolean => {
    const _type = getFieldValueType(type);
    if (
      (['STRING'].includes(_type) && // 字符串类型过滤掉 大于 大于等于 小于 小于等于
        [
          'EQUAL',
          'NOT_EQUAL',
          'FULLY_FUZZY',
          'BEFORE_FUZZY',
          'AFTER_FUZZY',
          'IN',
          'NOT_IN',
        ].includes(option.value)) ||
      (['NUMBER'].includes(_type) && // 数字类型过滤掉 全模糊 前模糊 后模糊
        [
          'EQUAL',
          'NOT_EQUAL',
          'GREATER_THAN',
          'GREATER_THAN_OR_EQUAL_TO',
          'LESS_THAN',
          'LESS_THAN_OR_EQUAL_TO',
          'IN',
          'NOT_IN',
        ].includes(option.value)) ||
      (['DATE'].includes(_type) && // 日期日期时间类型过滤掉 全模糊 前模糊 后模糊
        [
          'EQUAL',
          'NOT_EQUAL',
          'GREATER_THAN',
          'GREATER_THAN_OR_EQUAL_TO',
          'LESS_THAN',
          'LESS_THAN_OR_EQUAL_TO',
          'IN',
          'NOT_IN',
        ].includes(option.value)) ||
      (['BOOLEAN'].includes(_type) &&
        [
          // 布尔类型 选择等不/于等于
          'EQUAL',
          'NOT_EQUAL',
        ].includes(option.value))
    ) {
      return true;
    }
    return false;
  };

  /**
   * 渲染
   */
  return (
    <>
      {(requestType === 'page' ||
        requestType === 'query' ||
        requestType === 'list' ||
        requestType === 'aggregation') && (
        // 查询面板
        <article className={styles['request-com']}>
          <h3>Parameters</h3>
          <table>
            <thead>
              <tr>
                <th style={{ width: '15%', minWidth: '150px', color: '#5A6677', fontSize: '12px' }}>
                  Parameter
                </th>
                <th style={{ width: '10%', minWidth: '150px', color: '#5A6677', fontSize: '12px' }}>
                  Query Type &nbsp;&nbsp;
                  <Tooltip placement="top" title="查询条件的类型，不选择时默认为 '等于' ">
                    {/* <span className={styles['api-tip']} /> */}
                    <ImgIcon name="help.svg" size={14} />
                  </Tooltip>
                </th>
                <th style={{ width: '35%', minWidth: '350px', color: '#5A6677', fontSize: '12px' }}>
                  Value &nbsp;&nbsp;
                  <Tooltip
                    placement="top"
                    title={
                      requestType === 'query'
                        ? '仅支持查询单条数据结果, 不支持包含/不包含等查询条件结果出现多条数据的情况。'
                        : '支持入参为空以查询所有数据, 另外包含/不包含查询条件的入参值支持如“1,2,3”英文逗号分割的字符串形式的多值查询。'
                    }
                  >
                    {/* <span className={styles['api-tip']} /> */}
                    <ImgIcon name="help.svg" size={14} />
                  </Tooltip>
                </th>
                <th style={{ width: '20%', minWidth: '200px', color: '#5A6677', fontSize: '12px' }}>
                  Description
                </th>
                <th style={{ width: '10%', minWidth: '100px', color: '#5A6677', fontSize: '12px' }}>
                  Parameter Type
                </th>
                <th style={{ width: '10%', minWidth: '100px', color: '#5A6677', fontSize: '12px' }}>
                  Data Type
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>organizationId</td>
                <td>
                  <Select disabled value="EQUAL" searchMatcher={searchMatcher}>
                    <Option value="EQUAL">等于</Option>
                  </Select>
                </td>
                <td>
                  <TextField
                    className={styles['text-input']}
                    disabled
                    defaultValue={organizationId}
                  />
                </td>
                <td>租户ID</td>
                <td>path</td>
                <td>Long</td>
              </tr>
              {requestType === 'page' && (
                <>
                  <tr>
                    <td>page</td>
                    <td>
                      <Select disabled value="EQUAL" searchMatcher={searchMatcher}>
                        <Option value="EQUAL">等于</Option>
                      </Select>
                    </td>
                    <td>
                      <TextField
                        placeholder="请输入整数"
                        defaultValue={0}
                        restrict="0-9"
                        onChange={(val) => handleInputChange('page', val)}
                      />
                    </td>
                    <td>页码</td>
                    <td>query</td>
                    <td>Integer</td>
                  </tr>
                  <tr>
                    <td>size</td>
                    <td>
                      <Select disabled value="EQUAL" searchMatcher={searchMatcher}>
                        <Option value="EQUAL">等于</Option>
                      </Select>
                    </td>
                    <td>
                      <TextField
                        placeholder="请输入整数"
                        defaultValue={10}
                        restrict="0-9"
                        onChange={(val) => handleInputChange('size', val)}
                      />
                    </td>
                    <td>每页行数</td>
                    <td>query</td>
                    <td>Integer</td>
                  </tr>
                </>
              )}
              {fields.map((field: any) => (
                <tr>
                  <td>{field.aliasName}</td>
                  <td>
                    <Select
                      placeholder="查询条件类型"
                      onChange={(val) =>
                        handleInputChange(`${field.aliasName}@query-type`, val, field)
                      }
                      optionsFilter={(optionRecord) =>
                        handleOptionFilter(optionRecord.toData(), field.dataType)
                      }
                    >
                      {QueryTypeList.map((item) => (
                        <Option value={item.code}>{item.name}</Option>
                      ))}
                    </Select>
                  </td>
                  <td>{getValueInputJsx(field)}</td>
                  <td>{field.displayName}</td>
                  <td>query</td>
                  <td>{field.dataType}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <section>
            <Button
              disabled={props.tryItOutDisableStatus === false}
              className={styles['request-btn']}
              onClick={doRequest}
              dataSet={requestComDs}
            >
              Try it out!
            </Button>
            <span className={styles['delete-tip']}>当查询不到数据时，响应体信息为空</span>
          </section>
          {queryExecuted && (
            <footer>
              <h3>Request URL</h3>
              <div className={styles['url-text']}>
                {`${API_HOST}${apiConfig?.()?.url?.replace(
                  '#dataObjectCode#',
                  dataObjectDetail.dataObjectCode
                )}${params ? `?${params}` : ''}`}
              </div>
              <h3>Response Body</h3>
              {/* <div className={styles['body-text']}>url</div> */}
              <CodeArea
                dataSet={requestComDs}
                name="response"
                style={{ width: '100%', height: 290 }}
                formatter={JSONFormatter}
                options={codeAreaOptions}
              />
            </footer>
          )}
        </article>
      )}
      {(requestType === 'update' || requestType === 'delete') && (
        // 增删改面板
        <article className={styles['request-com']}>
          <h3>Parameters</h3>
          <table>
            <thead>
              <tr>
                <th style={{ width: '15%', minWidth: '150px', color: '#5A6677', fontSize: '12px' }}>
                  Parameter
                </th>
                <th style={{ width: '40%', minWidth: '400px', color: '#5A6677', fontSize: '12px' }}>
                  Value
                </th>
                <th style={{ width: '10%', minWidth: '100px', color: '#5A6677', fontSize: '12px' }}>
                  Description
                </th>
                <th style={{ width: '10%', minWidth: '100px', color: '#5A6677', fontSize: '12px' }}>
                  Parameter Type
                </th>
                <th style={{ width: '25%', minWidth: '250px', color: '#5A6677', fontSize: '12px' }}>
                  Data Type
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>organizationId</td>
                <td>
                  <TextField
                    className={styles['text-input']}
                    disabled
                    defaultValue={organizationId}
                  />
                </td>
                <td>租户ID</td>
                <td>path</td>
                <td>Long</td>
              </tr>
              <tr>
                <td>
                  <span>requestBody</span>
                  <Tooltip
                    placement="top"
                    title={
                      requestType === 'delete' ? (
                        <span>
                          <div>1. 建议使用查询接口先查询出数据，再进行删除操作。</div>
                          <div>2. 目前仅支持按主键删除，删除时需回传数据库主键信息。</div>
                          <div>3. 支持主从模型删除，删除时需同时回传主从模型的数据库主键信息。</div>
                          <div>4. 其他字段在删除动作中不会起任何作用，无需回传。</div>
                        </span>
                      ) : (
                        <span>
                          <div>新增：</div>
                          <div>
                            {' '}
                            1.
                            主键为数据库自增主键或自增序列（后台自动赋值），新增时请自行删除该字段。
                          </div>
                          <div>
                            {' '}
                            2. 编码字段由编码规则生成（后台自动赋值），新增时请自行删除该字段。
                          </div>
                          <div>
                            {' '}
                            3.
                            乐观锁版本号为更新动作的必需字段（后台自动处理），新建时请自行删除该字段。
                          </div>
                          <div> 4. 其他字段可按需填写内容。</div>
                          <br />
                          <div>更新：</div>
                          <div> 1. 建议使用查询接口先查询出数据，再进行更新操作。</div>
                          <div> 2. 目前仅支持主键更新，更新时需回传数据库主键信息。</div>
                          <div>
                            {' '}
                            3. 编码字段（后台更新时会覆盖），更新时需回传数据库该字段信息。
                          </div>
                          <div>
                            {' '}
                            4. 乐观锁版本号用来控制并发写冲突，更新时需回传数据库该字段信息。
                          </div>
                          <div>
                            {' '}
                            5. 其他字段如需更新，需回传修改后的字段内容；无需更新，请删除该字段，
                            后台会自动跳过。
                          </div>
                        </span>
                      )
                    }
                  >
                    {/* <span className={styles['api-tip']} /> */}
                    <ImgIcon name="help.svg" size={14} style={{ marginLeft: 10 }} />
                  </Tooltip>
                </td>
                <td>
                  <div className={styles['request-com-application']}>
                    {codeAreaReady ? (
                      <div className={styles['code-area-wrapper']}>
                        <CodeArea
                          dataSet={requestComDs}
                          name="jsonData"
                          style={{
                            width: '100%',
                            maxWidth: '100%',
                            height: 400,
                          }}
                          formatter={JSONFormatter}
                          options={codeAreaOptions}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: 400,
                        }}
                      />
                    )}
                    <div className={styles['request-com-application-bottom']}>
                      <span style={{ minWidth: '155px', width: '40%' }}>
                        Parameter content type:
                      </span>
                      <Select
                        style={{ width: '60%' }}
                        disabled
                        value="application/json"
                        searchMatcher={searchMatcher}
                      >
                        <Option value="application/json">application/json</Option>
                      </Select>
                    </div>
                  </div>
                </td>
                <td>请求内容</td>
                <td>body</td>
                <td>
                  <div className={styles['request-switch']}>
                    <div className={styles['request-switch-top']}>
                      <span
                        onClick={() => setCurrentDataType('model')}
                        style={
                          currentDataType === 'model' ? { color: '#29bece' } : { color: '#b6bbc6' }
                        }
                      >
                        Model
                      </span>
                      &nbsp;|&nbsp;
                      <span
                        onClick={() => setCurrentDataType('example')}
                        style={
                          currentDataType === 'example'
                            ? { color: '#29bece' }
                            : { color: '#b6bbc6' }
                        }
                      >
                        Example Value
                      </span>
                    </div>
                    {currentDataType === 'example' && (
                      <div onClick={setJsonData}>
                        <CodeArea
                          dataSet={requestComDs}
                          name="exampleData"
                          style={{
                            width: '100%',
                            maxWidth: '100%',
                            height: 400,
                          }}
                          disabled
                          formatter={JSONFormatter}
                          options={codeAreaOptions}
                        />
                      </div>
                    )}
                    {currentDataType === 'model' && getModelInfoJsx(fields)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <section>
            <Button
              disabled={props.tryItOutDisableStatus === false}
              className={styles['request-btn']}
              onClick={doRequest}
              dataSet={requestComDs}
            >
              Try it out!
            </Button>
            {requestType === 'delete' && (
              <span className={styles['delete-tip']}>删除成功时，响应体信息为空</span>
            )}
          </section>
          {queryExecuted && (
            <footer>
              <h3>Request URL</h3>
              <div className={styles['url-text']}>
                {`${API_HOST}${apiConfig?.()?.url?.replace(
                  '#dataObjectCode#',
                  dataObjectDetail.dataObjectCode
                )}`}
              </div>
              <h3>Response Body</h3>
              {/* <div className={styles['body-text']}>url</div> */}
              <CodeArea
                dataSet={requestComDs}
                name="response"
                style={{ width: '100%', height: 290 }}
                formatter={JSONFormatter}
                options={codeAreaOptions}
              />
            </footer>
          )}
        </article>
      )}
    </>
  );
});
