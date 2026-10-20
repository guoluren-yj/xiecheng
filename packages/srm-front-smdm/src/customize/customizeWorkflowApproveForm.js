/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-09-16 17:18:54
 * @LastEditors: yanglin
 * @LastEditTime: 2023-08-10 11:50:00
 */
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
import dynamic from 'dva/dynamic';
import { createElement } from 'react';

const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

const dynamicWrapper = (app, models, component) => {
  //  eslint-disable-next-line
  return dynamic({
    app,
    models: () =>
      models
        .filter((model) => modelNotExisted(app, model))
        .map((m) => import(`../models/${m}.js`)) || [],
    // add routerData prop
    component: () => {
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return (props) =>
          //  eslint-disable-next-line
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

setWorkflowApproveForm({
  code: 'SMDM.ITEM_REQ', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['materielApplication'], // 流程表单页面用到的 model
      () => import('../routes/MaterielApplication/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SMDM.IREM_REQ:PUB', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['materielApplicationPub'], // 流程表单页面用到的 model
      () => import('../routes/MaterielApplication/DetailPub') // 流程表单页面组件
    );
  },
});

// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      customSubmit: true,
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/MaterialCertificationPool/Detail/ReadOnly') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SMDM.ITEM_AUTH_REQ_SAMPLE_C:SMDM_ITEM_AUTH_FROM_SAMPLE_C',
  'SMDM.ITEM_AUTH_REQ_SMALL_B_T:SMDM_ITEM_AUTH_FROM_SMALL_B_T',
  'SMDM.ITEM_AUTH_REQ_MEDIUM_B_T:SMDM_ITEM_AUTH_FROM_MEDIUM_B_T',
  'SMDM.ITEM_AUTH_REQ_MASS_TRIAL:SMDM_ITEM_AUTH_FROM_MASS_TRIAL',
  'SMDM.ITEM_AUTH_REQ_MATERIAL_R:SMDM_ITEM_AUTH_FROM_MATERIAL_R',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N1:SMDM_ITEM_AUTH_FROM_RESERVE_N1',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N2:SMDM_ITEM_AUTH_FROM_RESERVE_N2',
  'SMDM.ITEM_AUTH_REQ_SAMPLE_C:SMDM_ITEM_AUTH_FROM_SAMPLE_C0',
  'SMDM.ITEM_AUTH_REQ_SAMPLE_C:SMDM_ITEM_AUTH_FROM_SAMPLE_C1',
  'SMDM.ITEM_AUTH_REQ_SAMPLE_C:SMDM_ITEM_AUTH_FROM_SAMPLE_C2',
  'SMDM.ITEM_AUTH_REQ_SAMPLE_C:SMDM_ITEM_AUTH_FROM_SAMPLE_C3',
  'SMDM.ITEM_AUTH_REQ_SAMPLE_C:SMDM_ITEM_AUTH_FROM_SAMPLE_C4',
  'SMDM.ITEM_AUTH_REQ_SAMPLE_C:SMDM_ITEM_AUTH_FROM_SAMPLE_C5',
  'SMDM.ITEM_AUTH_REQ_SAMPLE_C:SMDM_ITEM_AUTH_FROM_SAMPLE_C6',
  'SMDM.ITEM_AUTH_REQ_C_SAMPLE_C:DOM',
  'SMDM.ITEM_AUTH_REQ_C_SMALL_B_T:DOM',
  'SMDM.ITEM_AUTH_REQ_C_MED_B_T:DOM',
  'SMDM.ITEM_AUTH_REQ_C_MASS_TRIA:DOM',
  'SMDM.ITEM_AUTH_REQ_C_MATERIA_R:DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N1:DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N2:DOM',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N3:READ_DOM',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N4:READ_DOM',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N5:READ_DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N3:READ_DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N4:READ_DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N5:READ_DOM',
  'SMDM.ITEM_AUTH_REQ_SAMPLE_C:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_SMALL_B_T:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_MEDIUM_B_T:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_MASS_TRIAL:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_MATERIAL_R:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N1:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N2:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N3:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N4:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_RESERVED_N5:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N3:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N4:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N5:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_SAMPLE_C:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_SMALL_B_T:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_MED_B_T:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_MASS_TRIA:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_MATERIA_R:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N1:EDIT_DOM',
  'SMDM.ITEM_AUTH_REQ_C_RESERV_N2:EDIT_DOM',
]);

// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      customSubmit: true,
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/MaterialFeedback/Detail/ReadOnly') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SMDM.ITEM_AUTH_FEE_SAMPLE_C:SMDM.ITEM_AUTH_REQ_SAMPLE_C',
  'SMDM.ITEM_AUTH_FEE_SMALL_B_T:SMDM.ITEM_AUTH_FEE_SMALL_B_T',
  'SMDM.ITEM_AUTH_FEE_MEDIUM_B_T:SMDM.ITEM_AUTH_FEE_MEDIUM_B_T',
  'SMDM.ITEM_AUTH_FEE_MASS_TRIAL:SMDM.ITEM_AUTH_FEE_MASS_TRIAL',
  'SMDM.ITEM_AUTH_FEE_MATERIAL_R:SMDM.ITEM_AUTH_FEE_MATERIAL_R',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N1:SMDM.ITEM_AUTH_FEE_R_N1',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N2:SMDM.ITEM_AUTH_FEE_R_N2',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N5:READ_DOM',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N4:READ_DOM',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N3:READ_DOM',
  'SMDM.ITEM_AUTH_FEE_SAMPLE_C:EDIT_DOM',
  'SMDM.ITEM_AUTH_FEE_SMALL_B_T:EDIT_DOM',
  'SMDM.ITEM_AUTH_FEE_MEDIUM_B_T:EDIT_DOM',
  'SMDM.ITEM_AUTH_FEE_MASS_TRIAL:EDIT_DOM',
  'SMDM.ITEM_AUTH_FEE_MATERIAL_R:EDIT_DOM',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N1:EDIT_DOM',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N2:EDIT_DOM',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N5:EDIT_DOM',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N4:EDIT_DOM',
  'SMDM.ITEM_AUTH_FEE_RESERVED_N3:EDIT_DOM',
]);
