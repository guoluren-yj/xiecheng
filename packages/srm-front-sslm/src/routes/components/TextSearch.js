/**
 * TextSearch.js - 文本搜索组件
 * @date: 2022-03-14
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Dropdown, Menu, TextField, IntlField } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import { getResponse } from 'utils/utils';

import { fetchOrgSimilarCompanyName } from '@/services/commonService';

// textSearchFlag 是否启用模糊匹配
const TextSearch = ({
  dataSet,
  name,
  textSearchFlag = false,
  enableIntl = false,
  searchLength = 0,
  legalRepName, // 法人
  unifiedSocialCode, // 统一社会信用代码
}) => {
  const textRef = useRef(null);

  const [menu, setMenu] = useState(null);

  const ComponentType = useMemo(() => (enableIntl ? IntlField : TextField), [enableIntl]);

  let inputChineseFlag = false;

  useEffect(() => {
    if (textRef.current) {
      textRef.current.element.addEventListener('compositionstart', hanldeOnCompositionStart);
      textRef.current.element.addEventListener('compositionend', hanldeOnCompositionEnd);
    }
    return () => {
      if (textRef.current) {
        textRef.current.element.removeEventListener('compositionstart', hanldeOnCompositionStart);
        textRef.current.element.removeEventListener('compositionend', hanldeOnCompositionEnd);
      }
    };
  }, []);

  const handleOnInput = useCallback(e => {
    const { value } = e.target;
    if (!inputChineseFlag) {
      handleRederMenu(value);
    }
  }, []);

  const hanldeOnCompositionStart = useCallback(() => {
    inputChineseFlag = true;
  }, []);

  const hanldeOnCompositionEnd = useCallback(e => {
    const { value } = e.target;
    inputChineseFlag = false;
    handleRederMenu(value);
  }, []);

  const handleRederMenu = useCallback(
    value => {
      let dom = null;
      if (value && value.length >= searchLength) {
        fetchOrgSimilarCompanyName({
          [name]: value,
        }).then(res => {
          if (getResponse(res)) {
            dom = (
              <Menu style={{ minWidth: 260 }} onClick={handleMenuClick}>
                {res.map(item => {
                  const { Name } = item;
                  return (
                    <Menu.Item key={uuid()} value={Name || item.name} data={item}>
                      {Name || item.name}
                    </Menu.Item>
                  );
                })}
              </Menu>
            );
          } else {
            // 重置上一次dom
            dom = null;
          }
          setMenu(dom);
        });
      } else {
        setMenu(dom);
      }
    },
    [name, searchLength]
  );

  const handleMenuClick = useCallback(
    event => {
      const { value, data } = event.item.props;
      if (textRef.current) {
        textRef.current.blur();
      }
      dataSet.current.set({
        [name]: value,
      });
      if (legalRepName) {
        dataSet.current.set(legalRepName, data.operName);
      }
      if (unifiedSocialCode) {
        dataSet.current.set(unifiedSocialCode, data.creditCode);
      }
    },
    [legalRepName, unifiedSocialCode]
  );

  return textSearchFlag ? (
    <Dropdown overlay={menu} placement="bottomLeft" trigger={['hover']}>
      <ComponentType name={name} onInput={handleOnInput} ref={textRef} style={{ width: '100%' }} />
    </Dropdown>
  ) : (
    <ComponentType name={name} style={{ width: '100%' }} />
  );
};

export default TextSearch;
