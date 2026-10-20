import React, { useEffect, useState } from 'react';
import { Lov } from 'choerodon-ui/pro';

import { CheckedStrategy } from 'choerodon-ui/pro/lib/data-set/enum';
import { TriggerViewMode } from 'choerodon-ui/pro/lib/trigger-field/enum';
import { isEmpty, uniqBy } from 'lodash';
import { SRM_HPFM } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import ViewRender, { ROOT } from './ViewRender';
import { lovQueryAxiosConfig } from '../../utils/c7nUiConfig';
import styles from './index.less';

// tree 默认展示规则
export const CommonTreeProps = {
  selectable: false,
  checkable: true,
  showLine: {
    showLeafIcon: false,
  },
  multiple: true,
  defaultExpandAll: false,
};

const LovViewRenderer = props => {
  const {
    dataSet: lovDataSet, // must be
    name, // must be
    disabledKeys = [],
    multiple = true,
    treeData = [],
    // searchParam = 'nameOrCode',
    // treeProps = {},
    ...otherProps
  } = props;

  const [options, setOptions] = useState<any>([]);

  useEffect(() => {
    const field = lovDataSet.getField(name);
    const oldOptionsProps = field.get('optionsProps');
    const oldMultiple = field.get('multiple');
    const lovQueryAxios = field.get('lovQueryAxiosConfig');
    const textField = field.get('textField');
    const valueField = field.get('valueField');
    field.set('optionsProps', props => {
      const isSTARBUCKS = getCurrentTenant().tenantNum === 'SRM-STARBUCKS';
      return {
        ...props,
        // ...oldOptionsProps,
        primaryKey: '__id',
        idField: '__id',
        cacheModified: true,
        cacheSelection: true,
        // data: treeData,
        fields: [
          ...(props?.fields ?? []),
          {
            name: '__id',
            transformResponse: (_, object: any) => {
              return object.type === 'E' ? `${object.id}-${object.parentId}` : object.id;
            },
          },
          {
            name: textField,
            transformResponse: (_, object: any) => {
              return isSTARBUCKS || object.type !== 'E' ? object[textField] : `${object[textField]}(${object[valueField]})`;
            },
          }
        ],
        transport: {
          read: !treeData.length && props.transport.read,
        },
        events: {
          beforeLoad: ({ data, dataSet }) => {
            if (dataSet.getState('isSelect')) {
              setOptions(uniqBy(data, 'id'));
            }
          },
        },
      };
    });
    field.set('multiple', true);
    field.set('lovQueryAxiosConfig', (code, config, data) => {
      const lovConfig = lovQueryAxiosConfig(code);
      const url = `${SRM_HPFM}/v1/${getCurrentOrganizationId()}/hr/contact/employee-tree?lovCode=${code}`;
      let params = '';
      if (data.data) {
        params = data.data[config.textField];
      }

      data.dataSet.setState({
        isSelect: !isEmpty(params),
      });

      return {
        ...lovConfig,
        url: isEmpty(params) ? url : `${url}&enabledShowUnit=false&nameOrCode=${params}`,
      };
    });

    return () => {
      field.set('optionsProps', oldOptionsProps);
      field.set('multiple', oldMultiple);
      field.set('lovQueryAxiosConfig', lovQueryAxios);
    };
  }, []);

  const afterClose = () => {
    if (!lovDataSet.current) {
      return;
    }
    const field = lovDataSet.getField(name);
    const valueField = field.get('valueField');
    const value = lovDataSet.current.get(name);
    // 提交时过滤掉虚拟节点
    lovDataSet.current.set(name, value && value.length ? value.filter(i => i[valueField] !== ROOT) : value);
  };

  return (
    <Lov
      {...otherProps}
      dataSet={lovDataSet}
      name={name}
      viewMode={TriggerViewMode.drawer}
      showCheckedStrategy={CheckedStrategy.SHOW_CHILD}
      noCache
      viewRenderer={info => (
        <ViewRender
          {...info}
          disabledKeys={disabledKeys}
          multiple={multiple}
          treeData={treeData}
          lovPara={{ ...lovDataSet.getField(name).get('lovPara', lovDataSet.current) }}
        />
      )}
      modalProps={{
        afterClose,
        className: styles['contact-lov-modal'],
      }}
      optionsFilter={
        (record) => {
          const value = record.get('__id');
          return !!(options.find(item => (`${item.id}-${item.parentId}` === value)));
        }
      }
    />
  );
};

export default LovViewRenderer;
