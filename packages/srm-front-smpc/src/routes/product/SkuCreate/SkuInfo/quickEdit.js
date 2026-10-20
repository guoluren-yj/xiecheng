import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import classNames from 'classnames';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { TopSection, SecondSection } from '_components/Section';

import OverflowTip from '@/routes/components/OverflowTip';
import customStore from '../customStore';
import { sortByOrderSeq } from '../reverseAttrField';
import { getCustFieldRequired } from './funcs';
import styles from './quickEdit.less';

const getQuickList = ({ isEdit, giftCheckFlag }) => {
  const isReceive = customStore.getState('isReceive');
  const fields = [
    {
      name: 'skuImageList',
      title: intl.get('smpc.product.model.editImg').d('编辑图片'),
      label: intl.get('smpc.product.model.imageInfo').d('图片信息'),
    },
    {
      name: 'introduction',
      title: intl.get('smpc.product.model.editIntro').d('编辑介绍'),
      label: intl.get('smpc.product.model.productIntro').d('商品介绍'),
      tabChangeSave: true,
    },
    {
      name: 'skuAttrList',
      dirtyNames: ['brand', 'model', 'packingList'],
      title: intl.get('smpc.product.view.editAttr').d('编辑属性'),
      label: intl.get('smpc.product.view.productAttr').d('商品属性'),
    },
    {
      name: 'priceInfo',
      title: isEdit
        ? intl.get('smpc.product.view.editPriceInfo').d('编辑价格信息')
        : intl.get('smpc.product.view.viewPriceInfo').d('查看价格信息'),
      label: intl.get('smpc.product.model.priceInfo').d('价格信息'),
    },
    {
      name: 'skuStockList',
      title: isEdit
        ? intl.get('smpc.product.view.editStockInfo').d('编辑库存信息')
        : intl.get('smpc.product.view.viewStockInfo').d('查看库存信息'),
      label: intl.get('smpc.product.model.stockInfo').d('库存信息'),
      show: isReceive,
    },
    {
      name: 'itemInfo',
      dirtyNames: ['itemLov', 'itemCategoryLov'],
      title: intl.get('smpc.product.view.editItemInfo').d('物料信息'),
      label: intl.get('smpc.product.model.itemInfo').d('物料信息'),
    },
    {
      name: 'labels',
      title: intl.get('smpc.product.view.editLabel').d('编辑标签'),
      label: intl.get('smpc.product.view.skuLabel').d('商品标签'),
    },
    {
      name: 'afterSale',
      title: intl.get('smpc.product.view.editAfs').d('编辑售后'),
      label: intl.get('smpc.product.view.afterSaleServices').d('售后服务'),
      // show: !isReceive,
    },
    {
      name: 'giveRules',
      title: intl.get('smpc.product.model.editGiveRules').d('编辑赠品规则'),
      label: intl.get('smpc.product.model.giveRules').d('赠品规则'),
      show: giftCheckFlag,
    },
    {
      name: 'thirdInfo',
      title: intl.get('smpc.product.view.thirdInfo').d('第三方信息'),
      show: !isReceive,
    },
  ];
  // return fields.map(m => {
  //   const { name } = m;
  //   const otherProps = config[name] || {};
  //   return { ...m, ...otherProps };
  // });
  return fields.filter((f) => f.show !== false);
};

const QuickNavLi = observer((props) => {
  const { text, dirty, required, requiredDataSet } = props;

  let fieldRequired = required;

  if (requiredDataSet && !fieldRequired) {
    fieldRequired = fieldRequired || getCustFieldRequired({ dataSet: requiredDataSet, hole: true });
  }

  return (
    <OverflowTip
      title={text}
      className={classNames({
        'quick-nav-inner': true,
        'field-dirty': dirty,
        'field-required': fieldRequired,
      })}
    >
      {text}
    </OverflowTip>
  );
});

const EditSku = observer((props) => {
  const { name, record, quickList = [], config = {}, modal } = props;
  const [current, setCurrent] = useState(name); // 记录当前导航页
  const [quickNavNames, setQuickNavNames] = useState(() => {
    return quickList.map((m) => m.name);
  }); // 记录可以显示的排序好的导航栏
  const { getHocInstance } = customStore.getCustFuncs();
  const { title, tabChangeSave = false } = quickList.find((f) => f.name === current) || {};
  const { children, readOnly, width = 400, bodyStyle = {}, onOk = (e) => e } =
    config[current] || {};
  const isLast = quickNavNames[quickNavNames.length - 1] === current;

  useEffect(() => {
    const quickCustConfig = customStore.getCustConfig('QUICK_EDIT');
    if (quickCustConfig && quickCustConfig.fields) {
      const custConfigVisibleFields = [];
      const defineQuickNavNames = [...quickNavNames];
      quickCustConfig.fields.forEach((f) => {
        // 拿到个性化中未隐藏的字段
        if (f.visible !== 0) {
          custConfigVisibleFields.push(f);
        }
        // 删除代码中被个性化配置了隐藏的字段
        const findDefinedQuickIndex = defineQuickNavNames.findIndex(
          (navName) => navName === f.fieldCode
        );
        if (f.visible === 0 && findDefinedQuickIndex > -1) {
          defineQuickNavNames.splice(findDefinedQuickIndex, 1);
        }
      });
      // 对个性化显示字段进行排序
      sortByOrderSeq(custConfigVisibleFields, 'seq');
      const sortQuickNavNames = custConfigVisibleFields.map((f) => f.fieldCode);
      // 拿到最终的导航栏目
      const newQuickNavNames = [...new Set([...sortQuickNavNames, ...defineQuickNavNames])];
      setQuickNavNames(newQuickNavNames);
      if (!newQuickNavNames.includes(current)) {
        setCurrent(newQuickNavNames[0]);
      }
    }
  }, []);

  useEffect(() => {
    modal.update({
      style: { width: width + 150 },
    });
  }, [width]);

  async function handleSave() {
    const flag = await onOk();
    if (flag !== false) {
      modal.close();
    }
  }

  async function handleSaveAndNext() {
    const flag = await onOk();
    if (flag !== false) {
      const currentIndex = quickNavNames.findIndex((f) => f === current);
      if (currentIndex !== -1) {
        const nextNav = quickNavNames[currentIndex + 1];
        setCurrent(nextNav);
      }
    }
  }

  async function handleTabChange(tab) {
    if (tabChangeSave) {
      const flag = await onOk();
      if (flag !== false) {
        setCurrent(tab.name);
      }
    } else {
      setCurrent(tab.name);
    }
  }

  return (
    <div className={styles['quick-edit-container']}>
      <div className="quick-edit-content" style={{ width }}>
        <div className="quick-content-title">{title}</div>
        <div className="quick-content-body" style={bodyStyle}>
          {children}
        </div>
        <div className="quick-content-footer" style={{ width }}>
          <Button color="primary" disabled={readOnly || isLast} onClick={handleSaveAndNext}>
            {intl.get('smpc.product.button.saveAndNext').d('保存并下一条')}
          </Button>
          <Button disabled={readOnly} onClick={handleSave}>
            {intl.get('smpc.product.button.saveAndClose').d('保存并关闭')}
          </Button>
          <Button onClick={() => modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </div>
      <div className="quick-edit-nav">
        <OverflowTip className="quick-nav-title">
          {intl.get('smpc.product.view.title.quickEdit').d('快速编辑')}
        </OverflowTip>
        <TopSection
          className="quick-nav-body"
          getHocInstance={getHocInstance}
          code={customStore.getCustomCode('QUICK_EDIT')}
        >
          {quickNavNames.map((navName) => {
            const nav = quickList.find((f) => f.name === navName);
            if (!nav) return;
            const { label, dirtyNames = [], title: modelTitle } = nav;
            const { required, requiredDataSet } = config[navName] || {};
            const field = record.getField(navName) || {};
            const bindDirty = dirtyNames.some((s) => {
              const bindField = record.getField(s) || {};
              return bindField.dirty;
            });
            const text = label || modelTitle;
            return (
              <SecondSection key={navName} code={navName}>
                <div
                  className={classNames({ 'quick-nav-li': true, active: navName === current })}
                  onClick={() => handleTabChange(nav)}
                >
                  <QuickNavLi
                    text={text}
                    dirty={field.dirty || bindDirty}
                    required={required}
                    requiredDataSet={requiredDataSet}
                  />
                </div>
              </SecondSection>
            );
          })}
        </TopSection>
      </div>
    </div>
  );
});

export default function quickEditSku({ name, record, dataSet, isEdit, config, giftCheckFlag }) {
  const quickList = getQuickList({ record, dataSet, isEdit, giftCheckFlag });
  return Modal.open({
    mask: true,
    drawer: true,
    footer: null,
    movable: false,
    closable: false,
    maskClosable: false,
    destroyOnClose: true,
    bodyStyle: { padding: 0 },
    children: <EditSku name={name} record={record} config={config} quickList={quickList} />,
  });
}
