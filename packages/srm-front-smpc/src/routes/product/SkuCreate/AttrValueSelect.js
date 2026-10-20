import React, { useState, useEffect, useRef } from 'react';
import { Select, DataSet } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import { fetchAttrValues } from './api';

export default function AttrValueSelect(props) {
  const { id, record, onChange, mappingKey = 'attrValLov', multiple = true, showMax = 20 } = props;
  const [options, setOptions] = useState([]);
  const [, update] = useState(0);
  const forceUpdate = () => update((prev) => prev + 1);
  const { categoryId, attributeCode: attrCode, attrId, [mappingKey]: initOption } = record.toData();

  let initOptions = [];

  if (multiple) {
    initOptions = initOption || [];
  } else {
    initOptions = initOption && initOption.attrValueId ? [initOption] : [];
  }

  initOptions = initOptions.filter((f) => f.attrValueId);

  const cache = useRef({
    allAttrs: null, // 暂时存储查询得到的属性，用于值改变时获取data
    changeOptions: [], // 主要用于品牌的筛选
    attrInitUpdate: false, // 判断属性初始查询是否完成，用于判断品牌是否替换全部数据
  });

  const { allAttrs, changeOptions, attrInitUpdate } = cache.current;

  const isBrand = attrCode === '000000000001';

  const setCache = (nextCache = {}) => {
    const prevCache = cache.current || {};
    cache.current = { ...prevCache, ...nextCache };
  };

  const fetchValues = async (val) => {
    const res = getResponse(
      await fetchAttrValues({
        attrId,
        categoryId,
        attrValueName: val,
      })
    );

    // 如果是品牌，则val有值，进行查询，设置前100条
    if (isBrand) {
      const option = (res || []).slice(0, showMax - 1);
      setOptions(option);
    } else {
      setOptions(res || []);
    }
    if (val) {
      const option = (res || []).slice(0, showMax - 1);
      if (option.length > 0) {
        let tmp = changeOptions;
        tmp = [...tmp, ...option];
        setCache({ changeOptions: tmp });
      }
    } else {
      setCache({ allAttrs: res });
      // 代表初始化品牌更新完成，后续可以不用请求接口
      if (isBrand) {
        setCache({ attrInitUpdate: true });
      }
      forceUpdate();
    }
    // 如果是初始请求，则往缓存属性内设置
  };

  useEffect(() => {
    setCache({ allAttrs: null, changeOptions: [], attrInitUpdate: false });
    setOptions(initOptions);
    if (attrCode) {
      fetchValues();
    }
  }, [attrCode]);

  let dataOptions = options;
  initOptions.forEach((f) => {
    if (!options.some((s) => s.attrValueId === f.attrValueId)) {
      dataOptions = [f, ...dataOptions];
    }
  });

  return (
    <Select
      {...props}
      searchMatcher
      options={new DataSet({ paging: false, data: dataOptions })}
      onInput={() => {
        const selectDom = document.querySelector(`#${id}`);
        const _val = selectDom.value;
        const val = _val ? _val.trim() : _val;
        // 如果当前为品牌且有缓存，且有输入值，则进行筛选操作
        if (isBrand && val && allAttrs) {
          const res = allAttrs.filter((f) => {
            if (f.attrValueName && f.attrValueName.includes(val)) {
              return true;
            } else {
              return false;
            }
          });
          setOptions(res.slice(0, showMax - 1));
        }
        // 如果当前为品牌，有输入值， 没有缓存，则进行请求
        if (isBrand && val && !allAttrs) {
          fetchValues(val);
        }
        // 如果为其他属性，有输入值
        if (!isBrand && val) {
          const res = (allAttrs || []).filter((f) => {
            if (f.attrValueName && f.attrValueName.includes(val)) {
              return true;
            } else {
              return false;
            }
          });
          setOptions(res);
        }
        // 如果为其他属性，无默认值，还原初始options
        if (!isBrand && !val) {
          setOptions(allAttrs || []);
        }
      }}
      onChange={(val, oldVal) => {
        const _resVals = onChange ? onChange(val, oldVal) : val;
        const resVals = multiple
          ? (_resVals || []).filter((f) => String(f).trim())
          : String(_resVals || '').trim()
          ? _resVals
          : undefined;
        const brandOptions = [];
        const attrValues = allAttrs || [];
        // 初始options控制
        const initOpts = attrValues.slice(0, showMax - 1);
        const setBrand = () => {
          const opts = initOpts.filter(
            (f) => !brandOptions.some((s) => s.attrValueId === f.attrValueId)
          );
          const showMaxOpts = [...brandOptions, ...opts];
          setOptions(showMaxOpts);
        };
        if (multiple) {
          const getValData = (alls) => {
            const attrValLov = (resVals || []).map((m) => {
              const data = alls.find((f) => f.attrValueId === m);
              if (data) {
                brandOptions.push(data);
                return data;
              } else {
                return { attrValueId: m, attrValueName: m };
              }
            });
            record.set(mappingKey, attrValLov);
          };
          if (isBrand) {
            getValData(attrInitUpdate ? attrValues : changeOptions);
            setBrand();
          } else {
            setOptions(attrValues);
            getValData(attrValues);
          }
        } else {
          const getValData = (alls) => {
            const data = alls.find((f) => f.attrValueId === resVals);
            if (data) brandOptions.push(data);
            record.set(mappingKey, data || { attrValueId: resVals, attrValueName: resVals });
          };
          if (isBrand) {
            getValData(attrInitUpdate ? attrValues : changeOptions);
            setBrand();
          } else {
            setOptions(attrValues);
            getValData(attrValues);
          }
        }
        record.set(props.name, resVals);
        initOptions = [];
      }}
    />
  );
}
