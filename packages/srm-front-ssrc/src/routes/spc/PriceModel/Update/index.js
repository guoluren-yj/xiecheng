import React, { useContext, useState, useCallback, Fragment } from 'react';
import { observer } from 'mobx-react';
import { Button, Spin, Icon, useModal } from 'choerodon-ui/pro';

import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { saveUpdate } from '@/services/priceModelService';
import BasicInfo from './CardManage/BasicInfo';
import AppliedRange from './CardManage/AppliedRange';
import BusinessRule from './CardManage/BusinessRule';
import MainParameter from './CardManage/MainParameter/index';
import OtherParameter from './CardManage/OtherParameter';
import CountFormula from './CardManage/CountFormula';
import Card from './components/Card';
import Preview from './components/Preview';
import styles from './common.less';
import Store, { StoreProvider } from './store/index';

const Update = () => {
  const Modal = useModal();
  const {
    commonRef: { countFormulaRef, mainParameterRef },
    commonDs: { headerDs, columnTableDs, otherParameterDs, priceLibTableDs },
    routerParams: { modelId },
  } = useContext(Store);

  const [operateLoading, setOperateLoading] = useState(false);

  // 大查询
  const fetchUpdate = async () => {
    const header = headerDs.query();
    const column = columnTableDs.query();
    const line = mainParameterRef.current?.lineTableDs?.query();
    const otherParam = otherParameterDs.query();
    const priceLib = priceLibTableDs.query();
    const params = countFormulaRef.current?.fetchParamsAll();
    const fetchList = [header, column, line, otherParam, priceLib, params];

    await Promise.all(fetchList);
  };

  // 校验数据(发布返回校验结果)
  const checkPage = () => {
    const headerValidate = headerDs.validate();
    const columnTableValidate = columnTableDs.validate();
    const lineTableValidate = mainParameterRef.current?.lineTableDs?.validate();
    const otherParaValidate = otherParameterDs.validate();
    const priceLibValidate = priceLibTableDs.validate();

    const list = [
      headerValidate,
      columnTableValidate,
      lineTableValidate,
      otherParaValidate,
      priceLibValidate,
    ];

    return Promise.all(list).then((res) => {
      return res?.every((i) => i);
    });
  };

  // 获取保存、发布data
  const getData = () => {
    const data = {
      ...headerDs?.current?.toData?.(),
      priceModelParams: otherParameterDs.toData(),
      priceModelQuoColumns:
        mainParameterRef.current?.activityTabKey === 'column' ? columnTableDs.toData() : [],
      priceModelQuoRows:
        mainParameterRef.current?.activityTabKey === 'line'
          ? mainParameterRef.current?.lineTableDs?.toData().map((item) => {
              const { priceModelQuoRowColumns = [], ...otherItems } = item;
              const newQuotationColumns = priceModelQuoRowColumns.map((i) => {
                const newObj = {
                  ...i,
                  value: otherItems[i.columnId],
                  valueMeaning: otherItems[`${i.columnId}Meaning`],
                };
                // 删除不必要的字段
                delete otherItems[i.columnId];
                delete otherItems[`${i.columnId}Meaning`];
                return newObj;
              });
              return {
                moduleId: mainParameterRef.current?.lineTableDs?.getState('moduleId'),
                ...otherItems,
                modelId,
                priceModelQuoRowColumns: newQuotationColumns,
              };
            })
          : [],
      priceModelPriceLibDims: priceLibTableDs.toData(),
    };
    return data;
  };

  // 保存 校验数据和发布
  const handleSave = async () => {
    setOperateLoading(true);
    const flag = await checkPage();
    if (!flag) {
      notification.warning({
        message: intl
          .get('spc.priceModel.view.priceModel.inputSubmitRfxUpdate')
          .d('提交前请填写完整相关信息'),
      });
      setOperateLoading(false);
      return;
    }
    const data = getData() || {};

    const res = await saveUpdate(data);
    const result = getResponse(res);
    if (result && !result.failed) {
      notification.success();
      await fetchUpdate();
    }
    setOperateLoading(false);
  };

  // 预览
  const handlePreview = useCallback(() => {
    const previewProps = {
      modelId,
    };
    return Modal.open({
      title: intl.get(`spc.priceModel.view.button.preview`).d('预览'),
      destroyOnClose: true,
      children: <Preview {...previewProps} />,
      drawer: true,
      style: {
        width: 1090,
      },
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  }, []);

  return (
    <Fragment>
      <Header
        title={intl.get('spc.priceModel.view.title.modelDefine').d('模型定义')}
        backPath="/spc/price-model/list"
      >
        <Button
          loading={operateLoading}
          dataSet={headerDs}
          onClick={handleSave}
          color="primary"
          icon="save"
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button onClick={handlePreview} funcType="flat" name="preview">
          <Icon style={{ paddingRight: '8px', fontSize: '12px' }} type="find_in_page" />
          {intl.get(`spc.priceModel.view.button.preview`).d('预览')}
        </Button>
      </Header>
      <div className={styles['price-model-wrapper']}>
        <Spin dataSet={headerDs}>
          <Card title={intl.get('spc.priceModel.view.card.title.basicInfos').d('基本信息')}>
            <BasicInfo />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.appliedRange').d('应用范围')}>
            <AppliedRange />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.businessRule').d('业务规则')}>
            <BusinessRule />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.mainParameter').d('主要参数')}>
            <MainParameter />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.otherParameter').d('其他参数')}>
            <OtherParameter />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.countFormula').d('计算公式')}>
            <CountFormula />
          </Card>
        </Spin>
      </div>
    </Fragment>
  );
};

// 所有功能组件都是StoreProvider的子组件 所以context能传递到任何子组件
const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Update {...props} />
    </StoreProvider>
  );
};

export default formatterCollections({ code: ['spc.priceModel', 'ssrc.common'] })(observer(Index));
