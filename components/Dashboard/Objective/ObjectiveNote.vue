<script setup lang="ts">
// TODO Update the NOTE when all fields are available
import "quill/dist/quill.snow.css";
// import { stringToDate } from "~/helpers/functions";

import type { Note } from "~/types/models/Objective";
interface Props {
	note: Note;
}

defineProps<Props>();
</script>
<template>
	<div class="objective-note weight-500">
		<div class="objective-note__avatar">
			<BaseAvatar name="my name" style="padding: 0 0.8rem" />
		</div>
		<div class="objective-note__detail">
			<p v-if="note.owner"> Created By: {{ note.owner.name }}</p>
		
			<p class="weight-600">{{ note.subject }}</p>
			<ClientOnly>
				<div class="ql-editor" v-html="note.body" />
			</ClientOnly>

			<div v-if="note.attachment.fileData" class="objective-note__attachment">
				<a :href="note.attachment.fileData" target="_blank" download>
					<IconsAttachment />
					View attachement
				</a>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.objective-note {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 0.8rem;
}

.objective-note__avatar {
	padding: 0.8rem 0;
}

.objective-note__detail {
	display: grid;
	gap: 0.8rem;
	color: $text;
	padding: 1.6rem;
	border: 0.1rem solid $outline;
	border-radius: 0.4rem;
	@include typography(1.4rem, 140%);

	button {
		width: fit-content;
		@include typography(1.2rem, 1.4);
	}

	p {
		display: flex;
		gap: 0.4rem;

		pre {
			font-family: inherit;
		}
	}

	svg {
		height: 1.8rem;
		width: 1.8rem;
	}

	&:hover {
		background-color: darken($color: #fff, $amount: 2.5%);
	}
}

.objective-note__status {
	padding: 0.5rem 0.6rem;
	border-radius: 1rem;
	@include typography(1rem, 1.4);

	&-closed {
		background-color: $outline;
	}
}

.objective-note__attachment {
	a {
		color: $sec-brand;
		font-size: 1.4rem;
		display: flex;
		align-items: center;

		svg {
			height: 1.4rem;
			width: 1.4rem;
		}

		&:hover {
			text-decoration: underline;
		}
	}
}

.ql-editor {
	padding: 0;
	max-height: 300px;
}
</style>
