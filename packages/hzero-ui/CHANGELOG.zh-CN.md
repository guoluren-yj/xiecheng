---
order: 6
title: 更新日志
toc: false
timeline: true
---

# 发布周期

* 修订版本号：每周末会进行日常 bugfix 更新。（如果有紧急的 bugfix，则任何时候都可发布）
* 次版本号：每月发布一个带有新特性的向下兼容的版本。
* 主版本号：含有破坏性更新和新特性，不在发布周期内。

---
* Input
  * dbc2sbc 属性默认改为 false
* DatePicker
  * 复用C7N DatePicker
* Button & Select
  * 内容溢出时显示Tooltip
* Tooltip
  * 新增 theme 属性

## 1.0.85

`2021-03-24`
* Modal
  * 修复 Modal ie 居中问题 
## 1.0.84

`2021-03-23`
* InputNumber
  * 修复 InputNumber Windos 输入法问题 
## 1.0.83

`2021-03-18`
* Modal
  * 修复全局变量覆盖问题
`2021-03-11`
* Upload
  * 修复 Upload 出现的自定义请求取消上传的报错
## 1.0.82

`2021-03-04`
* Modal
  * 修复 overflow 时候的modal头部位置偏高
## 1.0.81

`2020-01-6`
* Modal
  * 修复 scroll 修改导致的不能复用以前的配置
`2021-1-11`
* Modal
  * 增加Modal可拖拽和居中配置 movable  autoCenter

## 1.0.80

`2020-10-21`
* Table
  * 修复 resizable scroll 出现的错位问题

## 1.0.78

`2020-10-21`
* Input
  * 修复 Form 中使用input框在chrome下出现光标定位问题
* Table
  * Table 增加高度自适应 autoHeight

## 1.0.77

`2020-08-18`
* Table
  * 修复Table resizable 翻页出现固定页和内嵌页面不一致问题

## 1.0.76

`2020-06-18`
* ConfigProvider
  * 增加全局属性组件，新增pagenation的配置，以及table导出配置
* Table
  * 增加Table导出的exported属性

## 1.0.75

`2020-06-12`

* Input
  * 修复 在Form组件中使用，页面刷新问题

## 1.0.74

`2020-06-10`

* Input
  * 修复 使用typeCase属性后，光标自动焦点到最后

## 1.0.73

`2019-07-19`

* Upload
  * 优化 showUploadList: {showPreviewIcon, showDownloadIcon, showReUploadIcon} 可以接收方法 (file: UploadFile) => boolean

## 1.0.72

`2019-07-19`

* Table
  * 优化 表格头 宽度不够时, 统一显示 "..."
  * 优化 resizable Title 高度调整为固定高度

## 1.0.71

`2019-07-19`

* Table
  * 修复 resizable 覆盖 onCell 返回的 空的问题

# 1.0.70
 `2019-09-04`
 * Table
   * 修复多余的滚动条显示问题

## 1.0.69

`2019-08-28`

* Upload
  * 增加 showUploadList 自定义 文件名 title 功能
  * showUploadList: {getCustomFilenameTitle}

## 1.0.68

`2019-08-22`

* Upload
  * demo 新增 显示额外icon
  * 增加 showUploadList 重新相关 相关内容
  * onReUpload: 回调方法
  * showUploadList: {showReUploadIcon, reUploadText, reUploadPopConfirmTitle}: icon title, popconfirm title

## 1.0.67

`2019-07-19`

* Table
  * 修复 resizable 覆盖 onCell 返回的 style 问题

## 1.0.66

`2019-07-15`

* 发版
  * 1.0.65 发版失败

## 1.0.65

`2019-07-12`

* Upload
  * 判断文件类型 优先使用文件名
* Cascader
  * item 样式 设置最小宽度 111px

## 1.0.64

`2019-06-21`

* Input
  * onChange 方法 之后再改变输入之后才会重新设置 e.target.value [hzero问题 hzero-3223
](https://choerodon.com.cn/#/agile/issue?type=project&id=7&name=HZERO%E6%8A%80%E6%9C%AF%E4%B8%AD%E5%8F%B0%E7%A0%94%E5%8F%91&organizationId=7&paramName=hzero-3223&paramIssueId=89341&paramUrl=scrumboard)

## 1.0.63

`2019-05-05`

* Drawer
  * maskClosable 默认值给为 false

## 1.0.62

`2019-04-02`

* Modal
  * maskClosable 默认值给为 false

## 1.0.61

`2019-04-02`

* Input
  * composition 需要特殊处理; 现在在 compositionEnd 后 手动在 chrome 和 ie11 浏览器触发change事件
* _util
  * 新增 browser 检测浏览器问题

## 1.0.60

`2019-04-01`

* Table
  * customColumns 造成的问题修复: actionColumn 对应不上的问题

## 1.0.59

`2019-03-21`

* Table
  * 列标题 按钮align 按照配置 而不是统一居中

## 1.0.58

`2019-03-12`

* Table
  * 修复 Table 层级问题 固定列层级变为 100 起

## 1.0.56

`2019-02-28`

* 修复 版本发布 还需要发布dist版本
  * 需要执行命令: npm run tsc && npm run compile && npm run dist

## 1.0.55

`2019-02-18`

* Table
  * 移除 debugger
* less
  * text-decoration-skip ink 换成 auto, spec had been changed

## 1.0.54

`2019-02-18`

* Table
  * 修复 resizable 超出显示横向滚动条
  * 修复 resizable Table加上 scroll-x

## 1.0.53

`2019-02-14`

* Table
  * 修复 Table 引入 customColumns 导致的columns顺序问题

## 1.0.52

`2019-01-28`

* Table
  * 修复 用户个性化Table功能 customColumn 中的 key 变为 fieldKey
  * 优化 用户个性化Table功能 customColumn 编辑框标题居中
  * 修复 在 组件中引入其他的组件 还需要引入对应的样式

## 1.0.51

`2019-01-23`

* Table
  * 更新 用户个性化Table功能 调整
  * 新增 customColumns: CustomColumn[] 属性
  * 新增 onCustomColumnFilter(customColumns: CustomColumn[]) 方法

## 1.0.50

`2019-01-14`

* Table
  * 更新 所有表格, 标题, 全部居中
  * 更新 宽度调整时, td 中加入 minWidth
  * 更新 列伸缩 拖拽 handle 加上层级

## 1.0.49

* Table
  * 🐞修复 拖动不固定区域宽度后 标题高度不对齐的问题
  * 🐞修复 分页信息 fixed 层级不对的问题

## 1.0.48

`2018-12-25`

* DatePicker
  * 新增年份选择器

## 1.0.47

`2018-12-21`

* Table,Modal
  * IE下显示问题

## 1.0.46

`2018-12-18`

* Table
  * Resizable 下滚动条显示问题

## 1.0.45

`2018-12-17`

* Input
  * 修订 Chrome 下输入中文的问题

## 1.0.44

`2018-12-3`

* Trigger
  * 撤销1.0.43的更改;trigger 样式 overflow: hidden 时会遮盖

## 1.0.43

`2018-12-3`

* Trigger
  * `getPopupContainer` 属性增加默认值，修复滚动后浮层不移动的问题


## 1.0.42

`2018-12-6`

* Input
  * 修改 onBlur 判断前后值是否一致

## 1.0.41

`2018-12-6`

* Upload
  * listType="picture-card"下, 删除和下载icon按钮
* Table
  * 增加可筛选列配置

## 1.0.39

`2018-11-30`

* Table
  * 修复列宽调整后重新渲染失效的BUG

## 1.0.38

`2018-11-30`

* Table
  * 调整 Table 组件 `resizable` 属性值为 true

## 1.0.37

`2018-11-27`

* less
  * 调整所有 font-family 顺序，将微软雅黑放在第一位，适配 IE

## 1.0.36

`2018-11-26`

* Input
  * Password 组件去掉 `passwordEye` 属性， 默认 password 组件自动添加 passwordEye
  * 增加 `trimAll` 属性(是否删除所有空格)

## 1.0.35

`2018-11-22`

* Input
  * Password 组件增加 `passwordEye`

## 1.0.33

`2018-11-19`

* Upload
  * 上传组件优化

## 1.0.31

`2018-11-15`

* Table
  * 解决fix列造成行form被覆盖问题

## 1.0.29

`2018-11-14`

* Table
  * 增加`resizable`属性

## 1.0.27

`2018-11-12`

* DatePicker
  * 修复选中日期后无法获取焦点

## 1.0.26

`2018-11-9`

* Form
  * 修复必输样式在禁用状态下无效
* Table
  * 删除测试代码

## 1.0.24

`2018-11-7`

* Table
  * expandedRowKeys 受控問題

## 1.0.21

`2018-11-6`

* Input
  * 修复 onBlur 无法调用的问题

## 1.0.20

`2018-10-31`

* FormItem
  * 必输样式在禁用状态下的样式问题

## 1.0.19

`2018-10-27`

* Input
  * 修改 trime 触发事件，改为 blur 后再执行

## 1.0.13

`2018-10-24`

* Table
  * BodyRow 上增加 `record` 属性
* Form
  * 修改组件必输样式（底色黄色)

## 1.0.11

`2018-10-23`

* Input
  * 修改 `trim` 属性默认值为 true
* Table
  * `column` 增加 `minWidth` 属性
* Form
  * 修改组件必输样式（底色黄色)

## 1.0.10

`2018-10-17`

* Input
  * 增加 `trim` 属性,去掉前后空格
  * 增加 `inputChinese` 属性，限制中文字符

## 1.0.9

`2018-09-30`

* Form
  * 修复 Form 中 form 属性的 BUG

## 1.0.8

`2018-09-25`

* Form
  * 增加 `registerField` 方法
  * form 组件中增加 form 属性

## 1.0.7

`2018-09-07`

* Input
  * 增加 `typeCase` 限制录入的大小写限制
  * 增加全角半角转换
* Select
  * 🐞修复 `allowClear` 按钮图标出现 X 的问题
* InputNumber
  * 增加 `allowThousandth` 千分位属性
* Checkbox,Switch
  * 增加 `checkedValue`, `unCheckedValue` 默认值

## 1.0.5

`2018-09-03`

* Button
  * 🐞修复 `loading` 状态下任能重复点击的问题
* 1.0 版本诞生，发布到 npmjs
