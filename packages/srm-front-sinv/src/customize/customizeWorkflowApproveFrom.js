// 引入 存储 数据权限维度配置的方法
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
// import { isFunction } from 'lodash';
import { dynamicWrapper } from './index';

setWorkflowApproveForm({
  code: 'SUPPLIER_RECEIVE', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReceipWorkbench/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SINVWORKBENCHDETAIL', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReceipWorkbench/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SUPPLIER_RETURN_DETAIL', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReceipWorkbench/ReturnDetail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SINV_WORKBENCH_RETURN_DETAIL', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReceipWorkbench/ReturnDetail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'RCVHEADER', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReceiptExecution/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SINV.RCVHEADER_NEW:EMBEDPAGE', // 单据样式定制-工作流
  customSubmit: true, // 注册了submit回调函数
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReceipWorkbenchWorks') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SINV.RCVHEADER_NEW:_WORKS', // 统一单据样式定制-工作流
  customSubmit: true, // 注册了submit回调函数
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReceipWorkbenchNewFlow') // 流程表单页面组件
    );
  },
});
