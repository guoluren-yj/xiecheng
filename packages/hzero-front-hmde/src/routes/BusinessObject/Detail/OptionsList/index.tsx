/*
 * @Descripttion: 值列表列表
 * @Date: 2021-08-10 15:59:16
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { operatorRender, enableTagRender } from 'hzero-front/lib/utils/renderer';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { observer } from 'mobx-react-lite';
import { Button, Modal } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';

import { Operators, SourceType } from '@/businessGlobalData/common';
import { disableOption, enableOption } from '@/services/businessObjectService';
import OptionForm from './OptionForm';
import OptionDetail from './OptionDetail';

const createOptionModalKey = Modal.key();
const editOptionModalKey = Modal.key();
const detailOptionModalKey = Modal.key();
const copyOptionModalKey = Modal.key();

const OptionList = props => {
  const {
    match: {
      params: { id: businessObjectId },
    },
    title,
    domainId,
    domainCode,
    sourceType,
    optionsListDs,
    businessObjectCode,
    businessObjectTenantId,
  } = props;

  const disabledFlag = sourceType === SourceType.PREDEFINE; // 系统预置业务对象不能编辑

  const openCreateOptionModal = () => {
    Modal.open({
      key: createOptionModalKey,
      title: intl.get('hmde.bo.option.create').d('新建值列表'),
      style: { width: '380px' },
      closable: true,
      drawer: true,
      border: false,
      autoCenter: true,
      children: (
        <OptionForm
          domainCode={domainCode}
          domainId={domainId}
          businessObjectId={businessObjectId}
          businessObjectCode={businessObjectCode}
          title={title}
          optionsListDs={optionsListDs}
        />
      ),
      okFirst: false,
    });
  };

  const openEditOptionModal = optionId => {
    Modal.open({
      key: editOptionModalKey,
      title: intl.get('hmde.bo.option.edit').d('编辑值列表'),
      style: { width: '380px' },
      closable: true,
      border: false,
      drawer: true,
      children: (
        <OptionForm
          domainId={domainId}
          businessObjectId={businessObjectId}
          businessObjectCode={businessObjectCode}
          optionId={optionId}
          businessObjectTenantId={businessObjectTenantId}
          optionsListDs={optionsListDs}
          editFlag
        />
      ),
      okFirst: false,
    });
  };

  const openOptionDetailModal = optionId => {
    Modal.open({
      key: detailOptionModalKey,
      title: intl.get('hmde.bo.option.read').d('查看值列表'),
      style: { width: '66.5%' },
      closable: true,
      border: false,
      drawer: true,
      children: (
        <OptionDetail
          domainId={domainId}
          sourceType={sourceType}
          businessObjectId={businessObjectId}
          businessObjectCode={businessObjectCode}
          optionId={optionId}
          businessObjectTenantId={businessObjectTenantId}
        />
      ),
      okFirst: false,
    });
  };

  const openCopyOptionModal = optionId => {
    Modal.open({
      key: copyOptionModalKey,
      title: intl.get('hmde.bo.option.copy').d('复制值列表'),
      style: { width: '66.5%' },
      closable: true,
      border: false,
      drawer: true,
      children: (
        <OptionForm
          domainId={domainId}
          businessObjectId={businessObjectId}
          businessObjectCode={businessObjectCode}
          optionId={optionId}
          businessObjectTenantId={businessObjectTenantId}
          optionsListDs={optionsListDs}
          domainCode={domainCode}
          copy
        />
      ),
      okFirst: false,
    });
  };

  const handleEnableOption = async data => {
    const res = await enableOption(data);
    if (getResponse(res)) {
      optionsListDs.query();
    }
  };

  const handleDisableOption = async data => {
    const res = await disableOption(data);
    if (getResponse(res)) {
      optionsListDs.query();
    }
  };

  const lastEnabledItem = (record, operate) => {
    if (
      record.get('enabledFlag') &&
      optionsListDs?.toData()?.filter((item: any) => item?.enabledFlag)?.length === 1
    ) {
      if (operate === 'delete') {
        notification.warning({
          message: intl.get('hmde.bo.option.validation.delete').d('请至少保留一条启用值列表'),
        });
      }
      if (operate === 'disable') {
        notification.warning({
          message: intl.get('hmde.bo.option.validation.disable').d('请至少启用一条值列表'),
        });
      }
      return true;
    }
    return false;
  };

  const columns = useMemo((): ColumnProps[] => {
    return [
      { name: 'enabledFlag', renderer: ({ value }) => enableTagRender(value ? 1 : 0) },
      {
        name: 'businessObjectOptionName',
        tooltip: 'overflow' as any,
        renderer: ({ value, record }) => (
          <a
            style={{ verticalAlign: 'initial' }}
            onClick={() => openOptionDetailModal(record?.get('businessObjectOptionId'))}
          >
            {value}
          </a>
        ),
      },
      { name: 'businessObjectOptionCode' },
      { name: 'displayFieldCode' },
      !isTenantRoleLevel() ? { name: 'tenant' } : { name: 'businessObjectOptionType' },
      { name: 'remark', tooltip: Tooltip.overflow },
      !disabledFlag && {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        align: ColumnAlign.left,
        width: 180,
        renderer: ({ record }) => {
          let operators: Operators = [];
          // FIXME: 值列表类型 “默认” 不一定为default，依据实际情况而定
          if (
            !(isTenantRoleLevel() && record?.get('tenantId') === 0) &&
            record?.get('valuesType') !== 'default'
          ) {
            operators = [
              {
                key: 'delete',
                ele: (
                  <Popconfirm
                    onConfirm={() => {
                      if (lastEnabledItem(record, 'delete')) return;
                      if (record) optionsListDs.delete(record, false);
                    }}
                    placement="top"
                    title="确认删除该值列表吗？"
                  >
                    <a style={{ verticalAlign: 'text-bottom' }}>
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </a>
                  </Popconfirm>
                ),
                len: 2,
                title: intl.get('hzero.common.button.delete').d('删除'),
              },
              {
                key: 'edit',
                ele: (
                  <a
                    style={{ verticalAlign: 'text-bottom' }}
                    onClick={() => openEditOptionModal(record?.get('businessObjectOptionId'))}
                  >
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.edit').d('编辑'),
              },
            ];
            if (record?.get('enabledFlag')) {
              operators.unshift({
                key: 'disable',
                ele: (
                  <a
                    style={{ verticalAlign: 'text-bottom' }}
                    onClick={() => {
                      if (lastEnabledItem(record, 'disable')) return;
                      handleDisableOption(record?.toData());
                    }}
                  >
                    {intl.get('hzero.common.button.disable').d('禁用')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.disable').d('禁用'),
              });
            } else {
              operators.unshift({
                key: 'enable',
                ele: (
                  <a
                    style={{ verticalAlign: 'text-bottom' }}
                    onClick={() => handleEnableOption(record?.toData())}
                  >
                    {intl.get('hzero.common.button.enable').d('启用')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.enable').d('启用'),
              });
            }
          }
          // FIXME: 且必须是标准对象
          if (isTenantRoleLevel() && record?.get('tenantId') === 0) {
            operators.push({
              key: 'copy',
              ele: (
                <a
                  style={{ verticalAlign: 'text-bottom' }}
                  onClick={() => openCopyOptionModal(record?.get('businessObjectOptionId'))}
                >
                  {intl.get('hzero.common.button.copy').d('复制')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.copy').d('复制'),
            });
          }
          return operatorRender(operators, record, { limit: 4, label: intl.get('hzero.common.button.more').d('更多') });
        },
      },
    ].filter(Boolean) as ColumnProps[];
  }, [disabledFlag]);

  return (
    <FilterBarTable
      dataSet={optionsListDs}
      buttons={[
        <Button
          color={ButtonColor.primary}
          onClick={() => openCreateOptionModal()}
          icon="playlist_add"
          disabled={disabledFlag}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>,
      ]}
      columns={columns}
      filterBarConfig={{
        autoQuery: false,
        collpase: true,
        collpaseble: true,
      }}
      customizable
      customizedCode='HMDE.BUSINESS_OBJECT.OPTION_LIST.LIST'
    />
  );
};

export default formatterCollections({ code: ['hzero.common', 'hmde.bo'] })(observer(OptionList));
