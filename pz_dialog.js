(function() {
  /**
@基于jQuery的对话框效果
@实现4中常见的对话框效果，可以工具需要修改css样式达到自己想要的效果
@调用方式和配置参数，可以看下对应的4中创建方式
@杨永
@QQ:377746756
@call:18911082352
@版本:2.01(扩展手动设置是否关闭弹窗)
@调用方法:
var tips=new PZ_Dialog({
					  type:["confirm","alert","prompt","tips",或者为空],
					  height:300,
					  width:800,
					  text:"模仿confirm",
					  tipsText:"是<a href='#'>否继续?</a>",
					  buttonSureText:"知道了", 
					  buttonCancelText:"关闭", 
					  callBack:function(){         //回调函数
							alert("确认按钮"); 
							return true;             //当回调函数返回值为true的时候，阻止关闭窗口，当有一个可以关闭的状态时，手动调用new出来的对象的closeDialog()方法
					  },
					  cancelCallBack:function(){
							alert("取消按钮"); 
					  },
					  mask:0.8,
					  isDrag:true ,               //开起拖动
					  postion:[100,300],     //开起手动定位窗口位置
					  delay:5,              //小提示窗口延时几秒关闭 
					  });
@新增定制多个按钮功能
var tips=new PZ_Dialog({
							  type:"coustom",
							  text:"定制按钮",
							  btnGroup:[
								{
									btnTxt:'关闭',
									skin:--
									callback:function(){
									alert(1)
									}
								},
								{
									btnTxt:'申诉',
									callback:function(){
									alert(2)
									}
								},
								{
									btnTxt:'取消',
									callback:function(){
									alert(3);
									return false;//如果回调函数返回false不关闭窗口
									}
								}
							  ],
							  mask:0.5
 });
*/
  function PZ_Dialog(args) {
    //保存参数对象
    this.args = args;
    //初始化参数默认值
    this.dialogWidth = args.width || 420;
    this.dialogHeight = args.height || 83;
    this.dialogText = args.text || '提示信息';
    this.isMask = args.mask || false;
    this.dialogType = args.type || false;
    this.dialogAlertTips = args.tipsText || '';
    this.dialogDrag = args.isDrag || false;
    this.buttonSureText = args.buttonSureText || '确定';
    this.buttonCancelText = args.buttonCancelText || '取消';
    //绑定确认和取消按钮的回调函数
    this.dialogCallBack = args.callBack || function() {};
    this.dialogCancelCallBack = args.cancelCallBack || function() {};
    /****************扩展弹窗位置*********************/
    this.dialogPosition = args.position || [0, 0];
    /**************扩展弹窗是否设置关闭*****************/
    this.isDialogClose = true;
    //如果指定了对话框类型，就设定自身的默认尺寸
    if (this.dialogType == 'alert') {
      this.dialogWidth = args.width || 420;
      this.dialogHeight = args.height || 130;
    } else if (this.dialogType == 'confirm') {
      this.dialogWidth = args.width || 420;
      this.dialogHeight = args.height || 110;
    } else if (this.dialogType == 'prompt') {
      this.dialogWidth = args.width || 420;
      this.dialogHeight = args.height || 115;
      this.dialogCallBack = args.callBack;
    } else if (this.dialogType == 'tips') {
      this.dialogWidth = args.width || 150;
      this.dialogHeight = args.height || 30;
      this.delay = args.delay * 1000 || 3000;
    } else if (this.dialogType == 'coustom') {
      //新增定制按钮功能
      this.dialogWidth = args.width || 420;
      this.dialogHeight = args.height || 110;
      this.btnGroup = args.btnGroup;
    }
    //插入到页面
    this.insertDialogDOM();
  }
  PZ_Dialog.prototype = {
    setDialogCustom: function() {
      var _this = this,
        tipsTextBox = $(
          "<div class='dialog_alert_tips'>" + this.dialogAlertTips + '</div>'
        ),
        btnBox = $("<div class='dialog_btn_box'></div>").css('width', '100%');
      //dialogBtnBox=$("<div class='dialog_btn_inner'></div>");
      btnBox.html(this.createBtnGroup());
      this.J_PZDialog_content.append(tipsTextBox, btnBox);
      this.J_PZDialog_close.remove();
    },
    createBtnGroup: function() {
      var dialogBtnBox = $("<div class='dialog_btn_inner'></div>").css(
        'width',
        '100%'
      );
      var self = this;
      if (this.btnGroup) {
        dialogBtnBox.width(90 * this.btnGroup.length);
        $(this.btnGroup).each(function() {
          var _this = this;
          var skin = this.skin ? ' ' + this.skin : '';
          //如果配置delayDisable就开启定时禁用
          var delay = '';
          if (this.delayDisable) {
            delay = ' delay';
            var delaySpan = $('<span/>');
          }
          var btn = $(
            "<div class='dialog_alert_btn" +
              skin +
              delay +
              "'><div>" +
              this.btnTxt +
              '</div></div>'
          ).click(function() {
            //如果delay存在，就不执行
            if ($(this).hasClass('delay')) {
              return false;
            }
            var ret = _this.callback();
            if (ret != false) {
              self.closeDialog();
            }
          });
          if (this.delayDisable) {
            btn.find('div').prepend(delaySpan);
            self.createDelay(btn, delaySpan, this.delayDisable);
          }
          dialogBtnBox.append(btn);
        });
      }
      return dialogBtnBox;
    },
    //创建一个延迟激活按钮的倒计时
    createDelay: function(btn, span, delay) {
      span.text('(' + delay + ')');
      btn.timer = window.setInterval(function() {
        delay--;
        span.text('(' + delay + ')');
        if (delay <= 0) {
          window.clearInterval(btn.timer);
          span.remove();
          btn.removeClass('delay');
        }
      }, 1000);
    },
    setDialogPrompt: function() {
      var _this = this,
        tipsTextBox = $("<div class='dialog_alert_tips'></div>"),
        textArea = $("<input placeholder='" + this.dialogText + "'></input>"),
        btnBox = $("<div class='dialog_btn_box'></div>"),
        dialogBtnBox = $("<div class='dialog_btn_inner'></div>"),
        btn = $(
          "<div class='dialog_alert_btn'><div>" +
            this.buttonCancelText +
            '</div></div>'
        ),
        btnSure = $(
          "<div class='dialog_alert_btn'><div>" +
            this.buttonSureText +
            '</div></div>'
        );
      //绑定取消和执行callback
      btn.click(function() {
        /*如果回调函数返回值是ture就不关闭*/
        _this.isDialogClose = _this.dialogCancelCallBack(textArea.val());
        if (!_this.isDialogClose) {
          _this.closeDialog();
        }
      });
      btnSure.click(function() {
        /*如果回调函数返回值是ture就不关闭*/
        _this.isDialogClose = _this.dialogCallBack(textArea.val());
        if (!_this.isDialogClose) {
          _this.closeDialog();
        }
      });
      textArea.keypress(function(e) {
        if (e.which == 13) {
          //处理文本域内的值并且作为参数把值传递给callback函数
          _this.dialogCallBack(textArea.val());
          _this.closeDialog();
        }
      });
      btnBox.append(dialogBtnBox);
      dialogBtnBox.append(btnSure, btn);
      tipsTextBox.append(textArea);
      this.J_PZDialog_content.append(tipsTextBox, btnBox);
      this.J_PZDialog_close.remove();
      tipsTextBox.height(26);
      btnBox.width(this.dialogWidth);
      //设为光标焦点
      textArea.focus();
    },
    setDialogTips: function() {
      var _this = this;
      //删除内容,关闭按钮
      this.J_PZDialog_content.remove();
      this.J_PZDialog_close.remove();
      this.J_PZDialog_caption_text.css('paddingLeft', 0)
        .parent()
        .css({
          textAlign: 'center',
          backgroundColor: 'white',
          border: 0,
          height: 49,
          fontWeight: 'bold'
        });
      window.setTimeout(function() {
        _this.closeDialog();
      }, this.delay);
    },
    setDialogDef: function() {
      this.J_PZDialog_content.text(this.dialogAlertTips).css(
        'textIndent',
        '15px'
      );
    },
    setDialogConfirm: function() {
      var _this = this,
        tipsTextBox = $(
          "<div class='dialog_alert_tips'>" + this.dialogAlertTips + '</div>'
        ),
        btnBox = $("<div class='dialog_btn_box'></div>"),
        dialogBtnBox = $("<div class='dialog_btn_inner'></div>"),
        btn = $(
          "<div class='dialog_alert_btn'><div>" +
            this.buttonCancelText +
            '</div></div>'
        ),
        btnSure = $(
          "<div class='dialog_alert_btn'><div>" +
            this.buttonSureText +
            '</div></div>'
        );
      /***************************/
      btnBox.width(this.dialogWidth);
      //绑定取消和执行callback
      btn.click(function() {
        /*如果回调函数返回值是ture就不关闭*/
        _this.isDialogClose = _this.dialogCancelCallBack();
        if (!_this.isDialogClose) {
          _this.closeDialog();
        }
      });
      btnSure.click(function() {
        /*如果回调函数返回值是ture就不关闭*/
        _this.isDialogClose = _this.dialogCallBack();
        if (!_this.isDialogClose) {
          _this.closeDialog();
        }
      });
      btnBox.append(dialogBtnBox);
      dialogBtnBox.append(btnSure, btn);
      this.J_PZDialog_content.append(tipsTextBox, btnBox);
      this.J_PZDialog_close.remove();
    },
    setDialogAlert: function() {
      var _this = this,
        tipsTextBox = $(
          "<div class='dialog_alert_tips'>" + this.dialogAlertTips + '</div>'
        ),
        btnBox = $("<div class='dialog_btn_box'></div>"),
        dialogBtnBox = $("<div class='dialog_btn_inner'></div>"),
        btn = $(
          "<div class='dialog_alert_btn'><div>" +
            this.buttonSureText +
            '</div></div>'
        );
      btn.click(function() {
        /*如果回调函数返回值是ture就不关闭*/
        _this.isDialogClose = _this.dialogCallBack();
        if (!_this.isDialogClose) {
          _this.closeDialog();
        }
      });
      btnBox.width(this.dialogWidth);
      dialogBtnBox.width(80);
      this.J_PZDialog_content.append(
        tipsTextBox,
        btnBox.append(dialogBtnBox.append(btn))
      );
      this.J_PZDialog_close.remove();
    },
    createMask: function() {
      this.mask = $("<div class='J_PZDialog_mask'></div>");
      this.setMaskCenter();
      //如果提供的参数是transparent，标识完全透明锁屏
      if (this.isMask == 'transparent') {
        this.mask.css('opacity', 0);
      } else {
        this.mask.css('opacity', this.isMask);
      }
      //插入到对话框的前面
      this.mask.insertBefore(this.J_PZDialog).fadeIn(500);
    },
    setMaskCenter: function() {
      this.mask.css({
        width:
          this.getWindowSize().width +
          (/MSIE\s+6\.0/.test(window.navigator.userAgent)
            ? document.documentElement.scrollLeft
            : 0) +
          'px',
        height:
          this.getWindowSize().height +
          (/MSIE\s+6\.0/.test(window.navigator.userAgent)
            ? document.documentElement.scrollTop
            : 0) +
          'px'
      });
    },
    setDialogCenter: function() {
      //设置弹出层居中显示
      var top =
        (this.getWindowSize().height - this.dialogHeight - 10) / 2 - 100 < 0
          ? 30
          : (this.getWindowSize().height - this.dialogHeight) / 2 - 100;
      this.J_PZDialog.css({
        left:
          (this.getWindowSize().width - this.dialogWidth - 10) / 2 +
          this.dialogPosition[0] +
          'px',
        top: top + this.dialogPosition[1] + 'px'
      });
    },
    getWindowSize: function() {
      //获取窗口大小
      return {
        width:
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth,
        height:
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight
      };
    },
    closeDialog: function() {
      var _this = this;
      //隐藏并删除对话框
      this.J_PZDialog.fadeOut('fast', function() {
        _this.J_PZDialog.remove();
      });
      //隐藏并删除幕布
      if (this.isMask) {
        this.mask.fadeOut('fast', function() {
          _this.mask.remove();
        });
      }
    },
    addEvts: function() {
      //添加相关事件
      var _this = this;
      //给关闭按钮添加事件
      this.J_PZDialog_close.click(function() {
        _this.closeDialog();
      });
      //当窗口发生改变的时候实时设置居中
      $(window).resize(function() {
        //优化反复调整窗口大小带来的阻塞
        window.clearTimeout(t);
        var t = window.setTimeout(function() {
          _this.setDialogCenter();
        }, 300);
        //如果开起幕布，就实时调整大小
        if (_this.isMask) {
          _this.setMaskCenter();
        }
      });
      //兼容ie6
      if (/MSIE\s+6\.0/.test(window.navigator.userAgent)) {
        $(window).scroll(function() {
          if (_this.isMask) {
            _this.mask.height(
              _this.getWindowSize().height +
                document.documentElement.scrollTop +
                'px'
            );
          }
          _this.J_PZDialog.css(
            'top',
            (_this.getWindowSize().height - _this.dialogHeight - 10) / 2 +
              document.documentElement.scrollTop -
              100 +
              'px'
          );
        });
      }
    },
    insertDialogDOM: function() {
      //创建DOM结构
      (this.J_PZDialog = $("<div class='J_PZDialog'></div>")), //创建弹出层最外层DOM
        (this.J_PZDialog_box = $("<div class='J_PZDialog_box'></div>")), //创建内测innder
        (this.J_PZDialog_caption = $("<div class='J_PZDialog_caption'></div>")), //创建弹出层头
        (this.J_PZDialog_close = $("<span class='J_PZDialog_close'>×</span>")), //创建关闭按钮
        (this.J_PZDialog_caption_text = $(
          "<span class='J_PZDialog_caption_text'></span>"
        )), //创建文本提示信息
        (this.J_PZDialog_content = $("<div class='J_PZDialog_content'></div>")); //创建内容区域
      //拼接DOM结构
      this.J_PZDialog.append(this.J_PZDialog_box);
      this.J_PZDialog_box.append(
        this.J_PZDialog_caption,
        this.J_PZDialog_content
      );
      this.J_PZDialog_caption.append(
        this.J_PZDialog_close,
        this.J_PZDialog_caption_text
      );
      //设置提示框文本
      this.J_PZDialog_caption_text.text(this.dialogText);
      //为了兼容IE8	一下，这里需要指定J_PZDialog_box的宽度
      this.J_PZDialog_box.width(this.dialogWidth);
      //设置对话框的整体宽高
      this.J_PZDialog.width(this.dialogWidth);
      this.J_PZDialog.height(this.dialogHeight + 20);
      //设置对话框居中显示
      this.setDialogCenter();
      //绑定相关事件
      this.addEvts();
      //插入到最底部
      this.J_PZDialog.appendTo(document.body).fadeIn(500);
      //如果开起幕布遮罩
      if (this.isMask) {
        this.createMask();
      }

      this.J_PZDialog_content.height(this.dialogHeight - 53);
      //如果Dialog类型存在
      if (this.dialogType == 'alert') {
        //设置alert内容
        this.setDialogAlert();
      } else if (this.dialogType == 'confirm') {
        this.setDialogConfirm();
      } else if (this.dialogType == 'tips') {
        this.setDialogTips();
      } else if (this.dialogType == 'prompt') {
        this.setDialogPrompt();
      } else if (this.dialogType == 'coustom') {
        this.setDialogCustom();
      } else {
        this.setDialogDef();
        //如果是么人弹窗,并且开起了拖动，就要阻止关闭按钮事件冒泡
        if (this.dialogDrag) {
          this.J_PZDialog_close.mousedown(function(e) {
            e.stopPropagation();
          });
        }
      }
      //如果配置了拖动参数
      if (this.dialogDrag) {
        this.J_PZDialog_caption.css('cursor', 'move');
        new PZ_DND({
          handle: this.J_PZDialog_caption,
          target: this.J_PZDialog
        });
      }
    }
  };
  //注册到全局对象
  window['PZ_Dialog'] = PZ_Dialog;
  /**
@基于jQuery拖放函数
@new PZ_DND({
		   handle:this.J_PZDialog_caption,      //指定拖动的手柄
		   target:this.J_PZDialog				//指定拖动的目标元素
		   });
@杨永
@QQ:377746756
@call:18911082352
@版本:1.0
*/
  function PZ_DND(args) {
    var _this_ = this;
    //初始化参数
    this.handle = args.handle;
    this.target = args.target;
    //绑定事件
    this.handle.mousedown(function(evt) {
      //为了解决ie鼠标移除浏览器无法捕捉
      if (this.setCapture) {
        this.setCapture();
      }
      evt.preventDefault();
      //获取鼠标相对于拖动目标的偏移
      var $this = this,
        layerX = _this_.getLayerPos(evt).x,
        layerY = _this_.getLayerPos(evt).y;
      //注册document移动事件
      $(document)
        .mousemove(function(evt) {
          evt.preventDefault();
          _this_.move(evt, layerX, layerY);
        })
        .mouseup(function() {
          $(this).unbind('mousemove');
          $(this).unbind('mouseup');
          //取消ie鼠标移除浏览器无法捕捉
          if (this.releaseCapture) {
            this.releaseCapture();
          }
          _this_.target.css({
            opacity: 1
          });
        });
      //鼠标按下拖动时的样式
      _this_.target.css({
        opacity: 0.6
      });
    });
  }
  PZ_DND.prototype = {
    setTargetPos: function(left, top) {
      //防止因滚动条产生的距离
      if (!/MSIE\s+6\.0/.test(window.navigator.userAgent)) {
        //ie6不需要减
        left =
          left -
          (document.documentElement.scrollLeft || document.body.scrollLeft);
        top =
          top - (document.documentElement.scrollTop || document.body.scrollTop);
      }
      top =
        top < 0
          ? 0
          : top > this.getWindowSize().height - this.target.get(0).offsetHeight
          ? this.getWindowSize().height - this.target.get(0).offsetHeight
          : top;
      left =
        left < 0
          ? 0
          : left > this.getWindowSize().width - this.target.get(0).offsetWidth
          ? this.getWindowSize().width - this.target.get(0).offsetWidth
          : left;
      this.target.css({
        left: left + 'px',
        top: top + 'px'
      });
    },
    move: function(evt, layerX, layerY) {
      //鼠标在document上移动要执行的函数
      this.setTargetPos(evt.pageX - layerX, evt.pageY - layerY);
    },
    getLayerPos: function(evt) {
      //获取鼠标相对于拖动目标的偏移
      return {
        x: evt.pageX - this.target.offset().left,
        y: evt.pageY - this.target.offset().top
      };
    },
    getWindowSize: function() {
      //获取窗口大小
      return {
        width:
          document.documentElement.clientWidth || document.body.clientWidth,
        height:
          document.documentElement.clientHeight || document.body.clientHeight
      };
    }
  };
  window['PZ_DND'] = PZ_DND;
})();
