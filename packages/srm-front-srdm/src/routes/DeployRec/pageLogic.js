import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
/**
 * @Description: 页面自定义逻辑的统一文件
 * 这个文件本质上就是一个方法的集合，方法包括了生命周期函数和一些自定义的按钮函数执行
 * 既触发对应生命周期时以及事件时，实际执行的函数内容是当前文件
 * 所有的函数都可以获取this对象，从而获取dataSet，function，state，局部变量等等
 */
export async function initComponent() {
  /* TODO: 组件初始化过程
   * @ref react.constructor React构造函数执行时触发
   * @description 这个函数中，我们可以处理一些初始化逻辑，比如state的初始化，dataSet的初始化，对象属性的定义等
   */
  this.pwdDS = await new DataSet({
    autoCreate: true,
    fields: [
      {
        type: 'string',
        name: 'decryptVerifyPassword',
        required: true,
        label: intl.get('hpdm.deploy-rec.model.decryptVerifyPassword').d('密码'),
      },
    ],
  });
}
export function componentDidMount() {
  /* TODO: 组件第一次挂载到dom上
   * @ref react.componentDidMount React componentDidMount生命周期
   * @description 这个函数中，我们可以处理一些dom节点，比如绑定div滚动事件;初始化查询，获取路径参数并设置到查询条件上;根据某些条件设置state;启动一个定时器等需求
   */
}
