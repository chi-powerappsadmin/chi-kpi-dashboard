import { v4 as uuid } from "uuid";

type Toast = {
	id: string;
	type: "success" | "error";
	title: string;
	message: string;
	duration: number;
	canClose: boolean;
};
export const allToasts = reactive<Toast[]>([]);

/**
 * @returns {string} id of the toast
 */
function createToast(type: Toast["type"], title: string, message: string, duration: number, canClose: boolean = false): string {
	const newToast: Toast = {
		id: uuid(),
		type,
		title,
		message,
		duration,
		canClose,
	};
	allToasts.unshift(newToast);
	if (newToast.type !== 'error') {
		setTimeout(() => {
			removeToastById(newToast.id);
		}, duration);
	}
	return newToast.id;
}

function removeToastById(id: string) {
	const toastIndex = allToasts.findIndex((toast) => toast.id === id);
	if (toastIndex !== -1) {
		allToasts.splice(toastIndex, 1);
	}
}

function deleteAllToasts() {
	allToasts.length = 0;
}

export const useToast = createToast;
export const useRemoveToast = removeToastById;
export const useDeleteAllToast = deleteAllToasts;
