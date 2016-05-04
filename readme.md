# mamaplayer

```javascript
//调用方式

var containerId = 'containerId';
var videoSize = '800x400';
var comments = [{"time":0,"pos":"loop","color":"#ffffff","text":"以后"},{"time":0,"pos":"loop","color":"#ffffff","text":"康复：你们要日我？"},{"time":0,"pos":"loop","color":"#ffffff","text":"早日康复"},{"time":0,"pos":"loop","color":"#ffffff","text":"4"}];

new MAMAPlayer('containerId', '800x400', [
  ["bilibili", "http://v.iask.com/v_play_ipad.php?vid=125459840"]
], comments);

```

## 参数说明

+ containerId 播放器外层的容器的id。
+ videoSize   播放器大小，使用x分割长款，(长x宽)
+ comments    弹幕信息。

## comments 参数说明

```javascript
[{
  time:  // 出现的时间。 单位s
  pos:   // 出现的位置 loop/top/bottom
  color: // 出现文字的颜色 十六进制表示
  text:  // 弹幕的文字   
}, ...]

```