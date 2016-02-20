/*global window */

(function (flowplayer,$) {
    "use strict";
    flowplayer(function (api, root) {
        var common = flowplayer.common,
            bean = flowplayer.bean,
            support = flowplayer.support,
            timeline = common.find('.fp-timeline', root)[0],
            timelineTooltip = common.find('.fp-timeline-tooltip', root)[0];

        if (support.touch || !support.inlineVideo) {
            return;
        }

        api.on('ready', function (ev, a, video) {
            // cleanup
            bean.off(root, '.thumbnails');
            
            common.css(timelineTooltip, {
                'border': '1px solid #333',
                'color':'#fff',
                'background-color':'#000',
                
            });
            var c = flowplayer.extend({}, api.conf.thumbnails, video.thumbnails);

            if (!c.template) {
                return;
            }

            var height = c.height || 80,
                interval = c.interval || 1,
                template = c.template,
                ratio = video.height / video.width,
                preloadImages = function (tmpl, max, start) {
                    max = Math.floor(max / interval);
                    if (start === undefined) {
                        start = 1;
                    }
                    function load() {
                        if (start > max) {
                            return;
                        }
                        var img = new Image();
                        img.src = tmpl.replace('{time}', start);
                        img.onload = function () {
                            start += 1;
                            load();
                        };
                    }
                    load();
                };

            if (c.preload !== false) {
                preloadImages(template, video.duration);
            }

            // 鼠标移动至播放条，可以显示出预览图
            bean.on(root, 'mousemove.thumbnails', '.fp-timeline', function (ev) {

                $('div.fp-pre,div.fp-next').remove();

                var x = ev.pageX || ev.clientX,
                    delta = x - common.offset(timeline).left, 
                    percentage = delta / common.width(timeline),
                    seconds = Math.round(percentage * api.video.duration);

                // 2nd condition safeguards at out of range retrieval attempts
                if (seconds < 0 || seconds > Math.round(api.video.duration)) {
                    return;
                }
                // enables greater interval than one second between thumbnails
                seconds = Math.floor(seconds / interval);
                    
                var fpthumbnails = $(timelineTooltip).find('.fp-thumbnails'),
                    // 主缩略图的时间位置div
                    fpseektime = $(timelineTooltip).find('#fp-seektime'),
                    // 控制面板的宽度，视频宽度
                    width = $(root).find('.fp-controls').width(),
                    // 主缩略图距离视频左侧位置
                    left = $(timelineTooltip).position().left,
                    // 主缩略图距离视频右侧位置
                    right = width - left - (height / ratio)-2,
                    // 左右侧缩略图的宽度
                    thumbwidth = c.thumbwidth || 150,
                    // 步调，即每张缩略图显示的时间隔间
                    step=c.step || 10;

                // 主缩略图的样式以及背景图片
                fpthumbnails.css({
                    width: (height / ratio) + 'px',
                    height: height + 'px',
                    // {time} template expected to start at 1, video time/first frame starts at 0
                    'background-image': "url('" + template.replace('{time}', seconds + 1) + "')",
                    'background-repeat': 'no-repeat',
                    'background-size':'100% 100%',
                    '-moz-background-size':'100% 100%', /* 老版本的 Firefox */
                    'border': '1px solid #333'
                });
                // 主缩略图的时间样式
                fpseektime.css({
                    height:20 + 'px',
                    'text-align':'center',
                    'text-shadow': '1px 1px #000'
                });
                // 左侧缩略图，创建div
                if(left>0) {
                    var leftnum = Math.ceil(left/thumbwidth);
                    for(var i=0;i<leftnum;i++) {
                        $(timelineTooltip).parent('.fp-controls').append('<div class="fp-pre"></div>'); 
                    }
                }
                // 右侧缩略图，创建div
                if(right>0) {
                    var rightnum = Math.ceil(right/thumbwidth);
                    for(var i=0;i<rightnum;i++) {
                       $(timelineTooltip).parent('.fp-controls').append('<div class="fp-next"></div>'); 
                    }
                }
               
                //左侧只能显示一个缩略图位置时 
                if(leftnum==1){
                    $('.fp-pre').css({
                        'width':(left-2)+'px',
                        'height':height + 'px',
                        'position':'absolute',
                        'bottom':'30px',
                        'border-top': '1px solid #333',
                        'border-right': '1px solid #333',
                        'border-bottom': '1px solid #333',
                        'color':'#fff',
                        'background-color':'#000',
                        'overflow':'hidden',
                        'left':'1px',
                        'background-image':"url('" + template.replace('{time}', seconds + 1-step) + "')"
                    });
                }else {
                    // 出来最后一个元素的其他元素的样式设置
                    $('.fp-pre').not(':last').each(function(i,value){
                        $(this).css({
                            'width':thumbwidth + 'px',
                            'height':height + 'px',
                            'position':'absolute',
                            'bottom':'30px',
                            'border': '1px solid #333',
                            'color':'#fff',
                            'background-color':'#000',
                            'left':(left - (i+1)*(thumbwidth+2)) + 'px',
                            'background-image':"url('" + template.replace('{time}', seconds + 1-(i+1)*step) + "')",/*步调*/
                            'background-repeat': 'no-repeat',
                            'background-size':'100% 100%',
                            '-moz-background-size':'100% 100%', /* 老版本的 Firefox */
                        });
                    });
                    // 设置最后一个的样式
                    $('.fp-pre').last().css({
                            'width':(left-(leftnum-1)*(thumbwidth+2)-1)+'px',
                            'height':height + 'px',
                            'position':'absolute',
                            'bottom':'30px',
                            'border-top': '1px solid #333',
                            'border-right': '1px solid #333',
                            'border-bottom': '1px solid #333',
                            'color':'#fff',
                            'color':'#fff',
                            'background-color':'#000',
                            'overflow':'hidden',
                            'left':'1px',
                            'background-image':"url('" + template.replace('{time}', seconds + 1-(leftnum-1)*step) + "')"
                    });
                }
                // 右侧只有一个div时的样式
                if(rightnum==1){
                    $('.fp-next').css({
                        'width':(width-(left+(height / ratio)+2)-2)+'px',
                        'height':height + 'px',
                        'position':'absolute',
                        'bottom':'30px',
                        'border-top': '1px solid #333',
                        'border-left': '1px solid #333',
                        'border-bottom': '1px solid #333',
                        'color':'#fff',
                        'color':'#fff',
                        'background-color':'#000',
                        'left':(left + (height / ratio)+2) + 'px',
                        'overflow':'hidden',
                        'background-image':"url('" + template.replace('{time}', seconds + 1+step) + "')"

                    });
                }else {
                    // 除了最后一个的其他样式
                    $('.fp-next').not(':last').each(function(i,value){
                        $(this).css({
                            'width':thumbwidth + 'px',
                            'height':height + 'px',
                            'position':'absolute',
                            'bottom':'30px',
                            'border': '1px solid #333',
                            'color':'#fff',
                            'background-color':'#000',
                            'left':(left + (height / ratio)+2 + i*(thumbwidth+2))+ 'px',
                            'background-image':"url('" + template.replace('{time}', seconds + 1+(i+1)*step) + "')",
                            'background-repeat': 'no-repeat',
                            'background-size':'100% 100%',
                            '-moz-background-size':'100% 100%', /* 老版本的 Firefox */

                        });
                    });
                    // 右侧最后一个div样式
                    $('.fp-next').last().css({
                            'width':(right - (rightnum-1)*(thumbwidth+2)-1)+'px',
                            'height':height + 'px',
                            'position':'absolute',
                            'bottom':'30px',
                            'border-top': '1px solid #333',
                            'border-left': '1px solid #333',
                            'border-bottom': '1px solid #333',
                            'color':'#fff',
                            'background-color':'#000',
                            'left':(left + (height / ratio)+2 + ((rightnum-1)*(thumbwidth+2))) + 'px',
                            'overflow':'hidden',
                            'background-image':"url('" + template.replace('{time}', seconds + 1 +(rightnum-1)*step) + "')"

                        });
                    }   

                });
            
                // 移除左右两侧的缩略图显示div
                $('.fp-timeline').on('mouseout',function(){
                    $('div.fp-pre,div.fp-next').remove();
                });
            
        });

    });

})((typeof module === "object" && module.exports)
    ? require('flowplayer')
    : window.flowplayer,jQuery);