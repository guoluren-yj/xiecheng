import React, { useMemo, useState, useEffect } from 'react';
import { Steps } from 'choerodon-ui';
import { Table, Button, DataSet } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import HotWorSet from '../HotWorSet';
import { hotWordChooseDS, hotWordSetDS } from './ds';
import { saveHotMapping } from '../api';
import styles from './index.less';

const { Step } = Steps;
const getSteps = () => [
  {
    title: intl.get('smpc.hotWordMapping.view.chooseHotWord').d('选择用户搜索热词'),
    tabIndex: 0,
  },
  {
    title: intl.get('smpc.hotWordMapping.view.setCategory').d('设置平台分类'),
    showTab: 'CATEGORY',
    tabIndex: 1,
  },
  {
    title: intl.get('smpc.hotWordMapping.view.setCatalog').d('设置商城目录'),
    showTab: 'CATALOG',
    tabIndex: 1,
  },
];

const HotWordChoose = ({ dataSet }) => {
  const columns = useMemo(
    () => [
      {
        name: 'hotWord',
      },
      {
        name: 'count',
      },
    ],
    []
  );
  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      customizedCode="hot-word-choose"
      style={{ maxHeight: 'calc(100vh - 196px)' }}
    />
  );
};

export default function StepNew({ tabKey, modal, query = () => null }) {
  const isCategory = tabKey === 'CATEGORY';
  const hotWordChooseDs = useMemo(() => new DataSet(hotWordChooseDS()), []);
  const hotWordSetDs = useMemo(() => new DataSet(hotWordSetDS(tabKey)), []);
  const [currentTab, setCurrentTab] = useState(0);
  const _steps = getSteps().filter((f) => !('showTab' in f) || f.showTab === tabKey);
  useEffect(() => {
    modal.update({
      footer: (
        <>
          {currentTab === _steps.length - 1 && (
            <Button color="primary" onClick={handleSave}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          )}
          {currentTab < _steps.length - 1 && (
            <Observer>
              {() => (
                <Button
                  color="primary"
                  disabled={hotWordChooseDs.selected.length < 1}
                  onClick={handleNext}
                >
                  {intl.get('smpc.product.button.nextStep').d('下一步')}
                </Button>
              )}
            </Observer>
          )}
          {currentTab !== 0 && currentTab <= _steps.length - 1 && (
            <Button onClick={() => setCurrentTab((pre) => pre - 1)}>
              {intl.get('smpc.product.button.preStep').d('上一步')}
            </Button>
          )}
          <Button onClick={() => modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      ),
    });
  }, [currentTab]);

  function handleNext() {
    const hotSelectData = hotWordChooseDs.selected;
    const setIds = hotWordSetDs.map((m) => m.get('customId'));
    const choseIds = hotWordChooseDs.selected.map((m) => m.get('customId'));
    setCurrentTab((pre) => pre + 1);
    hotWordSetDs.forEach((r) => {
      // 取消引用
      if (!choseIds.includes(r.get('customId'))) {
        hotWordSetDs.remove(r);
      }
    });
    hotSelectData.forEach((r) => {
      if (!setIds.includes(r.get('customId'))) {
        // 防止重复新建
        hotWordSetDs.create({ hotWord: r.get('hotWord'), customId: r.get('customId') });
      }
    });
  }

  async function handleSave() {
    const flag = await hotWordSetDs.validate();
    if (!flag) return false;
    const data = hotWordSetDs.toJSONData();
    const res = getResponse(
      await saveHotMapping(
        data.map((m) => ({
          ...m,
          tenantId: getCurrentOrganizationId(),
          mappingType: tabKey, // 不要随便改tabKey
          creationType: m.creationType || 'quote',
          dataId: isCategory ? m?.categoryId : m?.catalogId,
        }))
      )
    );
    if (res) {
      notification.success();
      query();
      modal.close();
    }
  }

  const stepContents = useMemo(
    () => [
      {
        step: 0,
        comp: HotWordChoose,
        props: {
          dataSet: hotWordChooseDs,
        },
      },
      {
        step: 1,
        comp: HotWorSet,
        props: {
          tabKey,
          dataSet: hotWordSetDs,
          batchOk: (batchData) => {
            // console.log('batchData', batchData)
            const isAll = hotWordSetDs.selected.length === 0;
            const fieldName = isCategory ? 'categoryLov' : 'catalogLov';
            if (isAll) {
              hotWordSetDs.forEach((r) => {
                r.set(fieldName, batchData);
              });
            } else {
              hotWordSetDs.selected.forEach((r) => {
                r.set(fieldName, batchData);
              });
            }
          },
        },
      },
    ],
    []
  );

  return (
    <>
      <Steps size="small" current={currentTab} className={styles['hot-step']}>
        {_steps.map((step) => (
          <Step title={step.title} />
        ))}
      </Steps>
      {stepContents
        .filter((s) => s.step === currentTab)
        .map((m) => (
          <m.comp {...m.props} />
        ))}
    </>
  );
}
