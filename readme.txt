前言
flowplayer实现播放视频时，能够实时预览不同时段的视频缩略图，可以给予用户很好的体验。下面将会详细说明。本版本只适合flowplayer6.0的版本，低于6.0版本不支持。

用法
首先要用ffmpeg将一个视频的一帧一帧的图片分解出来，保存在thumbnails的文件夹中。

ffmpeg -i my.mp4 -filter:v framerate=1/1,scale=-1:100 -q:v 5 myvideo%d.jpg

在html中引用时
thumbnails: {
      // 缩略图url路径
      template: 'thumbnails/myvideo{time}.jpg',
      //左右两侧的缩略图的高度 
      height: 100,
      // 主缩略图的高度，即鼠标移至进度条时弹出的即为主缩略图，在两边的为左右缩略图
      thumbwidth: 150,
      // 步调，即左右缩列图的每张相隔多少秒时间显示。
      step: 5
},

其中template的url就是ffmpeg解压出来的每一帧图的thumbnails的路径，这个根据项目是指情况设定
https://github.com/bingcool/flowplayer-thumbnails/blob/master/13.png

demo的截图
当鼠标移至播放进度条是，可以预览视频的缩略图
https://github.com/bingcool/flowplayer-thumbnails/blob/master/14.png

