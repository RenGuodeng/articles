$(function() {
    var id = getUrlParam('id')
        // console.log(id)

    var layer = layui.layer
    var form = layui.form

    initCate()

    // 出始化富文本编辑器
    initEditor()

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('初始化分类数据失败！')
                }

                // 使用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)

                // 通过 layui 重新渲染表单区域的UI结构
                form.render()
            }
        })
    }

    // 1. 初始化图片裁剪器
    var $image = $('#image')

    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }

    // 3. 初始化裁剪区域
    $image.cropper(options)

    $('#btnChooseImage').on('click', function(res) {
        $('#coverFile').click()
    })

    // 为文件选择框coverFile绑定change事件
    $('#coverFile').on('change', function(e) {
        var filelist = e.target.files
        if (filelist.length === 0) {
            return layer.msg('请选择照片！')
        }

        // 1、拿到用户选择的文件
        var file = e.target.files[0]

        // 2、将文件，转化为路径
        var newImageURL = URL.createObjectURL(file)

        // 3、重新初始化裁剪区域
        $image
            .cropper('destroy') // 销毁旧的裁剪区域
            .attr('src', newImageURL) // 重新设置图片路径
            .cropper(options) // 重新初始化裁剪区域
    })

    // 文章状态
    var art_state = '已发布'

    // 为存为草稿按钮绑定点击事件
    $('#btnSave2').on('click', function() {
        art_state = '草稿'
    })
    if (id) {
        $.ajax({
            method: 'GET',
            url: '/my/article/' + id,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章失败！')
                }
                form.val('form-publish', res.data)
                $image.cropper('destroy').attr('src', 'http://127.0.0.1:3000' + res.data.cover_img).cropper(options);
            }
        })
    }
    // 为表单绑定submit事件
    $('#form-pub').on('submit', function(e) {
        e.preventDefault()


        var fd = new FormData($(this)[0])

        // 将文章状态加入到fd中
        fd.append('state', art_state)

        // 将裁剪的图片输出为文件
        $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function(blob) {
                // 将 Canvas 画布上的内容，转化为文件对象
                // 得到文件对象后，进行后续的操作
                fd.append('cover_img', blob)
                if (id) {
                    fd.append('Id', id)
                    publishArticle(fd, '/my/article/edit')
                } else {
                    publishArticle(fd, '/my/article/add')
                }

            })
    })


    function publishArticle(fd, url) {
        $.ajax({
            method: 'POST',
            url: url,
            data: fd,
            // 如果是FormData格式数据，
            // 需要添加以下2个配置项
            contentType: false,
            processData: false,
            success: function(res) {
                console.log(res)
                if (res.status !== 0) {
                    return layer.msg('发布文章失败！')
                }
                layer.msg('发布文章成功！')

                // 发布成功后，跳转到文章列表页
                window.parent.setNavSelected('#art-list', '#art-pub')
                location.href = '/article/art_list.html'
            }
        })
    }
    //获取url中的参数
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg); //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }


})