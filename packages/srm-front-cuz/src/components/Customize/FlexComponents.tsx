/**
 * 个性化组件
 * @date: 2019-12-15
 * @version: 0.0.1
 * @author: zhaotong <tong.zhao@hand-china.com>
 * @copyright Copyright (c) 2019, Hands
 */

import React, { useEffect, useState } from 'react';
import { isString, isNil, isArray } from 'lodash';
import { Icon, Select, DatePicker, Checkbox, Switch, Radio } from 'hzero-ui';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import Lov from 'srm-front-boot/lib/components/LovSrm';
import { getCurrentOrganizationId, getUserOrganizationId } from 'hzero-front/lib/utils/utils';
import { queryUnifyIdpValue } from 'services/api';
import { Modal } from 'choerodon-ui/pro';
// @ts-ignore
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
// Option组件初始化
const { Option } = Select;

export class FlexSelect extends React.Component<any> {
  cacheKey: string = 'default';

  state: {
    options: string | any[];
    loading: boolean;
  } = {
      options: 'loading',
      loading: false,
    };

  constructor(props) {
    super(props);
    if (!(window as any).CUSTOMIZECACHE) {
      (window as any).CUSTOMIZECACHE = {};
    }
  }

  componentDidMount() {
    const { lovCode, params } = this.props;
    const updateTriggers = [lovCode].concat(Object.keys(params), Object.values(params)).join(',');
    this.cacheKey = updateTriggers;
    this.setOptions();
  }

  componentDidUpdate(prevProps) {
    const { lovCode: lovCode1, params: params1 } = prevProps;
    const { lovCode, params } = this.props;
    const updateTriggers = [lovCode].concat(Object.keys(params), Object.values(params)).join(',');
    const oldUpdateTriggers = [lovCode1]
      .concat(Object.keys(params1), Object.values(params1))
      .join(',');
    if (updateTriggers !== oldUpdateTriggers) {
      this.cacheKey = updateTriggers;
      this.setOptions();
    }
  }

  setOptions = () => {
    const { lovCode, params } = this.props;
    if (!lovCode) return;
    const cache = (window as any).CUSTOMIZECACHE;
    const cacheOptions = lovCode && (cache[lovCode] || {})[this.cacheKey];
    if (!cacheOptions) {
      this.setState({ loading: true });
      if (!(window as any).CUSTOMIZECACHE[lovCode]) {
        (window as any).CUSTOMIZECACHE[lovCode] = {};
      }
      (window as any).CUSTOMIZECACHE[lovCode][this.cacheKey] = new Promise((r, rej) => {
        queryUnifyIdpValue(lovCode, params)
          .then(
            (res = []) => {
              const options = (!res.failed && res) || [];
              this.setState({ options });
              r(options);
            },
            () => {
              rej();
            }
          )
          .catch(() => {
            rej();
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      });
    } else if (cacheOptions instanceof Promise) {
      cacheOptions.then((options) => {
        this.setState({ options });
      });
    }
  };

  onChange = (v) => {
    const { multipleFlag, onChange: oldOnChange } = this.props;
    let value = v;
    if (multipleFlag && isArray(v)) {
      value = v.length > 0 ? v.join(',') : undefined;
    }
    // eslint-disable-next-line no-unused-expressions
    typeof oldOnChange === 'function' && oldOnChange(value);
  };

  render() {
    const { options: _o, loading } = this.state;
    const options = isArray(_o) || isString(_o) ? _o : [];
    const { multipleFlag, fieldCode, ...contentProps } = this.props;
    const { value, defaultValue } = contentProps;
    const multipleConfig =
      multipleFlag
        ? {
          mode: 'multiple',
          defaultValue: isNil(defaultValue) || defaultValue === '' ? [] : defaultValue.split(','),
          value: typeof value === 'string' && value !== '' ? value.split(',') : undefined,
        }
        : undefined;
    return (
      <Select
        allowClear
        {...contentProps}
        {...multipleConfig}
        style={{ width: '100%' }}
        onChange={this.onChange}
      >
        {loading || isString(options) ? (
          <Option key="loading">
            <Icon type="loading" />
          </Option>
        ) : (
          (options as any[]).map((n: any) => <Option value={String(n.value)}>{n.meaning}</Option>)
        )}
      </Select>
    );
  }
}

export function FlexSelect1({
  lovCode,
  params = {},
  form,
  multipleFlag,
  fieldCode,
  onChange: oldOnChange,
  ...contentProps
}) {
  const cache = (window as any).CUSTOMIZECACHE || {};
  const cacheOptions = lovCode && cache[lovCode];
  const [selectOptionsDataSource, setSelectOptionsDataSource] = useState(cacheOptions || []);
  const [loading, setLoading] = useState(false);
  const updateTriggers = [lovCode].concat(Object.keys(params), Object.values(params)).join(',');
  useEffect(() => {
    if (!cacheOptions) {
      setLoading(true);
      if (!(window as any).CUSTOMIZECACHE) {
        (window as any).CUSTOMIZECACHE = {};
      }
      (window as any).CUSTOMIZECACHE[lovCode] = 'loading';
      queryUnifyIdpValue(lovCode, params)
        .then((res = []) => {
          const options = (!res.failed && res) || [];
          setSelectOptionsDataSource(options);
          (window as any).CUSTOMIZECACHE[lovCode] = options;
        })
        // eslint-disable-next-line no-return-assign
        .catch(() => ((window as any).CUSTOMIZECACHE[lovCode] = false))
        .finally(() => {
          setLoading(false);
        });
    } else if (cacheOptions !== 'loading') {
      setSelectOptionsDataSource(cacheOptions);
    }
  }, [updateTriggers, cacheOptions]);
  const onChange = (v) => {
    let value = v;
    if (multipleFlag && isArray(v)) {
      value = v.length > 0 ? v.join(',') : undefined;
    }
    // eslint-disable-next-line no-unused-expressions
    typeof oldOnChange === 'function' && oldOnChange(value);
  };
  const { value, defaultValue } = contentProps;
  const multipleConfig =
    multipleFlag === 1
      ? {
        mode: 'multiple',
        defaultValue: isNil(defaultValue) || defaultValue === '' ? [] : defaultValue.split(','),
        value: typeof value === 'string' && value !== '' ? value.split(',') : undefined,
      }
      : undefined;
  return (
    <Select
      allowClear
      {...contentProps}
      {...multipleConfig}
      style={{ width: '100%' }}
      onChange={onChange}
    >
      {loading || isString(selectOptionsDataSource) ? (
        <Option key="loading">
          <Icon type="loading" />
        </Option>
      ) : (
        selectOptionsDataSource.map((n: any) => (
          <Option value={String(n.value)}>{n.meaning}</Option>
        ))
      )}
    </Select>
  );
}

export function FlexRadioGroup({ lovCode, lovMappings = [], form, fieldCode, ...contentProps }) {
  const [radioOptionsDataSource, setRadioOptionsDataSource] = useState([]);
  useEffect(() => {
    queryUnifyIdpValue(lovCode).then((res = []) => {
      setRadioOptionsDataSource((res && !res.failed && res.lovCode) || []);
    });
  }, [1]);
  const onChange = (v) => {
    const record = radioOptionsDataSource.find((i: any) => i.value === v.target.value) || {};
    form.setFieldsValue({
      ...lovMappings.reduce(
        (pre, cur: any) => ({ ...pre, [cur.targetCode]: record[cur.sourceCode] }),
        {}
      ),
      [fieldCode]: v,
    });
  };
  return (
    <Radio.Group {...contentProps} style={{ width: '100%' }} onChange={onChange}>
      {radioOptionsDataSource.map((n: any) => (
        <Radio value={n.value}>{n.meaning}</Radio>
      ))}
    </Radio.Group>
  );
}

// extraProps
export function FlexLov({
  form,
  fieldName,
  textValue,
  textField,
  lovMappings = [],
  onChange,
  ...rest
}) {
  const innerOnChange = (_, record, ...args) => {
    // eslint-disable-next-line no-unused-expressions
    typeof onChange === 'function' && onChange(_, record, ...args);
    if (lovMappings.length > 0) {
      form.setFieldsValue({
        ...lovMappings.reduce(
          (pre, cur: any) => ({ ...pre, [cur.targetCode]: record[cur.sourceCode] }),
          {}
        ),
      });
    }
  };
  return (
    <Lov form={form} onChange={innerOnChange} code={rest.lovCode} textValue={textValue} {...rest} />
  );
}

export function FlexDatePicker(options) {
  return <DatePicker format={DEFAULT_DATE_FORMAT} {...options} />;
}

export function FlexCheckbox(options) {
  return <Checkbox checkedValue={1} unCheckedValue={0} {...options} />;
}

export function FlexSwitch(options) {
  return <Switch checkedValue={1} unCheckedValue={0} {...options} />;
}

export function FlexLink(props) {
  const {
    linkTitle,
    linkHref,
    linkNewWindow,
    linkType = 'none',
    modalWidth,
    disabled,
    ...extra
  } = props;

  const { form, dataSource } = extra;
  let newHref = linkHref || '';
  let newTitle = linkTitle || '';
  const mappings = newHref.match(/{([^{}]*)}/g);
  const titleMappings = newTitle.match(/{([^{}]*)}/g);
  let values = {};
  if (mappings || titleMappings) {
    values = { ...dataSource, ...(form && form.getFieldsValue()) };
  }
  if (mappings) {
    newHref = replace(mappings, values, newHref);
  }
  if (titleMappings) {
    newTitle = replace(titleMappings, values, newTitle);
  }
  const linkProps: any = {
    disabled,
    rel: 'noopener noreferrer',
    // eslint-disable-next-line no-script-url
    href: 'javascript:void(0)',
    style: {
      wordBreak: 'break-word',
    },
  };
  if (linkType === 'drawer' || linkType === 'modal') {
    linkProps.onClick = function () {
      const modal = Modal.open({
        closable: true,
        movable: false,
        drawer: linkType === 'drawer',
        key: Modal.key(),
        style: { width: modalWidth },
        footer: null,
        children: <EmbedPage href={newHref} pageData={extra} closeModal={closeModal} />,
      });

      function closeModal() {
        modal.close();
      }
    };
  } else if (linkType === 'inner') {
    linkProps.onClick = function () {
      const [uri, search] = newHref.split('?');
      (window as any).dvaApp._store.dispatch(
        (window as any).routerRedux.push({
          pathname: uri,
          search: `?${search}`,
        })
      );
    };
  } else {
    linkProps.target = linkNewWindow ? '_blank' : '_self';
    linkProps.href = newHref;
  }
  return <a {...linkProps}>{newTitle}</a>;
}

function replace(mappings, values, targetString) {
  let newString = targetString;
  for (let i = 0; i < mappings.length; i++) {
    if (mappings[i] === '{organizationId}' || mappings[i] === '{tenantId}') {
      // eslint-disable-next-line no-continue
      continue;
    }
    const key = mappings[i].match(/{([^{}]*)}/)[1];
    const value = isNil(values[key]) ? '' : values[key];
    newString = newString.replace(`{${key}}`, value);
  }
  newString = newString.replace(/{organizationId}/, getCurrentOrganizationId());
  newString = newString.replace(/{tenantId}/, getUserOrganizationId());
  return newString;
}
