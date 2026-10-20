import React, { Component } from 'react';

export default class ImageMagnifier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      /**
       * 图片放大镜参数列表
       * 组件宽高必须大于鼠标悬停小方块 ！！！
       */
      params: {
        // 放大倍数
        scale: 3,
        // 组件宽
        width: '400',
        // 组件高
        height: '400',
        left: '494',
      },
      // 缩略图
      minImg: '',
      // 大图
      maxImg: '',

      // 开关
      magnifierOff: false,
      // 图片加载情况
      imgLoad: false,
      /**
       * 样式
       */
      cssStyle: {
        // 图片容器样式
        imgContainer: {
          width: '300px',
          height: '300px',
          // border: '1px solid #ccc',
          cursor: 'move',
          position: 'relative',
        },
        // 鼠标悬停小方块样式
        mouseBlock: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100px',
          height: '100px',
          background: 'rgba(0,0,0,0.1)',
          zIndex: 99,
        },
        // 鼠标悬停遮罩层样式
        maskBlock: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0)',
          zIndex: 100,
        },

        //  放大镜容器样式
        magnifierContainer: {
          position: 'absolute',
          left: '370px',
          top: '0',
          width: '400px',
          height: '400px',
          border: '1px solid #ccc',
          overflow: 'hidden',
          zIndex: 98,
        },
        // 图片样式
        imgStyle: {
          width: '100%',
          height: '100%',
        },
        // 图片放大样式
        // 此处图片宽高不能设置为百分比，在scale的作用下，放大的只是图片初始的宽高 ！！！
        imgStyle2: {
          width: '400px',
          height: '400px',
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'scale(4)',
          transformOrigin: 'top left',
        },
      },
    };
  }

  /**
   * 生命周期函数
   */
  // 组件初始化
  componentWillMount() {
    this.initParam();
    this.updataImg(this.props);
  }

  // props 变化时更新
  componentWillReceiveProps(nextProps) {
    this.updataImg(nextProps);
  }

  /**
   * 方法
   */
  // 鼠标移入
  mouseEnter = () => {
    this.setState({
      magnifierOff: true,
    });
  };

  // 鼠标移除
  mouseLeave = () => {
    this.setState({
      magnifierOff: false,
    });
  };

  // 鼠标移动
  mouseMove = event => {
    // console.log(event);
    const e = event.nativeEvent;
    this.calculationBlock(e.offsetX, e.offsetY);
  };

  // 计算相关参数
  calculationBlock(setX, setY) {
    let offsetX = setX;
    let offsetY = setY;
    const cssStyle = JSON.parse(JSON.stringify(this.state.cssStyle));
    /* 小方块位置 */
    // 防止鼠标移动过快导致计算失误，只要小于或者大于对应值，直接设置偏移量等于最小值或者最大值
    if (offsetX < 50) {
      offsetX = 50;
    }
    if (offsetX > 350) {
      offsetX = 350;
    }
    if (offsetY < 50) {
      offsetY = 50;
    }
    if (offsetY > 350) {
      offsetY = 350;
    }
    cssStyle.mouseBlock.left = `${parseFloat(offsetX - 50)}px`;
    cssStyle.mouseBlock.top = `${parseFloat(offsetY - 50)}px`;

    /* 计算图片放大位置 */
    cssStyle.imgStyle2.left = `${parseFloat(-(offsetX - 50) * 4)}px`;
    cssStyle.imgStyle2.top = `${parseFloat(-(offsetY - 50) * 4)}px`;

    this.setState({
      cssStyle,
    });
  }

  // 初始化静态参数
  initParam() {
    const cssStyle = JSON.parse(JSON.stringify(this.state.cssStyle));
    const params = JSON.parse(JSON.stringify(this.state.params));

    cssStyle.imgContainer.width = `400px`;
    cssStyle.imgContainer.height = `400px`;
    cssStyle.magnifierContainer.width = `${params.width}px`;
    cssStyle.magnifierContainer.height = `${params.height}px`;
    cssStyle.magnifierContainer.left = `${params.left}px`;
    cssStyle.imgStyle2.width = `${params.width}px`;
    cssStyle.imgStyle2.height = `${params.height}px`;
    cssStyle.imgStyle2.transform = `scale(${params.scale})`;

    this.setState({
      cssStyle,
    });
  }

  // 更新图片
  updataImg(props) {
    this.setState({
      minImg: props.minImg,
      maxImg: props.maxImg,
    });
  }

  // 图片加载情况
  handleImageLoaded() {
    // console.log(e);
    this.setState({ imgLoad: true });
  }

  // 图片加载中
  handleImageErrored() {
    this.setState({ imgLoad: false });
  }

  render() {
    const { cssStyle, magnifierOff, minImg, maxImg, imgLoad } = this.state;
    return (
      <div>
        <div style={cssStyle.imgContainer}>
          <img style={cssStyle.imgStyle} src={minImg} alt="" />
          <div
            style={cssStyle.maskBlock}
            onMouseEnter={this.mouseEnter}
            onMouseLeave={this.mouseLeave}
            onMouseMove={this.mouseMove}
          />
          {magnifierOff && <div style={cssStyle.mouseBlock} />}
        </div>
        {magnifierOff && (
          <div style={cssStyle.magnifierContainer}>
            <img
              style={cssStyle.imgStyle2}
              src={maxImg}
              onLoad={this.handleImageLoaded.bind(this)}
              onError={this.handleImageErrored.bind(this)}
              alt=""
            />
            {!imgLoad && 'failed to load'}
          </div>
        )}
      </div>
    );
  }
}
