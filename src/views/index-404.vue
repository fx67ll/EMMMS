<template>
	<div class="fx67ll-404">
		<nav class="shelf">
			<a class="book home-page" href="https://fx67ll.com" target="_blank">fx67ll.com</a>
			<a class="book contact" href="https://fx67ll.xyz/s/about" target="_blank">About Me</a>
			<a class="book about-us" href="https://fx67ll.xyz" target="_blank">fx67ll.xyz</a>
			<a class="book faq" href="" @click="back()">返回上一页</a>
			<span class="book not-found"></span>
			<span class="door left"></span>
			<span class="door right"></span>
		</nav>
		<h1>Error 404</h1>
		<!-- for fx67ll -->
		<p>糟糕，您要找的网页消失了，请联系管理员充值续费。。。</p>
		<div class="fx67ll-footer">
			Designed & Powered by
			<a href="https://fx67ll.com" target="_blank">fx67ll</a>
			&#12288; Copyright© 2018-{{ year }} &#12288;
			<a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">皖ICP备18017174号</a>
		</div>
		<!-- for lubenwei -->
		<!-- <p>很抱歉，网页正在按照备案整改要求整改，敬请期待。。。</p>
		<div class="fx67ll-footer">
			Designed & Powered by
			<a href="" target="_blank">zichengc</a>
			&#12288; Copyright© 2018-{{ year }} &#12288;
			<a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">苏ICP备2021005710号</a>
		</div> -->
	</div>
</template>

<script>
import moment from 'moment';
export default {
	name: 'model404',
	data() {
		return {
			year: moment().format('yyyy')
		};
	},
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
.fx67ll-footer {
	width: 100%;
	padding: 20px 0;
	text-align: center;
	position: absolute;
	bottom: 0;
	user-select: text;
	font-size: 14px;
}

.fx67ll-footer a {
	color: #ffffff;
}

.fx67ll-footer a:hover {
	color: #42b983;
}
</style>
