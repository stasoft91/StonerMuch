<template>
  <el-form class="modal-settings" @submit.prevent>
    <el-form-item label="Show THC%">
      <el-switch
        v-model="globalSettings.isTHCVisible.value"
        :active-action-icon="View"
        :inactive-action-icon="Hide"
        @change="onTHCVisibleChange"
      />
    </el-form-item>

    <el-form-item label="">
      <el-text type="warning" style="word-break: normal">
        <span>
          Ridiculously, almost to the point of being useless, rough estimate of THC in your puffs.
        </span>
      </el-text>
    </el-form-item>

    <el-form-item label="THC%" v-if="globalSettings.isTHCVisible.value">
      <el-input-number
        v-model="globalSettings.percentTHC.value"
        :min="0"
        :max="40"
        :step="0.5"
        @change="onTHCChange"
      />
    </el-form-item>

    <el-form-item label="" v-if="globalSettings.isTHCVisible.value">
      <el-text type="warning" style="word-break: normal">
        <span
          >According to
          <a
            href="https://www.reddit.com/r/abv/comments/mt616t/i_had_my_abv_lab_tested_for_potency_see_results/"
            >this</a
          >
          - AVB is close to 50% of original product potency. All vaporizer puffs are halved in
          potency.</span
        >
      </el-text>
    </el-form-item>

    <el-form-item label="" v-if="globalSettings.isTHCVisible.value">
      <el-text type="warning" style="word-break: normal">
        <span
          >THC% here is used to calculate very approximate and unscientifically inaccurate amount of
          THC in your puffs.</span
        >
        <br />
        <span>
          Please note that actual THC% is likely to be lower than reported on the package.
        </span>
      </el-text>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { Hide, View } from '@element-plus/icons-vue'
import { useLocalStorage } from '@/database/localStorage'

const globalSettings = useLocalStorage()

const onTHCChange = (value: number) => {
  globalSettings.setPercentTHC(value.toString())
}

const onTHCVisibleChange = (value: boolean) => {
  globalSettings.setTHCVisible(value)
}
</script>

<style scoped></style>
