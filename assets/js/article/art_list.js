$(function() {


    var layer = layui.layer
    var form = layui.form

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(date) {
        const dt = new Date(date)
        var y = dt.getFullYear()
        var m = padZero(dt.getMonth() + 1)
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    // 定义补零函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 定义查询参数对象，将来请求数据的时候，
    // 需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, //页码值，默认请求第一页的数据 
        pagesize: 2, //每页显示几条数据，默认每页显示2行
        cate_id: '', // 文章分类的Id
        state: '' // 文章的发布状态
    }
    initTable()
    initCate()

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                // console.log(res)
                if (res.status !== 0) {
                    return layer.msg('获取文章分类失败！')
                }

                // 使用模板引擎渲染页面数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)

                // 调用渲染分页的方法
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败！')
                }

                // 使用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)

                // 通过 layui 重新渲染表单区域的UI结构
                form.render()
            }
        })
    }

    // 为筛选表单绑定submit事件
    $('#form-search').on('submit', function(e) {
        e.preventDefault()

        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()

        // 为查询对象参数 q 中对应的属性赋值
        q.cate_id = cate_id
        q.state = state

        // 根据最新的筛选条件，重新渲染表格的数据
        initTable()
    })

    var laypage = layui.laypage

    // 定义渲染分页方法
    function renderPage(total) {
        // 渲染分页结构
        laypage.render({
            elem: 'pageBox',
            count: total,
            limit: q.pagesize,
            curr: q.pagenum,
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 切换分页触发，jump回调
            jump: function(obj, first) {
                // 可以通过first的值，判断通过哪种方式，触发jump
                // 获取最新页码
                q.pagenum = obj.curr

                // 获取最新的条目数
                q.pagesize = obj.limit

                // 点击页码调用
                if (!first) {

                    // 重行渲染表单
                    initTable()
                }

            }
        })
    }

    // 通过代理的形式，为删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function() {
        var id = $(this).attr('data-id')

        // 获取按钮个数
        var len = $('.btn-delete').length

        // 询问用户是否要删除数据
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function(index) {
            //do something
            // console.log(len, id)
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res) {
                    console.log(res)
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！')

                    // 判断数据删除后，当前页是否还有剩余数据
                    // 如果没有剩余数据，则让页码-1，再刷新数据
                    if (len === 1) {
                        // 如果len=1,证明删除完后，页面上没有任何数据
                        // 页码值最小为1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })
            layer.close(index);
        })
    })
    $('tbody').on('click', '.btn-edit', function() {
        var id = $(this).attr('data-id')
            // console.log(id)
        window.parent.setNavSelected('#art-pub', '#art-list')
        location.href = `/article/art_pub.html?id=${id}`
    })

})