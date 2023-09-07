<template>
  <el-form class="modal-settings">
    <el-form-item label="Show THC%">
      <el-switch
          v-model="globalSettings.isTHCVisible.value"
          :active-action-icon="View"
          :inactive-action-icon="Hide"
          @change="onTHCVisibleChange"
      />
    </el-form-item>

    <el-form-item label="THC%"
                  v-if="globalSettings.isTHCVisible.value"
    >
      <el-input-number
          v-model="globalSettings.percentTHC.value"
          :min="0"
          :max="40"
          :step="0.1"
          @change="onTHCChange"
      />
    </el-form-item>

    <el-form-item label=""
                  v-if="globalSettings.isTHCVisible.value"
    >
      <el-text type="warning" style="word-break: normal;">
        <span>THC% here is used to calculate very approximate and unscientifically inaccurate amount of THC in your puffs.</span>
        <br>
        <span>
          Please note that actual THC% is likely to be lower than reported on the package.
        </span>
      </el-text>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { Hide, View } from '@element-plus/icons-vue'
import {useLocalStorage} from "@/database/localStorage";

const globalSettings = useLocalStorage()

const onTHCChange = (value: number) => {
  globalSettings.setPercentTHC(value.toString())
}

const onTHCVisibleChange = (value: boolean) => {
  globalSettings.setTHCVisible(value)
}
</script>

<style scoped>

</style>
