import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react';
import { useDataSet, Button } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { releasePriceModel, unlockPriceModel } from '@/services/priceModelService';
import { lineDS } from './lineDs';
import style from './index.less';

const PriceModel = (props) => {
  const lineDs = useDataSet(() => lineDS(), []);

  // 详情
  const handlePriceModelDetail = (record) => {
    const { modelStatus, modelId } = record.get(['modelId', 'modelStatus']);
    if (modelStatus === 'NEW') {
      props.history.push({
        pathname: `/spc/price-model/update/${modelId}`,
      });
    } else if (modelStatus === 'RELEASED') {
      props.history.push({
        pathname: `/spc/price-model/detail/${modelId}`,
      });
    }
  };

  // 保存
  const handleSave = async (record) => {
    // 设置当前行为选中状态
    if (await record?.validate()) {
      lineDs.select(record);
    } else {
      lineDs.unSelect(record);
    }
    // 提交当前选中行
    lineDs.submit();
  };

  // 发布
  const handleRelease = (record) => {
    const data = record.toData();
    return releasePriceModel(data).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        lineDs.query();
      }
    });
  };

  // 解锁
  const handleUnlock = (record) => {
    const data = record.toData();
    return unlockPriceModel(data).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        lineDs.query();
      }
    });
  };

  // 新增
  const handleAdd = useCallback(() => {
    const record = lineDs.create({}, 0);
    record.setState('editing', true);
  }, [lineDs]);

  // 编辑
  const handleEdit = (record) => {
    record.setState('editing', true);
  };

  // 删除
  const handleDelete = (record) => {
    lineDs.delete(record, {
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？'),
    });
  };

  // 取消编辑
  const handleReset = (record) => {
    record.reset();
    record.setState('editing', false);
  };

  // 新建取消
  const handleCancel = (record) => {
    lineDs.remove(record);
  };

  // 渲染模型状态
  const renderModelStatus = useCallback((value, text) => {
    let meaning;
    switch (value) {
      case 'NEW':
        meaning = <span className={style['tag-orange']}>{text}</span>;
        break;
      case 'RELEASED':
        meaning = <span className={style['tag-green']}>{text}</span>;
        break;
      default:
        break;
    }
    return meaning;
  }, []);

  const columns = useMemo(() => {
    return [
      {
        name: 'modelStatus',
        width: 100,
        renderer: ({ value, text }) => renderModelStatus(value, text),
      },
      {
        name: 'modelCode',
        width: 150,
        editor: (record) => record.status === 'add',
      },
      {
        name: 'modelName',
        width: 200,
        editor: (record) => record.getState('editing'),
      },
      {
        name: 'modelRemark',
        width: 250,
        editor: (record) => record.getState('editing'),
      },
      {
        name: 'createdByMeaning',
        width: 120,
      },
      {
        header: intl.get(`spc.priceModel.model.priceModel.detail`).d('明细'),
        width: 80,
        renderer: ({ record }) =>
          record.get('objectVersionNumber') && (
            <a onClick={() => handlePriceModelDetail(record)}>
              {intl.get(`spc.priceModel.model.priceModel.detail`).d('明细')}
            </a>
          ),
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        renderer: ({ record }) => (
          <span className="action-link">
            {!record.getState('editing') && record.get('modelStatus') === 'NEW' && (
              <>
                <Button funcType="link" onClick={() => handleEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </Button>
                <Button funcType="link" onClick={() => handleRelease(record)}>
                  {intl.get('hzero.common.button.release').d('发布')}
                </Button>
                <Button funcType="link" onClick={() => handleDelete(record)}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              </>
            )}
            {record.getState('editing') && record.get('objectVersionNumber') && (
              <Button funcType="link" onClick={() => handleReset(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            )}
            {record.get('modelStatus') === 'RELEASED' && (
              <Button funcType="link" onClick={() => handleUnlock(record)}>
                {intl.get(`spc.priceModel.view.button.unlock`).d('解锁')}
              </Button>
            )}
            {record.status === 'add' && (
              <Button funcType="link" onClick={() => handleCancel(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            )}
            {record.getState('editing') && (
              <Button funcType="link" onClick={() => handleSave(record)}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            )}
          </span>
        ),
      },
    ];
  }, []);

  return (
    <>
      <Header
        title={intl
          .get('spc.priceModel.view.message.title.priceModelWorkPlace')
          .d('价格模型工作台')}
      >
        <Button color="primary" icon="add" onClick={handleAdd}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <SearchBarTable
          selectionMode="none"
          autoHeight={{ type: 'maxHeight', diff: 0 }}
          searchCode="SPC.PRICE_MODEL.LIST.FILTER"
          dataSet={lineDs}
          columns={columns}
          customizable
          customizedCode="SRC.PRICE_MODEL.LIST"
        />
      </Content>
    </>
  );
};
export default formatterCollections({ code: ['spc.priceModel', 'hzero.common', 'ssrc.common'] })(
  observer(PriceModel)
);
