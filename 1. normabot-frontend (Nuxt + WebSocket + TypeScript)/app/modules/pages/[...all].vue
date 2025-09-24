<script setup lang="ts">
import { navigateTo } from '#app'
import { Consts } from '~/consts'
navigateTo(Consts.Routes.notFound, { replace: true })
</script>
