import {useLocalStorage as ls} from '@vueuse/core'
import type {RemovableRef} from '@vueuse/core'
import {ref} from "vue";

const isTHCVisible = ref(ls('isTHCVisible', false))
const percentTHC: RemovableRef<number> = ref(ls('percentTHC', 20))

export const useLocalStorage = () => {

	const setTHCVisible = (value: boolean) => {
		localStorage.setItem('isTHCVisible', value.toString())
	}

	const setPercentTHC = (value: string) => {
		localStorage.setItem('percentTHC', value)
	}
	
	return {
		isTHCVisible,
		setTHCVisible,
		percentTHC,
		setPercentTHC
	}
}
