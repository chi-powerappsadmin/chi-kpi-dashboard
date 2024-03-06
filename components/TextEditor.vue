<script setup lang="ts">
import Quill from "quill";
import "quill/dist/quill.snow.css";
const quill = ref<Quill>();
const editor = ref<HTMLDivElement>();
const toolbar = ref<HTMLDivElement>();
const htmlContentModelValue = defineModel<string>("html");
const textContentModelValue = defineModel<string>("text");

interface Props {
	label?: string
	hasError?: boolean;
	errorMessage?: string;
}

defineProps<Props>();

onMounted(() => {
	if (!editor.value || !toolbar.value) return;
	quill.value = new Quill(editor.value, {
		placeholder: "Compose a note...",
		modules: {
			toolbar: {
				container: toolbar.value,
			},
		},
		theme: "snow",
	});
	editor.value.style.height = "100px";
	quill.value.on("text-change", function () {
		const textContent = quill.value?.getText();
		if (htmlContentModelValue.value !== undefined) {
			if (textContent?.trim() === "") {
				htmlContentModelValue.value = "";
			} else {
				htmlContentModelValue.value = quill.value?.root.innerHTML;
			}
		}
		if (textContentModelValue.value !== undefined) {
			textContentModelValue.value = textContent;
		}
	});
});
</script>

<template>
	<div>
		<p v-if="label" class="label">{{ label }}</p>
		<div :class="['editor', hasError ? 'editor__hasError' : '']">
			<div ref="editor"></div>
			<div ref="toolbar">
				<div class="ql-formats">
					<button className="ql-bold" />
					<button className="ql-italic" />
					<button className="ql-underline" />
					<select className="ql-align" />
				</div>
				<div class="ql-formats">
					<button className="ql-list" value="bullet"></button>
					<button className="ql-list" value="ordered"></button>
				</div>

					<div class="ql-formats">
						<button class="ql-link"></button>
					</div>

				<select class="ql-size">
					<option value="small"></option>
					<option selected></option>
					<option value="large"></option>
					<option value="huge"></option>
				</select>
			</div>
		</div>
		<p v-if="hasError && errorMessage" class="error-message">{{ errorMessage }}</p>
	</div>
</template>

<style scoped lang="scss">
.ql-container.ql-snow {
	border: 0;
}

.ql-toolbar.ql-snow {
	border-width: 0;
	border-top-width: 0.1rem;
}

.label {
	@include typography(1.4rem, normal);
	font-weight: 500;
	color: $text-dark;
}
.editor {
	margin: 0.8rem 0;
	border: 1px solid $outline-stroke;
	border-radius: 1.2rem;
	&__hasError {
		border: 1px solid red;
	}

	+ .error-message {
		font-size: 1.2rem;
		color: $danger;
	}
}
</style>
