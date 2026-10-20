/*
 * @Date: 2024-07-31 17:51:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { createContext, useState, useMemo, useEffect, createRef } from 'react';
import { useDataSet, DataSet, Modal, Form, TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  deleteCard,
  updateRiskInfo,
  updateLabelInfo,
  fetchMemberInfo,
  fetchCompanyInfo,
  updateMemberInfo,
  releaseMemberInfo,
  createSupplementaryInfo,
  checkMemberSupplierPayment,
} from '@/services/memberSupplierService';

import { customCardDS } from './getCustomCardDS';
import { enterpriseCardDS } from './getEnterpriseCardDS';
import { productIntroduceDS } from './getProductIntroduceDS';

export const Store = createContext();

const StoreProvider = props => {
  const {
    dispatch,
    match: { path },
  } = props;
  const isPreview = useMemo(() => path.includes('/member-supplier-expansion-preview'), [path]);
  const [customCard, setCustomCard] = useState([]);
  const enterpriseCardDs = useDataSet(() => enterpriseCardDS(), []);
  const productIntroduceDs = useDataSet(() => productIntroduceDS(), []);
  // 是否付费,-1表示多云环境, 0是未缴费,1是正常缴费
  const [isPay, setIsPay] = useState(null);
  // 是否显示正常页面信息
  const [showDetailFlag, setShowDetailFlag] = useState(false);
  // 是否渲染界面的标识,改善页面替换效果
  const [renderLoading, setRenderLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  // 整个页面总数据源
  const [dataSource, setDataSource] = useState({});
  // 预览时的公司信息
  const [companyData, setCompanyData] = useState({});
  const isEdit = useMemo(() => !isPreview && dataSource.statusCode === 'NEW', [
    dataSource.statusCode,
  ]);
  // 企业标签
  const tagList = useMemo(
    () =>
      dataSource.labelObtainMethod === 'ZHIMA_LABEL'
        ? dataSource.zhimaLabels
        : dataSource.enterpriseLabel
            ?.split(',')
            .filter(Boolean)
            .map(n => ({ labelName: n })),
    [
      isPreview,
      dataSource.enterpriseLabel,
      dataSource.labelObtainMethod,
      JSON.stringify(dataSource.zhimaLabels),
    ]
  );
  // 企业状态
  const enterpriseStatus = useMemo(
    () =>
      [
        {
          value: dataSource.operateStatus,
          meaning: dataSource.operateStatusMeaning,
        },
        {
          value: dataSource.riskLevel,
          meaning: dataSource.riskLevelMeaning,
        },
      ].filter(n => n.value),
    [JSON.stringify(dataSource)]
  );

  const contactRef = createRef(null);

  useEffect(() => {
    handleInit();
  }, [isPreview]);

  // 查询页面数据源
  const handleQuery = async () => {
    await fetchMemberInfo().then(async response => {
      const res = getResponse(response);
      if (res) {
        if (!isEmpty(res)) {
          const { memberMainProductList, memberCustomizeList } = res;
          const customizeList = memberCustomizeList.map(item => ({
            ...item,
            customizeContent: item.customizeContent && JSON.parse(item.customizeContent),
          }));
          productIntroduceDs.loadData(memberMainProductList);
          setCustomCard(customizeList);
          setShowDetailFlag(true);
          setDataSource(res);
          if (isPreview) {
            await handleCompanyInfo(res.companyId);
          }
        }
      }
    });
  };

  // 页面初始化查询
  const handleInit = () => {
    setLoading(true);
    checkMemberSupplierPayment()
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          if (res.paymentEnabledFlag) {
            await handleQuery();
          }
          setIsPay(res.paymentEnabledFlag);
        }
      })
      .finally(() => {
        setLoading(false);
        setRenderLoading(true);
      });
  };

  // 查询预览时的公司信息（登记信息、业务信息）
  const handleCompanyInfo = async companyId => {
    await fetchCompanyInfo({ companyId }).then(response => {
      const res = getResponse(response);
      if (res) {
        setCompanyData(res);
      }
    });
  };

  // 补录按钮回调
  const handleSupplementaryInfo = () => {
    setLoading(true);
    createSupplementaryInfo()
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          await handleQuery();
        }
      })
      .finally(() => setLoading(false));
  };

  // 删除卡片
  const handleDeleteCard = data => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.memberExpansion.modal.customCard.deleteCardMsg')
        .d('确认删除该卡片?'),
      onOk: () => {
        return new Promise(resolve => {
          if (data._status === 'create') {
            const newCustomCard = customCard.filter(
              card => card.memberCustomizeId !== data.memberCustomizeId
            );
            setCustomCard(newCustomCard);
            resolve(true);
          } else {
            setLoading(true);
            deleteCard({
              ...data,
              customizeContent: data.customizeContent && JSON.stringify(data.customizeContent),
            })
              .then(async response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  resolve(true);
                  await handleQuery();
                }
              })
              .finally(() => {
                resolve(false);
                setLoading(false);
              });
          }
        });
      },
    });
  };

  // 新增、修改卡片名称
  const addOrEditCardName = (type, editData) => {
    if (type === 'add' && customCard.length >= 5) {
      notification.warning({
        message: intl
          .get('sslm.memberExpansion.modal.customCard.maximum5')
          .d('最多只可新增5张自定义卡片'),
      });
      return false;
    }
    const dataSet = new DataSet(customCardDS());
    if (type === 'edit') {
      dataSet.loadData([editData]);
    }
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      style: { width: 380 },
      title:
        type === 'edit'
          ? intl.get('sslm.memberExpansion.view.title.renameCardName').d('重命名卡片名称')
          : intl.get('sslm.memberExpansion.view.title.cardName').d('卡片名称'),
      children: (
        <Form dataSet={dataSet} labelLayout="float" columns={1}>
          <TextField name="customizeTitle" />
        </Form>
      ),
      onOk: () => {
        return new Promise(async resolve => {
          const validateFlag = await dataSet.validate();
          if (validateFlag) {
            if (type === 'edit') {
              const { memberCustomizeId, customizeTitle } =
                dataSet?.current?.get(['memberCustomizeId', 'customizeTitle']) || {};
              const newData = customCard.map(n => {
                if (n.memberCustomizeId === memberCustomizeId) {
                  return { ...n, customizeTitle };
                } else {
                  return n;
                }
              });
              setCustomCard(newData);
            } else {
              const cardData = dataSet.toJSONData();
              setCustomCard(state => [...state, ...cardData]);
            }
            resolve();
          } else {
            resolve(false);
          }
        });
      },
    });
  };

  // 富文本修改数据回调
  const handleRichTextChange = (value, editData) => {
    const newData = editData;
    newData.customizeContent = value;
  };

  // 获取需保存的数据
  const getSaveData = async () => {
    const contactDs = contactRef?.current?.dataSet;
    const validateList = await Promise.all([
      contactDs.validate(),
      enterpriseCardDs.validate(),
      productIntroduceDs.validate(),
    ]);
    let payload = {};
    if (!validateList.includes(false)) {
      payload = {
        ...(enterpriseCardDs?.current?.toJSONData() || {}),
        updateFlag: 1,
        memberContactList: contactDs.toJSONData(),
        memberMainProductList: productIntroduceDs.toJSONData(),
        memberCustomizeList: customCard.map(card => {
          const { _status, memberCustomizeId, customizeContent, ...rest } = card;
          const newCustomizeContent = customizeContent && JSON.stringify(customizeContent);
          if (_status === 'create') {
            return { ...rest, customizeContent: newCustomizeContent };
          } else {
            return { ...card, customizeContent: newCustomizeContent };
          }
        }),
      };
    }
    return payload;
  };

  // 保存
  const handleSave = async type => {
    const saveData = await getSaveData();
    if (!isEmpty(saveData)) {
      setLoading(true);
      return updateMemberInfo({
        ...saveData,
        statusCode: type === 'EDIT' ? 'NEW' : saveData.statusCode,
      })
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            await handleQuery();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 发布
  const handleRelease = async () => {
    const saveData = await getSaveData();
    if (!isEmpty(saveData)) {
      setLoading(true);
      return releaseMemberInfo(saveData)
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            await handleQuery();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 预览
  const handlePreview = () => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/member-supplier-expansion-preview',
      })
    );
  };

  // 企业卡片-下拉操作回调
  const handleEnterpriseOpera = async ({ key }) => {
    const saveData = await getSaveData();
    if (!isEmpty(saveData)) {
      const promise =
        key === 'riskInfo' ? updateRiskInfo : key === 'tagInfo' ? updateLabelInfo : null;
      if (promise) {
        setLoading(true);
        promise(saveData)
          .then(async response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              await handleQuery();
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  };

  const value = {
    isPay,
    isEdit,
    tagList,
    loading,
    isPreview,
    dataSource,
    customCard,
    contactRef,
    companyData,
    renderLoading,
    showDetailFlag,
    enterpriseStatus,
    enterpriseCardDs,
    productIntroduceDs,
    handleSave,
    handleRelease,
    setCustomCard,
    handlePreview,
    handleDeleteCard,
    addOrEditCardName,
    handleRichTextChange,
    handleEnterpriseOpera,
    handleSupplementaryInfo,
  };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
};

export default StoreProvider;
