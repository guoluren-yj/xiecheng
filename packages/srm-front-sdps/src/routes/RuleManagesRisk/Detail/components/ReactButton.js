/*
 * ReactButton - 响应表格选中的按钮
 * @date: 2021-12-17
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useState, Fragment } from 'react';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

const viewPrompt = 'sdps.ruleManagesDetail.view'; // 多语言前缀

export const ReactButton = observer((props) => {
  const [loading, handleLoading] = useState(false);
  const { status } = props; // 代表delete/select/save/checkDimension

  return (
    <Fragment>
      {status === 'checkDimension' &&
        props.dataSet.current?.get('service') !==
          props.dataSet.current?.getPristineValue('service') && (
          <Tooltip
            placement="top"
            title={intl
              .get(`${viewPrompt}.modal.notSaveServiceHelp`)
              .d('服务被修改，请先保存再操作维度')}
          >
            <Icon type="info" />
          </Tooltip>
        )}
      <Button
        color={status === 'delete' ? 'red' : status === 'checkDimension' ? undefined : 'primary'}
        loading={loading}
        disabled={
          status === 'save'
            ? !props.dataSet.dirty
            : status === 'checkDimension'
            ? props.dataSet.records &&
              !(
                props.dataSet.current?.get('service') &&
                props.dataSet.current?.get('service') ===
                  props.dataSet.current?.getPristineValue('service') &&
                props.dataSet.current?.get('servicePath')
              )
            : props.dataSet.selected.length === 0
        }
        onClick={() => {
          handleLoading(true);
          props.onClick(handleLoading);
        }}
        icon={
          // eslint-disable-next-line no-prototype-builtins
          props.hasOwnProperty('icon') ? props?.icon : status === 'delete' ? 'delete' : undefined
        }
        funcType={
          // eslint-disable-next-line no-prototype-builtins
          props.hasOwnProperty('funcType')
            ? props?.funcType
            : status === 'delete'
            ? 'flat'
            : 'raised'
        }
      >
        {status === 'select'
          ? intl.get(`${viewPrompt}.button.select`).d('选取')
          : status === 'save'
          ? intl.get(`hzero.common.button.save`).d('保存')
          : status === 'delete'
          ? intl.get('hzero.common.button.delete').d('删除')
          : intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度')}
      </Button>
    </Fragment>
  );
});
