<template>
	<div class="fx67ll-404">
		<nav class="shelf">
			<a class="book home-page" href="https://fx67ll.com" target="_blank">个人主页</a>
			<a class="book contact" href="https://fx67ll.xyz/s/messageboard" target="_blank">联系管理员</a>
			<a class="book about-us" href="https://fx67ll.xyz" target="_blank">技术博客</a>
			<!-- href 为空的锚点必须阻止默认跳转，否则默认导航会取消 $router.go(-1) 的历史回退 -->
			<a class="book faq" href="" @click.prevent="back()">返回上一页</a>
			<span class="book not-found"></span>
			<span class="door left"></span>
			<span class="door right"></span>
		</nav>
		<h1>404</h1>
		<!-- for fx67ll -->
		<p>糟糕，当前网页不存在，如有需要请留言咨询~</p>
		<fx67ll-footer fontColor="#ffffff" hoverColor="#42b983"></fx67ll-footer>
		<!-- for lubenwei -->
		<!-- <p>很抱歉，网页正在按照备案整改要求整改，敬请期待。。。</p> -->
	</div>
</template>

<script>
export default {
	name: 'model404',
	methods: {
		back() {
			if (window.history.length <= 1) {
				this.$router.push({ path: '/' });
				return false;
			} else {
				this.$router.go(-1);
			}
		}
	}
};
</script>

<style lang="less" scoped="scoped">
@import '@a/styles/404.less';

// 保留404页面原有的页脚字号，颜色由组件属性统一控制
/deep/ .fx67ll-footer {
	font-size: 14px;
}
</style>
