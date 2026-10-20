# Upload组件维护参考

## 组件涉及内容

因为该组件仅涉及协议模块的多个页面的逻辑，其他模块请谨慎参考

下述代码仅粘贴了部分，可以复制后在Upload-index.js里进行快速定位

该组件目前涉及以下内容（且后续会详细说明）:
  
1. 协议模板-模板配置-模板文件：按顺序点击后弹出的弹框即为下述代码所渲染的内容

```
contractTypeFlag && (
  <div style={{ float: 'left' }}>
    <p>{intl.get(`${viewMessagePrompt}.templateFile`).d('模板文件')}:</p>
    <Upload {...contractTemplateUploadProps}>
      {contractTypeFlag && contractTemplateUploadFileList.length === 0 && (
        <div>
          <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
        </div>
      )}
    </Upload>
    ...
  </div>
)
```

2. 协议其他模块详情页-附件|附件上传：

```
const modalContent = (
  <Spin spinning={queryAttachmentList}>
    <Row>
      {(supplierViewFlag || supplierUploadFlag) && (
        <Fragment>
          <Col span={12}>
            <p>{intl.get(`entity.attachment.type.purchaser`).d('采购方附件')}:</p>
            {leftComponent}
          </Col>
          <Col span={12}>
            <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}:</p>
            {rightComponent}
          </Col>
        </Fragment>
      )}
      {(!(supplierViewFlag || supplierUploadFlag) || contractTypeFlag) && leftComponent}
    </Row>
  </Spin>
);
```

supplierViewFlag: 供应商可读标识

supplierUploadFlag: 供应商可写标识

contractTypeFlag: 协议模板页面标识

补充说明：

1). leftComponent里Fragment下有两个div，第一个div涵盖的内容如下：

    a). 协议类型-附件类型定义里定义的附件上传列表（即templateList渲染部分）
    b). 协议文本（协议性质为附件合同时渲染）
    c). 以及上述提到的模板文件
    第二个div涵盖的内容：
    d). 基于普通上传需要的上传框
    f). 采购方附件（包含上述div里的a和b两部分）非图片类附件列表
    
2). rightComponent
    此部分本来只涵盖了上述第二个div里的内容，但基于10.01迭代需求，需要将上述第一个div里的协议类型-附件类型定义的附件列表渲染逻辑拷到此部分


## 附件|附件上传部分详解

因附件模板-模板文件部分不涉及复杂逻辑，故暂且按下不表；

且由于rightComponent本质上就是leftComponent的镜像，故下述将按照leftComponent里的内容自顶向下进行说明；

由于模态框是以上下两部分，且上部分以inline-block样式渲染，下部分以block样式渲染；故代码里将会有过滤图片和非图片类附件的操作。


### 附件类型定义的附件上传
此部分涉及两个列表：templateList 和 ${item.attachmentId}UploadFileList

前者在协议类型-附件类型定义tab里定义，用于采购方相关必填的附件上传（基于10.01迭代的拆分，现在是采购方和供应方都需要此部分渲染）

后者用于存取页面上templateList涉及的已上传和新上传的附件数据


### 协议文本
涉及列表字段：templateUploadFileList

此部分为采购方上传附件内容；除上述过滤操作，以及协议文本只能存在一个，无其他特殊内容需要说明


### 协议模板-模板配置-模板文件
此部分如标题所述，作用为配置模板时的模板文件上传; 因无特殊逻辑，可参考标题路径，操作一次即可;

### 基于普通上传需要的上传框
此部分与上述部分不太一样的地方在于，上述三部分的上传按钮都是基于url形式进行上传附件操作，而此部分是基于uuid进行上传

下述为upload上传组件所需参数:
  > const commonUploadProps = {
  >
  >    headers,                                                              // http请求头
  >
  >    listType: 'picture-card',                                             // 上传列表的内建样式，text, picture 和 picture-card
  >
  >    name: 'file',                                                         // 发到后台的文件参数名
  >
  >    multiple: true,                                                       // 是否支持多选文件，ie10+ 支持。开启后按住 ctrl 可选择多个文件
  >
  >    onPreview: this.handlePreview,                                        // 点击文件链接或预览图标时的回调                            
  >
  >    beforeUpload: this.beforeUpload,                                      // 请参考hzero或antd，内容太长了
  >
  > };

  > const purchaserUploadProps = {
  >
  >    ...commonUploadProps,
  >
  >    data: (file) => this.uuidUploadData(file, 'purchaser'),                                  // 上传所需额外参数或返回上传额外参数的方法
  >
  >    fileList: purchaseUploadFileListPic,                                                     // 已经上传的文件列表（受控）
  >
  >    onChange: (params) => this.onUploadChange(params, 'purchaseUploadFileList'),             // 上传文件改变时的回调
  >
  >    onRemove: (file) => this.onUploadRemove(file, attachmentUUID, 'purchaseUploadFileList'), // 移除文件改变时的回调
  >
  >    action: uuidAction,                                                                      // 上传的地址
  >
  >    showUploadList: {...}                                                                       // 是否展示文件列表, 可设为一个对象(详见H0)
  >
  > };

需要注意的是此组件是直接使用的hzero的upload组件（当然，它也是套娃的antd的），所以上传时，filename、bucketName、directory等参数被封装到了data对象里；

但页面上有些上传模态框没有使用这个组件，而是直接引用了srm-front-boot里的upload，该upload虽然是基于hzero进行的套壳封装，但此处主要想强调，对于上述filename、bucketName、directory等字段的传参，其被解耦到了props里，而非上述的data对象里了。

然后就是基于uuid和基于url两种上传的区别如下：

1. 上传路径不一样，即上述的action参数（直接搜commonUploadProps，就可以在此部分代码附近找到两个action）
2. 基于url的上传参数中，字段directory在基于uuid的参数配置里被写成了bucketDirectory（具体可以对比urlUploadData和uuidUploadData两个方法的区别）
3. 基于uuid的上传参数中，多了一个attachmentUUID字段，用于标识当前上传附件的进一步的存储路径

### 采购方附件非图片类附件列表
常规的对非图片类附件的展示处理，除了删除和预览操作，并无其他交叉逻辑
