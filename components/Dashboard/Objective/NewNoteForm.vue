<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { helpers, minLength, required } from "@vuelidate/validators";
import { useBase64 } from "@vueuse/core";
import { vuelidateErrorMessage } from "~/helpers/functions";

interface Emits {
	(e: "cancel"): void;
	(e: "isLoading", v: boolean): void;
	(e: "success"): void;
}

const route = useRoute();

const form = reactive({
	subject: "",
	body: "",
	attachment: null as File | null,
});

function handleFileInputChange(e: Event) {
	const target = e.target as HTMLInputElement;
	const files = target.files;

	if (!files || files.length < 1) return;

	form.attachment = files[0];
}

const fileRightSize = (param: number) =>
	helpers.withParams({ type: "rightSize", value: param }, (value: File) => {
		if (!value) return true;
		return value.size < param;
	});

const fileType = helpers.withParams({ type: "mustBeImage" }, (value: File) => {
	if (!value) return true;
	return value.type.split("/")[0] === "image";
});

const rules = {
	subject: {
		required: helpers.withMessage("Subject is required", required),
		minLength: helpers.withMessage("Subject must be more that 2 characters", minLength(3)),
	},
	body: {
		required: helpers.withMessage("Body is required", required),
		minLength: helpers.withMessage("Body must be more than 2 characters", minLength(3)),
	},
	attachment: {
		fileSize: helpers.withMessage("File must not be more than 5MB", fileRightSize(5000000)),
	},
};

const v$ = useVuelidate(rules, form);
const emit = defineEmits<Emits>();
const isLoading = ref(false);
async function createNote() {
	v$.value.$touch();
	if (v$.value.$invalid) return;

	type Data = {
		subject: string;
		body: string;
		regardingEntity: {
			id: string | string[];
			entityLogicalName: string;
		};
		attachement?: {
			fileName: string;
			fileData: string | ArrayBuffer;
		};
	};

	const data: Data = {
		subject: form.subject,
		body: form.body,
		regardingEntity: {
			id: route.params.id,
			entityLogicalName: "g2s_performanceobjective",
		},
	};

	try {
		isLoading.value = true;
		if (form.attachment) {
			const { value: base64 } = useBase64(form.attachment).promise;
			data.attachement = {
				fileName: form.attachment.name,
				fileData: await base64,
			};
		}
		await useApi("/notes/create", {
			method: "POST",
			body: data,
		});
		useToast("success", "Success!", "Note successfully created", 3000, true);
		emit("success");
	} catch (error) {
		useToast("error", "Error!", JSON.stringify(error), 3000, true);
	} finally {
		isLoading.value = false;
	}
}

function cancelForm() {
	if (isLoading.value) return;
	emit("cancel");
}

watch(
	isLoading,
	(newVal) => {
		emit("isLoading", newVal);
	},
	{ immediate: true },
);
</script>

<template>
	<div class="create-note-wrapper">
		<div class="title">Create New Note</div>
		<form @submit.prevent="createNote">
			<div class="inputs">
				<BaseInput
					id="subject"
					v-model="v$.subject.$model"
					label="Subject"
					name="Subject"
					:has-error="v$.subject.$error"
					:error-message="vuelidateErrorMessage(v$.subject.$errors)" />
				<ClientOnly>
					<TextEditor
						v-model:html="v$.body.$model"
						label="Body"
						:has-error="v$.body.$error"
						:error-message="vuelidateErrorMessage(v$.body.$errors)" />
				</ClientOnly>
				<BaseInput
					id="attachment"
					type="file"
					label="Attachment"
					name="attachment"
					:has-error="v$.attachment.$error"
					:error-message="vuelidateErrorMessage(v$.attachment.$errors)"
					@change="handleFileInputChange" />
			</div>
			<div class="buttons flex items-center">
				<BaseButton variant="grey" type="button" :disabled="isLoading" @click="cancelForm">Cancel</BaseButton>
				<BaseButton variant="purple" :loading="isLoading">Save and close</BaseButton>
			</div>
		</form>
	</div>
</template>

<style lang="scss" scope>
.create-note-wrapper {
	width: 100vw;
	max-width: 44.5rem;
	padding: 1.6rem;

	form {
		margin-top: 2.4rem;
	}

	.title {
		@include typography(2rem, normal, 2.4rem);
	}

	.inputs {
		display: grid;
		gap: 1.2rem;
	}

	.info {
		margin-top: 2rem;
		display: grid;
		gap: 2rem;

		&__item {
			display: grid;
			grid-template-columns: 0.5fr 1fr;
			align-items: center;
			gap: 4rem;

			p {
				color: #4a4a68;
			}

			p:last-of-type {
				gap: 0.8rem;
				color: $sec-brand;
			}
		}

		svg {
			height: 2rem;
			width: 2rem;
		}
	}

	.buttons {
		margin-top: 10rem;
		gap: 1.2rem;
	}
}
</style>
