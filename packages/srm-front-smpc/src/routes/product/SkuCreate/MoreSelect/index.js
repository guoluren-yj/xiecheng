import React, { useState, useEffect, useRef } from 'react';
import { Select, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { fetchAttrValues } from '../api';

import styles from './index.less';

const initialCache = {
  page: 0, // 记录分页
  data: [], // 记录查询结果
  inputVal: undefined, // 记录输入值
  showMore: false, // 是否还有更多
  reSearch: false, // 聚焦重新查询
  noSearchRes: false, // 查询是否有结果
};

export default function MoreSelect(props) {
  const {
    id,
    record,
    onChange,
    onOption = () => ({}),
    mappingKey = 'attrValLov',
    multiple = true,
    size = 20,
    custom = false, // custom 是否支持自定义， 原生custom貌似在mac上有问题
  } = props;
  const [loading, setLoading] = useState(false);
  //   const [page, setPage] = useState(0);
  const [, update] = useState(0);
  const forceUpdate = () => update((prev) => prev + 1);
  const { categoryId, attributeCode: attrCode, attrId } = record.toData();

  let initList = [];
  propsChangeReset();

  const cache = useRef({ ...initialCache });
  const { inputVal, data, page, showMore, reSearch, noSearchRes } = cache.current;

  //   const isBrand = attrCode === '000000000001';

  const setCache = (nextCache = {}) => {
    const prevCache = cache.current || {};
    cache.current = { ...prevCache, ...nextCache };
  };

  // 重新初始化数据
  function propsChangeReset() {
    const initData = record.get(mappingKey);
    if (multiple) {
      initList = initData || [];
    } else {
      initList = initData && initData.attrValueId ? [initData] : [];
    }
    initList = initList.filter((f) => f.attrValueId);
  }

  // 请求
  const fetchValues = async (_val, _page = 0) => {
    setLoading(true);
    const res = getResponse(
      await fetchAttrValues({
        size,
        page: _page,
        attrId,
        categoryId,
        attrValueName: _val,
      })
    );
    setLoading(false);

    if (res) {
      const { content, totalPages } = res;
      const isMore = totalPages > _page + 1;
      // 查询条件是否变更
      let _data = content || [];
      if (_page > 0) {
        _data = [...data, ..._data];
      }
      setCache({
        page: _page,
        inputVal: _val,
        showMore: isMore,
        data: _data,
        noSearchRes: _val && _data.length === 0,
      });
      forceUpdate();
    }
  };

  useEffect(() => {
    setCache(initialCache);
    propsChangeReset();
    forceUpdate();
    if (attrCode) {
      fetchValues();
    }
  }, [attrCode]);

  let dataOptions = data;
  initList.forEach((f) => {
    if (!data.some((s) => s.attrValueId === f.attrValueId)) {
      dataOptions = [f, ...dataOptions];
    }
  });

  const moreOpt = {
    attrValueId: '_more',
    attrValueName: intl.get('hzero.common.button.more').d('更多'),
  };

  let endOpts = [...dataOptions];

  // 存在查询且支持自定义
  if (custom && inputVal && !dataOptions.some((s) => s.attrValueName === inputVal)) {
    const customOpt = {
      attrValueId: inputVal,
      attrValueName: inputVal,
    };
    endOpts = [customOpt, ...endOpts];
  }

  // 还有未查完的
  if (showMore) {
    endOpts = [...endOpts, moreOpt];
  }

  return (
    <Select
      {...props}
      loading={loading}
      searchMatcher
      options={new DataSet({ paging: false, data: endOpts })}
      onOption={(optionArg) => {
        const newOption = onOption(optionArg) || {};
        const moreOption =
          optionArg.record.get('attrValueId') === '_more'
            ? {
                disabled: true,
                className: styles['more-item'],
              }
            : {};
        return { ...newOption, ...moreOption };
      }}
      optionRenderer={({ text, value }) => {
        return value === '_more' ? (
          <a
            style={{ display: 'block', width: '100%' }}
            onClick={() => fetchValues(inputVal, page + 1)}
          >
            {text}
          </a>
        ) : (
          text
        );
      }}
      onInput={() => {
        const selectDom = document.querySelector(`#${id}`);
        const _val = selectDom.value;
        const val = _val ? _val.trim() : _val;
        if (attrCode) {
          fetchValues(val);
        }
        if (custom && !attrCode) {
          setCache({ inputVal: val });
          forceUpdate();
        }
      }}
      onFocus={() => {
        if (reSearch && attrCode) {
          fetchValues();
        }
      }}
      onBlur={() => {
        if (noSearchRes) {
          setCache({ reSearch: true });
          forceUpdate();
        }
      }}
      onChange={(val, oldVal) => {
        const _resVals = onChange ? onChange(val, oldVal) : val;
        const resVals = multiple
          ? (_resVals || []).filter((f) => String(f).trim())
          : String(_resVals || '').trim()
          ? _resVals
          : undefined;
        if (multiple) {
          const getValData = (alls) => {
            const attrValLov = (resVals || []).map((m, ind) => {
              const find = alls.find((f) => f.attrValueId === m);
              const resAttr = find || { attrValueId: m, attrValueName: m };
              return { ...resAttr, valueOrderSeq: ind + 1 };
            });
            record.set(mappingKey, attrValLov);
          };
          getValData(endOpts);
        } else {
          const getValData = (alls) => {
            const find = alls.find((f) => f.attrValueId === resVals);
            record.set(mappingKey, find || { attrValueId: resVals, attrValueName: resVals });
          };
          getValData(endOpts);
        }
        record.set(props.name, resVals);
        setCache({ reSearch: true });
        forceUpdate();
      }}
    />
  );
}
