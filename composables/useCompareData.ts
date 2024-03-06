import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";

export function useCloneAndCompareData<T>(originalData: Ref<T[]> | ComputedRef<T[]>) {
	const clonedData = ref(cloneDeep(originalData.value)) as Ref<T[]>;
	const clonedDataHasBeenEditted = ref(false);
	watch(
		originalData,
		(newVal) => {
			clonedData.value = cloneDeep(newVal);
		},
		{ deep: true },
	);

	watch(
		clonedData,
		(newVal) => {
			clonedDataHasBeenEditted.value = !isEqual(originalData.value, newVal);
		},
		{ deep: true },
	);

	function getArrayOfEdittedData() {
		return clonedData.value.filter((data, index) => {
			return !isEqual(cloneDeep(data), cloneDeep(originalData.value[index]));
		});
	}

	function resetClonedData() {
		clonedData.value = cloneDeep(originalData.value);
	}

	return {
		originalData,
		clonedData,
		clonedDataHasBeenEditted,
		getArrayOfEdittedData,
		resetClonedData,
	};
}
